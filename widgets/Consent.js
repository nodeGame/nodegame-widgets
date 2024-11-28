/**
 * # Consent
 * Copyright(c) 2024 Stefano Balietti
 * MIT Licensed
 *
 * Displays a consent form with buttons to accept/reject it
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Consent', Consent);

    // ## Meta-data

    Consent.version = '0.8.0';
    Consent.description = 'Displays a configurable consent form.';

    Consent.panel = false;
    Consent.className = 'consent';

    Consent.texts = {

        areYouSure: 'You did not consent and are about to leave the ' +
                    'study. Are you sure?',

        printText:
        '<br/><p>If you need a copy of this consent form, you may ' +
        'print a copy of this page for your records.</p>',

        printBtn: 'Print this page',

        consentTerms: 'Do you understand and consent to these terms?',

        agree: 'Yes, I agree',

        notAgree: 'No, I do not agree',

        showHideConsent: function(w, s) {
            return (s === 'hide' ? 'Hide' : 'Show') + ' Consent Form';
        }

    };

    /**
     * ## Consent constructor
     *
     * Creates a new instance of Consent
     *
     * @see Consent.init
     */
    function Consent() {

        /**
         * ## Consent.consentTexts
         *
         * The object containing the variables to substitute
         *
         * Default: node.game.settings.CONSENT
         */
        this.consentTexts = null;

        /**
         * ## Consent.agreed
         *
         * If TRUE, consent has been given
         */
        this.agreed = null;

        /**
         * ## Consent.showPrint
         *
         * If TRUE, the print button is shown
         *
         * Default: TRUE
         */
        this.showPrint = null;

        /**
         * ## Consent.showAgreeBtns
         *
         * If TRUE, the agree/disagree buttons are shown
         *
         * Default: TRUE
         */
        this.showAgreeBtns = null;

        /**
         * ## Consent.disconnect
         *
         * If TRUE, client is disconnected upon reject
         *
         * Default: TRUE
         */
        this.disconnect = null;

        /**
         * ## Consent.checkboxes
         *
         * Checkboxes that need to checked to consent
         * 
         * The content of the arrays can be strings, or objects that specify
         * additional properties, i.e.:
         * 
         * ```js
         * 
         * {
         *    label: 'This is the label text',
         *    required: false, // Default true
         *    className: 'myclass' // Added to outer div, default: 'form-switch'
         * }
         * ```
         * 
         * They can also be functions that either return strings or objects,
         * or FALSE, if the checkbox should not be added.
         * 
         */
        this.checkboxes = [];

        /**
         * ## Consent.fineprint
         *
         * Additional text displayed in a small font under the checkboxes
         */
        this.fineprint = null;

        /**
         * ## Consent.prefix
         *
         * The prefix to the ids created by the widget
         * 
         * Default: ''
         */
        this.prefix = '';

        /**
         * ## Consent.consentId
         *
         * The id of the HTML element that contains the consent
         * 
         * The widget will be appended here, if found.
         * 
         * Default: `prefix` + 'consent'
         */
        this.consentId = 'consent';

        /**
         * ## Consent.doneOnAgree
         *
         * If TRUE, `node.done` is called upon agreeing to consent form
         * 
         * Default: TRUE
         */
        this.doneOnAgree;

    }

    // ## Consent methods.

    /**
     * ### Consent.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    Consent.prototype.init = function(opts) {
        var that;
        opts = opts || {};

        this.consentTexts = opts.consent || node.game.settings.CONSENT;

        if (this.consentTexts && 'object' !== typeof this.consentTexts) {
            throw new TypeError('Consent.init: consent must be object or ' +
                                'undefined. Found: ' + this.consentTexts);
        }

        this.showPrint = opts.showPrint === false ? false : true;

        this.showBtns = opts.showAgreeBtns === false ? false : true;
        
        this.disconnect = opts.disconnect === false ? false : true;

        this.doneOnAgree = opts.doneOnAgree === false ? false : true;

        if (J.isArray(opts.checkboxes)) {
            that = this;
            opts.checkboxes.forEach(function(item) {
                if ('function' === typeof item) {
                    item = item();
                    if (item === false) return;
                }
                that.checkboxes.push(item);
            });
        }
        else if (opts.checkboxes) {
            throw new TypeError('Consent.init: checkboxes must be array or ' +
                                'undefined. Found: ' + this.checkboxes);
        }

        _assignStr(this, opts, 'prefix');
        _assignStr(this, opts, 'fineprint');
        _assignStr(this, opts, 'consentId');

        if ('undefined' === typeof opts.consentId) {
            this.consentId = _addPrefix(this, this.consentId);
        }
    };

    Consent.prototype.enable = function() {
        if (this.agreed !== null) return;
        _toggleEnable(true);
    };

    Consent.prototype.disable = function() {
        _toggleEnable(false);
    };

    Consent.prototype.append = function() {
        var that, consent, isRtl, html, btn1, btn2, st1, st2;
        
        that = this;
        
        // Hide not agreed div.
        W.hide(_addPrefix(this, 'notAgreed'));

        consent = W.gid(this.consentId);
        if (!consent) {
            node.warn('Consent.append: the page does not contain an ' +
                            'element with id "' + this.consentId + 
                            '", it will use widget\'s root');
            
            consent = w.bodyDiv;
        }
        html = '';
        
        // Checkboxes.

        isRtl = W.isRTL(this.bodyDiv);

        if (this.checkboxes.length || this.fineprint) {
        
            html += '<div class="gdpr-checkboxes">';
            
            if (this.checkboxes.length) {
                html += '<dl>';
                this.checkboxes.forEach(function(c, idx) {
                    var id, label, btn, className;
                    id = _getCbxId(that, idx+1);

                    className = 'form-check';
                    if (isRtl) className += '-reverse';

                    if ('object' === typeof c) {
                        label = c.label;
                        className += ' ' + c.className; 
                    }
                    else {
                        label = c;
                    }
                    
                    btn = '<input class="form-check-input" type="checkbox" ' +
                        'role="switch" id="' + id + '">';
                    label = '<label class="form-check-label" ' +
                        'for="' + id + '">' + label + '</label>';
                        
                    html += '<dt>';
                    html += '<div class="' + className + '">';
                    html += isRtl ? label + btn : btn + label;
                    html += '</div></dt>';
                });
                html += '</dl>';
            }
     
            if (this.fineprint) {
                html += '<p class="gdpr-fineprint">';
                html += this.fineprint;
                html += '</p>';
            }
            
            html += '</div>';

        }

        // Print.
        if (this.showPrint) {
            html = this.getText('printText');
            html += '<input class="btn btn-outline-secondary" ' +
                'type="button" value="' + this.getText('printBtn') +
                '" onclick="window.print()" /><br/><br/>';
        }

        
        if (this.showBtns !== false) {
            // Header for buttons.
            html += '<strong>' + this.getText('consentTerms') + '</strong><br>';

            // Buttons.
            html += '<div class="consent-btn-container">';

            if (isRtl) {
                btn1 = _addPrefix(this, 'agree');
                btn2 = _addPrefix(this, 'notAgree');
                st1 = 'info';
                st2 = 'outline-danger';
            }
            else {
                btn1 = _addPrefix(this, 'notAgree');
                btn2 = _addPrefix(this, 'agree');
                st1 = 'outline-danger';
                st2 = 'info';
            }

            html += '<button class="consent-btn btn btn-lg btn-' + st1 +
                '" id="' + btn1 + '">' + this.getText(btn1) + '</button>';

            html += '<button class="consent-btn btn btn-lg btn-' + st2 + 
                '" id="' + btn2 + '">' + this.getText(btn2) + '</button></div>';
        }
        

        consent.innerHTML += html;
        setTimeout(function() { W.adjustFrameHeight(); });
    };

    Consent.prototype.listeners = function() {
        var that = this;
        var consent = this.consentTexts;
        node.on('FRAME_LOADED', function() {
            var a, na, p, id;

            // Replace all texts.
            if (consent) {
                for (p in consent) {
                    if (consent.hasOwnProperty(p)) {
                        // Making lower-case and replacing underscore
                        // s with dashes.
                        id = p.toLowerCase();
                        id = id.replace(new RegExp("_", 'g'), "-");
                        W.setInnerHTML(id, consent[p]);
                    }
                }
            }

            // Add listeners on buttons.
            if (!that.showBtns) return;

            a = W.gid(_addPrefix(this, 'agree'));
            na = W.gid(_addPrefix(this, 'notAgree'));

            a.onclick = function() { 
                var consent;
                node.emit('CONSENT_ACCEPTING');
                consent = that.getValues({ agreed: true });
                if (!consent.consent) return;
                this.agreed = true;
                node.emit('CONSENT_ACCEPTED', consent);
                if (that.doneOnAgree) node.done(consent); 
            };
            na.onclick = function() {
                var showIt, confirmed;

                confirmed = confirm(that.getText('areYouSure'));
                if (!confirmed) return;

                node.emit('CONSENT_REJECTING');

                that.agreed = false;
                node.set({
                    consent: false,
                    // Need to send these two because it's not a DONE msg.
                    time: node.timer.getTimeSince('step'),
                    timeup: false
                });
                a.disabled = true;
                na.disabled = true;
                a.onclick = null;
                na.onclick = null;

                // Disconnect, if requested.
                if (that.disconnect) {
                    // Destroy disconnectBox (if found) before disconnecting.
                    if (node.game.discBox) node.game.discBox.destroy();
                    node.socket.disconnect();
                }

                W.hide(that.consentId);
                W.show(_addPrefix(that, 'notAgreed'));

                // If a show-consent button is found enable it.
                showIt = W.gid(_addPrefix(that, 'show-consent'));
                if (showIt) {
                    showIt.onclick = function() {
                        var div, s;
                        div = W.toggle(that.consentId);
                        s = div.style.display === '' ? 'hide' : 'show';
                        this.innerHTML = that.getText('showHideConsent', s);
                    };
                }
                node.emit('CONSENT_REJECTED');
            };
       });
    };

    /**
     * ## Consent.getValues
     * 
     * Returns the current selection on Consent
     * 
     * @param {object} opts Configuration object. Options:
     *   - highlight: if TRUE, missing consents on checkboxes are highlighted.
     *       Default: TRUE.
     *   - agreed: TRUE to flag that the user has already clicked on agree 
     * @returns {object} consent Values of consent.
     * 
     * ```js
     * { 
     *   consent: true, // if all consent conditions are fullfilled  
     *   checkboxes: true // if all required checkboxes are checked
     *   [checkbox_ID1...IDN]: true // one property per checkbox 
     * }
     */
    Consent.prototype.getValues = function(opts) {
        var consent, that;
        that = this;
        consent = { consent: true };
        opts = opts || {};
        if (this.checkboxes.length) {
            consent.checkboxes = true;
            this.checkboxes.forEach(function(c, idx) {
                var cbx, id, req;
                id = _getCbxId(that, idx+1);
                cbx = W.gid(id);
                if (!cbx) {
                    node.warn('Consent: could not find checkbox ' + id);
                }
                else {
                    req = that.checkboxes[idx];
                    consent[id] = cbx.checked;

                    if ('string' === typeof req ||
                        req.required !== false) {
                    
                        if (!cbx.checked) {
                            // At least one is needed to deny consent.
                            consent.checkboxes = consent.consent = false;
                            if (opts.highlight !== false) W.shake(cbx);
                        }
                    }
                }
            });
        }
        if (this.agreed !== true && this.showBtns && !opts.agreed) {
            consent.consent = false;
        }
        return consent;
    };

    // ### Helper functions


    /** ### _toggleEnable
     * 
     * Enables/disables inputs in the widget
     * 
     * @param {boolean} state True or false
     */
    function _toggleEnable(state) {
        var elem, i;
        elem = W.gid('agree');
        if (elem) elem.disabled = state;
        elem = W.gid('notAgree');
        if (elem) elem.disabled = state;
        if (this.checkboxes && this.checkboxes.length) {
            for (i = 0; i < this.checkboxes.length; i++) {
                elem = W.gid(_getCbxId(i+1));
                if (elem) elem.disabled = state;
            }
        }
    }

    /**
     * ### _addPrefix
     * 
     * Adds a the widget prefix to a string, if one is set.
     * 
     * @param {object} w This widget
     * @param {string} str The string to manipulate
     * 
     * @returns {string} The id of the checkbox at a given index
     */
    function _addPrefix(w, str) {
        return (w.prefix ? (w.prefix + '_') : '') + str;
    }

    /**
     * ### _getCbxId
     * 
     * Returns a standardized id for a chekbox based on its index.
     * 
     * @param {object} w This widget
     * @param {number} idx The id of the checkbox
     * 
     * @returns {string} The id of the checkbox at a given index
     */
    function _getCbxId(w, idx) {
        return _addPrefix(w, 'consent_checkbox_' + idx); 
    }

    /**
     * ### _assignStr
     * 
     * Checks the value of a field in an object, if string it stores it
     * 
     * @param {object} w This widget
     * @param {object} opts The configuration options with the field to check
     * @param {string} id The id to assign
     */
    function _assignStr(w, opts, id) {
        var str;
        str = opts[id];
        if ('string' === typeof str) {
            w[id] = str;
        }
        else if (str) {
            throw new TypeError('Consent.init: ' +  id + 'Id must be ' +
                                'string or undefined. Found: ' + str);
        }
    }

})(node);
