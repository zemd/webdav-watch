'use strict';

exports.compose = (modifiers, fetchFn) => modifiers.reduceRight((acc, modifier) => (url, options) => modifier(acc, url, options), fetchFn);
exports.method = (name) => (fetchFn, url, options) => fetchFn(url, { ...options, ...{ method: name } });
exports.header = (key, value) => (fetchFn, url, options) => fetchFn(url, { ...options, ...{ headers: { ...options.headers || {}, ...{ [key]: value } } } });
exports.prefixURL = (prefix) => (fetchFn, url, options) => fetchFn(url.indexOf(prefix) !== 0 ? `${prefix}/${url}`.replace(/([^:]\/)\/+/g, '$1') : url, options);
