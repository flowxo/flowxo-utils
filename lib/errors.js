'use strict';

var util = require('util');

function NonRetryableError(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(NonRetryableError, Error);

exports.NonRetryableError = NonRetryableError;
