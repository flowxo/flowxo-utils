'use strict';

var _ = require('lodash'),
  moment = require('moment-timezone'),
  SugarDate = require('sugar-date').Date;
require('sugar-date/locales');

var Utils = {};

var DEFAULT_FLATTENED_DELIMITER = '__';
var DEFAULT_FLATTENED_ARRAY_DELIMITER = '_+_';
var TIMEZONE_TO_LOCALE = {
  'Europe/London': 'en-GB'
};

var humanize = function(str) {
  /* istanbul ignore if */
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

/* istanbul ignore next */
Utils._getCurrentDate = function(options) {
  // Makes unit testing possible, by allowing this
  // function to be mocked.
  return SugarDate.create('now', options);
};

/* istanbul ignore next */
Utils._getFutureDate = function(str, options) {
  // Makes unit testing possible, by allowing this
  // function to be mocked.
  return SugarDate.create(str, _.assign({}, options, {future: true}));
};

Utils.activateDateParser = function() {
  // Add support for the 'enhanced' date object.
  // This augments the Date prototype with extra methods,
  // and (importantly) allows use to use the Sugar.js
  // date parsing algorithms.

  // v2 of SugarDate supports optionally extending.
  // This is still here to support legacy dependencies
  SugarDate.extend();
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
 * Converts a hashtable into an array of key-value pairs.
 *
 * Example:
 *   Utils.hashToKeyValPairs({
 *     one: 'two',
 *     buckle: 'my shoe'
 *   });
 *   // -> [{
 *     key: 'one',
 *     value: 'two'
 *   }, {
 *     key: 'buckle',
 *     value: 'my shoe'
 *   }]
 * @param  {Object} hash hashtable to convert
 * @return {Array}      Array of key-value pairs.
 */
Utils.hashToKeyValPairs = function(hash) {
  return _.reduce(hash, function(arr, value, key) {
    arr.push({
      key: key,
      value: value
    });
    return arr;
  }, []);
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
 * You can also get collections using the plus-underscore notation.
 *
 * Collection syntax:
 * `some_+_key`
 * Corresponds to:
 * {
 *   some: [{
 *     key1: 'value 1'
 *   }, {
 *     key2: 'value 2'
 *   }]
 * }
 *
 * Example:
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'flattened__data');
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: ['happy', 'panda' ] }, 'flattened__1');
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'flattened.data', { delimiter: '.' });
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: [{ data: 'panda' }] }, 'flattened_+_data',
 *                         { arrayFormatter(keys, data) { return data[0][keys[0]]; } });
 *  // -> 'panda'
 *
 *  Utils.getFlattenedValue({ flattened: { data: 'panda' } }, 'wrong__key');
 *  // -> { flattened: { data: 'panda' } }
 *
 * @param  {Object|Array} data       [object to get value from]
 * @param  {String} path      [string describing flattened property to get]
 * @param  {Object} [options] [optional options object]
 * @return {Any}              [the flattened property, or the original `data` if it was null.]
 */
