/**
 * # Widgets
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets
 *
 * http://nodegame.org
 */
(function(window, node) {

    "use strict";

    var J = node.JSUS;

    // ## Widgets constructor

    function Widgets() {
        var that;

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

        that = this;
        node.registerSetup('widgets', function(conf) {
            var name, root;
            if (!conf) return;

            // Add new widgets.
            if (conf.widgets) {
                for (name in conf.widgets) {
                    if (conf.widgets.hasOwnProperty(name)) {
                        that.register(name, conf.widgets[name]);
                    }
                }
            }

            // Destroy all existing widgets.
            if (conf.destroyAll) {
                that.destroyAll();
            }

            // Append existing widgets.
            if (conf.append) {
                for (name in conf.append) {
                    if (conf.append.hasOwnProperty(name)) {
                        // Determine root.
                        if ('string' === typeof conf.append[name].root) {
                            root = W.getElementById(conf.append[name].root);
                        }
                        if (!root) root = W.getScreen();
                        if (!root) {
                            node.warn('setup widgets: could not find a root ' +
                                      'for widget ' + name + '.');
                        }
                        else {
                            that.append(name, root, conf.append[name]);
                        }
                    }
                }
            }

            return conf;
        });

        node.info('node-widgets: loading.');
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
     *
     * @return {object|boolean} The registered widget,
     *   or FALSE if an error occurs
     */
    Widgets.prototype.register = function(name, w) {
        if ('string' !== typeof name) {
            throw new TypeError('Widgets.register: name must be string.');
        }
        if ('function' !== typeof w) {
            throw new TypeError('Widgets.register: w must be function.');
        }
        // Add default properties to widget prototype.
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
     * @param {string} widgetName The name of the widget to load
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
    Widgets.prototype.get = function(widgetName, options) {
        var WidgetPrototype, widget;
        var changes, origDestroy;
        var that;
        if ('string' !== typeof widgetName) {
            throw new TypeError('Widgets.get: widgetName must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.get: options must be object or ' +
                                'undefined.');
        }

        that = this;
        options = options || {};

        WidgetPrototype = J.getNestedValue(widgetName, this.widgets);

        if (!WidgetPrototype) {
            throw new Error('Widgets.get: ' + widgetName + ' not found.');
        }

        node.info('creating widget ' + WidgetPrototype.name +
                  ' v.' +  WidgetPrototype.version);

        if (!this.checkDependencies(WidgetPrototype)) {
            throw new Error('Widgets.get: ' + widgetName + ' has unmet ' +
                            'dependencies.');
        }

        // Add missing properties to the user options
        J.mixout(options, J.clone(WidgetPrototype.defaults));

        // Create widget.
        widget = new WidgetPrototype(options);

        // Re-inject defaults.
        widget.defaults = options;

        // Set prototype values or options values.
        widget.title = 'undefined' === typeof options.title ?
            WidgetPrototype.title : options.title;
        widget.footer = 'undefined' === typeof options.footer ?
            WidgetPrototype.footer : options.footer;
        widget.className = 'undefined' === typeof options.className ?
            WidgetPrototype.className : options.className;
        widget.context = 'undefined' === typeof options.context ?
            WidgetPrototype.context : options.context;

        // Add random unique widget id.
        widget.wid = '' + J.randomInt(0,10000000000000000000);

        // Call listeners.
        if (options.listeners !== false) {
            // Start recording changes.
            node.events.setRecordChanges(true);

            widget.listeners.call(widget);

            // Get registered listeners, clear changes, and stop recording.
            changes = node.events.getChanges(true);
            node.events.setRecordChanges(false);
        }

        origDestroy = widget.destroy;

        // If any listener was added or removed, the original situation will
        // be restored when the widget is destroyed.
        // The widget is also automatically removed from parent.
        widget.destroy = function() {
            var i, len, ee, eeName;

            try {
                // Call original function.
                origDestroy.call(widget);
                // Remove the widget's div from its parent.
                widget.panelDiv.parentNode.removeChild(widget.panelDiv);
            }
            catch(e) {
                node.warn(widgetName + '.destroy(): error caught. ' + e + '.');
            }

            if (changes) {
                for (eeName in changes) {
                    if (changes.hasOwnProperty(eeName)) {
                        ee = changes[eeName];
                        i = -1, len = ee.added.length;
                        for ( ; ++i < len ; ) {
                            node.events.ee[eeName].off(ee.added[i].type,
                                                       ee.added[i].listener);
                        }
                        i = -1, len = changes[eeName].removed.length;
                        for ( ; ++i < len ; ) {
                            node.events.ee[eeName].on(ee.removed[i].type,
                                                      ee.removed[i].listener);
                        }
                    }
                }
            }

            // Remove widget from current instances, if found.
            i = -1, len = node.widgets.instances.length;
            for ( ; ++i < len ; ) {
                if (node.widgets.instances[i].wid === widget.wid) {
                    node.widgets.instances.splice(i,1);
                    break;
                }
            }
        };

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

        // User listeners.
        attachListeners(w);

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
        var i, len;
        i = -1, len = this.instances.length;
        // Nested widgets can be destroyed by previous calls to destroy,
        // and each call to destroy modify the array of instances.
        for ( ; ++i < len ; ) {
            this.instances[0].destroy();
        }
        if (this.instances.length) {
            node.warn('node.widgets.destroyAll: some widgets could ' +
                      'not be destroyed.');
        }
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
        w.panelDiv[e] = function() { l.call(w); };
    }

    function attachListeners(w) {
        var events, isEvent, i;
        isEvent = false;
        events = ['onclick', 'onfocus', 'onblur', 'onchange',
                  'onsubmit', 'onload', 'onunload', 'onmouseover'];
        for (i in w.options) {
            if (w.options.hasOwnProperty(i)) {
                isEvent = J.inArray(i, events);
                if (isEvent && 'function' === typeof w.options[i]) {
                    createListenerFunction(w, i, w.options[i]);
                }
            }
        }
    }

    function checkDepErrMsg(w, d) {
        var name = w.name || w.id;// || w.toString();
        node.err(d + ' not found. ' + name + ' cannot be loaded.');
    }

    //Expose Widgets to the global object.
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
