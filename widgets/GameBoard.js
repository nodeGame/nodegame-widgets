(function (node) {
	
	node.widgets.register('GameBoard', GameBoard);
	
	var GameState = node.GameState,
		PlayerList = node.PlayerList;
	
// ## Meta-data
	
	GameBoard.id = 'gboard';
	GameBoard.name = 'GameBoard';
	GameBoard.version = '0.3.2';
	GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
	
	function GameBoard (options) {
		
		this.id = options.id;
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
		this.fieldset = {
			legend: 'Game State'
		};
	}
	
	// TODO: Write a proper INIT method
	GameBoard.prototype.init = function () {};
	
	GameBoard.prototype.getRoot = function() {
		return this.root;
	};
	
	GameBoard.prototype.append = function (root) {
		this.root = root;
		this.board = node.window.addDiv(root, this.id);
		this.updateBoard(node.game.pl);
		return root;
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		
		node.on('UPDATED_PLIST', function () {
			node.log('I Updating Board');
			that.updateBoard(node.game.pl);

		});
	};
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		that.board.innerHTML = 'Updating...';
		
		if (pl.length) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//node.log(p);
				var pText = (p.name) ? p.id + "|" + p.name
									 : p.id;
				
				var line = '[' + pText + "]> \t"; 
				
				var pState = '(' +  p.state.round + ') ' + p.state.state + '.' + p.state.step; 
				pState += ' ';
				
				switch (p.state.is) {

					case GameState.iss.UNKNOWN:
						pState += '(unknown)';
						break;
						
					case GameState.iss.LOADING:
						pState += '(loading)';
						break;
						
					case GameState.iss.LOADED:
						pState += '(loaded)';
						break;
						
					case GameState.iss.PLAYING:
						pState += '(playing)';
						break;
					case GameState.iss.DONE:
						pState += '(done)';
						break;		
					default:
						pState += '('+p.state.is+')';
						break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
		}
		else {
			that.board.innerHTML = that.noPlayers;
		}
	};
	
})(node);