/**
 * # Chat
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * // TODO: add is...typing
 * // TODO: add bootstrap badge to count msg when collapsed
 * // TODO: check on data if message comes back
 * // TODO: add proper inline doc
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var NDDB =  node.NDDB;

    node.widgets.register('Chat', Chat);

    // ## Texts.

    Chat.texts = {
        outgoing: function(w, data) {
            return data.msg;
            // return '<span class="chat_msg_me">' + data.msg + '</span>';
        },
        incoming: function(w, data) {
            var str;
            str = '<span>';
            if (w.recipientsIds.length > 1) {
                str += '<span class="chat_id_other">' +
                    (w.senderToNameMap[data.id] || data.id) + '</span>: ';
            }
            str += data.msg + '</span>';
            return str;
        },
        quit: function(w, data) {
            return (w.senderToNameMap[data.id] || data.id) + ' left the chat';
        },
        noMoreParticipants: function(w, data) {
            return 'No active participant left. Chat disabled.';
        },
        // For both collapse and uncollapse.
        collapse: function(w, data) {
            return (w.senderToNameMap[data.id] || data.id) + ' ' +
                (data.collapsed ? 'mini' : 'maxi') + 'mized the chat';
        },
        textareaPlaceholder: function(w) {
            return w.useSubmitButton ? 'Type something' :
                'Type something and press enter to send';
        },
        submitButton: 'Send'
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

    /**
     * ## Chat constructor
     *
     * `Chat` is a simple configurable chat
     *
     * @see Chat.init
     */
    function Chat() {

        /**
         * ### Chat.chatEvent
         *
         * The suffix used to fire chat events
         *
         * Default: 'CHAT'
         */
        this.chatEvent = null;

        /**
         * ### Chat.stats
         *
         * Some basic statistics about message counts
         */
        this.stats = {
            received: 0,
            sent: 0,
            unread: 0
        };

        /**
         * ### Chat.submitButton
         *
         * Button to send a text to server
         *
         * @see Chat.useSubmitButton
         */
        this.submitButton = null;

        /**
         * ### Chat.useSubmitButton
         *
         * If TRUE, a button is added to send messages else ENTER sends msgs
         *
         * By default, this is TRUE on mobile devices.
         *
         * @see Chat.submitButton
         * @see Chat.receiverOnly
         */
        this.useSubmitButton = null;

        /**
         * ### Chat.receiverOnly
         *
         * If TRUE, users cannot send messages (no textarea and submit button)
         *
         * @see Chat.textarea
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
         * ### Chat.initialMsg
         *
         * An object with an initial msg and the id of sender (if not self)
         *
         * Example:
         *
         * ```
         * {
         *   id: '1234', // Optional, add only this is an 'incoming' msg.
         *   msg: 'the text'
         * }
         */
        this.initialMsg = null;

        /**
         * ### Chat.recipientsIds
         *
         * Array of ids of current recipients of messages
         */
        this.recipientsIds = null;

        /**
         * ### Chat.recipientsIdsQuitted
         *
         * Array of ids of  recipients that have previously quitted the chat
         */
        this.recipientsIdsQuitted = null;

        /**
         * ### Chat.senderToNameMap
         *
         * Map sender id (msg.from) to display name
         *
         * Note: The 'from' field of a message can be different
         * from the 'to' field of its reply (e.g., for MONITOR)
         */
        this.senderToNameMap = null;

        /**
         * ### Chat.recipientToNameMap
         *
         * Map recipient id (msg.to) to display name
         */
        this.recipientToNameMap = null;

        /**
         * ### Chat.senderToRecipientMap
         *
         * Map sender id (msg.from) to recipient id (msg.to)
         */
        this.senderToRecipientMap = null;

        /**
         * ### Chat.recipientToSenderMap
         *
         * Map recipient id (msg.to) to sender id (msg.from)
         */
        this.recipientToSenderMap = null;
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
     *   - `chatEvent`: The event to fire when sending/receiving a message
     */
    Chat.prototype.init = function(options) {
        var tmp, i, rec, sender, that;
        options = options || {};
        that = this;

        // Chat id.
        tmp = options.chatEvent;
        if (tmp) {
            if ('string' !== typeof tmp) {
                throw new TypeError('Chat.init: chatEvent must be a non-' +
                                    'empty string or undefined. Found: ' + tmp);
            }
            this.chatEvent = options.chatEvent;
        }
        else {
            this.chatEvent = 'CHAT';
        }

        // Store.
        this.storeMsgs = !!options.storeMsgs;
        if (this.storeMsgs) {
            if (!this.db) this.db = new NDDB();
        }

        // Button or send on Enter?.
        this.useSubmitButton = 'undefined' === typeof options.useSubmitButton ?
            J.isMobileAgent() : !!options.useSubmitButton;

        // Participants.
        tmp = options.participants;
        if (!J.isArray(tmp) || !tmp.length) {
            throw new TypeError('Chat.init: participants must be ' +
                                'a non-empty array. Found: ' + tmp);
        }

        // Build maps.
        this.recipientsIds = new Array(tmp.length);
        this.recipientsIdsQuitted = [];
        this.recipientToSenderMap = {};
        this.recipientToNameMap = {};
        this.senderToNameMap = {};
        this.senderToRecipientMap = {};

        for (i = 0; i < tmp.length; i++) {
            // Everything i the same if string.
            if ('string' === typeof tmp[i]) {
                this.recipientsIds[i] = tmp[i];
                this.recipientToNameMap[tmp[i]] = tmp[i];
                this.recipientToSenderMap[tmp[i]] = tmp[i];
                this.senderToRecipientMap[tmp[i]] = tmp[i];
                this.senderToNameMap[tmp[i]] = tmp[i];
            }
            // Sender may be different from receiver if object.
            else if ('object' === typeof tmp[i]) {
                rec = tmp[i].recipient;
                sender = tmp[i].sender;
                this.recipientsIds[i] = rec;
                this.recipientToSenderMap[rec] = sender || rec;
                this.recipientToNameMap[rec] = tmp[i].name || rec;
                this.senderToRecipientMap[sender] = rec;
                this.senderToNameMap[sender] = this.recipientToNameMap[rec];
            }
            else {
                throw new TypeError('Chat.init: participants array must ' +
                                    'contain string or object. Found: ' +
                                    tmp[i]);
            }
        }

        // Other.
        this.uncollapseOnMsg = options.uncollapseOnMsg || false;

        this.printStartTime = options.printStartTime || false;
        this.printNames = options.printNames || false;

        if (options.initialMsg) {
            if ('object' !== typeof options.initialMsg) {
                throw new TypeError('Chat.init: initialMsg must be ' +
                                    'object or undefined. Found: ' +
                                    options.initialMsg);
            }
            this.initialMsg = options.initialMsg;
        }

        this.on('uncollapsed', function() {
            // Make sure that we do not have the title highlighted any more.
            that.setTitle(that.title);
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_COLLAPSE',
                         that.recipientsIds, false);
            }
        });

        this.on('collapsed', function() {
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_COLLAPSE',
                         that.recipientsIds, true);
            }
        });

        this.on('destroyed', function() {
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_QUIT', that.recipientsIds);
            }
        });
    };


    Chat.prototype.append = function() {
        var that, inputGroup, initialText;

        this.chatDiv = W.get('div', { className: 'chat_chat' });
        this.bodyDiv.appendChild(this.chatDiv);

        if (!this.receiverOnly) {
            that = this;

            // Input group.
            inputGroup = document.createElement('div');
            inputGroup.className = 'chat_inputgroup';

            this.textarea = W.get('textarea', {
                className: 'chat_textarea form-control',
                placeholder: this.getText('textareaPlaceholder')
            });
            inputGroup.appendChild(this.textarea);

            if (this.useSubmitButton) {
                this.submitButton = W.get('button', {
                    className: 'btn-sm btn-info form-control chat_submit',
                    innerHTML: this.getText('submitButton')
                });
                this.submitButton.onclick = function() {
                    sendMsg(that);
                };
                inputGroup.appendChild(this.submitButton);
            }
            else {
                this.textarea.onkeydown = function(e) {
                    e = e || window.event;
                    if ((e.keyCode || e.which) === 13) sendMsg(that);
                };
            }

            this.bodyDiv.appendChild(inputGroup);
        }

        if (this.printStartTime) {
            W.add('div', this.chatDiv, {
                innerHTML: Date(J.getDate()),
                className: 'chat_event'
            });
            initialText = true;
        }

        if (this.printNames) {
            W.add('div', this.chatDiv, {
                className: 'chat_event',
                innerHTML: 'Participants: ' +
                    J.keys(this.senderToNameMap).join(', ')
            });
            initialText = true;
        }

        if (initialText) {
            W.add('div', this.chatDiv, {
                className: 'chat_event',
                innerHTML: '&nbsp;'
            });
        }

        if (this.initialMsg) {
            this.writeMsg(this.initialMsg.id ? 'incoming' : 'outgoing',
                          this.initialMsg);
        }
    };

    Chat.prototype.readTextarea = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt.trim();
    };

    Chat.prototype.writeMsg = function(code, data) {
        var c;
        c = (code === 'incoming' || code === 'outgoing') ? code : 'event';
        W.add('div', this.chatDiv, {
            innerHTML: this.getText(code, data),
            className: 'chat_msg chat_msg_' + c
        });
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
            var i, len, rec;
            if (!that.handleMsg(msg)) return;
            that.writeMsg('quit', { id: msg.from });
            len = that.recipientsIds.length;
            for ( i = 0 ; i < len ; i++) {
                if (that.recipientsIds[i] ===
                    that.senderToRecipientMap[msg.from]) {

                    rec = that.recipientsIds.splice(i, 1);
                    that.recipientsIdsQuitted.push(rec);

                    if (that.recipientsIds.length === 0) {
                        that.writeMsg('noMoreParticipants');
                        that.disable();
                    }
                    break;
                }
            }
            node.warn('Chat: participant quitted not found: ' + msg.from);
        });

        node.on.data(this.chatEvent + '_COLLAPSE', function(msg) {
            if (!that.handleMsg(msg)) return;
            that.writeMsg('collapse', { id: msg.from, collapsed: msg.data});
        });
    };


    Chat.prototype.handleMsg = function(msg) {
        var from, args;
        from = msg.from;
        if (from === node.player.id || from === node.player.sid) {
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

    Chat.prototype.disable = function() {
        if (this.submitButton) this.submitButton.disabled = true;
        this.textarea.disabled = true;
        this.disabled = true;
    };

    Chat.prototype.enable = function() {
        if (this.submitButton) this.submitButton.disabled = false;
        this.textarea.disabled = false;
        this.disabled = false;
    };

    Chat.prototype.getValues = function() {
        var out;
        out = {
            participants: this.participants,
            totSent: this.stats.sent,
            totReceived: this.stats.received,
            totUnread: this.stats.unread,
            initialMsg: this.initialMsg
        };
        if (this.db) out.msgs = db.fetch();
        return out;
    };

    // ## Helper functions.

    // ### sendMsg
    // Reads the textarea and delivers the msg to the server.
    function sendMsg(that) {
        var msg, to, ids;

        // No msg sent.
        if (that.isDisabled()) return;

        msg = that.readTextarea();

        // Move cursor at the beginning.
        if (msg === '') {
            node.warn('Chat: message has no text, not sent.');
            return;
        }
        // Simplify things, if there is only one recipient.
        ids = that.recipientsIds;
        if (ids.length === 0) {
            node.warn('Chat: empty recipient list, message not sent.');
            return;
        }
        to = ids.length === 1 ? ids[0] : ids;
        that.writeMsg('outgoing', { msg: msg }); // to not used now.
        node.say(that.chatEvent, to, msg);
        // Make sure the cursor goes back to top.
        setTimeout(function() { that.textarea.value = ''; });
    }

})(node);
