"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var fs = require('fs');

var chalk = require('chalk');

var fsExtra = require('fs-extra');

var glob = require('glob');

var path = require('path');

var mkdirp = require('mkdirp');

var _require = require('child_process'),
    execSync = _require.execSync;

var copyFile = require('fs-copy-file'); // node v6.10.3 support


var AbstractService = require('../AbstractService');

function resolveFile(from) {
  return new Promise(function (resolve, reject) {
    glob(from, {}, function (err, files) {
      if (err) return reject();
      return resolve(files);
    });
  });
}

var Dependencies = /*#__PURE__*/function (_AbstractService) {
  (0, _inherits2["default"])(Dependencies, _AbstractService);

  function Dependencies() {
    (0, _classCallCheck2["default"])(this, Dependencies);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Dependencies).apply(this, arguments));
  }

  (0, _createClass2["default"])(Dependencies, [{
    key: "init",
    value: function init() {
      this.layersPackageDir = this.getLayerPackageDir();
      return mkdirp.sync(this.layersPackageDir);
    }
  }, {
    key: "getDepsPath",
    value: function getDepsPath() {
      var settings = this.plugin.settings;
      var rooPath = path.join(settings.path, settings.dependenciesPath);
      return path.resolve(rooPath);
    }
  }, {
    key: "run",
    value: function () {
      var _run = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(cmd) {
        var output;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                output = execSync(cmd, {
                  cwd: this.layersPackageDir,
                  env: process.env,
                  maxBuffer: 1024 * 1024 * 500
                }).toString();
                return _context.abrupt("return", output);

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function run(_x) {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: "copyProjectFile",
    value: function copyProjectFile(filePath) {
      var _this = this;

      var fileName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      this.init();

      if (!fs.existsSync(filePath)) {
        this.plugin.warn("[warning] \"".concat(filePath, "\" file does not exists!"));
        return true;
      }

      return new Promise(function (resolve) {
        var destFile = path.join(_this.layersPackageDir, fileName || path.basename(filePath));
        copyFile(filePath, destFile, function (copyErr) {
          if (copyErr) throw copyErr;
          return resolve();
        });
      });
    }
  }, {
    key: "install",
    value: function () {
      var _install = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this$plugin$settings, copyBeforeInstall, copyAfterInstall, renameFilename, index, filename, commands, checksumInputFile, checksumCommand, _index, pathTo, pathFrom, _yield$resolveFile, _yield$resolveFile2, from, to;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _this$plugin$settings = this.plugin.settings, copyBeforeInstall = _this$plugin$settings.copyBeforeInstall, copyAfterInstall = _this$plugin$settings.copyAfterInstall;
                this.init();
                /**
                 * This is necessary because npm is
                 * not possible to specify a custom
                 * name for package.json.
                 */

                renameFilename = null;

                if (this.plugin.settings.runtimeDir === 'nodejs') {
                  renameFilename = 'package.json';
                }

                _context2.next = 6;
                return this.copyProjectFile(this.getDepsPath(), renameFilename);

              case 6:
                _context2.t0 = _regenerator["default"].keys(copyBeforeInstall);

              case 7:
                if ((_context2.t1 = _context2.t0()).done) {
                  _context2.next = 14;
                  break;
                }

                index = _context2.t1.value;
                filename = copyBeforeInstall[index];
                _context2.next = 12;
                return this.copyProjectFile(filename);

              case 12:
                _context2.next = 7;
                break;

              case 14:
                if (!this.plugin.settings.customInstallationCommand) {
                  _context2.next = 24;
                  break;
                }

                _context2.t2 = console;
                _context2.t3 = chalk;
                _context2.next = 19;
                return this.run(this.plugin.settings.customInstallationCommand);

              case 19:
                _context2.t4 = _context2.sent;
                _context2.t5 = _context2.t3.white.call(_context2.t3, _context2.t4);

                _context2.t2.log.call(_context2.t2, _context2.t5);

                _context2.next = 32;
                break;

              case 24:
                commands = this.plugin.runtimes.getCommands();
                _context2.t6 = console;
                _context2.t7 = chalk;
                _context2.next = 29;
                return this.run(commands[this.plugin.settings.packageManager]);

              case 29:
                _context2.t8 = _context2.sent;
                _context2.t9 = _context2.t7.white.call(_context2.t7, _context2.t8);

                _context2.t6.log.call(_context2.t6, _context2.t9);

              case 32:
                if (!(this.plugin.settings.runtimeDir === 'nodejs' && this.plugin.settings.useChecksum)) {
                  _context2.next = 43;
                  break;
                }

                checksumInputFile = {
                  npm: 'package-lock.json',
                  yarn: 'node_modules/.yarn-integrity'
                }[this.plugin.settings.packageManager];
                checksumCommand = "json -I -f package.json -e this.checksum=\"'$(sha1sum ".concat(checksumInputFile, " | awk '{print $1}')'\"");
                console.log("Executing checksum command: ".concat(checksumCommand));
                _context2.t10 = console;
                _context2.t11 = chalk;
                _context2.next = 40;
                return this.run(checksumCommand);

              case 40:
                _context2.t12 = _context2.sent;
                _context2.t13 = _context2.t11.white.call(_context2.t11, _context2.t12);

                _context2.t10.log.call(_context2.t10, _context2.t13);

              case 43:
                _context2.t14 = _regenerator["default"].keys(copyAfterInstall);

              case 44:
                if ((_context2.t15 = _context2.t14()).done) {
                  _context2.next = 64;
                  break;
                }

                _index = _context2.t15.value;
                pathTo = copyAfterInstall[_index].to;
                pathFrom = copyAfterInstall[_index].from;
                _context2.next = 50;
                return resolveFile(path.join(this.layersPackageDir, pathFrom));

              case 50:
                _yield$resolveFile = _context2.sent;
                _yield$resolveFile2 = (0, _slicedToArray2["default"])(_yield$resolveFile, 1);
                from = _yield$resolveFile2[0];
                to = path.join(this.layersPackageDir, pathTo);
                _context2.prev = 54;
                _context2.next = 57;
                return fsExtra.copy(from, to);

              case 57:
                _context2.next = 62;
                break;

              case 59:
                _context2.prev = 59;
                _context2.t16 = _context2["catch"](54);
                console.log(_context2.t16);

              case 62:
                _context2.next = 44;
                break;

              case 64:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[54, 59]]);
      }));

      function install() {
        return _install.apply(this, arguments);
      }

      return install;
    }()
  }]);
  return Dependencies;
}(AbstractService);

module.exports = Dependencies;
//# sourceMappingURL=Dependencies.js.map