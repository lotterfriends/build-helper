#!/usr/bin/env node

var when = require('when');
var exec = require('child_process').exec;
var sh = require('shelljs');
var fs = require('fs');
var git = require('./git');
var changelog42 = require('changelog42')

var _getChangelog = function(commitURL) {
  
  var changelog = new changelog42({
    since: '--tags',
    group: true,
    author: false,
    body: false,
    link: true,
    merge: false,
    commitURL: commitURL
  });

  return when.promise(function(resolve, reject) {
    changelog.getDate(changelog.since, function(err, date) {
      if (err) {
        return reject(err.message);
      }

      changelog.getLog(date, function(err2, commits) {
        if (err2) {
          return reject(err2.message);
        }
        var markdown = changelog.toMarkdown(commits);
        var joint = '\n  - ';
        var result = [];
        result.push('\n### Commits');
        result.push(joint + markdown.join(joint) + '\n');
        resolve(result.join(''));
      });
    });
  });
};



var _createChangelog = function(doIt, folder, filename, title, commitURL) {
  return when.promise(function(resolve, reject) {

    if (!doIt) {
      return resolve();
    }

    sh.mkdir('-p', folder);

    git.getUser().then(function(username) {
      
      _getChangelog(commitURL).then(function(changelog) {
        var fileContentArray = ['##', title, '\n\n'];
        fileContentArray.push('*Created by: ');
        fileContentArray.push(username);
        fileContentArray.push('*');
        fileContentArray.push('\n');
        fileContentArray.push(changelog);
        var fileContent = fileContentArray.join('');
        fs.writeFile('changelogs/' + filename + '.md', fileContent, function(error) {
          if (error) {
            reject('Bei der Erstellung des Changelogs ist ein Fehler aufgetreten: ' + error);
          } else {
            resolve();
          }
        });
      }, reject);
    }, reject);

  });
};

module.exports = _createChangelog;