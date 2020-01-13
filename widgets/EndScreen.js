/**
 * # EndScreen
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
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

    EndScreen.version = '0.6.0';
    EndScreen.description = 'Game end screen. With end game message, ' +
                            'email form, and exit code.';

    EndScreen.title = 'End Screen';
    EndScreen.className = 'endscreen';

    EndScreen.texts.headerMessage = 'Thank you for participating!';
    EndScreen.texts.message = 'You have now completed this task ' +
                               'and your data has been saved. ' +
                               'Please go back to the Amazon Mechanical Turk ' +
                               'web site and submit the HIT.';
    EndScreen.texts.contactQuestion = 'Would you like to be contacted again' +
                                       'for future experiments? If so, leave' +
                                       'your email here and press submit: ';
    EndScreen.texts.totalWin = 'Your total win:';
    EndScreen.texts.exitCode = 'Your exit code:';
    EndScreen.texts.errTotalWin = 'Error: invalid total win.';
    EndScreen.texts.errExitCode = 'Error: invalid exit code.';
    EndScreen.texts.copyButton = 'Copy';
    EndScreen.texts.exitCopyMsg = 'Exit code copied to clipboard.';
    EndScreen.texts.exitCopyError = 'Failed to copy exit code. Please copy it' +
                                    ' manually.';

    // ## Dependencies

    // Checked when the widget is created.
    EndScreen.dependencies = {
        JSUS: {},
        Feedback: {},
        EmailForm: {}
    };

    /**
     * ## EndScreen constructor
     *
     * Creates a new instance of EndScreen
     *
     * @param {object} options Configuration options
     *
     * @see EndScreen.init
     */
    function EndScreen(options) {

        /**
         * ### EndScreen.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        if (options.email === false) {
            options.showEmailForm = false;
        }
        else if ('undefined' === typeof options.showEmailForm) {
            this.showEmailForm = true;
        }
        else if ('boolean' === typeof options.showEmailForm) {
            this.showEmailForm = options.showEmailForm;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showEmailForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showEmailForm);
        }

        /**
         * ### EndScreen.showFeedbackForm
         *
         * If true, the feedback form is shown
         *
         * Default: true
         */
        if (options.feedback === false) {
            options.showFeedbackForm = false;
        }
        else if ('undefined' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = true;
        }
        else if ('boolean' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = options.showFeedbackForm;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showFeedbackForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showFeedbackForm);
        }

        /**
         * ### EndScreen.showTotalWin
         *
         * If true, the total win is shown
         *
         * Default: true
         */
        if (options.totalWin === false) {
            options.showTotalWin = false;
        }
        else if ('undefined' === typeof options.showTotalWin) {
            this.showTotalWin = true;
        }
        else if ('boolean' === typeof options.showTotalWin) {
            this.showTotalWin = options.showTotalWin;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showTotalWin ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showTotalWin);
        }

        /**
         * ### EndScreen.showExitCode
         *
         * If true, the exit code is shown
         *
         * Default: true
         */
        if (options.exitCode === false) {
            options.showExitCode !== false
        }
        else if ('undefined' === typeof options.showExitCode) {
            this.showExitCode = true;
        }
        else if ('boolean' === typeof options.showExitCode) {
            this.showExitCode = options.showExitCode;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showExitCode ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showExitCode);
        }

        /**
         * ### EndScreen.totalWinCurrency
         *
         * The currency displayed after totalWin
         *
         * Default: 'USD'
         */
        if ('undefined' === typeof options.totalWinCurrency) {
            this.totalWinCurrency = 'USD';
        }
        else if ('string' === typeof options.totalWinCurrency &&
                 options.totalWinCurrency.trim() !== '') {

            this.totalWinCurrency = options.totalWinCurrency;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.totalWinCurrency must be undefined ' +
                                'or a non-empty string. Found: ' +
                                options.totalWinCurrency);
        }

        /**
         * ### EndScreen.totalWinCb
         *
         * If defined, the return value is displayed inside the totalWin box
         *
         * Accepts two parameters: a data object (as sent from server), and
         * the reference to the EndScreen.
         */
        if (options.totalWinCb) {
            if ('function' === typeof options.totalWinCb) {
                this.totalWinCb = options.totalWinCb;
            }
            else {
                throw new TypeError('EndScreen constructor: ' +
                                    'options.totalWinCb ' +
                                    'must be function or undefined. ' +
                                    'Found: ' + options.totalWinCb);
            }
        }

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
         * Default: FALSE
         */
        this.askServer = options.askServer || false;
    }

    EndScreen.prototype.init = function(options) {
        if (this.showEmailForm && !this.emailForm) {
            this.emailForm = node.widgets.get('EmailForm', J.mixin({
                label: this.getText('contactQuestion'),
                onsubmit: { send: true, emailOnly: true, updateUI: true },
                storeRef: false
            }, options.email));
        }

        if (this.showFeedbackForm) {
            this.feedback = node.widgets.get('Feedback', J.mixin(
                { storeRef: false },
                options.feedback));
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
        } catch (err) {
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

            if (data.partials) {
                if (!J.isArray(data.partials)) {
                    node.err('EndScreen error, invalid partials win: ' +
                             data.partials);
                }
                else {
                    preWin = data.partials.join(' + ');
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
                    totalWin = parseFloat(ex*data.totalRaw).toFixed(2);
                    totalWin = J.isNumber(totalWin, 0);
                    if (totalWin === false) {
                        node.err('EndScreen.updateDisplay: invalid : ' +
                                 'totalWin calculation from totalRaw.');
                        totalWin = this.getText('errTotalWin');
                        err = true;
                    }
                }
                if (!err) totalWin = preWin + ' = ' + totalWin;
            }

            if (!err) totalWin += ' ' + this.totalWinCurrency;
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
