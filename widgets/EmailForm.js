/**
 * # EmailForm
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Displays a form to input email
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('EmailForm', EmailForm);

    // ## Meta-data

    EmailForm.version = '0.2.0';
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
         * The label for the email element
         */
        if ('undefined' === typeof options.label) {
            this.label = 'Enter your email:';
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
         * ### EmailForm.errString
         *
         * The error message in case of invalid email format
         *
         * Notice! It is displayed only if the submit button is displayed.
         */
        if ('undefined' === typeof options.errString) {
            this.errString = 'Not a valid email address, ' +
                'please correct it and submit again.';
        }
        else if ('string' === typeof options.errString) {
            this.errString = options.errString;
        }
        else {
            throw new TypeError('EmailForm constructor: options.errString ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.errString);
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
        this._email = options.email || null;

        /**
         * ### EmailForm.attempts
         *
         * Invalid emails tried
         */
        this.attempts = [];

        /**
         * ### EmailForm.timeInput
         *
         * Time when the email was inserted (first character)
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
         * ### EmailForm.emailButtonElement
         *
         * The email's HTML submit button
         */
        this.buttonElement = null;
    }

    // ## EmailForm methods

    EmailForm.prototype.createForm = function() {
        var that;
        var formElement, labelElement, inputElement, buttonElement;

        that = this;

        formElement = document.createElement('form');
        formElement.className = 'endscreen-email-form';

        labelElement = document.createElement('label');
        labelElement.innerHTML = this.label;

        inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('placeholder', 'Email');
        inputElement.className = 'emailform-input form-control';

        buttonElement = document.createElement('input');
        buttonElement.setAttribute('type', 'submit');
        buttonElement.setAttribute('value', 'Submit email');
        buttonElement.className = 'btn btn-lg btn-primary ' +
            'endscreen-email-submit';

        formElement.appendChild(labelElement);
        formElement.appendChild(inputElement);
        formElement.appendChild(buttonElement);


        formElement.addEventListener('submit', function(event) {
            event.preventDefault();
            that.getValues({ emailOnly: true });
        }, true);

        // Store references.
        this.formElement = formElement;
        this.inputElement = inputElement;
        this.buttonElement = buttonElement;

        // If a value was previously set, insert it in the form.
        if (this._email) this.formElement.value = this._email;
        this._email = null;

        return formElement;
    };

    /**
     * ### EmailForm.verifyEmail
     *
     * Verify current email, updates interface, and optionally marks attempt
     *
     * @param {boolean} markAttempt Optional. If TRUE, the current email
     *   is added to the attempts array. Default: TRUE
     *
     * @return {boolean} TRUE if the email is valid
     *
     * @see EmailForm.getValues
     * @see getEmail
     */
    EmailForm.prototype.verifyEmail = function(markAttempt) {
        var email, res;
        email = getEmail.call(this);
        res = this.isValidEmail(email);
        if (res) {
            if (this.inputElement) this.inputElement.disabled = true;
            if (this.buttonElement) {
                this.buttonElement.disabled = true;
                this.buttonElement.value = 'Sent!';
            }
            if ('undefined' === typeof markAttempt || markAttempt) {
                this.attempts.push(email);
            }
        }
        else {
            if (this.buttonElement) this.buttonElement.value = this.errString;
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
        if (!options.email) {
            email = J.randomString(J.randomInt(5,15), '!Aa0') + '@' +
                J.randomString(J.randomInt(3,10))  + '.' +
                J.randomString(J.randomInt(2,3));
        }
        else {
            email = options.email;
        }

        if (!this.inputElement) this._email = email;
        else this.inputElement.value = email;

        this.timeInput = Date.now ? Date.now() : new Date().getTime();
    };

    /**
     * ### EmailForm.getValues
     *
     * Returns the email input form
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
     *   - highlight:   If TRUE, if email is not the valid, widget
     *       will be highlighted. Default: FALSE.
     *
     * @return {string|object} The email, and optional paradata
     *
     * @see EmailForm.sendValues
     * @see EmailForm.verifyEmail
     * @see getEmail
     */
    EmailForm.prototype.getValues = function(opts) {
        var email, res;
        opts = opts || {};

        email = getEmail.call(this);
        // Email, with or without email form; or FALSE if invalid.
        if (opts.verify !== false) res = this.verifyEmail(opts.markAttempt);

        // Only value.
        if (!opts.emailOnly) {

            if (res === false && opts.highlight) this.hightlight();

            email = {
                time: this.timeInput,
                email: email,
                attempts: this.attempts,
                valid: res
            };
        }

        if (opts.say) this.sendValues({ values: email });
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
        node.say('email', opts.to || 'SERVER', values);
        return values;
    };

    /**
     * ### EmailForm.isValidEmail
     *
     * Returns TRUE if the email is valid
     *
     * TODO: improve validation. Move into JSUS?
     *
     * @param {string} email
     *
     * @return {boolean} res TRUE, if the email is valid
     */
    EmailForm.prototype.isValidEmail = function(email) {
        var idx;
        if ('string' !== typeof email) return false;
        if (email.trim().length > 5) return false;

        idx = email.indexOf('@');
        if (idx === -1 || idx === 0 || idx === (email.length-1)) return false;

        idx = email.lastIndexOf('.');
        if (idx === -1 || idx === (email.length-1) || idx > (idx+1)) {
            return false;
        }

        return true;
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
        if (!this.formElement) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('EmailForm.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.formElement.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### EmailForm.unhighlight
     *
     * Removes highlight from the form
     *
     * @see EmailForm.highlighted
     */
    EmailForm.prototype.unhighlight = function() {
        if (!this.formElement) return;
        this.formElement.style.border = '';
        this.highlighted = false;
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
