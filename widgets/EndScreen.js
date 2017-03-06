(function() {  // self-executing function for encapsulation

    // Register the widget in the widgets collection.
    node.widgets.register('EndScreen', EndScreen);

    // Add Meta-data
    EndScreen.version = '0.0.1';
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
        this.endScreen = this.createHTML(true, true);
    }

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.bodyDiv.appendChild(this.endScreen);

        var errStr;
        var button, input, form;

        button = W.getElementById('submit-email');
        form = W.getElementById('email-form');
        input = W.getElementById('email');
        errStr = 'Check your email and click here again';

        form.addEventListener("submit", function(event) {
            event.preventDefault();

            var email, indexAt, indexDot;
            email = input.value;
            if (email.trim().length > 5) {
                indexAt = email.indexOf('@');
                if (indexAt !== -1 &&
                    indexAt !== 0 &&
                    indexAt !== (email.length-1)) {

                    indexDot = email.lastIndexOf('.');
                    if (indexDot !== -1 &&
                        indexDot !== (email.length-1) &&
                        indexDot > (indexAt+1)) {

                        button.disabled = true;
                        input.disabled = true;
                        node.say('email', 'SERVER', email);
                        button.onclick = null;
                        button.innerHTML = 'Sent!';
                        return;
                    }
                }
            }
            button.innerHTML = errStr;
            if (counter) {
                b.innerHTML += '(' + counter + ')';
            }
            else {
                counter++;
            }
        }, true);
    };

    EndScreen.prototype.createHTML = function(totalWin, exitCode) {
        var headerMessage; // the header to be displayed
        var message; // the message to be displayed
        var totalWin; // total win
        var showEmailForm; // boolean: email form or not
        var exitCode; // exit code

        var topHTML, messageHTML, totalWinHTML, exitCodeHTML, emailHTML, endHTML;
        var endScreenHTML;
        var endScreen;

        headerMessage = this.options.headerMessage ||
        'Thank You for Participating!';
        message = this.options.message ||
        'You have now completed this task and your data have been saved. ' +
        'Please go back to the Amazon Mechanical Turk web site and ' +
        'submit the HIT.';
        showEmailForm = this.options.showEmailForm;

        messageHTML = '<h1>' + headerMessage +'</h1>' + '<p>' + message + '</p>';
        endScreenHTML = messageHTML;

        if (totalWin) {
            // totalWinHTML = '<p>Your total win: ' + totalWin + '</p>';
            totalWinHTML = '<p>Your total win: ' +
                           '<input id="total" class="form-control" disabled></input>' +
                           '</p>';
            endScreenHTML += totalWinHTML;
        }
        if (exitCode) {
            // exitCodeHTML = '<p>Your Exit code: ' + exitCode + '</p>';
            exitCodeHTML = '<p>Your exit code: ' +
                           '<input id="exit-code" class="form-control" disabled></input>' +
                           '</p>';
            endScreenHTML += exitCodeHTML;
        }
        if (showEmailForm) {
            emailHTML = '<form id="email-form">' +
            '<label for="email">' +
            '<p>Would you like to be contacted again for future experiments?</p>' +
            '<p>If so, leave your email here and press submit:</p>' +
            '</label>' +
            '<input id="email" type="text" placeholder="Email" class="form-control"/>' +
            '<input class="btn btn-info" id="submit-email" type="submit"></input>' +
            '</form>';
            endScreenHTML += emailHTML;
        }

        endScreen = document.createElement('div');
        endScreen.class = this.className;
        // endScreen.id = ''
        endScreen.innerHTML = endScreenHTML;

        return endScreen;

        /* <button class="btn btn-info" id="submit-email" type="submit">Submit</button> */
    }

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
        // Listeners added here are automatically removed
        // when the widget is destroyed.
        node.on.data('WIN', function(message) {
            var totalWin;
            var exitCode;
            var data;

            console.log(message);

            data = message.data;
            totalWin = data.total;
            exitCode = data.exit;

            W.getElementById('total').value = totalWin;
            W.getElementById('exit-code').value = exitCode;
        });
    };
})(node);
