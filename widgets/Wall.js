/**
 * # Wall
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where log and other information is added
 * with a number and timestamp
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Wall', Wall);

    // ## Meta-data

    Wall.version = '0.3.1';
    Wall.description = 'Intercepts all LOG events and prints them into a PRE ' +
                       'element with an ordinal number and a timestamp.';

    Wall.title = 'Wall';
    Wall.className = 'wall';

    // ## Dependencies

    Wall.dependencies = {
        JSUS: {}
    };

    /**
     * ## Wall constructor
     *
     * `Wall` prints all LOG events into a PRE.
     *
     * @param {object} options Optional. Configuration options
     * The options it can take are:
     *
     *   - id: The id of the PRE in which to write.
     *   - name: The name of this Wall.
     */
    function Wall(options) {
        /**
         * ### Wall.id
         *
         * The id of the PRE in which to write
         */
        this.id = options.id || 'wall';

        /**
         * ### Wall.name
         *
         * The name of this Wall
         */
        this.name = options.name || this.name;

        /**
         * ### Wall.buffer
         *
         * Buffer for logs which are to be logged before the document is ready
         */
        this.buffer = [];

        /**
         * ### Wall.counter
         *
         * Counts number of entries on wall
         */
        this.counter = 0;

        /**
         * ### Wall.wall
         *
         * The PRE in which to write
         */
        this.wall = node.window.getElement('pre', this.id);
    }

    // ## Wall methods

    /**
     * ### Wall.init
     *
     * Initializes the instance.
     *
     * If options are provided, the counter is set to `options.counter`
     * otherwise nothing happens.
     */
    Wall.prototype.init = function(options) {
        options = options || {};
        this.counter = options.counter || this.counter;
    };

    Wall.prototype.append = function() {
        return this.bodyDiv.appendChild(this.wall);
    };

    /**
     * ### Wall.listeners
     *
     * Wall has a listener to the `LOG` event
     */
    Wall.prototype.listeners = function() {
        var that = this;
        node.on('LOG', function(msg) {
            that.debuffer();
            that.write(msg);
        });
    };


    /**
     *  ### Wall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * Writes into this.buffer if document is not ready yet.
     */
    Wall.prototype.write = function(text) {
        var mark;
        if (document.readyState !== 'complete') {
            this.buffer.push(text);
        }
        else {
            mark = this.counter++ + ') ' + J.getTime() + ' ';
            this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        }
    };

    /**
     * ### Wall.debuffer
     *
     * If the document is ready, the buffer content is written into this.wall
     */
    Wall.prototype.debuffer = function() {
        if (document.readyState === 'complete' && this.buffer.length > 0) {
            for (var i=0; i < this.buffer.length; i++) {
                this.write(this.buffer[i]);
            }
            this.buffer = [];
        }
    };

})(node);
