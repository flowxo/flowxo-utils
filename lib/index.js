'use strict';

var _ = require('lodash');

var Utils = {};

var DEFAULT_FLATTENED_DELIMITER = '__';

var humanize = function(str) {
  if(!_.isString(str)) {
    return str;
  }
  return _.capitalize(str.trim().replace(/_/g, ' '));
};

var formatParsedObject = function(type, input, valid, parsed) {
  return {
    type: type,
    input: input,
    valid: valid,
    parsed: parsed
  };
};

Utils._getCurrentDate = function() {
  // Makes unit testing possible, by allowing this
  // function to be mocked.
  return new Date();
};

Utils._getFutureDate = function(str) {
  // Makes unit testing possible, by allowing this
  // function to be mocked.
  return Date.future(str);
};

Utils.activateDateParser = function() {
  // Add support for the 'enhanced' date object.
  // This augments the Date prototype with extra methods,
  // and (importantly) allows use to use the Sugar.js
  // date parsing algorithms.
  // In an ideal world, we wouldn't augment the prototype,
  // but our hands are ties if we want to use the date parsing
  // feature that Sugar.js gives us.
  // Perhaps one day this can be extracted and added as a
  // moment.js plugin.
  require('sugar-date');
};

/**
 * Converts an array into a hashtable, with each value set
 * to `true`. Useful for lookups, avoiding Array.indexOf calls.
 *
 * Example:
 *   Utils.toHash([ 'one', 'two', 'three' ]);
 *   // -> { one: true, two: true, three: true }
 *   //
 *   // Now you can do `if (items.three)` instead of
 *   // `if (items.indexOf('three') !== 1)`.
 *
 * @param  {Array} items array of items to turn into hashtable
 * @return {Object}       hashtable
 */
Utils.toHash = function(items) {
  return _.reduce(items, function(result, item) {
    result[item] = true;
    return result;
  }, {});
};

/**
 * Gets a value from a flattened object or array using 'flattened' property notation.
 *
 * A flattened field is one that looks like:
 * `some__flattened__key`
 * This would correspond to the following object:
 * {
 *   some: {
 *     flattened: {
 *       key: 'value'
 *     }
 *   }
 * }
 *
 * Double underscores are used to delimit the keys.
 *
 * Array syntax:
 * `some__0__key`
 * Corresponds to:
 * {
 *   some: [{
 *     key: 'value'
 *   }]
 * }
 * or
 * {
 *   some: {
 *     0: {
 *       key: 'value'
 *     }
 *   }
 * }
 *
 * Example:
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'flattened__data');
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: ['happy', 'panda' ] }, 'flattened__1');
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'flattened.data', '.');
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'wrong__key');
 *  // -> { flattened: { data: 'panda' } }
 *
 * @param  {Object|Array} data       [object to get value from]
 * @param  {String} path      [string describing flattened property to get]
 * @param  {String} delimiter [optional nesting delimiter]
 * @return {Any}              [the flattened property, or the original `data` if it was null.]
 */
Utils.getFlattenedValue = function(data, path, delimiter) {
  // Nested logic borrowed from
  // https://github.com/mickhansen/dottie.js
  if(data == null) {
    return data;
  }

  delimiter = delimiter || DEFAULT_FLATTENED_DELIMITER;

  var pieces = path.split(delimiter).reverse();
  while(pieces.length && data !== undefined) {
    data = data[pieces.pop()];
  }

  return data;
};

/**
 * Sets a value into the passed object using `flattened` property notation.
 *
 * Note that numbers in the flattened key are used to create an object with that key, not an index at an array.
 *
 * Example:
 *  Utils.setFlattenedValue({}, 'some__flattened', 'data');
 *  // -> { some: { flattened: 'data' } };
 *  Utils.setFlattenedValue({}, 'some.flattened', 'data', '.');
 *  // -> { some: { flattened: 'data' } };
 *  Utils.setFlattenedValue({}, 'some__1', 'data');
 *  // -> { some: { 1: 'data' } };
 *  // Note that this will create an object with
 *  // a key of `1`, not an array.
 *
 * @param {Object} data       [target object to set value in]
 * @param {String} path      [flattened property key]
 * @param {Any} value        [value to set]
 * @param {String} delimiter [optional nesting delimiter]
 * @return {Any}              [the `data` that was passed in.]
 */
Utils.setFlattenedValue = function(data, path, value, delimiter) {
  if(data != null) {
    delimiter = delimiter || DEFAULT_FLATTENED_DELIMITER;
    var pieces = path.split(delimiter),
        current = data,
        piece, i,
        length = pieces.length;

    for(i = 0; i < length; i++) {
      piece = pieces[i];
      if(i === length-1) {
        current[piece] = value;
      } else if(!current[piece]) {
        current[piece] = {};
      }
      current = current[piece];
    }
  }

  return data;
};

/**
 * Returns an array of objects, each representing the flattened version of a value from the passed object. The returned object includes the flattened version of the property key, the humanized label of the flattened property key and the value that was found.
 *
 * Example:
 *
 *
 * @param  {Object|Array} data       the object or array to parse for flattened fields
 * @param  {String} delimiter optional flattened field delimiter
 * @return {Array}           an array of objects, each representing the flattened property.
 */
Utils.getFlattenedFields = function(data, delimiter) {
  if (data == null) {
    return null;
  }

  var output = [];

  delimiter = delimiter || DEFAULT_FLATTENED_DELIMITER;

  var flatten = function(o, prevKey, prevLabel) {
    _.forEach(o, function(val, key) {
      // Nest the key
      var newKey = prevKey ? prevKey + delimiter + key : key;
      var newLabel = prevLabel ? prevLabel + ' ' + key : key;

      // If the value is an object or an array, recurse
      if(_.isArray(val) || _.isPlainObject(val)) {
        return flatten(val, newKey, newLabel);
      }

      // Otherwise output the flattened field
      output.push({
        key: newKey,
        label: humanize(newLabel),
        value: val
      });

    });
  };

  flatten(data);

  return output;
};

