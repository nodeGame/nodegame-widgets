/**
 * # SVOGauge
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' social value orientation (S.V.O.)
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('SVOGauge', SVOGauge);

    // ## Meta-data

    SVOGauge.version = '0.7.0';
    SVOGauge.description = 'Displays an interface to measure social ' +
        'value orientation (S.V.O.).';

    SVOGauge.title = 'SVO Gauge';
    SVOGauge.className = 'svogauge';

    SVOGauge.texts.mainText = 'Select your preferred option among those' +
                               ' available below:';
    SVOGauge.texts.left = 'You:<hr/>Other:';

    // ## Dependencies

    SVOGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## SVOGauge constructor
     *
     * Creates a new instance of SVOGauge
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to SVOGauge.init.
     *
     * @see SVOGauge.init
     */
    function SVOGauge(options) {

        /**
         * ### SVOGauge.methods
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
         * ## SVOGauge.method
         *
         * The method used to measure svo
         *
         * Available methods: 'Slider'
         *
         * Default method is: 'Slider'
         *
         * References:
         *
         * 'Slider', Murphy R.O., Ackermann K.A. and Handgraaf M.J.J. (2011).
         * "Measuring social value orientation"
         */
        this.method = 'Slider';

        /**
         * ### SVOGauge.mainText
         *
         * A text preceeding the SVO gauger
         */
        this.mainText = null;

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring svo
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('Slider', SVO_Slider);
    }

    // ## SVOGauge methods.

    /**
     * ### SVOGauge.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    SVOGauge.prototype.init = function(opts) {
        var gauge;
        if ('undefined' !== typeof opts.method) {
            if ('string' !== typeof opts.method) {
                throw new TypeError('SVOGauge.init: method must be string ' +
                                    'or undefined. Found: ' + opts.method);
            }
            if (!this.methods[opts.method]) {
                throw new Error('SVOGauge.init: method is invalid: ' +
                                opts.method);
            }
            this.method = opts.method;
        }
        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError('SVOGauge.init: mainText must be string ' +
                                    'or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }

        // Call method.
        gauge = this.methods[this.method].call(this, opts);
        // Check properties.
        checkGauge(this.method, gauge);
        // Approved.
        this.gauge = gauge;

        this.on('enabled', function() {
            gauge.enable();
        });

        this.on('disabled', function() {
            gauge.disable();
        });

        this.on('highlighted', function() {
            gauge.highlight();
        });

        this.on('unhighlighted', function() {
            gauge.unhighlight();
        });
    };

    SVOGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv);
    };

    /**
     * ## SVOGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    SVOGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new Error('SVOGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new Error('SVOGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('SVOGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    SVOGauge.prototype.getValues = function(opts) {
        opts = opts || {};
        // Transform choice in numerical values.
        if ('undefined' === typeof opts.processChoice) {
            opts.processChoice = function(choice) {
                return choice === null ? null : this.choices[choice];
            };
        }
        return this.gauge.getValues(opts);
    };

    SVOGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
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
            throw new Error('SVOGauge.init: method ' + method +
                            'did not create element gauge.');
        }
        if ('function' !== typeof gauge.getValues) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function getValues.');
        }
        if ('function' !== typeof gauge.enable) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function enable.');
        }
        if ('function' !== typeof gauge.disable) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function disable.');
        }
        if ('function' !== typeof gauge.append) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function append.');
        }
    }

    // ## Available methods.

    // ### SVO_Slider
    function SVO_Slider(options) {
        var items, sliders;
        var gauge, i, len;
        var renderer;

        sliders = options.sliders || [
            [
                [85, 85],
                [85, 76],
                [85, 68],
                [85, 59],
                [85, 50],
                [85, 41],
                [85, 33],
                [85, 24],
                [85, 15]
            ],
            [
                [85, 15],
                [87, 19],
                [89, 24],
                [91, 28],
                [93, 33],
                [94, 37],
                [96, 41],
                [98, 46],
                [100, 50]
            ],
            [
                [50, 100],
                [54, 98],
                [59, 96],
                [63, 94],
                [68, 93],
                [72, 91],
                [76, 89],
                [81, 87],
                [85, 85]
            ],
            [
                [50, 100],
                [54, 89],
                [59, 79],
                [63, 68],
                [68, 58],
                [72, 47],
                [76, 36],
                [81, 26],
                [85, 15]
            ],
            [
                [100, 50],
                [94, 56],
                [88, 63],
                [81, 69],
                [75, 75],
                [69, 81],
                [63, 88],
                [56, 94],
                [50, 100]
            ],
            [
                [100, 50],
                [98, 54],
                [96, 59],
                [94, 63],
                [93, 68],
                [91, 72],
                [89, 76],
                [87, 81],
                [85, 85]
            ]
        ];

        this.sliders = sliders;


        renderer = options.renderer || function(td, choice, idx) {
            td.innerHTML = choice[0] + '<hr/>' + choice[1];
        };

        len = sliders.length;
        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: (i+1),
                left: this.getText('left'),
                choices: sliders[i]
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: 'svo_slider',
            items: items,
            // TODO: should it be on getText at all?
            mainText: this.mainText || this.getText('mainText'),
            title: false,
            renderer: renderer,
            requiredChoice: true,
            storeRef: false
        });

        return gauge;
    }

})(node);
