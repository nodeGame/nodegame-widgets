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
        this.tableAdvanced = new Table();

        this.init();
    }

    // TODO: Write a proper INIT method
    MsgBar.prototype.init = function() {
        var that;
        var fields, i, field;
        var table;

        that = this;

        // Create fields.
        // TODO: separate table for fields following 'data'
        fields = ['to', 'action', 'target', 'text', 'data', 'from', 'priority',
                  'reliable', 'forward', 'session', 'stage', 'created', 'id'];

        for (i = 0; i < fields.length; ++i) {
            field = fields[i];

            // Put TO, ACTION, TARGET, TEXT, DATA in the first table which is
            // always visible, the other fields in the "advanced" table which
            // is hidden by default.
            table = i < 5 ? this.table : this.tableAdvanced;

            table.add(field, i, 0);
            table.add(W.getTextInput(this.id + '_' + field, {tabindex: i+1}), i, 1);

            if (field === 'to') {
                this.recipient =
                    W.getRecipientSelector(this.id + '_recipients');
                W.addAttributes2Elem(this.recipient,
                        {tabindex: fields.length+1});
                table.add(this.recipient, i, 2);
                this.recipient.onchange = function() {
                    W.getElementById(that.id + '_to').value =
                        that.recipient.value;
                };
            }
            else if (field === 'action') {
                this.actionSel = W.getActionSelector(this.id + '_actions');
                W.addAttributes2Elem(this.actionSel,
                        {tabindex: fields.length+2});
                table.add(this.actionSel, i, 2);
                this.actionSel.onchange = function() {
                    W.getElementById(that.id + '_action').value =
                        that.actionSel.value;
                };
            }
            else if (field === 'target') {
                this.targetSel = W.getTargetSelector(this.id + '_targets');
                W.addAttributes2Elem(this.targetSel,
                        {tabindex: fields.length+3});
                table.add(this.targetSel, i, 2);
                this.targetSel.onchange = function() {
                    W.getElementById(that.id + '_target').value =
                        that.targetSel.value;
                };
            }
        }

        this.table.parse();
        this.tableAdvanced.parse();
    };

    MsgBar.prototype.append = function() {
        var advButton;
        var sendButton;
        var that;

        that = this;

        // Show table of basic fields.
        this.bodyDiv.appendChild(this.table.table);

        this.bodyDiv.appendChild(this.tableAdvanced.table);
        this.tableAdvanced.table.style.display = 'none';

        // Show 'Send' button.
        sendButton = W.addButton(this.bodyDiv);
        sendButton.onclick = function() {
            var msg = that.parse();

            if (msg) {
                node.socket.send(msg);
            }
        };

        // Show a button that expands the table of advanced fields.
        advButton = W.addButton(this.bodyDiv, undefined, 'Toggle advanced options');
        advButton.onclick = function() {
            that.tableAdvanced.table.style.display =
                that.tableAdvanced.table.style.display === '' ? 'none' : '';
        };
    };

    MsgBar.prototype.listeners = function() {
    };

    MsgBar.prototype.parse = function() {
        var msg, that, key, value, gameMsg, invalid;
        var tableFunction;

        msg = {};
        that = this;
        key = null;
        value = null;
        invalid = false;

        tableFunction = function(e) {
            if (invalid) return;

            if (e.y === 0) {
                key = e.content;
                msg[key] = '';
            }
            else if (e.y === 1) {

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
        };

        this.table.forEach(tableFunction);
        this.tableAdvanced.forEach(tableFunction);

        if (invalid) return null;
        gameMsg = node.msg.create(msg);
        node.info(gameMsg, 'MsgBar sent: ');
        return gameMsg;
    };

})(node);
