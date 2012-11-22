(function (node) {

	var Table = node.window.Table,
		GameState = node.GameState;
	
	node.widgets.register('StateDisplay', StateDisplay);	

// ## Defaults
	
	StateDisplay.defaults = {};
	StateDisplay.defaults.id = 'statedisplay';
	StateDisplay.defaults.fieldset = { legend: 'State Display' };		
	
// ## Meta-data
	
	StateDisplay.name = 'State Display';
	StateDisplay.version = '0.4.1';
	StateDisplay.description = 'Display basic information about player\'s status.';
	
	function StateDisplay (options) {
		
		this.id = options.id;
				
		this.root = null;
		this.table = new Table();
	}
	
	// TODO: Write a proper INIT method
	StateDisplay.prototype.init = function () {};
	
	StateDisplay.prototype.getRoot = function () {
		return this.root;
	};
	
	
	StateDisplay.prototype.append = function (root) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idPlayer = PREF + 'player';
		var idState = PREF + 'state'; 
			
		var checkPlayerName = setInterval(function(idState,idPlayer){
			if (node.player !== null){
				clearInterval(checkPlayerName);
				that.updateAll();
			}
		}, 100);
	
		root.appendChild(this.table.table);
		this.root = root;
		return root;
		
	};
	
	StateDisplay.prototype.updateAll = function() {
		var state = node.game ? new GameState(node.game.state) : new GameState(),
			id = node.player ? node.player.id : '-';
			name = node.player && node.player.name ? node.player.name : '-';
			
		this.table.clear(true);
		this.table.addRow(['Name: ', name]);
		this.table.addRow(['State: ', state.toString()]);
		this.table.addRow(['Id: ', id]);
		this.table.parse();
		
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on('STATECHANGE', function() {
			that.updateAll();
		}); 
	}; 
	
})(node);