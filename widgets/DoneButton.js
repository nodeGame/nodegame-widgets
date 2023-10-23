/**
 * # DoneButton
 * Copyright(c) 2023 Stefano Balietti <ste@nodegame.org>
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

    DoneButton.version = '1.1.0';
    DoneButton.description = 'Creates a button that if ' +
        'pressed emits node.done().';

    DoneButton.panel = false;
    DoneButton.className = 'donebutton';
    DoneButton.texts.done = 'Done';

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
            if (that.onclick && false === that.onclick()) return;
            if (node.game.isWidgetStep()) {
                // Widget has a next visualization in the same step.
                if (node.widgets.last.next() !== false) return;
            }
            if (node.done()) that.disable();
        };

        /**
         * ### DoneButton.onclick
         *
         * A callback executed after the button is clicked
         *
         * If it return FALSE, node.done() is not called.
         */
        this.onclick = null;

        /**
         * ### DoneButton.disableOnDisconnect
         *
         * If TRUE, the button is automatically disableb upon disconnection
         */
        this.disableOnDisconnect = null;

        /**
         * ### DoneButton.delayOnPlaying
         *
         * The number of milliseconds to wait to enable at a new step
         *
         * A small delay prevents accidental double clicking between steps.
         */
        this.delayOnPlaying = 800;
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
     * - onclick: a callback executed when the button is clicked. Default: null
     * - disableOnDisconnect: TRUE to disable upon disconnection. Default: TRUE
     * - delayOnPlaying: number of milliseconds to wait to enable after
     *     the `PLAYING` event is fired (e.g., a new step begins). Default: 800
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

        tmp = opts.delayOnPlaying;
        if ('number' === typeof tmp) {
            this.delayOnPlaying = tmp;
        }
        else if ('undefined' !== typeof tmp) {
            throw new TypeError('DoneButton.init: delayOnPlaying must ' +
                                'be number or undefined. Found: ' + tmp);
        }

        setOnClick(this, opts.onclick);
    };

    DoneButton.prototype.append = function() {
        // If added in init, it must stay disabled until the step property
        // of first step is evaluated.
        if (!node.game.isReady()) {
            this.disabled = true;
            this.button.disabled = true;
        }
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
            var prop, delay;

            prop = node.game.getProperty('donebutton');
            if (prop === false || (prop && prop.enableOnPlaying === false)) {
                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                if (prop && prop.hasOwnProperty &&
                    prop.hasOwnProperty('delayOnPlaying')) {
                        delay = prop.delayOnPlaying;
                }
                else {
                    delay = that.delayOnPlaying;
                }
                if (delay) {
                    setTimeout(function () {
                        // If not disabled because of a disconnection,
                        // enable it.
                        if (!disabled) that.enable();
                    }, delay);
                }
                else {
                    // It might be enabled already, but we do it again.
                    that.enable();
                }
            }
            if ('string' === typeof prop) {
                that.button.value = prop;
            }
            else if (prop) {
                if (prop.text) that.button.value = prop.text;
                if (prop.onclick) setOnClick(that, prop.onclick, true);
            }  

            
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
     * ### DoneButton.updateText
     *
     * Updates the text on the button, possibly for a given duration only
     *
     * @param {string} text The new text
     * @param {number} duration Optional. The number of milliseconds the new
     *   text is displayed. If undefined, the new text stays indefinitely.
     */
    DoneButton.prototype.updateText = function(text, duration) {
        var oldText, that;
        if (duration) {
            that = this;
            oldText = this.button.value;
            node.timer.setTimeout(function() {
                that.button.value = oldText;
            }, duration);
        }
        this.button.value = text;
    };

    /**
     * ### DoneButton.disable
     *
     * Disables the done button
     */
    DoneButton.prototype.disable = function(opts) {
        if (this.disabled) return;
        this.disabled = true;
        this.button.disabled = true;
        this.emit('disabled', opts);
    };

    /**
     * ### DoneButton.enable
     *
     * Enables the done button
     */
    DoneButton.prototype.enable = function(opts) {
        if (!this.disabled) return;
        this.disabled = false;
        this.button.disabled = false;
        this.emit('enabled', opts);
    };


    // ## Helper functions.

    // Checks and sets the onclick function.
    function setOnClick(that, onclick, step) {
        var str;
        if ('undefined' !== typeof onclick) {
            if ('function' !== typeof onclick && onclick !== null) {
                str = 'DoneButton.init';
                if (step) str += ' (step property)';
                throw new TypeError(str + ': onclick must be function, null,' +
                                    ' or undefined. Found: ' + onclick);
            }
            that.onclick = onclick;
        }
        if (step) {
            node.once('REALLY_DONE', function() {
                that.onclick = null;
            });
        }
    }

})(node);
