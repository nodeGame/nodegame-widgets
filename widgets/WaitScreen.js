/**
 * # WaitScreen widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
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

    WaitScreen.version = '0.6.0';
    WaitScreen.description = 'Show a standard waiting screen';

    function WaitScreen(options) {

	this.id = options.id;

        this.root = null;

	this.text = {
            waiting: options.waitingText ||
                'Waiting for other players to be done...',
            stepping: options.steppingText ||
                'Initializing, game will start soon...'
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

    WaitScreen.prototype.append = function(root) {
        // Saves a reference of the widget in GameWindow
        // that will use it in the GameWindow.lockFrame method.
        W.waitScreen = this;
        this.root = root;
	return root;
    };

    WaitScreen.prototype.getRoot = function() {
	return this.waitingDiv;
    };

    WaitScreen.prototype.listeners = function() {
        var that = this;
        node.on('BEFORE_DONE', function(text) {
            that.lock(text || that.text.waiting)
        });

        node.on('STEPPING', function(text) {
            that.unlock(text || that.text.stepping)
        });

        node.on('PLAYING', function() {
            that.unlock();
        });

        node.on('RESUMED', function() {
            that.unlock();
        });

    };

    WaitScreen.prototype.destroy = function() {
        this.unlock();
        if (this.waitingDiv) {
            this.root.removeChild(this.waitingDiv);
        }
        W.waitScreen = null; 
    };
})(node);