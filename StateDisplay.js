(function (exports) {

	JSUS = node.JSUS;
	Table = node.window.Table;
	
	exports.StateDisplay = StateDisplay;	
	
	StateDisplay.id = 'statedisplay';
	StateDisplay.name = 'State Display';
	StateDisplay.version = '0.4.1';
	StateDisplay.description = 'Display basic information about player\'s status.';
	
	function StateDisplay (options) {
		
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Player Status'
		};
		
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
		this.table.clear(true);
		this.table.addRow(['Name: ', node.player.name]);
		this.table.addRow(['State: ', new GameState(node.state).toString()]);
		this.table.addRow(['Id: ', node.player.id]);
		this.table.parse();
		
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on( 'STATECHANGE', function() {
			that.updateAll(node.state);
		}); 
	}; 
	
})(node.window.widgets);