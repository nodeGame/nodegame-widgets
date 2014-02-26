/**
 * # MsgBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a tool for sending messages to other connected clients.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var GameMsg = node.GameMsg,
    Table = node.window.Table;

    node.widgets.register('MsgBar', MsgBar);

    // ## Defaults

    MsgBar.defaults = {};
    MsgBar.defaults.id = 'msgbar';
    MsgBar.defaults.fieldset = { legend: 'Send MSG' };

    // ## Meta-data

    MsgBar.version = '0.5';
    MsgBar.description = 'Send a nodeGame message to players';

    function MsgBar(options) {

        this.id = options.id;

        this.recipient = null;
        this.actionSel = null;
        this.targetSel = null;

        this.table = new Table();

        this.init();
    }

    // TODO: Write a proper INIT method
    MsgBar.prototype.init = function() {
        var that = this;
        var gm = new GameMsg();
        var y = 0;
        for (var i in gm) {
            if (gm.hasOwnProperty(i)) {
                var id = this.id + '_' + i;
                this.table.add(i, 0, y);
                this.table.add(node.window.getTextInput(id), 1, y);
                if (i === 'target') {
                    this.targetSel = node.window.getTargetSelector(this.id + '_targets');
                    this.table.add(this.targetSel, 2, y);

                    this.targetSel.onchange = function() {
                        node.window.getElementById(that.id + '_target').value = that.targetSel.value;
                    };
                }
                else if (i === 'action') {
                    this.actionSel = node.window.getActionSelector(this.id + '_actions');
                    this.table.add(this.actionSel, 2, y);
                    this.actionSel.onchange = function() {
                        node.window.getElementById(that.id + '_action').value = that.actionSel.value;
                    };
                }
                else if (i === 'to') {
                    this.recipient = node.window.getRecipientSelector(this.id + 'recipients');
                    this.table.add(this.recipient, 2, y);
                    this.recipient.onchange = function() {
                        node.window.getElementById(that.id + '_to').value = that.recipient.value;
                    };
                }
                y++;
            }
        }
        this.table.parse();
    };

    MsgBar.prototype.append = function(root) {

        var sendButton = node.window.addButton(root);
        var stubButton = node.window.addButton(root, 'stub', 'Add Stub');

        var that = this;
        sendButton.onclick = function() {
            // Should be within the range of valid values
            // but we should add a check

            var msg = that.parse();
            node.socket.send(msg);
            //console.log(msg.stringify());
        };
        stubButton.onclick = function() {
            that.addStub();
        };

        root.appendChild(this.table.table);

        this.root = root;
        return root;
    };

    MsgBar.prototype.getRoot = function() {
        return this.root;
    };

    MsgBar.prototype.listeners = function() {
        var that = this;
        node.on.plist( function(msg) {
            node.window.populateRecipientSelector(that.recipient, msg.data);

        });
    };

    MsgBar.prototype.parse = function() {
        var msg = {};
        var that = this;
        var key = null;
        var value = null;
        this.table.forEach( function(e) {

            if (e.x === 0) {
                key = e.content;
                msg[key] = '';
            }
            else if (e.x === 1) {

                value = e.content.value;
                if (key === 'state' || key === 'data') {
                    try {
                        value = JSON.parse(e.content.value);
                    }
                    catch (ex) {
                        value = e.content.value;
                    }
                }

                msg[key] = value;
            }
        });
        var gameMsg = new GameMsg(msg);
        node.info(gameMsg, 'MsgBar sent: ');
        return gameMsg;
    };

    MsgBar.prototype.addStub = function() {
        node.window.getElementById(this.id + '_from').value = (node.player) ? node.player.id : 'undefined';
        node.window.getElementById(this.id + '_to').value = this.recipient.value;
        node.window.getElementById(this.id + '_forward').value = 0;
        node.window.getElementById(this.id + '_reliable').value = 1;
        node.window.getElementById(this.id + '_priority').value = 0;

        if (node.socket && node.socket.session) {
            node.window.getElementById(this.id + '_session').value = node.socket.session;
        }

        node.window.getElementById(this.id + '_state').value = JSON.stringify(node.state);
        node.window.getElementById(this.id + '_action').value = this.actionSel.value;
        node.window.getElementById(this.id + '_target').value = this.targetSel.value;

    };

})(node);
