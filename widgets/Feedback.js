/**
 * # Feedback
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

    node.widgets.register('Feedback', Feedback);

    // ## Meta-data

    Feedback.version = '0.9.0';
    Feedback.description = 'Displays a configurable feedback form.';

    Feedback.title = 'Feedback';
    Feedback.className = 'feedback';

    // ## Dependencies

    Feedback.dependencies = {
        JSUS: {}
    };

    /**
     * ## Feedback constructor
     *
     * `Feedback` sends a feedback message to the server
     *
     * @param {object} options Optional. Configuration option.
     *   Available options:
     *
     *    - showCount: If TRUE, the character count is displayed
     *    - minLength: The minimum number of characters in textarea
     *    - maxLength: The max number of characters in textarea
     *    - label: The text to display above the textarea
     */
    function Feedback(options) {

        /**
         * ### Feedback.label
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
            throw new TypeError('Feedback constructor: options.label ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.label);
        }

        /**
         * ### Feedback.maxLength
         *
         * The maximum character length for feedback to be submitted
         *
         * Default: 800
         */
        if ('undefined' === typeof options.maxLength) {
            this.maxLength = 800;
        }
        else if (JSUS.isNumber(options.maxLength, 0) !== false) {
            this.maxLength = options.maxLength;
        }
        else {
            throw new TypeError('Feedback constructor: options.maxLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.maxLength);
        }

        /**
         * ### Feedback.minLength
         *
         * The minimum character length for feedback to be submitted
         *
         * If minLength = 0, then there is no minimum length checked.
         * Default: 0
         */
        if ('undefined' === typeof options.minLength) {
            this.minLength = 0;
        }
        else if (JSUS.isNumber(options.minLength, 0) !== false) {
            this.minLength = options.minLength;
        }
        else {
            throw new TypeError('Feedback constructor: options.minLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.minLength);
        }

        /**
         * ### Feedback.maxAttemptLength
         *
         * The maximum character length for an attempt to submit feedback
         *
         * Attempts are stored in the attempts array. This allows to store
         * longer texts than accepts feedbacks
         *
         * Default: Max(2000, maxLength)
         */
        if ('undefined' === typeof options.maxAttemptLength) {
            this.maxAttemptLength = 2000;
        }
        else if (JSUS.isNumber(options.maxAttemptLength, 0) !== false) {
            this.maxAttemptLength = Math.max(this.maxLength,
                                                     options.maxAttemptLength);
        }
        else {
            throw new TypeError('Feedback constructor: options.maxLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.maxAttemptLength);
        }

        /**
         * ### Feedback.showCharCount
         *
         * If TRUE, the character count is shown
         *
         * @see Feedback.charCounter
         */
        if ('undefined' === typeof options.showCount) {
            this.showCharCount = true;
        }
        else {
            this.showCharCount = !!options.showCount;
        }

        /**
         * ### Feedback.onsubmit
         *
         * Options passed to `getValues` when the submit button is pressed
         *
         * @see Feedback.getValues
         */
        if (!options.onsubmit) {
            this.onsubmit = { feedbackOnly: true };
        }
        else if ('object' === typeof options.onsubmit) {
            this.onsubmit = options.onsubmit;
        }
        else {
            throw new TypeError('Feedback constructor: options.onsubmit ' +
                                'must be string or object. Found: ' +
                                options.onsubmit);
        }

        /**
         * ### Feedback._feedback
         *
         * Internal storage of the value of the feedback
         *
         * This value is used when the form has not been created yet
         *
         * @see Feedback.createForm
         */
        this._feedback = options.feedback || null;

        /**
         * ### Feedback.attempts
         *
         * Invalid feedbacks tried
         */
        this.attempts = [];

        /**
         * ### Feedback.timeBegin
         *
         * Time when feedback was inserted (first character, last attempt)
         */
        this.timeBegin = null;

        /**
         * ### Feedback.feedbackHTML
         *
         * The HTML element containing the form elements
         */
        this.feedbackHTML = null;

        /**
         * ### Feedback.textareaElement
         *
         * The HTML textarea element containing the feedback
         */
        this.textareaElement = null;

        /**
         * ### Feedback.charCounter
         *
         * The HTML span element containing the characters count
         */
        this.charCounter = null;

        /**
         * ### Feedback.submitButton
         *
         * The HTML submit button
         */
        this.submitButton = null;

    }

    // ## Feedback methods

    /**
     * ### Feedback.createForm
     *
     * Builds the HTML forms
     */
    Feedback.prototype.createForm = function() {

        var that;
        var feedbackHTML;
        var feedbackForm;
        var feedbackLabel;
        var feedbackTextarea;
        var submit;
        var charCounter;

        that = this;

        feedbackHTML = document.createElement('div');
        feedbackHTML.className = 'feedback';

        feedbackForm = document.createElement('form');
        feedbackForm.className = 'feedback-form';
        feedbackHTML.appendChild(feedbackForm);

        feedbackLabel = document.createElement('label');
        feedbackLabel.setAttribute('for', 'feedback-input');
        feedbackLabel.innerHTML = this.label;
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

        if (this.showCharCount) {
            charCounter = document.createElement('span');
            charCounter.className = 'feedback-char-count badge';
            charCounter.innerHTML = this.maxLength;
            feedbackForm.appendChild(charCounter);
        }

        // Add listeners.
        J.addEvent(feedbackForm, 'submit', function(event) {
            event.preventDefault();
            that.getValues(that.onsubmit);
            submit.setAttribute('value', 'Sent!');
        });

//         J.addEvent(feedbackForm, 'input', function(event) {
//             checkLength(feedbackTextarea, charCounter, submit,
//                                 minLength, maxLength);
//         });

        J.addEvent(feedbackForm, 'input', function(event) {
            that.verifyFeedback(false, true);
        });

        // Check it once at the beginning.
        this.verifyFeedback();

//        checkLength(feedbackTextarea, charCounter, submit,
//                            minLength, maxLength);

        // Store references.
        this.submitButton = submit;
        this.feedbackHTML = feedbackHTML;
        this.textareaElement = feedbackTextarea;
        this.charCounter = charCounter || null;

        return feedbackHTML;
    };

    /**
     * ### Feedback.verifyFeedback
     *
     * Verify feedback and optionally marks attempt and updates interface
     *
     * @param {boolean} markAttempt Optional. If TRUE, the current feedback
     *    is added to the attempts array (if too long, may be truncateed).
     *    Default: TRUE
     * @param {boolean} updateUI Optional. If TRUE, the interface is updated.
     *    Default: FALSE
     *
     * @return {boolean} TRUE, if the feedback is valid
     *
     * @see Feedback.getValues
     * @see getFeedback
     */
    Feedback.prototype.verifyFeedback = function(markAttempt, updateUI) {
        var feedback, length, updateCount, updateColor, res;
        var submitButton, charCounter;

        feedback = getFeedback.call(this);
        length = feedback ? feedback.length : 0;

        submitButton = this.submitButton;
        charCounter = this.charCounter;

        if (length < this.minLength) {
            res = false;
            updateCount = (this.minLength - length) + ' characters needed.';
            updateColor = '#f2dede';
        }
        else if (length > this.maxLength) {
            res = false;
            updateCount = (length - this.maxLength) + ' characters over.';
            updateColor = '#f2dede';
        }
        else {
            res = true;
            updateCount = (this.maxLength - length) + ' characters remaining.';
            updateColor = '#dff0d8';
        }

        if (updateUI) {
            submitButton.disabled = !!res;
            if (charCounter) {
                charCounter.style.backgroundColor = updateColor;
                charCounter.innerHTML = updateCount;
            }
        }

        if (!res && ('undefined' === typeof markAttempt || markAttempt)) {
            if (feedback.length > this.maxAttemptLength) {
                feedback = feedback.substr(0, this.maxAttemptLength);
            }
            this.attempts.push(feedback);
        }

//         res = true; // TODO: check if valid.
//         if (res && updateUI) {
//             if (this.inputElement) this.inputElement.disabled = true;
//             if (this.submitButton) {
//                 this.submitButton.disabled = true;
//                 this.submitButton.value = 'Sent!';
//             }
//         }
//         else {
//             if (updateUI && this.submitButton) {
//                 this.submitButton.value = this.errString;
//             }
//             if ('undefined' === typeof markAttempt || markAttempt) {
//                 if (feedback.length > this.maxAttemptLength) {
//                     feedback = feedback.substr(0, this.maxAttemptLength);
//                 }
//                 this.attempts.push(feedback);
//             }
//         }
        return res;
    };

    /**
     * ### Feedback.append
     *
     * Appends widget to this.bodyDiv
     */
    Feedback.prototype.append = function() {
        this.createForm();
        this.bodyDiv.appendChild(this.feedbackHTML);
    };

    /**
     * ### Feedback.setValues
     *
     * Set the value of the feedback
     */
    Feedback.prototype.setValues = function(options) {
        var feedback;
        options = options || {};
        if (!options.feedback) {
            feedback = J.randomString(J.randomInt(0, this.maxLength),
                                      'aA_1');
        }
        else {
            feedback = options.feedback;
        }

        if (!this.feedbackHTML) this._feedback = feedback;
        else this.feedbackHTML.value = feedback;

        this.timeInputBegin = J.now();
    };

    /**
     * ### Feedback.getValues
     *
     * Returns the feedback and paradata
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - feedbackOnly:If TRUE, returns just the feedback (default: FALSE),
     *   - verify:      If TRUE, check if the feedback is valid (default: TRUE),
     *   - reset:       If TRUTHY and the feedback is valid, then it resets
     *       the feedback value before returning (default: FALSE),
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       (default: TRUE),
     *   - updateUI:    If TRUE, the UI (form, input, button) is updated.
     *                  Default: FALSE.
     *   - highlight:   If TRUE, if feedback is not the valid, widget is
     *                  is highlighted. Default: (updateUI || FALSE).
     *   - say:         If TRUE, and the feedback is valid, then it sends
     *                  a data msg. Default: FALSE.
     *   - sayAnyway:   If TRUE, it sends a data msg regardless of the
     *                  validity of the feedback. Default: FALSE.
     *
     * @return {string|object} The feedback, and optional paradata
     *
     * @see Feedback.sendValues
     * @see Feedback.verifyFeedback
     * @see getFeedback
     */
    Feedback.prototype.getValues = function(opts) {
        var feedback, res;

        opts = opts || {};

        feedback = getFeedback.call(this);

        if (opts.verify !== false) res = this.verifyFeedback(opts.markAttempt,
                                                             opts.updateUI);

        if (res === false && opts.updateUI || opts.highlight) this.highlight();

        // Only value.
        if (!opts.feedbackOnly) {
            feedback = {
                timeBegin: this.timeInputBegin,
                feedback: feedback,
                attempts: this.attempts,
                valid: res
            };
        }

        // Send the message.
        if ((opts.say && res) || opts.sayAnyway) {
            this.sendValues({ values: feedback });
        }

        if (opts.reset) this.reset();

        return feedback;
    };

    /**
     * ### Feedback.sendValues
     *
     * Sends a DATA message with label 'feedback' with feedback and paradata
     *
     * @param {object} opts Optional. Options to pass to the `getValues`
     *    method. Additional options:
     *
     *    - values: actual values to send, instead of the return
     *        value of `getValues`
     *    - to: recipient of the message. Default: 'SERVER'
     *
     * @return {string|object} The feedback, and optional paradata
     *
     * @see Feedback.getValues
     */
    Feedback.prototype.sendValues = function(opts) {
        var values;
        opts = opts || { feedbackOnly: true };
        values = opts.values || this.getValues(opts);
        node.say('feedback', opts.to || 'SERVER', values);
        return values;
    };

    /**
     * ### Feedback.highlight
     *
     * Highlights the feedback form
     *
     * @param {string} The style for the form border. Default: '1px solid red'
     *
     * @see Feedback.highlighted
     */
    Feedback.prototype.highlight = function(border) {
        if (!this.feedbackHTML) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('Feedback.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.feedbackHTML.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### Feedback.unhighlight
     *
     * Removes highlight from the form
     *
     * @see Feedback.highlighted
     */
    Feedback.prototype.unhighlight = function() {
        if (!this.feedbackHTML) return;
        this.feedbackHTML.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### Feedback.reset
     *
     * Resets feedback and collected paradata
     */
    Feedback.prototype.reset = function() {
        this.attempts = [];
        this.timeInputBegin = null;
        this._feedback = null;

        if (this.feedbackHTML) this.feedbackHTML.value = '';
        if (this.isHighlighted()) this.unhighlight();
    };

    // ## Helper functions.

//     /**
//      * ### checkLength
//      *
//      * Checks the feedback length
//      *
//      * @param {HTMLElement} feedbackTextarea The textarea with feedback
//      * @param {HTMLElement} charCounter The span counting the characthers
//      * @param {HTMLElement} submit The submit button
//      * @param {number} minLength The minimum length of feedback
//      * @param {number} maxLength The max length of feedback
//      */
//     function checkLength(feedbackTextarea, charCounter,
//                                  submit, minLength, maxLength) {
//         var length, res;
//
//         length = feedbackTextarea.value.trim().length;
//
//         if (length < minLength) {
//             res = false;
//             submit.disabled = true;
//             charCounter.innerHTML = (minLength - length) +
//                 ' characters needed.';
//             charCounter.style.backgroundColor = '#f2dede';
//         }
//         else if (length > maxLength) {
//             res = false;
//             submit.disabled = true;
//             charCounter.innerHTML = (length - maxLength) +
//                 ' characters over.';
//             charCounter.style.backgroundColor = '#f2dede';
//         }
//         else {
//             res = true;
//             submit.disabled = false;
//             charCounter.innerHTML = (maxLength - length) +
//                 ' characters remaining.';
//             charCounter.style.backgroundColor = '#dff0d8';
//         }
//
//         return true;
//     }


    Feedback.prototype.isValidFeedback = function(markAttempt, updateUI) {
        var feedback, length, updateCount, updateColor, res;
        var submitButton, charCounter;

        feedback = getFeedback.call(this);
        length = feedback.length;

        submitButton = this.submitButton;
        charCounter = this.charCounter;

        if (length < this.minLength) {
            res = false;
            updateCount = (this.minLength - length) + ' characters needed.';
            updateColor = '#a32020''; // #f2dede';
        }
        else if (length > this.maxLength) {
            res = false;
            updateCount = (length - this.maxLength) + ' characters over.';
            updateColor = '#a32020''; // #f2dede';
        }
        else {
            res = true;
            updateCount = (this.maxLength - length) + ' characters remaining.';
            updateColor = '#78b360'; // '#dff0d8';
        }

        if (updateUI) {
            submitButton.disabled = !res;
            charCounter.style.backgroundColor = updateColor;
            charCounter.innerHTML = updateCount;
        }

        if (!res) {
            if ('undefined' === typeof markAttempt || markAttempt) {
                if (feedback.length > this.maxAttemptLength) {
                    feedback = feedback.substr(0, this.maxAttemptLength);
                }
                this.attempts.push(feedback);
            }
        }

        return res;
    };

    /**
     * ### getFeedback
     *
     * Returns the value of the feedback textarea or in `_feedback`
     *
     * Must be invoked with right context
     *
     * @return {string|null} The value of the feedback, if any
     */
    function getFeedback() {
        var out;
        out = this.feedbackHTML ? this.textareaElement.value : this._feedback;
        return out ? out.trim() : out;
    }

})(node);
