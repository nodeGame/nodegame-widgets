/**
 * # RiskGauge
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure risk preferences with different methods
 *
 * Available methods: Holt_Laury (default), and Bomb.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('RiskGauge', RiskGauge);

    // ## Meta-data

    RiskGauge.version = '0.6.0';
    RiskGauge.description = 'Displays an interface to ' +
        'measure risk preferences with different methods.';

    RiskGauge.title = 'Risk Gauge';
    RiskGauge.className = 'riskgauge';

    RiskGauge.texts =  {

        // Holt Laury.

        holt_laury_mainText:
            'Below you find a series of hypothetical lotteries, each ' +
            'contains two lotteries with different probabalities of winning. ' +
            'In each row, select the lottery you would rather take part in.',

        // Risk Bomb.

        bomb_mainText:
            'Below you see 100 black boxes. '+
            'All boxes contain a prize.'+
            'You have to decide how many boxes you want to open. You will ' +
            'the sum of all prizes that were in the boxes you opened. ' +
            '<strong>However, in one of these boxes there is a bomb.' +
            '</strong> If you open the box with the bomb, you get nothing.' +
            '<br><strong> How many boxes do you want to open?</strong><br>',

        bomb_hint:
            'Use the slider to change the number of boxes you want to open.',

        bomb_prize: 'Each box contains: ',

        bomb_currentValue: ' Number of boxes to open: ',

        bomb_currentPrize: ' You can win: ',

        bomb_currency: 'ECU',

        bomb_openButton: 'Open Boxes',

        bomb_warning: 'You have to open at least one box!',

        bomb_win: 'You did not open the box with the bomb and won.',

        bomb_lose: 'You opened the box with the bomb and lost.',

        bomb_sliderValue:  function(widget, value) {
            return '<p>' + resultMessages.currentValue + value + '</p>' +
            hider + resultMessages.Prize + scale + currency + '</p>' +
            hider + resultMessages.currentPrize +
            value * scale + currency + '</p>';
        }

    };

    // Backward compatibility.
    RiskGauge.texts.mainText = RiskGauge.texts.holt_laury_mainText;

    // ## Dependencies
    RiskGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## RiskGauge constructor
     *
     * Creates a new instance of RiskGauge
     *
     * @see RiskGauge.init
     */
    function RiskGauge() {

        /**
         * ### RiskGauge.methods
         *
         * List of available methods
         *
         * Maps names to functions.
         *
         * Each function is called with `this` instance as context,
         * and accepts the `options` parameters passed to constructor.
         * Each method must return widget-like gauge object
         * implementing functions: append, enable, disable, getValues
         * or an error will be thrown.
         */
        this.methods = {};

        /**
         * ## RiskGauge.method
         *
         * The method used to measure mood
         *
         * Available methods: 'Holt_Laury', 'Bomb'
         *
         * Default method is: 'Holt_Laury'
         *
         * References:
         *
         * Holt, C. A., & Laury, S. K. (2002).
         * Risk aversion and incentive effects.
         * American economic review, 92(5), 1644-1655.
         */
        this.method = 'Holt_Laury';

        /**
         * ### RiskGauge.mainText
         *
         * A text preceeding the SVO gauger
         */
        this.mainText = null;

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring mood
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('Holt_Laury', holtLaury);
        this.addMethod('Bomb', bomb);
    }

    // ## RiskGauge methods.

    /**
     * ### RiskGauge.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    RiskGauge.prototype.init = function(opts) {
        var gauge;
        if ('undefined' !== typeof opts.method) {
            if ('string' !== typeof opts.method) {
                throw new TypeError('RiskGauge.init: method must be string ' +
                                    'or undefined: ' + opts.method);
            }
            if (!this.methods[opts.method]) {
                throw new Error('RiskGauge.init: method is invalid: ' +
                                opts.method);
            }
            this.method = opts.method;
        }
        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError('RiskGauge.init: mainText must be string ' +
                                    'or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        // Call method.
        gauge = this.methods[this.method].call(this, opts);

        // Check properties.
        if (!node.widgets.isWidget(gauge)) {
            throw new Error('RiskGauge.init: method ' + this.method +
                            ' created invalid gauge: missing default widget ' +
                            'methods.')
        }

        // Approved.
        this.gauge = gauge;

        this.on('enabled', function() {
            if (gauge.enable) gauge.enable();
        });

        this.on('disabled', function() {
            if (gauge.disable) gauge.disable();
        });

        this.on('highlighted', function() {
            if (gauge.highlight) gauge.highlight();
        });

        this.on('unhighlighted', function() {
            if (gauge.unhighlight) gauge.unhighlight();
        });
    };

    RiskGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv, { panel: false });
    };

    /**
     * ## RiskGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    RiskGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new TypeError('RiskGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new TypeError('RiskGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('RiskGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    RiskGauge.prototype.getValues = function(opts) {
        return this.gauge.getValues(opts);
    };

    RiskGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
    };

    // ## Methods.

    // ### Holt and Laury

    function makeProbString(p1, v1, p2, v2, opts) {
        var of, cur, sep, out;
        opts = opts || {};
        of = (opts.of || ' chance to win ');
        cur = opts.currency || '$';
        sep = opts.sep || '<span class="sep">and</span>';
        out = p1 + of;
        // Place currency sign before or after.
        out += opts.currencyAfter ? v1 + cur : cur + v1;
        out += sep + p2 + of;
        return out + (opts.currencyAfter ? v2 + cur : cur + v2);
    }

    function holtLaury(options) {
        var items, gauge, i, len, j;
        var tmp, v1, v2, v3, v4, p1, p2;

        tmp = options.values || [ 2, 1.6, 3.85, 0.1 ];

        if (options.scale) {
            tmp = tmp.map(function(i) { return i * options.scale; });
        }
        // Make it two decimals.
        v1 = tmp[0].toFixed(2);
        v2 = tmp[1].toFixed(2);
        v3 = tmp[2].toFixed(2);
        v4 = tmp[3].toFixed(2);

        len = 10;
        items = new Array(len);
        for (i = 0; i < len ; i++) {
            j = i + 1;
            p1 = j + '/' + len;
            p2 = (len - j) + '/' + len;
            items[i] = {
                id: 'hl_' + j,
                left: j + '. ',
                choices: [
                    makeProbString(p1, v1, p2, v2, options),
                    makeProbString(p1, v3, p2, v4, options),
                ]
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: options.id || 'holt_laury',
            items: items,
            mainText: this.mainText || this.getText('holt_laury_mainText'),
            title: false,
            requiredChoice: true,
            storeRef: false
        });

        return gauge;
    }


    // ### Bomb Risk

    function bomb(opts) {
        var that = this;

        var currency, prBomb, infoDiv;
        var resultMessages;

        // The table displaying how many boxes to open.
        var table;

        // The slider to select how many boxes.
        var slider;

        // The open box button.
        var button;

        // Private variable: the id value of the box with the bomb.
        var bombBox;

        // Probability that there is one bomb (default 1).
        if ('undefined' !== typeof opts.propBomb) {
            if (false === J.isNumber(opts.propBomb, 0, 1, true)) {
                throw new TypeError('BombRisk.init: propBomb must be number ' +
                                    'or undefined. Found: ' + opts.propBomb);
            }
            this.propBomb = opts.propBomb;
        }
        else {
            this.propBomb = 1;
        }

        // Maxi number of boxes to open (default 99 if probBomb = 1, else 100).
        if ('undefined' !== typeof opts.maxBoxes) {
            if (!J.isInt(opts.maxBoxes, 0, 100)) {
                throw new TypeError('BombRisk.init: maxBoxes must be an ' +
                                    'integer <= 100 or undefined. Found: ' +
                                    opts.maxBoxes);
            }
            this.maxBoxes = opts.maxBoxes;
        }
        else {
            this.maxBoxes = this.propBomb === 1 ? 99 : 100;
        }

        // Is there going to be an actual prize for it?
        this.withPrize =
            'undefined' === typeof opts.withPrize ? true : !!opts.withPrize;


        // Pick bomb box id, if probability permits it, else set to 101.
        bombBox = (prBomb === 0 || Math.random() <= prBomb) ? 101 :
            Math.ceil(Math.random()*100);

        // Building display.

        // Main text.
        W.add('div', this.bodyDiv, {
            innerHTML: this.getText('mainText')
        });

        // Table.
        table = makeTable();
        this.bodyDiv.appendChild(table);

        // Info div.
        infoDiv = this.infoDiv = W.add('div', this.bodyDiv);
        W.add('p', infoDiv, {
            innerHTML: this.getText('bomb_currentValue') +
                       ' <span id="numboxes">0</span>'
        });
        W.add('p', infoDiv, {
            innerHTML: this.getText('bomb_prize') +
                       ': <span id="numboxes">1 +</span>'
        });
        W.add('p', infoDiv, {
            innerHTML: this.getText('bomb_prize') +
                       ': <span id="numboxes">1 +</span>'
        });

        // Slider.
        slider = this.slider = node.widgets.get('Slider', {
            id: opts.id || 'bomb',
            min: 0,
            max: this.maxBoxes,
            mainText: resultMessages.mainText + table,
            hint: resultMessages.hint,
            title: false,
            initialValue: 0,
            displayNoChange: false,
            required: true,
            texts: {
                currentValue: this.getText('sliderValue')
            },
            onmove: function(value) {
                var i, div;
                // Need to do until maxBoxes in case we are reducing the value.
                for (i = 0; i < that.maxBoxes; i++) {
                    if (value > 0) {
                        button.style.display = '';
                        W.gid('warn').style.display = 'none';
                    }
                    div = W.gid(String(i));
                    if (value > i) div.style.background = '#1be139';
                    else div.style.background = '#000000';
                }

            },
            storeRef: false,
            width: '100%'
        });

        button = this.openBtn = W.add('button', this.bodyDiv, {
            id: 'openBtn',
            className: 'btn-danger'
        });

        button.onclick = function() {
            if (bombBox < 101) {
                W.gid(String(bombBox-1)).style.background = '#fa0404';
            }
            slider.hide();
            W.hide(button);
            if (slider.getValues().value < bombBox) W.show('won');
            else W.show('lost');
        };

        return this;
    }

    // Helper methods.

    function makeBoxLine(j) {
        var i, out, id;
        out = '<tr>';

        for (i = 0; i < 10; i++) {
            id = j > 0 ? String(j) + String(i) : i;
            out = out + '<td>' +
            '<div class="square" id="' + id +
            '" style="height: 50px; width: 50px; background: black">' +
            '</td>';

            if (i === 9) this.out = this.out + '</tr>';
        }
        return out;
    }

    function makeTable() {
        var j, out;
        out = '<table style="width:60%; margin-left:20%; margin-right:20%">';
        //k=l;
        for (j = 0; j < 10; j++) {
            out = out + makeBoxLine(j);
            if (j === 9) this.out = this.out + '</table><br>';
        }
        return out;
    }


})(node);
