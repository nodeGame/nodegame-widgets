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
        this.options = options;
        this.init(true, true);
    }

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.bodyDiv.appendChild(this.endScreen);

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

    EndScreen.prototype.init = function() {
        var exitCode; // exit code
        var topHTML, messageHTML, totalWinHTML, exitCodeHTML, emailHTML,
            endHTML, endScreenHTML;
        var endScreen;

        this.headerMessage = this.options.headerMessage ||
        'Thank You for Participating!';
        this.message = this.options.message ||
        'You have now completed this task and your data has been saved. ' +
        'Please go back to the Amazon Mechanical Turk web site and ' +
        'submit the HIT.';
        this.showEmailForm = 'showEmailForm' in this.options ?
                            this.options.showEmailForm : true;
        this.showFeedbackForm = 'showFeedbackForm' in this.options ?
                            this.options.showFeedbackForm : true;
        this.showTotalWin = 'showTotalWin' in this.options ?
                            this.options.showTotalWin : true;
        this.showExitCode = 'showExitCode' in this.options ?
                            this.options.showExitCode : true;
        this.maxFeedbackLength = this.options.maxFeedbackLength || 800;

        messageHTML = '<h1>' + this.headerMessage +'</h1>' + '<p>' +
                      this.message + '</p>';
        endScreenHTML = messageHTML;

        if (this.showTotalWin) {
            // totalWinHTML = '<p>Your total win: ' + totalWin + '</p>';
            totalWinHTML = '<p>Your total win: ' +
                           '<input id="endscreen-total" ' +
                           'class="form-control" ' +
                           'disabled></input>' +
                           '</p>';
            endScreenHTML += totalWinHTML;
        }
        if (this.showExitCode) {
            // exitCodeHTML = '<p>Your Exit code: ' + exitCode + '</p>';
            exitCodeHTML = '<p>Your exit code: ' +
                           '<input id="endscreen-exit-code" ' +
                           'class="form-control" disabled></input>' +
                           '</p>';
            endScreenHTML += exitCodeHTML;
        }
        if (this.showEmailForm) {
            emailHTML = '<form id="endscreen-email-form">' +
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
            endScreenHTML += emailHTML;
        }
        if (this.showFeedbackForm) {
            feedbackFormHTML = '<form id="endscreen-feedback-form">' +
            '<label for="endscreen-feedback">' +
            'Any feedback about the experiment? Let us know here:' +
            '</label>' +
            '<textarea id="endscreen-feedback" type="text" rows="3"' +
            'class="form-control"></textarea>' +
            '<span id="endscreen-char-count" class="badge">' +
            this.maxFeedbackLength +
            ' characters left</span>' +
            '<input class="btn btn-lg btn-primary" ' +
            'id="endscreen-submit-feedback" ' +
            'type="submit" value="Submit feedback"></input>' +
            '</form>';
            endScreenHTML += feedbackFormHTML;
        }

        this.endScreen = document.createElement('div');
        this.endScreen.class = this.className;
        this.endScreen.id = 'endscreen';
        this.endScreen.innerHTML = endScreenHTML;
    }

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

            if (!JSUS.isNumber(totalWin, 0)) {
                totalWin = 'Error: invalid total win';
                // node.error('Invalid total win.');
            }

            if (!(typeof exitCode === 'string')) {
                exitCode = 'Error: invalid exit code';
                // node.error('Invalid exit code.');
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
