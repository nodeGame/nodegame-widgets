/**
 * # Wall
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where all incoming and outgoing messages are printed
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Wall', Wall);

    // ## Meta-data

    Wall.version = '1.0.0';
    Wall.description = 'Intercepts incoming and outgoing messages, and logs ' +
        'and prints them numbered and timestamped. Warning! Modifies ' +
        'core functions, therefore its usage in production is ' +
        'not recommended.';

    Wall.title = 'Wall';
    Wall.className = 'wall';

    // ## Dependencies

    Wall.dependencies = {
        JSUS: {}
    };

    /**
     * ## Wall constructor
     *
     * Creates a new Wall oject
     */
    function Wall() {

        /**
         * ### Wall.bufferIn
         *
         * Keeps incoming messages if they cannot be printed immediately
         */
        this.bufferIn = [];

        /**
         * ### Wall.bufferOut
         *
         * Keeps outgoing messages if they cannot be printed immediately
         */
        this.bufferOut = [];

        /**
         * ### Wall.bufferLog
         *
         * Keeps logs if they cannot be printed immediately
         */
        this.bufferLog = [];

        /**
         * ### Wall.counterIn
         *
         * Counts number of incoming message printed on wall
         */
        this.counterIn = 0;

        /**
         * ### Wall.counterOut
         *
         * Counts number of outgoing message printed on wall
         */
        this.counterOut = 0;

        /**
         * ### Wall.counterLog
         *
         * Counts number of log entries printed on wall
         */
        this.counterLog = 0;

        /**
         * ### Wall.wall
         *
         * The element in which to write
         */
        this.wall = null;

        /**
         * ### Wall.origMsgInCb
         *
         * The original function that receives incoming msgs
         */
        this.origMsgInCb = null;

        /**
         * ### Wall.origMsgOutCb
         *
         * The original function that sends msgs
         */
        this.origMsgOutCb = null;

        /**
         * ### Wall.origLogCb
         *
         * The original log callback
         */
        this.origLogCb = null;
    }

    // ## Wall methods

    /**
     * ### Wall.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     */
    Wall.prototype.init = function(options) {
        var that;
        that = this;
        if (options.msgIn !== false) {
            this.origMsgInCb = node.socket.onMessage;
            node.socket.onMessage = function(msg) {
                that.debuffer();
                that.write('in', that.makeTextIn(msg));
                that.origMsgInCb.call(node.socket, msg);
            };
        }
        if (options.msgOut !== false) {
            this.origMsgOutCb = node.socket.send;
            node.socket.send = function(msg) {
                that.debuffer();
                that.write('out', that.makeTextOut(msg));
                that.origMsgOutCb.call(node.socket, msg);
            };
        }
        if (options.log !== false) {
            this.origLogCb = node.log
            node.log = function(txt, level, prefix) {
                that.debuffer();
                that.write('log', that.makeTextLog(txt, level, prefix));
                that.origLogCb.call(node, txt, level, prefix);
            };
        }
    };

    Wall.prototype.destroy = function() {
        if (this.origLogCb) node.log = this.origLogCb;
        if (this.origMsgOutCb) node.socket.send = this.origMsgOutCb;
        if (this.origMsgInCb) node.socket.onMessage = this.origMsgInCb;
    };

    Wall.prototype.append = function() {
        this.wall = W.get('div', { className: 'walldiv' });
        this.bodyDiv.appendChild(this.wall);
    };

    /**
     * ### Wall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * Writes into this.buffer if wall was not appended yet
     *
     * @param {string} type 'in', 'out', or 'log'
     * @param {string} text The text to write
     * @param {number} level Optional. The level of the log
     * @param {string} prefix Optional. The prefix of the log
     */
    Wall.prototype.write = function(type, text) {
        var span, span2, counter;
        if (this.isAppended()) {
            counter = type === 'in' ? ++this.counterIn :
                (type === 'out' ? ++this.counterOut : ++this.counterLog);

            text = type + ' - ' + counter + ') ' + J.getTime() + ' - ' + text;


            if (text.length > 100) {
                W.add('span', this.wall, {
                    className: 'wall_' + type,
                    innerHTML: text.substr(0, 100)
                });
                // TODO here.
                W.add('span', this.wall, {
                    className: 'wall_' + type + '_dots',
                    innerHTML: ' ...',
                    id: 'wall_' + type + '_' + counter
                });

                W.add('span', this.wall, {
                    className: 'wall_' + type,
                    innerHTML: text.substr(101, text.length),
                    id: 'wall_' + type + '_' + counter
                });
            }

            W.add('span', this.wall, {
                className: 'wall_' + type,
                innerHTML: text
            });
            W.add('br', this.wall);
            this.wall.scrollTop = this.wall.scrollHeight;
        }
        else {
            if (type === 'in') this.bufferIn.push(text);
            else if (type === 'out') this.bufferOut.push(text);
            else this.bufferLog.push(text);
        }
    };

    Wall.prototype.makeTextIn = function(msg) {
        var text;
        text = msg.to + ' | ' + msg.target + ' | ' + msg.action + ' | ' +
            msg.text + ' | ' + msg.data;
        return text;
    };


    Wall.prototype.makeTextOut = function(msg) {
        var text;
        text = msg.from + ' | ' + msg.target + ' | ' + msg.action + ' | ' +
            msg.text + ' | ' + msg.data;
        return text;
    };

    Wall.prototype.makeTextLog = function(text, level, prefix) {
        return level + ' | ' + text;
    };

    /**
     * ### Wall.debuffer
     *
     * Erases the buffers and writes its contents
     */
    Wall.prototype.debuffer = function() {
        var i;
        for (i = 0; i < this.bufferIn.length; i++) {
            this.write('in', this.bufferIn[i]);
        }
        this.bufferIn = [];
        for (i = 0; i < this.bufferOut.length; i++) {
            this.write('out', this.bufferOut[i]);
        }
        this.bufferOut = [];
        for (i = 0; i < this.bufferLog.length; i++) {
            this.write('log', this.bufferLog[i]);
        }
        this.bufferLog = [];
    };

})(node);
