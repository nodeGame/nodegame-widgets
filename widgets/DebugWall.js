/**
 * # DebugWall
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where all incoming and outgoing messages are printed
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DebugWall', DebugWall);

    // ## Meta-data

    DebugWall.version = '1.0.0';
    DebugWall.description = 'Intercepts incoming and outgoing messages, and ' +
        'logs and prints them numbered and timestamped. Warning! Modifies ' +
        'core functions, therefore its usage in production is ' +
        'not recommended.';

    DebugWall.title = 'Debug Wall';
    DebugWall.className = 'debugwall';

    // ## Dependencies

    DebugWall.dependencies = {
        JSUS: {}
    };

    /**
     * ## DebugWall constructor
     *
     * Creates a new DebugWall oject
     */
    function DebugWall() {

        /**
         * ### DebugWall.buttonsDiv
         *
         * Div contains controls for the display info inside the wall.
         */
        this.buttonsDiv = null;

        /**
         * ### DebugWall.hidden
         *
         * Keep tracks of what is hidden in the wall
         */
        this.hiddenTypes = {};

        /**
         * ### DebugWall.counterIn
         *
         * Counts number of incoming message printed on wall
         */
        this.counterIn = 0;

        /**
         * ### DebugWall.counterOut
         *
         * Counts number of outgoing message printed on wall
         */
        this.counterOut = 0;

        /**
         * ### DebugWall.counterLog
         *
         * Counts number of log entries printed on wall
         */
        this.counterLog = 0;

        /**
         * ### DebugWall.wall
         *
         * The table element in which to write
         */
        this.wall = null;

        /**
         * ### DebugWall.wallDiv
         *
         * The div element containing the wall (for scrolling)
         */
        this.wall = null;

        /**
         * ### DebugWall.origMsgInCb
         *
         * The original function that receives incoming msgs
         */
        this.origMsgInCb = null;

        /**
         * ### DebugWall.origMsgOutCb
         *
         * The original function that sends msgs
         */
        this.origMsgOutCb = null;

        /**
         * ### DebugWall.origLogCb
         *
         * The original log callback
         */
        this.origLogCb = null;
    }

    // ## DebugWall methods

    /**
     * ### DebugWall.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     */
    DebugWall.prototype.init = function(options) {
        var that;
        that = this;
        if (options.msgIn !== false) {
            this.origMsgInCb = node.socket.onMessage;
            node.socket.onMessage = function(msg) {
                that.write('in', that.makeTextIn(msg));
                that.origMsgInCb.call(node.socket, msg);
            };
        }
        if (options.msgOut !== false) {
            this.origMsgOutCb = node.socket.send;
            node.socket.send = function(msg) {
                that.write('out', that.makeTextOut(msg));
                that.origMsgOutCb.call(node.socket, msg);
            };
        }
        if (options.log !== false) {
            this.origLogCb = node.log;
            node.log = function(txt, level, prefix) {
                that.write(level || 'info',
                           that.makeTextLog(txt, level, prefix));
                that.origLogCb.call(node, txt, level, prefix);
            };
        }

        if (options.hiddenTypes) {
            if ('object' !== typeof hiddenTypes) {
                throw new TypeError('DebugWall.init: hiddenTypes must be ' +
                                    'object. Found: ' + hiddenTypes);
            }
            this.hiddenTypes = hiddenTypes;
        }

        this.on('destroyed', function() {
            if (that.origLogCb) node.log = that.origLogCb;
            if (that.origMsgOutCb) node.socket.send = that.origMsgOutCb;
            if (that.origMsgInCb) node.socket.onMessage = that.origMsgInCb;
        });

    };

    DebugWall.prototype.append = function() {
        var displayIn, displayOut, displayLog, that;
        var btnGroup, cb, div;
        this.buttonsDiv = W.add('div', this.bodyDiv, {
            className: 'wallbuttonsdiv'
        });

        btnGroup = document.createElement('div');
        btnGroup.role = 'group';
        btnGroup['aria-label'] = 'Toggle visibility';
        btnGroup.className = 'btn-group';

        displayIn = W.add('button', btnGroup, {
            innerHTML: 'Incoming',
            className: 'btn btn-secondary'
        });
        displayOut = W.add('button', btnGroup, {
            innerHTML: 'Outgoing',
            className: 'btn btn-secondary'
        });
        displayLog = W.add('button', btnGroup, {
            innerHTML: 'Log',
            className: 'btn btn-secondary'
        });

        this.buttonsDiv.appendChild(btnGroup);

        that = this;

        cb = function(type) {
            var items, i, vis, className;
            className = 'wall_' + type;
            items = that.wall.getElementsByClassName(className);
            vis = items[0].style.display === '' ? 'none' : '';
            for (i = 0; i < items.length; i++) {
                items[i].style.display = vis;
            }
            that.hiddenTypes[type] = !!vis;
        };

        displayIn.onclick = function() { cb('in'); };
        displayOut.onclick = function() { cb('out'); };
        displayLog.onclick = function() { cb('log'); };

        this.wallDiv = W.add('div', this.bodyDiv, { className: 'walldiv' });
        this.wall = W.add('table', this.wallDiv);
    };

    /**
     * ### DebugWall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * @param {string} type 'in', 'out', or 'log' (different levels)
     * @param {string} text The text to write
     */
    DebugWall.prototype.shouldHide = function(type, text) {
        return this.hiddenTypes[type];
    };
    /**
     * ### DebugWall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * @param {string} type 'in', 'out', or 'log' (different levels)
     * @param {string} text The text to write
     */
    DebugWall.prototype.write = function(type, text) {
        var spanContainer, spanDots, spanExtra, counter, className;
        var limit;
        var TR, TDtext;
        if (this.isAppended()) {

            counter = type === 'in' ? ++this.counterIn :
                (type === 'out' ? ++this.counterOut : ++this.counterLog);

            limit = 200;
            className = 'wall_' + type;
            TR = W.add('tr', this.wall, { className: className });
            if (type !== 'in' && type !== 'out') TR.className += ' wall_log';

            if (this.shouldHide(type, text)) TR.style.display = 'none';

            W.add('td', TR, { innerHTML: counter });
            W.add('td', TR, { innerHTML: type });
            W.add('td', TR, { innerHTML: J.getTimeM()});
            TDtext = W.add('td', TR);

            if (text.length > limit) {
                spanContainer = W.add('span', TDtext, {
                    className: className + '_click' ,
                    innerHTML: text.substr(0, limit)
                });
                spanExtra = W.add('span', spanContainer, {
                    className: className + '_extra',
                    innerHTML: text.substr(limit, text.length),
                    id: 'wall_' + type + '_' + counter,
                    style: { display: 'none' }

                });
                spanDots = W.add('span', spanContainer, {
                    className: className + '_dots',
                    innerHTML: ' ...',
                    id: 'wall_' + type + '_' + counter
                });

                spanContainer.onclick = function() {
                    if (spanDots.style.display === 'none') {
                        spanDots.style.display = '';
                        spanExtra.style.display = 'none';
                    }
                    else {
                        spanDots.style.display = 'none';
                        spanExtra.style.display = '';
                    }
                };
            }
            else {
                spanContainer = W.add('span', TDtext, {
                    innerHTML: text
                });
            }
            this.wallDiv.scrollTop = this.wallDiv.scrollHeight;
        }
        else {
            node.warn('Wall not appended, cannot write.');
        }
    };

    DebugWall.prototype.makeTextIn = function(msg) {
        var text, d;
        d = new Date(msg.created);
        text = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +
            ':' + d.getMilliseconds();
        text += ' | ' + msg.to + ' | ' + msg.target +
            ' | ' + msg.action + ' | ' + msg.text + ' | ' + msg.data;
        return text;
    };


    DebugWall.prototype.makeTextOut = function(msg) {
        var text;
        text = msg.from + ' | ' + msg.target + ' | ' + msg.action + ' | ' +
            msg.text + ' | ' + msg.data;
        return text;
    };

    DebugWall.prototype.makeTextLog = function(text, level, prefix) {
        return text;
    };

})(node);
