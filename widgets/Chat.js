
/**
 * ### DOM.format_string
 * 
 * Splits a string into a series of _span_ elements
 * 
 * This methods permits to highlight special parts of a string by enclosing 
 * them in _span_ elements to which it is possible to associate a css class 
 * or id. Alternatively, it also possible to add in-line style. E.g.:
 * 
 * 	format_string('%sImportant!%s An error has occurred: %prefile not found%pre', {
 * 		'%pre': {
 * 			style: 'font-size: 12px; font-family: courier;'
 * 		},
 * 		'%s': {
 * 			id: 'myId',
 * 			'class': 'myClass',
 * 		},
 * 	}, document.body);
 * 
 * @param {string} string A text to transform
 * @param {object} args Optional. An object containing the spans to apply to the string
 * @param {Element} root Optional. An HTML element to which append the string. Defaults, a new _span_ element
 * 
 */
JSUS.format_string = function (string, args, root) {
	
	var text, textNode, span, idx_start, idx_finish, idx_replace, idxs, spans = {};
	
	if (!args) {
		return document.createTextNode(string);
	}
	
	root = root || document.createElement('span');
	
	// Transform arguments before inserting them.
	for (var key in args) {
		if (args.hasOwnProperty(key)) {
			span = W.getElement('span', null, args[key]);

			idx_start = string.indexOf(key);
			idx_replace = idx_start + key.length;
			idx_finish = string.indexOf(key, idx_replace);

			if ('undefined' === typeof idx_start || 'undefined' === typeof !idx_finish) {
				JSUS.log('Error. Could not find key: ' + key);
				return false;
			}
			
			text = document.createTextNode(string.substring(idx_replace, idx_finish));
			span.appendChild(text);

			spans[idx_start] = {
				span: span,
				finish: idx_finish,
				marker_length: key.length,
			}
			
		}
	  
	}
	
	idxs = JSUS.keys(spans).sort(function(a,b){return a-b});
	
	
	idx_start = -1;
	for (var i = 0; i < idxs.length; i++) {
		
		// add fragments of string
		if (idx_start !== idxs[i]-1) {
			root.appendChild(document.createTextNode(string.substring(idx_start, idxs[i])));
		}
		
		// add span
		root.appendChild(spans[idxs[i]].span);
		idx_start = spans[idxs[i]].finish + spans[idxs[i]].marker_length;
	}
	
	// add the final part of the string
	if (idx_start !== string.length) {
		root.appendChild(document.createTextNode(string.substring(idx_start)));
	}
	
	return root;
}

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

		this.submit = W.getEventButton(this.submit_event, this.submit_text, this.submit_id);
		this.textarea = W.getElement('textarea', this.textarea_id)
		this.chat = W.getElement('div', this.chat_id);
	}
	
	
	Chat.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.chat);
		root.appendChild(this.textarea);
		root.appendChild(this.submit);
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
	
	Chat.prototype.writeToTA = function (who, what) {
		
	
	};
	
	Chat.prototype.listeners = function() {
		var that = this;	
		node.on(this.chat_event, function (msg) {
			var txt = document.createTextNode(that.readTA());
			that.chat.appendChild(txt);
		});
	}; 
	
	Chat.prototype.write = function (text) {
		if (document.readyState !== 'complete') {
			this.buffer.push(s);
		} else {
			var mark = this.counter++ + ') ' + J.getTime() + ' ';
			this.chat.innerHTML = mark + text + "\n" + this.chat.innerHTML;
		}
	};

	Chat.prototype.debuffer = function () {
		if (document.readyState === 'complete' && this.buffer.length > 0) {
			for (var i=0; i < this.buffer.length; i++) {
				this.write(this.buffer[i]);
			}
			this.buffer = [];
		}
	};
	
	
	function format_string(string, args) {
		
		var text, textNode, span, idx_start, idx_finish, idxs, spans = {};
		
		if (!args || !args.length) {
			return document.createTextNode(string);
		}
		
		
		// Transform arguments before inserting them.
		for (var key in args) {
			if (args.hasOwnProperty(key)) {
						
				span = W.createElement('span', null, args[key]);
				idx_start = string.indexOf(key);
				idx_finish = string.indexOf(key, idx_start);
				text = document.createTextNode(string.substring(idx_start, idx_finish));
				span.appendChild(text);
				spans[idx_start] = span;
				
			}
		  
		}
		
		idxs = J.keys(spans).sort(function(a,b){return a-b});
		
		// add the first part of the string
		if (idxs[0] !== 0) {
			textNode = document.createTextNode(string.substring(0, keys[0]));
		}
		else {
			textNode = document.createTextNode();
		}
		
		for (var i = 0; i < idxs.length; i++) {
			textNode.appendChild(spans[idxs[i]]);
		}
		
		// add the final part of the string
		if (idxs[(idxs.length-1)] !== string.length) {
			textNode.appendChild(document.createTextNode(string.substring(0, keys[0])));
		}
		
		return textNode;
	}
	
})(node);