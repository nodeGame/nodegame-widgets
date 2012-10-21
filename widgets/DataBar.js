(function (node) {
	
	node.widgets.register('DataBar', DataBar);
	
// ## Defaults
	DataBar.defaults = {};
	DataBar.defaults.id = 'databar';
	DataBar.defaults.fieldset = {	
		legend: 'Send DATA to players'
	};
	
// ## Meta-data
	DataBar.name = 'Data Bar';
	DataBar.version = '0.3';
	DataBar.description = 'Adds a input field to send DATA messages to the players';
		
	function DataBar (options) {
		this.bar = null;
		this.root = null;
		this.recipient = null;
	}
	
	
	DataBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var dataInput = node.window.addTextInput(root);
		this.recipient = node.window.addRecipientSelector(root);
		
		var that = this;
		
		sendButton.onclick = function() {
			
			var to = that.recipient.value;
	
			//try {
				//var data = JSON.parse(dataInput.value);
				data = dataInput.value;
				console.log('Parsed Data: ' + JSON.stringify(data));
				
				node.emit(node.OUT + node.actions.SAY + '.DATA', data, to);
	//			}
	//			catch(e) {
	//				console.log('Impossible to parse the data structure');
	//			}
		};
		
		
		node.onPLIST(function (msg) {
			node.window.populateRecipientSelector(that.recipient, msg.data);
		}); 
		
		return root;
		
	};
	
})(node);