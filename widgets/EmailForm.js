/**
 * # EmailForm
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('EmailForm', EmailForm);

    // ## Meta-data

    EmailForm.version = '0.1.0';
    EmailForm.description = 'Displays a simple email form.';

    EmailForm.title = 'Email';
    EmailForm.className = 'emailform';

    // ## Dependencies

    EmailForm.dependencies = { JSUS: {} };

    /**
     * ## EmailForm constructor
     *
     * `EmailForm` sends a feedback message to the server
     *
     * @param {object} options configuration option
     */
    function EmailForm(options) {
        /**
         * ### EmailForm.label
         *
         * The label for the feedback element
         *
         * Default: 'Any feedback about the experiment? Let us know here: '
         */
        if ('undefined' === typeof options.label) {
            this.label = 'Any feedback about the experiment? Let us know here:';
        }
        else if ('string' === typeof options.label) {
            this.label = options.label;
        }
        else {
            throw new TypeError('EmailForm constructor: options.label ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.label);
        }

        /**
         * ### EmailForm.maxEmailFormLength
         *
         * The maximum character length for feedback to be submitted
         *
         * Default: 800
         */
        if ('undefined' === typeof options.maxLength) {
            this.maxEmailFormLength = 800;
        }
        else if (JSUS.isNumber(options.maxLength, 0) !== false) {
            this.maxEmailFormLength = options.maxLength;
        }
        else {
            throw new TypeError('EmailForm constructor: options.maxLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.maxLength);
        }

        /**
         * ### EmailForm.minEmailFormLength
         *
         * The minimum character length for feedback to be submitted
         *
         * If minEmailFormLength = 0, then there is no minimum length checked.
         * Default: 0
         */
        if ('undefined' === typeof options.minLength) {
            this.minEmailFormLength = 0;
        }
        else if (JSUS.isNumber(options.minLength, 0) !== false) {
            this.minEmailFormLength = options.minLength;
        }
        else {
            throw new TypeError('EmailForm constructor: options.minLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.minLength);
        }

        /**
         * ### EmailForm.feedbackHTML
         *
         * The HTML element containing the form elements
         */
        this.feedbackHTML = null;
    }

    // ## EmailForm methods

    EmailForm.prototype.createForm = function(showCount, minLength,
                                             maxLength, labelText) {

        var feedbackHTML;
        var feedbackForm;
        var feedbackLabel;
        var feedbackTextarea;
        var submit;
        var charCounter;

        feedbackHTML = document.createElement('div');
        feedbackHTML.className = 'feedback';

        feedbackForm = document.createElement('form');
        feedbackForm.className = 'feedback-form';
        feedbackHTML.appendChild(feedbackForm);

        feedbackLabel = document.createElement('label');
        feedbackLabel.setAttribute('for', 'feedback-input');
        feedbackLabel.innerHTML = labelText;
        feedbackForm.appendChild(feedbackLabel);

        feedbackTextarea = document.createElement('textarea');
        feedbackTextarea.className = 'feedback-textarea form-control';
        feedbackTextarea.setAttribute('type', 'text');
        feedbackTextarea.setAttribute('rows', '3');
        feedbackForm.appendChild(feedbackTextarea);

        submit = document.createElement('input');
        submit.className = 'btn btn-lg btn-primary';
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'Submit feedback');
        feedbackForm.appendChild(submit);

        charCounter = document.createElement('span');
        charCounter.className = 'feedback-char-count badge';
        charCounter.innerHTML = maxLength;
        feedbackForm.appendChild(charCounter);

        feedbackForm.addEventListener('submit', function(event) {
            var feedback;

            event.preventDefault();

            feedback = feedbackTextarea.value.trim();
            node.say('feedback', 'SERVER', feedback);

            submit.disabled = true;
            feedbackTextarea.disabled = true;

            submit.setAttribute('value', 'Sent!');
        });

        feedbackForm.addEventListener('input', function(event) {
            checkEmailFormLength(feedbackTextarea, charCounter, submit,
                                minLength, maxLength);
        });

        checkEmailFormLength(feedbackTextarea, charCounter, submit,
                            minLength, maxLength);

        return feedbackHTML;
    };

    /**
     * ### EmailForm.append
     *
     * Appends widget to this.bodyDiv
     */
    EmailForm.prototype.append = function() {
        this.feedbackHTML = this.createForm(this.showCharCount,
                                            this.minEmailFormLength,
                                            this.maxEmailFormLength,
                                            this.label);
        this.bodyDiv.appendChild(this.feedbackHTML);
    };

    EmailForm.prototype.listeners = function() {};

    // check the feedback length
    function checkEmailFormLength(feedbackTextarea, charCounter,
                                 submit, minLength, maxLength) {
        var length;

        length = feedbackTextarea.value.trim().length;

        if (length < minLength) {
          submit.disabled = true;

          charCounter.innerHTML = (minLength - length) + ' characters needed.';
          charCounter.style.backgroundColor = '#f2dede';
        }
        else if (length > maxLength) {
          submit.disabled = true;

          charCounter.innerHTML = (length - maxLength) + ' characters over.';
          charCounter.style.backgroundColor = '#f2dede';
        }
        else {
          submit.disabled = false;

          charCounter.innerHTML = (maxLength - length) +
                ' characters remaining.';
          charCounter.style.backgroundColor = '#dff0d8';
        }
    }

})(node);
