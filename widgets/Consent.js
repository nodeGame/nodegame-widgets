/**
 * # Consent
 * Copyright(c) 2021 Stefano Balietti
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

    Consent.version = '0.3.0';
    Consent.description = 'Displays a configurable consent form.';

    Consent.title = false;
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
            throw new TypeError('Consent: consent must be object or ' +
                                'undefined. Found: ' + this.consent);
        }

        this.showPrint = opts.showPrint === false ? false : true;
    };

    Consent.prototype.enable = function() {
        var a, na;
        if (this.notAgreed) return;
        a = W.gid('agree');
        if (a) a.disabled = false;
        na = W.gid('notAgree');
        if (na) na.disabled = false;
    };

    Consent.prototype.disable = function() {
        var a, na;
        if (this.notAgreed) return;
        a = W.gid('agree');
        if (a) a.disabled = true;
        na = W.gid('notAgree');
        if (na) na.disabled = true;
    };

    Consent.prototype.append = function() {
        var consent, html;
        // Hide not agreed div.
        W.hide('notAgreed');

        consent = W.gid('consent');
        html = '';

        // Print.
        if (this.showPrint) {
            html = this.getText('printText');
            html += '<input class="btn" type="button" value="' +
            this.getText('printBtn') +
            '" onclick="window.print()" /><br/><br/>';
        }

        // Header for buttons.
        html += '<strong>' + this.getText('consentTerms') + '</strong><br/>';

        // Buttons.
        html += '<div style="margin-top: 20px;">' +
        '<button class="btn btn-lg btn-info" id="agree" ' +
        'style="margin-right: 30px">' + this.getText('agree') +
        '</button><button class="btn btn-lg btn-danger" id="notAgree">' +
        this.getText('notAgree') + '</button></div>';

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


            a.onclick = function() { node.done({ consent: true }); };
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

                node.socket.disconnect();
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

})(node);
