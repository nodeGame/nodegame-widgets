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
        this.table.add(W.getTextInput(this.id + '_to'), 0, 1);
        this.recipient =
            W.getRecipientSelector(this.id + '_recipients');
        this.table.add(this.recipient, 0, 2);
        this.recipient.onchange = function() {
            W.getElementById(that.id + '_to').value =
                that.recipient.value;
        };

        // Action:
        this.table.add('action', 1, 0);
        this.table.add(W.getTextInput(this.id + '_action'), 1, 1);
        this.actionSel = W.getActionSelector(this.id + '_actions');
        this.table.add(this.actionSel, 1, 2);
        this.actionSel.onchange = function() {
            W.getElementById(that.id + '_action').value =
                that.actionSel.value;
        };

        // Target:
        this.table.add('target', 2, 0);
        this.table.add(W.getTextInput(this.id + '_target'), 2, 1);
        this.targetSel = W.getTargetSelector(this.id + '_targets');
        this.table.add(this.targetSel, 2, 2);
        this.targetSel.onchange = function() {
            W.getElementById(that.id + '_target').value =
                that.targetSel.value;
        };

        // Text:
        this.table.add('text', 3, 0);
        this.table.add(W.getTextInput(this.id + '_text'), 3, 1);

        // Data:
        this.table.add('data', 4, 0);
        this.table.add(W.getTextInput(this.id + '_data'), 4, 1);


        // TODO: Hide the following fields.
        // From:
        this.table.add('from', 5, 0);
        this.table.add(W.getTextInput(this.id + '_from'), 5, 1);

        // Priority:
        this.table.add('priority', 6, 0);
        this.table.add(W.getTextInput(this.id + '_priority'), 6, 1);

        // Reliable:
        this.table.add('reliable', 7, 0);
        this.table.add(W.getTextInput(this.id + '_reliable'), 7, 1);

        // Forward:
        this.table.add('forward', 8, 0);
        this.table.add(W.getTextInput(this.id + '_forward'), 8, 1);

        // Session:
        this.table.add('session', 9, 0);
        this.table.add(W.getTextInput(this.id + '_session'), 9, 1);

        // Stage:
        this.table.add('stage', 10, 0);
        this.table.add(W.getTextInput(this.id + '_stage'), 10, 1);

        // Created:
        this.table.add('created', 11, 0);
        this.table.add(W.getTextInput(this.id + '_created'), 11, 1);

        // Id:
        this.table.add('id', 12, 0);
        this.table.add(W.getTextInput(this.id + '_id'), 12, 1);


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
