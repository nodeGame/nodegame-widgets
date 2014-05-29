/**
 * # WaitScreen widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitScreen', WaitScreen);

    // ## Defaults

    WaitScreen.defaults = {};
    WaitScreen.defaults.id = 'waiting';
    WaitScreen.defaults.fieldset = false;

    // ## Meta-data

    WaitScreen.version = '0.7.0';
    WaitScreen.description = 'Show a standard waiting screen';

    function WaitScreen(options) {

	this.id = options.id;

        this.root = null;

	this.text = {
            waiting: options.waitingText ||
                'Waiting for other players to be done...',
            stepping: options.steppingText ||
                'Initializing game step, will be ready soon...'
        };

	this.waitingDiv = null;
    }

    WaitScreen.prototype.lock = function(text) {
        if (!this.waitingDiv) {
	    this.waitingDiv = W.addDiv(W.getFrameRoot(), this.id);
	}
	if (this.waitingDiv.style.display === 'none') {
	    this.waitingDiv.style.display = '';
	}
	this.waitingDiv.innerHTML = text;
    };

    WaitScreen.prototype.unlock = function() {
        if (this.waitingDiv) {
            if (this.waitingDiv.style.display === '') {
                this.waitingDiv.style.display = 'none';
            }
        }
    };

    WaitScreen.prototype.updateText = function(text, append) {
        append = append || false;
        if ('string' !== typeof text) {
            throw new TypeError('WaitScreen.updateText: text must be string.');
        }
        if (append) {
            this.waitingDiv.appendChild(document.createTextNode(text));
        }
        else {
            this.waitingDiv.innerHTML = text;
        }
    };

    WaitScreen.prototype.append = function(root) {
        // Saves a reference of the widget in GameWindow
        // that will use it in the GameWindow.lockScreen method.
        W.waitScreen = this;
        this.root = root;
	return root;
    };

    WaitScreen.prototype.getRoot = function() {
	return this.waitingDiv;
    };

    WaitScreen.prototype.listeners = function() {
        var that = this;

        // was using WaitScreen method before.
        // now using GameWindow lock / unlock, so that the state level
        // is updated. Needs some testing.

        node.on('REALLY_DONE', function(text) {
            text = text || that.text.waiting;
            if (W.isScreenLocked()) {
                that.updateText(text);
            }
            else {
                W.lockScreen(text);
            }
        });

        node.on('STEPPING', function(text) {
            text = text || that.text.stepping;
            if (W.isScreenLocked()) {
                that.updateText(text);
            }
            else {
                W.lockScreen(text);
            }
            // was wrong before... Check this.
            // that.unlock(text || that.text.stepping)
        });

        node.on('PLAYING', function() {
            if (W.isScreenLocked()) {
                W.unlockScreen();
            }
        });

        node.on('RESUMED', function() {
            if (W.isScreenLocked()) {
                W.unlockScreen();
            }
        });
    };

    WaitScreen.prototype.destroy = function() {
        if (W.isScreenLocked()) {
            this.unlock();
        }
        if (this.waitingDiv) {
            this.waitingDiv.parentNode.removeChild(this.waitingDiv);
        }
        W.waitScreen = null; 
    };
})(node);
