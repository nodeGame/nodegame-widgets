/**
 * # MoodGauge
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to query users about mood, emotions and well-being
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoodGauge', MoodGauge);

    // ## Meta-data

    MoodGauge.version = '0.2.0';
    MoodGauge.description = 'Displays an interface to measure mood ' +
        'and emotions.';

    MoodGauge.title = 'Mood Gauge';
    MoodGauge.className = 'moodgauge';

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
         * Each method must return widget-like gauge object
         * implementing functions: append, enable, disable, getValues
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

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring mood
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('I-PANAS-SF', I_PANAS_SF);
    }

    // ## MoodGauge methods.

    /**
     * ### MoodGauge.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     */
    MoodGauge.prototype.init = function(options) {
        var gauge;
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
        gauge = this.methods[this.method].call(this, options);
        // Check properties.
        checkGauge(this.method, gauge);
        // Approved.
        this.gauge = gauge;
    };

    MoodGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv);
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

    MoodGauge.prototype.getValues = function(opts) {
        return this.gauge.getValues(opts);
    };

    MoodGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
    };

    MoodGauge.prototype.enable = function() {
        return this.gauge.enable();
    };
    MoodGauge.prototype.enable = function() {
        return this.gauge.disable();
    };

    // ## Helper functions.

    /**
     * ### checkGauge
     *
     * Checks if a gauge is properly constructed, throws an error otherwise
     *
     * @param {string} method The name of the method creating it
     * @param {object} gauge The object to check
     *
     * @see ModdGauge.init
     */
    function checkGauge(method, gauge) {
        if (!gauge) {
            throw new Error('MoodGauge.init: method ' + method +
                            'did not create element gauge.');
        }
        if ('function' !== typeof gauge.getValues) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function getValues.');
        }
        if ('function' !== typeof gauge.enable) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function enable.');
        }
        if ('function' !== typeof gauge.disable) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function disable.');
        }
        if ('function' !== typeof gauge.append) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function append.');
        }
    }

    // ## Available methods.

    // ### I_PANAS_SF
    function I_PANAS_SF(options) {
        var items, emotions, mainText, choices, left, right;
        var gauge, i, len;

        if ('undefined' === typeof options.mainText) {
            mainText = 'Thinking about yourself and how you normally feel, ' +
                'to what extent do you generally feel: ';
        }
        else if ('string' === typeof options.mainText) {
            mainText = options.mainText;
        }
        // Other types ignored.

        choices = options.choices ||
            [ '1', '2', '3', '4', '5' ];

        emotions = options.emotions || [
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

        left = options.left || 'never';

        right = options.right || 'always';

        len = emotions.length;

        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: emotions[i],
                left: '<span class="emotion">' + emotions[i] + ':</span> never',
                right: right,
                choices: choices
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: 'ipnassf',
            items: items,
            mainText: mainText,
            title: false,
            requiredChoice: true
        });

        return gauge;
    }

})(node);
