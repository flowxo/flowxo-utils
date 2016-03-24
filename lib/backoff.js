'use strict';

function Backoff(minDelay, maxDelay, useRandom) {
  this.minDelay = minDelay;
  this.maxDelay = maxDelay;
  this.useRandom = useRandom;
  this.retries = 0;
}

Backoff.prototype.nextDelay = function() {
  this.retries++;
  var random = (this.useRandom ? Math.random() : 0) + 1;
  var delay = Math.round(random * this.minDelay * Math.pow(2, (this.retries - 1)));
  return Math.min(delay, this.maxDelay);
};

Backoff.prototype.attempt = function(max, operation, done) {
  var self = this;

  var doIt = function() {
    operation(function() {
      if(arguments.length > 0 && arguments[0]) {
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

module.exports = Backoff;
