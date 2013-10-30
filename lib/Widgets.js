/**
 * # Widgets
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets.
 * ---
 */
(function(window, node) {

    "use strict";

    var J = node.JSUS;

    function Widgets() {
        this.widgets = {};
        this.root = node.window.root || document.body;
    }

    /**
     * ### Widgets.register
     *
     * Registers a new widget in the collection
     *
     * A name and a prototype class must be provided. All properties
     * that are presetn in `node.Widget`, but missing in the prototype
     * are added.
     *
     * Registered widgets can be loaded with Widgets.get or Widgets.append.
     *
     * @param {string} name The id under which registering the widget
     * @param {function} w The widget to add
     * @return {object|boolean} The registered widget, 
     *   or FALSE if an error occurs
     */
    Widgets.prototype.register = function(name, w) {
        var i;
        if ('string' !== typeof name) {
            throw new TypeError('Widgets.register: name must be string.');
        }
        if ('function' !== typeof w) {
            throw new TypeError('Widgets.register: w must be function.');
        }
        // Add default properties to widget prototype
        for (i in node.Widget.prototype) {
            if (!w[i] && !w.prototype[i]
                && !(w.prototype.__proto__ && w.prototype.__proto__[i])) {
                w.prototype[i] = J.clone(node.Widget.prototype[i]);
            }
        }
        this.widgets[name] = w;
        return this.widgets[name];
    };

    /**
     * ### Widgets.get
     *
     * Retrieves, instantiates and returns the specified widget
     *
     * It can attach standard javascript listeners to the root element of
     * the widget if specified in the options.
     *
     * The dependencies are checked, and if the conditions are not met,
     * returns FALSE.
     *
     * @param {string} w_str The name of the widget to load
     * @param {options} options Optional. Configuration options
     *   to be passed to the widgets
     *
     * @see Widgets.add
     *
     * @TODO: add supports for any listener. Maybe requires some refactoring.
     * @TODO: add example.
     */
    Widgets.prototype.get = function(w_str, options) {
	if (!w_str) return;
	var that = this;
	options = options || {};

	function createListenerFunction(w, e, l) {
	    if (!w || !e || !l) return;
	    w.getRoot()[e] = function() {
		l.call(w);
	    };
	};

	function attachListeners(options, w) {
	    if (!options || !w) return;
	    var isEvent = false;
	    for (var i in options) {
		if (options.hasOwnProperty(i)) {
		    isEvent = J.in_array(i, ['onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', 'onmouseover']);
		    if (isEvent && 'function' === typeof options[i]) {
			createListenerFunction(w, i, options[i]);
		    }
		}
	    };
	};

	var wProto = J.getNestedValue(w_str, this.widgets);
	var widget;

	if (!wProto) {
	    node.err('widget ' + w_str + ' not found.');
	    return;
	}

	node.info('registering ' + wProto.name + ' v.' +  wProto.version);

	if (!this.checkDependencies(wProto)) return false;

	// Add missing properties to the user options
	J.mixout(options, J.clone(wProto.defaults));

        widget = new wProto(options);
        // Re-inject defaults
        widget.defaults = options;

        // Call listeners
        widget.listeners.call(widget);

        // user listeners
        attachListeners(options, widget);

	return widget;
    };
    /**
     * ### Widgets.append
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
     * @param {string} w_str The name of the widget to load
     * @param {object} root. The HTML element to which appending the widget
     * @param {options} options Optional. Configuration options to be passed
     *   to the widgets
     * @return {object|boolean} The requested widget, or FALSE is an error occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.append = Widgets.prototype.add = function(w, root, options) {
        if (!w) return;
        var that = this;

        function appendFieldset(root, options, w) {
            if (!options) return root;
            var idFieldset = options.id || w.id + '_fieldset';
            var legend = options.legend || w.legend;
            return W.addFieldset(root, idFieldset, legend, options.attributes);
        };

        // Init default values
        root = root || this.root;
        options = options || {};

        // Check if it is a object (new widget)
        // If it is a string is the name of an existing widget
        // In this case a dependencies check is done
        if ('object' !== typeof w) w = this.get(w, options);
        if (!w) return false;

        // options exists and options.fieldset exist
        root = appendFieldset(root, options.fieldset || w.defaults.fieldset, w);
        w.append(root);

        return w;
    };

    /**
     * ### Widgets.checkDependencies
     *
     * Checks if all the dependencies are already loaded
     *
     * Dependencies are searched for in the following objects:
     *
     * - window
     * - node
     * - this.widgets
     * - node.window
     *
     * TODO: Check for version and other constraints.
     *
     * @param {object} The widget to check
     * @param {boolean} quiet Optional. If TRUE, no warning will be raised.
     *   Defaults FALSE
     * @return {boolean} TRUE, if all dependencies are met
     */
    Widgets.prototype.checkDependencies = function(w, quiet) {
        var errMsg, parents, d, lib, found, i; 
        if (!w.dependencies) return true;

        errMsg = function(w, d) {
            var name = w.name || w.id;// || w.toString();
            node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
        };

        parents = [window, node, this.widgets, node.window];

        d = w.dependencies;
        for (lib in d) {
            if (d.hasOwnProperty(lib)) {
                found = false;
                for (i = 0; i < parents.length; i++) {
                    if (J.getNestedValue(lib, parents[i])) {
                        found = true;
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

    //Expose Widgets to the global object
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);