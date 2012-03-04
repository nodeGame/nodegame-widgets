(function (exports) {
	
	exports.Wall = Wall;
	
	var JSUS = node.JSUS;
	
	Wall.id = 'wall';
	Wall.name = 'Wall';
	Wall.version = '0.3';
	Wall.description = 'Intercepts all LOG events and prints them ';
	Wall.description += 'into a DIV element with an ordinal number and a timestamp.';
	
	Wall.dependencies = {
		JSUS: {}
	};
	
	function Wall (options) {
		this.id = options.id || Wall.id;
		this.name = options.name || this.name;
		this.buffer = [];
		this.counter = 0;

		this.wall = node.window.getElement('pre', this.id);
		
		this.fieldset = {
			legend: 'Game Log',
			id: this.id
		};
	};
	
	Wall.prototype.init = function (options) {
		var options || {};
		this.counter = options.counter || this.counter;
	};
	
	Wall.prototype.append = function (root) {
//		var fieldset = node.window.addFieldset(root, this.id+'_fieldset', 'Game Log');
//		var idLogDiv = id || this.id;
		return root.appendChild(this.wall);
		
	};
	
	Wall.prototype.getRoot = function () {
		return this.wall;
	};
	
	Wall.prototype.listeners = function() {
		var that = this;	
		node.on('LOG', function(msg) {
			that.debuffer();
			that.write(msg);
		});
	}; 
	
	Wall.prototype.write = function (text) {
		if (document.readyState !== 'complete') {
	        this.buffer.push(s);
	    } else {
	    	var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
	    	this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
	    }  
	};
	
	Wall.prototype.debuffer = function () {
		if (document.readyState === 'complete' && this.buffer.length > 0) {
			for (var i=0; i < this.buffer.length; i++) {
				this.write(this.buffer[i]);
			}
			this.buffer = [];
		}
	};
	
})(node.window.widgets);