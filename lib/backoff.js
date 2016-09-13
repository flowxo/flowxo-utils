'use strict';

var Promise = require('bluebird');
var Errors = require('./errors');

function Backoff(options) {
  this.attempts = 0;
  this.minDelay = options.minDelay;
  this.maxDelay = options.maxDelay;
  this.useRandom = options.useRandom || false;
  this.maxAttempts = options.maxAttempts;

  if(options.hasOwnProperty('maxDuration')) {
    this.maxDuration = options.maxDuration;
    this.expiresAt = Date.now() + this.maxDuration;
    this.hasExpired = function(afterDelay) {
      return Date.now() + afterDelay > this.expiresAt;
    };
  }
}

Backoff.prototype.nextDelay = function() {
  var random = (this.useRandom ? Math.random() : 0) + 1;
  var delay = Math.round(random * this.minDelay * Math.pow(2, (this.attempts - 1)));
  return Math.min(delay, this.maxDelay);
};

Backoff.prototype.hasExpired = function() {
  return false;
};

Backoff.prototype.shouldRetry = function(afterDelay) {
  return this.attempts < this.maxAttempts && !this.hasExpired(afterDelay);
};

var BackoffRunner = {};

BackoffRunner.NonRetryableError = Errors.NonRetryableError;

/**
 * Attempts `operation` according to the `options`.
 * 
 * The `done` node-style callback is called once the
 * operation completes successfully, or the maximum
 * number of attempts is reached. Each retry is
 * performed according to the backoff rules passed in
 * with the options.
 * 
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
 * var options = {
 *   minDelay: 100, 
 *   maxDelay: 1000,
 *   maxAttempts: 5
 * };
 * 
 * Backoff.attempt(operation, options, function(err, result) {
 *   // `err` is populated if every attempt failed.
 *   // It will be populated with the last error
 *   // that occurred.
 *   // Otherwise, `result` is the result passed above.
 * });
 * 
 * `options` takes the following keys:
 *  
 *  - minDelay: the minimum delay to use for backoff
 *  - maxDelay: the maximum delay to use for backoff
 *  - maxAttempts: the maximum number of attempts before failing
 *  - maxDuration: the maximum duration that the backoff should take,
 *    in ms
 *  - useRandom: whether the backoff should be calcuated using random
 *    values or not
 *
 * @param  {Function} operation work to carry out
 * @param  {Object}   options   options for retries
 * @param  {Function} done      called when the work is finished
 */

BackoffRunner.attempt = function(operation, options, done) {
  var backoff = new Backoff(options);

  var performOperation = function() {
    backoff.attempts++;
    operation(function() {
      if(arguments.length > 0 && arguments[0]) {
        // The operation ended with an error.
        if(arguments[0] instanceof BackoffRunner.NonRetryableError) {
          // We shouldn't retry.
          return done(arguments[0]);
        }
        var delay = backoff.nextDelay();
        if(backoff.shouldRetry(delay)) {
          // Try again after the delay.
          return setTimeout(performOperation, delay);
        }

        // Else, fail.
        return done(arguments[0]);
      }

      // Otherwise, the operation succeeded!
      done.apply(null, arguments);
    });
  };

  performOperation();
};

/**
 * Attempts `operation` according to the `options`.
 * 
 * Returns a promise which is resolved once the
 * operation completes successfully, or rejected if
 * the maximum number of attempts is reached.
 * 
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
 * var options = {
 *   minDelay: 100, 
 *   maxDelay: 1000,
 *   maxAttempts: 5
 * };
 * return backoff.attemptAsync(operation, options);
 * 
 * `options` takes the following keys:
 *  
 *  - minDelay: the minimum delay to use for backoff
 *  - maxDelay: the maximum delay to use for backoff
 *  - maxAttempts: the maximum number of attempts before failing
 *  - maxDuration: the maximum duration that the backoff should take,
 *    in ms
 *  - useRandom: whether the backoff should be calcuated using random
 *    values or not
 *
 * @param  {Function} operation work to carry out
 * @param  {Object}   options   options for retries
 * @param  {Function} done      called when the work is finished
 */
BackoffRunner.attemptAsync = function(operation, options) {
  var backoff = new Backoff(options);

  function performOperation() {
    backoff.attempts++;
    return Promise.resolve()
      .then(operation)
      .catch(function(err) {
        if(err instanceof BackoffRunner.NonRetryableError) {
          // We shouldn't retry.
          throw err;
        }
        var delay = backoff.nextDelay();
        if(backoff.shouldRetry(delay)) {
          // Try again after the delay.
          return Promise.delay(delay).then(performOperation);
        }

        // Otherwise, return the last error.
        throw err;
      });
  }

  return performOperation();
};

module.exports = BackoffRunner;
module.exports._Backoff = Backoff;
