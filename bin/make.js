#!/usr/bin/env node

// # JSUS make script


/**
 * Module dependencies.
 */

var program = require('commander'),
os = require('os'),
fs = require('fs'),
util = require('util'),
path = require('path'),
exec = require('child_process').exec,
J = require('JSUS').JSUS;

var pkg = require('../package.json'),
version = pkg.version;

var build = require('./build.js').build;

var rootDir = path.resolve(__dirname, '..') + '/';
var buildDir = rootDir + 'build/';

function list(val) {
    return val.split(',');
}

program
    .version(version);

program
    .command('clean')
    .description('Removes all files from build folder')
    .action(function(){
        J.cleanDir(buildDir);
    });

program
    .command('build [options]')
    .description('Creates a custom build of nodegame-widgets.js')
    .option('-w, --widgets <items>', 'choose widgets to include', list)
    .option('-a, --all', 'full build of JSUS')
    .option('-A, --analyse', 'analyse build')
    .option('-C, --clean', 'clean build directory')
    .option('-o, --output <file>')
    .action(function(env, options){
        build(options);
    });

program
    .command('doc')
    .description('Build documentation files')
    .action(function(){
        console.log('Building documentation for nodegame-widgets v.' + version);
        try {
            var dockerDir = J.resolveModuleDir('docker', rootDir);
        }
        catch(e) {
            console.log('module Docker not found. Cannot build doc.');
            console.log('Do \'npm install docker\' to install it.');
            return false;
        }
        var command = dockerDir + 'docker -i ' + rootDir +
            ' index.js lib/ widgets/ -s true -o ' + rootDir + 'docs/ -u';
        var child = exec(command, function (error, stdout, stderr) {
            if (stdout) console.log(stdout);
            if (stderr) console.log(stderr);
            if (error !== null) {
                console.log('build error: ' + error);
            }
        });

    });


// Parsing options
program.parse(process.argv);
