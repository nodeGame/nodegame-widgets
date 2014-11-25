/**
 * # Widgets
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets
 */
(function(window, node) {

    "use strict";

    var J = node.JSUS;

    // ## Widgets constructor

    function Widgets() {

        /**
         * ### Widgets.widgets
         *
         * Container of currently registered widgets
         *
         * @see Widgets.register
         */
        this.widgets = {};

        /**
         * ### Widgets.instances
         *
         * Container of appended widget instances
         *
         * @see Widgets.append
         */
        this.instances = [];
    }

    // ## Widgets methods

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
        J.mixout(w.prototype, new node.Widget());
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
            throw new Error('Widgets.get: ' + w_str + ' has unmet ' +
                            'dependecies.');
        }

        // Add missing properties to the user options
        J.mixout(options, J.clone(wProto.defaults));

        widget = new wProto(options);
        // Re-inject defaults
        widget.defaults = options;

        widget.title = wProto.title;
        widget.footer = wProto.footer;
        widget.className = wProto.className;
        widget.context = wProto.context;

        // Call listeners
        widget.listeners.call(widget);

        // user listeners
        attachListeners(options, widget);

        return widget;
    };

    /**
     * ### Widgets.append
     *
     * Appends a widget to the specified root element
     *
     * If no root element is specified the widget is append to the global root.
     *
     * The first parameter can be string representing the name of the widget or
     * a valid widget already loaded, for example through Widgets.get.
     * In the latter case, dependencies are checked, and it returns FALSE if
     * conditions are not met.
     *
     * @param {string|object} w The name of the widget to load or a loaded
     *   widget object
     * @param {object} root Optional. The HTML element under which the widget
     *   will be appended. Default: `GameWindow.getFrameRoot()` or
     *   `document.body`
     * @param {options} options Optional. Configuration options to be passed
     *   to the widget
     *
     * @return {object|boolean} The requested widget, or FALSE is an error
     *   occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.append = Widgets.prototype.add = function(w, root,
                                                                options) {
        if ('string' !== typeof w && 'object' !== typeof w) {
            throw new TypeError('Widgets.append: w must be string or object.');
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

        w.panelDiv = appendDiv(root, {
            attributes: {
                className: ['ng_widget', 'panel', 'panel-default', w.className]
            }
        });

        // Optionally add title.
        if (w.title) {
            w.setTitle(w.title);
        }

        // Add body.
        w.bodyDiv = appendDiv(w.panelDiv, {
            attributes: {className: 'panel-body'}
        });

        // Optionally add footer.
        if (w.footer) {
            w.setFooter(w.footer);
        }

        // Optionally set context.
        if (w.context) {
            w.setContext(w.context);
        }

        w.append();

        // Store widget instance for destruction.
        this.instances.push(w);

        return w;
    };

    /**
     * ### Widgets.destroyAll
     *
     * Removes all widgets that have been appended with Widgets.append
     *
     * Exceptions thrown in the widgets' destroy methods are caught.
     *
     * @see Widgets.append
     */
    Widgets.prototype.destroyAll = function() {
        var i, widget;

        for (i in this.instances) {
            if (this.instances.hasOwnProperty(i)) {
                widget = this.instances[i];

                try {
                    widget.destroy();

                    // Remove the widget's div from its parent:
                    widget.panelDiv.parentNode.removeChild(widget.panelDiv);
                }
                catch (e) {
                    node.warn('Widgets.destroyAll: Error caught. ' + e + '.');
                }
            }
        }

        this.instances = [];
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
     * @param {object} w The widget to check
     * @param {boolean} quiet Optional. If TRUE, no warning will be raised.
     *   Default: FALSE
     * @return {boolean} TRUE, if all dependencies are met
     */
    Widgets.prototype.checkDependencies = function(w, quiet) {
        var parents, d, lib, found, i;
        if (!w.dependencies) return true;

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
                    if (!quiet) checkDepErrMsg(w, lib);
                    return false;
                }
            }
        }
        return true;
    };


    // ## Helper functions

    function appendDiv(root, options) {
        // TODO: Check every parameter
        return W.addDiv(root, undefined, options.attributes);
    }

    function createListenerFunction(w, e, l) {
        if (!w || !e || !l) return;
        w.panelDiv[e] = function() {
            l.call(w);
        };
    }

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
        }
    }

    function checkDepErrMsg(w, d) {
        var name = w.name || w.id;// || w.toString();
        node.err(d + ' not found. ' + name + ' cannot be loaded.');
    }

    //Expose Widgets to the global object
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
