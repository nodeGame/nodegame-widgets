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

    MoneyTalks.version = '0.4.0';
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
        this.spanCurrency = null;

        /**
         * ### MoneyTalks.spanMoney
         *
         * The SPAN which holds information about the money earned so far
         */
        this.spanMoney = null;

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

        /**
         * ### MoneyTalks.showCurrency
         *
         * If TRUE, the currency is displayed after the money
         */
        this.showCurrency = true;

        /**
         * ### MoneyTalks.currencyClassname
         *
         * Class name to be attached to the currency span
         */
        this.classnameCurrency = 'moneytalkscurrency';

        /**
         * ### MoneyTalks.currencyClassname
         *
         * Class name to be attached to the money span
         */
        this.classnameMoney = 'moneytalksmoney';
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
     *
     *   - `currency`: The name of currency.
     *   - `money`: Initial amount of money earned.
     *   - `precision`: How mamy floating point digits to use.
     *   - `currencyClassName`: Class name to be set for this.spanCurrency.
     *   - `moneyClassName`: Class name to be set for this.spanMoney.
     *   - `showCurrency`: Flag whether the name of currency is to be displayed.
     */
    MoneyTalks.prototype.init = function(options) {
        if ('string' === typeof options.currency) {
            this.currency = options.currency;
        }
        if ('undefined' !== typeof options.showCurrency) {
            this.showCurrency = !!options.showCurrency;
        }
        if ('number' === typeof options.money) {
            this.money = options.money;
        }
        if ('number' === typeof options.precision) {
            this.precision = options.precision;
        }
        if ('string' === typeof options.MoneyClassName) {
            this.classnameMoney = options.MoneyClassName;
        }
        if ('string' === typeof options.currencyClassName) {
            this.classnameCurrency = options.currencyClassName;
        }
    };

    MoneyTalks.prototype.append = function() {
        if (!this.spanMoney) {
            this.spanMoney = document.createElement('span');
        }
        if (!this.spanCurrency) {
            this.spanCurrency = document.createElement('span');
        }
        if (!this.showCurrency) this.spanCurrency.style.display = 'none';

        this.spanMoney.className = this.classnameMoney;
        this.spanCurrency.className = this.classnameCurrency;

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;

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
        parsedAmount = J.isNumber(amount);
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
