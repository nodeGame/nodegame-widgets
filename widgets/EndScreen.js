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
         * Default: null (added on append)
         */
        this.feedback = null;

        this.init();
    }

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen(this.headerMessage,
                                                this.message,
                                                this.showEmailForm,
                                                this.showFeedbackForm,
                                                this.showTotalWin,
                                                this.showExitCode);
        this.bodyDiv.appendChild(this.endScreenHTML);
        node.widgets.append(this.endScreenHTML, this.feedback);

        var that;
        var emailErrorString;
        var emailButton, emailInput, emailForm;
        var feedbackButton, feedbackForm, feedbackInput;
        var charCounter;

        that = this;

        emailButton = W.getElementById('endscreen-submit-email');
        emailForm = W.getElementById('endscreen-email-form');
        emailInput = W.getElementById('endscreen-email');
        emailErrorString = 'Not a valid email address, ' +
                           'please correct it and submit again.';

        feedbackForm = W.getElementById('endscreen-feedback-form');
        feedbackInput = W.getElementById('endscreen-feedback');
        feedbackButton = W.getElementById('endscreen-submit-feedback');

        charCounter = W.getElementById('endscreen-char-count');

        if (this.showEmailForm) {
            emailForm.addEventListener('submit', function(event) {
                event.preventDefault();

                var email, indexAt, indexDot;
                email = emailInput.value;
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

                            emailButton.disabled = true;
                            emailInput.disabled = true;
                            emailButton.value = 'Sent!';
                        }
                    }
                }
                emailButton.value = emailErrorString;
            }, true);
        }

        if (this.showFeedbackForm) {
            feedbackForm.addEventListener('submit', function(event) {
                var feedback;

                event.preventDefault();
                feedback = feedbackInput.value.trim();

                if (feedback.length < that.maxFeedbackLength) {
                    node.say('feedback', 'SERVER', feedback);

                    feedbackButton.disabled = true;
                    feedbackButton.value = 'Sent!';
                }
                else {
                    feedbackButton.value = 'Please shorten your response ' +
                                           'and submit again.';
                }
            });

            feedbackForm.addEventListener('input', function(event) {
                var charLeft;

                charLeft = that.maxFeedbackLength - feedbackInput.value.length;
                charCounter.innerHTML = Math.abs(charLeft);

                if (charLeft < 0) {
                    charCounter.innerHTML += ' characters over.';
                }
                else {
                    charCounter.innerHTML += ' characters remaining.';
                }
            });
        }
    };

    // makes the end screen
    EndScreen.prototype.makeEndScreen = function(headerMessage, message,
                                                 showEmailForm,
                                                 showFeedbackForm,
                                                 showTotalWin,
                                                 showExitCode) {
        var endScreenElement;
        var headerElement;
        var messageElement;
        var totalWinElement;
        var exitCodeElement;
        var emailElement;

        endScreenElement = document.createElement('div');
        endScreenElement.id = 'endscreen';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = headerMessage;
        endScreenElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = message;
        endScreenElement.appendChild(messageElement);

        if (showTotalWin) {
            totalWinElement = document.createElement('div');
            totalWinElement.innerHTML = '<p>Your total win: ' +
                                        '<input id="endscreen-total" ' +
                                        'class="form-control" ' +
                                        'disabled></input></p>';
            endScreenElement.appendChild(totalWinElement);
        }

        if (showExitCode) {
            exitCodeElement = document.createElement('div');
            exitCodeElement.innerHTML = '<p>Your exit code: ' +
                                        '<input id="endscreen-exit-code" ' +
                                        'class="form-control" disabled>' +
                                        '</input></p>';
            endScreenElement.appendChild(exitCodeElement);
        }

        if (showEmailForm) {
            emailElement = document.createElement('div');
            emailElement.innerHTML = '<form id="endscreen-email-form">' +
            '<label for="endscreen-email">' +
            'Would you like to be contacted again ' +
            'for future experiments? ' +
            'If so, leave your email here and press submit:' +
            '</label>' +
            '<input id="endscreen-email" type="text" placeholder="Email" ' +
            'class="form-control"/>' +
            '<input class="btn btn-lg btn-primary" ' +
            'id="endscreen-submit-email" ' +
            'type="submit" value="Submit email"></input>' +
            '</form>';
            endScreenElement.appendChild(emailElement);
        }

        if (this.showFeedbackForm) {
            this.feedback =
        }

        this.endScreen = document.createElement('div');
        this.endScreen.class = this.className;
        this.endScreen.id = 'endscreen';
        this.endScreen.innerHTML = endScreenHTML;
    };

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
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

            totalHTML = W.getElementById('endscreen-total');
            exitCodeHTML = W.getElementById('endscreen-exit-code');

            if (totalHTML) {
                totalHTML.value = totalWin;
            }

            if (exitCodeHTML) {
                exitCodeHTML.value = exitCode;
            }
        });
    };
})(node);
