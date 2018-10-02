/**
 * # BackButton
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
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

    BackButton.version = '0.1.0';
    BackButton.description = 'Creates a button that if ' +
        'pressed goes to the previous step.';

    BackButton.title = '';
    BackButton.className = 'donebutton';
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
            var curStage = node.game.getCurrentGameStage();
            var stepId = curStage.step;
            if (stepId > 1) {
                curStage.step = curStage.step-1;
                res = node.game.gotoStep(curStage);
            }
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

        this._setText = this.setText;
        this.setText = function(text, value) {
            this._setText(text, value);
            this.button.value = value;
        };
        // Button text.
        if ('undefined' !== typeof options.text) {
            this.setText('back', options.text);
        }
        else {
            this.button.value = this.getText('back');
        }
        options.hideTitle = true;

    };

    BackButton.prototype.append = function() {
        this.bodyDiv.appendChild(this.button);
    };

    BackButton.prototype.listeners = function() {
        var that = this;

        // Locks the back button in case of a timeout.
        node.on('PLAYING', function() {
            var prop, step;
            step = node.game.getCurrentGameStage();
            prop = node.game.plot.getProperty(step, 'BackButton');

            if (step.step < 2) {
                that.disable();
            }
            if (prop === false || (prop && prop.enableOnPlaying === false)) {
                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                that.enable();
            }
            if (prop && prop.text) {
                that.button.value = prop.text;
            }
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

    /**
     * ### BackButton.setText
     *
     * Set the text for the back button
     *
     * @param {string} text Optional. The text of the button.
     *   Default: BackButton.text
     */
    BackButton.prototype.setText = function(text) {
        if ('undefined' === typeof text) {
            text = BackButton.text;
        }
        else if ('string' !== typeof text) {
            throw new TypeError('BackButton.setText: text must ' +
                                'be string or undefined. Found: ' +
                                typeof text);
        }
        this.button.value = text;
    };

})(node);
