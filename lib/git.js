#!/usr/bin/env node

var when = require('when');
var exec = require('child_process').exec;

var _getLastCommit = function() {
  return when.promise(function(resolve, reject) {
    exec('git log -n 1 --pretty=%H', function(error, stdout, stderr) {
      if (error != null) {
        reject('Beim ermitteln des letzten Commits ist ein Fehler aufgetreten: ' + error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

var _getReleaseBranchName = function() {
  return when.promise(function(resolve, reject) {
    exec('git branch --list release*', function(error, stdout, stderr) {
      if (error != null) {
        reject('Fehler aufgetreten: ' + error);
      } else {
        resolve(stdout.trim().replace(/release\//, ''));
      }
    });
  });
}


var _deleteTag = function(branchName) {
  return when.promise(function(resolve, reject) {
    if (!branchName) {
      _getReleaseBranchName().then(function(branchName) {
        exec('git tag -d ' + branchName, function(error, stdout, stderr) {
          exec('git push origin :refs/tags/' + branchName, function(error, stdout, stderr) {
            resolve();
          });
        });
      });
    } else {
      exec('git tag -d ' + branchName, function(error, stdout, stderr) {
        exec('git push origin :refs/tags/' + branchName, function(error, stdout, stderr) {
          resolve();
        });
      });
    }
  });
};

var _deleteReleaseBranch = function(branchName) {
  return when.promise(function(resolve, reject) {
    if (!branchName) {
      _getReleaseBranchName().then(function(branchName) {
        exec('git push origin --delete release/' + branchName, function(error, stdout, stderr) {
          if (error != null) {
            resolve();
          } else {
            resolve();
          }
        });
      });
    } else {
      exec('git push origin --delete release/' + branchName, function(error, stdout, stderr) {
        if (error != null) {
          resolve();
        } else {
          resolve();
        }
      });
    }
  });
};

var _deleteLocalReleaseBranch = function(branchName) {
  return when.promise(function(resolve, reject) {
    if (!branchName) {
      _getReleaseBranchName().then(function(branchName) {
        exec('git branch -d release/' + branchName, function(error, stdout, stderr) {
          if (error != null) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } else {
      exec('git branch -d release/' + branchName, function(error, stdout, stderr) {
        if (error != null) {
          reject(error);
        } else {
          resolve();
        }
      });
    }
  });
};


var _isUpToDate = function() {
  return when.promise(function(resolve, reject) {
    exec('git status', function(error, stdout, stderr) {
      if (error != null) {
        reject('Bei der Prüfung des Repositorys ist ein Fehler aufgetreten');
      } else {
        if (stdout.indexOf('Changes not staged for commit') > -1) {
          return reject('Du hast nicht alles eingecheckt, git commit & push nicht vergessen');
        }
        if (stdout.indexOf('Untracked files') > -1) {
          console.log('WARNING: Einige Dateien sind nicht unter Versionskontrolle');
        }
        resolve();
      }
    });
  });
};

var _createBranch = function(branchName) {
  return when.promise(function(resolve, reject) {
    exec('git flow release start ' + branchName, function(error, stdout, stderr) {
      if (error != null) {
        reject('Bei der Erstellung des release Branches ist ein Fehler aufgetreten: ' + error);
      } else {
        resolve();
      }
    });
  });
};

var _commitChanges = function(message, filesToCommit) {
  return when.promise(function(resolve, reject) {
    exec('git add ' + filesToCommit.join(' '), function(error, stdout, stderr) {
      if (error != null) {
        reject('Bei adden der Changelogdatei ist ein Fehler aufgetreten: ' + error);
      } else {
        exec('git commit -m \"' + message + '\" ' + filesToCommit.join(' '), function(error, stdout, stderr) {
          if (error != null) {
            reject('Bei der Committen der Version ist ein Fehler aufgetreten: ' + error);
          } else {
            resolve();
          }
        });
      }
    });
  });
};

var _pushChanges = function(message) {
  return when.promise(function(resolve, reject) {
    exec('git flow release publish ' + message, function(error, stdout, stderr) {
      if (error != null) {
        reject('Beim Veröffentlichen des releases ist ein Fehler aufgetreten: ' + error);
      } else {
        resolve();
      }
    });
  });
};

var _finishRelease = function(push, keep, message) {
  return when.promise(function(resolve, reject) {
    var doPush = (push) ? '-p ': '';
    var doKeep = (keep) ? '-k ': '';
    exec('git flow release finish ' + doPush + doKeep + ' -m "' + message + '" ' + message, function(error, stdout, stderr) {
      if (error != null) {
        reject('Beim Abschließen des releases ist ein Fehler aufgetreten: ' + error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}


var _checkoutBranch = function(branch) {
  return when.promise(function(resolve, reject) {
    exec('git checkout -f ' + branch, function(error, stdout, stderr) {
      if (error != null) {
        reject('Beim wechsel auf ' + branch + ' ist ein Fehler aufgetreten: ' + error);
      } else {
        resolve();
      }
    });
  });
};

var _checkoutDevelop = function(branch) {
  return _checkoutBranch('develop');
};


var _hardReset = function() {
  return when.promise(function(resolve, reject) {
    _getLastCommit().then(function(lastCommit) {
      exec('git reset --hard ' + lastCommit, function(error, stdout, stderr) {
        if (error != null) {
          reject('Beim Hard-Reset ist ein Fehler aufgetreten: ' + error);
        } else {
          resolve();
        }
      });
    }, function(error) {
      reject('Beim Hard-Reset ist ein Fehler aufgetreten: ' + error);
    })
  });
};


var _getUser = function() {
  return when.promise(function(resolve, reject) {
    exec('git config user.name', function(errorUsername, stdoutUsername, stderrUsername) {
      if (errorUsername != null) {
        reject('Beim ermitteln des Git Users ist ein Fehler aufgetreten: ' + error);
      } else {
        resolve(stdoutUsername.trim());
      }
    });
  });
};


module.exports = {
    getLastCommit: _getLastCommit,
    getReleaseBranchName: _getReleaseBranchName,
    deleteTag: _deleteTag,
    deleteReleaseBranch: _deleteReleaseBranch,
    deleteLocalReleaseBranch: _deleteLocalReleaseBranch,
    isUpToDate: _isUpToDate,
    createBranch: _createBranch,
    checkoutDevelop: _checkoutDevelop,
    commitChanges: _commitChanges,
    pushChanges: _pushChanges,
    finishRelease: _finishRelease,
    checkoutBranch: _checkoutBranch,
    hardReset: _hardReset,
    getUser: _getUser
}