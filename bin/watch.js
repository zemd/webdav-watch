#!/usr/bin/env node

'use strict';

const NodeWrapper = require('logtown/wrappers/node');
const logtown = require('logtown');
logtown.addWrapper(new NodeWrapper());

const watch = require('glob-watcher');
const path = require('path');
const fs = require('fs');
const notifier = require('node-notifier');
const chalk = require('chalk');
const logger = logtown.getLogger('webdav-watch');
const { compose, header, method, prefixURL } = require('../src/http');
const nodeFetch = require('node-fetch');
const keytar = require('keytar');
const url = require('url');
const inquirer = require('inquirer');

require('yargs')
  .command('watch [folder]', 'watch the folder', (yargs) => {
    return yargs
      .config('c')
      .describe('folder', 'Base folder')
      .option('patterns', {
        alias: 'p',
        describe: 'Glob pattern rule',
        type: 'array',
        default: [],
      })
      .option('remote', {
        alias: 'r',
        describe: 'Webdav server url',
        type: 'string',
      })
      .option('username', {
        alias: 'u',
        describe: 'Webdav user to login',
        type: 'string',
      })
      .check((argv) => {
        const parsedURL = url.parse(argv.remote);
        if ((!parsedURL.auth || (parsedURL.auth && !parsedURL.auth.split(':')[0])) && !argv.username) {
          throw new Error('You should provide username option');
        }
        return true;
      })
      .demandOption(['remote']);
  }, async (argv) => {
    logtown.configure({
      disable: argv.verbose ? [] : ['debug', 'silly'],
    });
    let patterns = argv.patterns.concat(argv.folder || []);
    if (!patterns.length) {
      patterns = ['./*'];
    }
    const credentials = url.parse(argv.remote).auth ? url.parse(argv.remote).auth.split(':') : [];
    const username = credentials[0] || argv.username;
    let password = credentials[1] || await keytar.getPassword('webdav-watch', username);
    if (!password) {
      const answers = await inquirer.prompt([{ type: 'password', name: 'password', message: 'Enter password to log in:' }]);
      password = answers.password;
      await keytar.setPassword('webdav-watch', username, password);
    }

    const rootFolder = argv.folder || process.cwd();
    const PUT = compose([
      header('Content-Type', 'application/octet-stream'),
      header('Authorization', `Basic ${new Buffer(`${username}:${password}`).toString('base64')}`),
      method('PUT'),
      prefixURL(argv.remote),
    ], nodeFetch);

    logger.info(`Starting to watch folders: ${patterns.reduce((acc, rule, ind) => `${acc}${ind > 0 ? ', ' : ''}${chalk[rule.includes('!') ? 'red' : 'green'](rule)}`, '')}...`);
    const watcher = watch(patterns);

    watcher.on('change', (filepath, stat) => {
      logger.info(`File changed: ${chalk.magenta(path.basename(filepath))}`);
      const fileContents = fs.readFileSync(filepath, 'utf8');
      const fetch = compose([
        header('Content-Length', `${fileContents.length}`),
      ], PUT);
      const remoteFilepath = path.relative(rootFolder, filepath);

      logger.silly(`About to upload file ${chalk.cyan(remoteFilepath)} on remote server ${chalk.cyan(argv.remote)}`);

      fetch(remoteFilepath, { body: fileContents })
        .then(() => {
          logger.info(`Successfully uploaded file ${chalk.green(remoteFilepath)}`);
          notifier.notify({
            title: 'webdav-watcher',
            message: `File changed: ${path.basename(filepath)}`
          });
        })
        .catch((error) => {
          logger.error(`Error has been occurred during uploading file ${remoteFilepath}`);
          logger.error(error);
        });
    });

    watcher.on('add', function (filepath, stat) {
      logger.error(`File added: ${path.basename(filepath)}`);
    });
  })
  .option('verbose', {
    alias: 'v',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .parse();


