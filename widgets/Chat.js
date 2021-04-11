/**
 * # Chat
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * // TODO: add bootstrap badge to count msg when collapsed
 * // TODO: check on data if message comes back
 * // TODO: highlight better incoming msg. Play sound?
 * // TODO: removeParticipant and addParticipant methods.
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
        noMoreParticipants: function() {
            return 'No active participant left. Chat disabled.';
        },
        // For both collapse and uncollapse.
        collapse: function(w, data) {
            return (w.senderToNameMap[data.id] || data.id) + ' ' +
                (data.collapsed ? 'mini' : 'maxi') + 'mized the chat';
        },
        textareaPlaceholder: function(w) {
            return w.useSubmitEnter ?
                'Type something and press enter to send' : 'Type something';
        },
        submitButton: 'Send',
        isTyping: 'is typing...'
    };

    // ## Meta-data

    Chat.version = '1.5.0';
    Chat.description = 'Offers a uni-/bi-directional communication interface ' +
        'between players, or between players and the server.';

    Chat.title = 'Chat';
    Chat.className = 'chat';

    Chat.panel = false;

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
         * If TRUE, a button is added to send messages
         *
         * By default, this is TRUE on mobile devices.
         *
         * @see Chat.submitButton
         * @see Chat.receiverOnly
         */
        this.useSubmitButton = null;

        /**
         * ### Chat.useSubmitButton
         *
         * If TRUE, pressing ENTER sends the msg
         *
         * By default, TRUE
         *
         * @see Chat.submitButton
         * @see Chat.receiverOnly
         */
        this.useSubmitEnter = null;

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

        /**
         * ### Chat.showIsTyping
         *
         * TRUE, if "is typing" notice is shown
         */
        this.showIsTyping = null;

        /**
         * ### Chat.amTypingTimeout
         *
         * Timeout to send an own "isTyping" notification
         *
         * Timeout is added as soon as the user start typing, cleared when
         * a message is sent.
         */
        this.amTypingTimeout = null;

        /**
         * ### Chat.isTypingTimeouts
         *
         * Object containing timeouts for all participants currently typing
         *
         * A new timeout is added when an IS_TYPING msg is received and
         * cleared when a msg arrives or at expiration.
         */
        this.isTypingTimeouts = {};

        /**
         * ### Chat.isTypingDivs
         *
         * Object containing divs where "is typing" is diplayed
         *
         * Once created
         */
        this.isTypingDivs = {};

        /**
         * ### Chat.preprocessMsg
         *
         * A function that process the msg before being displayed
         *
         * It does not preprocess the initial message
         * and "is typing" notifications.
         *
         * Example:
         *
         * ```js
         * function(data, code) {
         *     data.msg += '!';
         * }
         * ```
         */
        this.preprocessMsg = null;

    }

    // ## Chat methods

    /**
     * ### Chat.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     *
     * The options object can have the following attributes:
     *   - `receiverOnly`: If TRUE, no message can be sent
     *   - `chatEvent`: The event to fire when sending/receiving a message
     *   - `useSubmitButton`: If TRUE, a submit button is added.
     *        Default: TRUE on mobile
     *   - `useSubmitEnter`: If TRUE, pressing ENTER sends a msg.
     *        Default: TRUE
     *   - `showIsTyping: If TRUE, a notice is displayed when users are
     *        typing. Default: TRUE
     *   - `storeMsgs`: If TRUE, a copy of every message is stored in
     *        a local db
     *   - `participants`: An array containing the ids of participants,
     *        cannot be empty
     *   - `initialMsg`: Initial message to be displayed as soon as the chat
     *        is opened.
     *   - `uncollapseOnMsg`: If TRUE, a minimized chat will automatically
     *        open when receiving a msg. Default: FALSE.
     *   - `printStartTime`: If TRUE, the initial time of the chat is
     *        printed at the beginning of the chat. Default: FALSE.
     *   - `printNames`: If TRUE, the names of the participants of the chat
     *        is printed at the beginning of the chat. Default: FALSE.
     */
    Chat.prototype.init = function(opts) {
        var tmp, i, rec, sender, that;
        opts = opts || {};
        that = this;

        // Receiver Only.
        this.receiverOnly = !!opts.receiverOnly;

        tmp = opts.preprocessMsg;
        if ('function' === typeof tmp) {
            this.preprocessMsg = tmp;
        }
        else if (tmp) {
            throw new TypeError('Chat.init: preprocessMsg must be function ' +
                                'or undefined. Found: ' + tmp);
        }

        // Chat id.
        tmp = opts.chatEvent;
        if (tmp) {
            if ('string' !== typeof tmp) {
                throw new TypeError('Chat.init: chatEvent must be a non-' +
                                    'empty string or undefined. Found: ' + tmp);
            }
            this.chatEvent = opts.chatEvent;
        }
        else {
            this.chatEvent = 'CHAT';
        }

        // Store.
        this.storeMsgs = !!opts.storeMsgs;
        if (this.storeMsgs) {
            if (!this.db) this.db = new NDDB();
        }

        // Button to send msg.
        this.useSubmitButton = 'undefined' === typeof opts.useSubmitButton ?
            J.isMobileAgent() : !!opts.useSubmitButton;

        // Enter to send msg (does not exclude button).
        this.useSubmitEnter = 'undefined' === typeof opts.useSubmitEnter ?
            true : !!opts.useSubmitEnter;

        // Participants.
        tmp = opts.participants;
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
        this.uncollapseOnMsg = opts.uncollapseOnMsg || false;

        this.printStartTime = opts.printStartTime || false;
        this.printNames = opts.printNames || false;

        if (opts.initialMsg) {
            if ('object' !== typeof opts.initialMsg) {
                throw new TypeError('Chat.init: initialMsg must be ' +
                                    'object or undefined. Found: ' +
                                    opts.initialMsg);
            }
            this.initialMsg = opts.initialMsg;
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

        this.showIsTyping = 'undefined' === typeof opts.showIsTyping ?
            true : !!opts.showIsTyping;
    };

    Chat.prototype.append = function() {
        var that, inputGroup, initialText;
        that = this;

        this.chatDiv = W.get('div', { className: 'chat_chat' });
        this.bodyDiv.appendChild(this.chatDiv);

        if (!this.receiverOnly) {

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
                    that.sendMsg();
                    if ('function' === typeof that.textarea.focus) {
                        that.textarea.focus();
                    }
                };
                inputGroup.appendChild(this.submitButton);
            }
            if (this.useSubmitEnter || this.showIsTyping) {
                this.textarea.onkeydown = function(e) {
                    if (that.useSubmitEnter) {
                        e = e || window.event;
                        if ((e.keyCode || e.which) === 13) that.sendMsg();
                        else sendAmTyping(that);
                    }
                    else if (that.showIsTyping) {
                        sendAmTyping(that);
                    }
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

    /**
     * ### Chat.readTextarea
     *
     * Reads the value of the textarea, trims it, and removes it from textarea
     *
     * @return {string} The current value in the textarea
     */
    Chat.prototype.readTextarea = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt.trim();
    };

    /**
     * ### Chat.writeMsg
     *
     * Writes (and formats) a message (or an event) in the message area
     *
     * Chat is scrolled up so that the message is last always on focus.
     *
     * @param {string} code A value indicating the the type of msg. Available:
     *   'incoming', 'outgoing', and anything else.
     * @param {object} data The content of the message and the id of the sender
     *
     * @return {HTMLElement} c The div just inserted with the msg
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.writeMsg = function(code, data) {
        var c;
        c = (code === 'incoming' || code === 'outgoing') ? code : 'event';
        c = W.add('div', this.chatDiv, {
            innerHTML: this.getText(code, data),
            className: 'chat_msg chat_msg_' + c
        });
        this.scrollToBottom();
        return c;
    };

    /**
     * ### Chat.writeMsg
     *
     * It calls preprocess and renders a msg from data
     *
     * If msg is a function it executes it to render it.
     *
     * @param {object} data The content of the message
     * @param {string} code A value indicating the the type of msg. Available:
     *   'incoming', 'outgoing', and anything else.
     *
     * @return {string} msg The rendered msg
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.renderMsg = function(data, code) {
        var msg;
        if ('function' === typeof this.preprocessMsg) {
            this.preprocessMsg(data, code);
        }
        if ('function' === typeof data.msg) {
            msg = data.msg(data, code);
        }
        else {
            msg = data.msg;
        }
        return msg;
    };

    /**
     * ### Chat.scrollToBottom
     *
     * Scrolls the chat to the last message
     */
    Chat.prototype.scrollToBottom = function() {
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
            // Remove is typing sign, if any.
            that.clearIsTyping(msg.from);
            msg = {
                msg: that.renderMsg(msg.data, 'incoming'),
                id: msg.from
            };
            that.writeMsg('incoming', msg);
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

        node.on.data(this.chatEvent + '_TYPING', function(msg) {
            if (!that.handleMsg(msg)) return;
            that.addIsTyping(msg.from);
        });
    };

    Chat.prototype.addIsTyping = function(id) {
        var t, div, that;
        // Stop existing timeouts.
        t = this.isTypingTimeouts[id];
        if (t) clearTimeout(t);
        // Make or show the div.
        div = this.isTypingDivs[id];
        if (div) {
            // Move last and show..
            this.chatDiv.appendChild(div);
            div.style.display = '';
        }
        else {
            this.isTypingDivs[id] = this.writeMsg('incoming', {
                msg: this.getText('isTyping'),
                id: id
            });
        }
        this.scrollToBottom();
        // Add new timeout (msg are sent every 4000).
        that = this;
        this.isTypingTimeouts[id] = setTimeout(function() {
            that.clearIsTyping(id);
            that.isTypingTimeouts[id] = null;
        }, 3000);
    };

    Chat.prototype.clearIsTyping = function(id) {
        if (this.isTypingTimeouts[id]) {
            clearTimeout(this.isTypingTimeouts[id]);
            this.isTypingTimeouts[id] = null;
        }
        // Keep the div element, just hide it, it will be recycled.
        if (this.isTypingDivs[id]) {
            this.isTypingDivs[id].style.display = 'none';
        }
    };

    /**
     * ### Chat.handleMsg
     *
     * Checks a (incoming) message and takes some actions
     *
     * If chat is minimized, it maximizes it if option `uncollapseOnMsg`
     * it TRUE; otherwise, it increments the stats for unread messages.
     *
     * @param {string} msg The content of the message
     *
     * @return {boolean} TRUE if the message is valid
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.handleMsg = function(msg) {
        var from;
        from = msg.from;
        if (from === node.player.id || from === node.player.sid) {
            node.warn('Chat: your own message came back: ' + msg.id);
            return false;
        }
        if (this.isCollapsed()) {
            if (this.uncollapseOnMsg) {
                this.uncollapse();
                this.stats.unread = 0;
            }
            else {
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
        if (this.db) out.msgs = this.db.fetch();
        return out;
    };

    /* ### Chat.sendMsg
     *
     * Delivers a msg to the server
     *
     * If no options are specified, it reads the textarea.
     *
     * @param {object} opts Optional. Configutation options:
     *   - msg: the msg to send. If undefined, it reads the value from textarea;
     *          if function it executes it and uses the return value.
     *   - recipients: array of recipients. Default: this.recipientsIds.
     *   - silent: does not write the msg on the chat.
     */
    Chat.prototype.sendMsg = function(opts) {
        var to, ids, that;

        // No msg sent.
        if (this.isDisabled()) {
            node.warn('Chat is disable, msg not sent.');
            return;
        }

        if ('object' === typeof opts) {
            if ('undefined' !== typeof opts.msg) {
                if ('object' === typeof opts.msg) {
                    throw new TypeError('Chat.sendMsg: opts.msg cannot be ' +
                                        'object. Found: ' + opts.msg);
                }
            }
        }
        else {
            if ('undefined' === typeof opts) {
                opts = { msg: this.readTextarea() };
            }
            else if ('string' === typeof opts || 'number' === typeof opts) {
                opts = { msg: opts };
            }
            else {
                throw new TypeError('Chat.sendMsg: opts must be string, ' +
                                    'number, object, or undefined. Found: ' +
                                     opts);
            }
        }

        // Calls preprocessMsg and if opts.msg is function, executes it.
        opts.msg = this.renderMsg(opts, 'outgoing');

        // Move cursor at the beginning.
        if (opts.msg === '') {
            node.warn('Chat: message has no text, not sent.');
            return;
        }
        // Simplify things, if there is only one recipient.
        ids = opts.recipients || this.recipientsIds;
        if (ids.length === 0) {
            node.warn('Chat: empty recipient list, message not sent.');
            return;
        }
        // Make it a number if array of size 1, so it is faster.
        to = ids.length === 1 ? ids[0] : ids;

        node.say(this.chatEvent, to, opts);

        if (!opts.silent) {
            that = this;
            // TODO: check the comment: // to not used now.
            this.writeMsg('outgoing', opts);

            // Make sure the cursor goes back to top.
            if (that.textarea) {
                setTimeout(function() { that.textarea.value = ''; });
            }
        }

        // Clear any typing timeout.
        if (this.amTypingTimeout) {
            clearTimeout(this.amTypingTimeout);
            this.amTypingTimeout = null;
        }
    }

    // ## Helper functions.

    // ### sendMsg
    // Reads the textarea and delivers the msg to the server.
    function sendAmTyping(that) {
        var to;
        if (that.isDisabled()) return;
        // Do not send too many notifications.
        if (that.amTypingTimeout) return;
        // Simplify things, if there is only one recipient.
        to = that.recipientsIds;
        if (!to.length) return;
        else if (to.length === 1) to = to[0];
        // No new notifications for 4s.
        that.amTypingTimeout = setTimeout(function() {
            that.amTypingTimeout = null;
        }, 4000);
        node.say(that.chatEvent + '_TYPING', to);
    }

})(node);
