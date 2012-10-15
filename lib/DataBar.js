(function (exports) {
	
	exports.DataBar	= DataBar;
	
	DataBar.id = 'databar';
	DataBar.name = 'Data Bar';
	DataBar.version = '0.3';
	DataBar.description = 'Adds a input field to send DATA messages to the players';
		
	function DataBar (options) {
		
		this.game = node.game;
		this.id = options.id || DataBar.id;
		
		this.bar = null;
		this.root = null;
		
		this.fieldset = {
			legend: 'Send DATA to players'
		};
		
		this.recipient = null;
	}
	
	DataBar.prototype.init = function (options) {};
	
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
		
		return root;
		
	};
	
	DataBar.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	};
	
})(node.window.widgets);