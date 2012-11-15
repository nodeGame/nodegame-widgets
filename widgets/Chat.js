(function (node) {
	
	node.widgets.register('Chat', Chat);
	
	var J = node.JSUS,
		W = node.window;
	

// ## Defaults
	
	Chat.defaults = {};
	Chat.defaults.id = 'Chat';
	Chat.defaults.fieldset = { legend: 'Game Log' };	
	Chat.defaults.mode = Chat.modes.MANY_TO_MANY; 
	Chat.defaults.textarea_id = 'chat_textarea';
	Chat.defaults.chat_id = 'chat_chat';
	Chat.defaults.submit_id = 'chat_submit';
	Chat.defaults.submit_event = 'CHAT';
	Chat.defaults.submit_text = 'chat';

			
// ## Meta-data
	
	Chat.modes = {
			MANY_TO_MANY: 'MANY_TO_MANY',
			MANY_TO_ONE: 'MANY_TO_ONE',
			ONE_TO_ONE: 'ONE_TO_ONE',
	};
	
	Chat.name = 'Chat';
	Chat.version = '0.3';
	Chat.description = 'Offers a bi-diractional communication interface between players, or between players and the experimenter.';

// ## Dependencies
	
	Chat.dependencies = {
		JSUS: {}
	};
	
	function Chat (options) {
		this.id = options.id || Chat.id;
		this.name = options.name || this.name;
		this.buffer = [];
		this.counter = 0;
		
		this.root = null;
		
		this.textarea_id = options.textarea_id || Chat.defaults.textarea_id;
		this.chat_id = options.chat_id || Chat.defaults.chat_id;
		this.submit_id = options.submit_id || Chat.defaults.submit_id;
		
		this.submit_event = options.submit_event || Chat.defaults.submit_event;
		this.submit_text = options.submit_text || Chat.defaults.submit_text;
	
		this.mode = options.mode || Chat.defaults.mode;

		this.recipient = W.getRecipientSelector();
		this.submit = W.getEventButton(this.submit_event, this.submit_text, this.submit_id);
		this.textarea = W.getElement('textarea', this.textarea_id)
		this.chat = W.getElement('div', this.chat_id);
	}
	
	
	Chat.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.chat);
		root.appendChild(this.textarea);
		root.appendChild(this.submit);
		root.appendChild(this.recipient);
		return root;
	};
	
	Chat.prototype.getRoot = function () {
		return this.root;
	};
	
	Chat.prototype.readTA = function () {
		var txt = this.textarea.innerHTML;
		this.textarea.innerHTML = '';
		return txt;
	};
	
	Chat.prototype.listeners = function() {
		var that = this;	
		
	    node.on('UPDATED_PLIST', function() {
		      W.populateRecipientSelector(that.recipient, node.game.pl);
		    });
		    
	    node.on(this.chat_event, function () {
	      var msg = that.readTA();
	      var to = that.recipient.value;
	      var args = {
		        '%s': {
		          'class': 'chat_me',
		        },
		        '%msg': {
		          'class': 'chat_msg',
		        },
		        '!txt': msg,
	      };
	      J.sprintf('%sMe%s: %msg!txt%msg', args, that.chat);
	      W.writeln('', that.chat);
	      //node.say(this.chat_event, msg, to);
	    });
		    
	    node.onDATA(this.chat_event, function (msg) {
	    	var from = msg.from;
	      var args = {
		        '%s': {
		          'class': 'chat_others',
		        },
		        '%msg': {
		          'class': 'chat_msg',
		        },
		        '@txt': msg.data,
	          '!from': msg.from,
	      };
	      J.sprintf('%s!from%s: %msg@txt%msg', args, that.chat);
	      W.writeln('', that.chat);
	    });
	};
	
})(node);