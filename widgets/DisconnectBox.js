/**
 * # DisconnectBox
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next stage.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS;
    var Table = W.Table;

    node.widgets.register('DisconnectBox', DisconnectBox);

    // ## Meta-data

    DisconnectBox.version = '0.2.2';
    DisconnectBox.description =
        'Visually display current, previous and next stage of the game.';

    DisconnectBox.title = 'Disconnect';
    DisconnectBox.className = 'disconnectbox';

    // ## Dependencies

    DisconnectBox.dependencies = {};

    /**
     * ## DisconnectBox constructor
     *
     * `DisconnectBox` displays current, previous and next stage of the game
     */
    function DisconnectBox() {
        this.disconnectButton = null;
    }

    // ## DisconnectBox methods

    /**
     * ### DisconnectBox.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see DisconnectBox.writeStage
     */
    DisconnectBox.prototype.append = function() {
        this.disconnectButton = W.getButton(undefined, 'Leave Experiment');
        this.disconnectButton.className = 'btn btn-lg';
        this.bodyDiv.appendChild(this.disconnectButton);

        this.disconnectButton.onclick = function() {
            node.socket.disconnect();
        };
    };

    DisconnectBox.prototype.listeners = function() {
        var that = this;

        node.on('SOCKET_DISCONNECT', function() {
            console.log('AAAAAAAAAAA');
            that.disconnectButton.disabled = true;
        });

        node.on('SOCKET_CONNECT', function() {
            console.log('BBBBBBBBB');
        });
    };


})(node);
