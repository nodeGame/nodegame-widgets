/**
 * # ServerInfoDisplay
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays information about the server
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ServerInfoDisplay', ServerInfoDisplay);

    // ## Defaults

    ServerInfoDisplay.defaults = {};
    ServerInfoDisplay.defaults.id = 'serverinfodisplay';
    ServerInfoDisplay.defaults.fieldset = {
        legend: 'Server Info',
        id: 'serverinfo_fieldset'
    };

    // ## Meta-data

    ServerInfoDisplay.version = '0.4';

    function ServerInfoDisplay(options) {
        this.id = options.id;

        this.root = null;
        this.div = document.createElement('div');
        this.table = null; //new node.window.Table();
        this.button = null;
    }

    ServerInfoDisplay.prototype.init = function(options) {
        var that = this;
        if (!this.div) {
            this.div = document.createElement('div');
        }
        this.div.innerHTML = 'Waiting for the reply from Server...';
        if (!this.table) {
            this.table = new node.window.Table(options);
        }
        this.table.clear(true);
        this.button = document.createElement('button');
        this.button.value = 'Refresh';
        this.button.appendChild(document.createTextNode('Refresh'));
        this.button.onclick = function(){
            that.getInfo();
        };
        this.root.appendChild(this.button);
        this.getInfo();
    };

    ServerInfoDisplay.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.div);
        return root;
    };

    ServerInfoDisplay.prototype.getInfo = function() {
        var that = this;
        node.get('INFO', function(info) {
            node.window.removeChildrenFromNode(that.div);
            that.div.appendChild(that.processInfo(info));
        });
    };

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
