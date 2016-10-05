
var bump = require('./utils').bump;
var updateUserPackage = require('./utils').updateUserPackage;

var git = require('./git');
var createChangelog = require('./changelog');
var when = require('when');
var pipeline = require('when/pipeline');
var sh = require('shelljs');
var lastCommit = false;
var chalk = require('chalk');
var exec = require('child_process').exec;
var path = require('path');
var branchName = false;

function Release(options) {
  this.options = {
    preConditionCommands: options.preConditionCommands,
    createChangelog: options.createChangelog,
    keep: options.keep,
    update: options.update,
    push: options.push,
    userPackage: options.userPackage,
    commitURL: options.commitURL,
    packageSpaces: options.packageSpaces,
    changelogFolder: options.changelogFolder,
    debug: options.debug,
    buildTimestampInName: options.buildTimestampInName,
    releaseURL: options.releaseURL,
    neverendingChangelog: options.neverendingChangelog,
    neverendingChangelogFilename: options.neverendingChangelogFilename
  };
  this.buildTimestamp = Date.now();
  this.currentVersion = options.currentVersion;
  this.parameterVersion = options.parameterVersion;
  this.newVersion = false;
  this.newBranchName = false;

  if (this.options.debug) {
    console.log('Release.options:', this.options);
  }
}

Release.prototype.createBranchName = function() {
  this.newBranchName = this.newVersion;
  if (this.options.buildTimestampInName) {
    this.newBranchName += '-' + this.buildTimestamp;
  }
};

Release.prototype.bump = function() {
  this.newVersion = bump(this.currentVersion, this.parameterVersion);
  console.log('New version: %s', this.newVersion);
};

Release.prototype.rollback = function(exit) {
  if (this.options.debug) {
    console.log('Release.rollback()');
  }
  console.log(chalk.yellow('rollback...'));
  var _this = this;
  var phasenRollback = [];
  phasenRollback.push(function() { _this.deleteChangelog() });
  phasenRollback.push(git.hardReset);
  phasenRollback.push(git.checkoutDevelop);
  phasenRollback.push(git.deleteTag);
  phasenRollback.push(git.deleteReleaseBranch);
  phasenRollback.push(git.deleteLocalReleaseBranch);
  var rollback = pipeline(phasenRollback);
  rollback.then(function() {
    console.log(chalk.yellow('Rollback successful'));
    if (exit) {
      process.exit(1);
    }
  }).catch(function(rollbackError) {
    if (typeof rollbackError !== 'undefined') {
      console.log(chalk.red('ERROR: ' + rollbackError));
    }
    if (exit) {
      process.exit(1);
    }
  });
};

Release.prototype.deleteChangelog = function() {
  sh.rm('-rf', path.join(this.options.changelogFolder, this.newBranchName + '.md'));
};

Release.prototype.createChangelog = function() {
  if (this.options.debug) {
    console.log('Release.createChangelog()');
  }
  return createChangelog({
    folder: this.options.changelogFolder,
    filename: this.newBranchName,
    version: this.newVersion,
    timestamp: this.buildTimestamp,
    commitURL: this.options.commitURL,
    releaseURL: this.options.releaseURL,
    packageName: require(this.options.userPackage).name,
    packageStatus: require(this.options.userPackage).status,
    neverendingChangelog: this.options.neverendingChangelog,
    neverendingChangelogFilename: this.options.neverendingChangelogFilename
  });
};

Release.prototype.updatePackage = function() {
  if (this.options.debug) {
    console.log('Release.updatePackage()');
  }
  return updateUserPackage(
    this.options.userPackage,
    this.newVersion,
    this.buildTimestamp,
    this.options.packageSpaces
  );
};

Release.prototype.checkPreConditions = function() {
  if (this.options.debug) {
    console.log('Release.checkPreConditions()');
  }
  var _this = this;
  return when.promise(function(resolve, reject) {
    var commandPipe = [];

    _this.options.preConditionCommands.forEach(function(command) {
      commandPipe.push(function() {
        return when.promise(function(resolve, reject) {
          exec(command, function(error, stdout, stderr) {
            if (error != null) {
              console.log(stdout);
              reject(error);
            } else {
              resolve();
            }
          });
        })
      });
    });

    pipeline(commandPipe).then(function() {
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  })
};

Release.prototype.commitChanges = function() {
    if (this.options.debug) {
      console.log('Release.commitChanges()');
    }
    var filesToCommit = ['package.json'];
    if (this.options.createChangelog) {
      if (this.options.neverendingChangelog) {
        filesToCommit.push(neverendingChangelogFilename);
      } else {
        filesToCommit.push(path.join(this.options.changelogFolder, this.newBranchName + '.md'))
      }
    }
    return git.commitChanges(
      ['new Release', this.newVersion].join(' '),
      filesToCommit
    )
}

Release.prototype.createBranch = function() {
  if (this.options.debug) {
    console.log('Release.createBranch()');
  }
  return git.createBranch(this.newBranchName);
};

Release.prototype.pushChanges = function() {
  if (this.options.debug) {
    console.log('Release.pushChanges()');
  }
  return git.pushChanges(this.newBranchName);
};

Release.prototype.finishRelease = function() {
  if (this.options.debug) {
    console.log('Release.finishRelease()');
  }
  return git.finishRelease(this.options.push, this.options.keep, this.newBranchName)
};

Release.prototype.release = function() {
  var _this = this;
  var releaseStack = [
    git.isUpToDate,
    function() { return _this.checkPreConditions(); },
    function() { return _this.createBranch(); },
  ];
  if (this.options.createChangelog) {
    releaseStack.push(function() { return _this.createChangelog(); });
  }
  releaseStack.push(
    function() { return _this.updatePackage(); },
    function() { return _this.commitChanges(); },
    function() { return _this.pushChanges(); },
    function() { return _this.finishRelease(); }
  );
  var releasePromise = pipeline(releaseStack);
  releasePromise.then(function() {
    console.log(chalk.green(_this.newBranchName + ' has been successfully released!'));
    process.exit(0);
  }).catch(function(error) {
    if (typeof error !== 'undefined') {
      console.log(chalk.red('ERROR: ' + error));
    }
    _this.rollback(true);
  });

}



module.exports = Release;