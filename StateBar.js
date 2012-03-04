(function (exports) {
	
	// TODO: Introduce rules for update: other vs self
	
	exports.StateBar = StateBar;	
	
	StateBar.id = 'statebar';
	StateBar.name = 'State Bar';
	StateBar.version = '0.3.1';
	StateBar.description = 'Provides a simple interface to change the state of the game.'
	
	function StateBar (options) {
		this.id = options.id;
		
		this.actionSel = null;
		this.recipient = null;
		
		this.fieldset = {
			legend: 'Change Game State'
		};
	};
	
	// TODO: Write a proper INIT method
	StateBar.prototype.init = function () {};
	
	StateBar.prototype.getRoot = function () {
		return this.root;
	};
	
	StateBar.prototype.append = function (root) {
		
		var PREF = this.id + '_';
		
		var idButton = PREF + 'sendButton';
		var idStateSel = PREF + 'stateSel';
		var idActionSel = PREF + 'actionSel';
		var idRecipient = PREF + 'recipient'; 
				
		var sendButton 	= node.window.addButton(root, idButton);
		var stateSel 	= node.window.addStateSelector(root, idStateSel);
		this.actionSel	= node.window.addActionSelector(root, idActionSel);
		this.recipient 	= node.window.addRecipientSelector(root, idRecipient);
		
		var that = this;
	
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			
			//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
			//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
			//var parseState = /^(\d+)$/;
			//var parseState = /(\S+)?/;
			var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
			
			var result = parseState.exec(stateSel.value);
			
			if (result !== null) {
				// Note: not result[0]!
				var state = result[1];
				var step = result[2] || 1;
				var round = result[3] || 1;
				console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
				
				var state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				// Self Update
				if (to === 'ALL') {
					var stateEvent = node.IN + node.actions.SAY + '.STATE';
					var stateMsg = node.gsc.gmg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				var stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.emit(stateEvent,state,to);
			}
			else {
				console.log('Not valid state. Not sent.');
				node.gsc.sendTXT('E: not valid state. Not sent');
			}
		};
		
		this.root = root;
		return root;
		
	};
	
	StateBar.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	}; 
})(node.window.widgets);