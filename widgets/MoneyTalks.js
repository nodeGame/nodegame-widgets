/**
 * # MoneyTalks widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting currency.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('MoneyTalks', MoneyTalks);

    var JSUS = node.JSUS;

    // ## Defaults

    MoneyTalks.defaults = {};
    MoneyTalks.defaults.id = 'moneytalks';
    MoneyTalks.defaults.fieldset = {
        legend: 'Earnings'
    };

    // ## Meta-data

    MoneyTalks.version = '0.1.0';
    MoneyTalks.description = 'Display the earnings of a player.';

    // ## Dependencies

    MoneyTalks.dependencies = {
        JSUS: {}
    };

    function MoneyTalks(options) {
        this.id = options.id || MoneyTalks.defaults.id;

        this.root = null;               // the parent element

        this.spanCurrency = document.createElement('span');
        this.spanMoney = document.createElement('span');

        this.currency = 'EUR';
        this.money = 0;
        this.precision = 2;
        this.init(options);
    }


    MoneyTalks.prototype.init = function(options) {
        this.currency = options.currency || this.currency;
        this.money = options.money || this.money;
        this.precision = options.precision || this.precision;

        this.spanCurrency.id = options.idCurrency || this.spanCurrency.id || 'moneytalks_currency';
        this.spanMoney.id = options.idMoney || this.spanMoney.id || 'moneytalks_money';

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;
    };

    MoneyTalks.prototype.getRoot = function() {
        return this.root;
    };

    MoneyTalks.prototype.append = function(root, ids) {
        var PREF = this.id + '_';
        root.appendChild(this.spanMoney);
        root.appendChild(this.spanCurrency);
        return root;
    };

    MoneyTalks.prototype.listeners = function() {
        var that = this;
        node.on('MONEYTALKS', function(amount) {
            that.update(amount);
        });
    };

    MoneyTalks.prototype.update = function(amount) {
        if ('number' !== typeof amount) {
            // Try to parse strings
            amount = parseInt(amount);
            if (isNaN(n) || !isFinite(n)) {
                return;
            }
        }
        this.money += amount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
    };

})(node);