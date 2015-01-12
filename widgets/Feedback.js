/**
 * # Feedback
 * Copyright(c) 2014 Stefano Balietti
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

    Feedback.version = '0.2';
    Feedback.description = 'Displays a simple feedback form.';

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
     */
    function Feedback() {
        /**
         * ### Feedback.textarea
         *
         * The TEXTAREA wherein clients can enter feedback
         */
        this.textarea = null;

        /**
         * ### Feedback.submit
         *
         * Button to submit the feedback form
         */
        this.submit = null;
    }

    /**
     * ## Feedback.append
     *
     * Appends widget to this.bodyDiv
     */
    Feedback.prototype.append = function() {
        var that = this;

        this.textarea = document.createElement('textarea');
        this.submit = document.createElement('button');
        this.submit.appendChild(document.createTextNode('Submit'));
        this.submit.onclick = function() {
            var feedback, sent;
            feedback = that.textarea.value;
            if (!feedback.length) {
                J.highlight(that.textarea, 'ERR');
                alert('Feedback is empty, not sent.');
                return false;
            }
            sent = node.say('FEEDBACK', 'SERVER', {
                feedback: feedback,
                userAgent: navigator.userAgent
            });

            if (sent) {
                J.highlight(that.textarea, 'OK');
                alert('Feedback sent. Thank you.');
                that.textarea.disabled = true;
                that.submit.disabled = true;
            }
            else {
                J.highlight(that.textarea, 'ERR');
                alert('An error has occurred, feedback not sent.');
            }
        };
        this.bodyDiv.appendChild(this.textarea);
        this.bodyDiv.appendChild(this.submit);
    };


    Feedback.prototype.listeners = function() {
        var that = this;
    };
})(node);
