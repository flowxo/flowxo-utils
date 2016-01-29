'use strict';

var Utils = require('../lib/index.js');

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

      var actual = Utils.getFlattenedFields(data);
      expect(actual).toEqual([{
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

      var actual = Utils.getFlattenedFields(data);
      expect(actual).toEqual([{
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

  describe('Parse Date Time Field', function() {
    var epoch;

    var expectValidDate = function(input, expected) {
      var parsedDate = Utils.parseDateTimeField(input);
      expect(parsedDate).toEqual({
        type: 'date',
        input: input,
        valid: true,
        parsed: expected
      });
    };

    var expectInvalidDate = function(input) {
      var parsedDate = Utils.parseDateTimeField(input);
      expect(parsedDate).toEqual({
        type: 'date',
        input: input,
        valid: false,
        parsed: jasmine.any(Date)
      });
      expect(parsedDate.parsed.isValid()).toBe(false);
    };

    beforeEach(function() {
      epoch = new Date(0);
      spyOn(Utils, '_getFutureDate').and.callFake(function(str) {
        var parsed = Date.future(str);
        return parsed.isValid() ? epoch : parsed;
      });
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
      expectValidDate('tomorrow', epoch);
      expect(Utils._getFutureDate).toHaveBeenCalledWith('tomorrow');
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

    describe('Offset Modifiers', function() {
      it('should strip offset modifier from string to parse', function() {
        Utils.parseDateTimeField('now +1d');
        expect(Utils._getFutureDate).toHaveBeenCalledWith('now');
      });

      describe('Increment', function() {
        it('should increment datetime field by days offset modifier', function() {
          expectValidDate('now +1d', new Date(86400000));
        });

        it('should increment datetime field by hours offset modifier', function() {
          expectValidDate('now +30h', new Date(108000000));
        });

        it('should increment datetime field by minutes offset modifier', function() {
          expectValidDate('now +90m', new Date(5400000));
        });

        it('should increment datetime field by seconds offset modifier', function() {
          expectValidDate('now +100s', new Date(100000));
        });
      });

      describe('Decrement', function() {
        it('should decrement datetime field by days offset modifier', function() {
          expectValidDate('now -1d', new Date(-86400000));
        });

        it('should decrement datetime field by hours offset modifier', function() {
          expectValidDate('now -30h', new Date(-108000000));
        });

        it('should decrement datetime field by minutes offset modifier', function() {
          expectValidDate('now -90m', new Date(-5400000));
        });

        it('should decrement datetime field by seconds offset modifier', function() {
          expectValidDate('now -100s', new Date(-100000));
        });
      });

      it('should parse a complex offset modifier #1', function() {
        expectValidDate('now +5d +4h +30m +15s', new Date(448215000));
      });

      it('should parse a complex offset modifier #2', function() {
        expectValidDate('now -5d -4h -30m -15s', new Date(-448215000));
      });

      it('should parse a complex offset modifier #3', function() {
        expectValidDate('now +3d -900m', new Date(205200000));
      });

      it('should parse a complex offset modifier #4', function() {
        expectValidDate('now +40h -30000s', new Date(114000000));
      });

      it('should parse a complex offset modifier #5', function() {
        expectValidDate('now +40h -40h', new Date(0));
      });

      it('should allow arbitrary whitespace before a offset modifier', function() {
        expectValidDate('tomorrow      +1d', new Date(86400000));
      });

      it('should start from the current date if offset modifiers are only present', function() {
        spyOn(Utils, '_getCurrentDate')
          .and.returnValue(new Date(0));
        expectValidDate('+1d', new Date(86400000));
      });

      it('should ignore a offset modifier if it is not preceded by a space', function() {
        expectInvalidDate('tomorrow+1d');
      });

      it('should not apply the offset modifier if it is 0', function() {
        spyOn(epoch, 'addSeconds');
        Utils.parseDateTimeField('now');
        expect(epoch.addSeconds)
          .not.toHaveBeenCalled();
      });

      it('should not apply the offset modifier if the date is invalid', function() {
        epoch = new Date('invalid');
        spyOn(epoch, 'addSeconds');
        Utils.parseDateTimeField('some_invalid_date +40h');
        expect(epoch.addSeconds)
          .not.toHaveBeenCalled();
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
      var scriptData = {
        field: {
          type: 'date',
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

    it('should annotate a boolean field', function() {
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

    it('should annotate a select field', function() {
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
});
