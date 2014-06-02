/**
 * # StateDisplay widget for nodeGame
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

    var Table = node.window.Table,
    GameStage = node.GameStage;

    node.widgets.register('StateDisplay', StateDisplay);

    // ## Meta-data

    StateDisplay.version = '0.5.0';
    StateDisplay.description = 'Display basic info about player\'s status.';

    StateDisplay.title = 'State Display';
    StateDisplay.className = 'statedisplay';

    // ## Dependencies
   
    StateDisplay.dependencies = {      
        Table: {}
    };

    function StateDisplay(options) {
	this.id = options.id;
	this.table = new Table();
    }

    StateDisplay.prototype.append = function() {
	var that, checkPlayerName;
        that = this;
	checkPlayerName = setInterval(function() {
	    if (node.player && node.player.id) {
		clearInterval(checkPlayerName);
		that.updateAll();
	    }
	}, 100);
	this.bodyDiv.appendChild(this.table.table);
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
	node.on('STEP_CALLBACK_EXECUTED', function() {
	    that.updateAll();
        });
    };

    StateDisplay.prototype.destroy = function() {        
        node.off('STEP_CALLBACK_EXECUTED', StateDisplay.prototype.updateAll);
    };
})(node);