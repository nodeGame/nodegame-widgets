/**
 * # ServerInfoDisplay
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Displays information about the server
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ServerInfoDisplay', ServerInfoDisplay);

    // ## Meta-data

    ServerInfoDisplay.version = '0.4.1';
    ServerInfoDisplay.description = 'Displays information about the server.';

    ServerInfoDisplay.title = 'Server Info';
    ServerInfoDisplay.className = 'serverinfodisplay';

    /**
     * ## ServerInfoDisplay constructor
     *
     * `ServerInfoDisplay` shows information about the server
     */
    function ServerInfoDisplay() {
        /**
         * ### ServerInfoDisplay.div
         *
         * The DIV wherein to display the information
         */
        this.div = document.createElement('div');

        /**
         * ### ServerInfoDisplay.table
         *
         * The table holding the information
         */
        this.table = null; //new node.window.Table();

        /**
         * ### ServerInfoDisplay.button
         *
         * The button TODO
         */
        this.button = null;

    }

    // ## ServerInfoDisplay methods

    /**
     * ### ServerInfoDisplay.init
     *
     * Initializes the widget
     */
    ServerInfoDisplay.prototype.init = function() {
        var that = this;
        if (!this.div) {
            this.div = document.createElement('div');
        }
        this.div.innerHTML = 'Waiting for the reply from Server...';
        if (!this.table) {
            this.table = new node.window.Table();
        }
        this.table.clear(true);
        this.button = document.createElement('button');
        this.button.value = 'Refresh';
        this.button.appendChild(document.createTextNode('Refresh'));
        this.button.onclick = function(){
            that.getInfo();
        };
        this.bodyDiv.appendChild(this.button);
        this.getInfo();
    };

    ServerInfoDisplay.prototype.append = function() {
        this.bodyDiv.appendChild(this.div);
    };

    /**
     * ### ServerInfoDisplay.getInfo
     *
     * Updates current info
     *
     * @see ServerInfoDisplay.processInfo
     */
    ServerInfoDisplay.prototype.getInfo = function() {
        var that = this;
        node.get('INFO', function(info) {
            node.window.removeChildrenFromNode(that.div);
            that.div.appendChild(that.processInfo(info));
        });
    };

    /**
     * ### ServerInfoDisplay.processInfo
     *
     * Processes incoming server info and displays it in `this.table`
     */
    ServerInfoDisplay.prototype.processInfo = function(info) {
        this.table.clear(true);
        for (var key in info) {
            if (info.hasOwnProperty(key)){
                this.table.addRow([key,info[key]]);
            }
        }
        return this.table.parse();
    };

    ServerInfoDisplay.prototype.listeners = function() {
        var that = this;
        node.on('PLAYER_CREATED', function(){
            that.init();
        });
    };

})(node);
