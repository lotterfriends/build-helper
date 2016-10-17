#!/usr/bin/env node

// node
var path = require('path');
//lib
var chalk = require('chalk');
var semver = require('semver');
// dependencies
var Helper = require('../lib');
var git = require('../lib/git');
var _ = require('../lib/utils');
// config
var buildConfigPath = path.join(process.cwd(), 'build-helper-config.json');
// vars
var parameterVersion = false;
var paramaters = [];
var project = {};
var options = {};
var cleanup = false;

var getProject = function() {
  options.packageDefinitionPath = _.getPackage(process.cwd());
  if (options.packageDefinitionPath) {
    project = require(options.packageDefinitionPath);
  } else {
    console.log(chalk.yellow('no project file (package.json or composer.json), testing for tags'))
    var version = git.getLastTagSync();
    if (semver.valid(version)) {
      project.version = version;
      project.status = false;
      project.name = path.basename(process.cwd());
    } else {
      console.log(chalk.red('no valid tags found'));
      process.exit(1);
    }
  }
};

var initOptions = function() {
  var config = _.isFileReadable(buildConfigPath) ? require(buildConfigPath) : {};
  _.extend(options, {
    push: _.resolveParam(config.push, false),
    keep: _.resolveParam(config.keep, false),
    update: _.resolveParam(config.update, false),
    debug: _.resolveParam(config.debug, false),
    buildTimestampInName: _.resolveParam(config.buildTimestampInName, false),
    createChangelog: _.resolveParam(config.createChangelog, true),
    changelogFolder: _.resolveParam(config.changelogFolder, './changelogs'),
    commitURL: _.resolveParam(config.commitURL, false),
    releaseURL: _.resolveParam(config.releaseURL, false),
    packageSpaces: _.resolveParam(config.packageSpaces, 2),
    preConditionCommands: _.resolveParam(config.preConditionCommands, []),
    neverendingChangelog: _.resolveParam(config.neverendingChangelog, false),
    neverendingChangelogFilename: _.resolveParam(config.neverendingChangelogFilename, 'CHANGELOG.md'),
  });
};

var showHelp = function() {
  console.log();
  console.log('build-helper');
  console.log();
  console.log('create a new release, update the version and build number and do the git stuff');
  console.log('build-helper 0.0.5');
  console.log('build-helper major|minor|patch');
  console.log('build-helper -p minor');
  console.log('build-helper --debug -p patch')
  console.log();
  console.log('Usage: build-helper');
  console.log();
  console.log('  options');
  console.log('   -h/--help     show this help');
  console.log('   -p/--push     push new release to origin');
  console.log('   -k/--keep     keep branch after performing finish');
  console.log('   -d/--debug    more output');
  console.log('   -u/--update   (BETA) experimental');
  console.log('   --cleanup     reset repo')
  console.log();
};

var handleParameters = function() {
  if (process.argv.length > 2) {
    paramaters = process.argv.splice(2);
    paramaters.forEach(function (parameter) {
      switch (parameter) {
        case '-h':
        case '--help':
          showHelp();
          process.exit(0);
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
        case '--cleanup':
          cleanup = true;
          options.update = true;
          break;
      }
    });
  } else {
    showHelp();
    process.exit(1);
  }
};

var getVersion = function() {
  if (options.update) {
    parameterVersion = project.version;
    if (options.packageDefinitionPath) {
      console.log('version ' + parameterVersion + ' taken from package file ' + options.packageDefinitionPath);
    } else {
      console.log('version ' + parameterVersion + ' taken from tags');
    }
  } else {
    parameterVersion = paramaters[paramaters.length - 1];
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
};

var doRelease = function() {
  var helper = new Helper(_.extend({}, options, {
    currentVersion: project.version,
    packageStatus: project.status,
    packageName: project.name
  }));
  helper.bump(parameterVersion);
  helper.createBranchName();
  helper.release();
};

var doCleanup = function() {
  var helper = new Helper(_.extend({}, options, {
    currentVersion: project.version,
    packageStatus: project.status,
    packageName: project.name
  }));
  helper.rollback();
}

getProject();
initOptions();
handleParameters();
getVersion();
if (cleanup) {
  doCleanup();
} else {
  doRelease();
}


