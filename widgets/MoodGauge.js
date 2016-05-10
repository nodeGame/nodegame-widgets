/**
 * # MoodGauge
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting currency
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoodGauge', MoodGauge);

    // ## Meta-data

    MoodGauge.version = '0.1.1';
    MoodGauge.description = 'Displays an interface to measure mood ' +
        'and emotions.';

    MoodGauge.title = 'Mood Gauge';
    MoodGauge.className = 'moodgauge';

    MoodGauge.method = {
        JSUS: {}
    };

    // ## Dependencies

    MoodGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## MoodGauge constructor
     *
     * Creates a new instance of MoodGauge
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to MoodGauge.init.
     *
     * @see MoodGauge.init
     */
    function MoodGauge(options) {

        /**
         * ### MoodGauge.methods
         *
         * List of available methods
         *
         * Maps names to functions.
         *
         * Each function is called with `this` instance as context,
         * and accepts the `options` parameters passed to constructor.
         * Each method must create:
         *
         *   - `this.gauge`: the widget-like object storing all values,
         *        implementing functions: enable, disable, getAllValues
         *   - `this.gaugeRoot`: the HTML element to be appended to
         *        `this.bodyDiv`
         *
         * or an error will be thrown
         */
        this.methods = {};

        /**
         * ## MoodGauge.method
         *
         * The method used to measure mood
         *
         * Available methods: 'I-PANAS-SF'
         *
         * Default method is: 'I-PANAS-SF'
         *
         * References:
         *
         * 'I-PANAS-SF', Thompson E.R. (2007) "Development
         * and Validation of an Internationally Reliable Short-Form of
         * the Positive and Negative Affect Schedule (PANAS)"
         */
        this.method = 'I-PANAS-SF';

        this.addMethod('I-PANAS-SF', I_PANAS_SF);

        this.init(options);
    }

    // ## MoodGauge methods.

    /**
     * ### MoodGauge.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     */
    MoodGauge.prototype.init = function(options) {
        if ('undefined' !== typeof options.method) {
            if ('string' !== typeof options.method) {
                throw new TypeError('MoodGauge.init: options.method must be ' +
                                    'string or undefined: ' + options.method);
            }
            if (!this.methods[options.method]) {
                throw new Error('MoodGauge.init: options.method is not a ' +
                                'valid method: ' + options.method);
            }
            this.method = options.method;
        }

        // Call method.
        this.methods[this.method].call(this, options);

        if (!this.gauge) {
            throw new Error('MoodGauge.init: method ' + this.method +
                            'did not create element gauge.');
        }
        if ('function' !== typeof this.gauge.getAllValues) {
            throw new Error('MoodGauge.init: method ' + this.method +
                            ': gauge missing function getAllValues.');
        }
        if ('function' !== typeof this.gauge.enable) {
            throw new Error('MoodGauge.init: method ' + this.method +
                            ': gauge missing function enable.');
        }
        if ('function' !== typeof this.gauge.enable) {
            throw new Error('MoodGauge.init: method ' + this.method +
                            ': gauge missing function disable.');
        }
        if (!this.gaugeRoot) {
            throw new Error('MoodGauge.init: method ' + this.method +
                            'did not create element gaugeRoot.');
        }
    };

    MoodGauge.prototype.append = function() {
        this.bodyDiv.appendChild(this.gaugeRoot);
    };

    MoodGauge.prototype.listeners = function() {};

    /**
     * ## MoodGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    MoodGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new Error('MoodGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new Error('MoodGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('MoodGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    MoodGauge.prototype.getAllValues = function() {
        return this.gauge.getAllValues();
    };

    MoodGauge.prototype.enable = function() {
        return this.gauge.enable();
    };
    MoodGauge.prototype.enable = function() {
        return this.gauge.disable();
    };

    function I_PANAS_SF(options) {
        var items, emotions, mainText, choices;
        var i, len;

        mainText = 'Thinking about yourself and how you normally feel, ' +
            'to what extent do you generally feel: ';

        choices = [ 'never', '1', '2', '3', '4', '5', 'always' ];

        emotions = [
            'Upset',
            'Hostile',
            'Alert',
            'Ashamed',
            'Inspired',
            'Nervous',
            'Determined',
            'Attentive',
            'Afraid',
            'Active'
        ];

        len = emotions.length;

        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: emotions[i],
                descr: emotions[i],
                choices: choices
            };
        }

        this.gauge = node.widgets.get('ChoiceTableGroup', {
            id: 'ipnassf',
            items: items,
            mainText: mainText,
            title: false
        });

        this.gaugeRoot = this.gauge.table;
    }

})(node);
