#!/usr/bin/env node

var when = require('when');
var fs = require('fs');
var path = require('path');
var sh = require('shelljs');

module.exports.bump = function(currentVersion, newVersion) {

  if (newVersion === 'major') {
    var majorNumber = parseInt(currentVersion.replace(/(\d*)\.\d*\.\d*.*/, '$1'), 10);
    newVersion = currentVersion.replace(/(\d*)(\.\d*\.\d*.*)/, (majorNumber + 1) + '.0.0');
  }

  if (newVersion === 'minor') {
    var minorNumber = parseInt(currentVersion.replace(/\d*\.(\d*)\.\d*.*/, '$1'), 10);
    newVersion = currentVersion.replace(/(\d*\.)\d*(\.\d*.*)/, '$1' + (minorNumber + 1) + '.0');
  }

  if (newVersion === 'patch') {
    var patchNumber = parseInt(currentVersion.replace(/\d*\.\d*\.(\d*).*/, '$1'), 10);
    newVersion = currentVersion.replace(/(\d*\.\d*\.)(\d*)(.*)/, '$1' + (patchNumber + 1) + '$3');
  }

  return newVersion;
};

module.exports.extend = function(target) {
  var sources = [].slice.call(arguments, 1);
  sources.forEach(function (source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
  });
  return target;
};

module.exports.updateUserPackage = function(userPackage, newVersion, buildTimestamp, spaces) {
  spaces = spaces || 2;
  var currentPackage = require(userPackage);
  return when.promise(function(resolve, reject) {
    currentPackage.version = newVersion;
    currentPackage.buildTimestamp = buildTimestamp;
    var outputFilename = path.basename(userPackage);
    fs.writeFile(outputFilename, JSON.stringify(currentPackage, null, spaces), function(error) {
      if (error) {
        reject('an error occured during saving the package file');
      } else {
        resolve();
      }
    });
  });
};

module.exports.isFileReadable = function(file) {
  return sh.test('-f', file);
};

module.exports.isDefined = function(value) {
  return typeof value !== 'undefined';
};
