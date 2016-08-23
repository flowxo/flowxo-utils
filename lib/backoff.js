'use strict';

var Promise = require('bluebird');
var Errors = require('./errors');

function Backoff(minDelay, maxDelay, useRandom) {
  this.minDelay = minDelay;
  this.maxDelay = maxDelay;
  this.useRandom = useRandom;
  this.retries = 0;
}

Backoff.NonRetryableError = Errors.NonRetryableError;

Backoff.prototype.nextDelay = function() {
  this.retries++;
  var random = (this.useRandom ? Math.random() : 0) + 1;
  var delay = Math.round(random * this.minDelay * Math.pow(2, (this.retries - 1)));
  return Math.min(delay, this.maxDelay);
};

/**
 * Attempts `operation` up to a maximum of `max` attempts.
 * The `done` node-style callback is called once the
 * operation completes successfully, or the maximum
 * number of attempts is reached.
 * `operation` is passed a node-style 'error-first'
 * callback when it is called. You should call this
 * callback as appropriate in your calling code.
 *
 * Example:
 *
 * var operation = function(cb) {
 *   request(options, function(err, res, body) {
 *     if(err) {
 *       return cb(err);
 *     }
 *     return cb(null, body);
 *   }
 * }
 *
 * var backoff = new Backoff(100, 1000);
 * backoff.attempt(5, operation, function(err, result) {
 *   // `err` is populated if every attempt failed.
 *   // It will be populated with the last error
 *   // that occurred.
 *   // Otherwise, `result` is the result passed above.
 * });
 *
 * @param  {Number}   max       maximum number of attempts to try
 * @param  {Function} operation work to carry out
 * @param  {Function} done      called when the work is finished
 */
Backoff.prototype.attempt = function(max, operation, done) {
  var self = this;

  var doIt = function() {
    operation(function() {
      if(arguments.length > 0 && arguments[0]) {
        if(arguments[0] instanceof Backoff.NonRetryableError) {
          // We shouldn't retry.
          return done(arguments[0]);
        }
        var delay = self.nextDelay();
        if(self.retries === max) {
          // Return the last error.
          return done(arguments[0]);
        }
        // Otherwise, try again after the delay.
        return setTimeout(doIt, delay);
      }

      // Otherwise, the operation succeeded!
      done.apply(null, arguments);
    });
  };

  doIt();
};

/**
 * Attempts `operation` up to a maximum of `max` attempts.
 * Returns a promise which is resolved once the
 * operation completes successfully, or rejected if
 * the maximum number of attempts is reached.
 * `operation` is expected to return a promise.
 *
 * Example:
 *
 * var operation = function() {
 * return new Promise(function (resolve, reject) {
 *   request(options, function(err, res, body) {
 *     if(err) {
 *       return reject(err);
 *     }
 *     resolve(body);
 *   }
 * });
 *
 * var backoff = new Backoff(100, 1000);
 * return backoff.attemptAsync(5, operation);
 *
 * @param  {Number}   max       maximum number of attempts to try
 * @param  {Function} operation work to carry out
 * @param  {Function} done      called when the work is finished
 */
Backoff.prototype.attemptAsync = function(max, operation) {
  var self = this;

  function doIt() {
    return Promise.resolve()
      .then(operation)
      .catch(function(err) {
        if(err instanceof Backoff.NonRetryableError) {
          // We shouldn't retry.
          throw err;
        }
        var delay = self.nextDelay();
        if(self.retries === max) {
          // Return the last error.
          throw err;
        }
        // Otherwise, try again after the delay.
        return Promise.delay(delay).then(doIt);
      });
  }

  return doIt();
};

module.exports = Backoff;
