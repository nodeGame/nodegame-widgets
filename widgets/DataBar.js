/**
 * # DataBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a form to send DATA packages to other clients / SERVER.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('DataBar', DataBar);

    // ## Defaults
    DataBar.defaults = {};
    DataBar.defaults.id = 'databar';
    DataBar.defaults.fieldset = {
	legend: 'Send DATA to players'
    };

    // ## Meta-data
    DataBar.version = '0.4';
    DataBar.description = 'Adds a input field to send DATA messages to the players';

    function DataBar(options) {
	this.bar = null;
	this.root = null;
	this.recipient = null;
    }

    DataBar.prototype.append = function(root) {

	var sendButton, textInput, dataInput;

	sendButton = W.addButton(root);
	//W.writeln('Text');
	textInput = W.addTextInput(root, 'data-bar-text');
	W.addLabel(root, textInput, undefined, 'Text');
	W.writeln('Data');
	dataInput = W.addTextInput(root, 'data-bar-data');

	this.recipient = W.addRecipientSelector(root);

	var that = this;

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

	return root;

    };

})(node);
