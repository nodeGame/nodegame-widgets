/**
 * # Chat widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    // ## Defaults

    Chat.defaults = {};
    Chat.defaults.id = 'chat';
    Chat.defaults.fieldset = { legend: 'Chat' };
    Chat.defaults.mode = 'MANY_TO_MANY';
    Chat.defaults.textarea_id = 'chat_textarea';
    Chat.defaults.chat_id = 'chat_chat';
    Chat.defaults.chat_event = 'CHAT';
    Chat.defaults.submit_id = 'chat_submit';
    Chat.defaults.submit_text = 'chat';


    // ## Meta-data

    // ### Chat.modes
    //  MANY_TO_MANY: everybody can see all the messages, and it possible
    //    to send private messages
    //  MANY_TO_ONE: everybody can see all the messages, private messages can
    //    be received, but not sent
    //  ONE_TO_ONE: everybody sees only personal messages, private messages can
    //    be received, but not sent. All messages are sent to the SERVER
    //  RECEIVER_ONLY: messages can only be received, but not sent
    Chat.modes = {
        MANY_TO_MANY: 'MANY_TO_MANY',
        MANY_TO_ONE: 'MANY_TO_ONE',
        ONE_TO_ONE: 'ONE_TO_ONE',
        RECEIVER_ONLY: 'RECEIVER_ONLY'
    };

    Chat.version = '0.4';
    Chat.description = 'Offers a uni / bi-directional communication interface between players, or between players and the experimenter.';

    // ## Dependencies

    Chat.dependencies = {
        JSUS: {}
    };

    function Chat (options) {
        this.id = options.id || Chat.id;
        this.mode = options.mode || Chat.defaults.mode;

        this.root = null;

        this.textarea_id = options.textarea_id || Chat.defaults.textarea_id;
        this.chat_id = options.chat_id || Chat.defaults.chat_id;
        this.submit_id = options.submit_id || Chat.defaults.submit_id;

        this.chat_event = options.chat_event || Chat.defaults.chat_event;
        this.submit_text = options.submit_text || Chat.defaults.submit_text;

        this.submit = W.getEventButton(this.chat_event, this.submit_text, this.submit_id);
        this.textarea = W.getElement('textarea', this.textarea_id);
        this.chat = W.getElement('div', this.chat_id);

        if ('undefined' !== typeof options.displayName) {
            this.displayName = options.displayName;
        }

        switch(this.mode) {

        case Chat.modes.RECEIVER_ONLY:
            this.recipient = {value: 'SERVER'};
            break;
        case Chat.modes.MANY_TO_ONE:
            this.recipient = {value: 'ALL'};
            break;
        case Chat.modes.ONE_TO_ONE:
            this.recipient = {value: 'SERVER'};
            break;
        default:
            this.recipient = W.getRecipientSelector();
        }
    }


    Chat.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.chat);

        if (this.mode !== Chat.modes.RECEIVER_ONLY) {
            W.writeln('', root);
            root.appendChild(this.textarea);
            W.writeln('', root);
            root.appendChild(this.submit);
            if (this.mode === Chat.modes.MANY_TO_MANY) {
                root.appendChild(this.recipient);
            }
        }
        return root;
    };

    Chat.prototype.getRoot = function() {
        return this.root;
    };

    Chat.prototype.displayName = function(from) {
        return from;
    };

    Chat.prototype.readTA = function() {
        var txt = this.textarea.value;
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

        node.on(this.chat_event, function() {
            var msg = that.readTA();
            if (!msg) return;

            var to = that.recipient.value;
            var args = {
                '%s': {
                    'class': 'chat_me'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg
            };
            that.writeTA('%sMe%s: %msg!txt%msg', args);
            node.say(that.chat_event, to, msg.trim());
        });

        if (this.mode === Chat.modes.MANY_TO_MANY) {
            node.on('UPDATED_PLIST', function() {
                W.populateRecipientSelector(that.recipient, node.game.pl.fetch());
            });
        }

        node.onDATA(this.chat_event, function(msg) {
            if (msg.from === node.player.id || msg.from === node.player.sid) {
                return;
            }

            if (this.mode === Chat.modes.ONE_TO_ONE) {
                if (msg.from === this.recipient.value) {
                    return;
                }
            }

            var from = that.displayName(msg.from);
            var args = {
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

    node.widgets.register('Chat', Chat);

})(node);