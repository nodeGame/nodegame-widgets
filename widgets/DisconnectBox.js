/**
 * # DisconnectBox
 * Copyright(c) 2023 Stefano Balietti
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

    DisconnectBox.version = '0.4.0';
    DisconnectBox.description = 'Monitors and handles disconnections';

    DisconnectBox.panel = false;
    DisconnectBox.className = 'disconnectbox';

    DisconnectBox.texts = {
        leave: 'Leave Task',
        left: 'You Left',
        disconnected: 'Disconnected!',
        connected: 'Connected'
    };

    // ## Dependencies

    DisconnectBox.dependencies = {};

    /**
     * ## DisconnectBox constructor
     *
     */
    function DisconnectBox() {

        // ### DisconnectBox.showStatus
        // If TRUE, it shows current connection status. Default: TRUE
        this.showStatus = null;

        // ### DisconnectBox.showDiscBtn
        // If TRUE, it shows the disconnect button. Default: FALSE
        this.showDiscBtn = null;

        // ### DisconnectBox.statusSpan
        // The SPAN containing the status
        this.statusSpan = null;

        // ### DisconnectBox.disconnectBtn
        // The button for disconnection
        this.disconnectBtn = null;

        // ### DisconnectBox.disconnectBtn
        // TRUE, user pressed the disconnect button
        this.userDiscFlag = null;

        // ### DisconnectBox.ee
        // The event emitter with whom the events are registered
        this.ee = null;

        // ### DisconnectBox.disconnectCb
        // Callback executed when a disconnection is detected
        this.disconnectCb = null;

        // ### DisconnectBox.disconnectCb
        // Callback executed when a connection is detected
        this.connectCb = null;
    }

    // ## DisconnectBox methods
    DisconnectBox.prototype.init = function(opts) {

        if (opts.connectCb) {
            if ('function' !== typeof opts.connectCb) {
                throw new TypeError('DisconnectBox.init: connectCb must be ' +
                                    'function or undefined. Found: ' +
                                    opts.connectCb);
            }
            this.connectCb = opts.connectCb;
        }
        if (opts.disconnectCb) {
            if ('function' !== typeof opts.disconnectCb) {
                throw new TypeError('DisconnectBox.init: disconnectCb must ' +
                                    'be function or undefined. Found: ' +
                                    opts.disconnectCb);
            }
            this.disconnectCb = opts.disconnectCb;
        }

        this.showDiscBtn = !!opts.showDiscBtn;
        this.showStatus = !!opts.showStatus;
    };

    DisconnectBox.prototype.append = function() {
        var that, con;
        that = this;
        con = node.socket.isConnected();
        if (this.showStatus) {
            this.statusSpan = W.add('span', this.bodyDiv);
            this.updateStatus(con ? 'connected' : 'disconnected');
        }
        if (this.showDiscBtn) {
            this.disconnectBtn = W.add('button', this.bodyDiv, {
                innerHTML: this.getText(con ? 'leave' : 'left'),
                className: 'btn',
                style: { 'margin-left': '10px' }
            });
            if (!con) this.disconnectBtn.disabled = true;
            this.disconnectBtn.onclick = function() {
                that.disconnectBtn.disabled = true;
                that.userDiscFlag = true;
                node.socket.disconnect();
            };
        }

    };

    DisconnectBox.prototype.updateStatus = function(status) {
        if (!this.statusSpan) {
            node.warn('DisconnectBox.updateStatus: display disabled.');
            return;
        }
        this.statusSpan.innerHTML = this.getText(status);
        this.statusSpan.className = status === 'disconnected' ?
            'text-danger' : '';
    };

    DisconnectBox.prototype.listeners = function() {
        var that;
        that = this;

        this.ee = node.getCurrentEventEmitter();
        this.ee.on('SOCKET_DISCONNECT', function() {
            if (that.statusSpan) that.updateStatus('disconnected');
            if (that.disconnectBtn) {
                that.disconnectBtn.disabled = true;
                that.disconnectBtn.innerHTML = that.getText('left');
            }
            if (that.disconnectCb) that.disconnectCb(that.userDiscFlag);
        });

        this.ee.on('SOCKET_CONNECT', function() {
            if (that.statusSpan) that.updateStatus('connected');
            if (that.disconnectBtn) {
                that.disconnectBtn.disabled = false;
                that.disconnectBtn.innerHTML = that.getText('leave');
            }
            if (that.connectCb) that.disconnectCb();
            // Reset pressedDisc.
            that.userDiscFlag = false;
        });
    };


})(node);
