/**
 * # Widgetss
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets.
 * ---
 */
(function(window, node) {

    "use strict";

    var J = node.JSUS;

    function Widgets() {

        /**
         * ## Widgets.widgets
         *
         * Container of currently registered widgets 
         *
         * @see Widgets.register
         */
        this.widgets = {};
    }

    /**
     * ### Widgets.register
     *
     * Registers a new widget in the collection
     *
     * A name and a prototype class must be provided. All properties
     * that are present in `node.Widget`, but missing in the prototype
     * are added.
     *
     * Registered widgets can be loaded with Widgets.get or Widgets.append.
     *
     * @param {string} name The id under which to register the widget
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
     * @return {object} widget The requested widget
     *
     * @see Widgets.add
     *
     * @TODO: add supports for any listener. Maybe requires some refactoring.
     * @TODO: add example.
     */
    Widgets.prototype.get = function(w_str, options) {
        var wProto, widget;
        var that;
        if ('string' !== typeof w_str) {
            throw new TypeError('Widgets.get: w_str must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.get: options must be object or ' +
                                'undefined.');
        }
        
        that = this;
        options = options || {};

        wProto = J.getNestedValue(w_str, this.widgets);
        
        if (!wProto) {
            throw new Error('Widgets.get: ' + w_str + ' not found.');
        }

        node.info('registering ' + wProto.name + ' v.' +  wProto.version);

        if (!this.checkDependencies(wProto)) {
            throw new Error('Widgets.get: ' + w_str + ' has unmet dependecies.');
        }

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
     * @param {object} root. Optional. The HTML element under which the widget
     *   will be appended. Defaults, `GameWindow.getFrameRoot()` or document.body
     * @param {options} options Optional. Configuration options to be passed
     *   to the widgets
     * @return {object|boolean} The requested widget, or FALSE is an error occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.append = Widgets.prototype.add = function(w, root,
                                                                options) {
        if ('string' !== typeof w && 'object' !== typeof w) {
            throw new TypeError('Widgets.append: w must be string or object');
        }
        if (root && !J.isElement(root)) {
            throw new TypeError('Widgets.append: root must be HTMLElement ' +
                                'or undefined.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.append: options must be object or ' +
                                'undefined.');
        }
        
        // Init default values.
        root = root || W.getFrameRoot() || document.body;
        options = options || {};

        // Check if it is a object (new widget)
        // If it is a string is the name of an existing widget
        // In this case a dependencies check is done
        if ('string' === typeof w) {
            w = this.get(w, options);
        }

        // If fieldset option is null, no fieldset is added.
        // If fieldset option is undefined, default options are used.
        if (options.fieldset !== null) {
            root = appendFieldset(root, options.fieldset ||
                                  w.defaults.fieldset, w);
        }
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

    
    // #### Helper functions.
    
    function appendFieldset(root, options, w) {
        var idFieldset, legend;
        if (!options) return root;
        idFieldset = options.id || w.id + '_fieldset';
        legend = options.legend || w.legend;
        return W.addFieldset(root, idFieldset, legend, options.attributes);
    };

    function createListenerFunction(w, e, l) {
        if (!w || !e || !l) return;
        w.getRoot()[e] = function() {
            l.call(w);
        };
    };

    function attachListeners(options, w) {
        var events, isEvent, i;
        if (!options || !w) return;
        isEvent = false;
        events = ['onclick', 'onfocus', 'onblur', 'onchange', 
                  'onsubmit', 'onload', 'onunload', 'onmouseover'];        
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                isEvent = J.in_array(i, events);
                if (isEvent && 'function' === typeof options[i]) {
                    createListenerFunction(w, i, options[i]);
                }
            }
        };
    };


    //Expose Widgets to the global object
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
