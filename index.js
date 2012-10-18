// nodegame-widgets

(function (window, node) {

function Widgets() {
	
}

/**
 * ### Widgets.get
 * 
 * Retrieves, instantiates and returns the specified widget.
 * 
 * It can attach standard javascript listeners to the root element of
 * the widget if specified in the options.
 * 
 * @TODO: add supports for any listener. Maybe requires some refactoring.
 * @TODO: add example.
 * 
 * The dependencies are checked, and if the conditions are not met, 
 * returns FALSE.
 * 
 * @see Widgets.add
 * 
 */
Widgets.prototype.get = function (w_str, options) {
	if (!w_str) return;
	var that = this;
	options = options || {};
	
	function attachListeners (options, w) {
		if (!options || !w) return;
		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				if (J.in_array(i, ['onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', 'onmouseover'])) {
					w.getRoot()[i] = function() {
						options[i].call(w);
					};
				}
			}			
		};
	};
	
	var w = J.getNestedValue(w_str, this.widgets);
	
	if (!w) {
		node.log('Widget ' + w_str + ' not found.', 'ERR');
		return;
	}
	
	node.log('nodeWindow: registering gadget ' + w.name + ' v.' +  w.version);
	
	if (! this.checkDependencies(w)) return false;
	
	var id = ('undefined' !== typeof options.id) ? options.id : w.id; 
	options.id = this.generateUniqueId(id);
	
	
	w = new w(options);

	
	try {

		// nodeGame listeners
		w.listeners();
		// user listeners
		attachListeners(options, w);
		}
		catch(e){
			throw 'Error while loading widget ' + w.name + ': ' + e;
		}
	return w;
};

/**
 * ### Widgets.add
 * 
 * Appends a widget to the specified root element. If no root element
 * is specified the widget is append to the global root. 
 * 
 * The first parameter can be string representing the name of the widget or 
 * a valid widget already loaded, for example through Widgets.get. 
 * In the latter case, dependencies are checked, and it returns FALSE if
 * conditions are not met.
 * 
 * It automatically creates a fieldset element around the widget if 
 * requested by the internal widget configuration, or if specified in the
 * options parameter.
 * 
 * @see Widgets.get
 * 
 */
Widgets.prototype.add = function (w, root, options) {
	if (!w) return;
	var that = this;
	
	function appendFieldset(root, options, w) {
		if (!options) return root;
		var idFieldset = options.id || w.id + '_fieldset';
		var legend = options.legend || w.legend;
		return that.addFieldset(root, idFieldset, legend, options.attributes);
	};
	
	
	// Init default values
	root = root || this.root;
	options = options || {};
	

	// Check if it is a object (new gadget)
	// If it is a string is the name of an existing gadget
	// In this case a dependencies check is done
	if ('object' !== typeof w) w = this.get(w, options);
	if (!w) return false;	
	
	// options exists and options.fieldset exist
	var fieldsetOptions = ('undefined' !== typeof options.fieldset) ? options.fieldset : w.fieldset; 
	root = appendFieldset(root, fieldsetOptions, w);
	w.append(root);

	return w;
};

/**
 * Checks if all the necessary objects are already loaded and returns TRUE,
 * or FALSE otherwise.
 * 
 * TODO: Check for version and other constraints.
 * 
 * @see Widgets.gets
 * 
 */ 
Widgets.prototype.checkDependencies = function (w, quiet) {
	if (!w.dependencies) return true;
	
	var errMsg = function (w, d) {
		var name = w.name || w.id;// || w.toString();
		node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
	};
	
	var parents = [window, node, node.window.widgets, node.window];
	
	var d = w.dependencies;
	for (var lib in d) {
		if (d.hasOwnProperty(lib)) {
			var found = false;
			for (var i=0; i<parents.length; i++) {
				if (J.getNestedValue(lib, parents[i])) {
					var found = true;
					break;
				}
			}
			if (!found) {	
				if (!quiet) errMsg(w, lib);
				return false;
			}
		
		}
	}
	return true;
};

//Expose nodeGame to the global object
node.widgets = new 

if ('undefined' !== typeof window) window.W = node.window;
	
})(
	// GameWindow works only in the browser environment. The reference 
	// to the node.js module object is for testing purpose only
	('undefined' !== typeof window) ? window : module.parent.exports.window,
	('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
