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

    RiskGauge.version = '0.8.0';
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

        // Bomb.

        // probBomb is passed as input param because it may be hidden.
        bomb_mainText: function(widget, probBomb) {
            var str;
            str = '<p style="margin-bottom: 0.3em">';
            str +=  'Below there are ' + widget.totBoxes + ' black boxes. ';
            str += 'Every box contains a prize of ' +
                    widget.boxValue + ' ' + widget.currency + ', but ';
            if (probBomb === 1) {
                str += 'one random box contains a <em>bomb</em>.';
            }
            else {
                if (widget.revealProbBomb) {
                    str += 'with probability ' + probBomb +
                    ' one random box contains a <em>bomb</em>.';
                }
                else {
                    str += 'one random box might contain a <em>bomb</em>.';
                }
            }
            str += ' You must decide how many boxes you want to open.';
            str += '</p>';
            if (widget.withPrize) {
                str += '<p style="margin-bottom: 0.3em">';
                str += 'You will receive a reward equal to the ' +
                       'sum of all the prizes in every opened ' +
                       'box. However, if you open the box ' +
                       'with the bomb, you get nothing.</p>'
            }
            str += '<p style="margin-bottom: 0.5em">';
            str += '<strong>How many boxes do you want to open ';
            str += 'between 1 and ' + widget.maxBoxes + '?</strong></p>';
            return str;
        },

        bomb_sliderHint:
            'Move the slider to choose the number of boxes to open, ' +
            'then click "Open Boxes"',

        bomb_boxValue: 'Prize per box: ',

        bomb_numBoxes: 'Number of boxes: ',

        bomb_totalWin: 'Total reward: ',

        bomb_openButton: 'Open Boxes',

        bomb_warn: 'Open at least one box.',

        bomb_won: 'You won! You did not open the box with the bomb.',

        bomb_lost: 'You lost! You opened the box with the bomb.'
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
        var gauge, that;
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

        // Add defaults.
        that = this;
        gauge.isHidden = function() { return that.isHidden(); };
        gauge.isCollapsed = function() { return that.isCollapsed(); };

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
        var that;
        that = this;

        // Private variables.

        // Probability that there is a bomb. Default 1.
        var probBomb;

        // The index of the box with the bomb (0 to totBoxes), or -1 if no bomb.
        var bombBox;

        // Div containing info about how many boxes to open, etc.
        var infoDiv;

        // Paragraph containing the outcome of opening the box or a warning.
        var bombResult;

        // The Slider widget to select how many boxes to open.
        var slider;

        // The open box button.
        var button;

        // Flag that participant did not found the bomb.
        var isWinner;

        // Holds the final number of boxes opened after clicking the button.
        var finalValue;

        // Init private variables.

        // The height of every box in px (default: 30px in css).
        if (opts.boxHeight) {
            if ('string' !== typeof opts.boxHeight) {
                throw new Error('Bomb.init: boxHeight must be string ' +
                                'or undefined. Found: ' + opts.boxHeight);
            }
            W.cssRule('div.riskgauge .bomb-box { height: ' +
                      opts.boxHeight + '}');
        }

        if ('undefined' !== typeof opts.probBomb) {
            if (false === J.isNumber(opts.probBomb, 0, 1, true, true)) {
                throw new Error('Bomb.init: probBomb must be a number ' +
                'between 0 and 1 or undefined. Found: ' +
                opts.probBomb);
            }
            probBomb = opts.probBomb;
        }
        else {
            probBomb = 1;
        }

        // Variable bombBox is init after totBoxes is validated.

        // Public variables.

        // Store locally because they are overwritten. TODO: check if needed.
        this._highlight = this.highlight;
        this._unhighlight = this.unhighlight;

        // The value of each box. Default 0.01.
        if ('undefined' !== typeof opts.boxValue) {
            this.boxValue = J.isNumber(opts.boxValue, 0);
            if (!this.boxValue) {
                throw new TypeError('Bomb.init: boxValue must be an ' +
                                    'a number > 0 or undefined. Found: ' +
                                    opts.boxValue);
            }
        }
        else {
            this.boxValue = 0.01;
        }

        // The currency of the prize. Default: USD.
        this.currency = opts.currency || 'USD';

        // Flag TRUE if the probability that a bomb exists is revealed.
        this.revealProbBomb = 'undefined' === typeof opts.revealProbBomb ?
                              true : !!opts.revealProbBomb;

        // Max number of boxes to open (default 99 if probBomb = 1, else 100).
        if ('undefined' !== typeof opts.totBoxes) {
            if (!J.isInt(opts.totBoxes, 0, 10000, false, true)) {
                throw new TypeError('Bomb.init: maxBoxes must be an ' +
                'integer > 0 and <= 10000 or undefined. Found: ' +
                opts.totBoxes);
            }
            this.totBoxes = opts.totBoxes;
        }
        else {
            this.totBoxes = 100;
        }

        // Max num of boxes to open.
        // Default totBoxes -1 if probBomb = 1, else this.totBoxes.
        if ('undefined' !== typeof opts.maxBoxes) {
            if (!J.isInt(opts.maxBoxes, 0, this.totBoxes)) {
                throw new TypeError('Bomb.init: maxBoxes must be a positive' +
                                    ' integer <= ' + this.totBoxes +
                                    ' or undefined. Found: ' + opts.maxBoxes);
            }
            this.maxBoxes = opts.maxBoxes;
        }
        else {
            this.maxBoxes = probBomb === 1 ? this.totBoxes - 1 : this.totBoxes;
        }

        // Number of boxes in each row.
        if ('undefined' !== typeof opts.boxesInRow) {
            if (!J.isInt(opts.boxesInRow, 0)) {
                throw new TypeError('Bomb.init: boxesInRow must be a positive' +
                                    ' integer or undefined. Found: ' +
                                    opts.boxesInRow);
            }
            this.boxesInRow = opts.boxesInRow > this.totBoxes ?
                                  this.totBoxes : opts.boxesInRow;
        }
        else {
            this.boxesInRow = this.totBoxes < 10 ? this.totBoxes : 10;
        }

        // If TRUE, there is an actual prize for the participant. Default: TRUE.
        this.withPrize = 'undefined' === typeof opts.withPrize ?
                         true : !!opts.withPrize;

        // Bomb box.
        // Pick bomb box id, if probability permits it, else set to -1.
        // Resulting id is between 1 and totBoxes.
        bombBox = Math.random() >= probBomb ?
                  -1 : Math.ceil(Math.random() * this.totBoxes);

        // Return widget-like object.
        return {

            setValues: function(opts) {
                slider.setValues(opts);
            },

            getValues: function(opts) {
                var out, values, nb, ic;
                opts = opts || {};
                values = slider.getValues();
                // We use finalValue, because values.value might be manipulated.
                if ('undefined' !== typeof finalValue) {
                    nb = finalValue;
                    ic = true
                }
                else {
                    // TODO: slider.getValues returns non-integers. Check.
                    nb = parseInt(slider.slider.value, 10);
                    ic = false;
                }
                out = {
                    value: nb,
                    isCorrect: ic,
                    totalMove: values.totalMove,
                    isWinner: isWinner,
                    time: values.time,
                    reward: 0
                };
                if (!out.isCorrect &&
                    ('undefined' === typeof opts.highlight || opts.highlight)) {

                        slider.highlight();
                }
                if (isWinner === true) out.reward = finalValue * that.boxValue;
                return out;
            },

            highlight: function() {
                slider.highlight();
            },

            unhighlight: function() {
                slider.unhighlight();
            },

            // slider: slider,

            append: function() {
                var nRows;

                // Main text.
                W.add('div', that.bodyDiv, {
                    innerHTML: that.mainText ||
                               that.getText('bomb_mainText', probBomb)
                });

                // Slider.
                slider = node.widgets.add('Slider', that.bodyDiv, {
                    min: 0,
                    max: that.maxBoxes,
                    hint: that.getText('bomb_sliderHint'),
                    title: false,
                    initialValue: 0,
                    displayValue: false,
                    displayNoChange: false,
                    type: 'flat',
                    required: true,
                    panel: false,
                    // texts: {
                    //     currentValue: that.getText('sliderValue')
                    // },
                    onmove: function(value) {
                        var i, div, c, v;

                        // TODO: not working.
                        // if (that.isHighlighted()) that._unhighlight();
                        that._unhighlight();

                        if (value > 0) {
                            button.style.display = '';
                            button.disabled = false;
                            bombResult.innerHTML = '';
                        }
                        else {
                            button.style.display = 'none';
                            bombResult.innerHTML = that.getText('bomb_warn');
                            button.disabled = true;
                        }

                        // Need to do until maxBoxes
                        // in case we are reducing the value.
                        for (i = 0; i < that.maxBoxes; i++) {
                            div = W.gid(getBoxId(i));
                            if (value > i) div.style.background = '#1be139';
                            else div.style.background = '#000000';
                        }

                        // Update display.
                        W.gid('bomb_numBoxes').innerText = value;
                        c = that.currency;
                        v = that.boxValue;
                        if (that.withPrize) {
                            W.gid('bomb_boxValue').innerText = v + c;
                            W.gid('bomb_totalWin').innerText =
                                Number((value * v)).toFixed(2) + c;
                        }
                    },
                    storeRef: false,
                    width: '100%'
                });

                // Table.
                nRows = Math.ceil(that.totBoxes / that.boxesInRow);
                W.add('div', that.bodyDiv, {
                    innerHTML: makeTable(nRows, that.boxesInRow, that.totBoxes)
                });

                // Info div.
                infoDiv = W.add('div', that.bodyDiv, {
                    className: 'risk-info',
                });

                W.add('p', infoDiv, {
                    innerHTML: that.getText('bomb_numBoxes') +
                               '&nbsp;<span id="bomb_numBoxes">0</span>'
                });

                if (that.withPrize) {
                    W.add('p', infoDiv, {
                        innerHTML: that.getText('bomb_boxValue') +
                        '&nbsp;<span id="bomb_boxValue">' +
                        this.boxValue + '</span>'
                    });
                    W.add('p', infoDiv, {
                        innerHTML: that.getText('bomb_totalWin') +
                        '&nbsp;<span id="bomb_totalWin">0</span>'
                    });
                }

                bombResult = W.add('p', infoDiv, { id: 'bomb_result' });

                button = W.add('button', that.bodyDiv, {
                    className: 'btn-danger',
                    innerHTML: that.getText('bomb_openButton'),
                });
                // Initially hidden.
                button.style.display = 'none';

                button.onclick = function() {
                    var cl;
                    // Set global variables.
                    // slider.getValues().value fails (no int numbers).
                    finalValue = parseInt(slider.slider.value, 10);

                    // Update table.
                    if (bombBox > -1) {
                        // Variable bombBox is between 1 and totBoxes.
                        // Cells in table are 0-indexed.
                        W.gid(getBoxId(bombBox-1)).style.background = '#fa0404';
                        isWinner = finalValue < bombBox;
                    }
                    else {
                        isWinner = true;
                    }
                    // Hide slider and button
                    slider.hide();
                    W.hide(button);
                    // Give feedback.
                    cl = 'bomb_' + (isWinner ? 'won' : 'lost');
                    bombResult.innerHTML = that.getText(cl);
                    bombResult.className += (' ' + cl);
                };
            }
        };
    }

    // ### Helper methods.

    // Returns the Bomb Box Id in the HTML from its index.
    function getBoxId(i) {
        return 'bc_' + i;
    }

    //
    function makeBoxRow(rowId, boxesInRow, colSpan) {
        var i, out;
        out = '<tr>';
        for (i = 0; i < boxesInRow; i++) {
            // If there are not enough boxes in this row, do a long colspan.
            if (colSpan && i > colSpan) {
                out = out + '<td colspan="' + (boxesInRow - colSpan) +
                      '"></td>';
                break;
            }
            out = out + '<td><div class="bomb-box square" id="' +
            getBoxId(i + (boxesInRow * rowId)) + '"></td>';
        }
        out += '</tr>';
        return out;
    }

    function makeTable(nRows, boxesInRow, totBoxes) {
        var rowId, out, boxCount, colSpan;
        out = '<table class="bomb-table">';
        for (rowId = 0; rowId < nRows; rowId++) {
            // Check if the last row has less cells to complete the row.
            boxCount = (rowId+1) * boxesInRow;
            if (boxCount > totBoxes) {
                colSpan = totBoxes - (rowId * boxesInRow) - 1;
            }
            out = out + makeBoxRow(rowId, boxesInRow, colSpan);
        }
        out += '</table><br>';
        return out;
    }

})(node);
