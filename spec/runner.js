'use strict';

var Jasmine = require('jasmine');
var SpecReporter = require('jasmine-spec-reporter');

var options = {
  displayStacktrace: 'specs'
};

if(process.argv[2] === '--minimal') {
  options.displaySuccessfulSpec = false;
}

var jasmine = new Jasmine();
jasmine.addReporter(new SpecReporter(options));
jasmine.loadConfig({
  spec_dir: 'spec',
  spec_files: [
    'specs.js'
  ],
  helpers: [
    'helpers.js'
  ]
});

jasmine.onComplete(function(passed) {
  process.exit(passed ? 0 : 1);
});

jasmine.execute();
