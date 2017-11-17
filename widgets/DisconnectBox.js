/**
 * # DisconnectBox
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Shows a disconnect button
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

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
        // ### DisconnectBox.disconnectButton
        // The button for disconnection
        this.disconnectButton = null;
        // ### DisconnectBox.ee
        // The event emitter with whom the events are registered
        this.ee = null;
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

        this.ee = node.getCurrentEventEmitter();
        this.ee.on('SOCKET_DISCONNECT', function DBdiscon() {
            console.log('DB got socket_diconnect');
            that.disconnectButton.disabled = true;
        });

        this.ee.on('SOCKET_CONNECT', function DBcon() {
            console.log('DB got socket_connect');
        });
    };

    DisconnectBox.prototype.destroy = function() {
        this.ee.off('SOCKET_DISCONNECT', 'DBdiscon');
        this.ee.off('SOCKET_CONNECT', 'DBcon');
    };


})(node);
