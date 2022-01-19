/**
 * # BackButton
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed goes to the previous step
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('BackButton', BackButton);

    // ## Meta-data

    BackButton.version = '0.5.0';
    BackButton.description = 'Creates a button that if ' +
        'pressed goes to the previous step.';

    BackButton.title = false;
    BackButton.panel = false;
    BackButton.className = 'backbutton';
    BackButton.texts.back = 'Back';

    /**
     * ## BackButton constructor
     *
     * Creates a new instance of BackButton
     *
     * @param {object} options Optional. Configuration options.
     *   If a `button` option is specified, it sets it as the clickable
     *   button. All other options are passed to the init method.
     *
     * @see BackButton.init
     */
    function BackButton(options) {
        var that;
        that = this;

        /**
         * ### BackButton.button
         *
         * The HTML element.
         */
        if ('object' === typeof options.button) {
            this.button = options.button;
        }
        else if ('undefined' === typeof options.button) {
            this.button = document.createElement('input');
            this.button.type = 'button';
        }
        else {
            throw new TypeError('BackButton constructor: options.button must ' +
                                'be object or undefined. Found: ' +
                                options.button);
        }

        this.button.onclick = function() {
            var res;
            that.disable();
            if (that.onclick && false === that.onclick()) return;
            if (node.game.isWidgetStep()) {
                // Widget has a next visualization in the same step.
                if (node.widgets.last.prev() !== false) {
                    that.enable();
                    return;
                }
            }
            res = node.game.stepBack(that.stepOptions);
            if (res === false) that.enable();
        };

        this.stepOptions = {

            /**
             * #### BackButton.stepOptions.acrossStages
             *
             * If TRUE, it allows to go back to previous stages
             *
             * Default: FALSE
             */
            acrossStages: null,

            /**
             * #### BackButton.stepOptions.acrossRounds
             *
             * If TRUE, it allows to go back previous rounds in the same stage
             *
             * Default: TRUE
             */
            acrossRounds: null,


            // ## @api: private.
            noZeroStep: true
        };


        /**
         * #### BackButton.onclick
         *
         * A callback function executed when the button is clicked
         *
         * If the function returns FALSE, the procedure is aborted.
         *
         * Default: TRUE
         */
        this.onclick = null;
    }

    // ## BackButton methods

    /**
     * ### BackButton.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     * - id: id of the HTML button, or false to have none. Default:
     *     BackButton.className
     * - className: the className of the button (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the button. Default: BackButton.text
     * - acrossStages: if TRUE, allows going back to previous stages.
     *     Default: FALSE
     * - acrossRounds: if TRUE, allows going back to previous rounds in
     *     the same stage. Default: TRUE
     *
     * @param {object} options Optional. Configuration options
     */
    BackButton.prototype.init = function(opts) {
        var tmp;
        opts = opts || {};

        //Button
        if ('undefined' === typeof opts.id) {
            tmp = BackButton.className;
        }
        else if ('string' === typeof opts.id) {
            tmp = opts.id;
        }
        else if (false === opts.id) {
            tmp = '';
        }
        else {
            throw new TypeError('BackButton.init: opts.id must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.id);
        }
        this.button.id = tmp;

        if ('undefined' === typeof opts.className) {
            tmp  = 'btn btn-lg btn-secondary';
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
            throw new TypeError('BackButton.init: opts.className must ' +
                                'be string, array, or undefined. Found: ' +
                                opts.className);
        }
        this.button.className = tmp;

        // Button text.
        this.button.value = 'string' === typeof opts.text ?
            opts.text : this.getText('back');

        this.stepOptions.acrossStages =
            'undefined' === typeof opts.acrossStages ?
            false : !!opts.acrossStages;
        this.stepOptions.acrossRounds =
            'undefined' === typeof opts.acrossRounds ?
            true : !!opts.acrossRounds;

        setOnClick(this, opts.onclick);
    };

    BackButton.prototype.append = function() {
        if (!node.game.getPreviousStep(1, this.stepOptions)) this.disable();
        this.bodyDiv.appendChild(this.button);
    };

    BackButton.prototype.listeners = function() {
        var that = this;

        node.events.game.on('DONE', function() {
            that.disable();
        });

        // Locks the back button in case of a timeout.
        node.events.game.on('PLAYING', function() {
            var prop, step;

            // Check options.
            step = node.game.getPreviousStep(1, that.stepOptions);
            prop = node.game.getProperty('backbutton');

            if (prop !== true &&
                (!step || prop === false ||
                (prop && prop.enableOnPlaying === false))) {

                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                if (prop === true || step) that.enable();
            }

            if ('string' === typeof prop) that.button.value = prop;
            else if (prop && prop.text) that.button.value = prop.text;

            if (prop) {
                setOnClick(that, prop.onclick, true);
                if (prop.enable) that.enable();
            }
        });

        // Catch those events.
        node.events.game.on('WIDGET_NEXT', function() {
            that.enable();
        });
    };

    /**
     * ### BackButton.disable
     *
     * Disables the back button
     */
    BackButton.prototype.disable = function() {
        if (this.disabled) return;
        this.disabled = true;
        this.button.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### BackButton.enable
     *
     * Enables the back button
     */
    BackButton.prototype.enable = function() {
        if (!this.disabled) return;
        this.disabled = false;
        this.button.disabled = false;
        this.emit('enabled');
    };

    // ## Helper functions.

    // Checks and sets the onclick function.
    function setOnClick(that, onclick, step) {
        var str;
        if ('undefined' !== typeof onclick) {
            if ('function' !== typeof onclick && onclick !== null) {
                str = 'BackButton.init';
                if (step) str += ' (step property)';
                throw new TypeError(str + ': onclick must be function, null,' +
                                    ' or undefined. Found: ' + onclick);
            }
            that.onclick = onclick;
        }
    }

})(node);
