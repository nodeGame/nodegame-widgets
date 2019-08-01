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

    CustomInput.version = '0.10.0';
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
        list: true,
        us_city_state_zip: true,
        us_state: true,
        us_zip: true
    };

    var sepNames = {
        ',': 'comma',
        ' ': 'space',
        '.': 'dot'
    };

    var usStates = {
        Alabama: 'AL',
        Alaska: 'AK',
        Arizona: 'AZ',
        Arkansas: 'AR',
        California: 'CA',
        Colorado: 'CO',
        Connecticut: 'CT',
        Delaware: 'DE',
        Florida: 'FL',
        Georgia: 'GA',
        Hawaii: 'HI',
        Idaho: 'ID',
        Illinois: 'IL',
        Indiana: 'IN',
        Iowa: 'IA',
        Kansas: 'KS',
        Kentucky: 'KY',
        Louisiana: 'LA',
        Maine: 'ME',
        Maryland: 'MD',
        Massachusetts: 'MA',
        Michigan: 'MI',
        Minnesota: 'MN',
        Mississippi: 'MS',
        Missouri: 'MO',
        Montana: 'MT',
        Nebraska: 'NE',
        Nevada: 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        Ohio: 'OH',
        Oklahoma: 'OK',
        Oregon: 'OR',
        Pennsylvania: 'PA',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        Tennessee: 'TN',
        Texas: 'TX',
        Utah: 'UT',
        Vermont: 'VT',
        Virginia: 'VA',
        Washington: 'WA',
        'West Virginia': 'WV',
        Wisconsin: 'WI',
        Wyoming: 'WY',
    };

    var usTerr = {
        'American Samoa': 'AS',
        'District of Columbia': 'DC',
        'Federated States of Micronesia': 'FM',
        Guam: 'GU',
        'Marshall Islands': 'MH',
        'Northern Mariana Islands': 'MP',
        Palau: 'PW',
        'Puerto Rico': 'PR',
        'Virgin Islands': 'VI'
    };

    // To be filled if requested.
    var usTerrByAbbr;
    var usStatesByAbbr;
    var usStatesTerr;
    var usStatesTerrByAbbr;
    // Lower case keys.
    var usStatesLow;
    var usTerrLow;
    var usTerrByAbbrLow;
    var usStatesByAbbrLow;
    var usStatesTerrLow;
    var usStatesTerrByAbbrLow;

    CustomInput.texts = {
        listErr: 'Check that there are no empty items; do not end with ' +
            'the separator',
        listSizeErr: function(w, param) {
            if (w.params.fixedSize) {
                return w.params.minItems + ' items required';
            }
            if (param === 'min') {
                return 'Too few items. Min: ' + w.params.minItems;
            }
            return 'Too many items. Max: ' + w.params.maxItems;

        },
        usStateAbbrErr: 'Not a valid state abbreviation (must be 2 characters)',
        usStateErr: 'Not a valid state (full name required)',
        usZipErr: 'Not a valid ZIP code (must be 5 digits)',
        autoHint: function(w) {
            var res, sep;
            if (w.type === 'list') {
                sep = sepNames[w.params.listSep] || w.params.listSep;
                res = '(if more than one, separate with ' + sep + ')';
            }
            else if (w.type === 'us_state') {
                res = w.params.abbr ? '(Use 2-letter abbreviation)' :
                    '(Type the full name of the state)';
            }
            else if (w.type === 'us_zip') {
                res = '(Use 5-digit ZIP code)';
            }
            else if (w.type === 'us_city_state_zip') {
                sep = w.params.listSep;
                res = '(Format: Town' + sep + ' State' + sep + ' ZIP code)';
            }
            else if (w.type === 'date') {
                if (w.params.minDate && w.params.maxDate) {
                    res = '(Must be between ' + w.params.minDate.str + ' and ' +
                        w.params.maxDate.str + ')';
                }
                else if (w.params.minDate) {
                    res = '(Must be after ' + w.params.minDate.str + ')';
                }
                else if (w.params.maxDate) {
                    res = '(Must be before ' + w.params.maxDate.str + ')';
                }
                else {
                    res = '(Format: ' + w.params.format + ')';
                }
            }
            else if (w.type === 'number' || w.type === 'int' ||
                     w.type === 'float') {

                if (w.params.min && w.params.max) {
                    res = '(Must be between ' + w.params.min + ' and ' +
                        w.params.max + ')';
                }
                else if (w.params.min) {
                    res = '(Must be after ' + w.params.min + ')';
                }
                else if (w.params.max) {
                    res = '(Must be before ' + w.params.max + ')';
                }
            }
            return w.requiredChoice ? ((res || '') + ' *') : (res || false);
        },
        numericErr: function(w) {
            var str, p;
            p = w.params;
            // Weird, but valid, case.
            if (p.exactly) return 'Must enter ' + p.lower;
            // Others.
            str = 'Must be ';
            if (w.type === 'float') str += 'a floating point number';
            else if (w.type === 'int') str += 'an integer';
            if (p.between) {
                str += ' ' + (p.leq ? '&ge; ' : '<' ) + p.lower;
                str += ' and ';
                str += (p.ueq ? '&le; ' : '> ') + p.upper;
            }
            else if ('undefined' !== typeof p.lower) {
                str += ' ' + (p.leq ? '&ge; ' : '< ') + p.lower;
            }
            // It can be also a non-numeric error, e.g. a string here.
            else if ('undefined' !== typeof p.upper) {
                str += ' ' + (p.ueq ? '&le; ' : '> ') + p.upper;
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
        dateErr: function(w, param) {
            if (param === 'invalid') return 'Date is invalid';
            if (param === 'min') {
                return 'Date must be after ' + w.params.minDate.str;
            }
            if (param === 'max') {
                return 'Date must be before ' + w.params.maxDate.str;
            }
            return 'Must follow format ' + w.params.format;
        },
        emptyErr: function(w) {
            return 'Cannot be empty';
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
         * ### CustomInput.validationSpeed
         *
         * How often (in milliseconds) the validation function is called
         *
         * Default: 500
         */
        this.validationSpeed = 500;

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

        /**
         * ### CustomInput.timeBegin
         *
         * When the first character was inserted
         */
        this.timeBegin = null;

        /**
         * ### CustomInput.timeEnd
         *
         * When the last character was inserted
         */
        this.timeEnd = null;

        /**
         * ### CustomInput.checkbox
         *
         * A checkbox element for an additional action
         */
        this.checkbox = null;

        /**
         * ### CustomInput.checkboxText
         *
         * The text next to the checkbox
         */
        this.checkboxText = null;

        /**
         * ### CustomInput.checkboxCb
         *
         * The callback executed when the checkbox is clicked
         */
        this.checkboxCb = null;

        /**
         * ### CustomInput.orientation
         *
         * The orientation of main text relative to the input box
         *
         * Options:
         *   - 'V': main text above input box
         *   - 'H': main text next to input box
         *
         * Default: 'V'
         */
        this.orientation = null;
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
        var tmp, that, e, isText, setValues;
        that = this;
        e = 'CustomInput.init: ';


        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'V';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('CustomInput.init: orientation must ' +
                                'be string, or undefined. Found: ' +
                                opts.orientation);
        }
        else {
            tmp = opts.orientation.toLowerCase().trim();
            if (tmp === 'h') tmp = 'H';
            else if (tmp === 'v') tmp = 'V';
            else {
                throw new Error('CustomInput.init: unknown orientation: ' +
                                tmp);
            }
        }
        this.orientation = tmp;

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

                    setValues = function(opts) {
                        var a, b;
                        a = 'undefined' !== typeof that.params.lower ?
                            (that.params.lower + 1) : 5;
                        b = 'undefined' !== typeof that.params.upper ?
                            that.params.upper : (a + 5);
                        return J.randomString(J.randomInt(a, b));
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

                    setValues = function(opts) {
                        var p, a, b;
                        p = that.params;
                        if (that.type === 'float') return J.random();
                        a = 0;
                        b = 10;
                        if ('undefined' !== typeof p.lower) {
                            a = p.leq ? (p.lower - 1) : p.lower;
                        }
                        if ('undefined' !== typeof p.upper) {
                            b = p.ueq ? p.upper : (p.upper - 1);
                        }
                        return J.randomInt(a, b);
                    };
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
                this.params.dateLen = tmp[2].length + 6;
                if (opts.minDate) {
                    tmp = getParsedDate(opts.minDate, this.params);
                    if (!tmp) {
                        throw new Error(e + 'minDate must be a Date object. ' +
                                        'Found: ' + opts.minDate);
                    }
                    this.params.minDate = tmp;
                }
                if (opts.maxDate) {
                    tmp = getParsedDate(opts.maxDate, this.params);
                    if (!tmp) {
                        throw new Error(e + 'maxDate must be a Date object. ' +
                                        'Found: ' + opts.maxDate);
                    }
                    if (this.params.minDate &&
                        this.params.minDate.obj > tmp.obj) {

                        throw new Error(e + 'maxDate cannot be prior to ' +
                                        'minDate. Found: ' + tmp.str +
                                        ' < ' + this.params.minDate.str);
                    }
                    this.params.maxDate = tmp;
                }

                // Preset inputWidth.
                if (this.params.yearDigits === 2) this.inputWidth = '100px';
                else this.inputWidth = '150px';

                // Preset placeholder.
                this.placeholder = this.params.format;

                tmp = function(value) {
                    var p, tokens, tmp, res, dayNum, l1, l2;
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
                        l1 = -1;
                        l2 = 10000;
                    }
                    tmp = J.isInt(tokens[2], l1, l2);
                    if (tmp !== false) res.year = tmp;
                    else res.err = true;

                    // Month.
                    tmp = J.isInt(tokens[p.monthPos], 1, 12, 1, 1);
                    if (!tmp) res.err = true;
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
                    if (!tmp) res.err = true;
                    else res.day = tmp;

                    if (res.err) {
                        res.err = that.getText('dateErr', 'invalid');
                    }
                    else if (p.minDate || p.maxDate) {
                        tmp = new Date(value);
                        if (p.minDate.obj && p.minDate.obj > tmp) {
                            res.err = that.getText('dateErr', 'min');
                        }
                        else if (p.maxDate.obj && p.maxDate.obj < tmp) {
                            res.err = that.getText('dateErr', 'max');
                        }
                    }
                    if (!res.err) {
                        res.value = value;
                        res = { value: res };
                    }
                    return res;
                };

                setValues = function(opts) {
                    var p, minD, maxD, d, day, month, year;
                    p = that.params;
                    minD = p.minDate ? p.minDate.obj : new Date('01/01/1900');
                    maxD = p.maxDate ? p.maxDate.obj : undefined;
                    d = J.randomDate(minD, maxD);
                    day = d.getDate();
                    month = (d.getMonth() + 1);
                    year = d.getFullYear();
                    if (p.yearDigits === 2) year = ('' + year).substr(2);
                    if (p.monthPos === 0) d = month + p.sep + day;
                    else d = day + p.sep + month;
                    d += p.sep + year;
                    return d;
                };
            }
            else if (this.type === 'us_state') {
                if (opts.abbreviation) {
                    this.params.abbr = true;
                    this.inputWidth = '100px';
                }
                else {
                    this.inputWidth = '200px';
                }
                if (opts.territories !== false) {
                    this.terr = true;
                    if (this.params.abbr) {
                        tmp = getUsStatesList('usStatesTerrByAbbrLow');
                    }
                    else {
                        tmp = getUsStatesList('usStatesTerrLow');
                    }
                }
                else {
                    if (this.params.abbr) {
                        tmp = getUsStatesList('usStatesByAbbrLow');
                    }
                    else {
                        tmp = getUsStatesList('usStatesLow');
                    }
                }
                this.params.usStateVal = tmp;

                tmp = function(value) {
                    var res;
                    res = { value: value };
                    if (!that.params.usStateVal[value.toLowerCase()]) {
                        res.err = that.getText('usStateErr');
                    }
                    return res;
                };

                setValues = function(opts) {
                    return J.randomKey(that.params.usStateVal);
                };

            }
            else if (this.type === 'us_zip') {
                tmp = function(value) {
                    var res;
                    res = { value: value };
                    if (!isValidUSZip(value)) {
                        res.err = that.getText('usZipErr');
                    }
                    return res;
                };

                setValues = function(opts) {
                    return Math.floor(Math.random()*90000) + 10000;
                };
            }

            // Lists.

            else if (this.type === 'list' ||
                     this.type === 'us_city_state_zip') {

                if (opts.listSeparator) {
                    if ('string' !== typeof opts.listSeparator) {
                        throw new TypeError(e + 'listSeparator must be ' +
                                            'string or undefined. Found: ' +
                                            opts.listSeperator);
                    }
                    this.params.listSep = opts.listSeparator;
                }
                else {
                    this.params.listSep = ',';
                }

                if (this.type === 'us_city_state_zip') {

                    getUsStatesList('usStatesTerrByAbbr');
                    this.params.minItems = this.params.maxItems = 3;
                    this.params.fixedSize = true;
                    this.params.itemValidation = function(item, idx) {
                        if (idx === 2) {
                            if (!usStatesTerrByAbbr[item.toUpperCase()]) {
                                return { err: that.getText('usStateAbbrErr') };
                            }
                        }
                        else if (idx === 3) {
                            if (!isValidUSZip(item)) {
                                return { err: that.getText('usZipErr') };
                            }
                        }
                    };

                    this.placeholder = 'Town' + this.params.listSep +
                        ' State' + this.params.listSep + ' ZIP';
                }
                else {
                    if ('undefined' !== typeof opts.minItems) {
                        tmp = J.isInt(opts.minItems, 0);
                        if (tmp === false) {
                            throw new TypeError(e + 'minItems must be ' +
                                                'a positive integer. Found: ' +
                                                opts.minItems);
                        }
                        this.params.minItems = tmp;
                    }
                    if ('undefined' !== typeof opts.maxItems) {
                        tmp = J.isInt(opts.maxItems, 0);
                        if (tmp === false) {
                            throw new TypeError(e + 'maxItems must be ' +
                                                'a positive integer. Found: ' +
                                                opts.maxItems);
                        }
                        if (this.params.minItems &&
                            this.params.minItems > tmp) {

                            throw new TypeError(e + 'maxItems must be larger ' +
                                                'than minItems. Found: ' +
                                                tmp + ' < ' +
                                                this.params.minItems);
                        }
                        this.params.maxItems = tmp;
                    }
                }

                tmp = function(value) {
                    var i, len, v, iVal, err;
                    value = value.split(that.params.listSep);
                    len = value.length;
                    if (!len) return value;
                    iVal = that.params.itemValidation;
                    i = 0;
                    v = value[0].trim();
                    if (!v) return { err: that.getText('listErr') };
                    if (iVal) {
                        err = iVal(v, 1);
                        if (err) return err;
                    }
                    value[i++] = v;
                    if (len > 1) {
                        v = value[1].trim();
                        if (!v) return { err: that.getText('listErr') };
                        if (iVal) {
                            err = iVal(v, (i+1));
                            if (err) return err;
                        }
                        value[i++] = v;
                    }
                    if (len > 2) {
                        v = value[2].trim();
                        if (!v) return { err: that.getText('listErr') };
                        if (iVal) {
                            err = iVal(v, (i+1));
                            if (err) return err;
                        }
                        value[i++] = v;
                    }
                    if (len > 3) {
                        for ( ; i < len ; ) {
                            v = value[i].trim();
                            if (!v) return { err: that.getText('listErr') };
                            if (iVal) {
                                err = iVal(v, (i+1));
                                if (err) return err;
                            }
                            value[i++] = v;
                        }
                    }
                    // Need to do it here, because some elements might be empty.
                    if (that.params.minItems && i < that.params.minItems) {
                        return { err: that.getText('listSizeErr', 'min') };
                    }
                    if (that.params.maxItems && i > that.params.maxItems) {
                        return { err: that.getText('listSizeErr', 'max') };
                    }
                    return { value: value };
                };

                if (this.type === 'us_city_state_zip') {
                    setValues = function(opts) {
                        var sep;
                        sep = that.params.listSep + ' ';
                        return J.randomString(8) + sep +
                            J.randomKey(usStatesTerrByAbbr) + sep +
                            (Math.floor(Math.random()*90000) + 10000);
                    };
                }
                else {
                    setValues = function(opts) {
                        var p, minItems, nItems, i, str, sample;
                        p = that.params;
                        minItems = p.minItems || 0;
                        if (opts.availableValues) {
                            nItems = J.randomInt(minItems,
                                                 opts.availableValues.length);
                            nItems--;
                            sample = J.sample(0, (nItems-1));
                        }
                        else {
                            nItems = J.randomInt(minItems,
                                                 p.maxItems || (minItems + 5));
                            nItems--;
                        }
                        str = '';
                        for (i = 0; i < nItems; i++) {
                            if (i !== 0) str += p.listSep + ' ';
                            if (sample) str += opts.availableValues[sample[i]];
                            else str += J.randomString(J.randomInt(3,10));
                        }
                        return str;
                    };
                }

            }

            // US_Town,State, Zip Code

            // TODO: add other types, e.g.int and email.
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

        this._setValues = setValues;

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
                        if (input.selectionStart === 2) {
                            if (input.value.charAt(1) !== sep) {
                                input.value += sep;
                            }
                        }
                    }
                    else if (len === 5) {
                        if (input.selectionStart === 5) {
                            if (input.value.charAt(4) !== sep &&
                                (input.value.split(sep).length - 1) === 1) {

                                input.value += sep;
                            }
                        }
                    }
                    else if (len > this.params.dateLen) {
                        input.value =
                            input.value.substring(0, this.params.dateLen);
                    }
                };
            }
            else if (this.type === 'list' ||
                     this.type === 'us_city_state_zip') {

                // Add a space after separator, if separator is not space.
                if (this.params.listSep.trim() !== '') {
                    this.preprocess = function(input) {
                        var sep, len;
                        len = input.value.length;
                        sep = that.params.listSep;
                        if (len > 1 &&
                            len === input.selectionStart &&
                            input.value.charAt(len-1) === sep &&
                            input.value.charAt(len-2) !== sep) {

                            input.value += ' ';
                        }
                    };
                }
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
            // Add postprocess as needed.
        }

        // Validation Speed
        if ('undefined' !== typeof opts.validationSpeed) {
            tmp = J.isInt(opts.valiadtionSpeed, 0, undefined, true);
            if (tmp === false) {
                throw new TypeError(e + 'validationSpeed must a non-negative ' +
                                    'number or undefined. Found: ' +
                                    opts.validationSpeed);
            }
            this.validationSpeed = tmp;
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
            if (this.requiredChoice) this.hint += ' *';
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

        if (opts.checkboxText) {
            if ('string' !== typeof opts.checkboxText) {
                throw new TypeError(e + 'checkboxText must be string or ' +
                                    'undefined. Found: ' + opts.checkboxText);
            }
            this.checkboxText = opts.checkboxText;
        }

        if (opts.checkboxCb) {
            if (!this.checkboxText) {
                throw new TypeError(e + 'checkboxCb cannot be defined ' +
                                    'if checkboxText is not defined');
            }
            if ('function' !== typeof opts.checkboxCb) {
                throw new TypeError(e + 'checkboxCb must be function or ' +
                                    'undefined. Found: ' + opts.checkboxCb);
            }
            this.checkboxCb = opts.checkboxCb;
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
                className: 'custominput-hint',
                innerHTML: this.hint
            });
        }

        this.input = W.append('input', this.bodyDiv);
        if (this.placeholder) this.input.placeholder = this.placeholder;
        if (this.inputWidth) this.input.style.width = this.inputWidth;

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.input.oninput = function() {
            if (!that.timeBegin) {
                that.timeEnd = that.timeBegin = node.timer.getTimeSince('step');
            }
            else {
                that.timeEnd = node.timer.getTimeSince('step');
            }
            if (timeout) clearTimeout(timeout);
            if (that.isHighlighted()) that.unhighlight();
            if (that.preprocess) that.preprocess(that.input);
            timeout = setTimeout(function() {
                var res;
                if (that.validation) {
                    res = that.validation(that.input.value);
                    if (res.err) that.setError(res.err);
                }
            }, that.validationSpeed);
        };
        this.input.onclick = function() {
            if (that.isHighlighted()) that.unhighlight();
        };


        // Checkbox.
        if (this.checkboxText) {
            this.checkbox = W.append('input', this.bodyDiv, {
                type: 'checkbox',
                className: 'custominput-checkbox'
            });
            W.append('span', this.bodyDiv, {
                className: 'custominput-checkbox-text',
                innerHTML: this.checkboxText
            });

            if (this.checkboxCb) {
                J.addEvent(this.checkbox, 'change', function() {
                    that.checkboxCb(that.checkbox.checked, that);
                });
            }
        }
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
     * Highlights the input
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
     * Removes highlight from the input
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
     * ### CustomInput.disable
     *
     * Disables the widget
     *
     * @see CustomInput.disabled
     */
    CustomInput.prototype.disable = function(opts) {
        if (this.disabled) return;
        if (!this.isAppended()) return;
        this.disabled = true;
        this.input.disabled = true;
        if (this.checkbox && (!opts || opts.checkbox !== false)) {
            this.checkbox.disable = true;
        }
        this.emit('disabled');
    };

    /**
     * ### CustomInput.enable
     *
     * Enables the widget
     *
     * @see CustomInput.disabled
     */
    CustomInput.prototype.enable = function(opts) {
        if (this.disabled !== true) return;
        if (!this.isAppended()) return;
        this.disabled = false;
        this.input.disabled = false;
        if (this.checkbox && (!opts || opts.checkbox !== false)) {
            this.checkbox.disable = false;
        }
        this.emit('enabled');
    };

    /**
     * ### CustomInput.reset
     *
     * Resets the widget
     */
    CustomInput.prototype.reset = function() {
        if (this.input) this.input.value = '';
        if (this.isHighlighted()) this.unhighlight();
        this.timeBegin = this.timeEnd = null;
    };

    /**
     * ### CustomInput.getValues
     *
     * Returns the value currently in the input
     *
     * The postprocess function is called if specified
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available options:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *       value, widget will be highlighted. Default: TRUE.
     *   - reset:       If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *
     * @return {mixed} The value in the input
     *
     * @see CustomInput.verifyChoice
     * @see CustomInput.reset
     */
    CustomInput.prototype.getValues = function(opts) {
        var res, valid;
        opts = opts || {};
        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        res = this.input.value;
        res = this.validation ? this.validation(res) : { value: res };
        valid = !res.err;
        res.timeBegin = this.timeBegin;
        res.timeEnd = this.timeEnd;
        if (this.postprocess) res.value = this.postprocess(res.value, valid);
        if (!valid) {
            if (opts.highlight) this.setError(res.err);
            if (opts.markAttempt) res.isCorrect = false;
        }
        else {
            if (opts.markAttempt) res.isCorrect = true;
            if (opts.reset) this.reset();
        }
        if (this.checkbox) res.checked = this.checkbox.checked;
        res.id = this.id;
        return res;
    };

    /**
     * ### CustomInput.setValues
     *
     * Set the value of the input form
     *
     * @param {object} opts An object containing values or info about how
     *   how to set values.
     *
     * @experimental
     */
    CustomInput.prototype.setValues = function(opts) {
        var value, tmp;
        opts = opts || {};
        if ('undefined' !== typeof opts.value) {
            value = opts.value;
        }
        // Alias.
        else if ('undefined' !== typeof opts.values) {
            value = opts.values;
        }
        else if (opts.availableValues) {
            tmp = opts.availableValues;
            if (!J.isArray(tmp) || !tmp.length) {
                throw new TypeError('CustomInput.setValues: availableValues ' +
                                    'must be a non-empty array or undefined. ' +
                                    'Found: ' + tmp);
            }
            if (this.type === 'list') {
                if (tmp.length < this.params.minItems) {
                    throw new Error('CustomInput.setValues: availableValues ' +
                                    'must be a non-empty array or undefined. ' +
                                    'Found: ' + tmp);
                }
                value = this._setValues(opts);
            }
            else {
                value = tmp[J.randomInt(0, tmp.length) -1];
            }
        }
        else {
            value = this._setValues(opts);
        }
        this.input.value = value;
        if (this.preprocess) this.preprocess(this.input);
    };

    // ## Helper functions.

    // ### getParsedDate
    //
    // Tries to parse a date object, catches exceptions
    //
    // @param {string|Date} d The date object
    // @param {object} p The configuration object for date format
    //
    // @return {object|boolean} An object with the parsed date or false
    //   if an error occurred
    //
    function getParsedDate(d, p) {
        var res, day;
        if ('string' === typeof d) {
            d = d === 'today' ? new Date() : new Date(d);
            // If invalid  date it return NaN.
            day = d.getDate();
            if (!day) return false;
        }
        try {
            res = {
                day: day || d.getDate(),
                month: d.getMonth() + 1,
                year: d.getFullYear(),
                obj: d
            };
        }
        catch(e) {
            return false;
        }
        res.str = (p.dayPos ? res.day + p.sep + res.month :
                   res.month + p.sep + res.day) + p.sep;
        res.str += p.yearDigits === 2 ? res.year.substring(3,4) : res.year;
        return res;
    }



    // ### getUsStatesList
    //
    // Sets the value of a global variable and returns it.
    //
    // @param {string} s A string specifying the type of list
    //
    // @return {object} The requested list
    //
    function getUsStatesList(s) {
        switch(s) {

        case 'usStatesTerrByAbbrLow':
            if (!usStatesTerrByAbbrLow) {
                getUsStatesList('usStatesTerrLow');
                usStatesTerrByAbbrLow = J.reverseObj(usStatesTerr, toLK);
            }
            return usStatesTerrByAbbrLow;
        case 'usStatesTerrByAbbr':
            if (!usStatesTerrByAbbr) {
                getUsStatesList('usStatesTerr');
                usStatesTerrByAbbr = J.reverseObj(usStatesTerr);
            }
            return usStatesTerrByAbbr;

        case 'usTerrByAbbrLow':
            if (!usTerrByAbbrLow) usTerrByAbbrLow = J.reverseObj(usTerr, toLK);
            return usTerrByAbbrLow;
        case 'usTerrByAbbr':
            if (!usTerrByAbbr) usTerrByAbbr = J.reverseObj(usTerr);
            return usTerrByAbbr;

        case 'usStatesByAbbrLow':
            if (!usStatesByAbbrLow) {
                usStatesByAbbrLow = J.reverseObj(usStates, toLK);
            }
            return usStatesByAbbrLow;
        case 'usStatesByAbbr':
            if (!usStatesByAbbr) usStatesByAbbr = J.reverseObj(usStates);
            return usStatesByAbbr;

        case 'usStatesTerrLow':
            if (!usStatesTerrLow) {
                if (!usStatesLow) usStatesLow = objToLK(usStates);
                if (!usTerrLow) usTerrLow = objToLK(usTerr);
                usStatesTerrLow = J.merge(usStatesLow, usTerrLow);
            }
            return usStatesTerrLow;
        case 'usStatesTerr':
            if (!usStatesTerr) usStatesTerr = J.merge(usStates, usTerr);
            return usStatesTerr;

        case 'usStatesLow':
            if (!usStatesLow) usStatesLow = objToLow(usStates, toLK);
            return usStatesLow;
        case 'usStates':
            return usStates;

        case 'usTerrLow':
            if (!usTerrLow) usTerrLow = objToLow(usTerr, toLK);
            return usTerrLow;
        case 'usTerr':
            return usTerr;

        default:
            throw new Error('getUsStatesList: unknown request: ' + s);
        }
    }

    // Helper function for getUsStatesList
    // @see OBJ.reverseObj
    function toLK(key, value) {
        return [ key.toLowerCase(), value ];
    }
    // Helper function for getUsStatesList
    function objToLK(obj) {
        var p, objLow;
        objLow = {};
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                objLow[p.toLowerCase()] = obj[p];
            }
        }
        return objLow;
    }

    // ### isValidUSZip
    //
    // Trivial validation of a US ZIP code
    //
    // @param {string} z
    //
    // @return {boolean} TRUE if valid
    //
    function isValidUSZip(z) {
        return z.length === 5 && J.isInt(z, 0);
    }

})(node);
