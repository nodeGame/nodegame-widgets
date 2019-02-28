/**
 * # Widgets
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets
 *
 * http://nodegame.org
 */
(function(window, node) {

    "use strict";

    var NDDB = window.NDDB;

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
         * @see Widgets.lastAppended
         */
        this.instances = [];

        /**
         * ### Widgets.lastAppended
         *
         * Reference to lastAppended widget
         *
         * @see Widgets.append
         */
        this.lastAppended = null;

        /**
         * ### Widgets.collapseTarget
         *
         * Collapsed widgets are by default moved inside element
         */
        this.collapseTarget = null;

        that = this;
        node.registerSetup('widgets', function(conf) {
            var name, root, collapseTarget;
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
                        root = conf.append[name].root;
                        if ('function' === typeof root) {
                            root = root();
                        }
                        else if ('string' === typeof root) {
                            root = W.getElementById(root);
                        }
                        if (!root) root = W.getScreen();

                        if (!root) {
                            node.warn('setup widgets: could not find a root ' +
                                      'for widget ' + name + '. Requested: ' +
                                      conf.append[name].root);
                        }
                        else {
                            that.append(name, root, conf.append[name]);
                        }
                    }
                }
            }

            if (conf.collapseTarget) {
                if ('function' === typeof conf.collapseTarget) {
                    collapseTarget = conf.collapseTarget();
                }
                else if ('string' === typeof conf.collapseTarget) {
                    collapseTarget = W.getElementById(conf.collapseTarget);
                }
                else if (J.isElement(conf.collapseTarget)) {
                    collapseTarget = conf.collapseTarget;
                }
                if (!collapseTarget) {
                    node.warn('setup widgets: could not find collapse target.');
                }
                else {
                    that.collapseTarget = collapseTarget;
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
            throw new TypeError('Widgets.register: name must be string. ' +
                                'Found: ' + name);
        }
        if ('function' !== typeof w) {
            throw new TypeError('Widgets.register: w must be function.' +
                               'Found: ' + w);
        }
        if ('undefined' === typeof w.sounds) w.sounds = {};
        if ('undefined' === typeof w.texts) w.texts = {};
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
     * Performs the following checkings:
     *
     *   - dependencies, as specified by widget prototype, must exist
     *   - id, if specified in options, must be string
     *
     * and throws an error if conditions are not met.
     *
     * Adds the following properties to the widget object:
     *
     *   - title: as specified by the user or as found in the prototype
     *   - footer: as specified by the user or as found in the prototype
     *   - context: as specified by the user or as found in the prototype
     *   - className: as specified by the user or as found in the prototype
     *   - id: user-defined id, if specified in options
     *   - wid: random unique widget id
     *   - hooks: object containing event listeners
     *   - emit:
     *   - disabled: boolean flag indicating the widget state, set to FALSE
     *   - highlighted: boolean flag indicating whether the panelDiv is
     *        highlighted, set to FALSE
     *   - collapsible: boolean flag, TRUE if the widget can be collapsed
     *        and a button to hide body is added to the header
     *   - collapsed: boolan flag, TRUE if widget is collapsed (body hidden)
     *   - closable: boolean flag, TRUE if the widget can be closed (destroyed)
     *
     * Calls the `listeners` method of the widget. Any event listener
     * registered here will be automatically removed when the widget
     * is destroyed. !Important: it will erase previously recorded changes
     * by the event listener. If `options.listeners` is equal to false, the
     * listeners method is skipped.
     *
     * A `.destroy` method is added to the widget that perform the
     * following operations:
     *
     *   - calls original widget.destroy method, if defined,
     *   - removes the widget from DOM (if it was appended),
     *   - removes listeners defined during the creation,
     *   - and remove the widget from Widget.instances
     *
     * Finally a reference to the widget is kept in `Widgets.instances`.
     *
     * @param {string} widgetName The name of the widget to load
     * @param {object} options Optional. Configuration options, will be
     *    mixed out with attributes in the `defaults` property
     *    of the widget prototype.
     *
     * @return {object} widget The requested widget
     *
     * @see Widgets.append
     * @see Widgets.instances
     */
    Widgets.prototype.get = function(widgetName, options) {
        var WidgetPrototype, widget;
        var changes, origDestroy;
        var that;
        if ('string' !== typeof widgetName) {
            throw new TypeError('Widgets.get: widgetName must be string.' +
                               'Found: ' + widgetName);
        }
        if (!options) {
            options = {};
        }
        else if ('object' !== typeof options) {
            throw new TypeError('Widgets.get: options must be object or ' +
                                'undefined. Found: ' + options);
        }

        that = this;

        WidgetPrototype = J.getNestedValue(widgetName, this.widgets);

        if (!WidgetPrototype) {
            throw new Error('Widgets.get: ' + widgetName + ' not found.');
        }

        node.info('creating widget ' + widgetName  +
                  ' v.' +  WidgetPrototype.version);

        if (!this.checkDependencies(WidgetPrototype)) {
            throw new Error('Widgets.get: ' + widgetName + ' has unmet ' +
                            'dependencies.');
        }

        // Add default properties to the user options.
        if (WidgetPrototype.defaults) {
            J.mixout(options, J.clone(WidgetPrototype.defaults));
        }

        // Create widget.
        widget = new WidgetPrototype(options);

        // TODO: check do we need this?
        // Re-inject defaults.
        // widget.defaults = options;

        // Set ID.
        if ('undefined' !== typeof options.id) {
            if ('number' === typeof options.id) options.id = '' + options.id;
            if ('string' === typeof options.id) {
                widget.id = options.id;
            }
            else {
                throw new TypeError('Widgets.get: options.id must be ' +
                                    'string, number or undefined. Found: ' +
                                    options.id);
            }
        }

        // Set prototype values or options values.
        widget.title = 'undefined' === typeof options.title ?
            WidgetPrototype.title : options.title;
        widget.footer = 'undefined' === typeof options.footer ?
            WidgetPrototype.footer : options.footer;
        widget.className = WidgetPrototype.className;
        if (J.isArray(options.className)) {
            widget.className += options.className.join(' ');
        }
        else if ('string' === typeof options.className) {
            widget.className += options.className;
        }
        else if ('undefined' !== typeof options.className) {
            throw new TypeError('widgets.append: className must be array, ' +
                                'string, or undefined. Found: ' +
                                options.className);
        }

        widget.context = 'undefined' === typeof options.context ?
            WidgetPrototype.context : options.context;
        widget.sounds = 'undefined' === typeof options.sounds ?
            WidgetPrototype.sounds : options.sounds;
        widget.texts = 'undefined' === typeof options.texts ?
            WidgetPrototype.texts : options.texts;
        widget.collapsible = options.collapsible || false;
        widget.closable = options.closable || false;
        widget.collapseTarget =
            options.collapseTarget || this.collapseTarget || null;
        widget.hooks = {
            hidden: [],
            shown: [],
            collapsed: [],
            uncollapsed: [],
            disabled: [],
            undisabled: [],
            destroyed: []
        };

        // Fixed properties.

        // Widget Name.
        widget.widgetName = widgetName;
        // Add random unique widget id.
        widget.wid = '' + J.randomInt(0,10000000000000000000);
        // Add appended.
        widget.appended = false;
        // Add enabled.
        widget.disabled = null;
        // Add highlighted.
        widget.highlighted = null;
        // Add collapsed.
        widget.collapsed = null;
        // Add hidden.
        widget.hidden = null;

        // Call init.
        widget.init(options);

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
                if ('function' === typeof origDestroy) origDestroy.call(widget);
                // Remove the widget's div from its parent.
                if (widget.panelDiv && widget.panelDiv.parentNode) {
                    widget.panelDiv.parentNode.removeChild(widget.panelDiv);
                }
            }
            catch(e) {
                node.warn(widgetName + '.destroy: error caught. ' + e + '.');
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

            this.emit('destroyed');
        };

        // Store widget instance (e.g. used for destruction).
        this.instances.push(widget);

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
     *   will be appended. Default: the `document.body` element of the main
     *   frame (if one is defined), or `document.body` elment of the page
     * @param {options} options Optional. Configuration options to be passed
     *   to the widget
     *
     * @return {object|boolean} The requested widget, or FALSE is an error
     *   occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.append = function(w, root, options) {
        var tmp;

        if ('string' !== typeof w && 'object' !== typeof w) {
            throw new TypeError('Widgets.append: w must be string or object. ' +
                               'Found: ' + w);
        }
        if (root && !J.isElement(root)) {
            throw new TypeError('Widgets.append: root must be HTMLElement ' +
                                'or undefined. Found: ' + root);
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.append: options must be object or ' +
                                'undefined. Found: ' + options);
        }

        // Init default values.
        options = options || {};

        // If no root is defined, use the body element of the main frame,
        // if none is found, use the document.body.
        if (!root) {
            root = W.getFrameDocument();
            if (root) root = root.body;
            if (!root) root = document.body;
        }
        else if (root === W.getHeader() &&
                 'undefined' === typeof options.panel) {

            options.panel = false;
        }

        // Check if it is a object (new widget).
        // If it is a string is the name of an existing widget.
        // In this case a dependencies check is done.
        if ('string' === typeof w) w = this.get(w, options);

        // Add panelDiv (with or without panel).
        tmp = {
            className: options.panel === false ?
                [ 'ng_widget',  'no-panel', w.className ] :
                [ 'ng_widget', 'panel', 'panel-default', w.className ]
        };

        // Dock it.
        // TODO: handle multiple dockedd widgets.
        if (options.docked) tmp.className.push('docked');

        // Add div inside widget.
        w.panelDiv = W.get('div', tmp);

        // Optionally add title (and div).
        if (options.title !== false && w.title) {
            tmp = options.panel === false ?
                'no-panel-heading' : 'panel-heading';
            w.setTitle(w.title, { className: tmp });
        }

        // Add body (with or without panel).
        tmp = options.panel !== false ? 'panel-body' : 'no-panel-body';
        w.bodyDiv = W.append('div', w.panelDiv, { className: tmp });

        // Optionally add footer.
        if (w.footer) {
            tmp = options.panel === false ?
                'no-panel-heading' : 'panel-heading';
            w.setFooter(w.footer);
        }

        // Optionally set context.
        if (w.context) w.setContext(w.context);

        // User listeners.
        // attachListeners(w);

        // Be hidden, if requested.
        if (options.hidden) w.hide();

        root.appendChild(w.panelDiv);

        w.originalRoot = root;

        w.append();
        w.appended = true;

        // Store reference of last appended widget.
        this.lastAppended = w;

        return w;
    };

    Widgets.prototype.add = function(w, root, options) {
        console.log('***Widgets.add is deprecated. Use ' +
                    'Widgets.append instead.***');
        return this.append(w, root, options);
    };

    /**
     * ### Widgets.isWidget
     *
     * Returns TRUE if the object is a widget-like
     *
     * @param {object} w The object to test
     * @param {boolean} strict If TRUE, it checks if object is an
     *   instance of the Widget class. If FALSE, it just have to
     *   implement some of its methods (append and getValues).
     *
     * @return {boolean} TRUE, if the widget was found and destroyed.
     *
     * @see Widgets.get
     * @see Widgets.destroyAll
     *
     * @api experimental
     */
    Widgets.prototype.isWidget = function(w, strict) {
        if (strict) return w instanceof node.Widget;
        return ('object' === typeof w &&
                'function' === typeof w.append &&
                'function' === typeof w.getValues)
    };

    /**
     * ### Widgets.destroy
     *
     * Destroys the widget with the specified id
     *
     * @param {string} id The id of the widget to destroy
     *
     * @return {boolean} TRUE, if the widget was found and destroyed.
     *
     * @see Widgets.get
     * @see Widgets.destroyAll
     */
    Widgets.prototype.destroy = function(id) {
        var i, len;
        if ('string' !== typeof id || !id.trim().length) {
            throw new TypeError('Widgets.destroy: id must be a non-empty ' +
                                'string. Found: ' + id);
        }
        i = -1, len = this.instances.length;
        // Nested widgets can be destroyed by previous calls to destroy,
        // and each call to destroy modify the array of instances.
        for ( ; ++i < len ; ) {
            if (this.instances[i].id === id) {
                this.instances[i].destroy();
                return true;
            }
        }
        node.warn('node.widgets.destroy: widget could not be destroyed: ' + id);
        return false;
    };

    /**
     * ### Widgets.destroyAll
     *
     * Removes all widgets that have been created through Widgets.get
     *
     * Exceptions thrown in the widgets' destroy methods are caught.
     *
     * @see Widgets.get
     * @see Widgets.destroy
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

//     function createListenerFunction(w, e, l) {
//         if (!w || !e || !l) return;
//         w.panelDiv[e] = function() { l.call(w); };
//     }
//
//     function attachListeners(w) {
//         var events, isEvent, i;
//         isEvent = false;
//         events = ['onclick', 'onfocus', 'onblur', 'onchange',
//                   'onsubmit', 'onload', 'onunload', 'onmouseover'];
//         for (i in w.options) {
//             if (w.options.hasOwnProperty(i)) {
//                 isEvent = J.inArray(i, events);
//                 if (isEvent && 'function' === typeof w.options[i]) {
//                     createListenerFunction(w, i, w.options[i]);
//                 }
//             }
//         }
//     }

    function checkDepErrMsg(w, d) {
        var name = w.name || w.id; // || w.toString();
        node.err(d + ' not found. ' + name + ' cannot be loaded.');
    }

    //Expose Widgets to the global object.
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
