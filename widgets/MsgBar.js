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
        JSUS = node.JSUS,
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
        var that;
        that = this;

        // Create fields.

        // To:
        this.table.add('to', 0, 0);
        this.table.add(W.getTextInput(this.id + '_to'), 1, 0);
        this.recipient =
            W.getRecipientSelector(this.id + '_recipients');
        this.table.add(this.recipient, 2, 0);
        this.recipient.onchange = function() {
            W.getElementById(that.id + '_to').value =
                that.recipient.value;
        };

        // Action:
        this.table.add('action', 0, 1);
        this.table.add(W.getTextInput(this.id + '_action'), 1, 1);
        this.actionSel = W.getActionSelector(this.id + '_actions');
        this.table.add(this.actionSel, 2, 1);
        this.actionSel.onchange = function() {
            W.getElementById(that.id + '_action').value =
                that.actionSel.value;
        };

        // Target:
        this.table.add('target', 0, 2);
        this.table.add(W.getTextInput(this.id + '_target'), 1, 2);
        this.targetSel = W.getTargetSelector(this.id + '_targets');
        this.table.add(this.targetSel, 2, 2);
        this.targetSel.onchange = function() {
            W.getElementById(that.id + '_target').value =
                that.targetSel.value;
        };

        // Text:
        this.table.add('text', 0, 3);
        this.table.add(W.getTextInput(this.id + '_text'), 1, 3);

        // Data:
        this.table.add('data', 0, 4);
        this.table.add(W.getTextInput(this.id + '_data'), 1, 4);


        // TODO: Hide the following fields.
        // From:
        this.table.add('from', 0, 5);
        this.table.add(W.getTextInput(this.id + '_from'), 1, 5);

        // Priority:
        this.table.add('priority', 0, 6);
        this.table.add(W.getTextInput(this.id + '_priority'), 1, 6);

        // Reliable:
        this.table.add('reliable', 0, 7);
        this.table.add(W.getTextInput(this.id + '_reliable'), 1, 7);

        // Forward:
        this.table.add('forward', 0, 8);
        this.table.add(W.getTextInput(this.id + '_forward'), 1, 8);

        // Session:
        this.table.add('session', 0, 9);
        this.table.add(W.getTextInput(this.id + '_session'), 1, 9);

        // Stage:
        this.table.add('stage', 0, 10);
        this.table.add(W.getTextInput(this.id + '_stage'), 1, 10);

        // Created:
        this.table.add('created', 0, 11);
        this.table.add(W.getTextInput(this.id + '_created'), 1, 11);

        // Id:
        this.table.add('id', 0, 12);
        this.table.add(W.getTextInput(this.id + '_id'), 1, 12);


        this.table.parse();
    };

    MsgBar.prototype.append = function() {
        var sendButton;
        var that;

        that = this;

        this.bodyDiv.appendChild(this.table.table);

        sendButton = W.addButton(this.bodyDiv);
        sendButton.onclick = function() {
            var msg = that.parse();

            if (msg) {
                node.socket.send(msg);
                //console.log(msg.stringify());
            }
        };
    };

    MsgBar.prototype.listeners = function() {
    };

    MsgBar.prototype.parse = function() {
        var msg, that, key, value, gameMsg, invalid;

        msg = {};
        that = this;
        key = null;
        value = null;
        invalid = false;

        this.table.forEach( function(e) {
            if (invalid) return;

            if (e.x === 0) {
                key = e.content;
                msg[key] = '';
            }
            else if (e.x === 1) {

                value = e.content.value;
                if (key === 'stage' || key === 'to' || key === 'data') {
                    try {
                        value = JSUS.parse(e.content.value);
                    }
                    catch (ex) {
                        value = e.content.value;
                    }
                }

                if (key === 'to' && 'number' === typeof value) {
                    value = '' + value;
                }

                // Validate input.
                if (key === 'to' &&
                    ((!JSUS.isArray(value) && 'string' !== typeof value) ||
                      value.trim() === '')) {

                    alert('Invalid "to" field');
                    invalid = true;
                }

                if (key === 'action' && value.trim() === '') {
                    alert('Missing "action" field');
                    invalid = true;
                }

                if (key === 'target' && value.trim() === '') {
                    alert('Missing "target" field');
                    invalid = true;
                }

                msg[key] = value;
            }
        });

        if (invalid) return null;
        gameMsg = node.msg.create(msg);
        node.info(gameMsg, 'MsgBar sent: ');
        return gameMsg;
    };

})(node);
