/**
 * # MsgBar
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a tool for sending messages to other connected clients
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS,
        Table = W.Table;

    node.widgets.register('MsgBar', MsgBar);

    // ## Meta-data

    MsgBar.version = '0.7.0';
    MsgBar.description = 'Send a nodeGame message to players';

    MsgBar.title = 'Send MSG';
    MsgBar.className = 'msgbar';

    function MsgBar() {
        this.recipient = null;
        this.actionSel = null;
        this.targetSel = null;

        this.table = null;
        this.tableAdvanced = null;
    }

    MsgBar.prototype.init = function() {
        this.id = this.id || MsgBar.className;
    };

    MsgBar.prototype.append = function() {
        var advButton, sendButton;
        var fields, i, field;
        var table;
        var that;

        that = this;

        this.table = new Table();
        this.tableAdvanced = new Table();

        // Create fields.
        fields = ['to', 'action', 'target', 'text', 'data', 'from', 'priority',
                  'reliable', 'forward', 'session', 'stage', 'created', 'id'];

        for (i = 0; i < fields.length; ++i) {
            field = fields[i];

            // Put TO, ACTION, TARGET, TEXT, DATA in the first table which is
            // always visible, the other fields in the "advanced" table which
            // is hidden by default.
            table = i < 5 ? this.table : this.tableAdvanced;

            table.add(field, i, 0);
            table.add(W.getTextInput(this.id + '_' + field, {tabindex: i+1}),
                                     i, 1);

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

        // Show table of basic fields.
        this.bodyDiv.appendChild(this.table.table);

        this.bodyDiv.appendChild(this.tableAdvanced.table);
        this.tableAdvanced.table.style.display = 'none';

        // Show 'Send' button.
        sendButton = W.addButton(this.bodyDiv);
        sendButton.onclick = function() {
            var msg;
            msg = that.parse();
            if (msg) node.socket.send(msg);
        };

        // Show a button that expands the table of advanced fields.
        advButton =
            W.addButton(this.bodyDiv, undefined, 'Toggle advanced options');
        advButton.onclick = function() {
            that.tableAdvanced.table.style.display =
                that.tableAdvanced.table.style.display === '' ? 'none' : '';
        };

        this.table.parse();
        this.tableAdvanced.parse();
    };

    MsgBar.prototype.parse = function() {
        var msg, gameMsg;

        msg = {};

        this.table.forEach(validateTableMsg, msg);
        if (msg._invalid) return null;
        this.tableAdvanced.forEach(validateTableMsg, msg);
        if (msg._invalid) return null;
        delete msg._lastKey;
        delete msg._invalid;
        gameMsg = node.msg.create(msg);
        node.info('MsgBar msg created. ' +  gameMsg.toSMS());
        return gameMsg;
    };


    // # Helper Function.

    function validateTableMsg(e, msg) {
        var key, value;

        if (msg._invalid) return;

        if (e.y === 2) return;

        if (e.y === 0) {
            // Saving the value of last key.
            msg._lastKey =  e.content;
            return;
        }

        // Fetching the value of last key.
        key = msg._lastKey;
        value = e.content.value;

        if (key === 'stage' || key === 'to' || key === 'data') {
            try {
                value = JSUS.parse(e.content.value);
            }
            catch (ex) {
                value = e.content.value;
            }
        }

        // Validate input.
        if (key === 'to') {
            if ('number' === typeof value) {
                value = '' + value;
            }

            if ((!JSUS.isArray(value) && 'string' !== typeof value) ||
                ('string' === typeof value && value.trim() === '')) {

                alert('Invalid "to" field');
                msg._invalid = true;
            }
        }

        else if (key === 'action') {
            if (value.trim() === '') {
                alert('Missing "action" field');
                msg._invalid = true;
            }
            else {
                value = value.toLowerCase();
            }

        }

        else if (key === 'target') {
            if (value.trim() === '') {
                alert('Missing "target" field');
                msg._invalid = true;
            }
            else {
                value = value.toUpperCase();
            }
        }

        // Assigning the value.
        msg[key] = value;
    }

})(node);
