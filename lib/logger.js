'use strict';

// A lightweight logger, with partial API compatibility
// with winston.

var log = function() {
  console.log.apply(console, arguments);
};

exports.log = function() {
  // Shift the first argument, which is 'info', 'debug' etc.
  log.apply(null, Array.prototype.slice.call(arguments, 1));
};

exports.silly = log;
exports.debug = log;
exports.verbose = log;
exports.info = log;
exports.warn = log;
exports.error = log;