/**
 * Clones the passed object or array, removing any
  undefined or nulls. If this results in an empty
  object or array, this is also removed.
 *
 * Example:
 *  Util.cloneTerse({
      some: 'data',
      other: null,
      nested: {
        and: 'data',
        again: undefined
      }
    });
    // -> {
        some: 'data',
        nested: {
          and: 'data'
        }
      }
 * @param  {Object|Array} input [object or array to tersify.]
 * @return {Object|Array|null}     [tersified object/array, or null if the tersified object/array is empty.]
 */
Utils.cloneTerse = function(input) {
  var isArray = _.isArray(input);
  var rtn = isArray ? [] : {};
  var piece;

  for(var k in input) {
    if(_.isArray(input[k]) || _.isPlainObject(input[k])) {
      // Recurse.
      piece = Utils.cloneTerse(input[k]);
    } else {
      piece = input[k];
    }

    if(piece != null && input.hasOwnProperty(k)) {
      if(isArray) {
        rtn.push(piece);
      } else {
        rtn[k] = piece;
      }
    }
  }

  return rtn == null || _.isEmpty(rtn) ? null : rtn;
};

/**
 * Parses a date string into a date object.
 *
 * Supports a wide range of formats. For example:
 *  - Utils.parseDateTimeField('today')
 *  - Utils.parseDateTimeField('tomorrow')
 *  - Utils.parseDateTimeField('next week')
 *  - Utils.parseDateTimeField('11pm')
 *  - Utils.parseDateTimeField('23:30')
 *  - Utils.parseDateTimeField('Friday, January 9th 2015')
 *  - Utils.parseDateTimeField('this friday at 10am')
 *  - Utils.parseDateTimeField('may 25th of next year')
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00')
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00 -0400')
 *  - Utils.parseDateTimeField('in 2 days')
 *  - Utils.parseDateTimeField('5 minutes from now')
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00 -0400 +2d +30m')
 *  - Utils.parseDateTimeField('this friday at 10am -2h -15m')
 *
 * The parsed date can be adjusted using offset modifiers,
 * which take the form (+-)num(dhms). For example:
 *  - +2d -15m will advance the parsed date by 2 days,
 *    then reduce it by 15 mins
 *  - -4d -6h will reduce the parsed date by 4 days and 6 hours
 *
 * @param  {String} field the date string to parse.
 * @return {Object}       an object containing the parsed date, or the passed field if it was not a String.
 */
Utils.parseDateTimeField = function(field) {
  var getRtnObject = function(parsed, isValid) {
    return formatParsedObject('date', field, isValid, parsed);
  };

  var parsedDate;

  // Ensure we have Date superpowers
  Utils.activateDateParser();

  if(_.isDate(field)) {
    parsedDate = field;

  } else if(!_.isString(field)) {
    // Just create a date from the passed value.
    parsedDate = Date.create(field);

  } else {
    // Regex for parsing a offset modifier.
    var offsetRegex = /(?:^|\s+)([+-])(\d+)([dhms])/gi;

    // Multipliers, for converting the type of offset
    // modifier into seconds.
    var offsetMultipliers = {
      s: 1, m: 60, h: 3600, d: 86400
    };

    // Run the regex on the string to strip out any
    // offset modifiers, adding/subtracting
    // them from the overall offsetSecs.
    var offsetSecs = 0;
    var hasOffsetModifier = false;

    var withoutOffsetModifiers = field
      .replace(
        offsetRegex,
        function(match, p1, p2, p3) {
          if(p1 === '+') {
            // We should increment the offsetSecs
            // by the appropriate amount.
            offsetSecs = offsetSecs + (offsetMultipliers[p3] * p2);

          } else {
            // We should decrement the offsetSecs
            // by the appropriate amount.
            offsetSecs = offsetSecs - (offsetMultipliers[p3] * p2);
          }

          // Mark the fact we have at least one offset modifier.
          hasOffsetModifier = true;

          // Return a blank string, to remove the
          // offset modifier from the original string.
          // This is so that the offset modifier does
          // not interfere with the datetime parsing.
          return '';
        })
      .trim();

    // If we only have offset modifiers, initialise the date as now.
    // Otherwise, parse the string to create a date in the future.
    parsedDate =
      withoutOffsetModifiers === '' && hasOffsetModifier ?
        Utils._getCurrentDate() :
        Utils._getFutureDate(withoutOffsetModifiers);

    if(parsedDate.isValid() && hasOffsetModifier && offsetSecs) {
      // Apply the offset modifier.
      // If it is negative, it will subtract.
      parsedDate.addSeconds(offsetSecs);
    }
  }

  // parsedDate will always be a date at this point.
  return getRtnObject(parsedDate, parsedDate.isValid());
};

Utils.parseBooleanField = function(field) {
  var getRtnObject = function(parsed, isValid) {
    return formatParsedObject('boolean', field, isValid, parsed);
  };

  if(_.isBoolean(field)) {
    return getRtnObject(field, true);
  }

  if(field === 1 ||
     /^\s*(?:true|yes|1)\s*$/i.test(field)) {
    return getRtnObject(true, true);
  }

  if(field === 0 ||
     /^\s*(?:false|no|0)\s*$/i.test(field)) {
    return getRtnObject(false, true);
  }

  return getRtnObject(null, false);
};

module.exports = Utils;
