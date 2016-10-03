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
    author: true,
    body: false,
    link: (commitURL && commitURL.length) ? true : false,
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

var _getFormattedDate = function(timestamp) {
  var theDate = new Date(timestamp);
  var tmpMonth = theDate.getMonth() + 1;
  var month = tmpMonth < 10 ? '0' + tmpMonth : tmpMonth;
  var day = theDate.getDate() < 10 ? '0' + theDate.getDate() : theDate.getDate();
  return [theDate.getFullYear(), month, day].join('-')
}

var _createChangelog = function(data) {

  return when.promise(function(resolve, reject) {

    sh.mkdir('-p', data.folder);

    git.getUser().then(function(username) {

      _getChangelog(data.commitURL).then(function(changelog) {
        var fileContentArray = [];
        var headline = [];
        if (data.releaseURL) {
          headline = ['## ', _getFormattedDate(data.timestamp), ', [v', data.version, '](', data.releaseURL, '/', data.filename, ')'];
        } else {
          headline = ['## ', _getFormattedDate(data.timestamp),', v', data.version];
        }
        if (typeof data.packageStatus !== 'undefined' && data.packageStatus.length) {
          headline.push(' ', '**_<small>', data.packageStatus, '</small>_**');
        }
        fileContentArray = fileContentArray.concat(headline);
        fileContentArray.push('\n\n');
        fileContentArray.push('*Created by: ', username, '*', '\n');
        fileContentArray.push(changelog);
        var fileContent = fileContentArray.join('');
        fs.writeFile(data.folder + '/' + data.filename + '.md', fileContent, function(error) {
          if (error) {
            reject('Changelog: ' + error);
          } else {
            resolve();
          }
        });
      }, reject);
    }, reject);

  });
};

module.exports = _createChangelog;