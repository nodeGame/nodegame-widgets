/**
 * # GameBoard widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays a table of currently connected players.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {
   
    "use strict";
 
    node.widgets.register('GameBoard', GameBoard);
    
    var PlayerList = node.PlayerList;

    // ## Defaults	
    
    GameBoard.defaults = {};
    GameBoard.defaults.id = 'gboard';
    GameBoard.defaults.fieldset = {
	legend: 'Game Board'
    };
    
    // ## Meta-data
    
    GameBoard.version = '0.4.0';
    GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
    
    function GameBoard(options) {
	
	this.id = options.id || GameBoard.defaults.id;
	this.status_id = this.id + '_statusbar';
	
	this.board = null;
	this.status = null;
	this.root = null;
	
    }
    
    GameBoard.prototype.append = function(root) {
	this.root = root;
	this.status = node.window.addDiv(root, this.status_id);
	this.board = node.window.addDiv(root, this.id);
	
	this.updateBoard(node.game.pl);
		
	return root;
    };
    
    GameBoard.prototype.listeners = function() {
	var that = this;		
	node.on('UPDATED_PLIST', function() {
	    that.updateBoard(node.game.pl);
	});
	
    };
    
    GameBoard.prototype.printLine = function(p) {

	var line, levels, level;
        levels = node.constants.stageLevels;

        line = '[' + (p.name || p.id) + "]> \t"; 
	line += '(' +  p.stage.round + ') ' + p.stage.stage + '.' + p.stage.step; 
	line += ' ';
	
	switch (p.stageLevel) {

	case levels.UNINITIALIZED:
	    level = 'uninit.';
	    break;
	    
	case levels.INITIALIZING:
	    level = 'init...';
	    break;

	case levels.INITIALIZING:
	    level = 'init!';
	    break;

	case levels.LOADING:
	    level = 'loading';
	    break;	    

	case levels.LOADED:
	    level = 'loaded';
	    break;
	    
	case levels.PLAYING:
	    level = 'playing';
	    break;
	case levels.DONE:
	    level = 'done';
	    break;
		
	default:
	    level = p.stageLevel;
	    break;		
	}

	return line + '(' + level + ')';
    };
    
    GameBoard.prototype.printSeparator = function(p) {
	return W.getElement('hr', null, {style: 'color: #CCC;'});
    };
    
    
    GameBoard.prototype.updateBoard = function(pl) {
	var player, separator;
        var that = this;
	
	this.status.innerHTML = 'Updating...';
	
	if (pl.size()) {
	    that.board.innerHTML = '';
	    pl.forEach( function(p) {
		player = that.printLine(p);
		
		W.write(player, that.board);
		
		separator = that.printSeparator(p);
		W.write(separator, that.board);
	    });
	}
	
	
	this.status.innerHTML = 'Connected players: ' + node.game.pl.length;
    };
    
})(node);
