/**
 * # Slider
 * Copyright(c) 2020 Stefano Balietti
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

    Slider.version = '0.3.0';
    Slider.description = 'Creates a configurable Slider ';

    Slider.title = false;
    Slider.className = 'slider';

    // ## Dependencies

    Slider.dependencies = {
        JSUS: {}
    };

    Slider.texts = {
        currentValue: function(widget, value) {
            return 'Value: ' + value;
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
         * The SPAN element containint the current value
         *
         * @see Slider.displayValue
         */
        this.valueSpan = null;

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

        /** Slider.listener
         *
         * The main function listening for slider movement
         *
         * Calls user-defined listener oninput
         *
         * @see Slider.onmove
         */
        var timeOut = null;
        this.listener = function() {
            if (timeOut) return;

            if (that.isHighlighted()) that.unhighlight();

            timeOut = setTimeout(function() {
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
                    that.valueSpan.innerHTML = that.getText('currentValue',
                    that.slider.value);
                }

                that.totalMove += Math.abs(diffPercent);

                if (that.onmove) {
                    that.onmove.call(that, that.slider.value, diffPercent);
                }

                timeOut = null;
            }, 0);
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

        this.scale = 100 / (this.max-this.min);

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

        if ('undefined' !== typeof opts.displayValue) {
            this.displayValue = !!opts.displayValue;
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
            // TODO: Do we need it?
            // this.hint = this.getText('autoHint');
        }

        if (this.required) {
            if (!this.hint) this.hint = 'Movement required';
            this.hint += ' *';
        }

        if (opts.onmove) {
            if ('function' !== typeof opts.onmove) {
                throw new TypeError(e + 'onmove must be a function or ' +
                                    'undefined. Found: ' + opts.onmove);
            }
            this.onmove = opts.onmove;
        }

        //TODO: not working
        if (opts.width) {
            if ('string' !== typeof opts.width) {
                throw new TypeError(e + 'width must be string or ' +
                                    'undefined. Found: ' + opts.width);
            }
            this.sliderWidth = opts.width;
        }
    };

    /**
     * ### Slider.append
     *
     *g
     * @param {object} opts Configuration options
     */
    Slider.prototype.append = function() {
        var container;

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
            max: this.max
        });

        if (this.sliderWidth) this.slider.style.width = this.sliderWidth;

        if (this.displayValue) {
            this.valueSpan = W.add('span', this.bodyDiv, {
                className: 'slider-display-value'
            })
        }

        this.slider.oninput = this.listener;
        this.slider.value = this.initialValue;

        this.slider.oninput();
    };

    Slider.prototype.getValues = function(opts) {
        var res, value;
        opts = opts || {};
        res = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        value = this.currentValue;
        if ((this.required && this.totalMove === 0) ||
           (null !== this.correctValue && this.correctValue !== value)) {

            if (opts.highlight) this.highlight();
            res = false;
        }

        return {
            value: value,
            initialValue: this.initialValue,
            totalMove: this.totalMove,
            isCorrect: res,
            time: node.timer.getTimeSince(this.timeFrom)
        };
    };


})(node);
