(function (exports) {

	exports.StateDisplay = StateDisplay;	
	
	StateDisplay.id = 'statedisplay';
	StateDisplay.name = 'State Display';
	StateDisplay.version = '0.3.2';
	StateDisplay.description = 'Display basic information about player\'s status.';
	
	function StateDisplay (options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Player Status'
		};
		
		this.stateDiv = null;
	};
	
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
		
		
		this.playerDiv = node.window.addDiv(root, idPlayer);
		
		var checkPlayerName = setInterval(function(idState,idPlayer){
				if(that.game.player !== null){
					clearInterval(checkPlayerName);
					that.updateAll();
				}
			},100);
	
		this.root = root;
		return root;
		
	};
	
	StateDisplay.prototype.updateAll = function(idState,idPlayer) {
		var pName = document.createTextNode('Name: ' + this.game.player.name);
		var pId = document.createTextNode('Id: ' + this.game.player.id);
		
		this.playerDiv.appendChild(pName);
		this.playerDiv.appendChild(document.createElement('br'));
		this.playerDiv.appendChild(pId);
		
		this.stateDiv = node.window.addDiv(this.playerDiv,idState);
		this.updateState(this.game.gameState);
	};
	
	StateDisplay.prototype.updateState =  function(state) {
		if (!state) return;
		var that = this;
		var checkStateDiv = setInterval(function(){
			if(that.stateDiv){
				clearInterval(checkStateDiv);
				that.stateDiv.innerHTML = 'State: ' +  new GameState(state).toString() + '<br />';
				// was
				//that.stateDiv.innerHTML = 'State: ' +  GameState.stringify(state) + '<br />';
			}
		},100);
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on( 'STATECHANGE', function() {
			that.updateState(node.game.gameState);
		}); 
	}; 
})(node.window.widgets);