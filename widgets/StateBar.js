(function (node) {
	
	// TODO: Introduce rules for update: other vs self
	
	node.widgets.register('StateBar', StateBar);	
	
// ## Defaults
	
	StateBar.defaults = {};
	StateBar.defaults.id = 'statebar';
	StateBar.defaults.fieldset = { legend: 'Change Game State' };	
	
// ## Meta-data
	
	StateBar.name = 'State Bar';
	StateBar.version = '0.3.2';
	StateBar.description = 'Provides a simple interface to change the state of the game.';
	
	function StateBar (options) {
		this.id = options.id;
		this.recipient = null;
	}
	
	StateBar.prototype.getRoot = function () {
		return this.root;
	};
	
	StateBar.prototype.append = function (root) {
		
		var PREF = this.id + '_';
		
		var idButton = PREF + 'sendButton',
			idStateSel = PREF + 'stateSel',
			idRecipient = PREF + 'recipient'; 
				
		var sendButton = node.window.addButton(root, idButton);
		var stateSel = node.window.addStateSelector(root, idStateSel);
		this.recipient = node.window.addRecipientSelector(root, idRecipient);
		
		var that = this;
		
		node.on('UPDATED_PLIST', function() {
			node.window.populateRecipientSelector(that.recipient, node.game.pl);
		});
		
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			
			// STATE.STEP:ROUND
			var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
			
			var result = parseState.exec(stateSel.value);
			var state, step, round, stateEvent, stateMsg;
			if (result !== null) {
				// Note: not result[0]!
				state = result[1];
				step = result[2] || 1;
				round = result[3] || 1;
				
				node.log('Parsed State: ' + result.join("|"));
				
				state = new node.GameStage({
					state: state,
					step: step,
					round: round
				});
				
				// Self Update
				if (to === 'ALL') {
					stateEvent = node.IN + node.action.SAY + '.STATE';
					stateMsg = node.msg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				stateEvent = node.OUT + node.action.SAY + '.STATE';
				node.emit(stateEvent, state, to);
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