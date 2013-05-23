(function (node) {
	
	node.widgets.register('GameBoard', GameBoard);
	
	var PlayerList = node.PlayerList;

// ## Defaults	
	
	GameBoard.defaults = {};
	GameBoard.defaults.id = 'gboard';
	GameBoard.defaults.fieldset = {
			legend: 'Game Board'
	};
	
// ## Meta-data
	
	GameBoard.name = 'GameBoard';
	GameBoard.version = '0.4.0';
	GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
	
	function GameBoard (options) {
		
		this.id = options.id || GameBoard.defaults.id;
		this.status_id = this.id + '_statusbar';
		
		this.board = null;
		this.status = null;
		this.root = null;
	
	}
	
	GameBoard.prototype.append = function (root) {
		this.root = root;
		this.status = node.window.addDiv(root, this.status_id);
		this.board = node.window.addDiv(root, this.id);
		
		this.updateBoard(node.game.pl);
		
		
		return root;
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;		
//		node.on('in.say.PCONNECT', function (msg) {
//			that.addPlayerToBoard(msg.data);
//		});
//
//		node.on('in.say.PDISCONNECT', function (msg) {
//			that.removePlayerFromBoard(msg.data);
//		});
		
		node.on('UPDATED_PLIST', function() {
			that.updateBoard(node.game.pl);
		});
		
	};
	
	GameBoard.prototype.printLine = function (p) {

		var line = '[' + (p.name || p.id) + "]> \t"; 
		
		line += '(' +  p.state.round + ') ' + p.state.state + '.' + p.state.step; 
		line += ' ';
		
		switch (p.state.is) {

			case node.is.UNKNOWN:
				line += '(unknown)';
				break;
				
			case node.is.LOADING:
				line += '(loading)';
				break;
				
			case node.is.LOADED:
				line += '(loaded)';
				break;
				
			case node.is.PLAYING:
				line += '(playing)';
				break;
			case node.is.DONE:
				line += '(done)';
				break;		
			default:
				line += '('+p.state.is+')';
				break;		
		}
		
		if (p.state.paused) {
			line += ' (P)';
		}
		
		return line;
	};
	
	GameBoard.prototype.printSeparator = function (p) {
		return W.getElement('hr', null, {style: 'color: #CCC;'});
	};
	
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		
		this.status.innerHTML = 'Updating...';
		
		var player, separator;
		
		if (pl.length) {
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