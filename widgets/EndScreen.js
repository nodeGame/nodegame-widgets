/**
 * # EndScreen
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
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

    EndScreen.version = '0.4.0';
    EndScreen.description = 'Game end screen. With end game message, ' +
                            'email form, and exit code.';

    EndScreen.title = 'End Screen';
    EndScreen.className = 'endscreen';

    EndScreen.texts.headerMessage = 'Thank you for participating!';
    EndScreen.texts.message = 'You have now completed this task ' +
                               'and your data has been saved. ' +
                               'Please go back to the Amazon Mechanical Turk ' +
                               'web site and submit the HIT.';
    EndScreen.texts.contact_question = 'Would you like to be contacted again' +
                                       'for future experiments? If so, leave' +
                                       'your email here and press submit: ';
    EndScreen.texts.total_win = 'Your total win:';
    EndScreen.texts.exit_code = 'Your exit code:';

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
    }

    EndScreen.prototype.init = function(options) {
        if (this.showEmailForm && !this.emailForm) {
            this.emailForm = node.widgets.get('EmailForm', J.mixin({
                label: this.getText('contact_question'),
                onsubmit: { say: true, emailOnly: true, updateUI: true }
            }, options.email));
        }

        if (this.showFeedbackForm) {
            this.feedback = node.widgets.get('Feedback', options.feedback);
        }
    };

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen();
        this.bodyDiv.appendChild(this.endScreenHTML);
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
                this.getText('total_win') +
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

            exitCodeParaElement = document.createElement('p');
            exitCodeParaElement.innerHTML = '<strong>' +
                                            this.getText('exit_code') +
                                            '</strong>';

            exitCodeInputElement = document.createElement('input');
            exitCodeInputElement.className = 'endscreen-exit-code ' +
                                             'form-control';
            exitCodeInputElement.setAttribute('disabled', 'true');

            exitCodeParaElement.appendChild(exitCodeInputElement);
            exitCodeElement.appendChild(exitCodeParaElement);

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
        var preWin, totalWin, exitCode;
        var totalHTML, exitCodeHTML;

        if (this.totalWinCb) {
            totalWin = this.totalWinCb(data, this);
        }
        else {
            totalWin = J.isNumber(data.total, 0);
            if (totalWin === false) {
                node.err('EndScreen error, invalid total win: ' +
                         data.total);
                totalWin = 'Error: invalid total win.';
            }
            else if (data.partials) {
                if (!J.isArray(data.partials)) {
                    node.err('EndScreen error, invalid partials win: ' +
                        data.partials);
                }
                else {
                    preWin = data.partials.join(' + ');

                    if ('undefined' !== typeof data.totalRaw) {
                        preWin += ' = ' + data.totalRaw;
                        if ('undefined' !== typeof data.exchangeRate) {
                            preWin += '*' + data.exchangeRate;
                        }
                        totalWin = preWin + ' = ' + totalWin;
                    }
                }
            }
            totalWin += ' ' + this.totalWinCurrency;
        }

        exitCode = data.exit;
        if ('string' !== typeof exitCode) {
            node.err('EndScreen error, invalid exit code: ' + exitCode);
            exitCode = 'Error: invalid exit code.';
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
