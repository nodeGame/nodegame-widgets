/**
 * # CustomInput
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable table where each cell is a selectable choice
 *
 * // TODO: register time for each current choice if selectMultiple is on?
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('CustomInput', CustomInput);

    // ## Meta-data

    CustomInput.version = '0.0.1';
    CustomInput.description = 'Creates a configurable input box';

    CustomInput.title = 'false';
    CustomInput.className = 'custominput';


    // ## Dependencies

    CustomInput.dependencies = {
        JSUS: {}
    };

    /**
     * ## CustomInput constructor
     *
     * Creates a new instance of CustomInput
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as the clickable
     *   table. All other options are passed to the init method.
     */
    function CustomInput(options) {

        /**
         * ### CustomInput.input
         *
         * The HTML input element
         */
        this.input = null;

        /**
         * ### CustomInput.type
         *
         * The type of input
         */
        this.type = null;

        /**
         * ### CustomInput.validation
         *
         * The validation function for the input
         *
         * The function returns an error message in case of error.
         */
        this.validation = null;

        /**
         * ### CustomInput.validation
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null

        /**
         * ### CustomInput.mainText
         *
         * A text preceeding the date selector
         */
        this.mainText = null;
    }

    // ## CustomInput methods

    /**
     * ### CustomInput.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *
     * @param {object} options Configuration options
     */
    CustomInput.prototype.init = function(options) {
        var tmp, that;
        that = this;

        if (options.type && !CustomInput.types[option.type]) {
            throw new Error('CustomInput.init: type not supported: ' +
                            options.type);
        }
        else {
            this.type = 'text';
        }

        if (options.validation) {
            if ('function' !== typeof options.validation) {
                throw new TypeError('CustomInput.init: options.validation ' +
                                    'must be function or undefined. Found: ' +
                                    options.validation);
            }
            this.validation = options.validation;
        }
        else {
            // Add default validations based on type.

        }

        if (options.mainText) {
            if ('string' !== typeof options.mainText) {
                throw new TypeError('CustomInput.init: options.mainText ' +
                                    'must be string or undefined. Found: ' +
                                    options.mainText);
            }
            this.mainText = options.mainText;
        }
    };


    /**
     * ### CustomInput.append
     *
     * Implements Widget.append
     *
     * Checks that id is unique.
     *
     * Appends (all optional):
     *
     *   - mainText: a question or statement introducing the choices
     *   - table: the table containing the choices
     *   - freeText: a textarea for comments
     *
     * @see Widget.append
     */
    CustomInput.prototype.append = function() {
        var that, timeout;
        that = this;

        // MainText.
        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = 'maintext';
            this.spanMainText.innerHTML = this.mainText;
            // Append mainText.
            this.bodyDiv.appendChild(this.spanMainText);
        }

        this.input = W.append('input', this.bodyDiv);

        this.erroBox = W.append('div', this.bodyDiv);

        this.input.onchange = function() {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(function() {
                var res;
                if (that.validation) res = that.validation(that.input.value);
                if (res) {
                    that.errorBox.innerHTML = res;
                    that.highlight();
                }
            }, 500);
        };

    };


    /**
     * ### CustomInput.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '3px solid red'
     *
     * @see CustomInput.highlighted
     */
    CustomInput.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('CustomInput.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted) return;
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### CustomInput.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see CustomInput.highlighted
     */
    CustomInput.prototype.unhighlight = function() {
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### CustomInput.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *       value, widget will be highlighted. Default: FALSE.
     *   - reset:       If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see CustomInput.verifyChoice
     * @see CustomInput.reset
     */
    CustomInput.prototype.getValues = function(opts) {
        var obj, resetOpts;
        opts = opts || {};

        return obj;
    };


})(node);
