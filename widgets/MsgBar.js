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
        GameStage = node.GameStage,
        Table = W.Table;

    node.widgets.register('MsgBar', MsgBar);

    // ## Meta-data

    MsgBar.version = '0.5';
    MsgBar.description = 'Send a nodeGame message to players';

    MsgBar.title = 'Send MSG';
    MsgBar.className = 'msgbar';

    function MsgBar(options) {

        this.id = options.id || MsgBar.className;

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
                this.table.add(W.getTextInput(id), 1, y);
                if (i === 'target') {
                    this.targetSel = W.getTargetSelector(this.id + '_targets');
                    this.table.add(this.targetSel, 2, y);

                    this.targetSel.onchange = function() {
                        W.getElementById(that.id + '_target').value =
                            that.targetSel.value;
                    };
                }
                else if (i === 'action') {
                    this.actionSel = W.getActionSelector(this.id + '_actions');
                    this.table.add(this.actionSel, 2, y);
                    this.actionSel.onchange = function() {
                        W.getElementById(that.id + '_action').value =
                            that.actionSel.value;
                    };
                }
                else if (i === 'to') {
                    this.recipient =
                        W.getRecipientSelector(this.id + 'recipients');
                    this.table.add(this.recipient, 2, y);
                    this.recipient.onchange = function() {
                        W.getElementById(that.id + '_to').value =
                            that.recipient.value;
                    };
                }
                y++;
            }
        }
        this.table.parse();
    };

    MsgBar.prototype.append = function() {

        var sendButton = W.addButton(this.bodyDiv);
        var stubButton = W.addButton(this.bodyDiv, 'stub', 'Add Stub');

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

        this.bodyDiv.appendChild(this.table.table);
    };

    MsgBar.prototype.listeners = function() {
        var that = this;
        node.on.plist( function(msg) {
            W.populateRecipientSelector(that.recipient, msg.data);

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
        W.getElementById(this.id + '_from').value =
            (node.player) ? node.player.id : 'undefined';
        W.getElementById(this.id + '_to').value = this.recipient.value;
        W.getElementById(this.id + '_forward').value = 0;
        W.getElementById(this.id + '_reliable').value = 1;
        W.getElementById(this.id + '_priority').value = 0;

        if (node.socket && node.socket.session) {
            W.getElementById(this.id + '_session').value = node.socket.session;
        }

        W.getElementById(this.id + '_stage').value =
            new GameStage(node.player.stage);
        W.getElementById(this.id + '_action').value = this.actionSel.value;
        W.getElementById(this.id + '_target').value = this.targetSel.value;

    };

})(node);
