/**
 * # MoneyTalks
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting earnings ("money") in currency
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoneyTalks', MoneyTalks);

    // ## Meta-data

    MoneyTalks.version = '0.3.0';
    MoneyTalks.description = 'Displays the earnings of a player.';

    MoneyTalks.title = 'Earnings';
    MoneyTalks.className = 'moneytalks';

    // ## Dependencies

    MoneyTalks.dependencies = {
        JSUS: {}
    };

    /**
     * ## MoneyTalks constructor
     *
     * `MoneyTalks` displays the earnings ("money") of the player so far
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to MoneyTalks.init.
     *
     * @see MoneyTalks.init
     */
    function MoneyTalks(options) {
        /**
         * ### MoneyTalks.spanCurrency
         *
         * The SPAN which holds information on the currency
         */
        this.spanCurrency = document.createElement('span');

        /**
         * ### MoneyTalks.spanMoney
         *
         * The SPAN which holds information about the money earned so far
         */
        this.spanMoney = document.createElement('span');

        /**
         * ### MoneyTalks.currency
         *
         * String describing the currency
         */
        this.currency = 'ECU';

        /**
         * ### MoneyTalks.money
         *
         * Currently earned money
         */
        this.money = 0;

        /**
         * ### MoneyTalks.precicison
         *
         * Precision of floating point number to display
         */
        this.precision = 2;

        this.init(options);
    }

    // ## MoneyTalks methods

    /**
     * ### MoneyTalks.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - `currency`: String describing currency to use.
     *   - `money`: Current amount of money earned.
     *   - `precision`: Precision of floating point output to use.
     *   - `currencyClassName`: Class name to be set for this.spanCurrency.
     *   - `moneyClassName`: Class name to be set for this.spanMoney;
     */
    MoneyTalks.prototype.init = function(options) {
        this.currency = 'string' === typeof options.currency ?
            options.currency : this.currency;
        this.money = 'number' === typeof options.money ?
            options.money : this.money;
        this.precision = 'number' === typeof options.precision ?
            options.precision : this.precision;

        this.spanCurrency.className = options.currencyClassName ||
            this.spanCurrency.className || 'moneytalkscurrency';
        this.spanMoney.className = options.moneyClassName ||
            this.spanMoney.className || 'moneytalksmoney';

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;
    };

    MoneyTalks.prototype.append = function() {
        this.bodyDiv.appendChild(this.spanMoney);
        this.bodyDiv.appendChild(this.spanCurrency);
    };

    MoneyTalks.prototype.listeners = function() {
        var that = this;
        node.on('MONEYTALKS', function(amount, clear) {
            that.update(amount, clear);
        });
    };

    /**
     * ### MoneyTalks.update
     *
     * Updates the display and the count of available "money"
     *
     * @param {string|number} amount Amount to add to current value of money
     * @param {boolean} clear Optional. If TRUE, money will be set to 0
     *    before adding the new amount
     *
     * @see MoneyTalks.money
     * @see MonetyTalks.spanMoney
     */
    MoneyTalks.prototype.update = function(amount, clear) {
        var parsedAmount;
        parsedAmount = JSUS.isNumber(amount);
        if (parsedAmount === false) {
            node.err('MoneyTalks.update: invalid amount: ' + amount);
            return;
        }
        if (clear) this.money = 0;
        this.money += parsedAmount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
    };

    /**
     * ### MoneyTalks.getValues
     *
     * Returns the current value of "money"
     *
     * @see MoneyTalks.money
     */
    MoneyTalks.prototype.getValues = function() {
        return this.money;
    };

})(node);
