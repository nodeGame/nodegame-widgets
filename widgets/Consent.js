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

    Consent.version = '0.5.0';
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
     * @param {object} options Optional. Configuration options
     * which is forwarded to Consent.init.
     *
     * @see Consent.init
     */
    function Consent() {

        /**
         * ## Consent.consent
         *
         * The object containing the variables to substitute
         *
         * Default: node.game.settings.CONSENT
         */
        this.consent = null;

        /**
         * ## Consent.showPrint
         *
         * If TRUE, the print button is shown
         *
         * Default: TRUE
         */
        this.showPrint = null;

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
         */
        this.checkboxes = [];

        /**
         * ## Consent.fineprint
         *
         * Additional text displayed in a small font under the checkboxes
         */
        this.fineprint = null;


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
        opts = opts || {};

        this.consent = opts.consent || node.game.settings.CONSENT;

        if (this.consent && 'object' !== typeof this.consent) {
            throw new TypeError('Consent.init: consent must be object or ' +
                                'undefined. Found: ' + this.consent);
        }

        this.showPrint = opts.showPrint === false ? false : true;

        this.disconnect = opts.disconnect === false ? false : true;

        if (J.isArray(opts.checkboxes)) {
            this.checkboxes = opts.checkboxes;
        }
        else if (opts.checkboxes) {
            throw new TypeError('Consent.init: checkboxes must be array or ' +
                                'undefined. Found: ' + this.checkboxes);
        }
        if ('string' === typeof opts.fineprint) {
            this.fineprint = opts.fineprint;
        }
        else if (opts.fineprint) {
            throw new TypeError('Consent.init: fineprint must be string or ' +
                                'undefined. Found: ' + this.fineprint);
        }

    };

    Consent.prototype.enable = function() {
        if (this.notAgreed) return;
        _toggleEnable(true);
    };

    Consent.prototype.disable = function() {
        _toggleEnable(false);
    };

    Consent.prototype.append = function() {
        var consent, html, btn1, btn2, st1, st2;
        // Hide not agreed div.
        W.hide('notAgreed');

        consent = W.gid('consent');
        if (!consent) {
            throw new Error('Consent.append: the page does not contain an ' +
                            'element with id "consent"');
        }
        html = '';


        // Checkboxes.

        if (this.checkboxes.length) {
    
        
            html += '<div class="gdpr-checkboxes"><dl>';
            
            this.checkboxes.forEach(function(c, idx) {
                var id = _getCbxId(idx+1);
                html += '<dt>';
                html += '<div class="form-check form-switch">'
                html += '<input class="form-check-input" type="checkbox" ' +
                    'role="switch" id="' + id + '">';
                html += '<label class="form-check-label" for="' + id + '">';
                html += c;
                html += '</label></div></dt>';
            });
     
            if (this.fineprint) {
                html += '<p class="gdpr-fineprint" style="font-size: small; margin-top: 20px;">';
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

        // Header for buttons.
        html += '<strong>' + this.getText('consentTerms') + '</strong><br/>';

        // Buttons.
        html += '<div style="margin-top: 30px; text-align: center;">';

        if (document.querySelector('html').dir === 'rtl') {
            btn1 = 'agree';
            btn2 = 'notAgree';
            st1 = 'info';
            st2 = 'danger';
        }
        else {
            btn1 = 'notAgree';
            btn2 = 'agree';
            st1 = 'danger';
            st2 = 'info';
        }

        html += '<button class="btn btn-lg btn-' + st1 +
              '" style="margin: 0px 30px" id="' + btn1 + '">' +
              this.getText(btn1) + '</button>';

        html += '<button class="btn btn-lg btn-' + st2 + '" id="' +
                 btn2 + '">' + this.getText(btn2) + '</button></div>';

        consent.innerHTML += html;
        setTimeout(function() { W.adjustFrameHeight(); });
    };

    Consent.prototype.listeners = function() {
        var that = this;
        var consent = this.consent;
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
            a = W.gid('agree');
            na = W.gid('notAgree');

            if (!a) throw new Error('Consent: agree button not found');
            if (!na) throw new Error('Consent: notAgree button not found');

            a.onclick = function() { 
                var res = true;
                if (that.checkboxes.length) {
                    that.checkboxes.forEach(function(c, idx) {
                        var cbx, id;
                        id = _getCbxId(idx+1);
                        cbx = W.gid(id);
                        if (!cbx) {
                            node.warn('Consent: could not find checkbox ' + id);
                        }
                        else if (!cbx.checked) {
                            res = false;
                            W.shake(cbx);
                        }
                    });
                    if (!res) return;
                }
                node.done({ consent: true }); 
            };
            na.onclick = function() {
                var showIt, confirmed;

                confirmed = confirm(that.getText('areYouSure'));
                if (!confirmed) return;

                node.emit('CONSENT_REJECTING');

                that.notAgreed = true;
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

                W.hide('consent');
                W.show('notAgreed');

                // If a show-consent button is found enable it.
                showIt = W.gid('show-consent');
                if (showIt) {
                    showIt.onclick = function() {
                        var div, s;
                        div = W.toggle('consent');
                        s = div.style.display === '' ? 'hide' : 'show';
                        this.innerHTML = that.getText('showHideConsent', s);
                    };
                }
                node.emit('CONSENT_REJECTED');
            };
       });
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
     * Returns a standardized id for a chekbox based on its index.
     * 
     * @param {number} idx The id of the checkbox
     * 
     * @returns {string} The id of the checkbox at a given index
     */
    function _getCbxId(idx) {
        return 'consent_checkbox_' + idx; 
    }

})(node);
