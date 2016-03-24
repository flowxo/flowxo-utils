'use strict';

beforeEach(function() {
  jasmine.addMatchers({
    toBeBetween: function() {
      return {
        compare: function(actual, min, max) {
          return {
            pass: min <= actual <= max
          };
        }
      };
    }
  });
});
