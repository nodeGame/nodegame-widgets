/**
 * # MoneyTalks
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting currency
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoneyTalks', MoneyTalks);

    // ## Meta-data

    MoneyTalks.version = '0.1.1';
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
     * `MoneyTalks` displays the earnings of the player so far
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
        this.currency = 'EUR';

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
        this.currency = options.currency || this.currency;
        this.money = options.money || this.money;
        this.precision = options.precision || this.precision;

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
        node.on('MONEYTALKS', function(amount) {
            that.update(amount);
        });
    };

    /**
     * ### MoneyTalks.update
     *
     * Updates the contents of this.money and this.spanMoney according to amount
     */
    MoneyTalks.prototype.update = function(amount) {
        if ('number' !== typeof amount) {
            // Try to parse strings
            amount = parseInt(amount, 10);
            if (isNaN(amount) || !isFinite(amount)) {
                return;
            }
        }
        this.money += amount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
    };
})(node);
