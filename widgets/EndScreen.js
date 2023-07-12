/**
 * # EndScreen
 * Copyright(c) 2023 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates an interface to display final earnings, exit code, etc.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    // Register the widget in the widgets collection.
    node.widgets.register('EndScreen', EndScreen);

    // ## Add Meta-data

    EndScreen.version = '0.8.0';
    EndScreen.description = 'Game end screen. With end game message, ' +
                            'email form, and exit code.';

    EndScreen.className = 'endscreen';

    EndScreen.texts = {
        headerMessage: 'Thank you for participating!',
        message: 'You have now completed this task and your data has ' +
                 'been saved. Please go back to the Amazon Mechanical Turk ' +
                 'web site and submit the HIT.',
        totalWin: 'Your total win:',
        exitCode: 'Your exit code:',
        errTotalWin: 'Error: invalid total win.',
        errExitCode: 'Error: invalid exit code.',
        copyButton: 'Copy',
        exitCopyMsg: 'Exit code copied to clipboard.',
        exitCopyError: 'Failed to copy exit code. Please copy it manually.'
    };

    // ## Dependencies

    // Checked when the widget is created.
    EndScreen.dependencies = {
        Feedback: {},
        EmailForm: {}
    };

    /**
     * ## EndScreen constructor
     *
     * Creates a new instance of EndScreen
     *
     * @param {object} opts Configuration options
     *
     * @see EndScreen.init
     */
    function EndScreen(opts) {

        /**
         * ### EndScreen.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        this.showEmailForm = true;

        /**
         * ### EndScreen.showFeedbackForm
         *
         * If true, the feedback form is shown
         *
         * Default: true
         */
        this.showFeedbackForm = true;

        /**
         * ### EndScreen.showTotalWin
         *
         * If true, the total win is shown
         *
         * Default: true
         */
         this.showTotalWin = true;

        /**
         * ### EndScreen.showExitCode
         *
         * If true, the exit code is shown
         *
         * Default: true
         */
        this.showExitCode = true;

        /**
         * ### EndScreen.totalWinCurrency
         *
         * The currency displayed after totalWin
         *
         * Default: 'USD'
         *
         * // TODO: deprecate and rename to currency.
         */
         this.totalWinCurrency = 'USD';

        /**
         * ### EndScreen.totalWinCb
         *
         * If defined, the return value is displayed inside the totalWin box
         *
         * Accepts two parameters: a data object (as sent from server), and
         * the reference to the EndScreen.
         */
        this.totalWinCb = null;

        /**
         * ### EndScreen.emailForm
         *
         * EmailForm widget element
         *
         * @see EmailForm
         */
        this.emailForm = null;

        /**
         * ### EndScreen.feedback
         *
         * Feedback widget element
         *
         * @see Feedback
         */
        this.feedback = null;

        /**
         * ### EndScreen.endScreenElement
         *
         * Endscreen HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.endScreenHTML = null;

        /**
         * ### EndScreen.askServer
         *
         * If TRUE, after being appended it sends a 'WIN' message to server
         *
         * Default: TRUE
         */
        this.askServer = true;
    }

    EndScreen.prototype.init = function(opts) {

        if ('undefined' !== typeof opts.askServer) {
            this.askServer = !!opts.askServer;
        }

        if (opts.email === false) {
            this.showEmailForm = false;
        }
        else if ('boolean' === typeof opts.showEmailForm) {
            this.showEmailForm = opts.showEmailForm;
        }
        else if ('undefined' !== typeof opts.showEmailForm) {
            throw new TypeError('EndScreen.init: opts.showEmailForm ' +
                                'must be boolean or undefined. Found: ' +
                                opts.showEmailForm);
        }

        if (opts.feedback === false) {
            this.showFeedbackForm = false;
        }
        else if ('boolean' === typeof opts.showFeedbackForm) {
            this.showFeedbackForm = opts.showFeedbackForm;
        }
        else if ('undefined' !== typeof opts.showFeedbackForm) {
            throw new TypeError('EndScreen.init: opts.showFeedbackForm ' +
                                'must be boolean or undefined. Found: ' +
                                opts.showFeedbackForm);
        }

        if (opts.totalWin === false) {
            this.showTotalWin = false;
        }
        else if ('boolean' === typeof opts.showTotalWin) {
            this.showTotalWin = opts.showTotalWin;
        }
        else if ('undefined' !== typeof opts.showTotalWin) {
            throw new TypeError('EndScreen.init: opts.showTotalWin ' +
                                'must be boolean or undefined. Found: ' +
                                opts.showTotalWin);
        }

        if (opts.exitCode === false) {
            opts.showExitCode !== false
        }
        else if ('boolean' === typeof opts.showExitCode) {
            this.showExitCode = opts.showExitCode;
        }
        else if ('undefined' !== typeof opts.showExitCode) {
            throw new TypeError('EndScreen.init: opts.showExitCode ' +
                                'must be boolean or undefined. Found: ' +
                                 opts.showExitCode);
        }

        if ('string' === typeof opts.totalWinCurrency &&
                 opts.totalWinCurrency.trim() !== '') {

            this.totalWinCurrency = opts.totalWinCurrency;
        }
        else if ('undefined' !== typeof opts.totalWinCurrency) {
            throw new TypeError('EndScreen.init: ' +
                                'opts.totalWinCurrency must be undefined ' +
                                'or a non-empty string. Found: ' +
                                opts.totalWinCurrency);
        }

        if (opts.totalWinCb) {
            if ('function' === typeof opts.totalWinCb) {
                this.totalWinCb = opts.totalWinCb;
            }
            else {
                throw new TypeError('EndScreen.init: opts.totalWinCb ' +
                                    'must be function or undefined. Found: ' +
                                     opts.totalWinCb);
            }
        }

        if (this.showEmailForm && !this.emailForm) {
            // TODO: nested properties are overwitten fully. Update.
            this.emailForm = node.widgets.get('EmailForm', J.mixin({
                onsubmit: {
                    send: true,
                    emailOnly: true,
                    updateUI: true
                },
                storeRef: false,
                texts: {
                    label: 'If you would like to be contacted for future ' +
                        'studies, please enter your email (optional):',
                    errString: 'Please enter a valid email and retry'
                },
                setMsg: true // Sends a set message for logic's db.
            }, opts.email));
        }

        if (this.showFeedbackForm) {
            this.feedback = node.widgets.get('Feedback', J.mixin(
                { storeRef: false, minChars: 50, setMsg: true },
                opts.feedback));
        }
    };

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen();
        this.bodyDiv.appendChild(this.endScreenHTML);
        if (this.askServer) setTimeout(function() { node.say('WIN'); });
    };

    /**
     * ### EndScreen.makeEndScreen
     *
     * Builds up the end screen (HTML + nested widgets)
     */
    EndScreen.prototype.makeEndScreen = function() {
        var endScreenElement;
        var headerElement, messageElement;
        var totalWinElement, totalWinParaElement, totalWinInputElement;
        var exitCodeElement, exitCodeParaElement, exitCodeInputElement;
        var exitCodeBtn, exitCodeGroup;
        var basePay;
        var that = this;

        endScreenElement = document.createElement('div');
        endScreenElement.className = 'endscreen';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.getText('headerMessage');
        endScreenElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = this.getText('message');
        endScreenElement.appendChild(messageElement);

        if (this.showTotalWin) {
            totalWinElement = document.createElement('div');

            totalWinParaElement = document.createElement('p');
            totalWinParaElement.innerHTML = '<strong>' +
                this.getText('totalWin') +
                '</strong>';

            totalWinInputElement = document.createElement('input');
            totalWinInputElement.className = 'endscreen-total form-control';
            totalWinInputElement.setAttribute('disabled', 'true');

            totalWinParaElement.appendChild(totalWinInputElement);
            totalWinElement.appendChild(totalWinParaElement);

            endScreenElement.appendChild(totalWinElement);
            this.totalWinInputElement = totalWinInputElement;
        }

        if (this.showExitCode) {
            exitCodeElement = document.createElement('div');
            exitCodeElement.className = 'input-group';

            exitCodeParaElement = document.createElement('span');
            exitCodeParaElement.innerHTML = '<strong>' +
                this.getText('exitCode') + '</strong>';

            exitCodeInputElement = document.createElement('input');
            exitCodeInputElement.id = 'exit_code';
            exitCodeInputElement.className = 'endscreen-exit-code ' +
                                             'form-control';
            exitCodeInputElement.setAttribute('disabled', 'true');

            exitCodeGroup = document.createElement('span');
            exitCodeGroup.className = 'input-group-btn';

            exitCodeBtn = document.createElement('button');
            exitCodeBtn.className = 'btn btn-default endscreen-copy-btn';
            exitCodeBtn.innerHTML = this.getText('copyButton');
            exitCodeBtn.type = 'button';
            exitCodeBtn.onclick = function() {
                that.copy(exitCodeInputElement.value);
            };

            exitCodeGroup.appendChild(exitCodeBtn);
            endScreenElement.appendChild(exitCodeParaElement);
            exitCodeElement.appendChild(exitCodeGroup);
            exitCodeElement.appendChild(exitCodeInputElement);

            endScreenElement.appendChild(exitCodeElement);
            this.exitCodeInputElement = exitCodeInputElement;
        }

        basePay = node.game.settings.BASE_PAY;
        if ('undefined' !== typeof basePay) {
            this.updateDisplay({
                basePay: basePay, total: basePay, exitCode: ''
            });
        }

        if (this.showEmailForm) {
            node.widgets.append(this.emailForm, endScreenElement, {
                title: false,
                panel: false
            });
        }

        if (this.showFeedbackForm) {
            node.widgets.append(this.feedback, endScreenElement, {
                title: false,
                panel: false
            });
        }

        return endScreenElement;
    };

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
        var that;
        that = this;
        node.on.data('WIN', function(message) {
            that.updateDisplay(message.data);
        });
    };

    EndScreen.prototype.copy = function(text) {
        var inp = document.createElement('input');
        try {
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
            alert(this.getText('exitCopyMsg'));
        }
        catch (err) {
            alert(this.getText('exitCopyError'));
        }
    };

    /**
     * ### EndScreen.updateDisplay
     *
     * Updates the display
     *
     * @param {object} data An object containing the info to update. Format:
     *    - total: The total won.
     *    - exit: An exit code.
     */
    EndScreen.prototype.updateDisplay = function(data) {
        var preWin, totalWin, totalRaw, exitCode;
        var totalHTML, exitCodeHTML, ex, err;

        if (this.totalWinCb) {
            totalWin = this.totalWinCb(data, this);
        }
        else {
            if ('undefined' === typeof data.total &&
                'undefined' === typeof data.totalRaw) {

                throw new Error('EndScreen.updateDisplay: data.total and ' +
                                'data.totalRaw cannot be both undefined.');
            }

            if ('undefined' !== typeof data.total) {
                totalWin = J.isNumber(data.total);
                if (totalWin === false) {
                    node.err('EndScreen.updateDisplay: invalid data.total: ' +
                             data.total);
                    totalWin = this.getText('errTotalWin');
                    err = true;
                }
            }

            preWin = '';

            if ('undefined' !== typeof data.basePay) {
                preWin = data.basePay;
            }

            if ('undefined' !== typeof data.bonus &&
                data.showBonus !== false) {

                if (preWin !== '') preWin += ' + ';
                preWin += data.bonus;
            }

            if (data.partials) {
                if (!J.isArray(data.partials)) {
                    node.err('EndScreen error, invalid partials win: ' +
                             data.partials);
                }
                else {
                    // If there is a basePay we already have a preWin.
                    if (preWin !== '') preWin += ' + ';
                    preWin += data.partials.join(' + ');
                }
            }

            if ('undefined' !== typeof data.totalRaw) {
                if (preWin) preWin += ' = ';
                else preWin = '';
                preWin += data.totalRaw;

                // Get Exchange Rate.
                ex = 'undefined' !== typeof data.exchangeRate ?
                    data.exchangeRate : node.game.settings.EXCHANGE_RATE;

                // If we have an exchange rate, check if we have a totalRaw.
                if ('undefined' !== typeof ex) preWin += '*' + ex;

                // Need to compute total manually.
                if ('undefined' === typeof totalWin) {
                    totalRaw = J.isNumber(data.totalRaw, 0);
                    totalWin = parseFloat(ex*totalRaw).toFixed(2);
                    totalWin = J.isNumber(totalWin, 0);
                    if (totalWin === false) {
                        node.err('EndScreen.updateDisplay: invalid : ' +
                                 'totalWin calculation from totalRaw.');
                        totalWin = this.getText('errTotalWin');
                        err = true;
                    }
                }
            }

            if (!err) {
                if (totalWin !== preWin & preWin !== '') {
                    totalWin = preWin + ' = ' + totalWin;
                }
                totalWin += ' ' + this.totalWinCurrency;
            }
        }

        exitCode = data.exit;
        if ('string' !== typeof exitCode) {
            node.err('EndScreen error, invalid exit code: ' + exitCode);
            exitCode = this.getText('errExitCode');
        }

        totalHTML = this.totalWinInputElement;
        exitCodeHTML = this.exitCodeInputElement;

        if (totalHTML && this.showTotalWin) {
            totalHTML.value = totalWin;
        }

        if (exitCodeHTML && this.showExitCode) {
            exitCodeHTML.value = exitCode;
        }
    };

})(node);
