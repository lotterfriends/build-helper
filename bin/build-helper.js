#!/usr/bin/env node
'use strict';
var path = require('path');
var paramaters = [];
var parameterVersion = false;
var packageDefinitionPath = path.join(process.cwd(), 'package.json');
var buildConfigPath = path.join(process.cwd(), 'build-helper-config.json');
var userPackage = require(packageDefinitionPath);
var config = require(buildConfigPath);
var Helper = require('../lib');

var options = {
  push: config.push || false,
  keep: config.keep || false,
  update: config.update || false,
  createChangelog: config.createChangelog || true,
  changelogFolder: config.changelogFolder || './changelogs',
  commitURL: config.commitURL,
  userPackage: packageDefinitionPath,
  packageSpaces: config.packageSpaces || 2,
  preConditionCommands: config.preConditionCommands || []
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
    console.log();
    console.log('Usage: build-helper');
    console.log();
    console.log('  options');
    console.log('   -h/--help     show this help');
    console.log('   -p/--push     push new release to origin');
    console.log('   -k/--keep     keep branch after performing finish');
    // console.log('   -u/--update   ');
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
      case '-p':
      case '--push':
        options.push = true;
        paramaters.shift();
        break;
      case '-k':
      case '--keep':
        options.keep = true;
        paramaters.shift();
        break;
      case '-u':
      case '--update':
        options.update = true;
        paramaters.shift();
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
  console.log('verison taken from package.json: ' + parameterVersion);
} else {
  parameterVersion = paramaters[0];
}

if (typeof parameterVersion === 'undefined') {
  showHelp();
  process.exit(1);
}


var helper = new Helper(extend({}, options, {
    currentVersion: userPackage.version,
    parameterVersion: parameterVersion
}));

