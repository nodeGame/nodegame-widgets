/**
 * # Slider
 * Copyright(c) 2023 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable slider.
 *
 * Kudos for initial code: https://codepen.io/gotpop/pen/RMZbya.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Slider', Slider);

    // ## Meta-data

    Slider.version = '0.7.0';
    Slider.description = 'Creates a configurable slider';

    Slider.className = 'slider';

    Slider.texts = {
        currentValue: function(widget, value) {
            return 'Value: ' + value;
        },
        noChange: 'No change',
        error: 'Movement required.',
        autoHint: function(w) {
            if (w.requiredChoice) return 'Movement required.';
            else return false;
        }
    };


    /**
     * ## Slider constructor
     *
     * Creates a new instance of Slider
     */
    function Slider() {
        var that;
        that = this;

        /** Slider.slider
         *
         * The HTML input slider Element
         */
        this.slider = null;

        /** Slider.slider
         *
         * The HTML div Element creating the slider background
         */
        this.rangeFill = null;

        /** Slider.scale
         *
         * Scaling factor for the slider (fixed to 1 for now)
         */
        this.scale = 1;

        /** Slider.currentValue
         *
         * The current value of the slider
         */
        this.currentValue = 50;

        /** Slider.initialValue
        *
        * The initial value of the slider
        */
        this.initialValue = 50;

        /** Slider.step
        *
        * Legal increments for the slider
        */
        this.step = 1;

        /**
        * ### Slider.mainText
        *
        * A text preceeding the slider
        */
        this.mainText = null;

        /**
        * ### Slider.required
        *
        * If TRUE, the user must move the slider
        */
        this.required = null;

        /**
        * ### Slider.requiredChoice
        *
        * Same as Slider.required (backward compatibility)
        */
        this.requiredChoice = null;

        /**
        * ### Slider.hint
        *
        * An additional informative text
        *
        * If not specified, it may be auto-filled, e.g. '*'.
        *
        * TODO: autoHint
        * @see Slider.texts.autoHint
        */
        this.hint = null;

        /** Slider.min
         *
         * The value of the slider at the leftmost position
         */
        this.min = 0;

        /** Slider.max
         *
         * The value of the slider at the rightmost position
         */
        this.max = 100;

        /** Slider.correctValue
         *
         * The correct value of the slider, if any
         */
        this.correctValue = null;

        /** Slider.displayValue
         *
         * If TRUE, the current value of the slider is displayed
         */
        this.displayValue = true;

        /** Slider.valueSpan
         *
         * The SPAN element containing the current value
         *
         * @see Slider.displayValue
         */
        this.valueSpan = null;

        /** Slider.displayNoChange
        *
        * If TRUE, a checkbox for marking a no-change is added
        */
        this.displayNoChange = true;

        /** Slider.noChangeSpan
        *
        * The checkbox form marking the no-change
        *
        * @see Slider.displayNoChange
        * @see Slider.noChangeCheckbox
        */
        this.noChangeSpan = null;

        /**
         * ### Slider.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /** Slider.totalMove
         *
         * The total movement of the slider
         */
        this.totalMove = 0;

        /** Slider.volumeSlider
         *
         * If TRUE, only the slider to the left of the pointer is colored
         *
         * Available types: 'volume', 'flat'.
         */
        this.type = 'volume';

        /** Slider.hoverColor
         *
         * The color of the slider on mouse over
         */
        this.hoverColor = '#2076ea';

        /** Slider.left
         *
         * A text to be displayed at the leftmost position
         */
        this.left = null;

        /** Slider.right
         *
         * A text to be displayed at the righttmost position
         */
        this.right = null;

        /** Slider.listener
         *
         * The main function listening for slider movement
         *
         * Calls user-defined listener oninput
         *
         * @param {boolean} noChange Optional. The function is invoked
         *   by the no-change checkbox. Note: when the function is invoked
         *   by the browser, noChange is the change event.
         *
         * @param {boolean} init Optional If true, the function is called
         *   by the init method, and some operations (e.g., updating totalMove)
         *   are not executed.
         *
         * @see Slider.onmove
         */
        var timeOut = null;
        this.listener = function(noChange, init, sync) {
            var _listener;
            if (!noChange && timeOut) return;

            if (that.isHighlighted()) that.unhighlight();

            _listener = function() {
                var percent, diffPercent;

                percent = (that.slider.value - that.min) * that.scale;
                diffPercent = percent - that.currentValue;
                that.currentValue = percent;

                // console.log(diffPercent);
                // console.log(that.slider.value, percent);

                if (that.type === 'volume') {
                    // Otherwise it goes a bit outside.
                    if (percent > 99) percent = 99;
                    that.rangeFill.style.width = percent + '%';
                }
                else {
                    that.rangeFill.style.width = '99%';
                }

                if (that.displayValue) {
                    that.valueSpan.innerHTML =
                        that.getText('currentValue', that.slider.value);
                }

                if (that.displayNoChange && noChange !== true) {
                    if (that.noChangeCheckbox.checked) {
                        that.noChangeCheckbox.checked = false;
                        J.removeClass(that.noChangeSpan, 'italic');
                    }
                }

                if (!init) {
                    that.totalMove += Math.abs(diffPercent);
                    if (that.onmove) {
                        that.onmove.call(that, that.slider.value, diffPercent);
                    }
                }

                timeOut = null;
            };

            if (sync) _listener();
            else timeOut = setTimeout(_listener, 0);
        }

        /** Slider.onmove
         *
         * User-defined listener function to slider movement
         *
         * @see Slider.listener
         */
         this.onmove = null;

         /**
         * ### Slider.timeFrom
         *
         * Time event from which measuring time
         *
         * Default: 'step'
         *
         * @see node.timer.getTimeSince
         */
         this.timeFrom = 'step';

    }

    // ## Slider methods

    /**
     * ### Slider.init
     *
     *
     * @param {object} opts Configuration options
     */
    Slider.prototype.init = function(opts) {
        var tmp, e;
        e = 'Slider.init: '

        if ('undefined' !== typeof opts.min) {
            tmp = J.isInt(opts.min);
            if ('number' !== typeof tmp) {
                throw new TypeError(e + 'min must be an integer or ' +
                'undefined. Found: ' + opts.min);
            }
            this.min = tmp;
        }
        if ('undefined' !== typeof opts.max) {
            tmp = J.isInt(opts.max);
            if ('number' !== typeof tmp) {
                throw new TypeError(e + 'max must be an integer or ' +
                'undefined. Found: ' + opts.max);
            }
            this.max = tmp;
        }

        this.scale = 100 / (this.max - this.min);

        tmp = opts.initialValue;
        if ('undefined' !== typeof tmp) {
            if (tmp === 'random') {
                tmp = J.randomInt((this.min-1), this.max);
            }
            else {
                tmp = J.isInt(tmp, this.min, this.max, true, true);
                if ('number' !== typeof tmp) {
                    throw new TypeError(e + 'initialValue must be an ' +
                    'integer >= ' + this.min + ' and =< ' + this.max +
                    ' or undefined. Found: ' + opts.initialValue);
                }

            }
            // currentValue is used with the first update.
            this.initialValue = this.currentValue = tmp;
        }

        if ('undefined' !== typeof opts.step) {
            tmp = J.isInt(opts.step);
            if ('number' !== typeof tmp) {
                throw new TypeError(e + 'step must be an integer or ' +
                'undefined. Found: ' + opts.step);
            }
            this.step = tmp;
        }

        if ('undefined' !== typeof opts.displayValue) {
            this.displayValue = !!opts.displayValue;
        }
        if ('undefined' !== typeof opts.displayNoChange) {
            this.displayNoChange = !!opts.displayNoChange;
        }

        if (opts.type) {
            if (opts.type !== 'volume' && opts.type !== 'flat') {
                throw new TypeError(e + 'type must be "volume", "flat", or ' +
                'undefined. Found: ' + opts.type);
            }
            this.type = opts.type;
        }

        tmp = opts.requiredChoice;

        if ('undefined' !== typeof tmp) {
            console.log('***Slider.init: requiredChoice is deprecated. Use ' +
            'required instead.***');
        }
        else if ('undefined' !== typeof opts.required) {
            tmp = opts.required;
        }
        if ('undefined' !== typeof tmp) {
            this.requiredChoice = this.required = !!tmp;
        }

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

        if (this.required && this.hint !== false) {
            if (opts.displayRequired !== false) this.hint += ' *';
        }

        if (opts.onmove) {
            if ('function' !== typeof opts.onmove) {
                throw new TypeError(e + 'onmove must be a function or ' +
                                    'undefined. Found: ' + opts.onmove);
            }
            this.onmove = opts.onmove;
        }

        if (opts.width) {
            if ('string' !== typeof opts.width) {
                throw new TypeError(e + 'width must be string or ' +
                                    'undefined. Found: ' + opts.width);
            }
            this.sliderWidth = opts.width;
        }

        if (opts.hoverColor) {
            if ('string' !== typeof opts.hoverColor) {
                throw new TypeError(e + 'hoverColor must be string or ' +
                                    'undefined. Found: ' + opts.hoverColor);
            }
            this.hoverColor = opts.hoverColor;
        }

        if ('undefined' !== typeof opts.correctValue) {
            if (false === J.isNumber(opts.correctValue,
                                     this.min, this.max, true, true)) {

                throw new Error(e + 'correctValue must be a number between ' +
                                this.min + ' and ' + this.max + '. Found: ' +
                                opts.correctValue);
            }
            this.correctValue = opts.correctValue;
        }

        tmp = opts.left;
        if ('undefined' !== typeof tmp) {
            if ('string' !== typeof tmp && 'number' !== typeof tmp) {
                throw new TypeError(e + 'left must be string, number or ' +
                                    'undefined. Found: ' + tmp);
            }
            this.left = '' + tmp;
        }
        tmp = opts.right;
        if ('undefined' !== typeof tmp) {
            if ('string' !== typeof tmp && 'number' !== typeof tmp) {
                throw new TypeError(e + 'right must be string, number or ' +
                                    'undefined. Found: ' + tmp);
            }
            this.right = '' + tmp;
        }
    };

    /**
     * ### Slider.append
     *
     *g
     * @param {object} opts Configuration options
     */
    Slider.prototype.append = function() {
        var container, tmp;

        // The original color of the rangeFill container (default black)
        // that is replaced upon highlighting.
        // Need to do js onmouseover because ccs:hover does not work here.
        var tmpColor;

        var that = this;

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'slider-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.bodyDiv, {
                className: 'slider-hint',
                innerHTML: this.hint
            });
        }

        container = W.add('div', this.bodyDiv, {
            className: 'container-slider'
        });

        if (this.left) {
            tmp = W.add('span', container);
            tmp.innerHTML = this.left;
            tmp.style.position = 'relative';
            tmp.style.top = '-20px';
            tmp.style.float = 'left';
        }

        this.rangeFill = W.add('div', container, {
            className: 'fill-slider',
            // id: 'range-fill'
        });

        this.slider = W.add('input', container, {
            className: 'volume-slider',
            // id: 'range-slider-input',
            name: 'rangeslider',
            type: 'range',
            min: this.min,
            max: this.max,
            step: this.step
        });

        this.slider.onmouseover = function() {
            tmpColor = that.rangeFill.style.background || 'black';
            that.rangeFill.style.background = that.hoverColor;
        };
        this.slider.onmouseout = function() {
            that.rangeFill.style.background = tmpColor;
        };

        if (this.sliderWidth) this.slider.style.width = this.sliderWidth;


        if (this.right) {
            tmp = W.add('span', container);
            tmp.innerHTML = this.right;
            tmp.style.position = 'relative';
            tmp.style.top = '-20px';
            tmp.style.float = 'right';
        }

        if (this.displayValue) {
            this.valueSpan = W.add('span', this.bodyDiv, {
                className: 'slider-display-value'
            });
        }

        if (this.displayNoChange) {
            this.noChangeSpan = W.add('span', this.bodyDiv, {
                className: 'slider-display-nochange',
                innerHTML: this.getText('noChange') + '&nbsp;'
            });
            this.noChangeCheckbox = W.add('input', this.noChangeSpan, {
                type: 'checkbox'
            });
            this.noChangeCheckbox.onclick = function() {
                if (that.noChangeCheckbox.checked) {
                    if (that.slider.value === that.initialValue) return;
                    that.slider.value = that.initialValue;
                    that.listener(true);
                    J.addClass(that.noChangeSpan, 'italic');
                }
                else {
                    J.removeClass(that.noChangeSpan, 'italic');
                }

            };
        }

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.slider.value = this.initialValue;
        this.slider.oninput = this.listener;

        this.slider.oninput(false, true);
    };

    Slider.prototype.getValues = function(opts) {
        var res, nochange;
        opts = opts || {};
        res = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (!this.isChoiceDone()) {
            if (opts.highlight) {
                this.highlight();
                this.setError(this.getText('error'));
            }
            res = false;
        }

        nochange = this.noChangeCheckbox && this.noChangeCheckbox.checked;

        return {
            value: this.currentValue,
            noChange: !!nochange,
            initialValue: this.initialValue,
            totalMove: this.totalMove,
            isCorrect: res,
            time: node.timer.getTimeSince(this.timeFrom)
        };
    };

    Slider.prototype.setValues = function(opts) {
        var value;
        if ('undefined' === typeof opts) opts = {};
        else if ('number' === typeof opts) opts = { value: opts };

        if (opts.correct && this.correctValue !== null) {
            value = this.correctValue;
        }
        else if ('number' !== typeof opts.value) {
            value = J.randomInt(0, 101)-1;

            // Check if movement is required and no movement was done and
            // the random value is equal to the current value. If so, add 1.
            if (this.required && this.totalMove === 0 &&
                value === this.slider.value) {

                    value++;
            }
        }
        else {
            value = opts.value;
        }

        this.slider.value = value;
        this.slider.oninput(false, false, true);
    };

    /**
     * ### Slider.disable
     *
     * Disables the slider
     */
    Slider.prototype.disable = function () {
        if (this.disabled === true) return;
        this.disabled = true;
        this.slider.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### Slider.enable
     *
     * Enables the dropdown menu
     */
    Slider.prototype.enable = function () {
        if (this.disabled === false) return;
        this.disabled = false;
        this.slider.disabled = false;
        this.emit('enabled');
    };

    /**
     * ### Slider.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see Slider.highlight
     * @see Slider.errorBox
     */
    Slider.prototype.setError = function(err) {
        this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
    };

    /**
     * ### Slider.isChoiceDone
     *
     * Returns TRUE if the slider has been moved (if requested)
     *
     * @return {boolean} TRUE if the choice is done
     */
    Slider.prototype.isChoiceDone = function() {
        var value, nochange;
        value = this.currentValue;
        nochange = this.noChangeCheckbox && this.noChangeCheckbox.checked;
        return !((this.required && this.totalMove === 0 && !nochange) ||
                (null !== this.correctValue && this.correctValue !== value));
    };

})(node);
