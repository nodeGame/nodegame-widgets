/**
 * # Feedback widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    // ## Defaults

    Feedback.defaults = {};
    Feedback.defaults.id = 'feedback';
    Feedback.defaults.fieldset = { 
        legend: 'Feedback'
    };
    
    // ## Meta-data

    Feedback.version = '0.1';
    Feedback.description = 'Displays a simple feedback form';

    // ## Dependencies

    Feedback.dependencies = {
        JSUS: {},
    };

    function Feedback(options) {
        this.id = options.id || Feedback.id;
        this.root = null;
        this.textarea = null;
        this.submit = null;
        this.label = options.label || 'FEEDBACK';
    }

    Feedback.prototype.append = function(root) {
        this.root = root;
        this.textarea = document.createElement('textarea');
        this.submit = document.createElement('button');
        this.submit.onclick = function() {
            var feedback, sent;
            feedback = this.textarea.value;
            if (!feedback.length) {
                J.highlight(this.textarea, 'ERR');
                alert('Feedback is empty, not sent.');
                return false;
            }
            J.highlight(this.textarea, 'OK');
            sent = node.say('FEEDBACK', 'SERVER', {
                feedback: feedback,
                navigator: navigator
            });

            if (sent) {
                alert('Feedback sent. Thank you.');
                this.submit.disabled = true;
            }
            else {
                alert('An error has occurred, feedback not sent.');
            }
        };
        root.appendChild(this.textarea);
        return root;
    };

    Feedback.prototype.getRoot = function() {
        return this.root;
    };

    Feedback.prototype.listeners = function() {
        var that = this;
    };

    node.widgets.register('Feedback', Feedback);

})(node);