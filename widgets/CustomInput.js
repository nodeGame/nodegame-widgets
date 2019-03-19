/**
 * # CustomInput
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable input form with validation
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('CustomInput', CustomInput);

    // ## Meta-data

    CustomInput.version = '0.2.0';
    CustomInput.description = 'Creates a configurable input box';

    CustomInput.title = false;
    CustomInput.panel = false;
    CustomInput.className = 'custominput';

    CustomInput.types = {
        text: true,
        number: true,
        'float': true
    };

    CustomInput.texts = {
        numFloatErr: function(w, isFloat) {
            var str, p, inc;
            p = w.params;
            inc = '(inclusive)';
            str = 'Must be a ';
            if (isFloat) str += 'floating point ';
            str += 'number ';
            if (p.between) {
                str += 'between ' + p.lower;
                if (p.leq) str += inc;
                str += ' and ' + p.upper;
                if (p.ueq) str += inc;
            }
            else if ('undefined' !== typeof p.lower) {
                str += 'greater than ';
                if (p.leq) str += 'or equal to ';
                str += p.lower;
            }
            else {
                str += 'less than ';
                if (p.leq) str += 'or equal to ';
                str += p.upper;
            }
            return str;
        },
        textErr: function(w, len) {
            var str, p;
            p = w.params;
            str = 'Must be ';
            if ('undefined' !== typeof p.lower) str += 'at least ' + p.lower;
            if ('undefined' !== typeof p.upper) {
                if (str) str += ' and';
                str += ' no more than ' + p.upper;
            }
            str += ' characters long. Current length: ' + len;
            return str;

        }
    };

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
         * ### CustomInput.postprocess
         *
         * The function that postprocess the input after validation
         *
         * The function returns the postprocessed valued
         */
        this.postprocess = null;

        /**
         * ### CustomInput.params
         *
         * Object containing extra validation params
         *
         * This object is populated by the init function
         */
        this.params = {};

        /**
         * ### CustomInput.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### CustomInput.mainText
         *
         * A text preceeding the date selector
         */
        this.mainText = null;

        /**
         * ### CustomInput.breakAfterMainText
         *
         * TRUE, if a br is inserted between the main text and the input
         *
         * Default: TRUE
         */
        this.breakAfterMainText = null;
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
        var tmp, that, e, isText;
        that = this;
        e = 'CustomInput.init: options.';
        if (options.type) {
            if (!CustomInput.types[options.type]) {
                throw new Error(e + 'type not supported: ' + options.type);
            }
            this.type = options.type;
        }
        else {
            this.type = 'text';
        }

        if (options.validation) {
            if ('function' !== typeof options.validation) {
                throw new TypeError(e + 'validation must be function ' +
                                    'or undefined. Found: ' +
                                    options.validation);
            }
            this.validation = options.validation;
        }
        else {
            // Add default validations based on type.

            if (this.type === 'number' || this.type === 'float' ||
                this.type === 'text') {

                isText = this.type === 'text';

                if ('undefined' !== typeof options.min) {
                    tmp = J.isNumber(options.min);
                    if (false === tmp) {
                        throw new TypeError(e + 'min must be number or ' +
                                            'undefined. Found: ' + options.min);
                    }
                    if (isText && tmp < 0) {
                        throw new TypeError(e + 'min cannot be a ' +
                                            'negative number when type ' +
                                            'is "text". Found: ' + options.min);
                    }
                    this.params.lower = options.min;
                }
                if ('undefined' !== typeof options.minEq) {
                    tmp = J.isNumber(options.minEq);
                    if (false === tmp) {
                        throw new TypeError(e + 'minEq ' +
                                            'must be number or undefined. ' +
                                            'Found: ' + options.minEq);
                    }
                    if ('undefined' !== typeof this.params.lower) {
                        node.warn(e + 'min is ignored if minEq is also set');
                    }
                    // Set the params for text and num/float.
                    if (isText) {
                        this.params.min--;
                    }
                    else {
                        this.params.lower = options.minEq;
                        this.params.leq = true;
                    }
                }
                if ('undefined' !== typeof options.max) {
                    tmp = J.isNumber(options.max);
                    if (false === tmp) {
                        throw new TypeError(e + 'max must be number or ' +
                                            'undefined. Found: ' + options.max);
                    }
                    if (isText && tmp < 0) {
                        throw new TypeError(e + 'max cannot be a ' +
                                            'negative number when type ' +
                                            'is "text". Found: ' + options.max);
                    }
                    this.params.upper = options.max;
                    if ('undefined' !== typeof this.params.lower) {
                        // Store this to create better error strings.
                        this.params.between = true;
                    }
                }
                if ('undefined' !== typeof options.maxEq) {
                    tmp = J.isNumber(options.maxEq);
                    if (false === tmp) {
                        throw new TypeError(e + 'maxEq must be number or ' +
                                            'undefined. Found: ' +
                                            options.maxEq);
                    }
                    if ('undefined' !== typeof this.params.upper) {
                        node.warn(e + 'max is ignored if maxEq is also set');
                    }
                    // Set the params for text and num/float.
                    if (isText) {
                        this.params.min++;
                    }
                    else {
                        this.params.upper = options.max;
                        this.params.ueq = true;
                    }
                }
                if (isText) {
                    tmp = function(value) {
                        var len, p, out;
                        p = that.params;
                        len = value.length;
                        out = { value: value };
                        if (('undefined' !== typeof p.lower && len < p.lower) ||
                            ('undefined' !== typeof p.upper && len > p.upper)) {

                            out.err = that.getText('textErr', len);
                        }
                        return out;
                    };
                }
                else {
                    tmp = (function() {
                        var cb, isFloat;
                        cb = isFloat ? J.isFloat : J.isNumber;
                        isFloat = that.type === 'float';
                        return function(value) {
                            var out, res, p;
                            p = that.params;
                            res = cb(value, p.lower, p.upper, p.leq, p.ueq);
                            if (res !== false) return { value: res };
                            return {
                                value: value,
                                err: that.getText('numFloatErr', isFloat)
                            };
                        };
                    })();
                }
            }

            // TODO: add other types, e.g. date.

            this.validation = function(value) {
                that.lastError = null;
                that.lastValue = null;
                return tmp(value);
            };
        }

        if (options.mainText) {
            if ('string' !== typeof options.mainText) {
                throw new TypeError(e + 'mainText must be string or ' +
                                    'undefined. Found: ' + options.mainText);
            }
            this.mainText = options.mainText;
        }
        this.breakAfterMainText = !!options.breakAfterMainText: true;
    };


    /**
     * ### CustomInput.append
     *
     * Implements Widget.append
     *
     * @see Widget.append
     */
    CustomInput.prototype.append = function() {
        var that, timeout;
        that = this;

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'maintext',
                innerHTML: this.mainText
            });
            if (this.breakAfterMainText) W.append('br', this.bodyDiv);
        }

        this.input = W.append('input', this.bodyDiv);

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.input.oninput = function() {
            console.log('onchange');
            if (timeout) clearTimeout(timeout);
            if (that.isHighlighted()) that.unhighlight();
            timeout = setTimeout(function() {
                var res;
                if (that.validation) res = that.validation(that.input.value);
                if (res.err) {
                    that.errorBox.innerHTML = res.err;
                    that.highlight();
                }
            }, 500);
        };
        this.input.onclick = function() {
            if (that.isHighlighted()) that.unhighlight();

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
        if (!this.input || this.highlighted) return;
        this.input.style.border = border || '3px solid red';
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
        if (!this.input || this.highlighted !== true) return;
        this.input.style.border = '';
        this.highlighted = false;
        this.errorBox.innerHTML = '';
        this.emit('unhighlighted');
    };

    /**
     * ### CustomInput.reset
     *
     * Resets the widget
     */
    CustomInput.prototype.reset = function() {
        if (this.input) this.input.value = '';
        if (this.isHighilighted()) this.unhighlight();
    };

    /**
     * ### CustomInput.getValues
     *
     * Returns the value currently in the input
     *
     * The postprocess function is called if specified
     *
     * @param {object} opts Optional. Configures the return value.
     *
     * @return {mixed} The value in the input
     *
     * @see CustomInput.verifyChoice
     * @see CustomInput.reset
     */
    CustomInput.prototype.getValues = function(opts) {
        var res, valid;
        opts = opts || {};
        res = this.input.value;
        res = this.validation ? this.validation(res) : { value: res };
        valid = !!res.err;
        if (this.postprocess) res.value = this.postprocess(res.value, valid);
        if (!valid) this.highlight(res.err);
        else if (opts.reset) this.reset();
        return res;
    };


})(node);
