/**
 * # Feedback
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server
 *
 * www.nodegame.org
 *
 * TODO: rename css class feedback-char-count
 * TODO: words and chars count without contraints, just show.
 * TODO: shows all constraints in gray before the textarea.
 */
(function(node) {

    "use strict";

    node.widgets.register('Feedback', Feedback);

    // ## Meta-data

    Feedback.version = '1.6.0';
    Feedback.description = 'Displays a configurable feedback form';

    Feedback.title = 'Feedback';
    Feedback.className = 'feedback';

    Feedback.texts = {
        autoHint: function(w) {
            var res, res2;
            if (w.minChars && w.maxChars) {
                res = 'between ' + w.minChars + ' and ' + w.maxChars +
                    ' characters';
            }
            else if (w.minChars) {
                res = 'at least ' + w.minChars + ' character';
                if (w.minChars > 1) res += 's';
            }
            else if (w.maxChars) {
                res = 'at most ' +  w.maxChars + ' character';
                if (w.maxChars > 1) res += 's';
            }
            if (w.minWords && w.maxWords) {
                res2 = 'beetween ' + w.minWords + ' and ' + w.maxWords +
                    ' words';
            }
            else if (w.minWords) {
                res2 = 'at least ' + w.minWords + ' word';
                if (w.minWords > 1) res2 += 's';
            }
            else if (w.maxWords) {
                res2 = 'at most ' +  w.maxWords + ' word';
                if (w.maxWords > 1) res2 += 's';
            }
            if (res) {
                res = '(' + res;
                if (res2) res +=  ', and ' + res2;
                return res + ')';
            }
            else if (res2) {
                return '(' + res2 + ')';
            }
            return false;
        },
        submit: 'Submit feedback',
        label: 'Any feedback? Let us know here:',
        sent: 'Sent!',
        counter: function(w, param) {
            var res;
            res = param.chars ? ' character' : ' word';
            if (param.len !== 1) res += 's';
            if (param.needed) res += ' needed';
            else if (param.over) res += ' over';
            else if (!param.justcount) res += ' remaining';
            return res;
        }
    };

    // Colors for missing, excess or ok.
    var colNeeded, colOver, colRemain;
    colNeeded = '#a32020'; // #f2dede';
    colOver = '#a32020'; // #f2dede';
    colRemain = '#78b360'; // '#dff0d8';

    /**
     * ## Feedback constructor
     *
     * `Feedback` sends a feedback message to the server
     *
     * @param {object} options Optional. Configuration options
     */
    function Feedback(options) {
        var tmp;

        if ('undefined' !== typeof options.maxLength) {
            console.log('***Feedback constructor: maxLength is deprecated, ' +
                        'use maxChars instead***');
            options.maxChars = options.maxLength;
        }
        if ('undefined' !== typeof options.minLength) {
            console.log('***Feedback constructor: minLength is deprecated, ' +
                        'use minChars instead***');
            options.minChars = options.minLength;
        }

        /**
         * ### Feedback.mainText
         *
         * The main text introducing the choices
         *
         * @see Feedback.spanMainText
         */
        this.mainText = null;

        /**
         * ### Feedback.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

        /**
         * ### Feedback.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### Feedback.maxChars
         *
         * The maximum character length for feedback to be submitted
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxChars) {
            this.maxChars = 0;
        }
        else {
            tmp = J.isInt(options.maxChars, 0);
            if (tmp !== false) {
                this.maxChars = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: maxChars ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.maxChars);
            }
        }

        /**
         * ### Feedback.minChars
         *
         * The minimum character length for feedback to be submitted
         *
         * If minChars = 0, then there is no minimum length checked.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.minChars) {
            this.minChars = 0;
        }
        else {
            tmp = J.isInt(options.minChars, 0, undefined, true);
            if (tmp !== false) {
                if (this.maxChars && tmp > this.maxChars) {
                    throw new TypeError('Feedback constructor: minChars ' +
                                        'cannot be greater than maxChars. ' +
                                        'Found: ' + tmp + ' > ' +
                                        this.maxChars);
                }
                this.minChars = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: minChars ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.minChars);
            }
        }

        /**
         * ### Feedback.maxWords
         *
         * The maximum number of words for feedback to be submitted
         *
         * Set to 0 for no checks.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxWords) {
            this.maxWords = 0;
        }
        else {
            tmp = J.isInt(options.maxWords, 0, undefined, true);
            if (tmp !== false) {
                this.maxWords = options.maxWords;
            }
            else {
                throw new TypeError('Feedback constructor: maxWords ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.maxWords);
            }
        }

        /**
         * ### Feedback.minWords
         *
         * The minimum number of words for feedback to be submitted
         *
         * If minWords = 0, then there is no minimum checked.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.minWords) {
            this.minWords = 0;
        }
        else {
            tmp = J.isInt(options.minWords, 0, undefined, true);
            if (tmp  !== false) {
                this.minWords = options.minWords;

                // Checking if words and characters limit are compatible.
                if (this.maxChars) {
                    tmp = (this.maxChars+1)/2;
                    if (this.minWords > tmp) {

                        throw new TypeError('Feedback constructor: minWords ' +
                                            'cannot be larger than ' +
                                            '(maxChars+1)/2. Found: ' +
                                            this.minWords + ' > ' + tmp);
                    }
                }
            }
            else {
                throw new TypeError('Feedback constructor: minWords ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.minWords);
            }
        }

        // Extra checks.
        if (this.maxWords) {
            if (this.maxChars && this.maxChars < this.maxWords) {
                throw new TypeError('Feedback constructor: maxChars ' +
                                    'cannot be smaller than maxWords. ' +
                                    'Found: ' + this.maxChars + ' > ' +
                                    this.maxWords);
            }
            if (this.minChars > this.maxWords) {
                throw new TypeError('Feedback constructor: minChars ' +
                                    'cannot be greater than maxWords. ' +
                                    'Found: ' + this.minChars + ' > ' +
                                    this.maxWords);
            }
        }

        if (this.minWords || this.minChars || this.maxWords ||
            this.maxChars) {

            this.required = true;
        }

        /**
         * ### Feedback.rows
         *
         * The number of initial rows of the texarea
         *
         * Default: 3
         */
        if ('undefined' === typeof options.rows) {
            this.rows = 3;
        }
        else if (J.isInt(options.rows, 0) !== false) {
            this.rows = options.rows;
        }
        else {
            throw new TypeError('Feedback constructor: rows ' +
                                'must be an integer > 0 or undefined. ' +
                                'Found: ' + options.rows);
        }

        /**
         * ### Feedback.maxAttemptLength
         *
         * The maximum character length for an attempt to submit feedback
         *
         * Attempts are stored in the attempts array. You can store attempts
         * longer than valid feedbacks.
         *
         * Set to 0 for no limit.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxAttemptLength) {
            this.maxAttemptLength = 0;
        }
        else {
            tmp = J.isNumber(options.maxAttemptLength, 0);
            if (tmp !== false) {
                this.maxAttemptLength = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: ' +
                                'options.maxAttemptLength must be a number ' +
                                '> 0 or undefined. Found: ' +
                                options.maxAttemptLength);
            }
        }

        /**
         * ### Feedback.showSubmit
         *
         * If TRUE, the submit button is shown
         *
         * Default: true
         *
         * @see Feedback.submitButton
         */
        this.showSubmit = 'undefined' === typeof options.showSubmit ?
            true : !!options.showSubmit;

        /**
         * ### Feedback.onsubmit
         *
         * Options passed to `getValues` when the submit button is pressed
         *
         * @see Feedback.getValues
         */
        if (!options.onsubmit) {
            this.onsubmit = { feedbackOnly: true, send: true, updateUI: true };
        }
        else if ('object' === typeof options.onsubmit) {
            this.onsubmit = options.onsubmit;
        }
        else {
            throw new TypeError('Feedback constructor: onsubmit ' +
                                'must be string or object. Found: ' +
                                options.onsubmit);
        }

        /**
         * ### Feedback._feedback
         *
         * Internal storage of the value of the feedback
         *
         * This value is used when the form has not been created yet
         */
        this._feedback = options.feedback || null;

        /**
         * ### Feedback.attempts
         *
         * Invalid feedbacks tried
         */
        this.attempts = [];

        /**
         * ### Feedback.timeInputBegin
         *
         * Time when feedback was inserted (first character, last attempt)
         */
        this.timeInputBegin = null;

        /**
         * ### Feedback.feedbackForm
         *
         * The HTML form element containing the textarea
         */
        this.feedbackForm = null;

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
         * ### Feedback.wordCounter
         *
         * The HTML span element containing the words count
         */
        this.wordCounter = null;

        /**
         * ### Feedback.submitButton
         *
         * The HTML submit button
         */
        this.submitButton = null;

        /**
         * ### Feedback.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.setMsg = !!options.setMsg || false;

    }

    // ## Feedback methods

    // TODO: move all initialization here from constructor.
    Feedback.prototype.init = function(options) {
        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' === typeof options.mainText) {
            this.mainText = this.getText('label');
        }
        else {
            throw new TypeError('Feedback.init: options.mainText must ' +
                                'be string or undefined. Found: ' +
                                options.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof options.hint || false === options.hint) {
            this.hint = options.hint;
        }
        else if ('undefined' !== typeof options.hint) {
            throw new TypeError('Feedback.init: options.hint must ' +
                                'be a string, false, or undefined. Found: ' +
                                options.hint);
        }
        else {
            // Returns undefined if there are no constraints.
            this.hint = this.getText('autoHint');
        }
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
     * @see Feedback.maxAttemptLength
     * @see getFeedback
     */
    Feedback.prototype.verifyFeedback = function(markAttempt, updateUI) {
        var feedback, length,  res;
        var submitButton, charCounter, wordCounter, tmp;
        var updateCharCount, updateCharColor, updateWordCount, updateWordColor;

        feedback = getFeedback.call(this);
        length = feedback ? feedback.length : 0;

        submitButton = this.submitButton;
        charCounter = this.charCounter;
        wordCounter = this.wordCounter;

        res = true;

        if (length < this.minChars) {
            res = false;
            tmp = this.minChars - length;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                needed: true,
                len: tmp
            });
            updateCharColor = colNeeded;
        }
        else if (this.maxChars && length > this.maxChars) {
            res = false;
            tmp = length - this.maxChars;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                over: true,
                len: tmp
            });
            updateCharColor = colOver;
        }
        else {
            tmp = this.maxChars ? this.maxChars - length : length;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                len: tmp,
                justcount: !this.maxChars
            });
            updateCharColor = colRemain;
        }

        if (wordCounter) {
            // kudos: https://css-tricks.com/build-word-counter-app/
            // word count using \w metacharacter -
            // replacing this with .* to match anything between word
            // boundaries since it was not taking 'a' as a word.
            // this is a masterstroke - to count words with any number
            // of hyphens as one word
            // [-?(\w+)?]+ looks for hyphen and a word (we make
            // both optional with ?). + at the end makes it a repeated pattern
            // \b is word boundary metacharacter
            tmp = feedback ? feedback.match(/\b[-?(\w+)?]+\b/gi) : 0;
            length = tmp ? tmp.length : 0;
            if (length < this.minWords) {
                res = false;
                tmp = tmp = this.minWords - length;
                updateWordCount = tmp + this.getText('counter', {
                    needed: true,
                    len: tmp
                });
                updateWordColor = colNeeded;
            }
            else if (this.maxWords && length > this.maxWords) {
                res = false;
                tmp = length - this.maxWords;
                updateWordCount = tmp + this.getText('counter', {
                    over: true,
                    len: tmp
                });
                updateWordColor = colOver;
            }
            else {
                tmp = this.maxWords ? this.maxWords - length : length;
                updateWordCount = tmp + this.getText('counter', {
                    len: tmp,
                    justcount: !this.maxWords
                });
                updateWordColor = colRemain;
            }
        }

        if (updateUI) {
            if (submitButton) submitButton.disabled = !res;
            if (charCounter) {
                charCounter.style.backgroundColor = updateCharColor;
                charCounter.innerHTML = updateCharCount;
            }
            if (wordCounter) {
                wordCounter.style.backgroundColor = updateWordColor;
                wordCounter.innerHTML = updateWordCount;
            }
        }

        if (!res && ('undefined' === typeof markAttempt || markAttempt)) {
            if (this.maxAttemptLength && length > this.maxAttemptLength) {
                feedback = feedback.substr(0, this.maxAttemptLength);
            }
            this.attempts.push(feedback);
        }
        return res;
    };

    /**
     * ### Feedback.isChoiceDone
     *
     * Returns TRUE if the feedback was filled as requested
     *
     * @return {boolean} TRUE if the feedback was filled as requested
     */
    Feedback.prototype.isChoiceDone = function() {
        return this.verifyFeedback();
     };

    /**
     * ### Feedback.append
     *
     * Appends widget to this.bodyDiv
     */
    Feedback.prototype.append = function() {
        var that;
        that = this;

        // this.feedbackForm = W.get('div', { className: 'feedback' });

        this.feedbackForm = W.append('form', this.bodyDiv, {
            className: 'feedback-form'
        });

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.feedbackForm, {
                className: 'feedback-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.feedbackForm, {
                className: 'feedback-hint',
                innerHTML: this.hint
            });
        }

        this.textareaElement = W.append('textarea', this.feedbackForm, {
            className: 'form-control feedback-textarea',
            type: 'text',
            rows: this.rows
        });

        if (this.showSubmit) {
            this.submitButton = W.append('input', this.feedbackForm, {
                className: 'btn btn-lg btn-primary',
                type: 'submit',
                value: this.getText('submit')
            });

            // Add listeners.
            J.addEvent(this.feedbackForm, 'submit', function(event) {
                event.preventDefault();
                that.getValues(that.onsubmit);
            });
        }

        this.showCounters();

        J.addEvent(this.feedbackForm, 'input', function() {
            if (that.isHighlighted()) that.unhighlight();
            that.verifyFeedback(false, true);
        });
        J.addEvent(this.feedbackForm, 'click', function() {
            if (that.isHighlighted()) that.unhighlight();
        });

        // Check it once at the beginning to initialize counter.
        this.verifyFeedback(false, true);
    };

    /**
     * ### Feedback.setValues
     *
     * Set the value of the feedback
     *
     * @param {object} options Conf options. Values:
     *
     *   - feedback: a string containing the desired feedback.
     *               If not set, a random string will be set.
     *   - verify: if TRUE, the method verifyFeedback is called
     *             afterwards, updating the UI. Default: TRUE
     *   - markAttempt: if TRUE, the verify attempt is added. Default: TRUE
     */
    Feedback.prototype.setValues = function(options) {
        var feedback, maxChars, minChars, nWords, i;
        options = options || {};
        if (!options.feedback) {
            minChars = this.minChars || 0;
            if (this.maxChars) maxChars = this.maxChars;
            else if (this.maxWords) maxChars = this.maxWords * 4;
            else if (minChars) maxChars = minChars + 80;
            else maxChars = 80;

            feedback = J.randomString(J.randomInt(minChars, maxChars), 'aA_1');
            if (this.minWords) {
                nWords = this.minWords - feedback.split(' ').length;
                if (nWords > 0) {
                    for (i = 0; i < nWords ; i++) {
                        feedback += ' ' + i;
                    }
                }
            }
        }
        else {
            feedback = options.feedback;
        }

        if (!this.textareaElement) this._feedback = feedback;
        else this.textareaElement.value = feedback;

        this.timeInputBegin = J.now();

        if (options.verify !== false) {
            this.verifyFeedback(options.markAttempt, true);
        }
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
     *   - keepBreaks:  If TRUE, returns a value where all line breaks are
     *                  substituted with HTML <br /> tags (default: FALSE)
     *   - verify:      If TRUE, check if the feedback is valid (default: TRUE),
     *   - reset:       If TRUTHY and the feedback is valid, then it resets
     *       the feedback value before returning (default: FALSE),
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       (default: TRUE),
     *   - updateUI:    If TRUE, the UI (form, input, button) is updated.
     *                  Default: FALSE.
     *   - highlight:   If TRUE, if feedback is not the valid, widget is
     *                  is highlighted. Default: (updateUI || FALSE).
     *   - send:        If TRUE, and the email is valid, then it sends
     *                  a data or set msg. Default: FALSE.
     *   - sendAnyway:  If TRUE, it sends a data or set msg regardless of
     *                  the validity of the email. Default: FALSE.
     *   - say:         same as send, but deprecated.
     *   - sayAnyway:   same as sendAnyway, but deprecated
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

        if ('undefined' !== typeof opts.say) {
            console.log('***EmailForm.getValues: option say is deprecated, ' +
                        ' use send.***');
            opts.send = opts.say;
        }
        if ('undefined' !== typeof opts.sayAnyway) {
            console.log('***EmailForm.getValues: option sayAnyway is ' +
                        'deprecated, use sendAnyway.***');
            opts.sendAnyway = opts.sayAnyway;
        }

        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;

        feedback = getFeedback.call(this);

        if (opts.keepBreaks) feedback = feedback.replace(/\n\r?/g, '<br />');

        if (opts.verify !== false) res = this.verifyFeedback(opts.markAttempt,
                                                             opts.updateUI);

        if (res === false &&
            (opts.updateUI || opts.highlight)) this.highlight();

        // Only value.
        if (!opts.feedbackOnly) {
            feedback = {
                timeBegin: this.timeInputBegin,
                feedback: feedback,
                attempts: this.attempts,
                valid: res
            };
            if (opts.markAttempt) feedback.isCorrect = res;
        }

        // Send the message.
        if (feedback !== '' && ((opts.send && res) || opts.sendAnyway)) {
            this.sendValues({ values: feedback });
            if (opts.updateUI) {
                this.submitButton.setAttribute('value', this.getText('sent'));
                this.submitButton.disabled = true;
                this.textareaElement.disabled = true;
            }
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
        if (this.setMsg) {
            if ('string' === typeof values) values = { feedback: values };
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('feedback', opts.to || 'SERVER', values);
        }
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
        if (border && 'string' !== typeof border) {
            throw new TypeError('Feedback.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.isAppended() || this.highlighted === true) return;
        this.textareaElement.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### Feedback.unhighlight
     *
     * Removes highlight from the form
     *
     * @see Feedback.highlighted
     */
    Feedback.prototype.unhighlight = function() {
        if (!this.isAppended() || this.highlighted !== true) return;
        this.textareaElement.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
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

        if (this.textareaElement) this.textareaElement.value = '';
        if (this.isHighlighted()) this.unhighlight();
    };

    /**
     * ### Feedback.disable
     *
     * Disables texarea and submit button (if present)
     */
    Feedback.prototype.disable = function() {
        // TODO: This gets off when WaitScreen locks all inputs.
        // if (this.disabled === true) return;
        if (!this.textareaElement || this.textareaElement.disabled) return;
        this.disabled = true;
        if (this.submitElement) this.submitElement.disabled = true;
        this.textareaElement.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### Feedback.enable
     *
     * Enables texarea and submit button (if present)
     *
     */
    Feedback.prototype.enable = function() {
        // TODO: This gets off when WaitScreen locks all inputs.
        // if (this.disabled === false || !this.textareaElement) return;
        if (!this.textareaElement || !this.textareaElement.disabled) return;
        this.disabled = false;
        if (this.submitElement) this.submitElement.disabled = false;
        this.textareaElement.disabled = false;
        this.emit('enabled');
    };

    /**
     * ### Feedback.showCounters
     *
     * Shows the character counter
     *
     * If not existing before, it creates it.
     *
     * @see Feedback.charCounter
     */
    Feedback.prototype.showCounters = function() {
        if (!this.charCounter) {
            if (this.minChars || this.maxChars) {
                this.charCounter = W.append('span', this.feedbackForm, {
                    className: 'feedback-char-count badge',
                    innerHTML: this.maxChars
                });
            }
        }
        else {
            this.charCounter.style.display = '';
        }
        if (!this.wordCounter) {
            if (this.minWords || this.maxWords) {
                this.wordCounter = W.append('span', this.feedbackForm, {
                    className: 'feedback-char-count badge',
                    innerHTML: this.maxWords
                });
                if (this.charCounter) {
                    this.wordCounter.style['margin-left'] = '10px';
                }
            }
        }
        else {
            this.wordCounter.style.display = '';
        }
    };

    /**
     * ### Feedback.hideCounters
     *
     * Hides the character counter
     */
    Feedback.prototype.hideCounters = function() {
        if (this.charCounter) this.charCounter.style.display = 'none';
        if (this.wordCounter) this.wordCounter.style.display = 'none';
    };

    // ## Helper functions.

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
        out = this.textareaElement ?
            this.textareaElement.value : this._feedback;
        return out ? out.trim() : out;
    }

})(node);
