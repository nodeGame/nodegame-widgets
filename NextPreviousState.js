(function (exports) {
	
	
	// TODO: Introduce rules for update: other vs self
	
	exports.NextPreviousState =	NextPreviousState;
	
	NextPreviousState.id = 'nextprevious';
	NextPreviousState.name = 'Next,Previous State';
	NextPreviousState.version = '0.3.1';
	NextPreviousState.description = 'Adds two buttons to push forward or rewind the state of the game by one step.';
		
	function NextPreviousState(options) {
		this.game = node.game;
		this.id = options.id || NextPreviousState.id;
		
		this.fieldset = {
			legend: 'Rew-Fwd'
		};
	}
	
	// TODO: Write a proper INIT method
	NextPreviousState.prototype.init = function () {};
	
	NextPreviousState.prototype.getRoot = function () {
		return this.root;
	};
	
	NextPreviousState.prototype.append = function (root) {
		var idRew = this.id + '_button';
		var idFwd = this.id + '_button';
		
		var rew = node.window.addButton(root, idRew, '<<');
		var fwd = node.window.addButton(root, idFwd, '>>');
		
		
		var that = this;
	
		var updateState = function (state) {
			if (state) {
				var stateEvent = node.IN + node.actions.SAY + '.STATE';
				var stateMsg = node.msg.createSTATE(stateEvent, state);
				// Self Update
				node.emit(stateEvent, stateMsg);
				
				// Update Others
				stateEvent = node.OUT + node.actions.SAY + '.STATE';
				node.emit(stateEvent, state, 'ALL');
			}
			else {
				node.log('No next/previous state. Not sent', 'ERR');
			}
		};
		
		fwd.onclick = function() {
			updateState(that.game.next());
		};
			
		rew.onclick = function() {
			updateState(that.game.previous());
		};
		
		this.root = root;
		return root;
	};
	
	NextPreviousState.prototype.listeners = function () {}; 

})(node.window.widgets);