(function() {  // self-executing function for encapsulation

    // Register the widget in the widgets collection.
    node.widgets.register('EndScreen', EndScreen);

    // Add Meta-data
    EndScreen.version = '0.1.0';
    EndScreen.description = 'Game end screen. With end game message, ' +
    'email form, and exit code.';

    // Title is displayed in the header.
    // is this necessary?
    EndScreen.title = 'End Screen';
    // Classname is added to the widgets.
    EndScreen.className = 'end-screen';

    // Dependencies are checked when the widget is created.
    EndScreen.dependencies = { JSUS: {} };

    // Constructor taking a configuration parameter.
    // The options object is always existing even if no
    //
    function EndScreen(options) {
        /**
         * ### EndScreen.headerMessage
         *
         * The header message displayed at the top of the screen
         *
         * Default: 'Thank you for participating!'
         */
        if ('undefined' === typeof options.headerMessage) {
            this.headerMessage = 'Thank you for participating!';
        }
        else if ('string' === typeof options.headerMessage) {
            this.headerMessage = options.headerMessage;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.headerMessage ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.headerMessage);
        }

        /**
         * ### EndScreen.message
         *
         * The informational message displayed in the body of the screen
         *
         * Default: 'You have now completed this task and your data
         *           has been saved. Please go back to the Amazon Mechanical
         *           Turk web site and submit the HIT.'
         */
        if ('undefined' === typeof options.message) {
            this.message =  'You have now completed this task ' +
                            'and your data has been saved. ' +
                            'Please go back to the Amazon Mechanical Turk ' +
                            'web site and ' +
                            'submit the HIT.';
        }
        else if ('string' === typeof options.message) {
            this.message = options.message;
        }
        else {
            throw new TypeError('EndScreen constructor: options.message ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.message);
        }

        /**
         * ### EndScreen.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        if ('undefined' === typeof options.showEmailForm) {
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
        if ('undefined' === typeof options.showFeedbackForm) {
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
        if ('undefined' === typeof options.showTotalWin) {
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
        if ('undefined' === typeof options.showExitCode) {
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
         * ### EndScreen.feedback
         *
         * Feedback widget element
         *
         * Default: new Feedback(option)
         */
        this.feedback = node.widgets.get('Feedback', options);

        /**
         * ### EndScreen.endScreenElement
         *
         * Endscreen HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.endScreenHTML = null;

        this.init();
    }

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen();
        this.bodyDiv.append(this.endScreenHTML);
    };

    // makes the end screen
    EndScreen.prototype.makeEndScreen = function() {
        var endScreenElement;
        var headerElement, messageElement;
        var totalWinElement, totalWinParaElement, totalWinInputElement;
        var exitCodeElement, exitCodeParaElement, exitCodeInputElement;
        var emailElement, emailFormElement, emailLabelElement,
            emailInputElement, emailButtonElement;
        var emailErrorString;

        emailErrorString = 'Not a valid email address, ' +
                           'please correct it and submit again.';

        endScreenElement = document.createElement('div');
        endScreenElement.className = 'endscreen';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.headerMessage;
        endScreenElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = this.message;
        endScreenElement.appendChild(messageElement);

        if (this.showTotalWin) {
            totalWinElement = document.createElement('div');

            totalWinParaElement = document.createElement('p');
            totalWinParaElement.innerHTML = 'Your total win: ';

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
            exitCodeParaElement.innerHTML = 'Your exit code: ';

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
            emailElement = document.createElement('div');
            emailFormElement = document.createElement('form');
            emailFormElement.className = 'endscreen-email-form';

            emailLabelElement = document.createElement('label');
            emailLabelElement.innerHTML = 'Would you like to be contacted ' +
                                          'again for future experiments? ' +
                                          'If so, leave your email here ' +
                                          'and press submit: ';

            emailInputElement = document.createElement('input');
            emailInputElement.setAttribute('type', 'text');
            emailInputElement.setAttribute('placeholder', 'Email');
            emailInputElement.className = 'endscreen-email-input form-control';

            emailButtonElement = document.createElement('input');
            emailButtonElement.setAttribute('type', 'submit');
            emailButtonElement.setAttribute('value', 'Submit email');
            emailButtonElement.className = 'btn btn-lg btn-primary ' +
                                           'endscreen-email-submit';

            emailFormElement.appendChild(emailLabelElement);
            emailFormElement.appendChild(emailInputElement);
            emailFormElement.appendChild(emailButtonElement);

            emailElement.appendChild(emailFormElement);
            endScreenElement.appendChild(emailElement);

            emailFormElement.addEventListener('submit', function(event) {
                var email, indexAt, indexDot;

                event.preventDefault();
                email = emailInputElement.value;

                if (email.trim().length > 5) {
                    indexAt = email.indexOf('@');
                    if (indexAt !== -1 &&
                        indexAt !== 0 &&
                        indexAt !== (email.length-1)) {

                        indexDot = email.lastIndexOf('.');
                        if (indexDot !== -1 &&
                            indexDot !== (email.length-1) &&
                            indexDot > (indexAt+1)) {

                            node.say('email', 'SERVER', email);

                            emailButtonElement.disabled = true;
                            emailInputElement.disabled = true;
                            emailButtonElement.value = 'Sent!';
                        }
                    }
                }

                emailButtonElement.value = emailErrorString;
            }, true);
        }

        if (this.showFeedbackForm) {
            node.widgets.append(this.feedback, endScreenElement);
        }

        return endScreenElement;
    };

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
        var that;

        that = this;

        // Listeners added here are automatically removed
        // when the widget is destroyed.
        node.on.data('WIN', function(message) {
            var totalWin;
            var exitCode;
            var data;

            var totalHTML, exitCodeHTML;

            data = message.data;
            totalWin = data.total;
            exitCode = data.exit;

            if (JSUS.isNumber(totalWin, 0) === false) {
                node.err('EndScreen error, invalid exit code: ' + totalWin);
                totalWin = 'Error: invalid total win.';
            }

            if ((typeof exitCode !== 'string')) {
                node.err('EndScreen error, invalid exit code: ' + exitCode);
                exitCode = 'Error: invalid exit code.';
            }

            totalHTML = that.totalWinInputElement;
            exitCodeHTML = that.exitCodeInputElement;

            if (totalHTML && that.showTotalWin) {
                totalHTML.value = totalWin;
            }

            if (exitCodeHTML && that.showExitCode) {
                exitCodeHTML.value = exitCode;
            }
        });
    };
})(node);
