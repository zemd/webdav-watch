# webdav-watch

> Simple cli tool for synchronizing folder with remote webdav server

[![npm version](https://badge.fury.io/js/webdav-watch.svg)](https://www.npmjs.com/package/webdav-watch)
[![Code Climate](https://codeclimate.com/github/zemd/webdav-watch/badges/gpa.svg)](https://codeclimate.com/github/zemd/webdav-watch)
[![dependencies:?](https://img.shields.io/david/zemd/webdav-watch.svg)](https://david-dm.org/zemd/webdav-watch)
[![devDependencies:?](https://img.shields.io/david/dev/zemd/webdav-watch.svg?style=flat)](https://david-dm.org/zemd/webdav-watch)

## Installation

```bash
npm install webdav-watch -g
```

## Usage

```bash
webdav-watch watch [folder_path] -p '!**/.idea/**' -p '!**/.git/**' -r https://webdav-server.com/remote/root/folder -u username
```

On first call you will be requested for entering password, which will be stored in your system's keychain.

### Configuration

You can pass configuration file, as `-c` option.

```bash
webdav-watch watch [folder_path] -c path/to/config.json
``` 

which has to have next structure: 

```
{
  remote: 'https://webdav-server.com/remote/root/folder',
  username: 'username',
  folder: '~/project',
  patterns: [
    '!**/.idea/**',
    '!**/.git/**',
    'ANY_VALID_GLOB_HERE'
  ],
}
```

### Advanced configuration

You can to use `uri` for your remote config option, that includes valid credentials, for instance, `https://user:password@webdav-server.com`.

## License

webdav-watch is released under the MIT license.

## Donate

[![](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/red_rabbit)
[![](https://img.shields.io/badge/flattr-donate-yellow.svg)](https://flattr.com/profile/red_rabbit)

