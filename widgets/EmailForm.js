/**
 * # EmailForm
 * Copyright(c) 2021 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Displays a form to input email
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('EmailForm', EmailForm);

    // ## Meta-data

    EmailForm.version = '0.13.0';
    EmailForm.description = 'Displays a configurable email form.';

    EmailForm.title = false;
    EmailForm.className = 'emailform';

    EmailForm.texts = {
        label: 'Enter your email:',
        errString: 'Not a valid email address, ' +
                   'please correct it and submit it again.',
        sent: 'Sent!'
    };

    /**
     * ## EmailForm constructor
     *
     * @param {object} options configuration option
     */
    function EmailForm(opts) {

        /**
         * ### EmailForm.onsubmit
         *
         * Options passed to `getValues` when the submit button is pressed
         *
         * @see EmailForm.getValues
         */
        if (!opts.onsubmit) {
            this.onsubmit = {
                emailOnly: true,
                send: true,
                updateUI: true
            };
        }
        else if ('object' === typeof opts.onsubmit) {
            this.onsubmit = opts.onsubmit;
        }
        else {
            throw new TypeError('EmailForm constructor: opts.onsubmit ' +
                                'must be object or undefined. Found: ' +
                                opts.onsubmit);
        }

        /**
         * ### EmailForm._email
         *
         * Internal storage of the value of the email
         *
         * This value is used when the form has not been created yet
         *
         * @see EmailForm.createForm
         */
        this._email = opts.email || null;

        /**
         * ### EmailForm.attempts
         *
         * Invalid emails tried
         */
        this.attempts = [];

        /**
         * ### EmailForm.timeInput
         *
         * Time when the email was inserted (first character, last attempt)
         */
        this.timeInput = null;

        /**
         * ### EmailForm.formElement
         *
         * The email's HTML form
         */
        this.formElement = null;

        /**
         * ### EmailForm.inputElement
         *
         * The email's HTML input form
         */
        this.inputElement = null;

        /**
         * ### EmailForm.buttonElement
         *
         * The email's HTML submit button
         */
        this.buttonElement = null;

        /**
         * ### EmailForm.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.setMsg = !!opts.setMsg || false;

        /**
         * ### EmailForm.showSubmitBtn
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.showSubmitBtn = 'undefined' === typeof opts.showSubmitBtn ?
            true : !!opts.showSubmitBtn;
    }

    // ## EmailForm methods

    EmailForm.prototype.createForm = function() {
        var that;
        var formElement, labelElement, inputElement, buttonElement;

        that = this;

        formElement = document.createElement('form');
        formElement.className = 'emailform-form';

        labelElement = document.createElement('label');
        labelElement.innerHTML = this.getText('label');

        inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('placeholder', 'Email');
        inputElement.className = 'emailform-input form-control';

        formElement.appendChild(labelElement);
        formElement.appendChild(inputElement);

        // Store references.
        this.formElement = formElement;
        this.inputElement = inputElement;

        if (this.showSubmitBtn) {
            buttonElement = document.createElement('input');
            buttonElement.setAttribute('type', 'submit');
            buttonElement.setAttribute('value', 'Submit email');
            buttonElement.className = 'btn btn-lg btn-primary ' +
            'emailform-submit';
            formElement.appendChild(buttonElement);

            // Add listeners on input form.
            J.addEvent(formElement, 'submit', function(event) {
                event.preventDefault();
                that.getValues(that.onsubmit);
            }, true);
            J.addEvent(formElement, 'input', function() {
                if (!that.timeInput) that.timeInput = J.now();
                if (that.isHighlighted()) that.unhighlight();
            }, true);

            // Store reference.
            this.buttonElement = buttonElement;
        }

        // If a value was previously set, insert it in the form.
        if (this._email) this.formElement.value = this._email;
        this._email = null;

        return formElement;
    };

    /**
     * ### EmailForm.verifyInput
     *
     * Verify current email, updates interface, and optionally marks attempt
     *
     * @param {boolean} markAttempt Optional. If TRUE, the current email
     *    is added to the attempts array. Default: TRUE
     * @param {boolean} updateUI Optional. If TRUE, the interface is updated.
     *    Default: FALSE
     *
     * @return {boolean} TRUE, if the email is valid
     *
     * @see EmailForm.getValues
     * @see getEmail
     */
    EmailForm.prototype.verifyInput = function(markAttempt, updateUI) {
        var email, res;
        email = getEmail.call(this);
        res = J.isEmail(email);
        if (res && updateUI) {
            if (this.inputElement) this.inputElement.disabled = true;
            if (this.buttonElement) {
                this.buttonElement.disabled = true;
                this.buttonElement.value = this.getText('sent');
            }
        }
        else {
            if (updateUI && this.buttonElement) {
                this.buttonElement.value = this.getText('errString');
            }
            if ('undefined' === typeof markAttempt || markAttempt) {
                this.attempts.push(email);
            }
        }
        return res;
    };

    /**
     * ### EmailForm.append
     *
     * Appends widget to this.bodyDiv
     */
    EmailForm.prototype.append = function() {
        this.createForm();
        this.bodyDiv.appendChild(this.formElement);
    };

    /**
     * ### EmailForm.setValues
     *
     * Set the value of the email input form
     */
    EmailForm.prototype.setValues = function(options) {
        var email;
        options = options || {};
        if (!options.email) email = J.randomEmail();
        else email = options.email;

        if (!this.inputElement) this._email = email;
        else this.inputElement.value = email;

        this.timeInput = J.now();
    };

    /**
     * ### EmailForm.getValues
     *
     * Returns the email and paradata
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - emailOnly:   If TRUE, returns just the email (default: FALSE),
     *   - verify:      If TRUE, check if the email is valid (default: TRUE),
     *   - reset:       If TRUTHY and the email is valid, then it resets
     *       the email value before returning (default: FALSE),
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       (default: TRUE),
     *   - updateUI:    If TRUE, the UI (form, input, button) is updated.
     *                  Default: FALSE.
     *   - highlight:   If TRUE, if email is not the valid, widget is
     *                  is highlighted. Default: (updateUI || FALSE).
     *   - send:        If TRUE, and the email is valid, then it sends
     *                  a data or set msg. Default: FALSE.
     *   - sendAnyway:  If TRUE, it sends a data or set msg regardless of
     *                  the validity of the email. Default: FALSE.
     *   - say:         same as send, but deprecated.
     *   - sayAnyway:   same as sendAnyway, but deprecated
     *
     * @return {string|object} The email, and optional paradata
     *
     * @see EmailForm.sendValues
     * @see EmailForm.verifyInput
     * @see getEmail
     */
    EmailForm.prototype.getValues = function(opts) {
        var email, res;
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

        email = getEmail.call(this);

        if (opts.verify !== false) {
            res = this.verifyInput(opts.markAttempt, opts.updateUI);
        }

        // Only value.
        if (!opts.emailOnly) {
            email = {
                time: this.timeInput,
                email: email,
                attempts: this.attempts,
            };
        }

        if (opts.markAttempt) email.isCorrect = res;

        if (res === false) {
            if (opts.updateUI || opts.highlight) this.highlight();
            this.timeInput = null;
        }

        // Send the message.
        if ((opts.send && res) || opts.sendAnyway) {
            this.sendValues({ values: email });
        }

        if (opts.reset) this.reset();

        return email;
    };

    /**
     * ### EmailForm.sendValues
     *
     * Sends a DATA message with label 'email' with current email and paradata
     *
     * @param {object} opts Optional. Options to pass to the `getValues`
     *    method. Additional options:
     *
     *    - values: actual values to send, instead of the return
     *        value of `getValues`
     *    - to: recipient of the message. Default: 'SERVER'
     *
     * @return {string|object} The email, and optional paradata
     *
     * @see EmailForm.getValues
     */
    EmailForm.prototype.sendValues = function(opts) {
        var values;
        opts = opts || { emailOnly: true };
        values = opts.values || this.getValues(opts);
        if (this.setMsg) {
            if ('string' === typeof values) values = { email: values };
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('email', opts.to || 'SERVER', values);
        }
        return values;
    };

    /**
     * ### EmailForm.highlight
     *
     * Highlights the email form
     *
     * @param {string} The style for the form border. Default: '1px solid red'
     *
     * @see EmailForm.highlighted
     */
    EmailForm.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('EmailForm.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.inputElement || this.highlighted === true) return;
        this.inputElement.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### EmailForm.unhighlight
     *
     * Removes highlight from the form
     *
     * @see EmailForm.highlighted
     */
    EmailForm.prototype.unhighlight = function() {
        if (!this.inputElement || this.highlighted !== true) return;
        this.inputElement.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### EmailForm.reset
     *
     * Resets email and collected paradata
     */
    EmailForm.prototype.reset = function() {
        this.attempts = [];
        this.timeInput = null;
        this._email = null;

        if (this.inputElement) this.inputElement.value = '';
        if (this.isHighlighted()) this.unhighlight();
    };

    // ## Helper methods.

    /**
     * ### getEmail
     *
     * Returns the value of the email in form or in `_email`
     *
     * Must be invoked with right context
     *
     * @return {string|null} The value of the email, if any
     */
    function getEmail() {
        return this.inputElement ? this.inputElement.value : this._email;
    }

})(node);
