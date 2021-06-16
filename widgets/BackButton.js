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

    BackButton.version = '0.4.0';
    BackButton.description = 'Creates a button that if ' +
        'pressed goes to the previous step.';

    BackButton.title = false;
    BackButton.className = 'backbutton';
    BackButton.texts.back = 'Back';

    // ## Dependencies

    BackButton.dependencies = {
        JSUS: {}
    };

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
    BackButton.prototype.init = function(options) {
        var tmp;
        options = options || {};

        //Button
        if ('undefined' === typeof options.id) {
            tmp = BackButton.className;
        }
        else if ('string' === typeof options.id) {
            tmp = options.id;
        }
        else if (false === options.id) {
            tmp = '';
        }
        else {
            throw new TypeError('BackButton.init: options.id must ' +
                                'be string, false, or undefined. Found: ' +
                                options.id);
        }
        this.button.id = tmp;

        if ('undefined' === typeof options.className) {
            tmp  = 'btn btn-lg btn-secondary';
        }
        else if (options.className === false) {
            tmp = '';
        }
        else if ('string' === typeof options.className) {
            tmp = options.className;
        }
        else if (J.isArray(options.className)) {
            tmp = options.className.join(' ');
        }
        else  {
            throw new TypeError('BackButton.init: options.className must ' +
                                'be string, array, or undefined. Found: ' +
                                options.className);
        }
        this.button.className = tmp;

        // Button text.
        this.button.value = 'string' === typeof options.text ?
            options.text : this.getText('back');

        this.stepOptions.acrossStages =
            'undefined' === typeof options.acrossStages ?
            false : !!options.acrossStages;
        this.stepOptions.acrossRounds =
            'undefined' === typeof options.acrossRounds ?
            true : !!options.acrossRounds;
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

            if (!step || prop === false ||
                (prop && prop.enableOnPlaying === false)) {

                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                if (step) that.enable();
            }

            if ('string' === typeof prop) that.button.value = prop;
            else if (prop && prop.text) that.button.value = prop.text;
        });
    };

    /**
     * ### BackButton.disable
     *
     * Disables the back button
     */
    BackButton.prototype.disable = function() {
        this.button.disabled = 'disabled';
    };

    /**
     * ### BackButton.enable
     *
     * Enables the back button
     */
    BackButton.prototype.enable = function() {
        this.button.disabled = false;
    };

})(node);
