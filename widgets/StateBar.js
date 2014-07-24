/**
 * # StateBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple interface to change the game stages.
 *
 * TODO: needs refactoring
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    // TODO: Introduce rules for update: other vs self

    node.widgets.register('StateBar', StateBar);

    // ## Meta-data

    StateBar.version = '0.3.2';
    StateBar.description =
        'Provides a simple interface to change the stage of a game.';

    StateBar.title = 'Change Game State';
    StateBar.className = 'statebar';

    function StateBar(options) {
        this.id = options.id || StateBar.className;
        this.recipient = null;
    }

    StateBar.prototype.append = function() {
        var PREF;
        var idButton, idStateSel, idRecipient, sendButton, stateSel, that;

        PREF = this.id + '_';

        idButton = PREF + 'sendButton';
        idStateSel = PREF + 'stateSel';
        idRecipient = PREF + 'recipient';

        sendButton = node.window.addButton(this.bodyDiv, idButton);
        stateSel = node.window.addStateSelector(this.bodyDiv, idStateSel);
        this.recipient =
            node.window.addRecipientSelector(this.bodyDiv, idRecipient);

        that = this;

        node.on('UPDATED_PLIST', function() {
            node.window.populateRecipientSelector(that.recipient, node.game.pl);
        });

        sendButton.onclick = function() {
            var to, result;
            var stage, step, round, stateEvent, stateMsg;

            // Should be within the range of valid values
            // but we should add a check
            to = that.recipient.value;

            try {
                stage = new node.GameStage(stateSel.value);
                // Update Others
                node.remoteCommand('goto_step', to, stage);
            }
            catch (e) {
                node.err('Invalid stage, not sent: ' + e);
                //node.socket.sendTXT('E: invalid stage, not sent');
            }
        };
    };

})(node);
