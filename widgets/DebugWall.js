/**
 * # DebugWall
 * Copyright(c) 2018 Stefano Balietti
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
    DebugWall.description = 'Intercepts incoming and outgoing messages, and logs ' +
        'and prints them numbered and timestamped. Warning! Modifies ' +
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
         * ### DebugWall.bufferIn
         *
         * Keeps incoming messages if they cannot be printed immediately
         */
        this.bufferIn = [];

        /**
         * ### DebugWall.bufferOut
         *
         * Keeps outgoing messages if they cannot be printed immediately
         */
        this.bufferOut = [];

        /**
         * ### DebugWall.bufferLog
         *
         * Keeps logs if they cannot be printed immediately
         */
        this.bufferLog = [];

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
         * The element in which to write
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

    DebugWall.prototype.destroy = function() {
        if (this.origLogCb) node.log = this.origLogCb;
        if (this.origMsgOutCb) node.socket.send = this.origMsgOutCb;
        if (this.origMsgInCb) node.socket.onMessage = this.origMsgInCb;
    };

    DebugWall.prototype.append = function() {
        var displayIn, displayOut, displayLog, that;
        var btnGroup, cb;
        this.buttonsDiv = W.add('div', this.bodyDiv, {
            className: 'wallbuttonsdiv'
        });
        
        var btnGroup = document.createElement('div');
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
       
        cb = function(className) {
            var items, i, vis;
            items = that.wall.getElementsByClassName(className);
            vis = items[0].style.display === '' ? 'none' : ''; 
            for (i = 0; i < items.length; i++) {
                items[i].style.display = vis;
            }
        };
        
        displayIn.onclick = function() { cb('wall_in'); };
        displayOut.onclick = function() { cb('wall_out'); };
        displayLog.onclick = function() { cb('wall_log'); };
        
        this.wall = W.get('div', { className: 'walldiv' });
        this.bodyDiv.appendChild(this.wall);
    };

    /**
     * ### DebugWall.write
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
    DebugWall.prototype.write = function(type, text) {
        var spanContainer, spanDots, spanExtra, counter, className;
        var limit, sep;
        if (this.isAppended()) {

            counter = type === 'in' ? ++this.counterIn :
                (type === 'out' ? ++this.counterOut : ++this.counterLog);

            sep = '&nbsp;&nbsp;&nbsp;&nbsp;';
            text = counter + sep + type + sep  + text;

            limit = 200;
            className = 'wall_' + type;
            if (text.length > limit) {
                spanContainer = W.add('span', this.wall, {
                    className: [ className, className + '_click' ],
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
                spanContainer = W.add('span', this.wall, {
                    className: className,
                    innerHTML: text
                });
            }
            W.add('br', spanContainer);
            this.wall.scrollTop = this.wall.scrollHeight;
        }
        else {
            if (type === 'in') this.bufferIn.push(text);
            else if (type === 'out') this.bufferOut.push(text);
            else this.bufferLog.push(text);
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
        return level + ' | ' + text;
    };

    /**
     * ### DebugWall.debuffer
     *
     * Erases the buffers and writes its contents
     */
    DebugWall.prototype.debuffer = function() {
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
