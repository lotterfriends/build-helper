#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var paramaters = [];
var parameterVersion = false;
var packageDefinitionPathNpm = path.join(process.cwd(), 'package.json');
var packageDefinitionPathComposer = path.join(process.cwd(), 'composer.json');
var buildConfigPath = path.join(process.cwd(), 'build-helper-config.json');
var Helper = require('../lib');
var chalk = require('chalk');
var semver = require('semver')

function isFileReadable(file) {
  try {
    fs.accessSync(file, fs.F_OK);
    return true;
  } catch(e) {
    return false;
  }
}

var config = isFileReadable(buildConfigPath) ? require(buildConfigPath) : {};
var userPackage = isFileReadable(packageDefinitionPathNpm) ? require(packageDefinitionPathNpm) : {};
var packageDefinitionPath = userPackage;
if(!Object.getOwnPropertyNames(userPackage).length) {
  userPackage = isFileReadable(packageDefinitionPathComposer) ? require(packageDefinitionPathComposer) : {};
  var packageDefinitionPath = packageDefinitionPathComposer;
}

if(!Object.getOwnPropertyNames(userPackage).length) {
  console.log(chalk.red('no project file (package.json, composer.json)'))
  process.exit(1);
}

var options = {
  push: config.push || false,
  keep: config.keep || false,
  update: config.update || false,
  debug: config.debug || false,
  createChangelog: config.createChangelog || true,
  changelogFolder: config.changelogFolder || './changelogs',
  commitURL: config.commitURL,
  userPackage: packageDefinitionPath,
  packageSpaces: config.packageSpaces || 2,
  preConditionCommands: config.preConditionCommands || [],
};

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function showHelp() {
    console.log();
    console.log('build-helper');
    console.log();
    console.log('create a new release, update the version and build number and do the git stuff');
    console.log('build-helper 0.0.5');
    console.log('build-helper major|minor|patch');
    console.log('build-helper -p minor');
    console.log();
    console.log('Usage: build-helper');
    console.log();
    console.log('  options');
    console.log('   -h/--help     show this help');
    console.log('   -p/--push     push new release to origin');
    console.log('   -k/--keep     keep branch after performing finish');
    console.log('   -u/--update   (BETA) experimental');
    console.log();
}

if (process.argv.length > 2) {
  var end = false;
  paramaters = process.argv.splice(2);
  paramaters.forEach(function(parameter) {
    switch (parameter) {
      case '-h':
      case '--help':
        showHelp();
        end = true;
        break;
      case '-d':
      case '--debug':
        options.debug = true;
        break;
      case '-p':
      case '--push':
        options.push = true;
        break;
      case '-k':
      case '--keep':
        options.keep = true;
        break;
      case '-u':
      case '--update':
        options.update = true;
        break;
    }
  });
  if (end) {
    process.exit(0);
  }
} else {
  showHelp();
  process.exit(1);
}
if (options.update) {
  parameterVersion = currentPackage.version;
  console.log('verison taken from package file' + parameterVersion);
} else {
  parameterVersion = paramaters[paramaters.length-1];
  if (parameterVersion.indexOf('.') > -1) {
    parameterVersion = semver.clean(parameterVersion);
  }
  if (semver.valid(parameterVersion) === null && parameterVersion !== 'patch' && parameterVersion !== 'major' && parameterVersion !== 'minor') {
    console.log(chalk.red('invalid version parameter'));
    process.exit(1);
  }
}

if (typeof parameterVersion === 'undefined') {
  showHelp();
  process.exit(1);
}

var helper = new Helper(extend({}, options, {
    currentVersion: userPackage.version,
    parameterVersion: parameterVersion
}));

