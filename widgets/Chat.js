/**
 * # Chat
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Chat', Chat);

    // ## Meta-data

    Chat.version = '0.5.1';
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
         * ### Chat.recipient
         *
         * Determines recipient of the messages
         */
        this.recipient = null;


        /**
         * ### Chat.textarea
         *
         * The textarea wherein to write and read
         */
        this.textarea = null;

        /**
         * ### Chat.textareaId
         *
         * The id of the textarea
         */
        this.textareaId = null;


        /**
         * ### Chat.chat
         *
         * The DIV wherein to display the chat
         */
        this.chat = null;

        /**
         * ### Chat.chatId
         *
         * The id of the chat DIV
         */
        this.chatId = null;


        /**
         * ### Chat.submit
         *
         * The submit button
         */
        this.submit = null;

        /**
         * ### Chat.submitId
         *
         * The id of the submit butten
         */
        this.submitId = null;

        /**
         * ### Chat.submitText
         *
         * The text on the submit button
         */
        this.submitText = null;

        /**
         * ### Chat.chatEvent
         *
         * The event to fire when sending a message
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
     *   - `textareaId`: The id of the textarea
     *   - `chatId`: The id of the chat DIV
     *   - `submitId`: The id of the submit butten
     *   - `submitText`: The text on the submit button
     *   - `chatEvent`: The event to fire when sending a message
     *   - `displayName`: Function which displays the sender's name
     */
    Chat.prototype.init = function(options) {
        var tmp;
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
                tmp = 'SERVER';
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

        this.textareaId = options.textareaId || 'chat_textarea';
        this.chatId = options.chatId || 'chat_chat';
        this.submitId = options.submitId || 'chat_submit';

        this.chatEvent = options.chatEvent || 'CHAT';
        this.submitText = options.submitText || 'chat';

        this.displayName = options.displayName || function(from) {
            return from;
        };
    };


    Chat.prototype.append = function() {

        this.chat = W.getElement('div', this.chatId);
        this.bodyDiv.appendChild(this.chat);

        if (this.mode !== Chat.modes.RECEIVER_ONLY) {

            // Create buttons to send messages, if allowed.
            this.submit = W.getEventButton(this.chatEvent,
                                           this.submitText,
                                           this.submitId);
            this.submit.className = 'btn btn-sm btn-secondary';
            this.textarea = W.getElement('textarea', this.textareaId);
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
        return txt;
    };

    Chat.prototype.writeTA = function(string, args) {
        J.sprintf(string, args, this.chat);
        W.writeln('', this.chat);
        this.chat.scrollTop = this.chat.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        node.on(this.chatEvent, function() {
            var msg, to, args;
            msg = that.readTA();
            if (!msg) return;

            to = that.recipient.value;
            args = {
                '%s': {
                    'class': 'chat_me'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg,
                '!to': to
            };
            that.writeTA('%sMe -> !to%s: %msg!txt%msg', args);
            node.say(that.chatEvent, to, msg.trim());
        });

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

            if (this.mode === Chat.modes.ONE_TO_ONE) {
                if (msg.from === this.recipient.value) {
                    return;
                }
            }

            from = that.displayName(msg.from);
            args = {
                '%s': {
                    'class': 'chat_others'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg.data,
                '!from': from
            };

            that.writeTA('%s!from%s: %msg!txt%msg', args);
        });
    };

})(node);
