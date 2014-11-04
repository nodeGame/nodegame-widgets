// # nodegame-widgets build script

// Export build
module.exports.build = buildIt;

// Dependencies
var smoosh = require('smoosh'),
fs = require('fs'),
path = require('path'),
pkg = require('../package.json'),
J = require('JSUS').JSUS,
version = pkg.version;

function buildIt(options) {

    var out = options.output || "nodegame-widgets";

    if (path.extname(out) === '.js') {
	out = path.basename(out, '.js');
    }

    console.log('Building nodegame-widgets v.' + version + ' with:');

    // Defining variables
    var rootDir = path.resolve(__dirname, '..') + '/',
    libDir = rootDir + 'lib/',
    widgetsDir = rootDir + 'widgets/',
    distDir =  rootDir + 'build/';

    var libs = {};
    var files = fs.readdirSync(widgetsDir);
    for (var i in files) {
        // "Dirty" files.
        if (files[i].charAt(0) === '.' || files[i].charAt(0) === '#') {
            continue;
        }
	if (path.extname(files[i]) === '.js') {
	    var name = path.basename(files[i], '.js').toLowerCase();
	    libs[name] = widgetsDir + files[i];
	}
    }

    // defaults
    var files = [
	libDir + 'Widget.js',
	libDir + 'Widgets.js',
    ];

    if (options.all) {
	files = files.concat(J.obj2Array(libs));
	console.log('  - nodegame-widgets: all available widgets included');
    }
    else {
	var selected = options.widgets;
	for (var i in selected) {
	    if (selected.hasOwnProperty(i)) {
		if (!('string' === typeof selected[i])) continue;
		var name = selected[i].toLowerCase();
		if (libs[name]) {
		    files.push(libs[name]);
		    console.log('  - widget: ' + selected[i]);
		}
		else {
		    console.log('  - ERR: widget not found: ' + name);
		}
	    }
	}
    }

    console.log("\n");

    // Configurations for file smooshing.
    var config = {
	// VERSION : "0.0.1",

	// Use JSHINT to spot code irregularities.
	JSHINT_OPTS: {
	    boss: true,
	    forin: true,
	    browser: true,
	},

	JAVASCRIPT: {
	    DIST_DIR: '/' + distDir,
	}
    };

    config.JAVASCRIPT[out] = files;

    var run_it = function(){
	// https://github.com/fat/smoosh
	// hand over configurations made above
	var smooshed = smoosh.config(config);

	// removes all files from the build folder
	if (options.clean) {
	    smooshed.clean();
	}

	// builds both uncompressed and compressed files
	smooshed.build();

    	if (options.analyse) {
    	    smooshed.run(); // runs jshint on full build
    	    smooshed.analyze(); // analyzes everything
    	}

        console.log('nodegame-widget v.' + version + ' build created');
    }

    run_it();
}
