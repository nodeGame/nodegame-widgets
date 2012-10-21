(function (node) {
	
	// TODO: Introduce rules for update: other vs self
	
	node.widgets.register('StateBar', StateBar);	
	
// ## Defaults
	
	StateBar.defaults = {};
	StateBar.defaults.id = 'statebar';
	StateBar.defaults.fieldset = { legend: 'Change Game State' };	
	
// ## Meta-data
	
	StateBar.name = 'State Bar';
	StateBar.version = '0.3.1';
	StateBar.description = 'Provides a simple interface to change the state of the game.';
	
	function StateBar (options) {
		this.id = options.id;
		
		this.actionSel = null;
		this.recipient = null;
	}
	
	StateBar.prototype.getRoot = function () {
		return this.root;
	};
	
	StateBar.prototype.append = function (root) {
		
		var PREF = this.id + '_';
		
		var idButton = PREF + 'sendButton',
			idStateSel = PREF + 'stateSel',
			idActionSel = PREF + 'actionSel',
			idRecipient = PREF + 'recipient'; 
				
		var sendButton = node.window.addButton(root, idButton);
		var stateSel = node.window.addStateSelector(root, idStateSel);
		this.actionSel = node.window.addActionSelector(root, idActionSel);
		this.recipient = node.window.addRecipientSelector(root, idRecipient);
		
		var that = this;
		
		node.on('UPDATED_PLIST', function() {
			node.window.populateRecipientSelector(that.recipient, node.game.pl);
		});
		
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
				
				state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				var stateEvent;
				
				// Self Update
				if (to === 'ALL') {
					stateEvent = node.IN + node.actions.SAY + '.STATE';
					var stateMsg = node.msg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.emit(stateEvent,state,to);
			}
			else {
				node.err('Not valid state. Not sent.');
				node.socket.sendTXT('E: not valid state. Not sent');
			}
		};
		
		this.root = root;
		return root;
	};
	
})(node);