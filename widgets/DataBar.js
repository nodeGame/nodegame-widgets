/**
 * # DataBar
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a form to send DATA packages to other clients / SERVER
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DataBar', DataBar);

    // ## Meta-data

    DataBar.version = '0.4.1';
    DataBar.description =
        'Adds a input field to send DATA messages to the players';

    DataBar.title = 'DataBar';
    DataBar.className = 'databar';


    /**
     * ## DataBar constructor
     *
     * Instantiates a new DataBar object
     */
    function DataBar() {
        this.bar = null;
        this.recipient = null;
    }

    // ## DataBar methods

     /**
     * ## DataBar.append
     *
     * Appends widget to `this.bodyDiv`
<<<<<<< HEAD
=======
     *
     * @param {object} options
>>>>>>> 71aa4fe00a97a4725f2d989d29b61a3b5e13e839
     */
    DataBar.prototype.append = function() {

        var sendButton, textInput, dataInput;
        var that = this;

        sendButton = W.addButton(this.bodyDiv);
        textInput = W.addTextInput(this.bodyDiv, 'data-bar-text');
        W.addLabel(this.bodyDiv, textInput, undefined, 'Text');
        W.writeln('Data');
        dataInput = W.addTextInput(this.bodyDiv, 'data-bar-data');

        this.recipient = W.addRecipientSelector(this.bodyDiv);

        sendButton.onclick = function() {
            var to, data, text;

            to = that.recipient.value;
            text = textInput.value;
            data = dataInput.value;

            node.log('Parsed Data: ' + JSON.stringify(data));

            node.say(text, to, data);
        };

        node.on('UPDATED_PLIST', function() {
            node.window.populateRecipientSelector(that.recipient, node.game.pl);
        });
    };

})(node);
