(function (exports) {

	exports.MsgBar	= MsgBar;
		
	MsgBar.id = 'msgbar';
	MsgBar.name = 'Msg Bar';
	MsgBar.version = '0.3.1';
	MsgBar.description = 'Send txt messages to players';
	
	function MsgBar (options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.recipient = null;
		
		this.fieldset = {
			legend: 'Send MSG to players'
		};
	}
	
	// TODO: Write a proper INIT method
	MsgBar.prototype.init = function () {};
	
	MsgBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var msgText = node.window.addTextInput(root);
		this.recipient = node.window.addRecipientSelector(root);
		
		var that = this;
		sendButton.onclick = function() {
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			var msg = node.TXT(msgText.value,to);
			//console.log(msg.stringify());
		};
		this.root = root;
		return root;
	};
	
	MsgBar.prototype.getRoot = function () {
		return this.root;
	};
	
	MsgBar.prototype.listeners = function () {
		var that = this;	
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		
		}); 
	};
})(node.window.widgets);