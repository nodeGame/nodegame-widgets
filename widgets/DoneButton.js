/**
 * # DoneButton
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DoneButton', DoneButton);

    // ## Meta-data

    DoneButton.version = '1.0.0';
    DoneButton.description = 'Creates a button that if ' +
        'pressed emits node.done().';

    DoneButton.title = false;
    DoneButton.className = 'donebutton';
    DoneButton.texts.done = 'Done';

    // ## Dependencies

    DoneButton.dependencies = {
        JSUS: {}
    };

    /**
     * ## DoneButton constructor
     *
     * Creates a new instance of DoneButton
     *
     * @param {object} options Optional. Configuration options.
     *   If a `button` option is specified, it sets it as the clickable
     *   button. All other options are passed to the init method.
     *
     * @see DoneButton.init
     */
    function DoneButton(options) {
        var that;
        that = this;

        /**
         * ### DoneButton.button
         *
         * The HTML element triggering node.done() when pressed
         */
        if ('object' === typeof options.button) {
            this.button = options.button;
        }
        else if ('undefined' === typeof options.button) {
            this.button = document.createElement('input');
            this.button.type = 'button';
        }
        else {
            throw new TypeError('DoneButton constructor: options.button must ' +
                                'be object or undefined. Found: ' +
                                options.button);
        }

        this.button.onclick = function() {
            var res;
            res = node.done();
            if (res) that.disable();
        };

        this.disableOnDisconnect = null;
    }

    // ## DoneButton methods

    /**
     * ### DoneButton.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     * - id: id of the HTML button, or false to have none. Default:
     *     DoneButton.className
     * - className: the className of the button (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the button. Default: DoneButton.text
     *
     * @param {object} opts Optional. Configuration options
     */
    DoneButton.prototype.init = function(opts) {
        var tmp;
        opts = opts || {};

        //Button
        if ('undefined' === typeof opts.id) {
            tmp = DoneButton.className;
        }
        else if ('string' === typeof opts.id) {
            tmp = opts.id;
        }
        else if (false === opts.id) {
            tmp = false;
        }
        else {
            throw new TypeError('DoneButton.init: id must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.id);
        }
        if (tmp) this.button.id = tmp;

        // Button className.
        if ('undefined' === typeof opts.className) {
            tmp  = 'btn btn-lg btn-primary';
        }
        else if (opts.className === false) {
            tmp = '';
        }
        else if ('string' === typeof opts.className) {
            tmp = opts.className;
        }
        else if (J.isArray(opts.className)) {
            tmp = opts.className.join(' ');
        }
        else  {
            throw new TypeError('DoneButton.init: className must ' +
                                'be string, array, or undefined. Found: ' +
                                opts.className);
        }
        this.button.className = tmp;

        // Button text.
        this.button.value = 'string' === typeof opts.text ?
            opts.text : this.getText('done');

        this.disableOnDisconnect =
            'undefined' === typeof opts.disableOnDisconnect ?
            true : !! opts.disableOnDisconnect;
    };

    DoneButton.prototype.append = function() {
        this.bodyDiv.appendChild(this.button);
    };

    DoneButton.prototype.listeners = function() {
        var that, disabled;
        that = this;

        // This is normally executed after the PLAYING listener of
        // GameWindow where lockUnlockedInputs takes place.
        // In case of a timeup, the donebutton will be locked and
        // then unlocked by GameWindow, but otherwise it must be
        // done here.
        node.on('PLAYING', function() {
            var prop, step;
            step = node.game.getCurrentGameStage();
            prop = node.game.plot.getProperty(step, 'donebutton');
            if (prop === false || (prop && prop.enableOnPlaying === false)) {
                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                that.enable();
            }
            if ('string' === typeof prop) that.button.value = prop;
            else if (prop && prop.text) that.button.value = prop.text;
        });

        if (this.disableOnDisconnect) {
            node.on('SOCKET_DISCONNECT', function() {
                if (!that.isDisabled()) {
                    that.disable();
                    disabled = true;
                }
            });

            node.on('SOCKET_CONNECT', function() {
                if (disabled) {
                    if (that.isDisabled()) that.enable();
                    disabled = false;
                }
            });
        }
    };

    /**
     * ### DoneButton.disable
     *
     * Disables the done button
     */
    DoneButton.prototype.disable = function() {
        this.button.disabled = 'disabled';
    };

    /**
     * ### DoneButton.enable
     *
     * Enables the done button
     */
    DoneButton.prototype.enable = function() {
        this.button.disabled = false;
    };

})(node);
