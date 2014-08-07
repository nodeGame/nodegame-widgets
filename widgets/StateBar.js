/**
 * # StateBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple interface to change the game stages.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('StateBar', StateBar);

    // ## Meta-data

    StateBar.version = '0.4.0';
    StateBar.description =
        'Provides a simple interface to change the stage of a game.';

    StateBar.title = 'Change GameStage';
    StateBar.className = 'statebar';

    function StateBar(options) {
        this.id = options.id || StateBar.className;
        this.recipient = null;
    }

    StateBar.prototype.append = function() {
        var prefix, that;
        var idButton, idStageField, idRecipientField;
        var sendButton, stageField, recipientField;

        prefix = this.id + '_';

        idButton = prefix + 'sendButton';
        idStageField = prefix + 'stageField';
        idRecipientField = prefix + 'recipient';

        this.bodyDiv.appendChild(document.createTextNode('Stage:'));
        stageField = W.getTextInput(idStageField);
        this.bodyDiv.appendChild(stageField);

        this.bodyDiv.appendChild(document.createTextNode(' To:'));
        recipientField = W.getTextInput(idRecipientField);
        this.bodyDiv.appendChild(recipientField);

        sendButton = node.window.addButton(this.bodyDiv, idButton);

        that = this;

        //node.on('UPDATED_PLIST', function() {
        //    node.window.populateRecipientSelector(that.recipient, node.game.pl);
        //});

        sendButton.onclick = function() {
            var to;
            var stage;

            // Should be within the range of valid values
            // but we should add a check
            to = recipientField.value;

            try {
                stage = new node.GameStage(stageField.value);
                node.remoteCommand('goto_step', to, stage);
            }
            catch (e) {
                node.err('Invalid stage, not sent: ' + e);
            }
        };
    };

})(node);
