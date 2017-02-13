'use strict';

var util = require('util'),
    Utils = require('../lib/index.js'),
    _ = require('lodash'),
    SugarDate = require('sugar-date').Date,
    moment = require('moment');

describe('Utils', function() {
  it('should convert an array to a hashtable', function() {
    // A hashtable means you don't need to run array.indexOf.
    // http://jsperf.com/array-indexof-vs-hashtable-lookup
    var arr = ['test1', 'test2'];
    var hashtable = Utils.toHash(arr);
    expect(hashtable).toEqual({
      test1: true,
      test2: true
    });
  });

  describe('Hash to Key Value pairs', function() {
    it('should convert a hashtable to an array of key-value pairs', function() {
      var actual = Utils.hashToKeyValPairs({
        one: 'two',
        buckle: 'my shoe'
      });
      expect(actual).toEqual([{
        key: 'one',
        value: 'two'
      }, {
        key: 'buckle',
        value: 'my shoe'
      }]);
    });

    it('should return an empty array if the hashtable is not defined', function() {
      var actual = Utils.hashToKeyValPairs();
      expect(actual).toEqual([]);
    });
  });

  describe('Get Flattened Value', function() {
    it('should get a flattened property', function() {
      var data = {
        some: {
          flattened: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__flattened__key');
      expect(actual).toBe('value');
    });

    it('should get a flattened property with a custom delimiter', function() {
      var data = {
        some: {
          flattened: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some.flattened.key', '.');
      expect(actual).toBe('value');
    });

    it('should get a flattened array', function() {
      var data = {
        some: [{
          key: 'value'
        }]
      };

      var actual = Utils.getFlattenedValue(data, 'some__0__key');
      expect(actual).toBe('value');
    });

    it('should get a flattened property when an object key is a number', function() {
      var data = {
        some: {
          '0': {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__0__key');
      expect(actual).toBe('value');
    });

    it('should return an empty string property', function() {
      var data = {
        some: {
          '0': {
            key: ''
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__0__key');
      expect(actual).toBe('');
    });

    it('should return a `false` as a property', function() {
      var data = {
        some: {
          '0': {
            key: false
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__0__key');
      expect(actual).toBe(false);
    });

    it('should return a `0` as a property', function() {
      var data = {
        some: {
          '0': {
            key: 0
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__0__key');
      expect(actual).toBe(0);
    });

    it('should return null if the property is null', function() {
      var data = {
        some: {
          flattened: {
            key: null
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__flattened__key');
      expect(actual).toBe(null);
    });

    it('should return undefined if the property is undefined', function() {
      var data = {
        some: {
          flattened: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__incorrect');
      expect(actual).toBe(undefined);
    });

    it('should return undefined if the array index is invalid', function() {
      var data = {
        some: [{
          key: 'value'
        }]
      };

      var actual = Utils.getFlattenedValue(data, 'some__1__key');
      expect(actual).toBe(undefined);
    });

    it('should return null if the object is null', function() {
      var data = {
        some: {
          flattened: null
        }
      };

      var actual = Utils.getFlattenedValue(data, 'some__flattened__key');
      expect(actual).toBe(null);
    });

    it('should return undefined if the object is undefined', function() {
      var data;

      var actual = Utils.getFlattenedValue(data, 'some__incorrect');
      expect(actual).toBe(undefined);
    });

    it('should get a flattened collection', function() {
      var data = {
        some: [{
          key: 0
        }, {
          key: 1
        }, {
          key: 2
        }]
      };

      var options = {
        arrayFormatter: function() {
          return 'array-formatted';
        }
      };

      spyOn(options, 'arrayFormatter').and.callThrough();

      var actual = Utils.getFlattenedValue(data, 'some_+_key', options);
      expect(options.arrayFormatter)
        .toHaveBeenCalledWith([ 'key' ], [{
          key: 0
        }, {
          key: 1
        }, {
          key: 2
        }], []);
      expect(actual).toBe('array-formatted');
    });

    it('should get a flattened multilevel collection', function() {
      var data = {
        some: [{
          key: [{
            id: 1
          }, {
            id: 2
          }]
        }, {
          key: [{
            id: 3
          }, {
            id: 4
          }]
        }]
      };

      var options = {
        arrayFormatter: function() {
          return 'array-formatted';
        }
      };

      spyOn(options, 'arrayFormatter').and.callThrough();

      var actual = Utils.getFlattenedValue(data, 'some_+_key_+_id', options);
      expect(options.arrayFormatter)
        .toHaveBeenCalledWith([ 'key', 'id' ], [{
          key: [{
            id: 1
          }, {
            id: 2
          }]
        }, {
          key: [{
            id: 3
          }, {
            id: 4
          }]
        }], []);
      expect(actual).toBe('array-formatted');
    });
  });

  describe('Set Flattened Value', function() {
    it('should set a regular value', function() {
      var rtn = Utils.setFlattenedValue(
        {}, 'some', 'data');

      expect(rtn).toEqual({
        some: 'data'
      });
    });

    it('should set a flattened value', function() {
      var rtn = Utils.setFlattenedValue(
        {}, 'some__flattened', 'data');

      expect(rtn).toEqual({
        some: {
          flattened: 'data'
        }
      });
    });

    it('should set a flattened value with a custom delimiter', function() {
      var rtn = Utils.setFlattenedValue(
        {}, 'some.flattened', 'data', '.');

      expect(rtn).toEqual({
        some: {
          flattened: 'data'
        }
      });
    });

    it('should return the object if it is undefined', function() {
      var rtn = Utils.setFlattenedValue(
        null, 'some__flattened', 'data');

      expect(rtn).toBeNull();
    });
  });

  describe('Get Flattened Fields', function() {
    var options;

    // Set an array formatter for getting flattened collection fields
    beforeEach(function() {
      options = {
        arrayFormatter: function(keys, data) {
          if(!Array.isArray(data)) {
            data = Object.keys(data)
              .filter(function(key) {
                return !isNaN(key);
              })
              .map(function(key) {
                return data[key];
              });
          }
          return data
            .map(function(item) {
              return _.reduce(keys, function(prev, key) {
                if(prev) {
                  return prev[key];
                }
                return null;
              }, item);
            });
        }
      };
    });

    it('should return flattened fields for an object', function() {
      var data = {
        some: {
          nested: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedFields(data);
      expect(actual).toEqual([{
        key: 'some__nested__key',
        label: 'Some nested key',
        value: 'value'
      }]);
    });

    it('should return flattened fields including an array', function() {
      var data = {
        some: [{
          key: 'value'
        }]
      };

      var actual = Utils.getFlattenedFields(data, options);
      expect(actual).toEqual([{
        key: 'some_+_key',
        label: 'Some key',
        value: [ 'value' ]
      }, {
        key: 'some__0__key',
        label: 'Some 0 key',
        value: 'value'
      }]);
    });

    it('should return flattened fields for an object with a custom delimiter', function() {
      var data = {
        some: {
          nested: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedFields(data, { delimiter: '.' });

      expect(actual).toEqual([{
        key: 'some.nested.key',
        label: 'Some nested key',
        value: 'value'
      }]);
    });

    it('should return an empty array if an empty object was passed in', function() {
      var actual = Utils.getFlattenedFields({});
      expect(actual).toEqual([]);
    });

    it('should return an empty array if an object was not passed in', function() {
      var actual = Utils.getFlattenedFields(null);
      expect(actual).toEqual([]);
    });

    it('should return a hashmap if specified', function() {
      var data = {
        some: {
          nested: {
            key: 'value'
          }
        }
      };

      var actual = Utils.getFlattenedFields(data, { idx: true });

      expect(actual).toEqual({
        'some__nested__key': {
          key: 'some__nested__key',
          label: 'Some nested key',
          value: 'value'
        }
      });
    });

    it('should return an empty hashmap if an empty object was passed in', function() {
      var actual = Utils.getFlattenedFields({}, { idx: true });
      expect(actual).toEqual({});
    });

    it('should return an empty hashmap if an object was not passed in', function() {
      var actual = Utils.getFlattenedFields(null, { idx: true });
      expect(actual).toEqual({});
    });

    it('should produce a field if an object key is a number', function() {
      // This is unsupported, as number keys
      // are reserved for array index use.
      var data = {
        some: {
          '0': {
            key: 'value'
          },
          nested: {
            key: 'property'
          }
        }
      };

      var actual = Utils.getFlattenedFields(data, options);
      expect(actual).toEqual([{
        key: 'some_+_key',
        label: 'Some key',
        value: [ 'value' ]
      }, {
        key: 'some__0__key',
        label: 'Some 0 key',
        value: 'value'
      }, {
        key: 'some__nested__key',
        label: 'Some nested key',
        value: 'property'
      }]);
    });

    it('should support objects with a length property', function() {
      var data = {
        some: 'data',
        length: 10,
        and: {
          more: {
            nested: 'data',
            length: {
              deeply: 'nested'
            }
          }
        }
      };

      var actual = Utils.getFlattenedFields(data);
      expect(actual).toEqual([{
        key: 'some',
        label: 'Some',
        value: 'data'
      }, {
        key: 'length',
        label: 'Length',
        value: 10
      }, {
        key: 'and__more__nested',
        label: 'And more nested',
        value: 'data'
      }, {
        key: 'and__more__length__deeply',
        label: 'And more length deeply',
        value: 'nested'
      }]);
    });

    it('should support collections', function() {
      var data = {
        some: [{
          data: {
            key: 1
          }
        }, {
          data: {
            key: 2
          }
        }]
      };

      var options = {
        arrayFormatter: function() {
          return {
            key: 'array-formatted'
          };
        }
      };

      var actual = Utils.getFlattenedFields(data, options);
      expect(actual).toEqual([{
        key: 'some_+_data__key',
        label: 'Some data key',
        value: 'array-formatted'
      }, {
        key: 'some__0__data__key',
        label: 'Some 0 data key',
        value: 1
      }, {
        key: 'some__1__data__key',
        label: 'Some 1 data key',
        value: 2
      }]);
    });
  });

  describe('Get Flattened Fields Index', function() {
    it('should get flattened fields as an index', function() {
      spyOn(Utils, 'getFlattenedFields').and.returnValue('some_flattened_fields');

      var data = 'data';
      var options = {
        delimiter: '..'
      };

      var actual = Utils.getFlattenedFieldsIdx(data, options);
      expect(actual).toBe('some_flattened_fields');
      expect(Utils.getFlattenedFields).toHaveBeenCalledWith('data', {
        delimiter: '..',
        idx: true
      });
    });

    it('should accept a string as the option', function() {
      spyOn(Utils, 'getFlattenedFields').and.returnValue('some_flattened_fields');

      var data = 'data';
      var delimiter = '..';

      var actual = Utils.getFlattenedFieldsIdx(data, delimiter);
      expect(actual).toBe('some_flattened_fields');
      expect(Utils.getFlattenedFields).toHaveBeenCalledWith('data', {
        delimiter: '..',
        idx: true
      });
    });
  });

  describe('Clone Terse', function() {
    var expectCloned = function(original, expected) {
      var cloned = Utils.cloneTerse(original);
      expect(cloned).not.toBe(original);
      expect(cloned).toEqual(expected);
    };

    it('should remove nulls from an object', function() {
      var obj = {
        some: 'data',
        other: null,
        nested: {
          and: 'data',
          again: null
        }
      };

      expectCloned(obj, {
        some: 'data',
        nested: {
          and: 'data'
        }
      });
    });

    it('should remove undefineds from an object', function() {
      var obj = {
        some: 'data',
        other: undefined,
        nested: {
          and: 'data',
          again: undefined
        }
      };

      expectCloned(obj, {
        some: 'data',
        nested: {
          and: 'data'
        }
      });
    });

    it('should preserve empty strings, 0, and false', function() {
      var obj = {
        some: 'data',
        string: '',
        nested: {
          number: 0,
          boolean: false
        }
      };

      expectCloned(obj, {
        some: 'data',
        string: '',
        nested: {
          number: 0,
          boolean: false
        }
      });
    });

    it('should remove nulls from an array', function() {
      var arr = [
        'data',
        null,
        null,
        'data'
      ];

      expectCloned(arr,  [
        'data',
        'data'
      ]);
    });

    it('should remove undefineds from an array', function() {
      var arr = [
        'data',
        undefined,
        undefined,
        'data'
      ];

      expectCloned(arr,  [
        'data',
        'data'
      ]);
    });

    it('should preserve empty strings, 0, and false', function() {
      var arr = [
        '',
        0,
        false
      ];

      expectCloned(arr,  [
        '',
        0,
        false
      ]);
    });

    it('should remove any empty objects', function() {
      var obj = {
        some: 'data',
        nested: {}
      };

      expectCloned(obj, {
        some: 'data'
      });
    });

    it('should remove any empty arrays', function() {
      var obj = {
        some: 'data',
        nested: []
      };

      expectCloned(obj, {
        some: 'data'
      });
    });

    it('should remove prototype properties', function() {
      function ToBeCloned() {}
      ToBeCloned.prototype.shouldNotBeCloned = function() {};

      var toBeCloned = new ToBeCloned();
      toBeCloned.willRemain = 'hello';
      toBeCloned.willNotRemain = null;

      expectCloned(toBeCloned, {
        willRemain: 'hello'
      });
    });

    it('should tersify a complex object graph', function() {
      var obj = {
        some: 'data',
        other: false,
        removeme: null,
        nested_arr: [{
          removeme: null
        }, {
          should: 'stay',
          and: 0,
          nested: [
            '',
            {
              should: 'stay'
            },
            42
          ]
        }],
        nested_obj: {
          arr: [ undefined ],
          again: [],
          another: ['keepme'],
          more_nesting: {
            and: 'more'
          }
        }
      };

      expectCloned(obj, {
        some: 'data',
        other: false,
        nested_arr: [{
          should: 'stay',
          and: 0,
          nested: [
            '',
            {
              should: 'stay'
            },
            42
          ]
        }],
        nested_obj: {
          another: ['keepme'],
          more_nesting: {
            and: 'more'
          }
        }
      });
    });

    it('should return null if object is completely tersed', function() {
      var obj = {
        some: null,
        nested: []
      };

      expectCloned(obj, null);
    });
  });

  // Date/Times with timezones get tricky. Take your time to understand it.
  // If it seems complicated it is. (Basically, there is a reason for the crazy tests)
  describe('Parse Date Time Field', function() {
    // I have chosen this method vs SugarDate.is() because of the nice output for debugging.
    function expectDatesToBeClose(value, expected, milliseconds) {
      milliseconds = milliseconds || 100;
      var diff = value.valueOf() - expected.valueOf();
      if (diff > milliseconds || diff < (milliseconds * -1)) {
        fail('Expected ' + value + ' to be close to ' + expected  + '.');
      }
    }

    var expectValidDate = function(input, expected, options) {
      var parsedDate = Utils.parseDateTimeField(input, options);
      expect(parsedDate).toEqual({
        type: 'date',
        input: input,
        valid: true,
        parsed: jasmine.any(Object),
        moment: jasmine.any(Object)
      });
      expectDatesToBeClose(parsedDate.moment.toDate(), expected);
      expectDatesToBeClose(parsedDate.parsed, expected);
    };

    var expectInvalidDate = function(input) {
      var parsedDate = Utils.parseDateTimeField(input);
      expect(parsedDate).toEqual({
        type: 'date',
        input: input,
        valid: false,
        parsed: jasmine.any(Date)
      });
      expect(SugarDate.isValid(parsedDate.parsed)).toBe(false);
    };

    beforeEach(function() {
      spyOn(Utils, '_getFutureDate').and.callThrough();
    });

    it('should return the date if one is passed', function() {
      var date = new Date();
      expectValidDate(date, date);
    });

    it('should return a valid object if a number is passed', function() {
      expectValidDate(0, new Date(0));
      expectValidDate(42, new Date(42));
    });

    it('should parse a datetime string', function() {
      expectValidDate('tomorrow', moment().add(1, 'days').startOf('day').toDate());
      expect(Utils._getFutureDate).toHaveBeenCalledWith('tomorrow', {locale: 'en'});
    });

    it('should return as invalid if no string is passed', function() {
      expectInvalidDate('');
    });

    it('should return as invalid if a string with whitespace is passed', function() {
      expectInvalidDate('   ');
    });

    it('should return as invalid if the string points to an invalid date', function() {
      expectInvalidDate('invalid');
    });

    it('should handle a integer', function() {
      expectValidDate(1485410400000, new Date(1485410400000));
    });

    it('should handle a Date', function() {
      expectValidDate(new Date(1485410400000), new Date(1485410400000));
    });

    describe('Locales', function() {
      it('parses a date without locale', function() {
        var d = Utils.parseDateTimeField('now');
        var expected = moment().toDate();
        expect(Utils._getFutureDate).toHaveBeenCalledWith('now', {locale: 'en'});
        // We give a margin of 100ms
        expectDatesToBeClose(d.parsed, expected);
        expectDatesToBeClose(d.moment.toDate(), expected);
      });

      it('parses a date with locale', function() {
        var d = Utils.parseDateTimeField('11/1/2017', {locale: 'en-GB', timezone: 'UTC'});
        expect(Utils._getFutureDate).toHaveBeenCalledWith('11/1/2017', {locale: 'en-GB'});
        expect(d.moment.toISOString()).toEqual('2017-01-11T00:00:00.000Z');

        // .parsed is expected to be in the timezone of the host machine.
        expect(d.parsed).toEqual(moment('2017-01-11').toDate());

        d = Utils.parseDateTimeField('11/1/2017', {locale: 'en', timezone: 'UTC'});
        expect(Utils._getFutureDate).toHaveBeenCalledWith('11/1/2017', {locale: 'en'});
        expect(d.moment.toISOString()).toEqual('2017-11-01T00:00:00.000Z');

        // .parsed is expected to be in the timezone of the host machine.
        expect(d.parsed).toEqual(moment('2017-11-01').toDate());
      });

      it('defaults locale when timezone is Europe/London', function() {
        var d = Utils.parseDateTimeField('now', {timezone: 'Europe/London'});
        var expected = moment().tz('Europe/London').toDate();
        expect(Utils._getFutureDate).toHaveBeenCalledWith('now', {locale: 'en-GB'});
        expectDatesToBeClose(d.moment.toDate(), expected);

        // .parsed is expected to be in the timezone of the host machine.
        expectDatesToBeClose(d.parsed, moment().toDate());
      });
    });

    describe('Timezones', function() {
      it('parses a date without timezone', function() {
        var d = Utils.parseDateTimeField('1/11/2017');
        expect(Utils._getFutureDate).toHaveBeenCalledWith('1/11/2017', {locale: 'en'});
        expect(d.moment.toISOString()).toEqual(moment('2017-01-11').toISOString());

        // .parsed is expected to be in the timezone of the host machine.
        expect(d.parsed).toEqual(moment('2017-01-11').toDate());
      });

      it('parses a date with timezone', function() {
        var d = Utils.parseDateTimeField('1/11/2017', {timezone: 'America/New_York'});
        expect(Utils._getFutureDate).toHaveBeenCalledWith('1/11/2017', {locale: 'en'});
        expect(d.moment.format()).toEqual('2017-01-11T00:00:00-05:00');

        // .parsed is expected to be in the timezone of the host machine.
        expect(d.parsed).toEqual(moment('2017-01-11').toDate());
      });

      it('should assume the correct day', function() {
        function checkTime(time, today, timezone) {
          var testString = today ? 'today ' + time : time;
          var d = Utils.parseDateTimeField(testString, {timezone: timezone});
          var expectedMoment = moment.tz(time, 'HHa', timezone);
          var expectedParsed = moment(time, 'HHa');

          // This duplicates the future feature of SugarDate
          if (!today && moment().tz(timezone).isAfter(expectedMoment)) {
            expectedMoment.add(1, 'days');
          }
          if (!today && moment().isAfter(expectedParsed)) {
            expectedParsed.add(1, 'days');
          }
          expect(d.moment.toDate()).toEqual(expectedMoment.toDate());

          // .parsed is expected to be in the timezone of the host machine.
          // TODO: Get this working!
          expect(d.parsed).toEqual(expectedParsed.toDate());
        }
        [
          '12am', '2am', '4am', '6am', '8am', '10am',
          '12pm', '1pm', '3pm', '5pm', '7pm', '9pm', '11pm'
        ].forEach(function(time) {
          checkTime(time, false, 'America/Chicago');
          checkTime(time, false, 'UTC');

          // NOTE: Disable for now. There is a bug with SugarDate.
          // checkTime(time, true, 'America/Chicago');
          // checkTime(time, true, 'UTC');
        });
      });

      it('it should honor the timezone when parsing a relative date', function() {

        function checkRelative(timezone) {
          var d = Utils.parseDateTimeField('in 5 minutes', {timezone: timezone});
          var expectedMoment = moment().tz(timezone).add(5, 'minutes');

          expectDatesToBeClose(d.moment.toDate(), expectedMoment.toDate());
          // TODO: Get this working!
          var expectedParsed = moment().add(5, 'minutes');
          expectDatesToBeClose(d.parsed, expectedParsed.toDate());
        }
        checkRelative('America/Chicago');
        checkRelative('Asia/Tokyo');
        checkRelative('UTC');
      });

    });

    describe('Offset Modifiers', function() {
      it('should strip offset modifier from string to parse', function() {
        Utils.parseDateTimeField('now +1d');
        expect(Utils._getFutureDate).toHaveBeenCalledWith('now', {locale: 'en'});
      });

      describe('Increment', function() {
        it('should increment datetime field by days offset modifier', function() {
          expectValidDate('now +1d', moment().add(1, 'days').toDate());
        });

        it('should increment datetime field by hours offset modifier', function() {
          expectValidDate('now +30h', moment().add(30, 'hours').toDate());
        });

        it('should increment datetime field by minutes offset modifier', function() {
          expectValidDate('now +90m', moment().add(90, 'minutes').toDate());
        });

        it('should increment datetime field by seconds offset modifier', function() {
          expectValidDate('now +100s', moment().add(100, 'seconds').toDate());
        });
      });

      describe('Decrement', function() {
        it('should decrement datetime field by days offset modifier', function() {
          expectValidDate('now -1d', moment().subtract(1, 'days').toDate());
        });

        it('should decrement datetime field by hours offset modifier', function() {
          expectValidDate('now -30h', moment().subtract(30, 'hours').toDate());
        });

        it('should decrement datetime field by minutes offset modifier', function() {
          expectValidDate('now -90m', moment().subtract(90, 'minutes').toDate());
        });

        it('should decrement datetime field by seconds offset modifier', function() {
          expectValidDate('now -100s', moment().subtract(100, 'seconds').toDate());
        });
      });

      it('should parse a complex offset modifier #1', function() {
        var expected = moment()
          .add(5, 'days')
          .add(4, 'hours')
          .add(30, 'minutes')
          .add(15, 'seconds')
          .toDate();
        expectValidDate('now +5d +4h +30m +15s', expected);
      });

      it('should parse a complex offset modifier #2', function() {
        var expected = moment()
          .subtract(5, 'days')
          .subtract(4, 'hours')
          .subtract(30, 'minutes')
          .subtract(15, 'seconds')
          .toDate();
        expectValidDate('now -5d -4h -30m -15s', expected);
      });

      it('should parse a complex offset modifier #3', function() {
        var expected = moment()
          .add(3, 'days')
          .subtract(900, 'minutes')
          .toDate();
        expectValidDate('now +3d -900m', expected);
      });

      it('should parse a complex offset modifier #4', function() {
        var expected = moment()
          .add(40, 'hours')
          .subtract(30000, 'seconds')
          .toDate();
        expectValidDate('now +40h -30000s', expected);
      });

      it('should parse a complex offset modifier #5', function() {
        var expected = moment()
          .add(40, 'hours')
          .subtract(40, 'hours')
          .toDate();
        expectValidDate('now +40h -40h', expected);
      });

      it('should parse a complex offset modifier #6', function() {
        var expected = moment()
          .add(40, 'hours')
          .subtract(40, 'hours')
          .toDate();
        expectValidDate('+40h now - 40h', expected);
      });

      it('shouldn\'t allow two consecutive offset operators', function() {
        expectInvalidDate('tomorrow++1d');
      });

      it('shouldn\'t allow two consecutive offset operators separated by whitespace', function() {
        expectInvalidDate('tomorrow+ +1d');
      });

      it('should allow no whitespace before and after an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow+1d', expected);
      });

      it('should allow one space before an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow +1d', expected);
      });

      it('should allow one space after an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow+ 1d', expected);
      });

      it('should allow one space before and after an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow + 1d', expected);
      });

      it('should allow arbitrary whitespace before an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow      +1d', expected);
      });

      it('should allow arbitrary whitespace after an offset modifier', function() {
        var expected = moment()
          .add(2, 'days')
          .startOf('day')
          .toDate();
        expectValidDate('tomorrow+      1d', expected);
      });

      it('should start from the current date if offset modifiers are only present', function() {
        var expected = moment()
          .add(1, 'days')
          .toDate();
        expectValidDate('+1d', expected);
      });

      it('should not apply the offset modifier if it is 0', function() {
        spyOn(SugarDate, 'addSeconds');
        Utils.parseDateTimeField('now');
        expect(SugarDate.addSeconds)
          .not.toHaveBeenCalled();
      });

      it('should not apply the offset modifier if the date is invalid', function() {
        spyOn(SugarDate, 'addSeconds');
        Utils.parseDateTimeField('some_invalid_date +40h');
        expect(SugarDate.addSeconds)
          .not.toHaveBeenCalled();
      });

      describe('Timezone offsets', function() {
        it('should work with the YYYY-MM-DD HH-mmZ format', function() {
          var expected = moment('2013-02-08T09:30:00+07:00').toDate();
          expectValidDate('2013-02-08 09:30+07:00', expected);
        });

        it('should work with the YYYY-MM-DD HH-mmZZ format', function() {
          var expected = moment('2013-02-08T09:30:00-01:00').toDate();
          expectValidDate('2013-02-08 09:30-0100', expected);
        });

        it('should work with the YYYY-MM-DD HH:mm:ss.SSSZ format', function() {
          var expected = moment('2013-02-08T09:30:26.123+07:00').toDate();
          expectValidDate('2013-02-08 09:30:26.123+07:00', expected);
        });

        it('should work with the ddd, DD MMM YYYY HH:mm:ss ZZ format', function() {
          var expected = moment('1995-12-25T13:30:00+04:30').toDate();
          expectValidDate('Mon, 25 Dec 1995 13:30:00 +0430', expected);
        });

        it('should work with the YYYY-MM-DDTHH:mm:ssZZ format', function() {
          var expected = moment('1995-12-25T13:30:00+04:30').toDate();
          expectValidDate('1995-12-25T13:30:00+0430', expected);
        });

        it('should work with the YYYY-MM-DD HH-mmZ format and modifiers', function() {
          var expected = moment('2013-02-08T21:30:00+07:00').toDate();
          expectValidDate('2013-02-08 09:30+07:00 +1d - 12h', expected);
        });

        it('should work with the YYYY-MM-DD HH-mmZZ format and modifiers', function() {
          var expected = moment('2013-02-08T21:30:00-01:00').toDate();
          expectValidDate('2013-02-08 09:30-0100 +1d - 12h', expected);
        });

        it('should work with the YYYY-MM-DD HH:mm:ss.SSSZ format and modifiers', function() {
          var expected = moment('2013-02-08T21:30:26.123+07:00').toDate();
          expectValidDate('2013-02-08 09:30:26.123+07:00 +1d - 12h', expected);
        });

        it('should work with the ddd, DD MMM YYYY HH:mm:ss ZZ format and modifiers', function() {
          var expected = moment('1995-12-26T01:30:00+04:30').toDate();
          expectValidDate('Mon, 25 Dec 1995 13:30:00 +0430 +1d - 12h', expected);
        });

        it('should work with the YYYY-MM-DDTHH:mm:ssZZ format and modifiers', function() {
          var expected = moment('1995-12-26T01:30:00+04:30').toDate();
          expectValidDate('1995-12-25T13:30:00+0430 +1d - 12h', expected);
        });

        it('should work with timezone', function() {
          var date = Utils.parseDateTimeField('2016-7-22T00:00:00+01:00', {timezone: 'Europe/London'});
          expect(date.moment.toISOString()).toEqual('2016-07-21T23:00:00.000Z');
        });
      });
    });
  });

  describe('Parse Boolean Field', function() {
    var expectTrue = function(input) {
      expect(Utils.parseBooleanField(input)).toEqual({
        type: 'boolean',
        input: input,
        valid: true,
        parsed: true
      });
    };

    var expectFalse = function(input) {
      expect(Utils.parseBooleanField(input)).toEqual({
        type: 'boolean',
        input: input,
        valid: true,
        parsed: false
      });
    };

    var expectInvalidBoolean = function(input) {
      expect(Utils.parseBooleanField(input)).toEqual({
        type: 'boolean',
        input: input,
        valid: false,
        parsed: null
      });
    };

    it('should return a passed boolean', function() {
      expectTrue(true);
      expectFalse(false);
    });

    describe('Number parsing', function() {
      it('should return `true` if `1` is passed', function() {
        expectTrue(1);
      });

      it('should return `false` if `0` is passed', function() {
        expectFalse(0);
      });

      it('should return as invalid if another number is passed', function() {
        expectInvalidBoolean(2);
        expectInvalidBoolean(102);
        expectInvalidBoolean(-500);
        expectInvalidBoolean(3.141);
        expectInvalidBoolean(NaN);
        expectInvalidBoolean(Infinity);
      });
    });

    describe('String parsing', function() {
      it('should return `true` if `true` is passed', function() {
        expectTrue('true');
      });

      it('should return `true` if `yes` is passed', function() {
        expectTrue('yes');
      });

      it('should return `true` if `y` is passed', function() {
        expectTrue('y');
      });

      it('should return `true` if `1` is passed', function() {
        expectTrue('1');
      });

      it('should return `false` if `false` is passed', function() {
        expectFalse('false');
      });

      it('should return `false` if `no` is passed', function() {
        expectFalse('no');
      });

      it('should return `false` if `n` is passed', function() {
        expectFalse('n');
      });

      it('should return `false` if `0` is passed', function() {
        expectFalse('0');
      });

      it('should return as invalid if another string is passed', function() {
        expectInvalidBoolean('foo');
        expectInvalidBoolean('2');
        expectInvalidBoolean('ok');
        expectInvalidBoolean('oui');
        expectInvalidBoolean('');
      });

      it('should match strings case insensitively', function() {
        expectTrue('true');
        expectTrue('TRUE');
        expectTrue('True');
        expectTrue('yEs');
        expectTrue('Y');
        expectFalse('FalsE');
        expectFalse('FALSE');
        expectFalse('No');
        expectFalse('NO');
        expectFalse('N');
      });
    });

    it('should return as invalid if another type is passed', function() {
      expectInvalidBoolean(new Date());
      expectInvalidBoolean({});
      expectInvalidBoolean([]);
      expectInvalidBoolean(/^$/);
    });
  });

  describe('Annotate Script Input Data', function() {
    var methodFields;

    beforeEach(function() {
      methodFields = [{
        key: 'field',
        label: 'Field'
      }, {
        key: 'nested__field',
        label: 'Nested Field'
      }];
    });

    it('should return an empty array if the method fields are null', function() {
      var scriptData = {
        field: 'Value'
      };

      methodFields = null;

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should return an empty array if the method fields are empty', function() {
      var scriptData = {
        field: 'Value'
      };

      methodFields = [];

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should annotate data using labels from method fields', function() {
      var scriptData = {
        field: 'Value'
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: 'Value'
      }]);
    });

    it('should include empty fields if required', function() {
      var annotate = function(scriptData) {
        return Utils.annotateInputData(scriptData, methodFields, {
          includeEmptyFields: true
        });
      };

      expect(annotate({})).toEqual([{
        key: 'field',
        label: 'Field',
        value: undefined
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: undefined })).toEqual([{
        key: 'field',
        label: 'Field',
        value: undefined
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: null })).toEqual([{
        key: 'field',
        label: 'Field',
        value: null
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: '' })).toEqual([{
        key: 'field',
        label: 'Field',
        value: ''
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);
    });

    it('should discard empty fields if required', function() {
      var annotate = function(scriptData) {
        return Utils.annotateInputData(scriptData, methodFields, {
          includeEmptyFields: false
        });
      };

      expect(annotate({})).toEqual([]);
      expect(annotate({ field: undefined })).toEqual([]);
      expect(annotate({ field: null })).toEqual([]);
      expect(annotate({ field: '' })).toEqual([]);
    });

    it('should annotate a datetime field', function() {
      methodFields[0].type = 'datetime';
      var scriptData = {
        field: {
          type: 'datetime',
          input: 'today',
          valid: true,
          parsed: new Date()
        }
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: 'today'
      }]);
    });

    it('should handle a non-existant datetime value', function() {
      methodFields[0].type = 'datetime';
      var scriptData = {
        field: null
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should annotate a boolean field', function() {
      methodFields[0].type = 'boolean';
      var scriptData = {
        field: {
          type: 'boolean',
          input: 'yes',
          valid: true,
          parsed: true
        }
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: 'yes'
      }]);
    });

    it('should handle a non-existant boolean value', function() {
      methodFields[0].type = 'boolean';
      var scriptData = {
        field: null
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should annotate a select field', function() {
      methodFields[0].type = 'select';
      methodFields[0].input_options = [{
        label: 'Option',
        value: 'option'
      }];

      var scriptData = {
        field: 'option'
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: 'Option'
      }]);
    });

    it('should annotate a dictionary field', function() {
      methodFields[0].type = 'dictionary';
      var scriptData = {
        field: {
          key1: 'value1',
          key2: 'value2'
        }
      };

      var actual = Utils.annotateInputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: '{\n  "key1": "value1",\n  "key2": "value2"\n}'
      }]);
    });
  });

  describe('Annotate Script Output Data', function() {
    var methodFields;

    beforeEach(function() {
      methodFields = [{
        key: 'field',
        label: 'Field'
      }, {
        key: 'nested__field',
        label: 'Nested Field'
      }];
    });

    it('should return an empty array if the method fields are undefined', function() {
      var scriptData = {
        field: 'Value'
      };

      methodFields = null;

      var actual = Utils.annotateOutputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should return an empty array if the method fields are empty', function() {
      var scriptData = {
        field: 'Value'
      };

      methodFields = [];

      var actual = Utils.annotateOutputData(scriptData, methodFields);

      expect(actual).toEqual([]);
    });

    it('should annotate data using labels from method fields', function() {
      var scriptData = {
        field: 'Value'
      };

      var actual = Utils.annotateOutputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'field',
        label: 'Field',
        value: 'Value'
      }]);
    });

    it('should annotate nested data using labels from method fields', function() {
      var scriptData = {
        nested: {
          field: 'Value'
        }
      };

      var actual = Utils.annotateOutputData(scriptData, methodFields);

      expect(actual).toEqual([{
        key: 'nested__field',
        label: 'Nested Field',
        value: 'Value'
      }]);
    });

    it('should include empty fields if required', function() {
      var annotate = function(scriptData) {
        return Utils.annotateOutputData(scriptData, methodFields, {
          includeEmptyFields: true
        });
      };

      expect(annotate({})).toEqual([{
        key: 'field',
        label: 'Field',
        value: undefined
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: undefined })).toEqual([{
        key: 'field',
        label: 'Field',
        value: undefined
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: null })).toEqual([{
        key: 'field',
        label: 'Field',
        value: null
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);

      expect(annotate({ field: '' })).toEqual([{
        key: 'field',
        label: 'Field',
        value: ''
      }, {
        key: 'nested__field',
        label: 'Nested Field',
        value: undefined
      }]);
    });

    it('should discard empty fields if required', function() {
      var annotate = function(scriptData) {
        return Utils.annotateOutputData(scriptData, methodFields, {
          includeEmptyFields: false
        });
      };

      expect(annotate({})).toEqual([]);
      expect(annotate({ field: undefined })).toEqual([]);
      expect(annotate({ field: null })).toEqual([]);
      expect(annotate({ field: '' })).toEqual([]);
    });
  });

  describe('Backoff', function() {

    describe('attempt', function() {

      it('should perform the operation once if it succeeds', function(done) {
        var attempts = 0;
        var work = function(done) {
          attempts++;
          done(null, 'result1', 'result2');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        Utils.Backoff.attempt(work, options, function(err, res1, res2) {
          expect(err).toBeNull();
          expect(res1).toBe('result1');
          expect(res2).toBe('result2');
          expect(attempts).toBe(1);
          done();
        });
      });

      it('should retry the operation with backoff if it fails', function(done) {
        var attempts = 0;
        var work = function(done) {
          attempts++;
          done(attempts < 3 ? 'ERROR' : null, 'result1', 'result2');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        var start = Date.now();
        Utils.Backoff.attempt(work, options, function(err, res1, res2) {
          var duration = Date.now() - start;
          expect(duration).toBeGreaterThan(29);
          expect(err).toBeNull();
          expect(res1).toBe('result1');
          expect(res2).toBe('result2');
          expect(attempts).toBe(3);
          done();
        });
      });

      it('should retry the operation with random backoff if it fails', function(done) {
        var attempts = 0;
        var work = function(done) {
          attempts++;
          done(attempts < 3 ? 'ERROR' : null, 'result1', 'result2');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          useRandom: true
        };
        var start = Date.now();
        Utils.Backoff.attempt(work, options, function(err, res1, res2) {
          var duration = Date.now() - start;
          expect(duration).toBeGreaterThan(29);
          expect(err).toBeNull();
          expect(res1).toBe('result1');
          expect(res2).toBe('result2');
          expect(attempts).toBe(3);
          done();
        });
      });

      it('should fail the operation if the maximum attempts is reached', function(done) {
        var attempts = 0;
        var work = function(done) {
          attempts++;
          done('ERROR');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        var start = Date.now();
        Utils.Backoff.attempt(work, options, function(err) {
          var duration = Date.now() - start;
          expect(duration).toBeGreaterThan(29);
          expect(err).toBe('ERROR');
          expect(attempts).toBe(3);
          done();
        });
      });

      it('should fail the operation if the maximum duration is reached', function(done) {
        var attempts = 0;
        var work = function(done) {
          attempts++;
          done('ERROR');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 5,
          maxDuration: 40
        };
        var start = Date.now();
        Utils.Backoff.attempt(work, options, function(err) {
          var duration = Date.now() - start;
          expect(duration).toBeGreaterThan(29);
          expect(err).toBe('ERROR');
          expect(attempts).toBe(3);
          done();
        });
      });

      it('should fail the operation if a NonRetryableError occurs', function(done) {
        var attempts = 0;
        var nrtErr = new Utils.Backoff.NonRetryableError('ERROR');
        var work = function(done) {
          attempts++;
          done(nrtErr);
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        Utils.Backoff.attempt(work, options, function(err) {
          expect(err).toBe(nrtErr);
          expect(attempts).toBe(1);
          done();
        });
      });

      it('should fail the operation if a custom NonRetryableError occurs', function(done) {
        function NonRetryableError() {}
        util.inherits(NonRetryableError, Error);
        var attempts = 0;
        var nrtErr = new NonRetryableError('ERROR');
        var work = function(done) {
          attempts++;
          done(nrtErr);
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          nonRetryableErrors: NonRetryableError
        };
        Utils.Backoff.attempt(work, options, function(err) {
          expect(err).toBe(nrtErr);
          expect(attempts).toBe(1);
          done();
        });
      });

      it('should fail the operation if one of multiple custom NonRetryableErrors occurs', function(done) {
        function NonRetryableError1() {}
        util.inherits(NonRetryableError1, Error);
        function NonRetryableError2() {}
        util.inherits(NonRetryableError2, Error);

        var attempts = 0;
        var nrtErr = new NonRetryableError1('ERROR');
        var work = function(done) {
          attempts++;
          done(nrtErr);
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          nonRetryableErrors: [
            NonRetryableError1,
            NonRetryableError2
          ]
        };
        Utils.Backoff.attempt(work, options, function(err) {
          expect(err).toBe(nrtErr);
          expect(attempts).toBe(1);
          done();
        });
      });
    });

    describe('attemptAsync', function() {

      it('should perform the operation once if it succeeds', function(done) {
        var attempts = 0;
        var work = function() {
          attempts++;
          return 'result';
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };

        Utils.Backoff
          .attemptAsync(work, options)
          .then(function(res) {
            expect(res).toBe('result');
            expect(attempts).toBe(1);
            done();
          }, done.fail);
      });

      it('should retry the operation with backoff if it fails', function(done) {
        var attempts = 0;
        var work = function() {
          attempts++;
          if(attempts < 3) {
            throw new Error('ERROR');
          }
          return 'result';
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        var start = Date.now();
        Utils.Backoff
          .attemptAsync(work, options)
          .then(function(res) {
            var duration = Date.now() - start;
            expect(duration).toBeGreaterThan(29);
            expect(res).toBe('result');
            expect(attempts).toBe(3);
            done();
          }, done.fail);
      });

      it('should retry the operation with random backoff if it fails', function(done) {
        var attempts = 0;
        var work = function() {
          attempts++;
          if(attempts < 3) {
            throw new Error('ERROR');
          }
          return 'result';
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          useRandom: true
        };
        var start = Date.now();
        Utils.Backoff
          .attemptAsync(work, options)
          .then(function(res) {
            var duration = Date.now() - start;
            expect(duration).toBeGreaterThan(29);
            expect(res).toBe('result');
            expect(attempts).toBe(3);
            done();
          }, done.fail);
      });

      it('should fail the operation if the maximum attempts is reached', function(done) {
        var attempts = 0;
        var work = function() {
          attempts++;
          throw new Error('ERROR');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        var start = Date.now();
        Utils.Backoff
          .attemptAsync(work, options)
          .catch(function(err) {
            var duration = Date.now() - start;
            expect(duration).toBeGreaterThan(29);
            expect(err).toEqual(new Error('ERROR'));
            expect(attempts).toBe(3);
            done();
          });
      });

      it('should fail the operation if the maximum duration is reached', function(done) {
        var attempts = 0;
        var work = function() {
          attempts++;
          throw new Error('ERROR');
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 5,
          maxDuration: 40
        };
        var start = Date.now();
        Utils.Backoff
          .attemptAsync(work, options)
          .catch(function(err) {
            var duration = Date.now() - start;
            expect(duration).toBeGreaterThan(29);
            expect(err).toEqual(new Error('ERROR'));
            expect(attempts).toBe(3);
            done();
          });
      });

      it('should fail the operation if a NonRetryableError occurs', function(done) {
        var attempts = 0;
        var nrtErr = new Utils.Backoff.NonRetryableError('ERROR');
        var work = function() {
          attempts++;
          throw nrtErr;
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3
        };
        Utils.Backoff
          .attemptAsync(work, options)
          .catch(function(err) {
            expect(err).toBe(nrtErr);
            expect(attempts).toBe(1);
            done();
          });
      });

      it('should fail the operation if a custom NonRetryableError occurs', function(done) {
        function NonRetryableError() {}
        util.inherits(NonRetryableError, Error);
        var attempts = 0;
        var nrtErr = new NonRetryableError('ERROR');
        var work = function() {
          attempts++;
          throw nrtErr;
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          nonRetryableErrors: NonRetryableError
        };
        Utils.Backoff
          .attemptAsync(work, options)
          .catch(function(err) {
            expect(err).toBe(nrtErr);
            expect(attempts).toBe(1);
            done();
          });
      });

      it('should fail the operation if one of multiple custom NonRetryableErrors occurs', function(done) {
        function NonRetryableError1() {}
        util.inherits(NonRetryableError1, Error);
        function NonRetryableError2() {}
        util.inherits(NonRetryableError2, Error);

        var attempts = 0;
        var nrtErr = new NonRetryableError1('ERROR');
        var work = function() {
          attempts++;
          throw nrtErr;
        };
        var options = {
          minDelay: 10,
          maxDelay: 20,
          maxAttempts: 3,
          nonRetryableErrors: [
            NonRetryableError1,
            NonRetryableError2
          ]
        };
        Utils.Backoff
          .attemptAsync(work, options)
          .catch(function(err) {
            expect(err).toBe(nrtErr);
            expect(attempts).toBe(1);
            done();
          });
      });
    });
  });

  describe('Logger', function() {
    beforeEach(function() {
      spyOn(console, 'log');
    });

    it('should mimic the default winston logger', function() {
      var logger = Utils.Logger;
      logger.on = true;

      logger.silly('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.debug('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.verbose('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.info('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.warn('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.error('some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.log('info', 'some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');

      logger.log('error', 'some', 'data');
      expect(console.log).toHaveBeenCalledWith('some', 'data');
    });

    it('should not log when `on` is false', function() {
      var logger = Utils.Logger;
      logger.on = false;

      logger.silly('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.debug('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.verbose('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.info('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.warn('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.error('some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.log('info', 'some', 'data');
      expect(console.log).not.toHaveBeenCalled();

      logger.log('error', 'some', 'data');
      expect(console.log).not.toHaveBeenCalled();
    });
  });
});
