/**
 * # BackButton
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed goes to the previous step
 *
 * // TODO: check the changes to node.game.getProperty
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('BackButton', BackButton);

    // ## Meta-data

    BackButton.version = '0.1.0';
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

        /**
         * ### BackButton.acrossStages
         *
         * If TRUE, the Back button allows to go back within the same stage only
         *
         * Default: FALSE
         */
        this.acrossStages = null;

        /**
         * ### BackButton.acrossRounds
         *
         * If TRUE, the Back button allows to go back within the same stage only
         *
         * Default: TRUE
         */
        this.acrossRounds = null;

        this.button.onclick = function() {
            var res;
            res = getPreviousStep(that);
            if (!res) return;
            res = node.game.gotoStep(res);
            if (res) that.disable();
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

        this.acrossStages = 'undefined' === typeof options.acrossStages ?
            false : !!options.acrossStages;
        this.acrossRounds = 'undefined' === typeof options.acrossRounds ?
            true : !!options.acrossRounds;
    };

    BackButton.prototype.append = function() {
        this.bodyDiv.appendChild(this.button);
    };

    BackButton.prototype.listeners = function() {
        var that = this;

        // Locks the back button in case of a timeout.
        node.on('PLAYING', function() {
            var prop, step;
            step = getPreviousStep(that);
            // It might be enabled already, but we do it again.
            if (step) that.enable();
            // Check options.
            prop = node.game.getProperty('backbutton');
            if (!step || prop === false ||
                (prop && prop.enableOnPlaying === false)) {

                // It might be disabled already, but we do it again.
                that.disable();
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

    // ## Helper functions.

    /**
     * ### getPreviousStage
     *
     * Returns the previous step accordingly with widget's settings
     *
     * @param {BackButton} that The current instance
     *
     * @return {GameStage|Boolean} The previous step or FALSE if none is found
     */
    function getPreviousStep(that) {
        var curStage,  prevStage;
        curStage = node.game.getCurrentGameStage();
        if (curStage.stage === 0) return;
        prevStage = node.game.getPreviousStep();
        if (prevStage.stage === 0) return;
        if ((curStage.stage > prevStage.stage) && !that.acrossStages) {
            return false;
        }
        if ((curStage.round > prevStage.round) && !that.acrossRounds) {
            return false;
        }
        return prevStage;
    }

})(node);
