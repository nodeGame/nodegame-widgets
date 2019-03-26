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

    CustomInput.version = '0.6.0';
    CustomInput.description = 'Creates a configurable input form';

    CustomInput.title = false;
    CustomInput.panel = false;
    CustomInput.className = 'custominput';

    CustomInput.types = {
        text: true,
        number: true,
        'float': true,
        'int': true,
        date: true,
        list: true
    };

    CustomInput.texts = {
        autoHint: function(w) {
            var res;
            res = w.type === 'list' ?
                '(separate items with ' + w.params.listSep + ')' : '';
            if (w.requiredChoice) return res + '*';
            else return res ? res : false;
        },
        numericErr: function(w) {
            var str, p, inc;
            p = w.params;
            // Weird, but valid, case.
            if (p.exactly) return 'Must enter ' + p.lower;
            // Others.
            inc = '(inclusive)';
            str = 'Must be a';
            if (w.type === 'float') str += 'floating point';
            else if (w.type === 'int') str += 'n integer';
            str += ' number ';
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
            if (p.exactly) {
                str += 'exactly ' + (p.lower + 1);
            }
            else if (p.between) {
                str += 'between ' + p.lower + ' and ' + p.upper;
            }
            else if ('undefined' !== typeof p.lower) {
                str += ' more than ' + (p.lower -1);
            }
            else if ('undefined' !== typeof p.upper) {
                str += ' less than ' + (p.upper + 1);
            }
            str += ' characters long';
            if (p.between) str += ' (extremes included)';
            str += '. Current length: ' + len;
            return str;
        },
        dateErr: function(w, invalid) {
            return invalid ? 'Date is invalid' : 'Must follow format ' +
                w.params.format;
        },
        emptyErr: function(w) {
            return 'Cannot be empty'
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
     */
    function CustomInput() {

        /**
         * ### CustomInput.input
         *
         * The HTML input element
         */
        this.input = null;

        /**
         * ### CustomInput.placeholder
         *
         * The placeholder text for the input form
         *
         * Some types preset it automatically
         */
        this.placeholder = null;

        /**
         * ### CustomInput.inputWidth
         *
         * The width of the input form as string (css attribute)
         *
         * Some types preset it automatically
         */
        this.inputWidth = null;

        /**
         * ### CustomInput.type
         *
         * The type of input
         */
        this.type = null;

        /**
         * ### CustomInput.preprocess
         *
         * The function that preprocess the input before validation
         *
         * The function receives the input form and must modify it directly
         */
        this.preprocess = null;

        /**
         * ### CustomInput.validation
         *
         * The validation function for the input
         *
         * The function returns an object like:
         *
         * ```javascript
         *  {
         *    value: 'validvalue',
         *    err:   'This error occurred' // If invalid.
         *  }
         * ```
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
         * A text preceeding the custom input
         */
        this.mainText = null;

        /**
         * ### CustomInput.hint
         *
         * An additional text with information about the input
         *
         * If not specified, it may be auto-filled, e.g. '*'.
         *
         * @see CustomInput.texts.autoHint
         */
        this.hint = null;

        /**
         * ### CustomInput.requiredChoice
         *
         * If TRUE, the input form cannot be left empty
         *
         * Default: TRUE
         */
        this.requiredChoice = null;
    }

    // ## CustomInput methods

    /**
     * ### CustomInput.init
     *
     * Initializes the instance
     *
     * @param {object} opts Configuration options
     */
    CustomInput.prototype.init = function(opts) {
        var tmp, that, e, isText;
        that = this;
        e = 'CustomInput.init: ';

        // TODO: this becomes false later on. Why???
        this.requiredChoice = !!opts.requiredChoice;

        if (opts.type) {
            if (!CustomInput.types[opts.type]) {
                throw new Error(e + 'type not supported: ' + opts.type);
            }
            this.type = opts.type;
        }
        else {
            this.type = 'text';
        }

        if (opts.validation) {
            if ('function' !== typeof opts.validation) {
                throw new TypeError(e + 'validation must be function ' +
                                    'or undefined. Found: ' +
                                    opts.validation);
            }
            tmp = opts.validation;
        }
        else {
            // Add default validations based on type.

            if (this.type === 'number' || this.type === 'float' ||
                this.type === 'int' || this.type === 'text') {

                isText = this.type === 'text';

                // Greater than.
                if ('undefined' !== typeof opts.min) {
                    tmp = J.isNumber(opts.min);
                    if (false === tmp) {
                        throw new TypeError(e + 'min must be number or ' +
                                            'undefined. Found: ' + opts.min);
                    }
                    this.params.lower = opts.min;
                    this.params.leq = true;
                }
                // Less than.
                if ('undefined' !== typeof opts.max) {
                    tmp = J.isNumber(opts.max);
                    if (false === tmp) {
                        throw new TypeError(e + 'max must be number or ' +
                                            'undefined. Found: ' + opts.max);
                    }
                    this.params.upper = opts.max;
                    this.params.ueq = true;
                }

                if (opts.strictlyGreater) this.params.leq = false;
                if (opts.strictlyLess) this.params.ueq = false;

                // Checks on both min and max.
                if ('undefined' !== typeof this.params.lower &&
                    'undefined' !== typeof this.params.upper) {

                    if (this.params.lower > this.params.upper) {
                        throw new TypeError(e + 'min cannot be greater ' +
                                            'than max. Found: ' +
                                            opts.min + '> ' + opts.max);
                    }
                    // Exact length.
                    if (this.params.lower === this.params.upper) {
                        if (!this.params.leq || !this.params.ueq) {

                            throw new TypeError(e + 'min cannot be equal to ' +
                                                'max when strictlyGreater or ' +
                                                'strictlyLess are set. ' +
                                                'Found: ' + opts.min);
                        }
                        if (this.type === 'int' || this.type === 'text') {
                            if (J.isFloat(this.params.lower)) {


                                throw new TypeError(e + 'min cannot be a ' +
                                                    'floating point number ' +
                                                    'and equal to ' +
                                                    'max, when type ' +
                                                    'is not "float". Found: ' +
                                                    opts.min);
                            }
                        }
                        // Store this to create better error strings.
                        this.params.exactly = true;
                    }
                    else {
                        // Store this to create better error strings.
                        this.params.between = true;
                    }
                }

                // Checks for text only.
                if (isText) {
                    if ('undefined' !== typeof this.params.lower) {
                        if (this.params.lower < 0) {
                            throw new TypeError(e + 'min cannot be negative ' +
                                                'when type is "text". Found: ' +
                                                this.params.lower);
                        }
                        if (!this.params.leq) this.params.lower++;
                    }
                    if ('undefined' !== typeof this.params.upper) {
                        if (this.params.upper < 0) {
                            throw new TypeError(e + 'max cannot be negative ' +
                                                'when type is "text". Found: ' +
                                                this.params.upper);
                        }
                        if (!this.params.ueq) this.params.upper--;
                    }

                    tmp = function(value) {
                        var len, p, out, err;
                        p = that.params;
                        len = value.length;
                        out = { value: value };
                        if (p.exactly) {
                            err = len !== p.lower;
                        }
                        else {
                            if (('undefined' !== typeof p.lower &&
                                 len < p.lower) ||
                                ('undefined' !== typeof p.upper &&
                                 len > p.upper)) {

                                err = true;
                            }
                        }
                        if (err) out.err = that.getText('textErr', len);
                        return out;
                    };
                }
                else {
                    tmp = (function() {
                        var cb;
                        if (that.type === 'float') cb = J.isFloat;
                        else if (that.type === 'int') cb = J.isInt;
                        else cb = J.isNumber;
                        return function(value) {
                            var res, p;
                            p = that.params;
                            res = cb(value, p.lower, p.upper, p.leq, p.ueq);
                            if (res !== false) return { value: res };
                            return {
                                value: value,
                                err: that.getText('numericErr')
                            };
                        };
                    })();
                }

                // Preset inputWidth.
                if (this.params.upper) {
                    if (this.params.upper < 10) this.inputWidth = '100px';
                    else if (this.params.upper < 20) this.inputWidth = '200px';
                }

            }
            else if (this.type === 'date') {
                if ('undefined' !== typeof opts.format) {
                    // TODO: use regex.
                    if (opts.format !== 'mm-dd-yy' &&
                        opts.format !== 'dd-mm-yy' &&
                        opts.format !== 'mm-dd-yyyy' &&
                        opts.format !== 'dd-mm-yyyy' &&
                        opts.format !== 'mm.dd.yy' &&
                        opts.format !== 'dd.mm.yy' &&
                        opts.format !== 'mm.dd.yyyy' &&
                        opts.format !== 'dd.mm.yyyy' &&
                        opts.format !== 'mm/dd/yy' &&
                        opts.format !== 'dd/mm/yy' &&
                        opts.format !== 'mm/dd/yyyy' &&
                        opts.format !== 'dd/mm/yyyy') {

                        throw new Error(e + 'date format is invalid. Found: ' +
                                        opts.format);
                    }
                    this.params.format = opts.format;
                }
                else {
                    this.params.format = 'mm/dd/yyyy';
                }

                this.params.sep = this.params.format.charAt(2);
                tmp = this.params.format.split(this.params.sep);
                this.params.yearDigits = tmp[2].length;
                this.params.dayPos = tmp[0].charAt(0) === 'd' ? 0 : 1;
                this.params.monthPos =  this.params.dayPos ? 0 : 1;


                // Preset inputWidth.
                if (this.params.yearDigits === 2) this.inputWidth = '100px';
                else this.inputWidth = '150px';

                // Preset placeholder.
                this.placeholder = this.params.format;

                tmp = function(value) {
                    var p, tokens, tmp, err, res, dayNum, l1, l2;
                    p = that.params;

                    // Is the format valid.

                    tokens = value.split(p.sep);
                    if (tokens.length !== 3) {
                        return { err: that.getText('dateErr') };
                    }

                    // Year.
                    if (tokens[2].length !== p.yearDigits) {
                        return { err: that.getText('dateErr') };
                    }

                    // Now we check if the date is valid.

                    res = {};
                    if (p.yearDigits === 2) {
                        l1 = -1;
                        l2 = 100;
                    }
                    else {
                        l1 = -1
                        l2 = 10000;
                    }
                    tmp = J.isInt(tokens[2], l1, l2);
                    if (tmp !== false) res.year = tmp;
                    else err = true;


                    // Month.
                    tmp = J.isInt(tokens[p.monthPos], 1, 12, 1, 1);
                    if (!tmp) err = true;
                    else res.month = tmp;
                    // 31 or 30 days?
                    if (tmp === 1 || tmp === 3 || tmp === 5 || tmp === 7 ||
                        tmp === 8 || tmp === 10 || tmp === 12) {

                        dayNum = 31;
                    }
                    else if (tmp !== 2) {
                        dayNum = 30;
                    }
                    else {
                        // Is it leap year?
                        dayNum = (res.year % 4 === 0 && res.year % 100 !== 0) ||
                            res.year % 400 === 0 ? 29 : 28;
                    }
                    res.month = tmp;
                    // Day.
                    tmp = J.isInt(tokens[p.dayPos], 1, dayNum, 1, 1);
                    if (!tmp) err = true;
                    else res.day = tmp;

                    //
                    if (err) res.err = that.getText('dateErr', true);
                    return res;
                };
            }
            // TODO: add other types, e.g. date, int and email.
        }

        // Variable tmp contains a validation function, either from
        // defaults, or from user option.

        this.validation = function(value) {
            var res;
            res = { value: value };
            if (value.trim() === '') {
                if (that.requiredChoice) res.err = that.getText('emptyErr');
            }
            else if (tmp) {
                res = tmp(value);
            }
            return res;
        };

        // List.

        if (this.type === 'list') {
            if (opts.listSeparator) {
                if ('string' !== typeof opts.listSeparator) {
                    throw new TypeError(e + 'listSeparator must be string or ' +
                                        'undefined. Found: ' +
                                        opts.listSeperator);
                }
                this.params.listSep = opts.listSeparator;
            }
            else {
                this.params.listSep = ',';
            }
        }

        // Preprocess

        if (opts.preprocess) {
            if ('function' !== typeof opts.preprocess) {
                throw new TypeError(e + 'preprocess must be function or ' +
                                    'undefined. Found: ' + opts.preprocess);
            }
            this.preprocess = opts.preprocess;
        }
        else if (opts.preprocess !== false) {

            if (this.type === 'date') {
                this.preprocess = function(input) {
                    var sep, len;
                    len = input.value.length;
                    sep = that.params.sep;
                    if (len === 2) {
                        if (input.selectionStart === 2) input.value += sep;
                    }
                    else if (len === 5 && input.selectionStart === 5) {
                        input.value += sep;
                    }
                };
            }
        }

        // Postprocess.

        if (opts.postprocess) {
            if ('function' !== typeof opts.postprocess) {
                throw new TypeError(e + 'postprocess must be function or ' +
                                    'undefined. Found: ' + opts.postprocess);
            }
            this.postprocess = opts.postprocess;
        }
        else {
            if (this.type === 'list') {
                this.postprocess = function(value, valid) {
                    var i, len;
                    if (!value) return value;
                    value = value.split(this.params.listSep);
                    len = value.length;
                    if (!len) return value;
                    value[0] = value[0].trim();
                    if (len > 1) value[1] = value[1].trim();
                    if (len > 2) value[2] = value[2].trim();
                    if (len > 3) {
                        for (i = 3; i < len ; i++) {
                            value[i] = value[i].trim();
                        }
                    }
                    return value;
                };
            }
            else if (this.type === 'date') {
                this.postprocess = function(value, valid) {
                    if (!valid || !value) return value;
                    return {
                        value: value,
                        day: value.substring(0,2),
                        month: value.substring(3,5),
                        year: value.subtring(6, value.length)
                    };
                };
            }
        }

        // MainText, Hint, and other visuals.

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError(e + 'mainText must be string or ' +
                                    'undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        if ('undefined' !== typeof opts.hint) {
            if (false !== opts.hint && 'string' !== typeof opts.hint) {
                throw new TypeError(e + 'hint must be a string, false, or ' +
                                    'undefined. Found: ' + opts.hint);
            }
            this.hint = opts.hint;
        }
        else {
            this.hint = this.getText('autoHint');
        }
        if (opts.placeholder) {
            if ('string' !== typeof opts.placeholder) {
                throw new TypeError(e + 'placeholder must be string or ' +
                                    'undefined. Found: ' + opts.placeholder);
            }
            this.placeholder = opts.placeholder;
        }
        if (opts.width) {
            if ('string' !== typeof opts.width) {
                throw new TypeError(e + 'width must be string or ' +
                                    'undefined. Found: ' + opts.width);
            }
            this.inputWidth = opts.width;
        }
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
                className: 'custominput-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'choicetable-hint',
                innerHTML: this.hint
            });
        }

        this.input = W.append('input', this.bodyDiv);
        if (this.placeholder) this.input.placeholder = this.placeholder;
        if (this.inputWidth) this.input.style.width = this.inputWidth;

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.input.oninput = function() {
            if (timeout) clearTimeout(timeout);
            if (that.isHighlighted()) that.unhighlight();
            if (that.preprocess) that.preprocess(that.input);
            timeout = setTimeout(function() {
                var res;
                if (that.validation) {
                    res = that.validation(that.input.value);
                    if (res.err) that.setError(res.err);
                }
            }, 500);
        };
        this.input.onclick = function() {
            if (that.isHighlighted()) that.unhighlight();

        };
    };

    /**
     * ### CustomInput.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see CustomInput.highlight
     * @see CustomInput.errorBox
     */
    CustomInput.prototype.setError = function(err) {
        this.errorBox.innerHTML = err;
        this.highlight();
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
        if (this.isHighlighted()) this.unhighlight();
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
        res.isCorrect = valid = !res.err;
        if (this.postprocess) res.value = this.postprocess(res.value, valid);
        if (!valid) {
            this.setError(res.err);
            res.isCorrect = false;
        }
        else if (opts.reset) {
            this.reset();
        }
        res.id = this.id;
        return res;
    };

})(node);
