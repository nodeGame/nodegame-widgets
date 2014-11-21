/**
 * # Wall
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where log and other information is added
 * with a number and timestamp
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Wall', Wall);

    var JSUS = node.JSUS;

    // ## Defaults

    Wall.defaults = {};
    Wall.defaults.id = 'wall';
    Wall.defaults.fieldset = { legend: 'Game Log' };

    // ## Meta-data

    Wall.version = '0.3';
    Wall.description = 'Intercepts all LOG events and prints them into a DIV ' +
                       'element with an ordinal number and a timestamp.';

    // ## Dependencies

    Wall.dependencies = {
        JSUS: {}
    };

    function Wall(options) {
        this.id = options.id || Wall.id;
        this.name = options.name || this.name;
        this.buffer = [];
        this.counter = 0;

        this.wall = node.window.getElement('pre', this.id);
    }

    Wall.prototype.init = function(options) {
        options = options || {};
        this.counter = options.counter || this.counter;
    };

    Wall.prototype.append = function(root) {
        return root.appendChild(this.wall);
    };

    Wall.prototype.getRoot = function() {
        return this.wall;
    };

    Wall.prototype.listeners = function() {
        var that = this;
        node.on('LOG', function(msg) {
            that.debuffer();
            that.write(msg);
        });
    };

    Wall.prototype.write = function(text) {
        if (document.readyState !== 'complete') {
            this.buffer.push(s);
        } else {
            var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
            this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        }
    };

    Wall.prototype.debuffer = function() {
        if (document.readyState === 'complete' && this.buffer.length > 0) {
            for (var i=0; i < this.buffer.length; i++) {
                this.write(this.buffer[i]);
            }
            this.buffer = [];
        }
    };

})(node);
