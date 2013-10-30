/**
 * # StateDisplay widget for nodeGame
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

    var Table = node.window.Table,
    GameStage = node.GameStage;

    node.widgets.register('StateDisplay', StateDisplay);

    // ## Defaults

    StateDisplay.defaults = {};
    StateDisplay.defaults.id = 'statedisplay';
    StateDisplay.defaults.fieldset = { legend: 'State Display' };

    // ## Meta-data

    StateDisplay.version = '0.4.2';
    StateDisplay.description = 'Display basic information about player\'s status.';

    function StateDisplay(options) {

	this.id = options.id;

	this.root = null;
	this.table = new Table();
    }

    // TODO: Write a proper INIT method
    StateDisplay.prototype.init = function() {};

    StateDisplay.prototype.getRoot = function() {
	return this.root;
    };


    StateDisplay.prototype.append = function(root) {
	var that = this;
	var PREF = this.id + '_';

	var idFieldset = PREF + 'fieldset';
	var idPlayer = PREF + 'player';
	var idState = PREF + 'state';

	var checkPlayerName = setInterval(function(idState,idPlayer) {
	    if (node.player && node.player.id) {
		clearInterval(checkPlayerName);
		that.updateAll();
	    }
	}, 100);

	root.appendChild(this.table.table);
	this.root = root;
	return root;

    };

    StateDisplay.prototype.updateAll = function() {
	var stage, stageNo, stageId, playerId, tmp, miss;
        miss = '-';

        stageId = miss;
        stageNo = miss;
        playerId = miss;

	if (node.player.id) {
            playerId = node.player.id;
        }

	stage = node.game.getCurrentGameStage();
	if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

	this.table.clear(true);
	this.table.addRow(['Stage  No: ', stageNo]);
	this.table.addRow(['Stage  Id: ', stageId]);
	this.table.addRow(['Player Id: ', playerId]);
	this.table.parse();

    };

    StateDisplay.prototype.listeners = function() {
	var that = this;

	node.on('LOADED', function() {
	    that.updateAll();
	});
    };

})(node);