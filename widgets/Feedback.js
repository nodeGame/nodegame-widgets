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
        var that = this;
        this.root = root;
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
        root.appendChild(this.textarea);
        root.appendChild(this.submit);
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