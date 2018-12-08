/**
 * # Chat
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * // TODO: add is...typing
 * // TODO: add bootstrap badge to count msg when collapsed
 * // TODO: fix the recipient
 * // TODO: check on data if message comes back
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var NDDB =  node.NDDB;

    node.widgets.register('Chat', Chat);

    // ## Texts.

    Chat.texts = {
        me: 'Me',
        outgoing: function(w, data) {
            // Id might be defined as a specific to (not used now).
            return '<span class="chat_me">' +
                w.getText('me') +
                '</span>: </span class="chat_msg">' + data.msg + '</span>';
        },
        incoming: function(w, data) {
            return '<span class="chat_others">' +
                privateData[w.wid].recipientsMap[data.id] +
                '</span>: </span class="chat_msg">' + data.msg + '</span>';
        },
        quit: function(w, data) {
            return privateData[w.wid].recipientsMap[data.id] +
                ' quit the chat';
        }
    };

    // ## Meta-data

    Chat.version = '1.0.0';
    Chat.description = 'Offers a uni-/bi-directional communication interface ' +
        'between players, or between players and the server.';

    Chat.title = 'Chat';
    Chat.className = 'chat';

    // ## Dependencies

    Chat.dependencies = {
        JSUS: {}
    };

    // Keep the ids of the recipients secret.
    var privateData = {};

    /**
     * ## Chat constructor
     *
     * `Chat` is a simple configurable chat
     *
     * @see Chat.init
     */
    function Chat() {

        /**
         * ### Chat.stats
         *
         * Some basic statistics about message counts
         *
         * @see Chat.submit
         */
        this.stats = {
            received: 0,
            sent: 0,
            unread: 0
        };

        /**
         * ### Chat.receiverOnly
         *
         * If TRUE, users cannot send messages (no submit and textarea)
         *
         * @see Chat.submit
         */
        this.receiverOnly = false;

        /**
         * ### Chat.storeMsgs
         *
         * If TRUE, a copy of sent and received messages is stored in db
         *
         * @see Chat.db
         */
        this.storeMsgs = false;

        /**
         * ### Chat.db
         *
         * An NDDB database for storing incoming and outgoing messages
         *
         * @see Chat.storeMsgs
         */
        this.db = null;

        /**
         * ### Chat.chatDiv
         *
         * The DIV wherein to display the chat
         */
        this.chatDiv = null;

        /**
         * ### Chat.textarea
         *
         * The textarea wherein to write and read
         */
        this.textarea = null;

        /**
         * ### Chat.submit
         *
         * The submit button
         */
        this.submit = null;

        /**
         * ### Chat.submitText
         *
         * The text on the submit button
         */
        this.submitText = null;

        /**
         * ### Chat.chatEvent
         *
         * The event fired a chat message is received
         */
        this.chatEvent = null;

       // /**
       //  * ### Chat.recipientsNames
       //  *
       //  * Array containing names of the recipient/s of the message
       //  */
       // this.recipientsNames = [];
    }

    // ## Chat methods

    /**
     * ### Chat.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - `receiverOnly`: If TRUE, no message can be sent
     *   - `submitText`: The text of the submit button
     *   - `chatEvent`: The event to fire when sending a message
     *   - `displayName`: Function which displays the sender's name
     */
    Chat.prototype.init = function(options) {
        var tmp, i, pd;
        options = options || {};

        pd = privateData[this.wid] = {
            recipientsIds: [],
            recipientsMap: {}
        };

        // Store.
        this.storeMsgs = !!options.storeMsgs;
        if (this.storeMsgs) {
            if (!this.db) this.db = new NDDB();
        }

        // Recipients.
        tmp = options.recipients;
        if (!J.isArray(tmp) || !tmp.length) {
            throw new TypeError('Chat.init: recipients must be ' +
                                'a non-empty array. Found: ' + tmp);
        }

        // Set private variable.
        pd.recipientsIds = tmp;
        if (options.recipientsNames) {
            tmp = options.recipientsNames;
            if (!J.isArray(tmp)) {

                throw new TypeError('Chat.init: recipientsNames must be ' +
                                'array or undefined. Found: ' + tmp);

            }
            if (tmp.length !== pd.recipientsIds.length) {
                throw new TypeError('Chat.init: recipientsNames size must ' +
                                    'equal the number of ids');
            }
            this.recipientsNames = tmp;
        }
        else {
            this.recipientsNames = pd.recipientsIds;
        }
        // Build map.
        for (i = 0; i < tmp.length; i++) {
            pd.recipientsMap[pd.recipientsIds[i]] = this.recipientsNames[i];
        }


        // Other.
        this.uncollapseOnMsg = options.uncollapseOnMsg || false;
        this.chatEvent = options.chatEvent || 'CHAT';
        this.submitText = options.submitText || 'chat';
    };


    Chat.prototype.append = function() {
        var that;
        var inputGroup, span, ids;

        this.chatDiv = W.get('div', { className: 'chat_chat' });
        this.bodyDiv.appendChild(this.chatDiv);

        if (!this.receiverOnly) {
            that = this;

            // Input group.
            inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';
            // Span group.
            span = document.createElement('span');
            span.className = 'input-group-btn';

            this.textarea = W.get('textarea', {
                className: 'chat_textarea form-control'
            });

            // Create buttons to send messages, if allowed.
            this.submit = W.get('button', {
                innerHTML: this.submitText,
                // className: 'btn btn-sm btn-secondary'
                className: 'btn btn-default chat_submit'
            });

            ids = privateData[this.wid].recipientsIds;
            this.submit.onclick = function() {
                var msg, to;
                msg = that.readTextarea();
                if (msg === '') {
                    node.warn('no text, no chat message sent.');
                    return;
                };
                // Simplify things, if there is only one recipient.
                to = ids.length === 1 ? ids[0] : ids;
                that.writeMsg('outgoing', { msg: msg }); // to not used now.
                node.say(that.chatEvent, to, msg);
            };

            inputGroup.appendChild(this.textarea);
            span.appendChild(this.submit);
            inputGroup.appendChild(span);
            this.bodyDiv.appendChild(inputGroup);
        }
    };

    Chat.prototype.readTextarea = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt.trim();
    };

    Chat.prototype.writeMsg = function(code, data) {
        W.add('span', this.chatDiv, { innerHTML: this.getText(code, data) });
        W.writeln('', this.chatDiv);
        this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        node.on.data(this.chatEvent, function(msg) {
            if (!that.handleMsg(msg)) return;
            that.stats.received++;
            // Store message if so requested.
            if (that.storeMsgs) {
                that.db.insert({
                    from: msg.from,
                    text: msg.data,
                    time: node.timer.getTimeSince('step'),
                    timestamp: J.now()
                });
            }
            that.writeMsg('incoming', { msg: msg.data, id: msg.from });
        });

        node.on.data(this.chatEvent + '_QUIT', function(msg) {
            if (!that.handleMsg(msg)) return;
            that.writeMsg('quit', { id: msg.from });
        });
    };

    Chat.prototype.handleMsg = function(msg) {
        var from, args;
        if (msg.from === node.player.id || msg.from === node.player.sid) {
            node.warn('Chat: your own message came back: ' + msg.id);
            return false;
        }
        if (this.isCollapsed()) {
            if (this.uncollapseOnMsg) {
                this.uncollapse();
            }
            else {
                // TODO: highlight better. Play sound?
                this.setTitle('<strong>' + this.title + '</strong>');
                this.stats.unread++;
            }
        }
        return true;
    };

    Chat.prototype.destroy = function() {
        node.say(this.chatEvent + '_QUIT', privateData[this.wid].recipientsIds);
        // Remove private data.
        privateData[this.wid] = null;
    };

    Chat.prototype.getValues = function() {
        var out;
        out = {
            names: this.recipientsNames,
            totSent: this.stats.sent,
            totReceived: this.stats.received,
            totUnread: this.stats.unread
        };
        if (this.db) out.msgs = db.fetch();
        return out;
    };

})(node);
