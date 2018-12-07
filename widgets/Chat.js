/**
 * # Chat
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * // TODO: add is...typing
 * // TODO: add bootstrap badge to count msg when collapsed
 * // TODO: chat button inline with textarea
 * // TODO: fix the recipient
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Chat', Chat);

    // ## Meta-data

    Chat.version = '1.0.0';
    Chat.description = 'Offers a uni-/bi-directional communication interface ' +
        'between players, or between players and the experimenter.';

    Chat.title = 'Chat';
    Chat.className = 'chat';

    // ### Chat.modes
    //
    // - MANY_TO_MANY: everybody can see all the messages, and it possible
    //   to send private messages.
    //
    // - MANY_TO_ONE: everybody can see all the messages, private messages can
    //   be received, but not sent.
    //
    // - ONE_TO_ONE: everybody sees only personal messages, private messages can
    //   be received, but not sent. All messages are sent to the SERVER.
    //
    // - RECEIVER_ONLY: messages can only be received, but not sent.
    //
    Chat.modes = {
        MANY_TO_MANY: 'MANY_TO_MANY',
        MANY_TO_ONE: 'MANY_TO_ONE',
        ONE_TO_ONE: 'ONE_TO_ONE',
        RECEIVER_ONLY: 'RECEIVER_ONLY'
    };


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
         * ### Chat.mode
         *
         * Determines to mode of communication
         *
         * @see Chat.modes
         */
        this.mode = null;

        /**
         * ### Chat.textarea
         *
         * The textarea wherein to write and read
         */
        this.textarea = null;

        /**
         * ### Chat.chat
         *
         * The DIV wherein to display the chat
         */
        this.chat = null;

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

        /**
         * ### Chat.displayName
         *
         * Function which displays the sender's name
         */
        this.displayName = null;

        /**
         * ### Chat.recipient
         *
         * Object containing the value of the recipient of the message
         */
        this.recipient = { value: null };
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
     *   - `mode`: Determines to mode of communication
     *   - `submitText`: The text on the submit button
     *   - `chatEvent`: The event to fire when sending a message
     *   - `displayName`: Function which displays the sender's name
     */
    Chat.prototype.init = function(options) {
        var tmp, that;
        options = options || {};

        if ('undefined' === typeof options.mode) {
            // Will be setup later.
            options.mode = 'MANY_TO_MANY';
        }
        else if ('string' === typeof options.mode) {
            switch(options.mode) {
            case Chat.modes.RECEIVER_ONLY:
                tmp = 'SERVER';
                break;
            case Chat.modes.MANY_TO_ONE:
                tmp = 'ROOM';
                break;
            case Chat.modes.ONE_TO_ONE:
                tmp = options.recipient;
                if ('string' !== typeof tmp) {
                    throw new TypeError('Chat.init: mode=ONE_TO_ONE, but ' +
                                        'recipient is not string. Found: ' +
                                        tmp);
                }
                if (options.recipientName) {
                    if ('string' !== typeof options.recipientName) {
                        throw new TypeError('Chat.init: recipientName must ' +
                                            'be string or undefined. Found: ' +
                                            tmp);
                    }
                    this.recipient.name = options.recipientName;
                }
                break;
            case Chat.modes.MANY_TO_MANY:
                break;
            default:
                throw new Error('Chat.init: options.mode is invalid: ' +
                                options.mode);
            }
            this.recipient.value = tmp;
        }
        else {
            throw new Error('Chat.init: options.mode must be string or ' +
                            'undefined. Found: ' + options.mode);
        }

        this.mode = options.mode;
        this.chatEvent = options.chatEvent || 'CHAT';
        this.submitText = options.submitText || 'chat';

        that = this;
        this.displayName = options.displayName || function(from) {
            if (that.mode = Chat.modes.ONE_TO_ONE && that.recipient.name) {
                return that.recipient.name;
            }
            else {
                return from;
            }
        };
    };


    Chat.prototype.append = function() {
        var that;

        this.chat = W.get('div', { className: 'chat_chat' });
        this.bodyDiv.appendChild(this.chat);

        if (this.mode !== Chat.modes.RECEIVER_ONLY) {
            that = this;
            // Create buttons to send messages, if allowed.
            this.submit = W.get('button', {
                innerHTML: this.submitText,
                className: 'btn btn-sm btn-secondary'
            });

            this.submit.onclick = function() {
                var msg, to;
                msg = that.readTA();
                if (!msg) return;
                to = that.recipient.value;
                that.writeTA(msg, to, true);
                node.say(that.chatEvent, to, msg);
            };

            this.textarea = W.get('textarea', { className: 'chat_textarea' });

            // Append them.
            W.writeln('', this.bodyDiv);
            this.bodyDiv.appendChild(this.textarea);
            W.writeln('', this.bodyDiv);
            this.bodyDiv.appendChild(this.submit);

            // Add recipient selector, if requested.
            if (this.mode === Chat.modes.MANY_TO_MANY) {
                this.recipient = W.getRecipientSelector();
                this.bodyDiv.appendChild(this.recipient);
            }
        }
    };

    Chat.prototype.readTA = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt.trim();
    };

    Chat.prototype.writeTA = function(msg, toFrom, outgoing) {
        var string, args;
        if (outgoing) {
            args = {
                '%s': {
                    'class': 'chat_me'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg,
                '!to': toFrom
            };
            if (this.mode === Chat.modes.ONE_TO_ONE || toFrom === 'ALL') {
                string = '%sMe%s: %msg!txt%msg';
            }
            else {
                string = '%sMe to !to%s: %msg!txt%msg';
            }
        }
        else {
            toFrom = this.displayName(toFrom);
            args = {
                '%s': {
                    'class': 'chat_others'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg,
                '!from': toFrom
            };
            string = '%s!from%s: %msg!txt%msg';
        }
        J.sprintf(string, args, this.chat);
        W.writeln('', this.chat);
        this.chat.scrollTop = this.chat.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        if (this.mode === Chat.modes.MANY_TO_MANY) {
            node.on('UPDATED_PLIST', function() {
                W.populateRecipientSelector(that.recipient,
                    node.game.pl.fetch());
            });
        }

        node.on.data(this.chatEvent, function(msg) {
            var from, args;
            if (msg.from === node.player.id || msg.from === node.player.sid) {
                return;
            }

            if (that.mode === Chat.modes.ONE_TO_ONE) {
                if (msg.from === that.recipient.value) {
                    return;
                }
            }

            if (that.isCollapsed()) {
                if (that.uncollapseOnMsg) {
                    that.uncollapse();
                }
                else {
                    // TODO: highlight better. Play sound?
                    that.setTitle('<strong>' + that.title + '</strong>');
                }
            }

            that.writeTA(msg.data, msg.from, false);
        });

    };

})(node);