Utils.getFlattenedValue = function(data, path, options) {
  // Nested logic borrowed from
  // https://github.com/mickhansen/dottie.js
  if(data == null) {
    return data;
  }

  // Backwards compatibility
  if(_.isString(options)) {
    options = {
      delimiter: options
    };
  }

  options = options || {};
  options.delimiter = options.delimiter || DEFAULT_FLATTENED_DELIMITER;
  options.arrayDelimiter = options.arrayDelimiter || DEFAULT_FLATTENED_ARRAY_DELIMITER;

  var pieces = path.split(options.delimiter).reverse(),
      keyPieces, key;
  while(pieces.length && data != null) {
    key = pieces.pop();
    keyPieces = key.split(options.arrayDelimiter);
    if(keyPieces.length > 1 && options.arrayFormatter) {
      data = options.arrayFormatter(keyPieces.slice(1), data[keyPieces[0]], pieces);
      continue;
    }
    data = data[key];
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
 * Returns an array of objects, each representing the flattened version of a value from the passed object. Each returned object includes the flattened version of the property key, the humanized label of the flattened property key and the value that was found.
 *
 * Example:
 *
 *
 * @param  {Object|Array} data       the object or array to parse for flattened fields
 * @param  {String} delimiter optional flattened field delimiter
 * @param  {Object} [options]
 * @return {Array}           an array of objects, each representing the flattened property.
 */
Utils.getFlattenedFields = function(data, options) {
  options = options || {};
  options.delimiter = options.delimiter || DEFAULT_FLATTENED_DELIMITER;
  options.arrayDelimiter = options.arrayDelimiter || DEFAULT_FLATTENED_ARRAY_DELIMITER;

  var output, addOutput;

  if(options.idx) {
    // Return a hashmap.
    output = {};
    addOutput = function(field) {
      output[field.key] = field;
    };

  } else {
    // Return an array of fields.
    output = [];
    addOutput = function(field) {
      output.push(field);
    };
  }

  var flatten = function(o, prevKey, prevLabel, isCollection) {
    var itr = _.isArray(o) ? _.forEach : _.forOwn;
    itr(o, function(val, key) {
      // Nest the key
      var delimiter = isCollection ? options.arrayDelimiter : options.delimiter;
      var newKey = prevKey ? prevKey + delimiter + key : key;
      var newLabel = prevLabel ? prevLabel + ' ' + key : key;

      // If the value is an object or an array, recurse
      if(_.isArray(val) || _.isPlainObject(val)) {

        // If it's the first element, recurse to create the collection
        if(_.endsWith(newKey, options.delimiter + '0')) {
          var collectionKey = newKey.substr(0, newKey.length - 3);
          var collectionLabel = newLabel.substr(0, newLabel.length - 2);
          flatten(val, collectionKey, collectionLabel, true);
        }

        return flatten(val, newKey, newLabel);
      }

      // Get the flattened value for collections
      if(newKey.indexOf(options.arrayDelimiter) !== -1) {
        val = Utils.getFlattenedValue(data, newKey, options);
      }

      // Otherwise output the flattened field
      addOutput({
        key: newKey,
        label: humanize(newLabel),
        value: val
      });

    });
  };

  if(_.isPlainObject(data)) {
    flatten(data);
  }

  return output;
};

/**
 * Returns a hashmap, each representing the flattened version of a value from the passed object. Each returned object includes the flattened version of the property key, the humanized label of the flattened property key and the value that was found.
 *
 * Example:
 *
 *
 * @param  {Object|Array} data       the object or array to parse for flattened fields
 * @param  {Object} [options] optional options object
 * @return {Object}           a hashmap of objects, each representing the flattened property.
 */
Utils.getFlattenedFieldsIdx = function(data, options) {
  // Backwards compatibility
  if(_.isString(options)) {
    options = {
      delimiter: options
    };
  }

  var opts = _.assign({}, options);
  opts.idx = true;
  return Utils.getFlattenedFields(data, opts);
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
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00', {locale: 'en-GB'})
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00', {timezone: 'America/Chicago'})
 *  - Utils.parseDateTimeField('2014-01-18 09:30:00', {fromUTC: true, setUTC: true})
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
 * @param  {Object} options passed through to SugarDate.create
 * @return {Object}       an object containing the parsed date, or the passed field if it was not a String.
 */
Utils.parseDateTimeField = function(field, options) {
  var getRtnObject = function(parsed, isValid) {
    return formatParsedObject('date', field, isValid, parsed);
  };

  // Copy options
  options = _.assign({}, options);

  // Default timezone
  var timezone = options.timezone || 'UTC';
  var isUTC = timezone.toLowerCase() === 'utc';

  // Lookup Locale. Check options, then look up based on timezone. Default to 'en'
  options.locale = options.locale || TIMEZONE_TO_LOCALE[timezone] || 'en';

  // If invalid
  if (moment.tz.zone(timezone) === null) {
    Utils.Logger.warn('Utils.parseDateTimeField - Timezone "' + timezone + '" is invalid. Assuming UTC');
    timezone = 'UTC';
  }

  // This special case is here to get around a bug in SugarDate. Issue: #582
  options.fromUTC = field === 'now' ? false : isUTC;

  // Help SugarDate be aware of timezones
  var previousNewDateInternal;
  if (timezone) {
    previousNewDateInternal = SugarDate.getOption('newDateInternal');
    SugarDate.setOption('newDateInternal', function() {
      return moment().tz(timezone).toDate();
    });
  }

  var parsedDate;

  if(_.isDate(field)) {
    parsedDate = field;

  } else if(!_.isString(field)) {
    // Just create a date from the passed value.
    parsedDate = SugarDate.create(field, options);

  } else {
    // Regex for parsing a offset modifier.
    var offsetRegex = /(?:\s*)([+-])(?:\s*)(\d+)([dhms])/gi;

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
        Utils._getCurrentDate(options) :
        Utils._getFutureDate(withoutOffsetModifiers, options);

    if(SugarDate.isValid(parsedDate) && hasOffsetModifier && offsetSecs) {
      // Apply the offset modifier.
      // If it is negative, it will subtract.
      SugarDate.addSeconds(parsedDate, offsetSecs);
    }
  }

  if (previousNewDateInternal) {
    SugarDate.setOption('newDateInternal', previousNewDateInternal);
  }

  var dateMoment;
  if (SugarDate.isValid(parsedDate)) {
    var hasTZOffset = new RegExp('[+-]{1}[0-9]{2}:?[0-9]{2}').test(field);

    // Convert to string. Important to remove offset/tz info (if none was provided originally)
    //  or moment will ignore the passed in tz in later step.
    var tzFormatStr = hasTZOffset ? '{Z}' : '';
    var dateString = SugarDate.format(SugarDate.setUTC(parsedDate, isUTC), '{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}' + tzFormatStr);
    Utils.Logger.debug('Utils.parseDateTimeField: dateString:' + dateString);

    // This parses the dateString in the timezone specified.
    dateMoment = moment.tz(dateString, timezone);
    // Utils.Logger.debug('Utils.parseDateTimeField: moment:' + dateMoment);
  }

  // parsedDate will always be a date at this point.
  var rtnObject = getRtnObject(parsedDate, SugarDate.isValid(parsedDate));

  // Add the dateMoment to the return object
  if (dateMoment) {
    rtnObject.moment = dateMoment;
  }
  return rtnObject;
};

/**
 * Parses a boolean-ish input into a boolean object.
 *
 * Casts valid inputs as follows:
 *  - Boolean `true`: returns `true`
 *  - Number `1`: returns `true`
 *  - Strings `'true'`, `'yes'`, `'y'`, `'1'`: returns `true`
 *  - Boolean `false`: returns `false`
 *  - Number `0`: returns `false`
 *  - Strings `'false'`, `'no'`, `'n'`, `'0'`: returns `false`
 *
 * Any other data is considered invalid and is not parsed to a boolean.
 *
 * @param  {Any} field the boolean-ish argument to parse.
 * @return {Object}       an object containing the parsed boolean, or `null` if the data could not be parsed.
 */
Utils.parseBooleanField = function(field) {
  var getRtnObject = function(parsed, isValid) {
    return formatParsedObject('boolean', field, isValid, parsed);
  };

  if(_.isBoolean(field)) {
    return getRtnObject(field, true);
  }

  if(field === 1 ||
     /^\s*(?:true|yes|y|1)\s*$/i.test(field)) {
    return getRtnObject(true, true);
  }

  if(field === 0 ||
     /^\s*(?:false|no|n|0)\s*$/i.test(field)) {
    return getRtnObject(false, true);
  }

  return getRtnObject(null, false);
};

Utils._annotateData = function(data, fields, normaliseData, options) {
  if(!fields || !fields.length) {
    // Return an empty array.
    return [];
  }

  options = options || {};

  var shouldIncludeData = options.includeEmptyFields ?
    function() {
      // Include all method fields.
      return true;
    } :
    function(data) {
      // Only include script data if it is
      // not null, undefined or the empty string
      // != null covers null and undefined
      return data != null && data !== '';
    };

  // We only care about data that corresponds
  // to a field in the method.
  // so, loop through the method fields,
  // searching for data to return.
  return fields.reduce(function(result, field) {
    // First of all, grab the data.
    var value = normaliseData(data[field.key], field);

    // Then check if we should add it or not.
    if(shouldIncludeData(value)) {
      result.push({
        key: field.key,
        label: field.label,
        value: value
      });
    }
    return result;
  }, []);
};

var processOptions = function(field, val) {
  // If the field has input options, then try to
  // lookup the label from the matching option.
  var rtn = val;

  if(field && field.input_options && field.input_options.length > 0) {
    var chosenOption = _.find(field.input_options, function(option) {
      return option.value === val;
    });
    if(chosenOption && chosenOption.hasOwnProperty('label')) {
      rtn = chosenOption.label;
    }
  }

  return rtn;
};

/**
 * Turns the passed raw data into a 'pretty'
 * version, using the inputFields to
 * label the data.
 *
 * If a boolean or datetime field is used,
 * the raw input value is returned.
 *
 * If input data is not found in the field,
 * the data will **not** be returned.
 *
 * @param  {Object} inputData
 * @param  {Array}  inputFields
 * @return {Object} annotated script data
 */
Utils.annotateInputData = function(inputData, inputFields, options) {
  // Input data should not be flattened.
  // We should account for datetime and boolean fields.
  var normaliseData = function(item, field) {
    var rtn;
    switch(field.type) {
      case 'datetime':
      case 'boolean':
        rtn = item && item.hasOwnProperty('input') ? item.input : item;
        break;

      case 'select':
        rtn = processOptions(field, item);
        break;

      case 'dictionary':
        rtn = JSON.stringify(item, null, 2);
        break;

      default:
        rtn = item;
        break;
    }

    return rtn;
  };

  return Utils._annotateData(inputData, inputFields, normaliseData, options);
};

/**
 * Turns the passed raw data into a 'pretty'
 * version, using the outputFields to
 * label the data.
 *
 * If output data is not found in the field,
 * the data will **not** be returned.
 *
 * @param  {Object} outputData
 * @param  {Array}  outputFields
 * @param  {Object} [options]
 * @return {Object} annotated output data
 */
Utils.annotateOutputData = function(outputData, outputFields, options) {
  // Output data should be flattened.
  outputData = Utils.getFlattenedFieldsIdx(outputData, options);

  // Output data items will be an object with
  // key-label-value properties.
  var normaliseOutputData = function(item) {
    return item && item.value;
  };

  return Utils._annotateData(outputData, outputFields, normaliseOutputData, options);
};

Utils.Backoff = require('./backoff');
Utils.Logger = require('./logger');

module.exports = Utils;
