# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.5.2] - 2016-07-01
### Fixed
- Reverted to ES5 syntax for node 0.10 and 0.12 compatibility.

## [1.5.1] - 2016-07-01
### Added
- hashToKeyValPairs utility function.
- Code coverage with istanbul.

## [1.5.0] - 2016-03-24
### Added
- Dumb console logger, with partial API compatibility with Winston.

## [1.4.0] - 2016-03-24
### Added
- Backoff utility.

## [1.3.1] - 2016-03-11
### Added
- Support for objects inside collections.

## [1.3.0] - 2016-03-10
### Added
- Support for 'flattened collections'.

## [1.2.0] - 2016-02-25
### Added
- Allow offset modifiers for datetime parsing to be in the form `date + 90d` and `date+90d` as well as `date +90d`.

## [1.1.4] - 2016-02-10
### Fixed
- Issues with `null` values for `datetime` or `boolean` inputs.

### Updated
- lodash and jasmine dependencies.

## [1.1.3] - 2016-02-09
### Fixed
- Correctly stringify `datetime` input annotated values.

## [1.1.2] - 2016-01-13
### Updated
- Allow `y` or `n` as valid boolean values.

## [1.1.1] - 2016-01-13
### Fixed
- Fixed issue when getting flattened fields for an object with a `length` property.

## [1.1.0] - 2015-09-22
### Added
- Added functions to label I/O data.

## [1.0.1] - 2015-05-02
### Fixed
- Fixed bug when getting a nested property when a higher-level property is `null`.

## 1.0.0 - 2015-04-13
### Added
- Initial release.

[1.5.2]: https://github.com/flowxo/flowxo-utils/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/flowxo/flowxo-utils/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/flowxo/flowxo-utils/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/flowxo/flowxo-utils/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/flowxo/flowxo-utils/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/flowxo/flowxo-utils/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/flowxo/flowxo-utils/compare/v1.1.4...v1.2.0
[1.1.4]: https://github.com/flowxo/flowxo-utils/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/flowxo/flowxo-utils/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/flowxo/flowxo-utils/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/flowxo/flowxo-utils/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/flowxo/flowxo-utils/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/flowxo/flowxo-utils/compare/v1.0.0...v1.0.1
