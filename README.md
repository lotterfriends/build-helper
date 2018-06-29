# !!! DEPRECATED !!!
I rename the project to [git-flow-buddy](https://github.com/lotterfriends/git-flow-buddy)

# build-helper
This tool helps building git releases with a changelog and [semver](http://semver.org/) versioning. The tool works with [composer](https://getcomposer.org/) and [node](https://www.npmjs.org) projects. The build-helper use `version` property in the `package.json` or `composer.json`. You can flag the release with a status e.g. `stable`, `unstable` or `beta` with a status field in the package file.

## Requiements
git, git-flow, node, npm

## Install
```bash
$ npm install --global lotterfriends/build-helper
```

## Usage

### Parameters
* `-h/--help`: show the help
* `-p/--push`: push new release to origin
* `-k/--keep`: keep branch after performing finish
* `-d/--debug`: debug output
* `-u/--update`: update the last release (experimental)

### Examples
```bash
$ cd AwesomProject
$ git flow init          # init git flow (if not yet done) 
$ build-helper patch     # create a new (local) patch release - eg 0.0.4 -> 0.0.5
$ build-helper -p minor  # create a new minor release and push the release branch and tag to the server - eg 0.2.4 -> 0.3.0
$ build-helper --help    # show the help
```

## Usage `build-helper-config.json` config files
With the `build-helper-config.json` config files you can configure your build and set some properties to default.

### Properties

- `push` - push new release to origin (default: `false`).
- `keep` - keep branch after performing finish (default: `false`).
- `update` - update the last release (experimental) (default: `false`).
- `debug` - print all called functions (default: `false`).
- `buildTimestampInName` - include build Timestamp in release name  (default: `false`).
- `createChangelog` - create a changelog  (default: `true`).
- `changelogFolder` - folder where the changelog saved  (default: `./changelogs`).
- `commitURL` - repository commit url (default `false`) e.g. `"commitURL": "https://github.com/lotterfriends/build-helper/commit"`
- `releaseURL` - repository commit url (default `false`) e.g. `"releaseURL": "https://github.com/lotterfriends/build-helper/releases/tag"`
- `packageSpaces` - spaces in the package.json or composer.json file (default `2`),,
- `preConditionCommands` - commands (as an array) that are executed before the first release action. If en error occure in one of these commands, the release doesn't start e.g. ``"preConditionCommands": ["grunt lintjs", "grunt lintcss"]` (default: [])
- `neverendingChangelog` - use just one changelog file and prepend the new releases (default: `false`).
- `neverendingChangelogFilename` - the filename of the neverending changelog  (default: `CHANGELOG.md`).
- `customReleaseCommands` - commands (as an array) that are executed after the branch creation and the update of ther version file (package.json, composer.json) and before the release branch commit, if you want to automatically update files or sth. with the commit, this is your place to be  (default: [])
## License

### The MIT License (MIT)

Copyright (c) 2016 André Tarnowsky

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
