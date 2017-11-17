/**
 * # Widget
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Prototype of a widget class
 *
 * Prototype methods will be injected in every new widget, if missing.
 *
 * Additional properties can be automatically, depending on configuration.
 *
 * @see Widgets.get
 * @see Widgets.append
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.Widget = Widget;

    /**
     * ### Widget constructor
     *
     * Creates a new instance of widget
     *
     * Should create all widgets properties, but the `init` method
     * initialize them. Some properties are added automatically
     * by `Widgets.get` after the constructor has been called,
     * but before `init`.
     *
     * @see Widgets.get
     * @see Widget.init
     */
    function Widget() {}

    /**
     * ### Widget.init
     *
     * Inits the widget after constructor and default properties are added
     *
     * @param {object} options Configuration options
     *
     * @see Widgets.get
     */
    Widget.prototype.init = function(options) {};

    /**
     * ### Widget.listeners
     *
     * Wraps calls event listeners registration
     *
     * Event listeners registered here are automatically removed
     * when widget is destroyed (if still active)
     *
     * @see EventEmitter.setRecordChanges
     * @see Widgets.destroy
     */
    Widget.prototype.listeners = function() {};

    /**
     * ### Widget.append
     *
     * Creates HTML elements and appends them to the `panelDiv` element
     *
     * The method is called by `Widgets.append` which evaluates user-options
     * and adds the default container elements of a widget:
     *
     *    - panelDiv:   the outer container
     *    - headingDiv: the title container
     *    - bodyDiv:    the main container
     *    - footerDiv:  the footer container
     *
     * To ensure correct destroyal of the widget, all HTML elements should
     * be children of Widget.panelDiv
     *
     * @see Widgets.append
     * @see Widgets.destroy
     * @see Widget.panelDiv
     * @see Widget.footerDiv
     * @see Widget.headingDiv
     */
    Widget.prototype.append = function() {};

    /**
     * ### Widget.getValues
     *
     * Returns the values currently stored by the widget
     *
     * @param {mixed} options Settings controlling the content of return value
     *
     * @return {mixed} The values of the widget
     */
    Widget.prototype.getValues = function(options) {};

    /**
     * ### Widget.getValues
     *
     * Set the stored values directly
     *
     * The method should not set the values, if widget is disabled
     *
     * @param {mixed} values The values to store
     */
    Widget.prototype.setValues = function(values) {};

    /**
     * ### Widget.reset
     *
     * Resets the widget
     *
     * Deletes current selection, any highlighting, and other data
     * that the widget might have collected to far.
     */
    Widget.prototype.reset = function(options) {};

    /**
     * ### Widget.highlight
     *
     * Hightlights the user interface of the widget in some way
     *
     * If widget was not appended, i.e. no `panelDiv` has been created,
     * it should issue a war.
     *
     * @param {mixed} options Settings controlling the type of highlighting
     */
    Widget.prototype.highlight = function(options) {};

    /**
     * ### Widget.highlight
     *
     * Hightlights the user interface of the widget in some way
     *
     * Should mark the state of widget as `highlighted`.
     *
     * If widget was not appended, i.e. no `panelDiv` has been created,
     * it should raise an error.
     *
     * @param {mixed} options Settings controlling the type of highlighting
     *
     * @see Widget.highlighted
     */
    Widget.prototype.unhighlight = function() {};

    /**
     * ### Widget.isHighlighted
     *
     * Returns TRUE if widget is currently highlighted
     *
     * @return {boolean} TRUE, if widget is currently highlighted
     */
    Widget.prototype.isHighlighted = function() {
        return !!this.highlighted;
    };

    /**
     * ### Widget.enabled
     *
     * Enables the widget
     *
     * An enabled widget allows the user to interact with it
     */
    Widget.prototype.enable = function() {};

    /**
     * ### Widget.disable
     *
     * Disables the widget
     *
     * A disabled widget is still visible, but user cannot interact with it
     */
    Widget.prototype.disable = function() {};

    /**
     * ### Widget.isDisabled
     *
     * Returns TRUE if widget is enabled
     *
     * `Widgets.get` wraps this method in an outer callback performing
     * default cleanup operations.
     *
     * @return {boolean} TRUE if widget is disabled
     *
     * @see Widget.enable
     * @see Widget.disable
     * @see Widget.disabled
     */
    Widget.prototype.isDisabled = function() {
        return !!this.disabled;
    };

    /**
     * ### Widget.hide
     *
     * Hides the widget, if it was previously appended to DOM
     *
     * Sets the 'display' property of `panelDiv` to 'none'
     *
     * @see Widget.show
     */
    Widget.prototype.hide = function() {
        if (!this.panelDiv) return;
        this.panelDiv.style.display = 'none';
    };

    /**
     * ### Widget.show
     *
     * Show the widget, if it was previously appended and hidden
     *
     * Sets the 'display' property of `panelDiv` to ''
     *
     * @param {string} display Optional. The value of the display
     *    property. Default: ''
     *
     * @see Widget.hide
     */
    Widget.prototype.show = function(display) {
        if (this.panelDiv && this.panelDiv.style.display === 'none') {
            this.panelDiv.style.display = display || '';
        }
    };

    /**
     * ### Widget.toggle
     *
     * Toggles the display of the widget, if it was previously appended
     *
     * @param {string} display Optional. The value of the display
     *    property in case the widget is currently hidden. Default: ''
     *
     * @see Widget.hide
     */
    Widget.prototype.toggle = function(display) {
        if (!this.panelDiv) return;
        if (this.panelDiv.style.display === 'none') {
            this.panelDiv.style.display = display || '';
        }
        else {
            this.panelDiv.style.display = 'none';
        }
    };

    /**
     * ### Widget.destroy
     *
     * Performs cleanup operations
     *
     * `Widgets.get` wraps this method in an outer callback performing
     * default cleanup operations.
     *
     * @see Widgets.get
     */
    Widget.prototype.destroy = null;

    /**
     * ### Widget.setTitle
     *
     * Creates/removes an heading div with a given title
     *
     * Adds/removes a div with class `panel-heading` to the `panelDiv`.
     *
     * @param {string|HTMLElement|false} Optional. The title for the heading,
     *    div an HTML element, or false to remove the header completely.
     *
     * @see Widget.headingDiv
     */
    Widget.prototype.setTitle = function(title) {
        var tmp;
        if (!this.panelDiv) {
            throw new Error('Widget.setTitle: panelDiv is missing.');
        }

        // Remove heading with false-ish argument.
        if (!title) {
            if (this.headingDiv) {
                this.panelDiv.removeChild(this.headingDiv);
                this.headingDiv = null;
            }
        }
        else {
            if (!this.headingDiv) {
                // Add heading.
                this.headingDiv = W.addDiv(this.panelDiv, undefined,
                        {className: 'panel-heading'});
                // Move it to before the body (IE cannot have undefined).
                tmp = (this.bodyDiv && this.bodyDiv.childNodes[0]) || null;
                this.panelDiv.insertBefore(this.headingDiv, tmp);
            }

            // Set title.
            if (W.isElement(title)) {
                // The given title is an HTML element.
                this.headingDiv.innerHTML = '';
                this.headingDiv.appendChild(title);
            }
            else if ('string' === typeof title) {
                this.headingDiv.innerHTML = title;
            }
            else {
                throw new TypeError(J.funcName(this) + '.setTitle: ' +
                                    'title must be string, HTML element or ' +
                                    'falsy. Found: ' + title);
            }
        }
    };

    /**
     * ### Widget.setFooter
     *
     * Creates/removes a footer div with a given content
     *
     * Adds/removes a div with class `panel-footer` to the `panelDiv`.
     *
     * @param {string|HTMLElement|false} Optional. The title for the header,
     *    an HTML element, or false to remove the header completely.
     *
     * @see Widget.footerDiv
     */
    Widget.prototype.setFooter = function(footer) {
        if (!this.panelDiv) {
            throw new Error('Widget.setFooter: panelDiv is missing.');
        }

        // Remove footer with false-ish argument.
        if (!footer) {
            if (this.footerDiv) {
                this.panelDiv.removeChild(this.footerDiv);
                delete this.footerDiv;
            }
        }
        else {
            if (!this.footerDiv) {
                // Add footer.
                this.footerDiv = W.addDiv(this.panelDiv, undefined,
                        {className: 'panel-footer'});
            }

            // Set footer contents.
            if (W.isElement(footer)) {
                // The given footer is an HTML element.
                this.footerDiv.innerHTML = '';
                this.footerDiv.appendChild(footer);
            }
            else if ('string' === typeof footer) {
                this.footerDiv.innerHTML = footer;
            }
            else {
                throw new TypeError(J.funcName(this) + '.setFooter: ' +
                                    'footer must be string, HTML element or ' +
                                    'falsy. Found: ' + title);
            }
        }
    };

    /**
     * ### Widget.setContext
     *
     * Changes the default context of the class 'panel-' + context
     *
     * Context are defined in Bootstrap framework.
     *
     * @param {string} context The type of the context
     */
    Widget.prototype.setContext = function(context) {
        if ('string' !== typeof context) {
            throw new TypeError(J.funcName(this) + '.setContext: ' +
                                'footer must be string. Found: ' + context);

        }
        W.removeClass(this.panelDiv, 'panel-[a-z]*');
        W.addClass(this.panelDiv, 'panel-' + context);
    };

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof node) ? node : module.parent.exports.node
);

/**
 * # Widgets
 * Copyright(c) 2017 Stefano Balietti
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
            throw new TypeError('Widgets.register: name must be string. ' +
                                'Found: ' + name);
        }
        if ('function' !== typeof w) {
            throw new TypeError('Widgets.register: w must be function.' +
                               'Found: ' + w);
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
     *   - disabled: boolean flag indicating the widget state, set to FALSE
     *   - highlighted: boolean flag indicating whether the panelDiv is
     *        highlighted, set to FALSE
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
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.get: options must be object or ' +
                                'undefined. Found: ' + options);
        }
        options = options || {};
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
        widget.className = 'undefined' === typeof options.className ?
            WidgetPrototype.className : options.className;
        widget.context = 'undefined' === typeof options.context ?
            WidgetPrototype.context : options.context;

        // Fixed properties.

        // Add random unique widget id.
        widget.wid = '' + J.randomInt(0,10000000000000000000);
        // Add enabled.
        widget.disabled = null;
        // Add highlighted.
        widget.highlighted = null;

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

        // If no root is defined, use the body element of the main frame,
        // if none is found, use the document.body.
        if (!root) {
            root = W.getFrameDocument();
            if (root) root = root.body;
            if (!root) root = document.body;
        }
        options = options || {};

        // Check if it is a object (new widget).
        // If it is a string is the name of an existing widget.
        // In this case a dependencies check is done.
        if ('string' === typeof w) w = this.get(w, options);

        w.panelDiv = appendDiv(root, {
            attributes: {
                className: ['ng_widget', 'panel', 'panel-default', w.className]
            }
        });

        // Optionally add title.
        if (w.title) w.setTitle(w.title);

        // Add body.
        w.bodyDiv = appendDiv(w.panelDiv, {
            attributes: {className: 'panel-body'}
        });

        // Optionally add footer.
        if (w.footer) w.setFooter(w.footer);

        // Optionally set context.
        if (w.context) w.setContext(w.context);

        // User listeners.
        // attachListeners(w);

        w.append();

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

    function appendDiv(root, options) {
        // TODO: Check every parameter
        return W.addDiv(root, undefined, options.attributes);
    }

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

/**
 * # Chat
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Chat', Chat);

    // ## Meta-data

    Chat.version = '0.5.1';
    Chat.description = 'Offers a uni-/bi-directional communication interface ' +
        'between players, or between players and the experimenter.';

    Chat.title = 'Chat';
    Chat.className = 'chat';

    // ### Chat.modes
    //
    // - MANY_TO_MANY: everybody can see all the messages, and it possible
    //   to send private messages.
    //
    // - MANY_TO_ONE: everybody can see all the messages, private messages can
    //   be received, but not sent.
    //
    // - ONE_TO_ONE: everybody sees only personal messages, private messages can
    //   be received, but not sent. All messages are sent to the SERVER.
    //
    // - RECEIVER_ONLY: messages can only be received, but not sent.
    //
    Chat.modes = {
        MANY_TO_MANY: 'MANY_TO_MANY',
        MANY_TO_ONE: 'MANY_TO_ONE',
        ONE_TO_ONE: 'ONE_TO_ONE',
        RECEIVER_ONLY: 'RECEIVER_ONLY'
    };


    // ## Dependencies

    Chat.dependencies = {
        JSUS: {}
    };

    /**
     * ## Chat constructor
     *
     * `Chat` is a simple configurable chat
     *
     * @see Chat.init
     */
    function Chat() {

        /**
         * ### Chat.mode
         *
         * Determines to mode of communication
         *
         * @see Chat.modes
         */
        this.mode = null;

        /**
         * ### Chat.recipient
         *
         * Determines recipient of the messages
         */
        this.recipient = null;


        /**
         * ### Chat.textarea
         *
         * The textarea wherein to write and read
         */
        this.textarea = null;

        /**
         * ### Chat.textareaId
         *
         * The id of the textarea
         */
        this.textareaId = null;


        /**
         * ### Chat.chat
         *
         * The DIV wherein to display the chat
         */
        this.chat = null;

        /**
         * ### Chat.chatId
         *
         * The id of the chat DIV
         */
        this.chatId = null;


        /**
         * ### Chat.submit
         *
         * The submit button
         */
        this.submit = null;

        /**
         * ### Chat.submitId
         *
         * The id of the submit butten
         */
        this.submitId = null;

        /**
         * ### Chat.submitText
         *
         * The text on the submit button
         */
        this.submitText = null;

        /**
         * ### Chat.chatEvent
         *
         * The event to fire when sending a message
         */
        this.chatEvent = null;

        /**
         * ### Chat.displayName
         *
         * Function which displays the sender's name
         */
        this.displayName = null;

        /**
         * ### Chat.recipient
         *
         * Object containing the value of the recipient of the message
         */
        this.recipient = { value: null };
    }

    // ## Chat methods

    /**
     * ### Chat.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - `mode`: Determines to mode of communication
     *   - `textareaId`: The id of the textarea
     *   - `chatId`: The id of the chat DIV
     *   - `submitId`: The id of the submit butten
     *   - `submitText`: The text on the submit button
     *   - `chatEvent`: The event to fire when sending a message
     *   - `displayName`: Function which displays the sender's name
     */
    Chat.prototype.init = function(options) {
        var tmp;
        options = options || {};

        if ('undefined' === typeof options.mode) {
            // Will be setup later.
            options.mode = 'MANY_TO_MANY';
        }
        else if ('string' === typeof options.mode) {
            switch(options.mode) {
            case Chat.modes.RECEIVER_ONLY:
                tmp = 'SERVER';
                break;
            case Chat.modes.MANY_TO_ONE:
                tmp = 'ROOM';
                break;
            case Chat.modes.ONE_TO_ONE:
                tmp = 'SERVER';
                break;
            case Chat.modes.MANY_TO_MANY:
                break;
            default:
                throw new Error('Chat.init: options.mode is invalid: ' +
                                options.mode);
            }
            this.recipient.value = tmp;
        }
        else {
            throw new Error('Chat.init: options.mode must be string or ' +
                            'undefined. Found: ' + options.mode);
        }

        this.mode = options.mode;

        this.textareaId = options.textareaId || 'chat_textarea';
        this.chatId = options.chatId || 'chat_chat';
        this.submitId = options.submitId || 'chat_submit';

        this.chatEvent = options.chatEvent || 'CHAT';
        this.submitText = options.submitText || 'chat';

        this.displayName = options.displayName || function(from) {
            return from;
        };
    };


    Chat.prototype.append = function() {

        this.chat = W.getElement('div', this.chatId);
        this.bodyDiv.appendChild(this.chat);

        if (this.mode !== Chat.modes.RECEIVER_ONLY) {

            // Create buttons to send messages, if allowed.
            this.submit = W.getEventButton(this.chatEvent,
                                           this.submitText,
                                           this.submitId);
            this.submit.className = 'btn btn-sm btn-secondary';
            this.textarea = W.getElement('textarea', this.textareaId);
            // Append them.
            W.writeln('', this.bodyDiv);
            this.bodyDiv.appendChild(this.textarea);
            W.writeln('', this.bodyDiv);
            this.bodyDiv.appendChild(this.submit);

            // Add recipient selector, if requested.
            if (this.mode === Chat.modes.MANY_TO_MANY) {
                this.recipient = W.getRecipientSelector();
                this.bodyDiv.appendChild(this.recipient);
            }
        }
    };

    Chat.prototype.readTA = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt;
    };

    Chat.prototype.writeTA = function(string, args) {
        J.sprintf(string, args, this.chat);
        W.writeln('', this.chat);
        this.chat.scrollTop = this.chat.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        node.on(this.chatEvent, function() {
            var msg, to, args;
            msg = that.readTA();
            if (!msg) return;

            to = that.recipient.value;
            args = {
                '%s': {
                    'class': 'chat_me'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg,
                '!to': to
            };
            that.writeTA('%sMe -> !to%s: %msg!txt%msg', args);
            node.say(that.chatEvent, to, msg.trim());
        });

        if (this.mode === Chat.modes.MANY_TO_MANY) {
            node.on('UPDATED_PLIST', function() {
                W.populateRecipientSelector(that.recipient,
                    node.game.pl.fetch());
            });
        }

        node.on.data(this.chatEvent, function(msg) {
            var from, args;
            if (msg.from === node.player.id || msg.from === node.player.sid) {
                return;
            }

            if (this.mode === Chat.modes.ONE_TO_ONE) {
                if (msg.from === this.recipient.value) {
                    return;
                }
            }

            from = that.displayName(msg.from);
            args = {
                '%s': {
                    'class': 'chat_others'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg.data,
                '!from': from
            };

            that.writeTA('%s!from%s: %msg!txt%msg', args);
        });
    };

})(node);

/**
 * # ChernoffFaces
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;
    var Table = node.window.Table;

    node.widgets.register('ChernoffFaces', ChernoffFaces);

    // ## Meta-data

    ChernoffFaces.version = '0.6.1';
    ChernoffFaces.description =
        'Display parametric data in the form of a Chernoff Face.';

    ChernoffFaces.title = 'ChernoffFaces';
    ChernoffFaces.className = 'chernofffaces';

    // ## Dependencies
    ChernoffFaces.dependencies = {
        JSUS: {},
        Table: {},
        Canvas: {},
        SliderControls: {}
    };

    ChernoffFaces.FaceVector = FaceVector;
    ChernoffFaces.FacePainter = FacePainter;
    ChernoffFaces.width = 100;
    ChernoffFaces.height = 100;
    ChernoffFaces.onChange = 'CF_CHANGE';

    /**
     * ## ChernoffFaces constructor
     *
     * Creates a new instance of ChernoffFaces
     *
     * @see Canvas constructor
     */
    function ChernoffFaces(options) {
        var that = this;

        // ## Public Properties

        // ### ChernoffFaces.options
        // Configuration options
        this.options = null;

        // ### ChernoffFaces.table
        // The table containing everything
        this.table = null;

        // ### ChernoffFaces.sc
        // The slider controls of the interface
        // Can be set manually via options.controls.
        // @see SliderControls
        this.sc = null;

        // ### ChernoffFaces.fp
        // The object generating the Chernoff faces
        // @see FacePainter
        this.fp = null;

        // ### ChernoffFaces.canvas
        // The HTMLElement canvas where the faces are created
        this.canvas = null;

        // ### ChernoffFaces.changes
        // History all the changes (if options.trackChanges is TRUE).
        // Each time the `draw` method is called, the input parameters
        // and a time measurement will be added here.
        this.changes = [];

        // ### ChernoffFaces.onChange
        // Name of the event to emit to update the canvas (falsy disabled)
        this.onChange = null;

        // ### ChernoffFaces.onChangeCb
        // Updates the canvas when the onChange event is emitted
        //
        // @param {object} f Optional. The list of features to change.
        //    Can be a complete set or subset of all the features. If
        //    not specified, it will try to get the features from the
        //    the controls object, and if not found, a random vector
        //    will be created.
        // @param {boolean} updateControls Optional. If TRUE, controls
        //    are updated with the new values. Default, FALSE.
        //
        // @see ChernoffFaces.draw
        this.onChangeCb = function(f, updateControls) {
            if ('undefined' === typeof updateControls) updateControls = false;
            if (!f) {
                if (that.sc) f = that.sc.getValues();
                else f = FaceVector.random();
            }
            that.draw(f, updateControls);
        };

        /**
         * ### ChoiceTable.timeFrom
         *
         * Name of the event to measure time from for each change
         *
         * Default event is a new step is loaded (user can interact with
         * the screen). Set it to FALSE, to have absolute time.
         *
         * @see node.timer.getTimeSince
         */
        this.timeFrom = 'step';

        // ### ChernoffFaces.features
        // The object containing all the features to draw Chernoff faces
        this.features = null;
    }

    /**
     * ### ChernoffFaces.init
     *
     * Inits the widget
     *
     * Stores the reference to options, most of the operations are done
     * by the `append` method.
     *
     * @param {object} options Configuration options. Accepted options:
     *
     * - canvas {object} containing all options for canvas
     *
     * - width {number} width of the canvas (read only if canvas is not set)
     *
     * - height {number} height of the canvas (read only if canvas is not set)
     *
     * - features {FaceVector} vector of face-features. Default: random
     *
     * - onChange {string|boolean} The name of the event that will trigger
     *      redrawing the canvas, or null/false to disable event listener
     *
     * - controls {object|false} the controls (usually a set of sliders)
     *      offering the user the ability to manipulate the canvas. If equal
     *      to false no controls will be created. Default: SlidersControls.
     *      Any custom implementation must provide the following methods:
     *
     *          - getValues: returns the current features vector
     *          - refresh: redraws the current feature vector
     *          - init: accepts a configuration object containing a
     *               features and onChange as specified above.
     *
     */
    ChernoffFaces.prototype.init = function(options) {

        this.options = options;

        // Face Painter.
        if (options.features) {
            this.features = new FaceVector(options.features);
        }
        else if (!this.features) {
            this.features = FaceVector.random();
        }

        // Draw features, if facepainter was already created.
        if (this.fp) this.fp.draw(this.features);

        // onChange event.
        if (options.onChange === false || options.onChange === null) {
            if (this.onChange) {
                node.off(this.onChange, this.onChangeCb);
                this.onChange = null;
            }
        }
        else {
            this.onChange = 'undefined' === typeof options.onChange ?
                ChernoffFaces.onChange : options.onChange;
            node.on(this.onChange, this.onChangeCb);
        }
    };

    /**
     * ## ChernoffFaces.getCanvas
     *
     * Returns the reference to current wrapper Canvas object
     *
     * To get to the HTML Canvas element use `canvas.canvas`.
     *
     * @return {Canvas} Canvas object
     *
     * @see Canvas
     */
    ChernoffFaces.prototype.getCanvas = function() {
        return this.canvas;
    };

    /**
     * ## ChernoffFaces.buildHTML
     *
     * Builds HTML objects, but does not append them
     *
     * Creates the table, canvas, draw the current image, and
     * eventually adds the controls.
     *
     * If the table was already built, it returns immediately.
     */
    ChernoffFaces.prototype.buildHTML = function() {
        var controlsOptions, f;
        var tblOptions, options;

        if (this.table) return;

        options = this.options;

        // Table.
        tblOptions = {};
        if (this.id) tblOptions.id = this.id;

        if ('string' === typeof options.className) {
            tblOptions.className = options.className;
        }
        else if (options.className !== false) {
            tblOptions.className = 'cf_table';
        }

        this.table = new Table(tblOptions);

        // Canvas.
        if (!this.canvas) this.buildCanvas();

        // Controls.
        if ('undefined' === typeof options.controls || options.controls) {
            // Sc options.
            f = J.mergeOnKey(FaceVector.defaults, this.features, 'value');
            controlsOptions = {
                id: 'cf_controls',
                features: f,
                onChange: this.onChange,
                submit: 'Send'
            };
            // Create them.
            if ('object' === typeof options.controls) {
                this.sc = options.controls;
            }
            else {
                this.sc = node.widgets.get('SliderControls', controlsOptions);
            }
        }

        // Table.
        if (this.sc) {
            this.table.addRow(
                [{
                    content: this.sc,
                    id: this.id + '_td_controls'
                },{
                    content: this.canvas,
                    id: this.id + '_td_cf'
                }]
            );
        }
        else {
            this.table.add({
                content: this.canvas,
                id: this.id + '_td_cf'
            });
        }

        // Create and append table.
        this.table.parse();
    };

    /**
     * ## ChernoffFaces.buildCanvas
     *
     * Builds the canvas object and face painter
     *
     * All the necessary to draw faces
     *
     * If the canvas was already built, it simply returns it.
     *
     * @return {canvas}
     */
    ChernoffFaces.prototype.buildCanvas = function() {
        var options;
        if (!this.canvas) {
            options = this.options;

            if (!options.canvas) {
                options.canvas = {};
                if ('undefined' !== typeof options.height) {
                    options.canvas.height = options.height;
                }
                if ('undefined' !== typeof options.width) {
                    options.canvas.width = options.width;
                }
            }
            this.canvas = W.getCanvas('ChernoffFaces_canvas', options.canvas);

            // Face Painter.
            this.fp = new FacePainter(this.canvas);
            this.fp.draw(this.features);
        }
    };

    /**
     * ## ChernoffFaces.append
     *
     * Appends the widget
     *
     * Creates table, canvas, face painter (fp) and controls (sc), according
     * to current options.
     *
     * @see ChernoffFaces.buildHTML
     * @see ChernoffFaces.fp
     * @see ChernoffFaces.sc
     * @see ChernoffFaces.table
     * @see Table
     * @see Canvas
     * @see SliderControls
     * @see FacePainter
     * @see FaceVector
     */
    ChernoffFaces.prototype.append = function() {
        if (!this.table) this.buildHTML();
        this.bodyDiv.appendChild(this.table.table);
    };

    /**
     * ### ChernoffFaces.draw
     *
     * Draw a face on canvas and optionally updates the controls
     *
     * Stores the current value of the drawn image under `.features`.
     *
     * @param {object} features The features to draw (If not a complete
     *   set of features, they will be merged with current values)
     * @param {boolean} updateControls Optional. If equal to false,
     *    controls are not updated. Default: true
     *
     * @see ChernoffFaces.sc
     * @see ChernoffFaces.features
     */
    ChernoffFaces.prototype.draw = function(features, updateControls) {
        var time;
        if ('object' !== typeof features) {
            throw new TypeError('ChernoffFaces.draw: features must be object.');
        }
        if (this.options.trackChanges) {
            // Relative time.
            if ('string' === typeof this.timeFrom) {
                time = node.timer.getTimeSince(this.timeFrom);
            }
            // Absolute time.
            else {
                time = Date.now ? Date.now() : new Date().getTime();
            }
            this.changes.push({
                time: time,
                change: features
            });
        };

        // Create a new FaceVector, if features is not one, mixing-in
        // new features and old ones.
        this.features = (features instanceof FaceVector) ? features :
            new FaceVector(features, this.features);

        this.fp.redraw(this.features);
        if (this.sc && (updateControls !== false)) {
            // Without merging wrong values are passed as attributes.
            this.sc.init({
                features: J.mergeOnKey(FaceVector.defaults, features, 'value')
            });
            this.sc.refresh();
        }
    };

    ChernoffFaces.prototype.getValues = function(options) {
        if (options && options.changes) {
            return {
                changes: this.changes,
                cf: this.features
            };
        }
        else {
            return this.fp.face;
        }
    };

     /**
     * ### ChernoffFaces.randomize
     *
     * Draws a random image and updates controls accordingly (if found)
     *
     * @see ChernoffFaces.sc
     */
    ChernoffFaces.prototype.randomize = function() {
        var fv;
        fv = FaceVector.random();
        this.fp.redraw(fv);
        // If controls are visible, updates them.
        if (this.sc) {
            this.sc.init({
                features: J.mergeOnValue(FaceVector.defaults, fv),
                onChange: this.onChange
            });
            this.sc.refresh();
        }
        return true;
    };


    /**
     * # FacePainter
     *
     * Draws faces on a Canvas
     *
     * @param {HTMLCanvas} canvas The canvas
     * @param {object} settings Optional. Settings (not used).
     */
    function FacePainter(canvas, settings) {

        /**
         * ### FacePainter.canvas
         *
         * The wrapper element for the HTML canvas
         *
         * @see Canvas
         */
        this.canvas = new W.Canvas(canvas);

        /**
         * ### FacePainter.scaleX
         *
         * Scales images along the X-axis of this proportion
         */
        this.scaleX = canvas.width / ChernoffFaces.width;

        /**
         * ### FacePainter.scaleX
         *
         * Scales images along the X-axis of this proportion
         */
        this.scaleY = canvas.height / ChernoffFaces.heigth;

        /**
         * ### FacePainter.face
         *
         * The last drawn face
         */
        this.face = null;
    }

    // ## Methods

    /**
     * ### FacePainter.draw
     *
     * Draws a face into the canvas and stores it as reference
     *
     * @param {object} face Multidimensional vector of features
     * @param {number} x Optional. The x-coordinate to center the image.
     *   Default: the center of the canvas
     * @param {number} y Optional. The y-coordinate to center the image.
     *   Default: the center of the canvas
     *
     * @see Canvas
     * @see Canvas.centerX
     * @see Canvas.centerY
     */
    FacePainter.prototype.draw = function(face, x, y) {
        if (!face) return;
        this.face = face;

        this.fit2Canvas(face);
        this.canvas.scale(face.scaleX, face.scaleY);

        //console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );

        x = x || this.canvas.centerX;
        y = y || this.canvas.centerY;

        this.drawHead(face, x, y);

        this.drawEyes(face, x, y);

        this.drawPupils(face, x, y);

        this.drawEyebrow(face, x, y);

        this.drawNose(face, x, y);

        this.drawMouth(face, x, y);
    };

    FacePainter.prototype.redraw = function(face, x, y) {
        this.canvas.clear();
        this.draw(face, x, y);
    };

    FacePainter.prototype.scale = function(x, y) {
        this.canvas.scale(this.scaleX, this.scaleY);
    };

    // TODO: Improve. It eats a bit of the margins
    FacePainter.prototype.fit2Canvas = function(face) {
        var ratio;
        if (!this.canvas) {
            console.log('No canvas found');
            return;
        }

        if (this.canvas.width > this.canvas.height) {
            ratio = this.canvas.width / face.head_radius * face.head_scale_x;
        }
        else {
            ratio = this.canvas.height / face.head_radius * face.head_scale_y;
        }

        face.scaleX = ratio / 2;
        face.scaleY = ratio / 2;
    };

    FacePainter.prototype.drawHead = function(face, x, y) {

        var radius = face.head_radius;

        this.canvas.drawOval({
            x: x,
            y: y,
            radius: radius,
            scale_x: face.head_scale_x,
            scale_y: face.head_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawEyes = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
        var spacing = face.eye_spacing;

        var radius = face.eye_radius;
        //console.log(face);
        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth

        });
        //console.log(face);
        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawPupils = function(face, x, y) {

        var radius = face.pupil_radius;
        var spacing = face.eye_spacing;
        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);

        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawEyebrow = function(face, x, y) {

        var height = FacePainter.computeEyebrowOffset(face,y);
        var spacing = face.eyebrow_spacing;
        var length = face.eyebrow_length;
        var angle = face.eyebrow_angle;

        this.canvas.drawLine({
            x: x - spacing,
            y: height,
            length: length,
            angle: angle,
            color: face.color,
            lineWidth: face.lineWidth


        });

        this.canvas.drawLine({
            x: x + spacing,
            y: height,
            length: 0-length,
            angle: -angle,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawNose = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
        var nastril_r_x = x + face.nose_width / 2;
        var nastril_r_y = height + face.nose_length;
        var nastril_l_x = nastril_r_x - face.nose_width;
        var nastril_l_y = nastril_r_y;

        this.canvas.ctx.lineWidth = face.lineWidth;
        this.canvas.ctx.strokeStyle = face.color;

        this.canvas.ctx.save();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x,height);
        this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
        this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
        //this.canvas.ctx.closePath();
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

    };

    FacePainter.prototype.drawMouth = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
        var startX = x - face.mouth_width / 2;
        var endX = x + face.mouth_width / 2;

        var top_y = height - face.mouth_top_y;
        var bottom_y = height + face.mouth_bottom_y;

        // Upper Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
        this.canvas.ctx.stroke();

        //Lower Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
        this.canvas.ctx.stroke();

    };


    //TODO Scaling ?
    FacePainter.computeFaceOffset = function(face, offset, y) {
        y = y || 0;
        //var pos = y - face.head_radius * face.scaleY +
        //          face.head_radius * face.scaleY * 2 * offset;
        var pos = y - face.head_radius + face.head_radius * 2 * offset;
        //console.log('POS: ' + pos);
        return pos;
    };

    FacePainter.computeEyebrowOffset = function(face, y) {
        y = y || 0;
        var eyemindistance = 2;
        return FacePainter.computeFaceOffset(face, face.eye_height, y) -
            eyemindistance - face.eyebrow_eyedistance;
    };


    /**
     * FaceVector.defaults
     *
     * Numerical description of all the components of a standard Chernoff Face
     */
    FaceVector.defaults = {
        // Head
        head_radius: {
            // id can be specified otherwise is taken head_radius
            min: 10,
            max: 100,
            step: 0.01,
            value: 30,
            label: 'Face radius'
        },
        head_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.5,
            label: 'Scale head horizontally'
        },
        head_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale head vertically'
        },
        // Eye
        eye_height: {
            min: 0.1,
            max: 0.9,
            step: 0.01,
            value: 0.4,
            label: 'Eye height'
        },
        eye_radius: {
            min: 2,
            max: 30,
            step: 0.01,
            value: 5,
            label: 'Eye radius'
        },
        eye_spacing: {
            min: 0,
            max: 50,
            step: 0.01,
            value: 10,
            label: 'Eye spacing'
        },
        eye_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes horizontally'
        },
        eye_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes vertically'
        },
        // Pupil
        pupil_radius: {
            min: 1,
            max: 9,
            step: 0.01,
            value: 1,  //this.eye_radius;
            label: 'Pupil radius'
        },
        pupil_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils horizontally'
        },
        pupil_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils vertically'
        },
        // Eyebrow
        eyebrow_length: {
            min: 1,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Eyebrow length'
        },
        eyebrow_eyedistance: {
            min: 0.3,
            max: 10,
            step: 0.01,
            value: 3, // From the top of the eye
            label: 'Eyebrow from eye'
        },
        eyebrow_angle: {
            min: -2,
            max: 2,
            step: 0.01,
            value: -0.5,
            label: 'Eyebrow angle'
        },
        eyebrow_spacing: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 5,
            label: 'Eyebrow spacing'
        },
        // Nose
        nose_height: {
            min: 0.4,
            max: 1,
            step: 0.01,
            value: 0.4,
            label: 'Nose height'
        },
        nose_length: {
            min: 0.2,
            max: 30,
            step: 0.01,
            value: 15,
            label: 'Nose length'
        },
        nose_width: {
            min: 0,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Nose width'
        },
        // Mouth
        mouth_height: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.75,
            label: 'Mouth height'
        },
        mouth_width: {
            min: 2,
            max: 100,
            step: 0.01,
            value: 20,
            label: 'Mouth width'
        },
        mouth_top_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: -2,
            label: 'Upper lip'
        },
        mouth_bottom_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: 20,
            label: 'Lower lip'
        },

        scaleX: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 0.2,
            label: 'Scale X'
        },

        scaleY: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 0.2,
            label: 'Scale Y'
        },

        color: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 0.2,
            label: 'color'
        },

        lineWidth: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 0.2,
            label: 'lineWidth'
        }

    };

    // Compute range for each feature.
    (function(defaults) {
        var key;
        for (key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                defaults[key].range = defaults[key].max - defaults[key].min;
            }
        }
    })(FaceVector.defaults);

    // Constructs a random face vector.
    FaceVector.random = function() {
        console.log('*** FaceVector.random is deprecated. ' +
                    'Use new FaceVector() instead.');
        return new FaceVector();
    };

    function FaceVector(faceVector, defaults) {
        var key;
        // Make random vector.
        if ('undefined' === typeof faceVector) {
            for (key in FaceVector.defaults) {
                if (FaceVector.defaults.hasOwnProperty(key)) {
                    if (key === 'color') {
                        this.color = 'red';
                    }
                    else if (key === 'lineWidth') {
                        this.lineWidth = 1;
                    }
                    else if (key === 'scaleX') {
                        this.scaleX = 1;
                    }
                    else if (key === 'scaleY') {
                        this.scaleY = 1;
                    }
                    else {
                        this[key] = FaceVector.defaults[key].min +
                            Math.random() * FaceVector.defaults[key].range;
                    }
                }
            }
        }
        // Mixin values.
        else if ('object' === typeof faceVector) {

            this.scaleX = faceVector.scaleX || 1;
            this.scaleY = faceVector.scaleY || 1;

            this.color = faceVector.color || 'green';
            this.lineWidth = faceVector.lineWidth || 1;

            defaults = defaults || FaceVector.defaults;

            // Merge on key.
            for (key in defaults) {
                if (defaults.hasOwnProperty(key)){
                    if (faceVector.hasOwnProperty(key)) {
                        this[key] = faceVector[key];
                    }
                    else {
                        this[key] = defaults ? defaults[key] :
                            FaceVector.defaults[key].value;
                    }
                }
            }
        }
        else {
            throw new TypeError('FaceVector constructor: faceVector must be ' +
                                'object or undefined.');
        }
    }

//     //Constructs a random face vector.
//     FaceVector.prototype.shuffle = function() {
//         for (var key in this) {
//             if (this.hasOwnProperty(key)) {
//                 if (FaceVector.defaults.hasOwnProperty(key)) {
//                     if (key !== 'color') {
//                         this[key] = FaceVector.defaults[key].min +
//                             Math.random() * FaceVector.defaults[key].max;
//                     }
//                 }
//             }
//         }
//     };

//     //Computes the Euclidean distance between two FaceVectors.
//     FaceVector.prototype.distance = function(face) {
//         return FaceVector.distance(this, face);
//     };
//
//
//     FaceVector.distance = function(face1, face2) {
//         var sum = 0.0;
//         var diff;
//
//         for (var key in face1) {
//             if (face1.hasOwnProperty(key)) {
//                 diff = face1[key] - face2[key];
//                 sum = sum + diff * diff;
//             }
//         }
//
//         return Math.sqrt(sum);
//     };
//
//     FaceVector.prototype.toString = function() {
//         var out = 'Face: ';
//         for (var key in this) {
//             if (this.hasOwnProperty(key)) {
//                 out += key + ' ' + this[key];
//             }
//         }
//         return out;
//     };

})(node);

/**
 * # ChernoffFacesSimple
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = node.window.Table;

    node.widgets.register('ChernoffFacesSimple', ChernoffFaces);

    // ## Defaults

    ChernoffFaces.defaults = {};
    ChernoffFaces.defaults.id = 'ChernoffFaces';
    ChernoffFaces.defaults.canvas = {};
    ChernoffFaces.defaults.canvas.width = 100;
    ChernoffFaces.defaults.canvas.heigth = 100;

    // ## Meta-data

    ChernoffFaces.version = '0.3';
    ChernoffFaces.description =
        'Display parametric data in the form of a Chernoff Face.';

    // ## Dependencies
    ChernoffFaces.dependencies = {
        JSUS: {},
        Table: {},
        Canvas: {},
        'Controls.Slider': {}
    };

    ChernoffFaces.FaceVector = FaceVector;
    ChernoffFaces.FacePainter = FacePainter;

    function ChernoffFaces (options) {
        this.options = options;
        this.id = options.id;
        this.table = new Table({id: 'cf_table'});
        this.root = options.root || document.createElement('div');
        this.root.id = this.id;

        this.sc = node.widgets.get('Controls.Slider');  // Slider Controls
        this.fp = null;         // Face Painter
        this.canvas = null;
        this.dims = null;       // width and height of the canvas

        this.change = 'CF_CHANGE';
        var that = this;
        this.changeFunc = function() {
            that.draw(that.sc.getAllValues());
        };

        this.features = null;
        this.controls = null;

        this.init(this.options);
    }

    ChernoffFaces.prototype.init = function(options) {
        this.id = options.id || this.id;
        var PREF = this.id + '_';

        this.features = options.features || this.features ||
            FaceVector.random();

        this.controls = ('undefined' !== typeof options.controls) ?
                        options.controls : true;

        var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';

        this.dims = {
            width:  options.width ?
                options.width : ChernoffFaces.defaults.canvas.width,
            height: options.height ?
                options.height : ChernoffFaces.defaults.canvas.heigth
        };

        this.canvas = node.window.getCanvas(idCanvas, this.dims);
        this.fp = new FacePainter(this.canvas);
        this.fp.draw(new FaceVector(this.features));

        var sc_options = {
            id: 'cf_controls',
            features:
                JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
            change: this.change,
            fieldset: {id: this.id + '_controls_fieldest',
                       legend: this.controls.legend || 'Controls'
                      },
            submit: 'Send'
        };

        this.sc = node.widgets.get('Controls.Slider', sc_options);

        // Controls are always there, but may not be visible
        if (this.controls) {
            this.table.add(this.sc);
        }

        // Dealing with the onchange event
        if ('undefined' === typeof options.change) {
            node.on(this.change, this.changeFunc);
        } else {
            if (options.change) {
                node.on(options.change, this.changeFunc);
            }
            else {
                node.removeListener(this.change, this.changeFunc);
            }
            this.change = options.change;
        }


        this.table.add(this.canvas);
        this.table.parse();
        this.root.appendChild(this.table.table);
    };

    ChernoffFaces.prototype.getRoot = function() {
        return this.root;
    };

    ChernoffFaces.prototype.getCanvas = function() {
        return this.canvas;
    };

    ChernoffFaces.prototype.append = function(root) {
        root.appendChild(this.root);
        this.table.parse();
        return this.root;
    };

    ChernoffFaces.prototype.listeners = function() {};

    ChernoffFaces.prototype.draw = function(features) {
        if (!features) return;
        var fv = new FaceVector(features);
        this.fp.redraw(fv);
        // Without merging wrong values are passed as attributes
        this.sc.init({
            features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')
        });
        this.sc.refresh();
    };

    ChernoffFaces.prototype.getAllValues = function() {
        //if (this.sc) return this.sc.getAllValues();
        return this.fp.face;
    };

    ChernoffFaces.prototype.randomize = function() {
        var fv = FaceVector.random();
        this.fp.redraw(fv);

        var sc_options = {
            features: JSUS.mergeOnKey(FaceVector.defaults, fv, 'value'),
            change: this.change
        };
        this.sc.init(sc_options);
        this.sc.refresh();

        return true;
    };

    // FacePainter
    // The class that actually draws the faces on the Canvas
    function FacePainter(canvas, settings) {
        this.canvas = new node.window.Canvas(canvas);
        this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
        this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
    }

    // Draws a Chernoff face.
    FacePainter.prototype.draw = function(face, x, y) {
        if (!face) return;
        this.face = face;
        this.fit2Canvas(face);
        this.canvas.scale(face.scaleX, face.scaleY);

        //console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );

        var x = x || this.canvas.centerX;
        var y = y || this.canvas.centerY;

        this.drawHead(face, x, y);

        this.drawEyes(face, x, y);

        this.drawPupils(face, x, y);

        this.drawEyebrow(face, x, y);

        this.drawNose(face, x, y);

        this.drawMouth(face, x, y);

    };

    FacePainter.prototype.redraw = function(face, x, y) {
        this.canvas.clear();
        this.draw(face,x,y);
    };

    FacePainter.prototype.scale = function(x, y) {
        this.canvas.scale(this.scaleX, this.scaleY);
    };

    // TODO: Improve. It eats a bit of the margins
    FacePainter.prototype.fit2Canvas = function(face) {
        var ratio;
        if (!this.canvas) {
            console.log('No canvas found');
            return;
        }

        if (this.canvas.width > this.canvas.height) {
            ratio = this.canvas.width / face.head_radius * face.head_scale_x;
        }
        else {
            ratio = this.canvas.height / face.head_radius * face.head_scale_y;
        }

        face.scaleX = ratio / 2;
        face.scaleY = ratio / 2;
    };

    FacePainter.prototype.drawHead = function(face, x, y) {

        var radius = face.head_radius;

        this.canvas.drawOval({
            x: x,
            y: y,
            radius: radius,
            scale_x: face.head_scale_x,
            scale_y: face.head_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawEyes = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
        var spacing = face.eye_spacing;

        var radius = face.eye_radius;
        //console.log(face);
        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth

        });
        //console.log(face);
        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawPupils = function(face, x, y) {

        var radius = face.pupil_radius;
        var spacing = face.eye_spacing;
        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);

        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawEyebrow = function(face, x, y) {

        var height = FacePainter.computeEyebrowOffset(face,y);
        var spacing = face.eyebrow_spacing;
        var length = face.eyebrow_length;
        var angle = face.eyebrow_angle;

        this.canvas.drawLine({
            x: x - spacing,
            y: height,
            length: length,
            angle: angle,
            color: face.color,
            lineWidth: face.lineWidth


        });

        this.canvas.drawLine({
            x: x + spacing,
            y: height,
            length: 0-length,
            angle: -angle,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawNose = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
        var nastril_r_x = x + face.nose_width / 2;
        var nastril_r_y = height + face.nose_length;
        var nastril_l_x = nastril_r_x - face.nose_width;
        var nastril_l_y = nastril_r_y;

        this.canvas.ctx.lineWidth = face.lineWidth;
        this.canvas.ctx.strokeStyle = face.color;

        this.canvas.ctx.save();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x,height);
        this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
        this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
        //this.canvas.ctx.closePath();
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

    };

    FacePainter.prototype.drawMouth = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
        var startX = x - face.mouth_width / 2;
        var endX = x + face.mouth_width / 2;

        var top_y = height - face.mouth_top_y;
        var bottom_y = height + face.mouth_bottom_y;

        // Upper Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
        this.canvas.ctx.stroke();

        //Lower Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
        this.canvas.ctx.stroke();

    };


    //TODO Scaling ?
    FacePainter.computeFaceOffset = function(face, offset, y) {
        var y = y || 0;
        //var pos = y - face.head_radius * face.scaleY +
        //          face.head_radius * face.scaleY * 2 * offset;
        var pos = y - face.head_radius + face.head_radius * 2 * offset;
        //console.log('POS: ' + pos);
        return pos;
    };

    FacePainter.computeEyebrowOffset = function(face, y) {
        var y = y || 0;
        var eyemindistance = 2;
        return FacePainter.computeFaceOffset(face, face.eye_height, y) -
            eyemindistance - face.eyebrow_eyedistance;
    };


    /*!
     *
     * A description of a Chernoff Face.
     *
     * This class packages the 11-dimensional vector of numbers from 0 through
     * 1 that completely describe a Chernoff face.
     *
     */


    FaceVector.defaults = {
        // Head
        head_radius: {
            // id can be specified otherwise is taken head_radius
            min: 10,
            max: 100,
            step: 0.01,
            value: 30,
            label: 'Face radius'
        },
        head_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.5,
            label: 'Scale head horizontally'
        },
        head_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale head vertically'
        },
        // Eye
        eye_height: {
            min: 0.1,
            max: 0.9,
            step: 0.01,
            value: 0.4,
            label: 'Eye height'
        },
        eye_radius: {
            min: 2,
            max: 30,
            step: 0.01,
            value: 5,
            label: 'Eye radius'
        },
        eye_spacing: {
            min: 0,
            max: 50,
            step: 0.01,
            value: 10,
            label: 'Eye spacing'
        },
        eye_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes horizontally'
        },
        eye_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes vertically'
        },
        // Pupil
        pupil_radius: {
            min: 1,
            max: 9,
            step: 0.01,
            value: 1,  //this.eye_radius;
            label: 'Pupil radius'
        },
        pupil_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils horizontally'
        },
        pupil_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils vertically'
        },
        // Eyebrow
        eyebrow_length: {
            min: 1,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Eyebrow length'
        },
        eyebrow_eyedistance: {
            min: 0.3,
            max: 10,
            step: 0.01,
            value: 3, // From the top of the eye
            label: 'Eyebrow from eye'
        },
        eyebrow_angle: {
            min: -2,
            max: 2,
            step: 0.01,
            value: -0.5,
            label: 'Eyebrow angle'
        },
        eyebrow_spacing: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 5,
            label: 'Eyebrow spacing'
        },
        // Nose
        nose_height: {
            min: 0.4,
            max: 1,
            step: 0.01,
            value: 0.4,
            label: 'Nose height'
        },
        nose_length: {
            min: 0.2,
            max: 30,
            step: 0.01,
            value: 15,
            label: 'Nose length'
        },
        nose_width: {
            min: 0,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Nose width'
        },
        // Mouth
        mouth_height: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.75,
            label: 'Mouth height'
        },
        mouth_width: {
            min: 2,
            max: 100,
            step: 0.01,
            value: 20,
            label: 'Mouth width'
        },
        mouth_top_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: -2,
            label: 'Upper lip'
        },
        mouth_bottom_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: 20,
            label: 'Lower lip'
        }
    };

    //Constructs a random face vector.
    FaceVector.random = function() {
        var out = {};
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)) {
                if (!JSUS.in_array(key,
                            ['color', 'lineWidth', 'scaleX', 'scaleY'])) {

                    out[key] = FaceVector.defaults[key].min +
                        Math.random() * FaceVector.defaults[key].max;
                }
            }
        }

        out.scaleX = 1;
        out.scaleY = 1;

        out.color = 'green';
        out.lineWidth = 1;

        return new FaceVector(out);
    };

    function FaceVector(faceVector) {
        faceVector = faceVector || {};

        this.scaleX = faceVector.scaleX || 1;
        this.scaleY = faceVector.scaleY || 1;


        this.color = faceVector.color || 'green';
        this.lineWidth = faceVector.lineWidth || 1;

        // Merge on key
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)){
                if (faceVector.hasOwnProperty(key)){
                    this[key] = faceVector[key];
                }
                else {
                    this[key] = FaceVector.defaults[key].value;
                }
            }
        }

    }

    //Constructs a random face vector.
    FaceVector.prototype.shuffle = function() {
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                if (FaceVector.defaults.hasOwnProperty(key)) {
                    if (key !== 'color') {
                        this[key] = FaceVector.defaults[key].min +
                            Math.random() * FaceVector.defaults[key].max;
                    }
                }
            }
        }
    };

    //Computes the Euclidean distance between two FaceVectors.
    FaceVector.prototype.distance = function(face) {
        return FaceVector.distance(this,face);
    };


    FaceVector.distance = function(face1, face2) {
        var sum = 0.0;
        var diff;

        for (var key in face1) {
            if (face1.hasOwnProperty(key)) {
                diff = face1[key] - face2[key];
                sum = sum + diff * diff;
            }
        }

        return Math.sqrt(sum);
    };

    FaceVector.prototype.toString = function() {
        var out = 'Face: ';
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                out += key + ' ' + this[key];
            }
        }
        return out;
    };

})(node);

/**
 * # ChoiceManager
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manages a set of selectable choices forms (e.g. ChoiceTable).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceManager', ChoiceManager);

    // ## Meta-data

    ChoiceManager.version = '1.0.0';
    ChoiceManager.description = 'Groups together and manages a set of ' +
        'selectable choices forms (e.g. ChoiceTable).';

    ChoiceManager.title = 'Complete the forms below';
    ChoiceManager.className = 'choicemanager';

    // ## Dependencies

    ChoiceManager.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceManager constructor
     *
     * Creates a new instance of ChoiceManager
     */
    function ChoiceManager() {
        var that;
        that = this;

        /**
         * ### ChoiceManager.dl
         *
         * The clickable list containing all the forms
         */
        this.dl = null;

        /**
         * ### ChoiceManager.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceManager.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceManager.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceManager.forms
         *
         * The array available forms
         */
        this.forms = null;

        /**
         * ### ChoiceManager.order
         *
         * The order of the forms as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceManager.shuffleForms
         *
         * TRUE, if forms have been shuffled
         */
        this.shuffleForms = null;

        /**
         * ### ChoiceManager.group
         *
         * The name of the group where the list belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceManager.groupOrder
         *
         * The order of the list within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceManager.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceManager.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;
    }

    // ## ChoiceManager methods

    /**
     * ### ChoiceManager.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the list (string, array), or false
     *       to have none.
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the list in the group, if any
     *   - mainText: a text to be displayed above the list
     *   - shuffleForms: if TRUE, forms are shuffled before being added
     *       to the list
     *   - freeText: if TRUE, a textarea will be added under the list,
     *       if 'string', the text will be added inside the the textarea
     *   - forms: the forms to displayed, formatted as explained in
     *       `ChoiceManager.setForms`
     *
     * @param {object} options Configuration options
     *
     * @see ChoiceManager.setForms
     */
    ChoiceManager.prototype.init = function(options) {
        var tmp, that;
        that = this;

        // Option shuffleForms, default false.
        if ('undefined' === typeof options.shuffleForms) tmp = false;
        else tmp = !!options.shuffleForms;
        this.shuffleForms = tmp;


        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceManager.init: options.mainText must ' +
                                'be string, undefined. Found: ' +
                                options.mainText);
        }

        // After all configuration options are evaluated, add forms.

        this.freeText = 'string' === typeof options.freeText ?
            options.freeText : !!options.freeText;

        // Add the forms.
        if ('undefined' !== typeof options.forms) {
            this.setForms(options.forms);
        }
    };

    /**
     * ### ChoiceManager.setForms
     *
     * Sets the available forms
     *
     * Each form element can be:
     *
     *   - an instantiated widget
     *   - a "widget-like" element (`append` and `getValues` methods must exist)
     *   - an object with the `name` of the widget and optional settings, e.g.:
     *
     *  ```
     *     {
     *        name: 'ChoiceTable',
     *        mainText: 'Did you commit the crime?',
     *        choices: [ 'Yes', 'No' ],
     *     }
     *  ```
     *
     * @param {array|function} forms The array of forms or a function
     *   returning an array of forms
     *
     * @see ChoiceManager.order
     * @see ChoiceManager.isWidget
     * @see ChoiceManager.shuffleForms
     * @see ChoiceManager.buildForms
     * @see ChoiceManager.buildTableAndForms
     */
    ChoiceManager.prototype.setForms = function(forms) {
        var form, i, len, parsedForms;
        if ('function' === typeof forms) {
            parsedForms = forms.call(node.game);
            if (!J.isArray(parsedForms)) {
                throw new TypeError('ChoiceManager.setForms: forms is a ' +
                                    'callback, but did not returned an ' +
                                    'array. Found: ' + parsedForms);
            }
        }
        else if (J.isArray(forms)) {
            parsedForms = forms;
        }
        else {
            throw new TypeError('ChoiceManager.setForms: forms must be array ' +
                                'or function. Found: ' + forms);
        }

        len = parsedForms.length;
        if (!len) {
            throw new Error('ChoiceManager.setForms: forms is an empty array.');
        }

        // Manual clone forms.
        forms = new Array(len);
        i = -1;
        for ( ; ++i < len ; ) {
            form = parsedForms[i];
            if (!node.widgets.isWidget(form)) {
                if ('string' === typeof form.name) {
                    form = node.widgets.get(form.name, form);
                }
                if (!node.widgets.isWidget(form)) {
                    throw new Error('ChoiceManager.buildDl: one of the forms ' +
                                    'is not a widget-like element: ' +
                                    parsedForms[i]);
                }
            }
            forms[i] = form;
        }
        // Assigned verified forms.
        this.forms = forms;

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleForms) this.order = J.shuffle(this.order);
    };

    /**
     * ### ChoiceManager.buildDl
     *
     * Builds the list of all forms
     *
     * Must be called after forms have been set already.
     *
     * @see ChoiceManager.setForms
     * @see ChoiceManager.order
     */
    ChoiceManager.prototype.buildDl = function() {
        var i, len, dl, dt;
        var form;

        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            dt = document.createElement('dt');
            dt.className = 'question';
            form = this.forms[this.order[i]];
            node.widgets.append(form, dt);
            this.dl.appendChild(dt);
        }
    };

    ChoiceManager.prototype.append = function() {
        var tmp;
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('ChoiceManager.append: id is not ' +
                            'unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = ChoiceManager.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            // Append mainText.
            this.bodyDiv.appendChild(this.spanMainText);
        }

        // Dl.
        this.dl = document.createElement('dl');
        this.buildDl();
        // Append Dl.
        this.bodyDiv.appendChild(this.dl);

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            tmp = this.className ? this.className + '-freetext' : 'freetext';
            this.textarea.className = tmp;
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### ChoiceManager.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * @see Widget.listeners
     */
    ChoiceManager.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceManager.disable
     *
     * Disables all forms
     */
    ChoiceManager.prototype.disable = function() {
        var i, len;
        if (this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].disable();
        }
    };

    /**
     * ### ChoiceManager.enable
     *
     * Enables all forms
     */
    ChoiceManager.prototype.enable = function() {
        var i, len;
        if (!this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].disable();
        }
    };

    /**
     * ### ChoiceManager.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * @param {boolean} markAttempt Optional. If TRUE, the value of
     *   current choice is added to the attempts array. Default
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     * @see ChoiceManager.attempts
     * @see ChoiceManager.setCorrectChoice
     */
    ChoiceManager.prototype.verifyChoice = function(markAttempt) {
        var i, len, obj, form;
        obj = {
            id: this.id,
            order: this.order,
            forms: {}
        };
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            form = this.forms[i];
            obj.forms[form.id] = form.verifyChoice(markAttempt);
            if (!obj.form[form.id]) obj.fail = true;
        }
        return obj;
    };

    /**
     * ### ChoiceManager.setCurrentChoice
     *
     * Marks a choice as current in each form
     *
     * If the item allows it, multiple choices can be set as current.
     *
     * @param {number|string} The choice to mark as current
     */
    ChoiceManager.prototype.setCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.forms[i].length;
        for ( ; ++i < len ; ) {
            this.forms[i].setCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceManager.unsetCurrentChoice
     *
     * Deletes the value for currentChoice in each form
     *
     * If `ChoiceManager.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete
     *   when multiple selections are allowed
     */
    ChoiceManager.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.forms[i].length;
        for ( ; ++i < len ; ) {
            this.forms[i].unsetCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceManager.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the dl's border.
     *   Default '1px solid red'
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.highlight = function(border) {
        if (!this.dl) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceManager.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.dl.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceManager.unhighlight
     *
     * Removes highlight from the choice dl
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.unhighlight = function() {
        if (!this.dl) return;
        this.dl.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceManager.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *      to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, forms that do not have a correct value
     *      will be highlighted. Default: FALSE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceManager.verifyChoice
     */
    ChoiceManager.prototype.getValues = function(opts) {
        var obj, i, len, form;
        obj = {
            id: this.id,
            order: this.order,
            forms: {},
            missValues: []
        };
        opts = opts || {};
        if (opts.markAttempt) obj.isCorrect = true;
        opts = opts || {};
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            form = this.forms[i]
            obj.forms[form.id] = form.getValues(opts);
            if (obj.forms[form.id].choice === null) {
                obj.missValues.push(form.id);
            }
            if (opts.markAttempt && !obj.forms[form.id].isCorrect) {
                obj.isCorrect = false;
            }
        }
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    /**
     * ### ChoiceManager.setValues
     *
     * Sets values for forms in manager as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     */
    ChoiceManager.prototype.setValues = function(opts) {
        var i, len;
        if (!this.forms || !this.forms.length) {
            throw new Error('ChoiceManager.setValues: no forms found.');
        }
        opts = opts || {};
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].setValues(opts);
        }

        // Make a random comment.
        if (this.textarea) this.textarea.value = J.randomString(100, '!Aa0');
    };

    // ## Helper methods.

})(node);

/**
 * # ChoiceTable
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable table where each cell is a selectable choice
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceTable', ChoiceTable);

    // ## Meta-data

    ChoiceTable.version = '1.2.0';
    ChoiceTable.description = 'Creates a configurable table where ' +
        'each cell is a selectable choice.';

    ChoiceTable.title = 'Make your choice';
    ChoiceTable.className = 'choicetable';

    ChoiceTable.separator = '::';

    // ## Dependencies

    ChoiceTable.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceTable constructor
     *
     * Creates a new instance of ChoiceTable
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as the clickable
     *   table. All other options are passed to the init method.
     */
    function ChoiceTable(options) {
        var that;
        that = this;

        /**
         * ### ChoiceTable.table
         *
         * The HTML element triggering the listener function when clicked
         */
        this.table = null;

        /**
         * ### ChoiceTable.tr
         *
         * Reference to TR elements of the table
         *
         * Note: if the orientation is vertical there will be multiple TR
         * otherwise just one.
         *
         * @see createTR
         */
        this.trs = [];

        /**
         * ### ChoiceTable.listener
         *
         * The listener function
         */
        this.listener = function(e) {
            var name, value, td, oldSelected;

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            e = e || window.event;
            td = e.target || e.srcElement;

            // Not a clickable choice.
            if ('undefined' === typeof that.choicesIds[td.id]) return;

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split(that.separator);

            // Separator not found, not a clickable cell.
            if (value.length === 1) return;

            name = value[0];
            value = value[1];

            // One more click.
            that.numberOfClicks++;

            // If only 1 selection allowed, remove selection from oldSelected.
            if (!that.selectMultiple) {
                oldSelected = that.selected;
                if (oldSelected) J.removeClass(oldSelected, 'selected');

                if (that.isChoiceCurrent(value)) {
                    that.unsetCurrentChoice(value);
                }
                else {
                    that.currentChoice = value;
                    J.addClass(td, 'selected');
                    that.selected = td;
                }
            }

            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        /**
         * ### ChoiceTable.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceTable.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceTable.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceTable.choices
         *
         * The array available choices
         */
        this.choices = null;

        /**
         * ### ChoiceTable.choicesValues
         *
         * Map of choices' values to indexes in the choices array
         */
        this.choicesValues = {};

        /**
         * ### ChoiceTable.choicesIds
         *
         * Map of choices' cells ids to choices
         *
         * Used to determine what are the clickable choices.
         */
        this.choicesIds = {};

        /**
         * ### ChoiceTable.choicesCells
         *
         * The cells of the table associated with each choice
         */
        this.choicesCells = null;

        /**
         * ### ChoiceTable.left
         *
         * A non-clickable first cell of the row/column
         *
         * It will be placed to the left of the choices if orientation
         * is horizontal, or above the choices if orientation is vertical
         *
         * @see ChoiceTable.orientation
         */
        this.left = null;

        /**
         * ### ChoiceTable.leftCell
         *
         * The rendered left cell
         *
         * @see ChoiceTable.renderSpecial
         */
        this.leftCell = null;

        /**
         * ### ChoiceTable.right
         *
         * A non-clickable last cell of the row/column
         *
         * It will be placed to the right of the choices if orientation
         * is horizontal, or below the choices if orientation is vertical
         *
         * @see ChoiceTable.orientation
         */
        this.right = null;

        /**
         * ### ChoiceTable.rightCell
         *
         * The rendered right cell
         *
         * @see ChoiceTable.renderSpecial
         */
        this.rightCell = null;

        /**
         * ### ChoiceTable.timeCurrentChoice
         *
         * Time when the last choice was made
         */
        this.timeCurrentChoice = null;

        /**
         * ### ChoiceTable.timeFrom
         *
         * Time is measured from timestamp as saved by node.timer
         *
         * Default event is a new step is loaded (user can interact with
         * the screen). Set it to FALSE, to have absolute time.
         *
         * @see node.timer.getTimeSince
         */
        this.timeFrom = 'step';

        /**
         * ### ChoiceTable.order
         *
         * The order of the choices as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceTable.correctChoice
         *
         * The array of correct choice/s
         *
         * The field is an array or number|string depending
         * on the value of ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selectMultiple
         */
        this.correctChoice = null;

        /**
         * ### ChoiceTable.requiredChoice
         *
         * The number of required choices. Default 0
         */
        this.requiredChoice = null;

        /**
         * ### ChoiceTable.attempts
         *
         * List of currentChoices at the moment of verifying correct answers
         */
        this.attempts = [];

        /**
         * ### ChoiceTable.numberOfClicks
         *
         * Total number of clicks on different choices
         */
        this.numberOfClicks = 0;

        /**
         * ### ChoiceTable.selected
         *
         * Currently selected cell/s
         *
         * @see ChoiceTable.currentChoice
         */
        this.selected = null;

        /**
         * ### ChoiceTable.currentChoice
         *
         * Choice/s associated with currently selected cell/s
         *
         * The field is an array or number|string depending
         * on the value of ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selected
         */
        this.currentChoice = null;

        /**
         * ### ChoiceTable.selectMultiple
         *
         * If TRUE, it allows to select multiple cells
         */
        this.selectMultiple = null;

        /**
         * ### ChoiceTable.shuffleChoices
         *
         * If TRUE, choices are randomly assigned to cells
         *
         * @see ChoiceTable.order
         */
        this.shuffleChoices = null;

        /**
         * ### ChoiceTable.renderer
         *
         * A callback that renders the content of each cell
         *
         * The callback must accept three parameters:
         *
         *   - a td HTML element,
         *   - a choice
         *   - the index of the choice element within the choices array
         *
         * and optionally return the _value_ for the choice (otherwise
         * the order in the choices array is used as value).
         */
        this.renderer = null;

        /**
         * ### ChoiceTable.orientation
         *
         * Orientation of display of choices: vertical ('V') or horizontal ('H')
         *
         * Default orientation is horizontal.
         */
        this.orientation = 'H';

        /**
         * ### ChoiceTable.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceTable.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceTable.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceTable.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        /**
         * ### ChoiceTable.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default ChoiceTable.separator
         *
         * @see ChoiceTable.renderChoice
         */
        this.separator = ChoiceTable.separator;
    }

    // ## ChoiceTable methods

    /**
     * ### ChoiceTable.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - left: the content of the left (or top) cell
     *   - right: the content of the right (or bottom) cell
     *   - className: the className of the table (string, array), or false
     *       to have none.
     *   - orientation: orientation of the table: vertical (v) or horizontal (h)
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the table in the group, if any
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - choices: the array of available choices. See
     *       `ChoiceTable.renderChoice` for info about the format
     *   - correctChoice: the array|number|string of correct choices. See
     *       `ChoiceTable.setCorrectChoice` for info about the format
     *   - selectMultiple: if TRUE multiple cells can be selected
     *   - shuffleChoices: if TRUE, choices are shuffled before being added
     *       to the table
     *   - renderer: a function that will render the choices. See
     *       ChoiceTable.renderer for info about the format
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Configuration options
     */
    ChoiceTable.prototype.init = function(options) {
        var tmp, that;
        that = this;

        if (!this.id) {
            throw new TypeError('ChoiceTable.init: options.id is missing.');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof options.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof options.orientation) {
            throw new TypeError('ChoiceTable.init: options.orientation must ' +
                                'be string, or undefined. Found: ' +
                                options.orientation);
        }
        else {
            tmp = options.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('ChoiceTable.init: options.orientation is ' +
                                'invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleChoices, default false.
        if ('undefined' === typeof options.shuffleChoices) tmp = false;
        else tmp = !!options.shuffleChoices;
        this.shuffleChoices = tmp;

        // Option selectMultiple, default false.
        if ('undefined' === typeof options.selectMultiple) tmp = false;
        else tmp = !!options.selectMultiple;
        this.selectMultiple = tmp;

        // Option requiredChoice, if any.
        if ('number' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice;
        }
        else if ('boolean' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice ? 1 : 0;
        }
        else if ('undefined' !== typeof options.requiredChoice) {
            throw new TypeError('ChoiceTable.init: options.requiredChoice ' +
                                'be number or boolean or undefined. Found: ' +
                                options.requiredChoice);
        }

        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTable.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTable.init: options.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the onclick listener, if any.
        if ('function' === typeof options.onclick) {
            this.listener = function(e) {
                options.onclick.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.onclick) {
            throw new TypeError('ChoiceTable.init: options.onclick must ' +
                                'be function or undefined. Found: ' +
                                options.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceTable.init: options.mainText must ' +
                                'be string or undefined. Found: ' +
                                options.mainText);
        }

        // Set the timeFrom, if any.
        if (options.timeFrom === false ||
            'string' === typeof options.timeFrom) {

            this.timeFrom = options.timeFrom;
        }
        else if ('undefined' !== typeof options.timeFrom) {
            throw new TypeError('ChoiceTable.init: options.timeFrom must ' +
                                'be string, false, or undefined. Found: ' +
                                options.timeFrom);
        }

        // Set the separator, if any.
        if ('string' === typeof options.separator) {
            this.separator = options.separator;
        }
        else if ('undefined' !== typeof options.separator) {
            throw new TypeError('ChoiceTable.init: options.separator must ' +
                                'be string, or undefined. Found: ' +
                                options.separator);
        }

        // Conflict might be generated by id or seperator,
        // as specified by user.
        if (this.id.indexOf(options.separator) !== -1) {
            throw new Error('ChoiceTable.init: options.separator ' +
                            'cannot be a sequence of characters ' +
                            'included in the table id. Found: ' +
                            options.separator);
        }

        if ('string' === typeof options.left ||
            'number' === typeof options.left) {

            this.left = '' + options.left;
        }
        else if(J.isNode(options.left) ||
                J.isElement(options.left)) {

            this.left = options.left;
        }
        else if ('undefined' !== typeof options.left) {
            throw new TypeError('ChoiceTable.init: options.left must ' +
                                'be string, number, an HTML Element or ' +
                                'undefined. Found: ' + options.left);
        }

        if ('string' === typeof options.right ||
            'number' === typeof options.right) {

            this.right = '' + options.right;
        }
        else if(J.isNode(options.right) ||
                J.isElement(options.right)) {

            this.right = options.right;
        }
        else if ('undefined' !== typeof options.right) {
            throw new TypeError('ChoiceTable.init: options.right must ' +
                                'be string, number, an HTML Element or ' +
                                'undefined. Found: ' + options.right);
        }


        // Set the className, if not use default.
        if ('undefined' === typeof options.className) {
            this.className = ChoiceTable.className;
        }
        else if (options.className === false ||
                 'string' === typeof options.className ||
                 J.isArray(options.className)) {

            this.className = options.className;
        }
        else {
            throw new TypeError('ChoiceTable.init: options.' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + options.className);
        }

        // Set the renderer, if any.
        if ('function' === typeof options.renderer) {
            this.renderer = options.renderer;
        }
        else if ('undefined' !== typeof options.renderer) {
            throw new TypeError('ChoiceTable.init: options.renderer must ' +
                                'be function or undefined. Found: ' +
                                options.renderer);
        }

        // After all configuration options are evaluated, add choices.

        // Set table.
        if ('object' === typeof options.table) {
            this.table = options.table;
        }
        else if ('undefined' !== typeof options.table &&
                 false !== options.table) {

            throw new TypeError('ChoiceTable.init: options.table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + options.table);
        }

        this.table = options.table;

        this.freeText = 'string' === typeof options.freeText ?
            options.freeText : !!options.freeText;

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.setChoices(options.choices);
        }

        // Add the correct choices.
        if ('undefined' !== typeof options.correctChoice) {
            if (this.requiredChoice) {
                throw new Error('ChoiceTable.init: cannot specify both ' +
                                'options requiredChoice and correctChoice.');
            }
            this.setCorrectChoice(options.correctChoice);
        }
    };

    /**
     * ### ChoiceTable.setChoices
     *
     * Sets the available choices and optionally builds the table
     *
     * If a table is defined, it will automatically append the choices
     * as TD cells. Otherwise, the choices will be built but not appended.
     *
     * @param {array} choices The array of choices
     *
     * @see ChoiceTable.table
     * @see ChoiceTable.shuffleChoices
     * @see ChoiceTable.order
     * @see ChoiceTable.buildChoices
     * @see ChoiceTable.buildTableAndChoices
     */
    ChoiceTable.prototype.setChoices = function(choices) {
        var len;
        if (!J.isArray(choices)) {
            throw new TypeError('ChoiceTable.setChoices: choices ' +
                                'must be array.');
        }
        if (!choices.length) {
            throw new Error('ChoiceTable.setChoices: choices is empty array.');
        }
        this.choices = choices;
        len = choices.length;

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleChoices) this.order = J.shuffle(this.order);

        // Build the table and choices at once (faster).
        if (this.table) this.buildTableAndChoices();
        // Or just build choices.
        else this.buildChoices();
    };


    /**
     * ### ChoiceTable.buildChoices
     *
     * Render every choice and stores cell in `choicesCells` array
     *
     * Left and right cells are also rendered, if specified.
     *
     * Follows a shuffled order, if set
     *
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.renderSpecial
     */
    ChoiceTable.prototype.buildChoices = function() {
        var i, len;
        i = -1, len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);
        for ( ; ++i < len ; ) {
            this.renderChoice(this.choices[this.order[i]], i);
        }
        if (this.left) this.renderSpecial('left', this.left);
        if (this.right) this.renderSpecial('right', this.right);
    };

    /**
     * ### ChoiceTable.buildTable
     *
     * Builds the table of clickable choices and enables it
     *
     * Must be called after choices have been set already.
     *
     * @see ChoiceTable.setChoices
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.orientation
     */
    ChoiceTable.prototype.buildTable = function() {
        var i, len, tr, H;

        len = this.choicesCells.length;

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = createTR(this, 'main');
            // Add horizontal choices title.
            if (this.leftCell) tr.appendChild(this.leftCell);
        }
        // Main loop.
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = createTR(this, 'left');
                // Add vertical choices title.
                if (i === 0 && this.leftCell) {
                    tr.appendChild(this.leftCell);
                    tr = createTR(this, i);
                }
            }
            // Clickable cell.
            tr.appendChild(this.choicesCells[i]);
        }
        if (this.rightCell) {
            if (!H) tr = createTR(this, 'right');
            tr.appendChild(this.rightCell);
        }
        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTable.buildTableAndChoices
     *
     * Builds the table of clickable choices
     *
     * @see ChoiceTable.choices
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.orientation
     */
    ChoiceTable.prototype.buildTableAndChoices = function() {
        var i, len, tr, td, H;

        len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = createTR(this, 'main');
            // Add horizontal choices left.
            if (this.left) {
                td = this.renderSpecial('left', this.left);
                tr.appendChild(td);
            }
        }
        // Main loop.
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = createTR(this, 'left');
                // Add vertical choices left.
                if (i === 0 && this.left) {
                    td = this.renderSpecial('left', this.left);
                    tr.appendChild(td);
                    tr = createTR(this, i);
                }
            }
            // Clickable cell.
            td = this.renderChoice(this.choices[this.order[i]], i);
            tr.appendChild(td);
        }
        if (this.right) {
            if (!H) tr = createTR(this, 'right');
            td = this.renderSpecial('right', this.right);
            tr.appendChild(td);
        }

        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTable.renderSpecial
     *
     * Renders a non-choice element into a cell of the table (e.g. left/right)
     *
     * @param {string} type The type of special cell ('left' or 'right').
     * @param {mixed} special The special element. It must be string or number,
     *   or array where the first element is the 'value' (incorporated in the
     *   `id` field) and the second the text to display as choice.
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.left
     * @see ChoiceTable.right
     */
    ChoiceTable.prototype.renderSpecial = function(type, special) {
        var td, className;
        td = document.createElement('td');
        if ('string' === typeof special) td.innerHTML = special;
        // HTML element (checked before).
        else td.appendChild(special);
        if (type === 'left') {
            className = this.className ? this.className + '-left' : 'left';
            this.leftCell = td;
        }
        else if (type === 'right') {
            className = this.className ? this.className + '-right' : 'right';
            this.rightCell = td;
        }
        else {
            throw new Error('ChoiceTable.renderSpecial: unknown type: ' + type);
        }
        td.className = className;
        td.id = this.id + this.separator + 'special-cell-' + type
        return td;
    };

    /**
     * ### ChoiceTable.renderChoice
     *
     * Transforms a choice element into a cell of the table
     *
     * A reference to the cell is saved in `choicesCells`.
     *
     * @param {mixed} choice The choice element. It must be string or number,
     *   or array where the first element is the 'value' (incorporated in the
     *   `id` field) and the second the text to display as choice. If a
     *   renderer function is defined there are no restriction on the
     *   format of choice
     * @param {number} idx The position of the choice within the choice array
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.renderer
     * @see ChoiceTable.separator
     * @see ChoiceTable.choicesCells
     */
    ChoiceTable.prototype.renderChoice = function(choice, idx) {
        var td, value;
        td = document.createElement('td');

        // Use custom renderer.
        if (this.renderer) {
            value = this.renderer(td, choice, idx);
            if ('undefined' === typeof value) value = idx;
        }
        // Or use standard format.
        else {
            if (J.isArray(choice)) {
                value = choice[0];
                choice = choice[1];
            }
            else {
                value = this.shuffleChoices ? this.order[idx] : idx;
            }

            if ('string' === typeof choice || 'number' === typeof choice) {
                td.innerHTML = choice;
            }
            else if (J.isElement(choice) || J.isNode(choice)) {
                td.appendChild(choice);
            }
            else {
                throw new Error('ChoiceTable.renderChoice: invalid choice: ' +
                                choice);
            }
        }

        // Map a value to the index.
        if ('undefined' !== typeof this.choicesValues[value]) {
            throw new Error('ChoiceTable.renderChoice: value already ' +
                            'in use: ' + value);
        }

        // Add the id if not added already by the renderer function.
        if (!td.id || td.id === '') {
            td.id = this.id + this.separator + value;
        }

        // All fine, updates global variables.
        this.choicesValues[value] = idx;
        this.choicesCells[idx] = td;
        this.choicesIds[td.id] = td;

        return td;
    };

    /**
     * ### ChoiceTable.setCorrectChoice
     *
     * Set the correct choice/s
     *
     * Correct choice/s are always stored as 'strings', or not number
     * because then they are compared against the valued saved in
     * the `id` field of the cell
     *
     * @param {number|string|array} If `selectMultiple` is set, param must
     *   be an array, otherwise a string or a number. Each correct choice
     *   must have been already defined as choice (value)
     *
     * @see ChoiceTable.setChoices
     * @see checkCorrectChoiceParam
     */
    ChoiceTable.prototype.setCorrectChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple) {
            choice = checkCorrectChoiceParam(this, choice);
        }
        else {
            if (J.isArray(choice) && choice.length) {
                i = -1, len = choice.length;
                for ( ; ++i < len ; ) {
                    choice[i] = checkCorrectChoiceParam(this, choice[i]);
                }
            }
            else {
                throw new TypeError('ChoiceTable.setCorrectChoice: choices ' +
                                    'must be non-empty array.');
            }
        }
        this.correctChoice = choice;
    };

    /**
     * ### ChoiceTable.append
     *
     * Implements Widget.append
     *
     * Checks that id is unique.
     *
     * Appends (all optional):
     *
     *   - mainText: a question or statement introducing the choices
     *   - table: the table containing the choices
     *   - freeText: a textarea for comments
     *
     * @see Widget.append
     */
    ChoiceTable.prototype.append = function() {
        var tmp;
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('ChoiceTable.append: id is not ' +
                            'unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = this.className ?
                ChoiceTable.className + '-maintext' : 'maintext';
            this.spanMainText.innerHTML = this.mainText;
            // Append mainText.
            this.bodyDiv.appendChild(this.spanMainText);
        }

        // Create/set table.
        if (this.table !== false) {
            // Create table, if it was not passed as object before.
            if ('undefined' === typeof this.table) {
                this.table = document.createElement('table');
                this.buildTable();
            }
            // Set table id.
            this.table.id = this.id;
            if (this.className) J.addClass(this.table, this.className);
            else this.table.className = '';
            // Append table.
            this.bodyDiv.appendChild(this.table);
        }

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            tmp = this.className ? this.className + '-freetext' : 'freetext';
            this.textarea.className = tmp;
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### ChoiceTable.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * @see Widget.listeners
     */
    ChoiceTable.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceTable.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    ChoiceTable.prototype.disable = function() {
        if (this.disabled === true) return;
        this.disabled = true;
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
        }
    };

    /**
     * ### ChoiceTable.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTable.prototype.enable = function() {
        if (this.disabled === false) return;
        if (!this.table) {
            throw new Error('ChoiceTable.enable: table not defined.');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
    };

    /**
     * ### ChoiceTable.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * Depending on current settings, there are two modes of verifying
     * choices:
     *
     *    - requiredChoice: there must be at least N choices selected
     *    - correctChoice:  the choices are compared against correct ones.
     *
     * @param {boolean} markAttempt Optional. If TRUE, the value of
     *   current choice is added to the attempts array. Default: TRUE
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     * @see ChoiceTable.attempts
     * @see ChoiceTable.setCorrectChoice
     */
    ChoiceTable.prototype.verifyChoice = function(markAttempt) {
        var i, len, j, lenJ, c, clone, found;
        var correctChoice;

        // Check the number of choices.
        if (this.requiredChoice !== null) {
            if (!this.selectMultiple) return this.currentChoice !== null;
            else return this.currentChoice.length >= this.requiredChoice;
        }

        // If no correct choice is set return null.
        if (!this.correctChoice) return null;
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        if (markAttempt) this.attempts.push(this.currentChoice);
        if (!this.selectMultiple) {
            return this.currentChoice === this.correctChoice;
        }
        else {
            // Make it an array (can be a string).
            correctChoice = J.isArray(this.correctChoice) ?
                this.correctChoice : [this.correctChoice];

            len = correctChoice.length;
            lenJ = this.currentChoice.length;
            // Quick check.
            if (len !== lenJ) return false;
            // Check every item.
            i = -1;
            clone = this.currentChoice.slice(0);
            for ( ; ++i < len ; ) {
                found = false;
                c = correctChoices[i];
                j = -1;
                for ( ; ++j < lenJ ; ) {
                    if (clone[j] === c) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        }
    };

    /**
     * ### ChoiceTable.setCurrentChoice
     *
     * Marks a choice as current
     *
     * If `ChoiceTable.selectMultiple` is set multiple choices can be current.
     *
     * @param {number|string} The choice to mark as current
     *
     * @see ChoiceTable.currentChoice
     * @see ChoiceTable.selectMultiple
     */
    ChoiceTable.prototype.setCurrentChoice = function(choice) {
        if (!this.selectMultiple) this.currentChoice = choice;
        else this.currentChoice.push(choice);
    };

    /**
     * ### ChoiceTable.unsetCurrentChoice
     *
     * Deletes the value of currentChoice
     *
     * If `ChoiceTable.selectMultiple` is activated, then it is
     * possible to select the choice to unset.
     *
     * @param {number|string} Optional. The choice to delete from
     *   currentChoice when multiple selections are allowed
     *
     * @see ChoiceTable.currentChoice
     * @see ChoiceTable.selectMultiple
     */
    ChoiceTable.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple || 'undefined' === typeof choice) {
            this.currentChoice = null;
        }
        else {
            if ('string' !== typeof choice && 'number' !== typeof choice) {
                throw new TypeError('ChoiceTable.unsetCurrentChoice: choice ' +
                                    'must be string, number or undefined.');
            }
            i = -1, len = this.currentChoice.length;
            for ( ; ++i < len ; ) {
                if (this.currentChoice[i] === choice) {
                    this.currentChoice.splice(i,1);
                    break;
                }
            }
        }
    };

    /**
     * ### ChoiceTable.isChoiceCurrent
     *
     * Returns TRUE if a choice is currently selected
     *
     * @param {number|string} The choice to check
     *
     * @return {boolean} TRUE, if the choice is currently selected
     */
    ChoiceTable.prototype.isChoiceCurrent = function(choice) {
        var i, len;
        if ('number' === typeof choice) {
            choice = '' + choice;
        }
        else if ('string' !== typeof choice) {
            throw new TypeError('ChoiceTable.isChoiceCurrent: choice ' +
                                'must be string or number.');
        }
        if (!this.selectMultiple) {
            return this.currentChoice === choice;
        }
        else {
            i = -1, len = this.currentChoice.length;
            for ( ; ++i < len ; ) {
                if (this.currentChoice[i] === choice) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * ### ChoiceTable.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.highlight = function(border) {
        if (!this.table) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTable.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceTable.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.unhighlight = function() {
        if (!this.table) return;
        this.table.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceTable.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *       value, widget will be highlighted. Default: FALSE.
     *   - reset:       If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceTable.verifyChoice
     * @see ChoiceTable.reset
     */
    ChoiceTable.prototype.getValues = function(opts) {
        var obj, resetOpts;
        opts = opts || {};
        obj = {
            id: this.id,
            choice: opts.reset ?
                this.currentChoice: J.clone(this.currentChoice),
            time: this.timeCurrentChoice,
            nClicks: this.numberOfClicks
        };
        if (opts.processChoice) {
            obj.choice = opts.processChoice.call(this, obj.choice);
        }
        if (this.shuffleChoices) {
            obj.order = this.order;
        }
        if (this.group === 0 || this.group) {
            obj.group = this.group;
        }
        if (this.groupOrder === 0 || this.groupOrder) {
            obj.groupOrder = this.groupOrder;
        }
        if (null !== this.correctChoice || null !== this.requiredChoice) {
            obj.isCorrect = this.verifyChoice(opts.markAttempt);
            obj.attempts = this.attempts;
            if (!obj.isCorrect && opts.highlight) this.highlight();
        }
        if (this.textarea) obj.freetext = this.textarea.value;
        if (obj.isCorrect !== false && opts.reset) {
            resetOpts = 'object' !== typeof opts.reset ? {} : opts.reset;
            this.reset(resetOpts);
        }
        return obj;
    };

    /**
     * ### ChoiceTable.setValues
     *
     * Sets values in the choice table as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     *
     * @experimental
     */
    ChoiceTable.prototype.setValues = function(options) {
        var choice, correctChoice, cell;
        var i, len, j, lenJ;

        if (!this.choices || !this.choices.length) {
            throw new Error('ChoiceTable.setValues: no choices found.');
        }
        options = options || {};

        // TODO: allow it to set it visually or just in the background.
        // Use options.visual.

        // TODO: allow it to set random or fixed values, or correct values

        if (!this.choicesCells || !this.choicesCells.length) {
            throw new Error('Choicetable.setValues: table was not ' +
                            'built yet.');
        }

        if (options.correct) {
            // Value this.correctChoice can be string or array.
            if (!this.correctChoice || !this.correctChoice.length) {
                throw new Error('Choicetable.setValues: "correct" is set, ' +
                               'but no correct choice is found.');
            }
            // Make it an array (can be a string).
            correctChoice = J.isArray(this.correctChoice) ?
                this.correctChoice : [this.correctChoice];

            i = -1, len = correctChoice.length;
            for ( ; ++i < len ; ) {
                choice = parseInt(correctChoice[i], 10);
                if (this.shuffleChoices) {
                    j = -1, lenJ = this.order.length;
                    for ( ; ++j < lenJ ; ) {
                        if (this.order[j] === choice) {
                            choice = j;
                            break;
                        }
                    }
                }

                this.choicesCells[choice].click();
            }
            return;
        }

        // How many random choices?
        if (!this.selectMultiple) len = 1;
        else len = J.randomInt(0, this.choicesCells.length);

        i = -1;
        for ( ; ++i < len ; ) {
            choice = J.randomInt(0, this.choicesCells.length)-1;
            // Do not click it again if it is already selected.
            if (!this.isChoiceCurrent(choice)) {
                this.choicesCells[choice].click();
            }
        }

        // Make a random comment.
        if (this.textarea) this.textarea.value = J.randomString(100, '!Aa0');
    };

    /**
     * ### ChoiceTable.reset
     *
     * Resets current selection and collected paradata
     *
     * @param {object} options Optional. Available options:
     *    - shuffleChoices: If TRUE, choices are shuffled. Default: FALSE
     */
    ChoiceTable.prototype.reset = function(options) {
        var i, len;

        options = options || {};

        this.attempts = [];
        this.numberOfClicks = 0;
        this.currentChoice = null;
        this.timeCurrentChoice = null;

        if (this.selected) {
            if (!this.selectMultiple) {
                J.removeClass(this.selected, 'selected');
            }
            else {
                i = -1, len = this.selected.length;
                for ( ; ++i < len ; ) {
                    J.removeClass(this.selected[i], 'selected');
                }
            }
            this.selected = null;
        }

        if (this.textArea) this.textArea.value = '';
        if (this.isHighlighted()) this.unhighlight();

        if (options.shuffleChoices) this.shuffle();
    };

    /**
     * ### ChoiceTable.shuffle
     *
     * Shuffles the order of the choices
     */
    ChoiceTable.prototype.shuffle = function() {
        var order, H;
        var i, len, cell, choice;
        var choicesValues, choicesCells;
        var parentTR;

        H = this.orientation === 'H';
        order = J.shuffle(this.order);
        i = -1, len = order.length;
        choicesValues = {};
        choicesCells = new Array(len);

        for ( ; ++i < len ; ) {
            choice = order[i];
            cell = this.choicesCells[this.choicesValues[choice]];
            choicesCells[i] = cell;
            choicesValues[choice] = i;
            if (H) {
                this.trs[0].appendChild(cell);
            }
            else {
                parentTR = cell.parentElement || cell.parentNode;
                this.table.appendChild(parentTR);
            }
        }
        if (this.rightCell) {
            if (H) {
                this.trs[0].appendChild(this.rightCell);
            }
            else {
                parentTR = this.rightCell.parentElement ||
                    this.rightCell.parentNode;
                this.table.appendChild(parentTR);
            }
        }

        this.order = order;
        this.choicesCells = choicesCells;
        this.choicesValues = choicesValues;
    };

    // ## Helper methods.

    /**
     * ### checkCorrectChoiceParam
     *
     * Checks the input parameters of method ChoiceTable.setCorrectChoice
     *
     * The function transforms numbers into string, because then the checking
     * is done with strings (they are serialized in the id property of tds).
     *
     * If `ChoiceTable.selectMultiple` is set, the function checks each
     * value of the array separately.
     *
     * @param {ChoiceTable} that This instance
     * @param {string|number} An already existing value of a choice
     *
     * @return {string} The checked choice
     */
    function checkCorrectChoiceParam(that, choice) {
        if ('number' === typeof choice) choice = '' + choice;
        if ('string' !== typeof choice) {
            throw new TypeError('ChoiceTable.setCorrectChoice: each choice ' +
                                'must be number or string. Found: ' + choice);
        }
        if ('undefined' === typeof that.choicesValues[choice]) {

            throw new TypeError('ChoiceTable.setCorrectChoice: choice ' +
                                'not found: ' + choice);
        }
        return choice;
    }

    /**
     * ### createTR
     *
     * Creates and append a new TR element
     *
     * Adds the the `id` attribute formatted as:
     *   'tr' + separator + widget_id
     *
     * @param {ChoiceTable} that This instance
     *
     * @return {HTMLElement} Thew newly created TR element
     *
     * @see ChoiceTable.tr
     */
    function createTR(that, trid) {
        var tr;
        tr = document.createElement('tr');
        tr.id = 'tr' + that.separator + that.id;
        that.table.appendChild(tr);
        // Store reference.
        that.trs.push(tr);
        return tr;
    }

})(node);

/**
 * # ChoiceTableGroup
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that groups together several choice tables widgets
 *
 * @see ChoiceTable
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceTableGroup', ChoiceTableGroup);

    // ## Meta-data

    ChoiceTableGroup.version = '1.2.0';
    ChoiceTableGroup.description = 'Groups together and manages sets of ' +
        'ChoiceTable widgets.';

    ChoiceTableGroup.title = 'Make your choice';
    ChoiceTableGroup.className = 'choicetable';

    ChoiceTableGroup.separator = '::';

    // ## Dependencies

    ChoiceTableGroup.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceTableGroup constructor
     *
     * Creates a new instance of ChoiceTableGroup
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as the clickable
     *   table. All other options are passed to the init method.
     */
    function ChoiceTableGroup(options) {
        var that;
        that = this;

        /**
         * ### ChoiceTableGroup.dl
         *
         * The clickable table containing all the cells
         */
        this.table = null;

        /**
         * ### ChoiceTableGroup.trs
         *
         * Collection of all trs created
         *
         * Useful when shuffling items/choices
         *
         * @see ChoiceTableGroup.shuffle
         */
        this.trs = [];

        /**
         * ## ChoiceTableGroup.listener
         *
         * The listener function
         *
         * @see GameChoice.enable
         * @see GameChoice.disable
         */
        this.listener = function(e) {
            var name, value, item, td, oldSelected;
            var time;

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                time = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                time = Date.now ? Date.now() : new Date().getTime();
            }

            e = e || window.event;
            td = e.target || e.srcElement;

            // Not a clickable choice.
            if (!td.id || td.id === '') return;

            // Not a clickable choice.
            if (!that.choicesById[td.id]) return;

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split(that.separator);

            // Separator not found, not a clickable cell.
            if (value.length === 1) return;

            name = value[0];
            value = value[1];

            item = that.itemsById[name];

            // Not a clickable cell.
            if (!item) return;

            item.timeCurrentChoice = time;

            // One more click.
            item.numberOfClicks++;

            // If only 1 selection allowed, remove selection from oldSelected.
            if (!item.selectMultiple) {
                oldSelected = item.selected;
                if (oldSelected) J.removeClass(oldSelected, 'selected');

                if (item.isChoiceCurrent(value)) {
                    item.unsetCurrentChoice(value);
                }
                else {
                    item.currentChoice = value;
                    J.addClass(td, 'selected');
                    item.selected = td;
                }
            }

            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        /**
         * ### ChoiceTableGroup.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceTableGroup.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceTableGroup.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceTableGroup.items
         *
         * The array available items
         */
        this.items = null;

        /**
         * ### ChoiceTableGroup.itemsById
         *
         * Map of items ids to items
         */
        this.itemsById = {};

        /**
         * ### ChoiceTableGroup.choices
         *
         * Array of default choices (if passed as global parameter)
         */
        this.choices = null;

        /**
         * ### ChoiceTableGroup.choicesById
         *
         * Map of items choices ids to corresponding cell
         *
         * Useful to detect clickable cells.
         */
        this.choicesById = {};

        /**
         * ### ChoiceTableGroup.itemsSettings
         *
         * The array of settings for each item
         */
        this.itemsSettings = null;

        /**
         * ### ChoiceTableGroup.order
         *
         * The order of the items as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceTableGroup.shuffleItems
         *
         * If TRUE, items are inserted in random order
         *
         * @see ChoiceTableGroup.order
         */
        this.shuffleItems = null;

        /**
         * ### ChoiceTableGroup.requiredChoice
         *
         * The number of required choices.
         */
        this.requiredChoice = null;

        /**
         * ### ChoiceTableGroup.orientation
         *
         * Orientation of display of items: vertical ('V') or horizontal ('H')
         *
         * Default orientation is horizontal.
         */
        this.orientation = 'H';

        /**
         * ### ChoiceTableGroup.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceTableGroup.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceTableGroup.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceTableGroup.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        // Options passed to each individual item.

        /**
         * ### ChoiceTableGroup.timeFrom
         *
         * Time is measured from timestamp as saved by node.timer
         *
         * Default event is a new step is loaded (user can interact with
         * the screen). Set it to FALSE, to have absolute time.
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         *
         * @see node.timer.getTimeSince
         */
        this.timeFrom = 'step';

        /**
         * ### ChoiceTableGroup.selectMultiple
         *
         * If TRUE, it allows to select multiple cells
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.selectMultiple = null;

        /**
         * ### ChoiceTableGroup.renderer
         *
         * A callback that renders the content of each cell
         *
         * The callback must accept three parameters:
         *
         *   - a td HTML element,
         *   - a choice
         *   - the index of the choice element within the choices array
         *
         * and optionally return the _value_ for the choice (otherwise
         * the order in the choices array is used as value).
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.renderer = null;

        /**
         * ### ChoiceTableGroup.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default ChoiceTableGroup.separator
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.separator = ChoiceTableGroup.separator;

        /**
         * ### ChoiceTableGroup.shuffleChoices
         *
         * If TRUE, choices in items are shuffled
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.shuffleChoices = null;
    }

    // ## ChoiceTableGroup methods

    /**
     * ### ChoiceTableGroup.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the table (string, array), or false
     *       to have none.
     *   - orientation: orientation of the table: vertical (v) or horizontal (h)
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the table in the group, if any
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - shuffleItems: if TRUE, items are shuffled before being added
     *       to the table
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Configuration options
     */
    ChoiceTableGroup.prototype.init = function(options) {
        var tmp, that;
        that = this;

        // TODO: many options checking are replicated. Skip them all?
        // Have a method in ChoiceTable?

        if (!this.id) {
            throw new TypeError('ChoiceTableGroup.init: options.id ' +
                                'is missing.');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof options.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof options.orientation) {
            throw new TypeError('ChoiceTableGroup.init: options.orientation ' +
                                'must be string, or undefined. Found: ' +
                                options.orientation);
        }
        else {
            tmp = options.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('ChoiceTableGroup.init: options.orientation ' +
                                'is invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleItems, default false.
        if ('undefined' === typeof options.shuffleItems) tmp = false;
        else tmp = !!options.shuffleItems;
        this.shuffleItems = tmp;

        // Option requiredChoice, if any.
        if ('number' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice;
        }
        else if ('boolean' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice ? 1 : 0;
        }
        else if ('undefined' !== typeof options.requiredChoice) {
            throw new TypeError('ChoiceTableGroup.init: ' +
                                'options.requiredChoice ' +
                                'be number or boolean or undefined. Found: ' +
                                options.requiredChoice);
        }

        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTableGroup.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTableGroup.init: options.groupOrder ' +
                                'must be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the onclick listener, if any.
        if ('function' === typeof options.onclick) {
            this.listener = function(e) {
                options.onclick.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.onclick) {
            throw new TypeError('ChoiceTableGroup.init: options.onclick must ' +
                                'be function or undefined. Found: ' +
                                options.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceTableGroup.init: options.mainText ' +
                                'must be string or undefined. Found: ' +
                                options.mainText);
        }

        // Set the timeFrom, if any.
        if (options.timeFrom === false ||
            'string' === typeof options.timeFrom) {

            this.timeFrom = options.timeFrom;
        }
        else if ('undefined' !== typeof options.timeFrom) {
            throw new TypeError('ChoiceTableGroup.init: options.timeFrom ' +
                                'must be string, false, or undefined. Found: ' +
                                options.timeFrom);
        }

        // Option shuffleChoices, default false.
        if ('undefined' !== typeof options.shuffleChoices) {
            this.shuffleChoices = !!options.shuffleChoices;
        }

        // Set the renderer, if any.
        if ('function' === typeof options.renderer) {
            this.renderer = options.renderer;
        }
        else if ('undefined' !== typeof options.renderer) {
            throw new TypeError('ChoiceTableGroup.init: options.renderer ' +
                                'must be function or undefined. Found: ' +
                                options.renderer);
        }

        // Set default choices, if any.
        if ('undefined' !== typeof options.choices) {
            this.choices = options.choices;
        }

        // Set the className, if not use default.
        if ('undefined' === typeof options.className) {
            this.className = ChoiceTableGroup.className;
        }
        else if (options.className === false ||
                 'string' === typeof options.className ||
                 J.isArray(options.className)) {

            this.className = options.className;
        }
        else {
            throw new TypeError('ChoiceTableGroup.init: options.' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + options.className);
        }

        // After all configuration options are evaluated, add items.

        if ('object' === typeof options.table) {
            this.table = options.table;
        }
        else if ('undefined' !== typeof options.table &&
                 false !== options.table) {

            throw new TypeError('ChoiceTableGroup.init: options.table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + options.table);
        }

        this.table = options.table;

        this.freeText = 'string' === typeof options.freeText ?
            options.freeText : !!options.freeText;

        // Add the items.
        if ('undefined' !== typeof options.items) {
            this.setItems(options.items);
        }
    };

    /**
     * ### ChoiceTableGroup.setItems
     *
     * Sets the available items and optionally builds the table
     *
     * @param {array} items The array of items
     *
     * @see ChoiceTableGroup.table
     * @see ChoiceTableGroup.order
     * @see ChoiceTableGroup.shuffleItems
     * @see ChoiceTableGroup.buildTable
     */
    ChoiceTableGroup.prototype.setItems = function(items) {
        var len;
        if (!J.isArray(items)) {
            throw new TypeError('ChoiceTableGroup.setItems: ' +
                                'items must be array.');
        }
        if (!items.length) {
            throw new Error('ChoiceTableGroup.setItems: ' +
                            'items is empty array.');
        }

        len = items.length;
        this.itemsSettings = items;
        this.items = new Array(len);

        // Save the order in which the items will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleItems) this.order = J.shuffle(this.order);

        // Build the table and items at once (faster).
        if (this.table) this.buildTable();
    };

    /**
     * ### ChoiceTableGroup.buildTable
     *
     * Builds the table of clickable items and enables it
     *
     * Must be called after items have been set already.
     *
     * @see ChoiceTableGroup.setChoiceTables
     * @see ChoiceTableGroup.order
     */
    ChoiceTableGroup.prototype.buildTable = function() {
        var i, len, tr, H, ct;
        var j, lenJ, lenJOld, hasRight, cell;

        H = this.orientation === 'H';
        i = -1, len = this.itemsSettings.length;
        if (H) {
            for ( ; ++i < len ; ) {
                // Get item.
                ct = getChoiceTable(this, i);

                // Add new TR.
                tr = createTR(this, ct.id);

                // Append choices for item.
                tr.appendChild(ct.leftCell);
                j = -1, lenJ = ct.choicesCells.length;
                // Make sure all items have same number of choices.
                if (i === 0) {
                    lenJOld = lenJ;
                }
                else if (lenJ !== lenJOld) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'do not have same number of choices: ' +
                                    ct.id);
                }
                // TODO: might optimize. There are two loops (+1 inside ct).
                for ( ; ++j < lenJ ; ) {
                    cell = ct.choicesCells[j];
                    tr.appendChild(cell);
                    this.choicesById[cell.id] = cell;
                }
                if (ct.rightCell) tr.appendChild(ct.rightCell);
            }
        }
        else {

            // Add new TR.
            tr = createTR(this, 'header');

            // Build all items first.
            for ( ; ++i < len ; ) {

                // Get item, append choices for item.
                ct = getChoiceTable(this, i);

                // Make sure all items have same number of choices.
                lenJ = ct.choicesCells.length;
                if (i === 0) {
                    lenJOld = lenJ;
                }
                else if (lenJ !== lenJOld) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'do not have same number of choices: ' +
                                    ct.id);
                }

                if ('undefined' === typeof hasRight) {
                    hasRight = !!ct.rightCell;
                }
                else if ((!ct.rightCell && hasRight) ||
                         (ct.rightCell && !hasRight)) {

                    throw new Error('ChoiceTableGroup.buildTable: either all ' +
                                    'items or no item must have the right ' +
                                    'cell: ' + ct.id);

                }
                // Add left.
                tr.appendChild(ct.leftCell);
            }

            if (hasRight) lenJ++;

            j = -1;
            for ( ; ++j < lenJ ; ) {
                // Add new TR.
                tr = createTR(this, 'row' + (j+1));

                i = -1;
                // TODO: might optimize. There are two loops (+1 inside ct).
                for ( ; ++i < len ; ) {
                    if (hasRight && j === (lenJ-1)) {
                        tr.appendChild(this.items[i].rightCell);
                    }
                    else {
                        cell = this.items[i].choicesCells[j];
                        tr.appendChild(cell);
                        this.choicesById[cell.id] = cell;
                    }
                }
            }

        }

        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTableGroup.append
     *
     * Implements Widget.append
     *
     * Checks that id is unique.
     *
     * Appends (all optional):
     *
     *   - mainText: a question or statement introducing the choices
     *   - table: the table containing the choices
     *   - freeText: a textarea for comments
     *
     * @see Widget.append
     */
    ChoiceTableGroup.prototype.append = function() {
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('ChoiceTableGroup.append: id ' +
                            'is not unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className =
                ChoiceTableGroup.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            // Append.
            this.bodyDiv.appendChild(this.spanMainText);
        }

        // Create/set table, if requested.
        if (this.table !== false) {
            if ('undefined' === typeof this.table) {
                this.table = document.createElement('table');
                if (this.items) this.buildTable();
            }
            // Set table id.
            this.table.id = this.id;
            if (this.className) J.addClass(this.table, this.className);
            else this.table.className = '';
            // Append table.
            this.bodyDiv.appendChild(this.table);
        }

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            this.textarea.className = ChoiceTableGroup.className + '-freetext';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### ChoiceTableGroup.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * Notice! Nested choice tables listeners are not executed.
     *
     * @see Widget.listeners
     * @see mixinSettings
     */
    ChoiceTableGroup.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceTableGroup.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    ChoiceTableGroup.prototype.disable = function(force) {
        if (this.disabled === true) return;
        this.disabled = true;
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
        }
    };

    /**
     * ### ChoiceTableGroup.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTableGroup.prototype.enable = function(force) {
        if (this.disabled === false) return;
        if (!this.table) {
            throw new Error('ChoiceTableGroup.enable: table not defined.');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
    };

    /**
     * ### ChoiceTableGroup.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * @param {boolean} markAttempt Optional. If TRUE, the value of
     *   current choice is added to the attempts array. Default
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     * @see ChoiceTableGroup.attempts
     * @see ChoiceTableGroup.setCorrectChoice
     */
    ChoiceTableGroup.prototype.verifyChoice = function(markAttempt) {
        var i, len, out;
        out = {};
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            out[this.items[i].id] = this.items[i].verifyChoice(markAttempt);
        }
        return out;
    };

    /**
     * ### ChoiceTable.setCurrentChoice
     *
     * Marks a choice as current in each item
     *
     * If the item allows it, multiple choices can be set as current.
     *
     * @param {number|string} The choice to mark as current
     *
     * @see ChoiceTable.currentChoice
     * @see ChoiceTable.selectMultiple
     */
    ChoiceTableGroup.prototype.setCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.items[i].length;
        for ( ; ++i < len ; ) {
            this.items[i].setCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceTableGroup.unsetCurrentChoice
     *
     * Deletes the value for currentChoice from every item
     *
     * If `ChoiceTableGroup.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete from currentChoice
     *   when multiple selections are allowed
     *
     * @see ChoiceTableGroup.currentChoice
     * @see ChoiceTableGroup.selectMultiple
     */
    ChoiceTableGroup.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            this.items[i].unsetCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceTableGroup.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see ChoiceTableGroup.highlighted
     */
    ChoiceTableGroup.prototype.highlight = function(border) {
        if (!this.table) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTableGroup.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceTableGroup.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTableGroup.highlighted
     */
    ChoiceTableGroup.prototype.unhighlight = function() {
        if (!this.table) return;
        this.table.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceTableGroup.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *      to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *      value, widget will be highlighted. Default: FALSE.
     *   - reset:    If TRUTHY and no item raises an error,
     *       then it resets the state of all items before
     *       returning it. Default: FALSE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceTableGroup.verifyChoice
     * @see ChoiceTableGroup.reset
     */
    ChoiceTableGroup.prototype.getValues = function(opts) {
        var obj, i, len, tbl, toHighlight, toReset;
        obj = {
            id: this.id,
            order: this.order,
            items: {}
        };
        opts = opts || {};
        // Make sure reset is done only at the end.
        toReset = opts.reset;
        opts.reset = false;
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            tbl = this.items[i];
            obj.items[tbl.id] = tbl.getValues(opts);
            if (obj.items[tbl.id].choice === null) {
                obj.missValues = true;
                if (tbl.requiredChoice) toHighlight = true;
            }
            if (obj.items[tbl.id].isCorrect === false && opts.highlight) {
                toHighlight = true;
            }
        }

        if (toHighlight) this.highlight();
        else if (toReset) this.reset(toReset);
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    /**
     * ### ChoiceTableGroup.setValues
     *
     * Sets values in the choice table group as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     *
     * @see ChoiceTable.setValues
     *
     * @experimental
     */
    ChoiceTableGroup.prototype.setValues = function(opts) {
        var i, len;
        if (!this.items || !this.items.length) {
            throw new Error('ChoiceTableGroup.setValues: no items found.');
        }
        opts = opts || {};
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            this.items[i].setValues(opts);
        }

        // Make a random comment.
        if (this.textarea) this.textarea.value = J.randomString(100, '!Aa0');
    };

    /**
     * ### ChoiceTableGroup.reset
     *
     * Resets all the ChoiceTable items and textarea
     *
     * @param {object} options Optional. Options specifying how to set
     *   to reset each item
     *
     * @see ChoiceTable.reset
     * @see ChoiceTableGroup.shuffle
     */
    ChoiceTableGroup.prototype.reset = function(opts) {
        var i, len;
        opts = opts || {};
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            this.items[i].reset(opts);
        }
        // Delete textarea, if found.
        if (this.textarea) this.textarea.value = '';
        if (opts.shuffleItems) this.shuffle();
        if (this.isHighlighted()) this.unhighlight();
    };

    /**
     * ### ChoiceTableGroup.shuffle
     *
     * Shuffles the order of the displayed items
     *
     * Assigns the new order of items to `this.order`.
     *
     * @param {object} options Optional. Not used for now.
     *
     * TODO: shuffle choices in each item. (Note: can't use
     * item.shuffle, because the cells are taken out, so
     * there is no table and no tr in there)
     *
     * JSUS.shuffleElements
     */
    ChoiceTableGroup.prototype.shuffle = function(opts) {
        var order, i, len, j, lenJ;
        if (!this.items || !this.items.length) return;
        order = J.shuffle(this.order);
        if (this.orientation === 'H') {
            J.shuffleElements(this.table, order);
        }
        else {
            i = -1, len = this.trs.length;
            for ( ; ++i < len ; ) {
                J.shuffleElements(this.trs[i], order);
            }
        }
        this.order = order;
    };

    // ## Helper methods.

    /**
     * ### mixinSettings
     *
     * Mix-ins global settings with local settings for specific choice tables
     *
     * @param {ChoiceTableGroup} that This instance
     * @param {object|string} s The current settings for the item
     *   (choice table), or just its id, to mixin all settings.
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} s The mixed-in settings
     */
    function mixinSettings(that, s, i) {
        if ('string' === typeof s) {
            s = { id: s };
        }
        else if ('object' !== typeof s) {
            throw new TypeError('ChoiceTableGroup.buildTable: item must be ' +
                                'string or object. Found: ' + s);
        }
        s.group = that.id;
        s.groupOrder = i+1;
        s.orientation = that.orientation;
        s.title = false;
        s.listeners = false;
        s.separator = that.separator;

        if ('undefined' === typeof s.choices && that.choices) {
            s.choices = that.choices;
        }

        if (!s.renderer && that.renderer) s.renderer = that.renderer;

        if ('undefined' === typeof s.requiredChoice && that.requiredChoice) {
            s.requiredChoice = that.requiredChoice;
        }

        if ('undefined' === typeof s.selectMultiple &&
            null !== that.selectMultiple) {

            s.selectMultiple = that.selectMultiple;
        }

        if ('undefined' === typeof s.shuffleChoices && that.shuffleChoices) {
            s.shuffleChoices = that.shuffleChoices;
        }

        if ('undefined' === typeof s.timeFrom) s.timeFrom = that.timeFrom;

        if ('undefined' === typeof s.left) s.left = s.id;

        return s;
    }

    /**
     * ### getChoiceTable
     *
     * Creates a instance i-th of choice table with relative settings
     *
     * Stores a reference of each table in `itemsById`
     *
     * @param {ChoiceTableGroup} that This instance
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} ct The requested choice table
     *
     * @see ChoiceTableGroup.itemsSettings
     * @see ChoiceTableGroup.itemsById
     * @see mixinSettings
     */
    function getChoiceTable(that, i) {
        var ct, s;
        s = mixinSettings(that, that.itemsSettings[that.order[i]], i);
        ct = node.widgets.get('ChoiceTable', s);
        if (that.itemsById[ct.id]) {
            throw new Error('ChoiceTableGroup.buildTable: an item ' +
                            'with the same id already exists: ' + ct.id);
        }
        if (!ct.leftCell) {
            throw new Error('ChoiceTableGroup.buildTable: item ' +
                            'is missing a left cell: ' + s.id);
        }
        that.itemsById[ct.id] = ct;
        that.items[i] = ct;
        return ct;
    }

    /**
     * ### createTR
     *
     * Creates and append a new TR element
     *
     * If required by current configuration, the `id` attribute is
     * added to the TR in the form of: 'tr' + separator + widget_id
     *
     * @param {ChoiceTable} that This instance
     *
     * @return {HTMLElement} Thew newly created TR element
     */
    function createTR(that, trid) {
        var tr, sep;
        tr = document.createElement('tr');
        that.table.appendChild(tr);
        // Set id.
        sep = that.separator;
        tr.id = that.id + sep + 'tr' + sep + trid;
        // Store reference.
        that.trs.push(tr);
        return tr;
    }

})(node);

/**
 * # Controls
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manipulates a set of forms
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    // TODO: handle different events, beside onchange

    node.widgets.register('Controls', Controls);

    // ## Meta-data

    Controls.version = '0.5.0';
    Controls.description = 'Wraps a collection of user-inputs controls.';

    Controls.title = 'Controls';
    Controls.className = 'controls';

    /**
     * ## Controls constructor
     *
     * `Control` wraps a collection of user-input controls
     *
     * @param {object} options Optional. Configuration options
     * which is stored and forwarded to Controls.init.
     *
     *  The  options object can have the following attributes:
     *   - Any option that can be passed to `node.window.List` constructor.
     *   - `change`: Event to fire when contents change.
     *   - `features`: Collection of collection attributes for individual
     *                 controls.
     *   - `submit`: Description of the submit button.
     *               If submit.id is defined, the button will get that id and
     *               the text on the button will be the text in submit.name.
     *               If submit is a string, it will be the text on the button.
     *   - `attributes`: Attributes of the submit button.
     *
     * @see Controls.init
     */
    function Controls(options) {
        this.options = options;

        /**
         * ### Controls.listRoot
         *
         * The list which holds the controls
         */
        this.listRoot = null;

        /**
         * ### Controls.submit
         *
         * The submit button
         */
        this.submit = null;

        /**
         * ### Controls.changeEvent
         *
         * The event to be fired when the list changes
         */
        this.changeEvent = 'Controls_change';

        /**
         * ### Controls.hasChanged
         *
         * Flag to indicate whether the list has changed
         */
        this.hasChanged = false;

        this.init(options);
    }

    Controls.prototype.add = function(root, id, attributes) {
        // TODO: node.window.addTextInput
        //return node.window.addTextInput(root, id, attributes);
    };

    Controls.prototype.getItem = function(id, attributes) {
        // TODO: node.window.addTextInput
        //return node.window.getTextInput(id, attributes);
    };

    // ## Controls methods

    /**
     * ### Controls.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - Any option that can be passed to `node.window.List` constructor.
     *   - `change`: Event to fire when contents change.
     *   - `features`: Collection of collection attributes for individual
     *                 controls.
     *
     * @see nodegame-window/List
     */
    Controls.prototype.init = function(options) {
        this.hasChanged = false; // TODO: should this be inherited?
        if ('undefined' !== typeof options.change) {
            if (!options.change) {
                this.changeEvent = false;
            }
            else {
                this.changeEvent = options.change;
            }
        }
        this.list = new W.List(options);
        this.listRoot = this.list.getRoot();

        if (!options.features) {
            return;
        }

        this.features = options.features;
        this.populate();
    };

    /**
     * ### Controls.append
     *
     * Appends the widget to `this.bodyDiv`
     *
     * @see Controls.init
     */
    Controls.prototype.append = function() {
        var that = this;
        var idButton = 'submit_Controls';


        this.list.parse();
        this.bodyDiv.appendChild(this.listRoot);

        if (this.options.submit) {
            if (this.options.submit.id) {
                idButton = this.options.submit.id;
                this.option.submit = this.option.submit.name;
            }
            this.submit = node.window.addButton(this.bodyDiv, idButton,
                    this.options.submit, this.options.attributes);

            this.submit.onclick = function() {
                if (that.options.change) {
                    node.emit(that.options.change);
                }
            };
        }
    };

    Controls.prototype.parse = function() {
        return this.list.parse();
    };

    /**
     * ### Controls.populate
     *
     * Adds features to the list.
     *
     * @see Controls.init
     */
    Controls.prototype.populate = function() {
        var key, id, attributes, container, elem;
        var that = this;

        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                // Prepare the attributes vector.
                attributes = this.features[key];
                id = key;
                if (attributes.id) {
                    id = attributes.id;
                    delete attributes.id;
                }

                container = document.createElement('div');
                // Add a different element according
                // to the subclass instantiated.
                elem = this.add(container, id, attributes);

                // Fire the onChange event, if one defined
                if (this.changeEvent) {
                    elem.onchange = function() {
                        node.emit(that.changeEvent);
                    };
                }

                if (attributes.label) {
                    W.addLabel(container, elem, null, attributes.label);
                }

                // Element added to the list.
                this.list.addDT(container);
            }
        }
    };

    Controls.prototype.listeners = function() {
        var that = this;
        // TODO: should this be inherited?
        node.on(this.changeEvent, function() {
            that.hasChanged = true;
        });

    };

    Controls.prototype.refresh = function() {
        var key, el;
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = node.window.getElementById(key);
                if (el) {
                    // node.log('KEY: ' + key, 'DEBUG');
                    // node.log('VALUE: ' + el.value, 'DEBUG');
                    el.value = this.features[key].value;
                    // TODO: set all the other attributes
                    // TODO: remove/add elements
                }

            }
        }

        return true;
    };

    Controls.prototype.getValues = function() {
        var out, el, key;
        out = {};
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = node.window.getElementById(key);
                if (el) out[key] = Number(el.value);
            }
        }
        return out;
    };

    Controls.prototype.highlight = function(code) {
        return node.window.highlight(this.listRoot, code);
    };

    // ## Sub-classes

    /**
     * ### Slider
     */


    SliderControls.prototype.__proto__ = Controls.prototype;
    SliderControls.prototype.constructor = SliderControls;

    SliderControls.version = '0.2.1';
    SliderControls.description = 'Collection of Sliders.';

    SliderControls.title = 'Slider Controls';
    SliderControls.className = 'slidercontrols';

    SliderControls.dependencies = {
        Controls: {}
    };

    // Need to be after the prototype is inherited.
    node.widgets.register('SliderControls', SliderControls);

    function SliderControls(options) {
        Controls.call(this, options);
    }

    SliderControls.prototype.add = function(root, id, attributes) {
        return node.window.addSlider(root, id, attributes);
    };

    SliderControls.prototype.getItem = function(id, attributes) {
        return node.window.getSlider(id, attributes);
    };

    /**
     * ### jQuerySlider
     */


    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
    jQuerySliderControls.prototype.constructor = jQuerySliderControls;

    jQuerySliderControls.version = '0.14';
    jQuerySliderControls.description = 'Collection of jQuery Sliders.';

    jQuerySliderControls.title = 'jQuery Slider Controls';
    jQuerySliderControls.className = 'jqueryslidercontrols';

    jQuerySliderControls.dependencies = {
        jQuery: {},
        Controls: {}
    };

    node.widgets.register('jQuerySliderControls', jQuerySliderControls);

    function jQuerySliderControls(options) {
        Controls.call(this, options);
    }

    jQuerySliderControls.prototype.add = function(root, id, attributes) {
        var slider = jQuery('<div/>', {
            id: id
        }).slider();

        var s = slider.appendTo(root);
        return s[0];
    };

    jQuerySliderControls.prototype.getItem = function(id, attributes) {
        var slider = jQuery('<div/>', {
            id: id
        }).slider();

        return slider;
    };

    /**
     * ### RadioControls
     */

    RadioControls.prototype.__proto__ = Controls.prototype;
    RadioControls.prototype.constructor = RadioControls;

    RadioControls.version = '0.1.2';
    RadioControls.description = 'Collection of Radio Controls.';

    RadioControls.title = 'Radio Controls';
    RadioControls.className = 'radiocontrols';

    RadioControls.dependencies = {
        Controls: {}
    };

    node.widgets.register('RadioControls', RadioControls);

    function RadioControls(options) {
        Controls.call(this,options);
        this.groupName = ('undefined' !== typeof options.name) ? options.name :
            node.window.generateUniqueId();
        this.radioElem = null;
    }

    // overriding populate also. There is an error with the Label
    RadioControls.prototype.populate = function() {
        var key, id, attributes, elem, that;
        that = this;

        if (!this.radioElem) {
            this.radioElem = document.createElement('radio');
            this.radioElem.group = this.name || "radioGroup";
            this.radioElem.group = this.className || "radioGroup";
            this.bodyDiv.appendChild(this.radioElem);
        }

        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                // Prepare the attributes vector.
                attributes = this.features[key];
                id = key;
                if (attributes.id) {
                    id = attributes.id;
                    delete attributes.id;
                }

                // Add a different element according
                // to the subclass instantiated.
                elem = this.add(this.radioElem, id, attributes);

                // Fire the onChange event, if one defined
                if (this.changeEvent) {
                    elem.onchange = function() {
                        node.emit(that.changeEvent);
                    };
                }

                // Element added to the list.
                this.list.addDT(elem);
            }
        }
    };

    RadioControls.prototype.add = function(root, id, attributes) {
        var elem;
        if ('undefined' === typeof attributes.name) {
            attributes.name = this.groupName;
        }

        elem = node.window.addRadioButton(root, id, attributes);
        // Adding the text for the radio button
        elem.appendChild(document.createTextNode(attributes.label));
        return elem;
    };

    RadioControls.prototype.getItem = function(id, attributes) {
        //console.log('ADDDING radio');
        //console.log(attributes);
        // add the group name if not specified
        // TODO: is this a javascript bug?
        if ('undefined' === typeof attributes.name) {
            //                  console.log(this);
            //                  console.log(this.name);
            //                  console.log('MODMOD ' + this.name);
            attributes.name = this.groupName;
        }
        //console.log(attributes);
        return node.window.getRadioButton(id, attributes);
    };

    // Override getAllValues for Radio Controls
    RadioControls.prototype.getValues = function() {

        for (var key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                var el = node.window.getElementById(key);
                if (el.checked) {
                    return el.value;
                }
            }
        }
        return false;
    };

})(node);

/**
 * # D3
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Integrates nodeGame with the D3 library to plot a real-time chart
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('D3', D3);
    node.widgets.register('D3ts', D3ts);

    D3.prototype.__proto__ = node.Widget.prototype;
    D3.prototype.constructor = D3;

    // ## Defaults

    D3.defaults = {};
    D3.defaults.id = 'D3';
    D3.defaults.fieldset = {
        legend: 'D3 plot'
    };


    // ## Meta-data

    D3.version = '0.1';
    D3.description = 'Real time plots for nodeGame with d3.js';

    // ## Dependencies

    D3.dependencies = {
        d3: {},
        JSUS: {}
    };

    function D3 (options) {
        this.id = options.id || D3.id;
        this.event = options.event || 'D3';
        this.svg = null;

        var that = this;
        node.on(this.event, function(value) {
            that.tick.call(that, value);
        });
    }

    D3.prototype.append = function(root) {
        this.root = root;
        this.svg = d3.select(root).append("svg");
        return root;
    };

    D3.prototype.tick = function() {};

    // # D3ts


    // ## Meta-data

    D3ts.id = 'D3ts';
    D3ts.version = '0.1';
    D3ts.description = 'Time series plot for nodeGame with d3.js';

    // ## Dependencies
    D3ts.dependencies = {
        D3: {},
        JSUS: {}
    };

    D3ts.prototype.__proto__ = D3.prototype;
    D3ts.prototype.constructor = D3ts;

    D3ts.defaults = {};

    D3ts.defaults.width = 400;
    D3ts.defaults.height = 200;

    D3ts.defaults.margin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
    };

    D3ts.defaults.domain = {
        x: [0, 10],
        y: [0, 1]
    };

    D3ts.defaults.range = {
        x: [0, D3ts.defaults.width],
        y: [D3ts.defaults.height, 0]
    };

    function D3ts(options) {
        var o, x, y;
        D3.call(this, options);

        this.options = o = JSUS.merge(D3ts.defaults, options);
        this.n = o.n;
        this.data = [0];

        this.margin = o.margin;

        this.width = o.width - this.margin.left - this.margin.right;
        this.height = o.height - this.margin.top - this.margin.bottom;

        // Identity function.
        this.x = x = d3.scale.linear()
            .domain(o.domain.x)
            .range(o.range.x);

        this.y = y = d3.scale.linear()
            .domain(o.domain.y)
            .range(o.range.y);

        // line generator
        this.line = d3.svg.line()
            .x(function(d, i) { return x(i); })
            .y(function(d, i) { return y(d); });
    }

    D3ts.prototype.init = function(options) {
        //D3.init.call(this, options);

        console.log('init!');
        var x = this.x,
        y = this.y,
        height = this.height,
        width = this.width,
        margin = this.margin;


        // Create the SVG and place it in the middle
        this.svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top +
                  ")");


        // Line does not go out the axis
        this.svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // X axis
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Y axis
        this.svg.append("g")
            .attr("class", "y axis")
            .call(d3.svg.axis().scale(y).orient("left"));

        this.path = this.svg.append("g")
            .attr("clip-path", "url(#clip)")
            .append("path")
            .data([this.data])
            .attr("class", "line")
            .attr("d", this.line);
    };

    D3ts.prototype.tick = function(value) {
        this.alreadyInit = this.alreadyInit || false;
        if (!this.alreadyInit) {
            this.init();
            this.alreadyInit = true;
        }

        var x = this.x;

        console.log('tick!');

        // push a new data point onto the back
        this.data.push(value);

        // redraw the line, and slide it to the left
        this.path
            .attr("d", this.line)
            .attr("transform", null);

        // pop the old data point off the front
        if (this.data.length > this.n) {

            this.path
                .transition()
                .duration(500)
                .ease("linear")
                .attr("transform", "translate(" + x(-1) + ")");

            this.data.shift();

        }
    };

})(node);

/**
 * # DebugInfo
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    var Table = node.window.Table;

    node.widgets.register('DebugInfo', DebugInfo);

    // ## Meta-data

    DebugInfo.version = '0.6.0';
    DebugInfo.description = 'Display basic info a client\'s status.';

    DebugInfo.title = 'Debug Info';
    DebugInfo.className = 'debuginfo';

    // ## Dependencies

    DebugInfo.dependencies = {
        Table: {}
    };

    /**
     * ## DebugInfo constructor
     *
     * `DebugInfo` displays information about the state of a player
     */
    function DebugInfo() {

        /**
         * ### DebugInfo.table
         *
         * The `Table` which holds the information
         *
         * @See nodegame-window/Table
         */
        this.table = null;

        /**
         * ### DebugInfo.interval
         *
         * The interval checking node properties
         */
        this.interval = null;

        /**
         * ### DebugInfo.intervalTime
         *
         * The frequency of update of the interval. Default: 1000
         */
        this.intervalTime = 1000;
    }

    // ## DebugInfo methods

    /**
     * ### DebugInfo.init
     *
     * Appends widget to `this.bodyDiv` and calls `this.updateAll`
     *
     * @see DebugInfo.updateAll
     */
    DebugInfo.prototype.init = function(options) {
        if ('number' === typeof options.intervalTime) {
            this.intervalTime = options.intervalTime;
        }
    };

    /**
     * ### DebugInfo.append
     *
     * Appends widget to `this.bodyDiv` and calls `this.updateAll`
     *
     * @see DebugInfo.updateAll
     */
    DebugInfo.prototype.append = function() {
        var that;

        this.table = new Table();
        this.bodyDiv.appendChild(this.table.table);

        this.updateAll();
        that = this;
        this.interval = setInterval(function() {
            that.updateAll();
        }, this.intervalTime);
    };

    /**
     * ### DebugInfo.updateAll
     *
     * Updates information in `this.table`
     */
    DebugInfo.prototype.updateAll = function() {
        var stage, stageNo, stageId, playerId;
        var stageLevel, stateLevel, winLevel;
        var errMsg, connected, treatment;
        var tmp, miss;

        if (!this.bodyDiv) {
            node.err('DebugInfo.updateAll: bodyDiv not found.');
            return;
        }

        miss = '-';

        stageId = miss;
        stageNo = miss;

        stage = node.game.getCurrentGameStage();
        if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

        stageLevel = J.getKeyByValue(node.constants.stageLevels,
                                     node.game.getStageLevel());

        stateLevel = J.getKeyByValue(node.constants.stateLevels,
                                     node.game.getStateLevel());

        winLevel = J.getKeyByValue(node.constants.windowLevels,
                                   W.getStateLevel());


        playerId = node.player ? node.player.id : miss;

        errMsg = node.errorManager.lastErr || miss;

        treatment = node.game.settings && node.game.settings.treatmentName ?
            node.game.settings.treatmentName : miss;

        connected = node.socket.connected ? 'yes' : 'no';

        this.table.clear(true);
        this.table.addRow(['Treatment: ', treatment]);
        this.table.addRow(['Connected: ', connected]);
        this.table.addRow(['Player Id: ', playerId]);
        this.table.addRow(['Stage  No: ', stageNo]);
        this.table.addRow(['Stage  Id: ', stageId]);
        this.table.addRow(['Stage Lvl: ', stageLevel]);
        this.table.addRow(['State Lvl: ', stateLevel]);
        this.table.addRow(['Players  : ', node.game.pl.size()]);
        this.table.addRow(['Win   Lvl: ', winLevel]);
        this.table.addRow(['Win Loads: ', W.areLoading]);
        this.table.addRow(['Last  Err: ', errMsg]);

        this.table.parse();

    };

    DebugInfo.prototype.destroy = function() {
        clearInterval(this.interval);
        this.interval = null;
        node.silly('DebugInfo destroyed.');
    };

})(node);

/**
 * # DisconnectBox
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Shows a disconnect button
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DisconnectBox', DisconnectBox);

    // ## Meta-data

    DisconnectBox.version = '0.2.2';
    DisconnectBox.description =
        'Visually display current, previous and next stage of the game.';

    DisconnectBox.title = 'Disconnect';
    DisconnectBox.className = 'disconnectbox';

    // ## Dependencies

    DisconnectBox.dependencies = {};

    /**
     * ## DisconnectBox constructor
     *
     * `DisconnectBox` displays current, previous and next stage of the game
     */
    function DisconnectBox() {
        // ### DisconnectBox.disconnectButton
        // The button for disconnection
        this.disconnectButton = null;
        // ### DisconnectBox.ee
        // The event emitter with whom the events are registered
        this.ee = null;
    }

    // ## DisconnectBox methods

    /**
     * ### DisconnectBox.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see DisconnectBox.writeStage
     */
    DisconnectBox.prototype.append = function() {
        this.disconnectButton = W.getButton(undefined, 'Leave Experiment');
        this.disconnectButton.className = 'btn btn-lg';
        this.bodyDiv.appendChild(this.disconnectButton);

        this.disconnectButton.onclick = function() {
            node.socket.disconnect();
        };
    };

    DisconnectBox.prototype.listeners = function() {
        var that = this;

        this.ee = node.getCurrentEventEmitter();
        this.ee.on('SOCKET_DISCONNECT', function DBdiscon() {
            console.log('DB got socket_diconnect');
            that.disconnectButton.disabled = true;
        });

        this.ee.on('SOCKET_CONNECT', function DBcon() {
            console.log('DB got socket_connect');
        });
    };

    DisconnectBox.prototype.destroy = function() {
        this.ee.off('SOCKET_DISCONNECT', 'DBdiscon');
        this.ee.off('SOCKET_CONNECT', 'DBcon');
    };


})(node);

/**
 * # DoneButton
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a button that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('DoneButton', DoneButton);

    // ## Meta-data

    DoneButton.version = '0.2.0';
    DoneButton.description = 'Creates a button that if ' +
        'pressed emits node.done().';

    DoneButton.title = 'Done Button';
    DoneButton.className = 'donebutton';

    DoneButton.text = 'I am done';

    // ## Dependencies

    DoneButton.dependencies = {
        JSUS: {}
    };

    /**
     * ## DoneButton constructor
     *
     * Creates a new instance of DoneButton
     *
     * @param {object} options Optional. Configuration options.
     *   If a `button` option is specified, it sets it as the clickable
     *   button. All other options are passed to the init method.
     *
     * @see DoneButton.init
     */
    function DoneButton(options) {
        var that;
        that = this;

        /**
         * ### DoneButton.button
         *
         * The HTML element triggering node.done() when pressed
         */
        if ('object' === typeof options.button) {
            this.button = options.button;
        }
        else if ('undefined' === typeof options.button) {
            this.button = document.createElement('input');
            this.button.type = 'button';
        }
        else {
            throw new TypeError('DoneButton constructor: options.button must ' +
                                'be object or undefined. Found: ' +
                                options.button);
        }

        this.button.onclick = function() {
            var res;
            res = node.done();
            if (res) that.disable();
        };

        this.init(options);
    }

    // ## DoneButton methods

    /**
     * ### DoneButton.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     * - id: id of the HTML button, or false to have none. Default:
     *     DoneButton.className
     * - className: the className of the button (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the button. Default: DoneButton.text
     *
     * @param {object} options Optional. Configuration options
     */
    DoneButton.prototype.init = function(options) {
        var tmp;
        options = options || {};

        //Button
        if ('undefined' === typeof options.id) {
            tmp = DoneButton.className;
        }
        else if ('string' === typeof options.id) {
            tmp = options.id;
        }
        else if (false === options.id) {
            tmp = '';
        }
        else {
            throw new TypeError('DoneButton.init: options.id must ' +
                                'be string, false, or undefined. Found: ' +
                                options.id);
        }
        this.button.id = tmp;

        // Button className.
        if ('undefined' === typeof options.className) {
            tmp  = 'btn btn-lg btn-primary';
        }
        else if (options.className === false) {
            tmp = '';
        }
        else if ('string' === typeof options.className) {
            tmp = options.className;
        }
        else if (J.isArray(options.className)) {
            tmp = options.className.join(' ');
        }
        else  {
            throw new TypeError('DoneButton.init: options.className must ' +
                                'be string, array, or undefined. Found: ' +
                                options.className);
        }
        this.button.className = tmp;


        // Button text.
        this.setText(options.text);
    };

    DoneButton.prototype.append = function() {
        this.bodyDiv.appendChild(this.button);
    };

    DoneButton.prototype.listeners = function() {
        var that = this;

        // This is normally executed after the PLAYING listener of
        // GameWindow where lockUnlockedInputs takes place.
        // In case of a timeup, the donebutton will be locked and
        // then unlocked by GameWindow, but otherwise it must be
        // done here.
        node.on('PLAYING', function() {
            var prop, step;
            step = node.game.getCurrentGameStage();
            prop = node.game.plot.getProperty(step, 'donebutton');
            if (prop === false || (prop && prop.enableOnPlaying === false)) {
                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                that.enable();
            }
            if (prop && prop.text) {
                that.button.value = prop.text;
            }
        });
    };

    /**
     * ### DoneButton.disable
     *
     * Disables the done button
     */
    DoneButton.prototype.disable = function() {
        this.button.disabled = 'disabled';
    };

    /**
     * ### DoneButton.enable
     *
     * Enables the done button
     */
    DoneButton.prototype.enable = function() {
        this.button.disabled = false;
    };

    /**
     * ### DoneButton.setText
     *
     * Set the text for the done button
     *
     * @param {string} text Optional. The text of the button.
     *   Default: DoneButton.text
     */
    DoneButton.prototype.setText = function(text) {
        if ('undefined' === typeof text) {
            text = DoneButton.text;
        }
        else if ('string' !== typeof text) {
            throw new TypeError('DoneButton.setText: text must ' +
                                'be string or undefined. Found: ' +
                                typeof text);
        }
        this.button.value = text;
    };

})(node);

/**
 * # DynamicTable
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Extends the GameTable widgets by allowing dynamic reshaping
 *
 * TODO: this widget needs refactoring.
 *
 * @experimental
 * @see GameTable widget
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var GameStage = node.GameStage,
    Table = node.window.Table,
    HTMLRenderer = node.window.HTMLRenderer,
    J = node.JSUS;


    node.widgets.register('DynamicTable', DynamicTable);


    DynamicTable.prototype = new Table();
    DynamicTable.prototype.constructor = Table;


    DynamicTable.id = 'dynamictable';
    DynamicTable.version = '0.3.1';

    DynamicTable.dependencies = {
        Table: {},
        JSUS: {},
        HTMLRenderer: {}
    };

    function DynamicTable (options, data) {
        //JSUS.extend(node.window.Table,this);
        Table.call(this, options, data);
        this.options = options;

        this.name = options.name || 'Dynamic Table';

        this.root = null;
        this.bindings = {};
        this.init(this.options);
    }

    DynamicTable.prototype.init = function(options) {
        this.options = options;
        this.name = options.name || this.name;
        this.auto_update = ('undefined' !== typeof options.auto_update) ?
            options.auto_update : true;
        this.replace = options.replace || false;
        this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
        this.c('state', GameStage.compare);
        this.setLeft([]);
        this.parse(true);
    };

    DynamicTable.prototype.bind = function(event, bindings) {
        if (!event || !bindings) return;
        var that = this;

        node.on(event, function(msg) {

            if (bindings.x || bindings.y) {
                // Cell
                var func;
                if (that.replace) {
                    func = function(x, y) {
                        var found = that.get(x,y);
                        if (found.length !== 0) {
                            for (var ci=0; ci < found.length; ci++) {
                                bindings.cell.call(that, msg, found[ci]);
                            }
                        }
                        else {
                            var cell = bindings.cell.call(
                                that, msg, new Table.Cell({x: x, y: y}));
                            that.add(cell);
                        }
                    };
                }
                else {
                    func = function(x, y) {
                        var cell = bindings.cell.call(
                                that, msg, new Table.Cell({x: x, y: y}));
                        that.add(cell, x, y);
                    };
                }

                var x = bindings.x.call(that, msg);
                var y = bindings.y.call(that, msg);

                if (x && y) {

                    x = (x instanceof Array) ? x : [x];
                    y = (y instanceof Array) ? y : [y];

                    //console.log('Bindings found:');
                    //console.log(x);
                    //console.log(y);

                    for (var xi=0; xi < x.length; xi++) {
                        for (var yi=0; yi < y.length; yi++) {
                            // Replace or Add
                            func.call(that, x[xi], y[yi]);
                        }
                    }
                }
                // End Cell
            }

            // Header
            if (bindings.header) {
                var h = bindings.header.call(that, msg);
                h = (h instanceof Array) ? h : [h];
                that.setHeader(h);
            }

            // Left
            if (bindings.left) {
                var l = bindings.left.call(that, msg);
                if (!J.inArray(l, that.left)) {
                    that.header.push(l);
                }
            }

            // Auto Update?
            if (that.auto_update) {
                that.parse();
            }
        });

    };

    DynamicTable.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.table);
        return root;
    };

    DynamicTable.prototype.listeners = function() {};

})(node);

(function() {  // self-executing function for encapsulation

    // Register the widget in the widgets collection.
    node.widgets.register('EndScreen', EndScreen);

    // Add Meta-data
    EndScreen.version = '0.1.0';
    EndScreen.description = 'Game end screen. With end game message, ' +
    'email form, and exit code.';

    // Title is displayed in the header.
    // is this necessary?
    EndScreen.title = 'End Screen';
    // Classname is added to the widgets.
    EndScreen.className = 'end-screen';

    // Dependencies are checked when the widget is created.
    EndScreen.dependencies = { JSUS: {} };

    // Constructor taking a configuration parameter.
    // The options object is always existing even if no
    //
    function EndScreen(options) {
        /**
         * ### EndScreen.headerMessage
         *
         * The header message displayed at the top of the screen
         *
         * Default: 'Thank you for participating!'
         */
        if ('undefined' === typeof options.headerMessage) {
            this.headerMessage = 'Thank you for participating!';
        }
        else if ('string' === typeof options.headerMessage) {
            this.headerMessage = options.headerMessage;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.headerMessage ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.headerMessage);
        }

        /**
         * ### EndScreen.message
         *
         * The informational message displayed in the body of the screen
         *
         * Default: 'You have now completed this task and your data
         *           has been saved. Please go back to the Amazon Mechanical
         *           Turk web site and submit the HIT.'
         */
        if ('undefined' === typeof options.message) {
            this.message =  'You have now completed this task ' +
                            'and your data has been saved. ' +
                            'Please go back to the Amazon Mechanical Turk ' +
                            'web site and ' +
                            'submit the HIT.';
        }
        else if ('string' === typeof options.message) {
            this.message = options.message;
        }
        else {
            throw new TypeError('EndScreen constructor: options.message ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.message);
        }

        /**
         * ### EndScreen.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        if ('undefined' === typeof options.showEmailForm) {
            this.showEmailForm = true;
        }
        else if ('boolean' === typeof options.showEmailForm) {
            this.showEmailForm = options.showEmailForm;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showEmailForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showEmailForm);
        }

        /**
         * ### EndScreen.showFeedbackForm
         *
         * If true, the feedback form is shown
         *
         * Default: true
         */
        if ('undefined' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = true;
        }
        else if ('boolean' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = options.showFeedbackForm;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showFeedbackForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showFeedbackForm);
        }

        /**
         * ### EndScreen.showTotalWin
         *
         * If true, the total win is shown
         *
         * Default: true
         */
        if ('undefined' === typeof options.showTotalWin) {
            this.showTotalWin = true;
        }
        else if ('boolean' === typeof options.showTotalWin) {
            this.showTotalWin = options.showTotalWin;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showTotalWin ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showTotalWin);
        }

        /**
         * ### EndScreen.showExitCode
         *
         * If true, the exit code is shown
         *
         * Default: true
         */
        if ('undefined' === typeof options.showExitCode) {
            this.showExitCode = true;
        }
        else if ('boolean' === typeof options.showExitCode) {
            this.showExitCode = options.showExitCode;
        }
        else {
            throw new TypeError('EndScreen constructor: ' +
                                'options.showExitCode ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showExitCode);
        }

        /**
         * ### EndScreen.feedback
         *
         * Feedback widget element
         *
         * Default: new Feedback(option)
         */
        this.feedback = node.widgets.get('Feedback', options);

        /**
         * ### EndScreen.endScreenElement
         *
         * Endscreen HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.endScreenHTML = null;

        this.init();
    }

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen();
        this.bodyDiv.append(this.endScreenHTML);
    };

    // makes the end screen
    EndScreen.prototype.makeEndScreen = function() {
        var endScreenElement;
        var headerElement, messageElement;
        var totalWinElement, totalWinParaElement, totalWinInputElement;
        var exitCodeElement, exitCodeParaElement, exitCodeInputElement;
        var emailElement, emailFormElement, emailLabelElement,
            emailInputElement, emailButtonElement;
        var emailErrorString;

        emailErrorString = 'Not a valid email address, ' +
                           'please correct it and submit again.';

        endScreenElement = document.createElement('div');
        endScreenElement.className = 'endscreen';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.headerMessage;
        endScreenElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = this.message;
        endScreenElement.appendChild(messageElement);

        if (this.showTotalWin) {
            totalWinElement = document.createElement('div');

            totalWinParaElement = document.createElement('p');
            totalWinParaElement.innerHTML = 'Your total win: ';

            totalWinInputElement = document.createElement('input');
            totalWinInputElement.className = 'endscreen-total form-control';
            totalWinInputElement.setAttribute('disabled', 'true');

            totalWinParaElement.appendChild(totalWinInputElement);
            totalWinElement.appendChild(totalWinParaElement);

            endScreenElement.appendChild(totalWinElement);
            this.totalWinInputElement = totalWinInputElement;
        }

        if (this.showExitCode) {
            exitCodeElement = document.createElement('div');

            exitCodeParaElement = document.createElement('p');
            exitCodeParaElement.innerHTML = 'Your exit code: ';

            exitCodeInputElement = document.createElement('input');
            exitCodeInputElement.className = 'endscreen-exit-code ' +
                                             'form-control';
            exitCodeInputElement.setAttribute('disabled', 'true');

            exitCodeParaElement.appendChild(exitCodeInputElement);
            exitCodeElement.appendChild(exitCodeParaElement);

            endScreenElement.appendChild(exitCodeElement);
            this.exitCodeInputElement = exitCodeInputElement;
        }

        if (this.showEmailForm) {
            emailElement = document.createElement('div');
            emailFormElement = document.createElement('form');
            emailFormElement.className = 'endscreen-email-form';

            emailLabelElement = document.createElement('label');
            emailLabelElement.innerHTML = 'Would you like to be contacted ' +
                                          'again for future experiments? ' +
                                          'If so, leave your email here ' +
                                          'and press submit: ';

            emailInputElement = document.createElement('input');
            emailInputElement.setAttribute('type', 'text');
            emailInputElement.setAttribute('placeholder', 'Email');
            emailInputElement.className = 'endscreen-email-input form-control';

            emailButtonElement = document.createElement('input');
            emailButtonElement.setAttribute('type', 'submit');
            emailButtonElement.setAttribute('value', 'Submit email');
            emailButtonElement.className = 'btn btn-lg btn-primary ' +
                                           'endscreen-email-submit';

            emailFormElement.appendChild(emailLabelElement);
            emailFormElement.appendChild(emailInputElement);
            emailFormElement.appendChild(emailButtonElement);

            emailElement.appendChild(emailFormElement);
            endScreenElement.appendChild(emailElement);

            emailFormElement.addEventListener('submit', function(event) {
                var email, indexAt, indexDot;

                event.preventDefault();
                email = emailInputElement.value;

                if (email.trim().length > 5) {
                    indexAt = email.indexOf('@');
                    if (indexAt !== -1 &&
                        indexAt !== 0 &&
                        indexAt !== (email.length-1)) {

                        indexDot = email.lastIndexOf('.');
                        if (indexDot !== -1 &&
                            indexDot !== (email.length-1) &&
                            indexDot > (indexAt+1)) {

                            node.say('email', 'SERVER', email);

                            emailButtonElement.disabled = true;
                            emailInputElement.disabled = true;
                            emailButtonElement.value = 'Sent!';
                        }
                    }
                }

                emailButtonElement.value = emailErrorString;
            }, true);
        }

        if (this.showFeedbackForm) {
            node.widgets.append(this.feedback, endScreenElement);
        }

        return endScreenElement;
    };

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
        var that;

        that = this;

        // Listeners added here are automatically removed
        // when the widget is destroyed.
        node.on.data('WIN', function(message) {
            var totalWin;
            var exitCode;
            var data;

            var totalHTML, exitCodeHTML;

            data = message.data;
            totalWin = data.total;
            exitCode = data.exit;

            if (JSUS.isNumber(totalWin, 0) === false) {
                node.err('EndScreen error, invalid exit code: ' + totalWin);
                totalWin = 'Error: invalid total win.';
            }

            if ((typeof exitCode !== 'string')) {
                node.err('EndScreen error, invalid exit code: ' + exitCode);
                exitCode = 'Error: invalid exit code.';
            }

            totalHTML = that.totalWinInputElement;
            exitCodeHTML = that.exitCodeInputElement;

            if (totalHTML && that.showTotalWin) {
                totalHTML.value = totalWin;
            }

            if (exitCodeHTML && that.showExitCode) {
                exitCodeHTML.value = exitCode;
            }
        });
    };
})(node);

/**
 * # Feedback
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Feedback', Feedback);

    // ## Meta-data

    Feedback.version = '0.3';
    Feedback.description = 'Displays a simple feedback form.';

    Feedback.title = 'Feedback';
    Feedback.className = 'feedback';

    // ## Dependencies

    Feedback.dependencies = {
        JSUS: {}
    };

    /**
     * ## Feedback constructor
     *
     * `Feedback` sends a feedback message to the server
     *
     * @param {object} options configuration option
     */
    function Feedback(options) {
        /**
         * ### Feedback.label
         *
         * The label for the feedback element
         *
         * Default: 'Any feedback about the experiment? Let us know here: '
         */
        if ('undefined' === typeof options.label) {
            this.label = 'Any feedback about the experiment? Let us know here:';
        }
        else if ('string' === typeof options.label) {
            this.label = options.label;
        }
        else {
            throw new TypeError('Feedback constructor: options.label ' +
                                'must be string or undefined. ' +
                                'Found: ' + options.label);
        }

        /**
         * ### Feedback.maxFeedbackLength
         *
         * The maximum character length for feedback to be submitted
         *
         * Default: 800
         */
        if ('undefined' === typeof options.maxLength) {
            this.maxFeedbackLength = 800;
        }
        else if (JSUS.isNumber(options.maxLength, 0) !== false) {
            this.maxFeedbackLength = options.maxLength;
        }
        else {
            throw new TypeError('Feedback constructor: options.maxLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.maxLength);
        }

        /**
         * ### Feedback.minFeedbackLength
         *
         * The minimum character length for feedback to be submitted
         *
         * If minFeedbackLength = 0, then there is no minimum length checked.
         * Default: 0
         */
        if ('undefined' === typeof options.minLength) {
            this.minFeedbackLength = 0;
        }
        else if (JSUS.isNumber(options.minLength, 0) !== false) {
            this.minFeedbackLength = options.minLength;
        }
        else {
            throw new TypeError('Feedback constructor: options.minLength ' +
                                'must be a number >= 0 or undefined. ' +
                                'Found: ' + options.minLength);
        }

        /**
         * ### Feedback.feedbackHTML
         *
         * The HTML element containing the form elements
         */
        this.feedbackHTML = null;
    }

    // ## Feedback methods

    Feedback.prototype.createForm = function(showCount, minLength, maxLength, labelText) {
        var feedbackHTML;
        var feedbackForm;
        var feedbackLabel;
        var feedbackTextarea;
        var submit;
        var charCounter;

        feedbackHTML = document.createElement('div');
        feedbackHTML.className = 'feedback';

        feedbackForm = document.createElement('form');
        feedbackForm.className = 'feedback-form';
        feedbackHTML.appendChild(feedbackForm);

        feedbackLabel = document.createElement('label');
        feedbackLabel.setAttribute('for', 'feedback-input');
        feedbackLabel.innerHTML = labelText;
        feedbackForm.appendChild(feedbackLabel);

        feedbackTextarea = document.createElement('textarea');
        feedbackTextarea.className = 'feedback-textarea form-control';
        feedbackTextarea.setAttribute('type', 'text');
        feedbackTextarea.setAttribute('rows', '3');
        feedbackForm.appendChild(feedbackTextarea);

        submit = document.createElement('input');
        submit.className = 'btn btn-lg btn-primary';
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'Submit feedback');
        feedbackForm.appendChild(submit);

        charCounter = document.createElement('span');
        charCounter.className = 'feedback-char-count badge';
        charCounter.innerHTML = maxLength;
        feedbackForm.appendChild(charCounter);

        feedbackForm.addEventListener('submit', function(event) {
            var feedback;

            event.preventDefault();

            feedback = feedbackTextarea.value.trim();
            node.say('feedback', 'SERVER', feedback);

            submit.disabled = true;
            feedbackTextarea.disabled = true;

            submit.setAttribute('value', 'Sent!');
        });

        feedbackForm.addEventListener('input', function(event) {
            checkFeedbackLength(feedbackTextarea, charCounter, submit, minLength, maxLength);
        });

        checkFeedbackLength(feedbackTextarea, charCounter, submit, minLength, maxLength);

        return feedbackHTML;
    };

    /**
     * ### Feedback.append
     *
     * Appends widget to this.bodyDiv
     */
    Feedback.prototype.append = function() {
        this.feedbackHTML = this.createForm(this.showCharCount,
                                            this.minFeedbackLength,
                                            this.maxFeedbackLength,
                                            this.label);
        this.bodyDiv.appendChild(this.feedbackHTML);
    };

    Feedback.prototype.listeners = function() {};

    // check the feedback length
    function checkFeedbackLength(feedbackTextarea, charCounter,
                                 submit, minLength, maxLength) {
        var length;

        length = feedbackTextarea.value.trim().length;

        if (length < minLength) {
          submit.disabled = true;

          charCounter.innerHTML = (minLength - length) + ' characters needed.';
          charCounter.style.backgroundColor = '#f2dede';
        }
        else if (length > maxLength) {
          submit.disabled = true;

          charCounter.innerHTML = (length - maxLength) + ' characters over.';
          charCounter.style.backgroundColor = '#f2dede';
        }
        else {
          submit.disabled = false;

          charCounter.innerHTML = (maxLength - length) + ' characters remaining.';
          charCounter.style.backgroundColor = '#dff0d8';
        }
    }

})(node);

/**
 * # GameBoard
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Displays a table of currently connected players
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('GameBoard', GameBoard);

    // ## Meta-data

    GameBoard.version = '0.4.1';
    GameBoard.description = 'Offer a visual representation of the state of ' +
                            'all players in the game.';

    GameBoard.title = 'Game Board';
    GameBoard.className = 'gameboard';

    /**
     * ## GameBoard constructor
     *
     * `GameBoard` shows the currently connected players
     */
    function GameBoard(options) {
        /**
         * ### GameBoard.board
         *
         * The DIV wherein to display the players
         */
        this.board = null;

        /**
         * ### GameBoard.status
         *
         * The DIV wherein to display the status of the game board
         */
        this.status = null;
    }

    // ## GameBoard methods

    /**
     * ### GameBoard.append
     *
     * Appends widget to `this.bodyDiv` and updates the board
     *
     * @see GameBoard.updateBoard
     */
    GameBoard.prototype.append = function() {
        this.status = node.window.addDiv(this.bodyDiv, 'gboard_status');
        this.board = node.window.addDiv(this.bodyDiv, 'gboard');

        this.updateBoard(node.game.pl);
    };

    GameBoard.prototype.listeners = function() {
        var that = this;
        node.on('UPDATED_PLIST', function() {
            that.updateBoard(node.game.pl);
        });
    };

    /**
     * ### GameBoard.updateBoard
     *
     * Updates the information on the game board
     *
     * @see printLine
     */
    GameBoard.prototype.updateBoard = function(pl) {
        var player, separator;
        var that = this;

        this.status.innerHTML = 'Updating...';

        if (pl.size()) {
            that.board.innerHTML = '';
            pl.forEach( function(p) {
                player = printLine(p);

                W.write(player, that.board);

                separator = printSeparator();
                W.write(separator, that.board);
            });
        }
        this.status.innerHTML = 'Connected players: ' + node.game.pl.length;
    };

    // ## Helper methods

     /**
     * ### printLine
     *
     * Returns a `String` describing the player passed in
     *
     * @param {Player} `p`. Player object which will be passed in by a call to
     * `node.game.pl.forEach`.
     *
     * @return {String} A string describing the `Player` `p`.
     *
     * @see GameBoard.updateBoard
     * @see nodegame-client/Player
     */
    function printLine(p) {

        var line, levels, level;
        levels = node.constants.stageLevels;

        line = '[' + (p.name || p.id) + "]> \t";
        line += '(' +  p.stage.round + ') ' + p.stage.stage + '.' +
                p.stage.step;
        line += ' ';

        switch (p.stageLevel) {

        case levels.UNINITIALIZED:
            level = 'uninit.';
            break;

        case levels.INITIALIZING:
            level = 'init...';
            break;

        case levels.INITIALIZING:
            level = 'init!';
            break;

        case levels.LOADING:
            level = 'loading';
            break;

        case levels.LOADED:
            level = 'loaded';
            break;

        case levels.PLAYING:
            level = 'playing';
            break;
        case levels.DONE:
            level = 'done';
            break;

        default:
            level = p.stageLevel;
            break;
        }

        return line + '(' + level + ')';
    }

    function printSeparator() {
        return W.getElement('hr', null, {style: 'color: #CCC;'});
    }

})(node);

/**
 * # GameTable
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that renders in each cell data captured by fired events
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var GameStage = node.GameStage,
    PlayerList = node.PlayerList;

    node.widgets.register('GameTable', GameTable);

    // ## Defaults

    GameTable.defaults = {};
    GameTable.defaults.id = 'gametable';
    GameTable.defaults.fieldset = {
        legend: 'Game Table',
        id: 'gametable_fieldset'
    };

    // ## Meta-data

    GameTable.version = '0.3';

    // ## Dependencies

    GameTable.dependencies = {
        JSUS: {}
    };

    function GameTable (options) {
        this.options = options;
        this.id = options.id;
        this.name = options.name || GameTable.name;

        this.root = null;
        this.gtbl = null;
        this.plist = null;

        this.init(this.options);
    }

    GameTable.prototype.init = function(options) {

        if (!this.plist) this.plist = new PlayerList();

        this.gtbl = new node.window.Table({
            auto_update: true,
            id: options.id || this.id,
            render: options.render
        }, node.game.memory.db);


        this.gtbl.c('state', GameStage.compare);

        this.gtbl.setLeft([]);

        this.gtbl.parse(true);
    };


    GameTable.prototype.addRenderer = function(func) {
        return this.gtbl.addRenderer(func);
    };

    GameTable.prototype.resetRender = function() {
        return this.gtbl.resetRenderer();
    };

    GameTable.prototype.removeRenderer = function(func) {
        return this.gtbl.removeRenderer(func);
    };

    GameTable.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.gtbl.table);
        return root;
    };

    GameTable.prototype.listeners = function() {
        var that = this;

        node.on.plist(function(msg) {
            if (!msg.data.length) return;

            //var diff = JSUS.arrayDiff(msg.data,that.plist.db);
            var plist = new PlayerList({}, msg.data);
            var diff = plist.diff(that.plist);
            if (diff) {
                //console.log('New Players found');
                //console.log(diff);
                diff.forEach(function(el){that.addPlayer(el);});
            }

            that.gtbl.parse(true);
        });

        node.on('in.set.DATA', function(msg) {

            that.addLeft(msg.state, msg.from);
            var x = that.player2x(msg.from);
            var y = that.state2y(node.game.state, msg.text);

            that.gtbl.add(msg.data, x, y);
            that.gtbl.parse(true);
        });
    };

    GameTable.prototype.addPlayer = function(player) {
        this.plist.add(player);
        var header = this.plist.map(function(el){return el.name;});
        this.gtbl.setHeader(header);
    };

    GameTable.prototype.addLeft = function(state, player) {
        if (!state) return;
        state = new GameStage(state);
        if (!JSUS.in_array({content:state.toString(), type: 'left'},
                    this.gtbl.left)) {

            this.gtbl.add2Left(state.toString());
        }
        // Is it a new display associated to the same state?
        else {
            var y = this.state2y(state);
            var x = this.player2x(player);
            if (this.gtbl.select('y','=',y).select('x','=',x).count() > 1) {
                this.gtbl.add2Left(state.toString());
            }
        }

    };

    GameTable.prototype.player2x = function(player) {
        if (!player) return false;
        return this.plist.select('id', '=', player).first().count;
    };

    GameTable.prototype.x2Player = function(x) {
        if (!x) return false;
        return this.plist.select('count', '=', x).first().count;
    };

    GameTable.prototype.state2y = function(state) {
        if (!state) return false;
        return node.game.plot.indexOf(state);
    };

    GameTable.prototype.y2State = function(y) {
        if (!y) return false;
        return node.game.plot.jumpTo(new GameStage(),y);
    };

})(node);

/**
 * # LanguageSelector
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Manages and displays information about languages available and selected
 *
 * www.nodegame.org
 */
 (function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('LanguageSelector', LanguageSelector);

    // ## Meta-data

    LanguageSelector.version = '0.3.1';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allows to change language.';
    LanguageSelector.title = 'Language';
    LanguageSelector.className = 'languageselector';

    // ## Dependencies

    LanguageSelector.dependencies = {
        JSUS: {}
    };

    /**
     * ## LanguageSelector constructor
     *
     * Manages the setting and display of the language used
     *
     * @param {object} options Optional. Configuration options
     *
     * @see Player.lang
     */
    function LanguageSelector(options) {
        var that = this;

        this.options = options;

        /**
         * ### LanguageSelector.availableLanguages
         *
         * Object containing an object per availble language.
         *
         * The language object contains at least the following properties:
         *
         * - `name`: Name of the language in English.
         * - `nativeName`: Native name of the language
         * - `shortName`: An abbreviation for the language, also determines the
         *    path to the context files for this language.
         *
         * The key for each language object is its `shortName`.
         *
         * @see Player.lang
         */
        this.availableLanguages = {
            en: {
                name: 'English',
                nativeName: 'English',
                shortName: 'en'
            }
        };

        /**
         * ### LanguageSelector.currentLanguageIndex
         *
         * A reference to the currently used language
         *
         * @see LanguageSelector.availableLanguages
         */
        this.currentLanguage = null;

        /**
         * ### LanguageSelector.buttonListLength
         *
         * Specifies maximum number of radio buttons used in selection tool
         */
        this.buttonListLength = null;

        /**
         * ### LanguageSelector.displayForm
         *
         * The form in which the widget displays the language information
         */
        this.displayForm = null;

        /**
         * ### LanguageSelector.optionsLabel
         *
         * Array containing the labels for the language selection optionsDisplay
         */
        this.optionsLabel = {};

        /**
         * ### LanguageSelector.optionsDisplay
         *
         * Array containing the optionsDisplay for the language selection
         */
        this.optionsDisplay = {};

        /**
         * ### LanguageSelector.loadingDiv
         *
         * Div displaying information on whether the languages have been loaded
         */
        this.loadingDiv = null;

        /**
         * ### LanguageSelector.languagesLoaded
         *
         * Flag indicating whether languages have been loaded from server
         */
        this.languagesLoaded = false;

        /**
         * ## LanguageSelector.usingButtons
         *
         * Flag indicating if the interface should have buttons
         */
        this.usingButtons = null;

        /**
         * ### LanguageSelector.onLangCallback
         *
         * Function to be called when languages have been loaded
         *
         * Initializes form displaying the information as well
         * as the optionsDisplay and their labels.
         * Initializes language to English.
         * Forwards to `LanguageSelector.onLangCallbackExtension` at the very
         * end.
         *
         * @param {object} msg GameMsg
         *
         * @see LanguageSelector.setLanguage
         */
        this.onLangCallback = function(msg) {
            var language;

            // Clear display.
            while (that.displayForm.firstChild) {
                that.displayForm.removeChild(that.displayForm.firstChild);
            }

            // Initialize widget.
            that.availableLanguages = msg.data;
            if (that.usingButtons) {

                // Creates labeled buttons.
                for (language in msg.data) {
                    if (msg.data.hasOwnProperty(language)) {
                        that.optionsLabel[language] = W.getElement('label',
                            language + 'Label', {
                                'for': language + 'RadioButton'
                            });

                        that.optionsDisplay[language] = W.getElement('input',
                            language + 'RadioButton', {
                                type: 'radio',
                                name: 'languageButton',
                                value: msg.data[language].name
                            }
                        );

                        that.optionsDisplay[language].onclick =
                            makeSetLanguageOnClick(language);

                        that.optionsLabel[language].appendChild(
                            that.optionsDisplay[language]);
                        that.optionsLabel[language].appendChild(
                            document.createTextNode(
                                msg.data[language].nativeName));
                        node.window.addElement('br', that.displayForm);
                        that.optionsLabel[language].className =
                            'unselectedButtonLabel';
                        that.displayForm.appendChild(
                                that.optionsLabel[language]);
                    }
                }
            }
            else {

                that.displaySelection = node.window.getElement('select',
                    'selectLanguage');
                for (language in msg.data) {
                    that.optionsLabel[language] =
                        document.createTextNode(msg.data[language].nativeName);
                    that.optionsDisplay[language] = node.window.getElement(
                        'option', language + 'Option', { value: language });
                    that.optionsDisplay[language].appendChild(
                        that.optionsLabel[language]);
                    that.displaySelection.appendChild(
                        that.optionsDisplay[language]);

                }
                that.displayForm.appendChild(that.displaySelection);
                that.displayForm.onchange = function() {
                    that.setLanguage(that.displaySelection.value);
                };
            }

            that.loadingDiv.style.display = 'none';
            that.languagesLoaded = true;

            // Initialize to English.
            that.setLanguage('en');

            // Extension point.
            if (that.onLangCallbackExtension) {
                that.onLangCallbackExtension(msg);
                that.onLangCallbackExtension = null;
            }

            function makeSetLanguageOnClick(langName) {
                return function() {
                    that.setLanguage(langName);
                };
            }
        };

        /**
         * ### LanguageSelector.onLangCallbackExtension
         *
         * Extension point to `LanguageSelector.onLangCallback`
         *
         * @see LanguageSelector.onLangCallback
         */
        this.onLangCallbackExtension = null;

        this.init(this.options);
    }

    // ## LanguageSelector methods

    /**
     * ### LanguageSelector.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options
     *
     * @see LanguageSelector.onLangCallback
     */
    LanguageSelector.prototype.init = function(options) {
        J.mixout(options, this.options);
        this.options = options;

        this.usingButtons = this.options.usingButtons || true;

        // Register listener.
        // TODO: should it be moved into the listeners method?
        node.on.lang(this.onLangCallback);

        // Display initialization.
        this.displayForm = node.window.getElement('form', 'radioButtonForm');
        this.loadingDiv = node.window.addDiv(this.displayForm);
        this.loadingDiv.innerHTML = 'Loading language information...';

        this.loadLanguages();
    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayForm);
    };

    /**
     * ### LanguageSelector.setLanguage
     *
     * Sets language and updates view
     *
     * @param {string} langName shortName of language to be set
     *
     * @see NodeGameClient.setLanguage
     */
    LanguageSelector.prototype.setLanguage = function(langName) {

        if (this.usingButtons) {

            // Uncheck current language button and change className of label.
            if (this.currentLanguage !== null &&
                this.currentLanguage !== this.availableLanguages[langName] ) {

                this.optionsDisplay[this.currentLanguage].checked =
                    'unchecked';
                this.optionsLabel[this.currentLanguage].className =
                    'unselectedButtonLabel';
            }
        }

        // Set current language index.
        this.currentLanguage = langName;

        if (this.usingButtons) {

            // Check language button and change className of label.
            this.optionsDisplay[this.currentLanguage].checked = 'checked';
            this.optionsLabel[this.currentLanguage].className =
                'selectedButtonLabel';
        }
        else {
            this.displaySelection.value = this.currentLanguage;
        }

        // Update node.player.
        node.setLanguage(this.availableLanguages[this.currentLanguage]);
    };

    /**
     * ### LanguageSelector.updateAvailableLanguages
     *
     * Updates available languages asynchronously
     *
     * @param {object} options Optional. Configuration options
     */
    LanguageSelector.prototype.updateAvalaibleLanguages = function(options) {
        if (options && options.callback) {
            this.onLangCallbackExtension = options.callback;
        }
        node.socket.send(node.msg.create({
            target: "LANG",
            to: "SERVER",
            action: "get"
        }));
    };

    /**
     * ### LanguageSelector.loadLanguages
     *
     * Loads languages once from server
     *
     * @param {object} options Optional. Configuration options
     *
     * @see LanguageSelector.updateAvalaibleLanguages
     */
    LanguageSelector.prototype.loadLanguages = function(options) {
        if(!this.languagesLoaded) {
            this.updateAvalaibleLanguages(options);
        }
        else {
            if (options && options.callback) {
                options.callback();
            }

        }
    };

})(node);

/**
 * # MoneyTalks
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting earnings ("money") in currency
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoneyTalks', MoneyTalks);

    // ## Meta-data

    MoneyTalks.version = '0.3.0';
    MoneyTalks.description = 'Displays the earnings of a player.';

    MoneyTalks.title = 'Earnings';
    MoneyTalks.className = 'moneytalks';

    // ## Dependencies

    MoneyTalks.dependencies = {
        JSUS: {}
    };

    /**
     * ## MoneyTalks constructor
     *
     * `MoneyTalks` displays the earnings ("money") of the player so far
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to MoneyTalks.init.
     *
     * @see MoneyTalks.init
     */
    function MoneyTalks(options) {
        /**
         * ### MoneyTalks.spanCurrency
         *
         * The SPAN which holds information on the currency
         */
        this.spanCurrency = document.createElement('span');

        /**
         * ### MoneyTalks.spanMoney
         *
         * The SPAN which holds information about the money earned so far
         */
        this.spanMoney = document.createElement('span');

        /**
         * ### MoneyTalks.currency
         *
         * String describing the currency
         */
        this.currency = 'ECU';

        /**
         * ### MoneyTalks.money
         *
         * Currently earned money
         */
        this.money = 0;

        /**
         * ### MoneyTalks.precicison
         *
         * Precision of floating point number to display
         */
        this.precision = 2;

        this.init(options);
    }

    // ## MoneyTalks methods

    /**
     * ### MoneyTalks.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - `currency`: String describing currency to use.
     *   - `money`: Current amount of money earned.
     *   - `precision`: Precision of floating point output to use.
     *   - `currencyClassName`: Class name to be set for this.spanCurrency.
     *   - `moneyClassName`: Class name to be set for this.spanMoney;
     */
    MoneyTalks.prototype.init = function(options) {
        this.currency = 'string' === typeof options.currency ?
            options.currency : this.currency;
        this.money = 'number' === typeof options.money ?
            options.money : this.money;
        this.precision = 'number' === typeof options.precision ?
            options.precision : this.precision;

        this.spanCurrency.className = options.currencyClassName ||
            this.spanCurrency.className || 'moneytalkscurrency';
        this.spanMoney.className = options.moneyClassName ||
            this.spanMoney.className || 'moneytalksmoney';

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;
    };

    MoneyTalks.prototype.append = function() {
        this.bodyDiv.appendChild(this.spanMoney);
        this.bodyDiv.appendChild(this.spanCurrency);
    };

    MoneyTalks.prototype.listeners = function() {
        var that = this;
        node.on('MONEYTALKS', function(amount, clear) {
            that.update(amount, clear);
        });
    };

    /**
     * ### MoneyTalks.update
     *
     * Updates the display and the count of available "money"
     *
     * @param {string|number} amount Amount to add to current value of money
     * @param {boolean} clear Optional. If TRUE, money will be set to 0
     *    before adding the new amount
     *
     * @see MoneyTalks.money
     * @see MonetyTalks.spanMoney
     */
    MoneyTalks.prototype.update = function(amount, clear) {
        var parsedAmount;
        parsedAmount = JSUS.isNumber(amount);
        if (parsedAmount === false) {
            node.err('MoneyTalks.update: invalid amount: ' + amount);
            return;
        }
        if (clear) this.money = 0;
        this.money += parsedAmount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
    };

    /**
     * ### MoneyTalks.getValues
     *
     * Returns the current value of "money"
     *
     * @see MoneyTalks.money
     */
    MoneyTalks.prototype.getValues = function() {
        return this.money;
    };

})(node);

/**
 * # MoodGauge
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to query users about mood, emotions and well-being
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('MoodGauge', MoodGauge);

    // ## Meta-data

    MoodGauge.version = '0.2.0';
    MoodGauge.description = 'Displays an interface to measure mood ' +
        'and emotions.';

    MoodGauge.title = 'Mood Gauge';
    MoodGauge.className = 'moodgauge';

    // ## Dependencies

    MoodGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## MoodGauge constructor
     *
     * Creates a new instance of MoodGauge
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to MoodGauge.init.
     *
     * @see MoodGauge.init
     */
    function MoodGauge(options) {

        /**
         * ### MoodGauge.methods
         *
         * List of available methods
         *
         * Maps names to functions.
         *
         * Each function is called with `this` instance as context,
         * and accepts the `options` parameters passed to constructor.
         * Each method must return widget-like gauge object
         * implementing functions: append, enable, disable, getValues
         *
         * or an error will be thrown
         */
        this.methods = {};

        /**
         * ## MoodGauge.method
         *
         * The method used to measure mood
         *
         * Available methods: 'I-PANAS-SF'
         *
         * Default method is: 'I-PANAS-SF'
         *
         * References:
         *
         * 'I-PANAS-SF', Thompson E.R. (2007) "Development
         * and Validation of an Internationally Reliable Short-Form of
         * the Positive and Negative Affect Schedule (PANAS)"
         */
        this.method = 'I-PANAS-SF';

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring mood
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('I-PANAS-SF', I_PANAS_SF);
    }

    // ## MoodGauge methods.

    /**
     * ### MoodGauge.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     */
    MoodGauge.prototype.init = function(options) {
        var gauge;
        if ('undefined' !== typeof options.method) {
            if ('string' !== typeof options.method) {
                throw new TypeError('MoodGauge.init: options.method must be ' +
                                    'string or undefined: ' + options.method);
            }
            if (!this.methods[options.method]) {
                throw new Error('MoodGauge.init: options.method is not a ' +
                                'valid method: ' + options.method);
            }
            this.method = options.method;
        }
        // Call method.
        gauge = this.methods[this.method].call(this, options);
        // Check properties.
        checkGauge(this.method, gauge);
        // Approved.
        this.gauge = gauge;
    };

    MoodGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv);
    };

    MoodGauge.prototype.listeners = function() {};

    /**
     * ## MoodGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    MoodGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new Error('MoodGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new Error('MoodGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('MoodGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    MoodGauge.prototype.getValues = function(opts) {
        return this.gauge.getValues(opts);
    };

    MoodGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
    };

    MoodGauge.prototype.enable = function() {
        return this.gauge.enable();
    };
    MoodGauge.prototype.enable = function() {
        return this.gauge.disable();
    };

    // ## Helper functions.

    /**
     * ### checkGauge
     *
     * Checks if a gauge is properly constructed, throws an error otherwise
     *
     * @param {string} method The name of the method creating it
     * @param {object} gauge The object to check
     *
     * @see ModdGauge.init
     */
    function checkGauge(method, gauge) {
        if (!gauge) {
            throw new Error('MoodGauge.init: method ' + method +
                            'did not create element gauge.');
        }
        if ('function' !== typeof gauge.getValues) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function getValues.');
        }
        if ('function' !== typeof gauge.enable) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function enable.');
        }
        if ('function' !== typeof gauge.disable) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function disable.');
        }
        if ('function' !== typeof gauge.append) {
            throw new Error('MoodGauge.init: method ' + method +
                            ': gauge missing function append.');
        }
    }

    // ## Available methods.

    // ### I_PANAS_SF
    function I_PANAS_SF(options) {
        var items, emotions, mainText, choices, left, right;
        var gauge, i, len;

        if ('undefined' === typeof options.mainText) {
            mainText = 'Thinking about yourself and how you normally feel, ' +
                'to what extent do you generally feel: ';
        }
        else if ('string' === typeof options.mainText) {
            mainText = options.mainText;
        }
        // Other types ignored.

        choices = options.choices ||
            [ '1', '2', '3', '4', '5' ];

        emotions = options.emotions || [
            'Upset',
            'Hostile',
            'Alert',
            'Ashamed',
            'Inspired',
            'Nervous',
            'Determined',
            'Attentive',
            'Afraid',
            'Active'
        ];

        left = options.left || 'never';

        right = options.right || 'always';

        len = emotions.length;

        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: emotions[i],
                left: '<span class="emotion">' + emotions[i] + ':</span> never',
                right: right,
                choices: choices
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: 'ipnassf',
            items: items,
            mainText: mainText,
            title: false,
            requiredChoice: true
        });

        return gauge;
    }

})(node);

/**
 * # MsgBar
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a tool for sending messages to other connected clients
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS,
        Table = W.Table;

    node.widgets.register('MsgBar', MsgBar);

    // ## Meta-data

    MsgBar.version = '0.7.0';
    MsgBar.description = 'Send a nodeGame message to players';

    MsgBar.title = 'Send MSG';
    MsgBar.className = 'msgbar';

    function MsgBar() {
        this.recipient = null;
        this.actionSel = null;
        this.targetSel = null;

        this.table = null;
        this.tableAdvanced = null;
    }

    MsgBar.prototype.init = function() {
        this.id = this.id || MsgBar.className;
    };

    MsgBar.prototype.append = function() {
        var advButton, sendButton;
        var fields, i, field;
        var table;
        var that;

        that = this;

        this.table = new Table();
        this.tableAdvanced = new Table();

        // Create fields.
        fields = ['to', 'action', 'target', 'text', 'data', 'from', 'priority',
                  'reliable', 'forward', 'session', 'stage', 'created', 'id'];

        for (i = 0; i < fields.length; ++i) {
            field = fields[i];

            // Put TO, ACTION, TARGET, TEXT, DATA in the first table which is
            // always visible, the other fields in the "advanced" table which
            // is hidden by default.
            table = i < 5 ? this.table : this.tableAdvanced;

            table.add(field, i, 0);
            table.add(W.getTextInput(this.id + '_' + field, {tabindex: i+1}),
                                     i, 1);

            if (field === 'to') {
                this.recipient =
                    W.getRecipientSelector(this.id + '_recipients');
                W.addAttributes2Elem(this.recipient,
                        {tabindex: fields.length+1});
                table.add(this.recipient, i, 2);
                this.recipient.onchange = function() {
                    W.getElementById(that.id + '_to').value =
                        that.recipient.value;
                };
            }
            else if (field === 'action') {
                this.actionSel = W.getActionSelector(this.id + '_actions');
                W.addAttributes2Elem(this.actionSel,
                        {tabindex: fields.length+2});
                table.add(this.actionSel, i, 2);
                this.actionSel.onchange = function() {
                    W.getElementById(that.id + '_action').value =
                        that.actionSel.value;
                };
            }
            else if (field === 'target') {
                this.targetSel = W.getTargetSelector(this.id + '_targets');
                W.addAttributes2Elem(this.targetSel,
                        {tabindex: fields.length+3});
                table.add(this.targetSel, i, 2);
                this.targetSel.onchange = function() {
                    W.getElementById(that.id + '_target').value =
                        that.targetSel.value;
                };
            }
        }

        // Show table of basic fields.
        this.bodyDiv.appendChild(this.table.table);

        this.bodyDiv.appendChild(this.tableAdvanced.table);
        this.tableAdvanced.table.style.display = 'none';

        // Show 'Send' button.
        sendButton = W.addButton(this.bodyDiv);
        sendButton.onclick = function() {
            var msg;
            msg = that.parse();
            if (msg) node.socket.send(msg);
        };

        // Show a button that expands the table of advanced fields.
        advButton =
            W.addButton(this.bodyDiv, undefined, 'Toggle advanced options');
        advButton.onclick = function() {
            that.tableAdvanced.table.style.display =
                that.tableAdvanced.table.style.display === '' ? 'none' : '';
        };

        this.table.parse();
        this.tableAdvanced.parse();
    };

    MsgBar.prototype.parse = function() {
        var msg, gameMsg;

        msg = {};

        this.table.forEach(validateTableMsg, msg);
        if (msg._invalid) return null;
        this.tableAdvanced.forEach(validateTableMsg, msg);
        if (msg._invalid) return null;
        delete msg._lastKey;
        delete msg._invalid;
        gameMsg = node.msg.create(msg);
        node.info('MsgBar msg created. ' +  gameMsg.toSMS());
        return gameMsg;
    };


    // # Helper Function.

    function validateTableMsg(e, msg) {
        var key, value;

        if (msg._invalid) return;

        if (e.y === 2) return;

        if (e.y === 0) {
            // Saving the value of last key.
            msg._lastKey =  e.content;
            return;
        }

        // Fetching the value of last key.
        key = msg._lastKey;
        value = e.content.value;

        if (key === 'stage' || key === 'to' || key === 'data') {
            try {
                value = JSUS.parse(e.content.value);
            }
            catch (ex) {
                value = e.content.value;
            }
        }

        // Validate input.
        if (key === 'to') {
            if ('number' === typeof value) {
                value = '' + value;
            }

            if ((!JSUS.isArray(value) && 'string' !== typeof value) ||
                ('string' === typeof value && value.trim() === '')) {

                alert('Invalid "to" field');
                msg._invalid = true;
            }
        }

        else if (key === 'action') {
            if (value.trim() === '') {
                alert('Missing "action" field');
                msg._invalid = true;
            }
            else {
                value = value.toLowerCase();
            }

        }

        else if (key === 'target') {
            if (value.trim() === '') {
                alert('Missing "target" field');
                msg._invalid = true;
            }
            else {
                value = value.toUpperCase();
            }
        }

        // Assigning the value.
        msg[key] = value;
    }

})(node);

/**
 * # NDDBBrowser
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates an interface to interact with an NDDB database
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('NDDBBrowser', NDDBBrowser);

    var NDDB = node.NDDB,
    TriggerManager = node.TriggerManager;

    // ## Defaults

    NDDBBrowser.defaults = {};
    NDDBBrowser.defaults.id = 'nddbbrowser';
    NDDBBrowser.defaults.fieldset = false;

    // ## Meta-data

    NDDBBrowser.version = '0.2.0';
    NDDBBrowser.description =
        'Provides a very simple interface to control a NDDB istance.';

    // ## Dependencies

    NDDBBrowser.dependencies = {
        JSUS: {},
        NDDB: {},
        TriggerManager: {}
    };

    function NDDBBrowser(options) {
        this.options = options;
        this.nddb = null;

        this.commandsDiv = null;


        this.info = null;
    }

    NDDBBrowser.prototype.init = function(options) {
        this.tm = new TriggerManager();
        this.tm.init(options.triggers);
        this.nddb = options.nddb || new NDDB({
            update: { pointer: true }
        });
    };

    NDDBBrowser.prototype.append = function() {
        this.commandsDiv = document.createElement('div');
        if (this.id) this.commandsDiv.id = this.id;

        function addButtons() {
            var id = this.id;
            node.window.addEventButton(id + '_GO_TO_FIRST', '<<',
                this.commandsDiv, 'go_to_first');
            node.window.addEventButton(id + '_GO_TO_PREVIOUS', '<',
                this.commandsDiv, 'go_to_previous');
            node.window.addEventButton(id + '_GO_TO_NEXT', '>',
                this.commandsDiv, 'go_to_next');
            node.window.addEventButton(id + '_GO_TO_LAST', '>>',
                this.commandsDiv, 'go_to_last');
            node.window.addBreak(this.commandsDiv);
        }
        function addInfoBar() {
            var span = this.commandsDiv.appendChild(
                document.createElement('span'));
            return span;
        }

        addButtons.call(this);
        this.info = addInfoBar.call(this);

        this.bodyDiv.appendChild(this.commandsDiv);
    };

    NDDBBrowser.prototype.getRoot = function(root) {
        return this.commandsDiv;
    };

    NDDBBrowser.prototype.add = function(o) {
        return this.nddb.insert(o);
    };

    NDDBBrowser.prototype.sort = function(key) {
        return this.nddb.sort(key);
    };

    NDDBBrowser.prototype.addTrigger = function(trigger) {
        return this.tm.addTrigger(trigger);
    };

    NDDBBrowser.prototype.removeTrigger = function(trigger) {
        return this.tm.removeTrigger(trigger);
    };

    NDDBBrowser.prototype.resetTriggers = function() {
        return this.tm.resetTriggers();
    };

    NDDBBrowser.prototype.listeners = function() {
        var that = this;
        var id = this.id;

        function notification(el, text) {
            if (el) {
                node.emit(id + '_GOT', el);
                this.writeInfo((this.nddb.nddb_pointer + 1) + '/' +
                    this.nddb.size());
            }
            else {
                this.writeInfo('No element found');
            }
        }

        node.on(id + '_GO_TO_FIRST', function() {
            var el = that.tm.pullTriggers(that.nddb.first());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_PREVIOUS', function() {
            var el = that.tm.pullTriggers(that.nddb.previous());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_NEXT', function() {
            var el = that.tm.pullTriggers(that.nddb.next());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_LAST', function() {
            var el = that.tm.pullTriggers(that.nddb.last());
            notification.call(that, el);

        });
    };

    NDDBBrowser.prototype.writeInfo = function(text) {
        var that;
        that = this;
        if (this.infoTimeout) clearTimeout(this.infoTimeout);
        this.info.innerHTML = text;
        this.infoTimeout = setTimeout(function(){
            that.info.innerHTML = '';
        }, 2000);
    };

})(node);

/**
 * # NextPreviousStep
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Simple widget to step through the stages of the game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('NextPreviousStep', NextPreviousStep);

    // ## Meta-data

    NextPreviousStep.className = 'nextprevious';
    NextPreviousStep.title = 'Next/Previous Step';

    NextPreviousStep.version = '1.0.0';
    NextPreviousStep.description = 'Adds two buttons to push forward or ' +
        'rewind the state of the game by one step.';

    /**
     * ## NextPreviousStep constructor
     */
    function NextPreviousStep() {

        /**
         * ### NextPreviousStep.rew
         *
         * The button to go one step back
         */
        this.rew = null;

        /**
         * ### NextPreviousStep.fwd
         *
         * The button to go one step forward
         */
        this.fwd = null;

        /**
         * ### NextPreviousStep.checkbox
         *
         * The checkbox to call `node.done` on forward
         */
        this.checkbox = null;
    }

    /**
     * ### NextPreviousStep.append
     *
     * Appends the widget
     *
     * Creates two buttons and a checkbox
     */
    NextPreviousStep.prototype.append = function() {
        var that, spanDone;
        that = this;

        this.rew = document.createElement('button');
        this.rew.innerHTML = '<<';

        this.fwd = document.createElement('button');
        this.fwd.innerHTML = '>>';

        this.checkbox = document.createElement('input');
        this.checkbox.type = 'checkbox';

        this.fwd.onclick = function() {
            if (that.checkbox.checked) node.done();
            else node.game.step();
            if (!hasNextStep()) {
                that.fwd.disabled = 'disabled';
            }
        };

        this.rew.onclick = function() {
            var prevStep;
            prevStep = node.game.getPreviousStep();
            node.game.gotoStep(prevStep);
            if (!hasPreviousStep()) {
                that.rew.disabled = 'disabled';
            }
        };

        if (!hasPreviousStep()) this.rew.disabled = 'disabled';
        if (!hasNextStep()) this.fwd.disabled = 'disabled';

        // Buttons.
        this.bodyDiv.appendChild(this.rew);
        this.bodyDiv.appendChild(this.fwd);

        // Checkbox.
        spanDone = document.createElement('span');
        spanDone.appendChild(document.createTextNode('node.done'));
        spanDone.appendChild(this.checkbox);
        this.bodyDiv.appendChild(spanDone);
    };

    function hasNextStep() {
        var nextStep;
        nextStep = node.game.getNextStep();
        if (!nextStep ||
            nextStep === node.GamePlot.GAMEOVER ||
            nextStep === node.GamePlot.END_SEQ ||
            nextStep === node.GamePlot.NO_SEQ) {

            return false;
        }
        return true;
    }

    function hasPreviousStep() {
        var prevStep;
        prevStep = node.game.getPreviousStep();
        if (!prevStep) {
            return false;
        }
        return true;
    }

})(node);

/**
 * # Requirements
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Checks a list of requirements and displays the results
 *
 * TODO: see if we need to reset the state between two
 * consecutive calls to checkRequirements (results array).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Requirements', Requirements);

    // ## Meta-data

    Requirements.version = '0.7.0';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    Requirements.title = 'Requirements';
    Requirements.className = 'requirements';

    // ## Dependencies

    Requirements.dependencies = {
        JSUS: {},
        List: {}
    };

    /**
     * ## Requirements constructor
     *
     * Instantiates a new Requirements object
     *
     * @param {object} options
     */
    function Requirements(options) {

        /**
         * ### Requirements.callbacks
         *
         * Array of all test callbacks
         */
        this.requirements = [];

        /**
         * ### Requirements.stillChecking
         *
         * Number of tests still pending
         */
        this.stillChecking = 0;

        /**
         * ### Requirements.withTimeout
         *
         * If TRUE, a maximum timeout to the execution of ALL tests is set
         */
        this.withTimeout = options.withTimeout || true;

        /**
         * ### Requirements.timeoutTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.timeoutTime = options.timeoutTime || 10000;

        /**
         * ### Requirements.timeoutId
         *
         * The id of the timeout, if created
         */
        this.timeoutId = null;

        /**
         * ### Requirements.summary
         *
         * Span summarizing the status of the tests
         */
        this.summary = null;

        /**
         * ### Requirements.summaryUpdate
         *
         * Span counting how many tests have been completed
         */
        this.summaryUpdate = null;

        /**
         * ### Requirements.summaryResults
         *
         * Span displaying the results of the tests
         */
        this.summaryResults = null;

        /**
         * ### Requirements.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### Requirements.hasFailed
         *
         * TRUE if at least one test has failed
         */
        this.hasFailed = false;

        /**
         * ### Requirements.results
         *
         * The outcomes of all tests
         */
        this.results = [];

        /**
         * ### Requirements.completed
         *
         * Maps all tests that have been completed already to avoid duplication
         */
        this.completed = {};

        /**
         * ### Requirements.sayResult
         *
         * If true, the final result of the tests will be sent to the server
         */
        this.sayResults = options.sayResults || false;

        /**
         * ### Requirements.sayResultLabel
         *
         * The label of the SAY message that will be sent to the server
         */
        this.sayResultsLabel = options.sayResultLabel || 'requirements';

        /**
         * ### Requirements.addToResults
         *
         *  Callback to add properties to result object sent to server
         */
        this.addToResults = options.addToResults || null;

        /**
         * ### Requirements.onComplete
         *
         * Callback to be executed at the end of all tests
         */
        this.onComplete = null;

        /**
         * ### Requirements.onSuccess
         *
         * Callback to be executed at the end of all tests
         */
        this.onSuccess = null;

        /**
         * ### Requirements.onFailure
         *
         * Callback to be executed at the end of all tests
         */
        this.onFailure = null;

        /**
         * ### Requirements.list
         *
         * `List` to render the results
         *
         * @see nodegame-server/List
         */
        // TODO: simplify render syntax.
        this.list = new W.List({
            render: {
                pipeline: renderResult,
                returnAt: 'first'
            }
        });

        function renderResult(o) {
            var imgPath, img, span, text;
            imgPath = '/images/' + (o.content.success ?
                                    'success-icon.png' : 'delete-icon.png');
            img = document.createElement('img');
            img.src = imgPath;

            // Might be the full exception object.
            if ('object' === typeof o.content.text) {
                o.content.text = extractErrorMsg(o.content.text);
            }

            text = document.createTextNode(o.content.text);
            span = document.createElement('span');
            span.className = 'requirement';
            span.appendChild(img);

            span.appendChild(text);
            return span;
        }
    }

    // ## Requirements methods

    /**
     * ### Requirements.init
     *
     * Setups the requirements widget
     *
     * Available options:
     *
     *   - requirements: array of callback functions or objects formatted as
     *      { cb: function [, params: object] [, name: string] };
     *   - onComplete: function executed with either failure or success
     *   - onFailure: function executed when at least one test fails
     *   - onSuccess: function executed when all tests succeed
     *   - maxWaitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    Requirements.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('Requirements.init: conf must be object.');
        }
        if (conf.requirements) {
            if (!J.isArray(conf.requirements)) {
                throw new TypeError('Requirements.init: conf.requirements ' +
                                    'must be array or undefined.');
            }
            this.requirements = conf.requirements;
        }
        if ('undefined' !== typeof conf.onComplete) {
            if (null !== conf.onComplete &&
                'function' !== typeof conf.onComplete) {

                throw new TypeError('Requirements.init: conf.onComplete must ' +
                                    'be function, null or undefined.');
            }
            this.onComplete = conf.onComplete;
        }
        if ('undefined' !== typeof conf.onSuccess) {
            if (null !== conf.onSuccess &&
                'function' !== typeof conf.onSuccess) {

                throw new TypeError('Requirements.init: conf.onSuccess must ' +
                                    'be function, null or undefined.');
            }
            this.onSuccess = conf.onSuccess;
        }
        if ('undefined' !== typeof conf.onFailure) {
            if (null !== conf.onFailure &&
                'function' !== typeof conf.onFailure) {

                throw new TypeError('Requirements.init: conf.onFailure must ' +
                                    'be function, null or undefined.');
            }
            this.onFailure = conf.onFailure;
        }
        if (conf.maxExecTime) {
            if (null !== conf.maxExecTime &&
                'number' !== typeof conf.maxExecTime) {

                throw new TypeError('Requirements.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined.');
            }
            this.withTimeout = !!conf.maxExecTime;
            this.timeoutTime = conf.maxExecTime;
        }
    };

    /**
     * ### Requirements.addRequirements
     *
     * Adds any number of requirements to the requirements array
     *
     * Callbacks can be asynchronous or synchronous.
     *
     * An asynchronous callback must call the `results` function
     * passed as input parameter to communicate the outcome of the test.
     *
     * A synchronous callback must return the value immediately.
     *
     * In both cases the return is an array, where every item is an
     * error message. Empty array means test passed.
     *
     * @see this.requirements
     */
    Requirements.prototype.addRequirements = function() {
        var i, len;
        i = -1, len = arguments.length;
        for ( ; ++i < len ; ) {
            if ('function' !== typeof arguments[i] &&
                'object' !== typeof arguments[i] ) {

                throw new TypeError('Requirements.addRequirements: ' +
                                    'requirements must be function or object.');
            }
            this.requirements.push(arguments[i]);
        }
    };

    /**
     * ### Requirements.checkRequirements
     *
     * Asynchronously or synchronously checks all registered callbacks
     *
     * Can add a timeout for the max execution time of the callbacks, if the
     * corresponding option is set.
     *
     * Results are displayed conditionally
     *
     * @param {boolean} display If TRUE, results are displayed
     *
     * @return {array} The array containing the errors
     *
     * @see this.withTimeout
     * @see this.requirements
     */
    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbName, errMsg;
        if (!this.requirements.length) {
            throw new Error('Requirements.checkRequirements: no requirements ' +
                            'to check found.');
        }

        this.updateStillChecking(this.requirements.length, true);

        errors = [];
        i = -1, len = this.requirements.length;
        for ( ; ++i < len ; ) {
            // Get Test Name.
            if (this.requirements[i] && this.requirements[i].name) {
                cbName = this.requirements[i].name;
            }
            else {
                cbName = i + 1;
            }
            try {
                resultCb(this, cbName, i);
            }
            catch(e) {
                this.hasFailed = true;
                errMsg = extractErrorMsg(e);
                this.updateStillChecking(-1);
                errors.push('An error occurred in requirement n.' +
                            cbName + ': ' + errMsg);
            }
        }

        if (this.withTimeout) {
            this.addTimeout();
        }

        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }

        if (this.isCheckingFinished()) {
            this.checkingFinished();
        }

        return errors;
    };

    /**
     * ### Requirements.addTimeout
     *
     * Starts a timeout for the max execution time of the requirements
     *
     * Upon time out results are checked, and eventually displayed.
     *
     * @see this.stillCheckings
     * @see this.withTimeout
     * @see this.requirements
     */
    Requirements.prototype.addTimeout = function() {
        var that = this;
        var errStr = 'One or more function is taking too long. This is ' +
            'likely to be due to a compatibility issue with your browser ' +
            'or to bad network connectivity.';

        this.timeoutId = setTimeout(function() {
            if (that.stillChecking > 0) {
                that.displayResults([errStr]);
            }
            that.timeoutId = null;
            that.hasFailed = true;
            that.checkingFinished();
        }, this.timeoutTime);
    };

    /**
     * ### Requirements.clearTimeout
     *
     * Clears the timeout for the max execution time of the requirements
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ### Requirements.updateStillChecking
     *
     * Updates the number of requirements still running on the display
     *
     * @param {number} update The number of requirements still running, or an
     *   increment as compared to the current value
     * @param {boolean} absolute TRUE, if `update` is to be interpreted as an
     *   absolute value
     *
     * @see this.summaryUpdate
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.updateStillChecking = function(update, absolute) {
        var total, remaining;

        this.stillChecking = absolute ? update : this.stillChecking + update;

        total = this.requirements.length;
        remaining = total - this.stillChecking;
        this.summaryUpdate.innerHTML = ' (' +  remaining + ' / ' + total + ')';
    };

    /**
     * ### Requirements.isCheckingFinished
     *
     * Returns TRUE if all requirements have returned
     *
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.isCheckingFinished = function() {
        return this.stillChecking <= 0;
    };

    /**
     * ### Requirements.CheckingFinished
     *
     * Cleans up timer and dots, and executes final requirements accordingly
     *
     * First, executes the `onComplete` callback in any case. Then if no
     * errors have been raised executes the `onSuccess` callback, otherwise
     * the `onFailure` callback.
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.checkingFinished = function() {
        var results;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.dots.stop();

        if (this.sayResults) {
            results = {
                success: !this.hasFailed,
                results: this.results
            };

            if (this.addToResults) {
                J.mixin(results, this.addToResults());
            }
            node.say(this.sayResultsLabel, 'SERVER', results);
        }

        if (this.onComplete) {
            this.onComplete();
        }

        if (this.hasFailed) {
            if (this.onFailure) this.onFailure();
        }
        else if (this.onSuccess) {
            this.onSuccess();
        }
    };

    /**
     * ### Requirements.displayResults
     *
     * Displays the results of the requirements on the screen
     *
     * Creates a new item in the list of results for every error found
     * in the results array.
     *
     * If no error was raised, the results array should be empty.
     *
     * @param {array} results The array containing the return values of all
     *   the requirements
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.displayResults = function(results) {
        var i, len;

        if (!this.list) {
            throw new Error('Requirements.displayResults: list not found. ' +
                            'Have you called .append() first?');
        }

        if (!J.isArray(results)) {
            throw new TypeError('Requirements.displayResults: results must ' +
                                'be array.');
        }

        // No errors.
        if (!this.hasFailed && this.stillChecking <= 0) {
            // All tests passed.
            this.list.addDT({
                success: true,
                text:'All tests passed.'
            });
        }
        else {
            // Add the errors.
            i = -1, len = results.length;
            for ( ; ++i < len ; ) {
                this.list.addDT({
                    success: false,
                    text: results[i]
                });
            }
        }
        // Parse deletes previously existing nodes in the list.
        this.list.parse();
    };

    Requirements.prototype.append = function() {

        this.summary = document.createElement('span');
        this.summary.appendChild(
            document.createTextNode('Evaluating requirements'));

        this.summaryUpdate = document.createElement('span');
        this.summary.appendChild(this.summaryUpdate);

        this.dots = W.getLoadingDots();
        this.summary.appendChild(this.dots.span);

        this.summaryResults = document.createElement('div');
        this.summary.appendChild(document.createElement('br'));
        this.summary.appendChild(this.summaryResults);


        this.bodyDiv.appendChild(this.summary);
        this.bodyDiv.appendChild(this.list.getRoot());
    };

    Requirements.prototype.listeners = function() {
        var that;
        that = this;
        node.registerSetup('requirements', function(conf) {
            if (!conf) return;
            if ('object' !== typeof conf) {
                node.warn('requirements widget: invalid setup object: ' + conf);
                return;
            }
            // Configure all requirements.
            that.init(conf);
            // Start a checking immediately if requested.
            if (conf.doChecking !== false) that.checkRequirements();

            return conf;
        });
    };

    Requirements.prototype.destroy = function() {
        node.deregisterSetup('requirements');
    };

    // ## Helper methods.

    function resultCb(that, name, i) {
        var req, update, res;

        update = function(success, errors, data) {
            if (that.completed[name]) {
                throw new Error('Requirements.checkRequirements: test ' +
                                'already completed: ' + name);
            }
            that.completed[name] = true;
            that.updateStillChecking(-1);
            if (!success) that.hasFailed = true;

            if ('string' === typeof errors) errors = [ errors ];

            if (errors) {
                if (!J.isArray(errors)) {
                    throw new Error('Requirements.checkRequirements: ' +
                                    'errors must be array or undefined.');
                }
                that.displayResults(errors);
            }

            that.results.push({
                name: name,
                success: success,
                errors: errors,
                data: data
            });

            if (that.isCheckingFinished()) {
                that.checkingFinished();
            }
        };

        req = that.requirements[i];
        if ('function' === typeof req) {
            res = req(update);
        }
        else if ('object' === typeof req) {
            res = req.cb(update, req.params || {});
        }
        else {
            throw new TypeError('Requirements.checkRequirements: invalid ' +
                                'requirement: ' + name + '.');
        }
        // Synchronous checking.
        if (res) update(res.success, res.errors, res.data);
    }

    function extractErrorMsg(e) {
        var errMsg;
        if (e.msg) {
            errMsg = e.msg;
        }
        else if (e.message) {
            errMsg = e.message;
        }
        else if (e.description) {
            errMsg = errMsg.description;
        }
        else {
            errMsg = e.toString();
        }
        return errMsg;
    }

})(node);

/**
 * # SVOGauge
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' social value orientation (S.V.O.)
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('SVOGauge', SVOGauge);

    // ## Meta-data

    SVOGauge.version = '0.5.0';
    SVOGauge.description = 'Displays an interface to measure social ' +
        'value orientation (S.V.O.).';

    SVOGauge.title = 'SVO Gauge';
    SVOGauge.className = 'svogauge';

    // ## Dependencies

    SVOGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## SVOGauge constructor
     *
     * Creates a new instance of SVOGauge
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to SVOGauge.init.
     *
     * @see SVOGauge.init
     */
    function SVOGauge(options) {

        /**
         * ### SVOGauge.methods
         *
         * List of available methods
         *
         * Maps names to functions.
         *
         * Each function is called with `this` instance as context,
         * and accepts the `options` parameters passed to constructor.
         * Each method must return widget-like gauge object
         * implementing functions: append, enable, disable, getValues
         *
         * or an error will be thrown
         */
        this.methods = {};

        /**
         * ## SVOGauge.method
         *
         * The method used to measure svo
         *
         * Available methods: 'Slider'
         *
         * Default method is: 'Slider'
         *
         * References:
         *
         * 'Slider', Murphy R.O., Ackermann K.A. and Handgraaf M.J.J. (2011).
         * "Measuring social value orientation"
         */
        this.method = 'Slider';

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring svo
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('Slider', SVO_Slider);
    }

    // ## SVOGauge methods.

    /**
     * ### SVOGauge.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     */
    SVOGauge.prototype.init = function(options) {
        var gauge;
        if ('undefined' !== typeof options.method) {
            if ('string' !== typeof options.method) {
                throw new TypeError('SVOGauge.init: options.method must be ' +
                                    'string or undefined: ' + options.method);
            }
            if (!this.methods[options.method]) {
                throw new Error('SVOGauge.init: options.method is not a ' +
                                'valid method: ' + options.method);
            }
            this.method = options.method;
        }
        // Call method.
        gauge = this.methods[this.method].call(this, options);
        // Check properties.
        checkGauge(this.method, gauge);
        // Approved.
        this.gauge = gauge;
    };

    SVOGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv);
    };

    SVOGauge.prototype.listeners = function() {};

    /**
     * ## SVOGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    SVOGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new Error('SVOGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new Error('SVOGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('SVOGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    SVOGauge.prototype.getValues = function(opts) {
        opts = opts || {};
        // Transform choice in numerical values.
        if ('undefined' === typeof opts.processChoice) {
            opts.processChoice = function(choice) {
                return choice === null ? null : this.choices[choice];
            };
        }
        return this.gauge.getValues(opts);
    };

    SVOGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
    };

    SVOGauge.prototype.enable = function() {
        return this.gauge.enable();
    };
    SVOGauge.prototype.enable = function() {
        return this.gauge.disable();
    };

    // ## Helper functions.

    /**
     * ### checkGauge
     *
     * Checks if a gauge is properly constructed, throws an error otherwise
     *
     * @param {string} method The name of the method creating it
     * @param {object} gauge The object to check
     *
     * @see ModdGauge.init
     */
    function checkGauge(method, gauge) {
        if (!gauge) {
            throw new Error('SVOGauge.init: method ' + method +
                            'did not create element gauge.');
        }
        if ('function' !== typeof gauge.getValues) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function getValues.');
        }
        if ('function' !== typeof gauge.enable) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function enable.');
        }
        if ('function' !== typeof gauge.disable) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function disable.');
        }
        if ('function' !== typeof gauge.append) {
            throw new Error('SVOGauge.init: method ' + method +
                            ': gauge missing function append.');
        }
    }

    // ## Available methods.

    // ### SVO_Slider
    function SVO_Slider(options) {
        var items, sliders, mainText;
        var gauge, i, len;
        var left, renderer;

        if ('undefined' === typeof options.mainText) {
            mainText =
                'Select your preferred option among those available below:';
        }
        else if ('string' === typeof options.mainText) {
            mainText = options.mainText;
        }
        // Other types ignored.

        sliders = options.sliders || [
            [
                [85, 85],
                [85, 76],
                [85, 68],
                [85, 59],
                [85, 50],
                [85, 41],
                [85, 33],
                [85, 24],
                [85, 15]
            ],
            [
                [85, 15],
                [87, 19],
                [89, 24],
                [91, 28],
                [93, 33],
                [94, 37],
                [96, 41],
                [98, 46],
                [100, 50]
            ],
            [
                [50, 100],
                [54, 98],
                [59, 96],
                [63, 94],
                [68, 93],
                [72, 91],
                [76, 89],
                [81, 87],
                [85, 85]
            ],
            [
                [50, 100],
                [54, 89],
                [59, 79],
                [63, 68],
                [68, 58],
                [72, 47],
                [76, 36],
                [81, 26],
                [85, 15]
            ],
            [
                [100, 50],
                [94, 56],
                [88, 63],
                [81, 69],
                [75, 75],
                [69, 81],
                [63, 88],
                [56, 94],
                [50, 100]
            ],
            [
                [100, 50],
                [98, 54],
                [96, 59],
                [94, 63],
                [93, 68],
                [91, 72],
                [89, 76],
                [87, 81],
                [85, 85]
            ]
        ];

        this.sliders = sliders;


        renderer = options.renderer || function(td, choice, idx) {
            td.innerHTML = choice[0] + '<hr/>' + choice[1];
        };

        if (options.left) {
            left = options.left;
        }
        else {
            left = 'You:<hr/>Other:';
        }

        len = sliders.length;
        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: (i+1),
                left: left,
                choices: sliders[i]
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: 'svo_slider',
            items: items,
            mainText: mainText,
            title: false,
            renderer: renderer,
            requiredChoice: true
        });

        return gauge;
    }

})(node);

/**
 * # VisualRound
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Display information about rounds and/or stage in the game
 *
 * Accepts different visualization options (e.g. countdown, etc.).
 * See `VisualRound` constructor for a list of all available options.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('VisualRound', VisualRound);

    // ## Meta-data

    VisualRound.version = '0.7.0';
    VisualRound.description = 'Display number of current round and/or stage.' +
        'Can also display countdown and total number of rounds and/or stages.';

    VisualRound.title = 'Round info';
    VisualRound.className = 'visualround';

    // ## Dependencies

    VisualRound.dependencies = {
        GamePlot: {},
        JSUS: {}
    };

    /**
     * ## VisualRound constructor
     *
     * Displays information on the current and total rounds and stages
     */
    function VisualRound() {

        /**
         * ### VisualRound.options
         *
         * Current configuration
         */
        this.options = null;

        /**
         * ### VisualRound.displayMode
         *
         * Object which determines what information is displayed
         *
         * Set through `VisualRound.setDisplayMode` using a string to describe
         * the displayMode.
         *
         * @see VisualRound.setDisplayMode
         */
        this.displayMode = null;

        /**
         * ### VisualRound.stager
         *
         * Reference to a `GameStager` object providing stage and round info
         *
         * @see GameStager
         */
        this.stager = null;

        /**
         * ### VisualRound.gamePlot
         *
         * `GamePlot` object to provide stage and round information
         *
         * @see GamePlot
         */
        this.gamePlot = null;

        /**
         * ### VisualRound.curStage
         *
         * Number of the current stage
         */
        this.curStage = null;

        /**
         * ### VisualRound.totStage
         *
         * Total number of stages. Might be null if in `flexibleMode`
         */
        this.totStage = null;

        /**
         * ### VisualRound.curRound
         *
         * Number of the current round
         */
        this.curRound = null;

        /**
         * ### VisualRound.totRound
         *
         * Total number of rounds. Might be null if in `flexibleMode`
         */
        this.totRound = null;

        /**
         * ### VisualRound.stageOffset
         *
         * Stage displayed is the actual stage minus stageOffset
         */
        this.stageOffset = null;

        /**
         * ### VisualRound.totStageOffset
         *
         * Total number of stages displayed minus totStageOffset
         *
         * If not set, and it is set equal to stageOffset
         */
        this.totStageOffset = null;

        /**
         * ### VisualRound.oldStageId
         *
         * Stage id of the previous stage
         *
         * Needed in `flexibleMode` to count rounds.
         */
        this.oldStageId = null;

    }

    // ## VisualRound methods

    /**
     * ### VisualRound.init
     *
     * Initializes the instance
     *
     * If called on running instance, options are mixed-in into current
     * settings. See `VisualRound` constructor for which options are allowed.
     *
     * @param {object} options Optional. Configuration options.
     *   The options it can take are:
     *
     *   - `stageOffset`:
     *     Stage displayed is the actual stage minus stageOffset
     *   - `flexibleMode`:
     *     Set `true`, if number of rounds and/or stages can change dynamically
     *   - `curStage`:
     *     When (re)starting in `flexibleMode`, sets the current stage
     *   - `curRound`:
     *     When (re)starting in `flexibleMode`, sets the current round
     *   - `totStage`:
     *     When (re)starting in `flexibleMode`, sets the total number of stages
     *   - `totRound`:
     *     When (re)starting in `flexibleMode`, sets the total number of
     *     rounds
     *   - `oldStageId`:
     *     When (re)starting in `flexibleMode`, sets the id of the current
     *     stage
     *   - `displayModeNames`:
     *     Array of strings which determines the display style of the widget
     *
     * @see VisualRound.setDisplayMode
     * @see GameStager
     * @see GamePlot
     */
    VisualRound.prototype.init = function(options) {
        options = options || {};

        J.mixout(options, this.options);
        this.options = options;

        this.stageOffset = this.options.stageOffset || 0;
        this.totStageOffset =
            'undefined' === typeof this.options.totStageOffset ?
            this.stageOffset : this.options.totStageOffset;

        if (this.options.flexibleMode) {
            this.curStage = this.options.curStage || 1;
            this.curStage -= this.options.stageOffset || 0;
            this.curRound = this.options.curRound || 1;
            this.totStage = this.options.totStage;
            this.totRound = this.options.totRound;
            this.oldStageId = this.options.oldStageId;
        }

        // Save references to gamePlot and stager for convenience.
        if (!this.gamePlot) this.gamePlot = node.game.plot;
        if (!this.stager) this.stager = this.gamePlot.stager;

        this.updateInformation();

        if (!this.options.displayModeNames) {
            this.setDisplayMode(['COUNT_UP_ROUNDS_TO_TOTAL',
                'COUNT_UP_STAGES_TO_TOTAL']);
        }
        else {
            this.setDisplayMode(this.options.displayModeNames);
        }

        this.updateDisplay();
    };

    VisualRound.prototype.append = function() {
        this.activate(this.displayMode);
        this.updateDisplay();
    };

    /**
     * ### VisualRound.updateDisplay
     *
     * Updates the values displayed by forwarding the call to displayMode obj
     *
     * @see VisualRound.displayMode
     */
    VisualRound.prototype.updateDisplay = function() {
        if (this.displayMode) {
            this.displayMode.updateDisplay();
        }
    };

    /**
     * ### VisualRound.setDisplayMode
     *
     * Sets the `VisualRound.displayMode` value
     *
     * Multiple displayModes are allowed, and will be merged together into a
     * `CompoundDisplayMode` object. The old `displayMode` is deactivated and
     * the new one is activated.
     *
     * The following strings are valid display names:
     *
     * - `COUNT_UP_STAGES`: Display only current stage number.
     * - `COUNT_UP_ROUNDS`: Display only current round number.
     * - `COUNT_UP_STAGES_TO_TOTAL`: Display current and total stage number.
     * - `COUNT_UP_ROUNDS_TO_TOTAL`: Display current and total round number.
     * - `COUNT_DOWN_STAGES`: Display number of stages left to play.
     * - `COUNT_DOWN_ROUNDS`: Display number of rounds left in this stage.
     *
     * @param {array} displayModeNames Array of strings representing the names
     *
     * @see VisualRound.displayMode
     * @see CompoundDisplayMode
     * @see VisualRound.init
     */
    VisualRound.prototype.setDisplayMode = function(displayModeNames) {
        var index, compoundDisplayModeName, displayModes;

        // Validation of input parameter.
        if (!J.isArray(displayModeNames)) {
            throw TypeError;
        }

        // Build compound name.
        compoundDisplayModeName = '';
        for (index in displayModeNames) {
            if (displayModeNames.hasOwnProperty(index)) {
                compoundDisplayModeName += displayModeNames[index] + '&';
            }
        }

        // Remove trailing '&'.
        compoundDisplayModeName = compoundDisplayModeName.substr(0,
            compoundDisplayModeName, compoundDisplayModeName.length -1);

        if (this.displayMode) {
            if (compoundDisplayModeName !== this.displayMode.name) {
                this.deactivate(this.displayMode);
            }
            else {
                return;
            }
        }

        // Build `CompoundDisplayMode`.
        displayModes = [];
        for (index in displayModeNames) {
            if (displayModeNames.hasOwnProperty(index)) {
                switch (displayModeNames[index]) {
                    case 'COUNT_UP_STAGES_TO_TOTAL':
                        displayModes.push(new CountUpStages(this,
                            {toTotal: true}));
                        break;
                    case 'COUNT_UP_STAGES':
                        displayModes.push(new CountUpStages(this));
                        break;
                    case 'COUNT_DOWN_STAGES':
                        displayModes.push(new CountDownStages(this));
                        break;
                    case 'COUNT_UP_ROUNDS_TO_TOTAL':
                        displayModes.push(new CountUpRounds(this,
                            {toTotal: true}));
                        break;
                    case 'COUNT_UP_ROUNDS':
                        displayModes.push(new CountUpRounds(this));
                        break;
                    case 'COUNT_DOWN_ROUNDS':
                        displayModes.push(new CountDownRounds(this));
                        break;
                }
            }
        }
        this.displayMode = new CompoundDisplayMode(this, displayModes);
        this.activate(this.displayMode);
    };

    /**
     * ### VisualRound.getDisplayMode
     *
     * Returns name of the current displayMode
     *
     * @return {string} Name of the current displayMode
     */
    VisualRound.prototype.getDisplayModeName = function() {
        return this.displayMode.name;
    };

    /**
     * ### VisualRound.activate
     *
     * Appends the displayDiv of the given displayMode to `this.bodyDiv`
     *
     * Calls `displayMode.activate`, if one is defined.
     *
     * @param {object} displayMode DisplayMode to activate
     *
     * @see VisualRound.deactivate
     */
    VisualRound.prototype.activate = function(displayMode) {
        if (this.bodyDiv) {
            this.bodyDiv.appendChild(displayMode.displayDiv);
        }
        if (displayMode.activate) {
            displayMode.activate();
        }
    };

    /**
     * ### VisualRound.deactivate
     *
     * Removes the displayDiv of the given displayMode from `this.bodyDiv`
     *
     * Calls `displayMode.deactivate` if it is defined.
     *
     * @param {object} displayMode DisplayMode to deactivate
     *
     * @see VisualRound.activate
     */
    VisualRound.prototype.deactivate = function(displayMode) {
        this.bodyDiv.removeChild(displayMode.displayDiv);
        if (displayMode.deactivate) {
            displayMode.deactivate();
        }
    };

    VisualRound.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateInformation();
        });

        // TODO: Game over and init?
    };

    /**
     * ### VisualRound.updateInformation
     *
     * Updates information about rounds and stages and updates the display
     *
     * Updates `curRound`, `curStage`, `totRound`, `totStage`, `oldStageId` and
     * calls `VisualRound.updateDisplay`.
     *
     * @see VisualRound.updateDisplay
     */
    VisualRound.prototype.updateInformation = function() {
        var stage, len;

        stage = node.player.stage;

        // Game not started.
        if (stage.stage === 0) {
            this.curStage = 0;
            this.totStage = 0;
            this.totRound = 0;
        }
        // Flexible mode.
        else if (this.options.flexibleMode) {
            if (stage.id === this.oldStageId) {
                this.curRound += 1;
            }
            else if (stage.id) {
                this.curRound = 1;
                this.curStage += 1;
            }
            this.oldStageId = stage.id;
        }
        // Normal mode.
        else {

            this.curStage = stage.stage;
            // Stage can be indexed by id or number in the sequence.
            if ('string' === typeof this.curStage) {
                this.curStage =
                    this.gamePlot.normalizeGameStage(stage).stage;
            }
            this.curRound = stage.round;
            this.totRound = this.stager.sequence[this.curStage -1].num || 1;
            this.curStage -= this.stageOffset;
            len = this.stager.sequence.length;
            this.totStage = len - this.totStageOffset;
            if (this.stager.sequence[(len-1)].type === 'gameover') {
                this.totStage--;
            }
        }
        // Update display.
        this.updateDisplay();
    };

   /**
     * # EmptyDisplayMode
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays nothing
     */

    /**
     * ## EmptyDisplayMode constructor
     *
     * Display a displayMode which contains the bare minumum (nothing)
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function EmptyDisplayMode(visualRound, options) {

        /**
         * ### EmptyDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = 'EMPTY';
        this.options = options || {};

        /**
         * ### EmptyDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### EmptyDisplayMode.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        this.init(this.options);
    }

    // ## EmptyDisplayMode methods

    /**
     * ### EmptyDisplayMode.init
     *
     * Initializes the instance
     *
     * @param {object} options The options taken
     *
     * @see EmptyDisplayMode.updateDisplay
     */
    EmptyDisplayMode.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.updateDisplay();
    };

    /**
     * ### EmptyDisplayMode.updateDisplay
     *
     * Does nothing
     *
     * @see VisualRound.updateDisplay
     */
    EmptyDisplayMode.prototype.updateDisplay = function() {};

    /**
     * # CountUpStages
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the current
     * and, possibly, the total number of stages
     */

    /**
     * ## CountUpStages constructor
     *
     * DisplayMode which displays the current number of stages
     *
     * Can be constructed to furthermore display the total number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options.
     *   If `options.toTotal == true`, then the total number of stages is
     *   displayed
     *
     * @see VisualRound
     */
    function CountUpStages(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpStages.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_UP_STAGES';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * ### CountUpStages.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountUpStages.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountUpStages.curStageNumber
         *
         * The span in which the current stage number is displayed
         */
        this.curStageNumber = null;

        /**
         * ### CountUpStages.totStageNumber
         *
         * The element in which the total stage number is displayed
         */
        this.totStageNumber = null;

        /**
         * ### CountUpStages.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        /**
         * ### CountUpStages.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        this.init(this.options);
    }

    // ## CountUpStages methods

    /**
     * ### CountUpStages.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of stages is displayed
     *
     * @see CountUpStages.updateDisplay
     */
    CountUpStages.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'stagediv';

        this.titleDiv = node.window.addElement('div', this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Stage:';

        if (this.options.toTotal) {
            this.curStageNumber = node.window.addElement('span',
                this.displayDiv);
            this.curStageNumber.className = 'number';
        }
        else {
            this.curStageNumber = node.window.addDiv(this.displayDiv);
            this.curStageNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span', this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totStageNumber = node.window.addElement('span',
                this.displayDiv);
            this.totStageNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ### CountUpStages.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     *
     * @see VisualRound.updateDisplay
     */
    CountUpStages.prototype.updateDisplay = function() {
        this.curStageNumber.innerHTML = this.visualRound.curStage;
        if (this.options.toTotal) {
            this.totStageNumber.innerHTML = this.visualRound.totStage || '?';
        }
    };

   /**
     * # CountDownStages
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the remaining
     * number of stages
     */

    /**
     * ## CountDownStages constructor
     *
     * Display mode which displays the remaining number of stages
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs.
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function CountDownStages(visualRound, options) {

        /**
         * ### CountDownStages.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_DOWN_STAGES';
        this.options = options || {};

        /**
         * ### CountDownStages.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountDownStages.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountDownStages.stagesLeft
         *
         * The DIV in which the number stages left is displayed
         */
        this.stagesLeft = null;

        /**
         * ### CountDownStages.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        this.init(this.options);
    }

    // ## CountDownStages methods

    /**
     * ### CountDownStages.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CountDownStages.updateDisplay
     */
    CountDownStages.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'stagediv';

        this.titleDiv = node.window.addDiv(this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Stages left: ';

        this.stagesLeft = node.window.addDiv(this.displayDiv);
        this.stagesLeft.className = 'number';

        this.updateDisplay();
    };

    /**
     * ### CountDownStages.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     *
     * @see VisualRound.updateDisplay
     */
    CountDownStages.prototype.updateDisplay = function() {
        if (this.visualRound.totStage === this.visualRound.curStage) {
            this.stagesLeft.innerHTML = 0;
            return;
        }
        this.stagesLeft.innerHTML =
                (this.visualRound.totStage - this.visualRound.curStage) || '?';
    };

   /**
     * # CountUpRounds
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the current
     * and possibly the total number of rounds
     */

    /**
     * ## CountUpRounds constructor
     *
     * Display mode which displays the current number of rounds
     *
     * Can be constructed to furthermore display the total number of stages.
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of rounds is displayed
     *
     * @see VisualRound
     */
    function CountUpRounds(visualRound, options) {
        this.options = options || {};

        /**
         * ### CountUpRounds.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_UP_ROUNDS';

        if (this.options.toTotal) {
            this.name += '_TO_TOTAL';
        }

        /**
         * ### CountUpRounds.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountUpRounds.curRoundNumber
         *
         * The span in which the current round number is displayed
         */
        this.curRoundNumber = null;

        /**
         * ### CountUpRounds.totRoundNumber
         *
         * The element in which the total round number is displayed
         */
        this.totRoundNumber = null;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        /**
         * ### CountUpRounds.displayDiv
         *
         * The span in which the text ` of ` is displayed
         */
        this.textDiv = null;

        this.init(this.options);
    }

    // ## CountUpRounds methods

    /**
     * ### CountUpRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options. If
     *   `options.toTotal == true`, then the total number of rounds is displayed
     *
     * @see CountUpRounds.updateDisplay
     */
    CountUpRounds.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.titleDiv = node.window.addElement('div', this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Round:';

        if (this.options.toTotal) {
            this.curRoundNumber = node.window.addElement('span',
                this.displayDiv);
            this.curRoundNumber.className = 'number';
        }
        else {
            this.curRoundNumber = node.window.addDiv(this.displayDiv);
            this.curRoundNumber.className = 'number';
        }

        if (this.options.toTotal) {
            this.textDiv = node.window.addElement('span', this.displayDiv);
            this.textDiv.className = 'text';
            this.textDiv.innerHTML = ' of ';

            this.totRoundNumber = node.window.addElement('span',
                this.displayDiv);
            this.totRoundNumber.className = 'number';
        }

        this.updateDisplay();
    };

    /**
     * ### CountUpRounds.updateDisplay
     *
     * Updates the content of `curRoundNumber` and `totRoundNumber`
     *
     * Values are updated according to the state of `visualRound`.
     *
     * @see VisualRound.updateDisplay
     */
    CountUpRounds.prototype.updateDisplay = function() {
        this.curRoundNumber.innerHTML = this.visualRound.curRound;
        if (this.options.toTotal) {
            this.totRoundNumber.innerHTML = this.visualRound.totRound || '?';
        }
    };


   /**
     * # CountDownRounds
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the remaining
     * number of rounds
     */

    /**
     * ## CountDownRounds constructor
     *
     * Display mode which displays the remaining number of rounds
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function CountDownRounds(visualRound, options) {

        /**
         * ### CountDownRounds.name
         *
         * The name of the displayMode
         */
        this.name = 'COUNT_DOWN_ROUNDS';
        this.options = options || {};

        /**
         * ### CountDownRounds.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

        /**
         * ### CountDownRounds.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        /**
         * ### CountDownRounds.roundsLeft
         *
         * The DIV in which the number rounds left is displayed
         */
        this.roundsLeft = null;

        /**
         * ### CountDownRounds.displayDiv
         *
         * The DIV in which the title is displayed
         */
        this.titleDiv = null;

        this.init(this.options);
    }

    // ## CountDownRounds methods

    /**
     * ### CountDownRounds.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CountDownRounds.updateDisplay
     */
    CountDownRounds.prototype.init = function(options) {
        this.displayDiv = node.window.getDiv();
        this.displayDiv.className = 'rounddiv';

        this.titleDiv = node.window.addDiv(this.displayDiv);
        this.titleDiv.className = 'title';
        this.titleDiv.innerHTML = 'Round left: ';

        this.roundsLeft = node.window.addDiv(this.displayDiv);
        this.roundsLeft.className = 'number';

        this.updateDisplay();
    };

    /**
     * ### CountDownRounds.updateDisplay
     *
     * Updates the content of `roundsLeft` according to `visualRound`
     *
     * @see VisualRound.updateDisplay
     */
    CountDownRounds.prototype.updateDisplay = function() {
        if (this.visualRound.totRound === this.visualRound.curRound) {
            this.roundsLeft.innerHTML = 0;
            return;
        }
        this.roundsLeft.innerHTML =
                (this.visualRound.totRound - this.visualRound.curRound) || '?';
    };

    /**
     * # CompoundDisplayMode
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Defines a displayMode for the `VisualRound` which displays the
     * information according to multiple displayModes
     */

    /**
     * ## CompoundDisplayMode constructor
     *
     * Display mode which combines multiple other display displayModes
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {array} displayModes Array of displayModes to be used in
     *   combination
     * @param {object} options Optional. Configuration options
     *
     * @see VisualRound
     */
    function CompoundDisplayMode(visualRound, displayModes, options) {
        var index;

        /**
         * ### CompoundDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = '';

        for (index in displayModes) {
            if (displayModes.hasOwnProperty(index)) {
                this.name += displayModes[index].name + '&';
            }
        }

        this.name = this.name.substr(0, this.name.length -1);

        this.options = options || {};

        /**
         * ### CompoundDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         *
         * @see VisualRound
         */
        this.visualRound = visualRound;

         /**
         * ### CompoundDisplayMode.displayModes
         *
         * The array of displayModes to be used in combination
         */
        this.displayModes = displayModes;

        /**
         * ### CompoundDisplayMode.displayDiv
         *
         * The DIV in which the information is displayed
         */
        this.displayDiv = null;

        this.init(options);
    }

    // ## CompoundDisplayMode methods

    /**
     * ### CompoundDisplayMode.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     *
     * @see CompoundDisplayMode.updateDisplay
     */
     CompoundDisplayMode.prototype.init = function(options) {
        var index;
        this.displayDiv = node.window.getDiv();

        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                this.displayDiv.appendChild(
                    this.displayModes[index].displayDiv);
            }
        }

        this.updateDisplay();
     };

    /**
     * ### CompoundDisplayMode.updateDisplay
     *
     * Calls `updateDisplay` for all displayModes in the combination
     *
     * @see VisualRound.updateDisplay
     */
    CompoundDisplayMode.prototype.updateDisplay = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                this.displayModes[index].updateDisplay();
            }
        }
    };

    CompoundDisplayMode.prototype.activate = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                if (this.displayModes[index].activate) {
                    this.displayModes[index].activate();
                }
            }
        }
    };

    CompoundDisplayMode.prototype.deactivate = function() {
        var index;
        for (index in this.displayModes) {
            if (this.displayModes.hasOwnProperty(index)) {
                if (this.displayModes[index].deactivate) {
                    this.displayMode[index].deactivate();
                }
            }
        }
    };

})(node);

/**
 * # VisualStage
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next stage.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = node.window.Table;

    node.widgets.register('VisualStage', VisualStage);

    // ## Meta-data

    VisualStage.version = '0.2.2';
    VisualStage.description =
        'Visually display current, previous and next stage of the game.';

    VisualStage.title = 'Stage';
    VisualStage.className = 'visualstage';

    // ## Dependencies

    VisualStage.dependencies = {
        JSUS: {},
        Table: {}
    };

    /**
     * ## VisualStage constructor
     *
     * `VisualStage` displays current, previous and next stage of the game
     */
    function VisualStage() {
        this.table = new Table();
    }

    // ## VisualStage methods

    /**
     * ### VisualStage.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see VisualStage.writeStage
     */
    VisualStage.prototype.append = function() {
        this.bodyDiv.appendChild(this.table.table);
        this.writeStage();
    };

    VisualStage.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.writeStage();
        });
        // Game over and init?
    };

    /**
     * ### VisualStage.writeStage
     *
     * Writes the current, previous and next stage into `this.table`
     */
    VisualStage.prototype.writeStage = function() {
        var miss, stage, pr, nx, tmp;
        var curStep, nextStep, prevStep;
        var t;

        miss = '-';
        stage = 'Uninitialized';
        pr = miss;
        nx = miss;

        curStep = node.game.getCurrentGameStage();

        if (curStep) {
            tmp = node.game.plot.getStep(curStep);
            stage = tmp ? tmp.id : miss;

            prevStep = node.game.plot.previous(curStep);
            if (prevStep) {
                tmp = node.game.plot.getStep(prevStep);
                pr = tmp ? tmp.id : miss;
            }

            nextStep = node.game.plot.next(curStep);
            if (nextStep) {
                tmp = node.game.plot.getStep(nextStep);
                nx = tmp ? tmp.id : miss;
            }
        }

        this.table.clear(true);

        this.table.addRow(['Previous: ', pr]);
        this.table.addRow(['Current: ', stage]);
        this.table.addRow(['Next: ', nx]);

        t = this.table.selexec('y', '=', 0);
        t.addClass('strong');
        t.selexec('x', '=', 2).addClass('underline');
        this.table.parse();
    };

})(node);

/**
 * # VisualTimer
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Display a configurable timer for the game
 *
 * Timer can trigger events, only for countdown smaller than 1h.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('VisualTimer', VisualTimer);

    // ## Meta-data

    VisualTimer.version = '0.9.0';
    VisualTimer.description = 'Display a configurable timer for the game. ' +
        'Can trigger events. Only for countdown smaller than 1h.';

    VisualTimer.title = 'Time left';
    VisualTimer.className = 'visualtimer';

    // ## Dependencies

    VisualTimer.dependencies = {
        GameTimer: {},
        JSUS: {}
    };

    /**
     * ## VisualTimer constructor
     *
     * `VisualTimer` displays and manages a `GameTimer`
     *
     * @param {object} options Optional. Configuration options
     * The options it can take are:
     *
     *   - any options that can be passed to a `GameTimer`
     *   - `waitBoxOptions`: an option object to be passed to `TimerBox`
     *   - `mainBoxOptions`: an option object to be passed to `TimerBox`
     *
     * @see TimerBox
     * @see GameTimer
     */
    function VisualTimer() {

        /**
         * ### VisualTimer.gameTimer
         *
         * The timer which counts down the game time
         *
         * @see node.timer.createTimer
         */
        this.gameTimer = null;

        /**
         * ### VisualTimer.mainBox
         *
         * The `TimerBox` which displays the main timer
         *
         * @see TimerBox
         */
        this.mainBox = null;

        /**
         * ### VisualTimer.waitBox
         *
         * The `TimerBox` which displays the wait timer
         *
         * @see TimerBox
         */
        this.waitBox = null;

        /**
         * ### VisualTimer.activeBox
         *
         * The `TimerBox` in which to display the time
         *
         * This variable is always a reference to either `waitBox` or
         * `mainBox`.
         *
         * @see TimerBox
         */
        this.activeBox = null;

        /**
         * ### VisualTimer.isInitialized
         *
         * Indicates whether the instance has been initializded already
         */
        this.isInitialized = false;

        /**
         * ### VisualTimer.options
         *
         * Currently stored options
         */
        this.options = {};

        /**
         * ### VisualTimer.internalTimer
         *
         * TRUE, if the timer is created internally
         *
         * Internal timers are destroyed when widget is destroyed or cleared
         *
         * @see VisualTimer.gameTimer
         * @see VisualTimer.destroy
         * @see VisualTimer.clear
         */
        this.internalTimer = null;
    }

    // ## VisualTimer methods

    /**
     * ### VisualTimer.init
     *
     * Initializes the instance. When called again, adds options to current ones
     *
     * The options it can take are:
     *
     * - any options that can be passed to a `GameTimer`
     * - waitBoxOptions: an option object to be passed to `TimerBox`
     * - mainBoxOptions: an option object to be passed to `TimerBox`
     *
     * @param {object} options Optional. Configuration options
     *
     * @see TimerBox
     * @see GameTimer
     */
    VisualTimer.prototype.init = function(options) {
        var t, gameTimerOptions;

        options = options || {};
        if ('object' !== typeof options) {
            throw new TypeError('VisualTimer.init: options must be ' +
                                'object or undefined');
        }

        // Important! Do not modify directly options, because it might
        // modify a step-property. Will manual clone later.
        gameTimerOptions = {};

        // If gameTimer is not already set, check options, then
        // try to use node.game.timer, if defined, otherwise crete a new timer.
        if ('undefined' !== typeof options.gameTimer) {

            if (this.gameTimer) {
                throw new Error('GameTimer.init: options.gameTimer cannot ' +
                                'be set if a gameTimer is already existing: ' +
                                this.name);
            }
            if ('object' !== typeof options.gameTimer) {
                throw new TypeError('VisualTimer.init: options.' +
                                    'gameTimer must be object or ' +
                                    'undefined. Found: ' + options.gameTimer);
            }
            this.gameTimer = options.gameTimer;
        }
        else {
            if (!this.isInitialized) {
                this.internalTimer = true;
                this.gameTimer = node.timer.createTimer({
                    name: options.name || 'VisualTimer'
                });
            }
        }

        if (options.hooks) {
            if (!this.internalTimer) {
                throw new Error('VisualTimer.init: cannot add hooks on ' +
                                'external gameTimer.');
            }
            if (!J.isArray(options.hooks)) {
                gameTimerOptions.hooks = [ options.hooks ];
            }
        }
        else {
            gameTimerOptions.hooks = [];
        }

        // Only push this hook once.
        if (!this.isInitialized) {
            gameTimerOptions.hooks.push({
                name: 'VisualTimer_' + this.wid,
                hook: this.updateDisplay,
                ctx: this
            });
        }

        // Important! Manual clone must be done after hooks and gameTimer.

        // Parse milliseconds option.
        if ('undefined' !== typeof options.milliseconds) {
            gameTimerOptions.milliseconds =
                node.timer.parseInput('milliseconds', options.milliseconds);
        }

        // Parse update option.
        if ('undefined' !== typeof options.update) {
            gameTimerOptions.update =
                node.timer.parseInput('update', options.update);
        }
        else {
            gameTimerOptions.update = 1000;
        }

        // Parse timeup option.
        if ('undefined' !== typeof options.timeup) {
            gameTimerOptions.timeup = options.timeup;
        }

        // Init the gameTimer, regardless of the source (internal vs external).
        this.gameTimer.init(gameTimerOptions);

        t = this.gameTimer;

// TODO: not using session for now.
//         node.session.register('visualtimer', {
//             set: function(p) {
//                 // TODO
//             },
//             get: function() {
//                 return {
//                     startPaused: t.startPaused,
//                         status: t.status,
//                     timeLeft: t.timeLeft,
//                     timePassed: t.timePassed,
//                     update: t.update,
//                     updateRemaining: t.updateRemaining,
//                     updateStart: t. updateStart
//                 };
//             }
//         });

        this.options = gameTimerOptions;

        if ('undefined' === typeof this.options.stopOnDone) {
            this.options.stopOnDone = true;
        }
        if ('undefined' === typeof this.options.startOnPlaying) {
            this.options.startOnPlaying = true;
        }

        if (!this.options.mainBoxOptions) {
            this.options.mainBoxOptions = {};
        }
        if (!this.options.waitBoxOptions) {
            this.options.waitBoxOptions = {};
        }

        J.mixout(this.options.mainBoxOptions,
                {classNameBody: options.className, hideTitle: true});
        J.mixout(this.options.waitBoxOptions,
                {title: 'Max. wait timer',
                classNameTitle: 'waitTimerTitle',
                classNameBody: 'waitTimerBody', hideBox: true});

        if (!this.mainBox) {
            this.mainBox = new TimerBox(this.options.mainBoxOptions);
        }
        else {
            this.mainBox.init(this.options.mainBoxOptions);
        }
        if (!this.waitBox) {
            this.waitBox = new TimerBox(this.options.waitBoxOptions);
        }
        else {
            this.waitBox.init(this.options.waitBoxOptions);
        }

        this.activeBox = this.options.activeBox || this.mainBox;

        this.isInitialized = true;
    };

    VisualTimer.prototype.append = function() {
        this.bodyDiv.appendChild(this.mainBox.boxDiv);
        this.bodyDiv.appendChild(this.waitBox.boxDiv);

        this.activeBox = this.mainBox;
        this.updateDisplay();
    };

    /**
     * ### VisualTimer.clear
     *
     * Reverts state of `VisualTimer` to right after creation
     *
     * @param {object} options Configuration object
     *
     * @return {object} oldOptions The Old options
     *
     * @see node.timer.destroyTimer
     * @see VisualTimer.init
     */
    VisualTimer.prototype.clear = function(options) {
        var oldOptions;
        options = options || {};
        oldOptions = this.options;

        if (this.internalTimer) {
            node.timer.destroyTimer(this.gameTimer);
            this.internalTimer = null;
        }
        else {
            this.gameTimer.removeHook(this.updateHookName);
        }

        this.gameTimer = null;
        this.activeBox = null;
        this.isInitialized = false;
        this.init(options);

        return oldOptions;
    };

    /**
     * ### VisualTimer.updateDisplay
     *
     * Changes `activeBox` to display current time of `gameTimer`
     *
     * @see TimerBox.bodyDiv
     */
    VisualTimer.prototype.updateDisplay = function() {
        var time, minutes, seconds;
        if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
            this.activeBox.bodyDiv.innerHTML = '00:00';
            return;
        }
        time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
        time = J.parseMilliseconds(time);
        minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
        seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
        this.activeBox.bodyDiv.innerHTML = minutes + ':' + seconds;
    };

    /**
     * ### VisualTimer.start
     *
     * Starts the timer
     *
     * @see VisualTimer.updateDisplay
     * @see GameTimer.start
     */
    VisualTimer.prototype.start = function() {
        this.updateDisplay();
        this.gameTimer.start();
    };

    /**
     * ### VisualTimer.restart
     *
     * Restarts the timer with new options
     *
     * @param {object} options Configuration object
     *
     * @see VisualTimer.init
     * @see VisualTimer.start
     * @see VisualTimer.stop
     */
    VisualTimer.prototype.restart = function(options) {
        this.stop();
        this.init(options);
        this.start();
    };

    /**
     * ### VisualTimer.stop
     *
     * Stops the timer display and stores the time left in `activeBox.timeLeft`
     *
     * @param {object} options Configuration object
     *
     * @see GameTimer.isStopped
     * @see GameTimer.stop
     */
    VisualTimer.prototype.stop = function(options) {
        if (!this.gameTimer.isStopped()) {
            this.activeBox.timeLeft = this.gameTimer.timeLeft;
            this.gameTimer.stop();
        }
    };
    /**
     * ### VisualTimer.switchActiveBoxTo
     *
     * Switches the display of the `gameTimer` into the `TimerBox` `box`
     *
     * Stores `gameTimer.timeLeft` into `activeBox` and then switches
     * `activeBox` to reference `box`.
     *
     * @param {TimerBox} box TimerBox in which to display `gameTimer` time
     */
    VisualTimer.prototype.switchActiveBoxTo = function(box) {
        this.activeBox.timeLeft = this.gameTimer.timeLeft || 0;
        this.activeBox = box;
        this.updateDisplay();
    };

    /**
      * ### VisualTimer.startWaiting
      *
      * Stops the timer and changes the appearance to a max. wait timer
      *
      * If options and/or options.milliseconds are undefined, the wait timer
      * will start with the current time left on the `gameTimer`. The mainBox
      * will be striked out, the waitBox set active and unhidden. All other
      * options are forwarded directly to `VisualTimer.restart`.
      *
      * @param {object} options Configuration object
      *
      * @see VisualTimer.restart
      */
    VisualTimer.prototype.startWaiting = function(options) {
        if ('undefined' === typeof options) options = {};

        if ('undefined' === typeof options.milliseconds) {
            options.milliseconds = this.gameTimer.timeLeft;
        }
        if ('undefined' === typeof options.mainBoxOptions) {
            options.mainBoxOptions = {};
        }
        if ('undefined' === typeof options.waitBoxOptions) {
            options.waitBoxOptions = {};
        }
        options.mainBoxOptions.classNameBody = 'strike';
        options.mainBoxOptions.timeLeft = this.gameTimer.timeLeft || 0;
        options.activeBox = this.waitBox;
        options.waitBoxOptions.hideBox = false;
        this.restart(options);
    };

    /**
      * ### VisualTimer.startTiming
      *
      * Starts the timer and changes appearance to a regular countdown
      *
      * The mainBox will be unstriked and set active, the waitBox will be
      * hidden. All other options are forwarded directly to
      * `VisualTimer.restart`.
      *
      * @param {object} options Configuration object
      *
      * @see VisualTimer.restart
      */
    VisualTimer.prototype.startTiming = function(options) {
        if ('undefined' === typeof options) {
            options = {};
        }
        if ('undefined' === typeof options.mainBoxOptions) {
            options.mainBoxOptions = {};
        }
        if ('undefined' === typeof options.waitBoxOptions) {
            options.waitBoxOptions = {};
        }
        options.activeBox = this.mainBox;
        options.waitBoxOptions.timeLeft = this.gameTimer.timeLeft || 0;
        options.waitBoxOptions.hideBox = true;
        options.mainBoxOptions.classNameBody = '';
        this.restart(options);
    };

    /**
     * ### VisualTimer.resume
     *
     * Resumes the `gameTimer`
     *
     * @see GameTimer.resume
     */
    VisualTimer.prototype.resume = function() {
        this.gameTimer.resume();
    };

    /**
     * ### VisualTimer.setToZero
     *
     * Stops `gameTimer` and sets `activeBox` to display `00:00`
     *
     * @see GameTimer.resume
     */
    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.activeBox.bodyDiv.innerHTML = '00:00';
        this.activeBox.setClassNameBody('strike');
    };

    /**
     * ### VisualTimer.isTimeup
     *
     * Returns TRUE if the timer expired
     *
     * This method is added for backward compatibility.
     *
     * @see GameTimer.isTimeup
     */
    VisualTimer.prototype.isTimeup = function() {
        return this.gameTimer.isTimeup();
    };

    /**
     * ### VisualTimer.doTimeUp
     *
     * Stops the timer and calls the timeup
     *
     * @see GameTimer.doTimeup
     */
    VisualTimer.prototype.doTimeUp = function() {
        this.gameTimer.doTimeUp();
    };

    VisualTimer.prototype.listeners = function() {
        var that = this;

        // Add listeners only on internal timer.
        if (!this.internalTimer) return;

        node.on('PLAYING', function() {
            var options;
            if (that.options.startOnPlaying) {
                options = that.gameTimer.getStepOptions();
                if (options) {
                    // Visual update is here (1000 usually).
                    options.update = that.update;
                    // Make sure timeup is not used (game.timer does it).
                    options.timeup = undefined;
                    // Options other than `update`, `timeup`,
                    // `milliseconds`, `hooks`, `gameTimer` are ignored.
                    that.startTiming(options);
                }
                else {
                    // Set to zero if it was not started already.
                    if (!that.gameTimer.isRunning()) that.setToZero();
                }
            }
        });

        node.on('REALLY_DONE', function() {
            if (that.options.stopOnDone) {
                if (!that.gameTimer.isStopped()) {
                    // This was creating problems, so we just stop it.
                    // It could be an option, though.
                    // that.startWaiting();
                    that.stop();
                }
            }
       });
    };

    VisualTimer.prototype.destroy = function() {
        if (this.internalTimer) {
            node.timer.destroyTimer(this.gameTimer);
            this.internalTimer = null;
        }
        else {
            this.gameTimer.removeHook('VisualTimer_' + this.wid);
        }
        this.bodyDiv.removeChild(this.mainBox.boxDiv);
        this.bodyDiv.removeChild(this.waitBox.boxDiv);
    };

   /**
     * # TimerBox
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Represents a box wherin to display a `VisualTimer`
     */

    /**
     * ## TimerBox constructor
     *
     * `TimerBox` represents a box wherein to display the timer
     *
     * @param {object} options Optional. Configuration options
     *   The options it can take are:
     *
     *   - `hideTitle`
     *   - `hideBody`
     *   - `hideBox`
     *   - `title`
     *   - `classNameTitle`
     *   - `classNameBody`
     *   - `timeLeft`
     */
    function TimerBox(options) {
        /**
         * ### TimerBox.boxDiv
         *
         * The Div which will contain the title and body Divs
         */
        this.boxDiv = null;

        /**
         * ### TimerBox.titleDiv
         *
         * The Div which will contain the title
         */
        this.titleDiv = null;
        /**
         * ### TimerBox.bodyDiv
         *
         * The Div which will contain the numbers
         */
        this.bodyDiv = null;

        /**
         * ### TimerBox.timeLeft
         *
         * Used to store the last value before focus is taken away
         */
        this.timeLeft = null;

        this.boxDiv = node.window.getDiv();
        this.titleDiv = node.window.addDiv(this.boxDiv);
        this.bodyDiv = node.window.addDiv(this.boxDiv);

        this.init(options);

    }

    TimerBox.prototype.init = function(options) {
        if (options) {
            if (options.hideTitle) {
                this.hideTitle();
            }
            else {
                this.unhideTitle();
            }
            if (options.hideBody) {
                this.hideBody();
            }
            else {
                this.unhideBody();
            }
            if (options.hideBox) {
                this.hideBox();
            }
            else {
                this.unhideBox();
            }
        }

        this.setTitle(options.title || '');
        this.setClassNameTitle(options.classNameTitle || '');
        this.setClassNameBody(options.classNameBody || '');

        if (options.timeLeft) {
            this.timeLeft = options.timeLeft;
        }
    };

    // ## TimerBox methods

    /**
     * ### TimerBox.hideBox
     *
     * Hides entire `TimerBox`
     */
    TimerBox.prototype.hideBox = function() {
        this.boxDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideBox
     *
     * Hides entire `TimerBox`
     */
    TimerBox.prototype.unhideBox = function() {
        this.boxDiv.style.display = '';
    };

    /**
     * ### TimerBox.hideTitle
     *
     * Hides title of `TimerBox`
     */
    TimerBox.prototype.hideTitle = function() {
        this.titleDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideTitle
     *
     * Unhides title of `TimerBox`
     */
    TimerBox.prototype.unhideTitle = function() {
        this.titleDiv.style.display = '';
    };

    /**
     * ### TimerBox.hideBody
     *
     * Hides body of `TimerBox`
     */
    TimerBox.prototype.hideBody = function() {
        this.bodyDiv.style.display = 'none';
    };

    /**
     * ### TimerBox.unhideBody
     *
     * Unhides Body of `TimerBox`
     */
    TimerBox.prototype.unhideBody = function() {
        this.bodyDiv.style.display = '';
    };

    /**
     * ### TimerBox.setTitle
     *
     * Sets title of `TimerBox`
     */
    TimerBox.prototype.setTitle = function(title) {
        this.titleDiv.innerHTML = title;
    };

    /**
     * ### TimerBox.setClassNameTitle
     *
     * Sets class name of title of `TimerBox`
     */
    TimerBox.prototype.setClassNameTitle = function(className) {
        this.titleDiv.className = className;
    };

    /**
     * ### TimerBox.setClassNameBody
     *
     * Sets class name of body of `TimerBox`
     */
    TimerBox.prototype.setClassNameBody = function(className) {
        this.bodyDiv.className = className;
    };

})(node);

/**
 * # WaitingRoom
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Display the number of connected / required players to start a game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitingRoom', WaitingRoom);

    // ## Meta-data

    WaitingRoom.version = '1.1.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'Waiting Room';
    WaitingRoom.className = 'waitingroom';

    // ## Dependencies

    WaitingRoom.dependencies = {
        JSUS: {},
        VisualTimer: {}
    };

    /**
     * ## WaitingRoom constructor
     *
     * Instantiates a new WaitingRoom object
     *
     * @param {object} options
     */
    function WaitingRoom(options) {

        /**
         * ### WaitingRoom.connected
         *
         * Number of players connected
         */
        this.connected = 0;

        /**
         * ### WaitingRoom.poolSize
         *
         * Number of players connected before groups are made
         */
        this.poolSize = 0;

        /**
         * ### WaitingRoom.nGames
         *
         * Total number of games to be dispatched
         */
        this.nGames = 0;

        /**
         * ### WaitingRoom.groupSize
         *
         * The size of the group
         */
        this.groupSize = 0;

        /**
         * ### WaitingRoom.waitTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.waitTime = null;

        /**
         * ### WaitingRoom.startDate
         *
         * The exact date and time when the game starts
         */
        this.startDate = null;

        /**
         * ### WaitingRoom.timeoutId
         *
         * The id of the timeout, if created
         */
        this.timeoutId = null;

        /**
         * ### WaitingRoom.playerCountDiv
         *
         * Div containing the span for displaying the number of players
         *
         * @see WaitingRoom.playerCount
         */
        this.playerCountDiv = null;

        /**
         * ### WaitingRoom.playerCount
         *
         * Span displaying the number of connected players
         */
        this.playerCount = null;

        /**
         * ### WaitingRoom.startDateDiv
         *
         * Div containing the start date
         */
        this.startDateDiv = null;

        /**
         * ### WaitingRoom.msgDiv
         *
         * Div containing optional messages to display
         */
        this.msgDiv = null;

        /**
         * ### WaitingRoom.timerDiv
         *
         * Div containing the timer
         *
         * @see WaitingRoom.timer
         */
        this.timerDiv = null;

        /**
         * ### WaitingRoom.timer
         *
         * VisualTimer instance for max wait time.
         *
         * @see VisualTimer
         */
        this.timer = null;

        /**
         * ### WaitingRoom.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### WaitingRoom.onTimeout
         *
         * Callback to be executed if the timer expires
         */
        this.onTimeout = null;


        /**
         * ### WaitingRoom.disconnectMessage
         *
         * String to be put into `this.bodyDiv.innerHTML` when player
         * is disconnected.
         */
        this.disconnectMessage = null;

        /**
         * ### WaitingRoom.disconnectIfNotSelected
         *
         * Flag that indicates whether to disconnect an not selected player
         */
        this.disconnectIfNotSelected = null;
    }

    // ## WaitingRoom methods

    /**
     * ### WaitingRoom.init
     *
     * Setups the requirements widget
     *
     * Available options:
     *
     *   - onComplete: function executed with either failure or success
     *   - onTimeout: function executed when timer runs out
     *   - onSuccess: function executed when all tests succeed
     *   - waitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object.');
        }
        if (conf.onTimeout) {
            if ('function' !== typeof conf.onTimeout) {
                throw new TypeError('WaitingRoom.init: conf.onTimeout must ' +
                                    'be function, null or undefined.');
            }
            this.onTimeout = conf.onTimeout;
        }
        if (conf.waitTime) {
            if (null !== conf.waitTime &&
                'number' !== typeof conf.waitTime) {

                throw new TypeError('WaitingRoom.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined.');
            }
            this.waitTime = conf.waitTime;
            this.startTimer();
        }
        // TODO: check conditions?
        if (conf.startDate) {
            this.setStartDate(conf.startDate);
        }

        if (conf.poolSize) {
            if (conf.poolSize && 'number' !== typeof conf.poolSize) {
                throw new TypeError('WaitingRoom.init: conf.poolSize ' +
                                    'must be number or undefined.');
            }
            this.poolSize = conf.poolSize;
        }

        if (conf.groupSize) {
            if (conf.groupSize && 'number' !== typeof conf.groupSize) {
                throw new TypeError('WaitingRoom.init: conf.groupSize ' +
                                    'must be number or undefined.');
            }
            this.groupSize = conf.groupSize;
        }
        if (conf.nGames) {
            if (conf.nGames && 'number' !== typeof conf.nGames) {
                throw new TypeError('WaitingRoom.init: conf.nGames ' +
                                    'must be number or undefined.');
            }
            this.nGames = conf.nGames;
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined.');
            }
            this.connected = conf.connected;
        }

        if (conf.disconnectMessage) {
            if ('string' !== typeof conf.disconnectMessage) {
                throw new TypeError('WaitingRoom.init: ' +
                        'conf.disconnectMessage must be string or undefined.');
            }
            this.disconnectMessage = conf.disconnectMessage;
        }
        else {
            this.disconnectMessage = '<span style="color: red">You have been ' +
                '<strong>disconnected</strong>. Please try again later.' +
                '</span><br><br>';
        }

        if (conf.disconnectIfNotSelected) {
            if ('boolean' !== typeof conf.disconnectIfNotSelected) {
                throw new TypeError('WaitingRoom.init: ' +
                    'conf.disconnectIfNotSelected must be boolean or ' +
                    'undefined.');
            }
            this.disconnectIfNotSelected = conf.disconnectIfNotSelected;
        }
        else {
            this.disconnectIfNotSelected = false;
        }

    };

    /**
     * ### WaitingRoom.addTimeout
     *
     * Starts a timeout for the max waiting time
     *
     */
    WaitingRoom.prototype.startTimer = function() {
        var that = this;
        if (this.timer) return;
        if (!this.waitTime) return;
        if (!this.timerDiv) {
            this.timerDiv = document.createElement('div');
            this.timerDiv.id = 'timer-div';
        }
        this.timerDiv.appendChild(document.createTextNode(
            'Maximum Waiting Time: '
        ));
        this.timer = node.widgets.append('VisualTimer', this.timerDiv, {
            milliseconds: this.waitTime,
            timeup: function() {
                that.bodyDiv.innerHTML =
                    'Waiting for too long. Please look for a HIT called ' +
                    '<strong>ETH Descil Trouble Ticket</strong> and file' +
                    ' a new trouble ticket reporting your experience.';
            },
            update: 1000
        });
        // Style up: delete title and border;
        this.timer.setTitle();
        this.timer.panelDiv.className = 'ng_widget visualtimer';
        // Append to bodyDiv.
        this.bodyDiv.appendChild(this.timerDiv);
        this.timer.start();
    };

    /**
     * ### WaitingRoom.clearTimeout
     *
     * Clears the timeout for the max execution time of the requirements
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ### WaitingRoom.updateState
     *
     * Displays the state of the waiting room on screen
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateState = function(update) {
        if (!update) return;
        if ('number' === typeof update.connected) {
            this.connected = update.connected;
        }
        if ('number' === typeof update.poolSize) {
            this.poolSize = update.poolSize;
        }
        if ('number' === typeof update.groupSize) {
            this.groupSize = update.groupSize;
        }
    };

    /**
     * ### WaitingRoom.updateDisplay
     *
     * Displays the state of the waiting room on screen
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateDisplay = function() {
        var numberOfGameSlots, numberOfGames;
        if (this.connected > this.poolSize) {
            numberOfGames = Math.floor(this.connected / this.groupSize);
            numberOfGames = numberOfGames > this.nGames ?
                this.nGames : numberOfGames;
            numberOfGameSlots = numberOfGames * this.groupSize;

            this.playerCount.innerHTML = '<span style="color:red">' +
                this.connected + '</span>' + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = '';
            this.playerCountTooHigh.innerHTML = 'There are more players in ' +
                'this waiting room than there are playslots in the game. ' +
                'Only ' + numberOfGameSlots + ' players will be selected to ' +
                'play the game.';
        }
        else {
            this.playerCount.innerHTML = this.connected + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = 'none';
        }
    };

    WaitingRoom.prototype.append = function() {
        this.playerCountDiv = document.createElement('div');
        this.playerCountDiv.id = 'player-count-div';

        this.playerCountDiv.appendChild(
            document.createTextNode('Waiting for All Players to Connect: '));

        this.playerCount = document.createElement('p');
        this.playerCount.id = 'player-count';
        this.playerCountDiv.appendChild(this.playerCount);

        this.playerCountTooHigh = document.createElement('div');
        this.playerCountTooHigh.style.display = 'none';
        this.playerCountDiv.appendChild(this.playerCountTooHigh);

        this.dots = W.getLoadingDots();
        this.playerCountDiv.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.playerCountDiv);

        this.startDateDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.startDateDiv);
        this.startDateDiv.style.display= 'none';

        this.msgDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.msgDiv);

        if (this.startDate) {
            this.setStartDate(this.startDate);
        }
        if (this.waitTime) {
            this.startTimer();
        }

    };

    WaitingRoom.prototype.listeners = function() {
        var that;
        that = this;

        node.registerSetup('waitroom', function(conf) {
            if (!conf) return;
            if ('object' !== typeof conf) {
                node.warn('waiting room widget: invalid setup object: ' + conf);
                return;
            }
            // Configure all requirements.
            that.init(conf);

            return conf;
        });

        // NodeGame Listeners.
        node.on.data('PLAYERSCONNECTED', function(msg) {
            if (!msg.data) return;
            that.connected = msg.data;
            that.updateDisplay();
        });

        node.on.data('DISPATCH', function(msg) {
            var data, notSelected, reportExitCode;
            msg = msg || {};
            data = msg.data || {};

            reportExitCode = '<br>You have been disconnected. ' +
                ('undefined' !== typeof data.exit ?
                 ('Please report this exit code: ' + data.exit) : '') +
                '<br></h3>';

            if (data.action === 'AllPlayersConnected') {
                that.alertPlayer();
            }

            else if (data.action === 'NotEnoughPlayers') {

                that.bodyDiv.innerHTML =
                    '<h3 align="center" style="color: red">' +
                    'Thank you for your patience.<br>' +
                    'Unfortunately, there are not enough participants in ' +
                    'your group to start the experiment.<br>';

                if (that.onTimeout) that.onTimeout(msg.data);

                that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
            }

            else if (data.action === 'NotSelected') {

                notSelected = '<h3 align="center">' +
                    '<span style="color: red">Unfortunately, you were ' +
                    '<strong>not selected</strong> to join the game this time';

                if (false === data.shouldDispatchMoreGames ||
                    that.disconnectIfNotSelected) {

                    that.bodyDiv.innerHTML = notSelected + '. Thank you ' +
                        'for your participation.</span></h3><br><br>';

                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
                else {
                    that.msgDiv.innerHTML = notSelected + ', but you ' +
                        'may join the next one.</span> ' +
                        '<a class="hand" onclick=' +
                        'javascript:this.parentElement.innerHTML="">' +
                        'Ok, I got it.</a></h3><br><br>';
                }
            }

            else if (data.action === 'Disconnect') {
                that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
            }
        });

        node.on.data('TIME', function(msg) {
            msg = msg || {};
            console.log('TIME IS UP!');
            that.stopTimer();
        });

        // Start waiting time timer.
        node.on.data('WAITTIME', function(msg) {

            // Avoid running multiple timers.
            // if (timeCheck) clearInterval(timeCheck);

            that.updateState(msg.data);
            that.updateDisplay();

        });

        node.on('SOCKET_DISCONNECT', function() {

            // Terminate countdown.
            that.stopTimer();

            // Write about disconnection in page.
            that.bodyDiv.innerHTML = that.disconnectMessage;

//             // Enough to not display it in case of page refresh.
//             setTimeout(function() {
//                 alert('Disconnection from server detected!');
//             }, 200);
        });

        node.on.data('ROOM_CLOSED', function() {
            that.disconnect('<span style="color: red"> The waiting ' +
                'room is <strong>CLOSED</strong>. You have been disconnected.' +
                ' Please try again later.' +
                '</span><br><br>');
        });
    };

    WaitingRoom.prototype.setStartDate = function(startDate) {
        this.startDate = new Date(startDate).toString();
        this.startDateDiv.innerHTML = 'Game starts at: <br>' + this.startDate;
        this.startDateDiv.style.display = '';
    };

    WaitingRoom.prototype.stopTimer = function() {
        if (this.timer) {
            console.log('STOPPING TIMER');
            this.timer.destroy();
        }
    };

    WaitingRoom.prototype.disconnect = function(msg) {
        if (msg) this.disconnectMessage = msg;
        node.socket.disconnect();
        this.stopTimer();
    };

    WaitingRoom.prototype.alertPlayer = function() {
        var clearBlink, onFrame;

        JSUS.playSound('/sounds/doorbell.ogg');
        // If document.hasFocus() returns TRUE, then just one repeat is enough.
        if (document.hasFocus && document.hasFocus()) {
            JSUS.blinkTitle('GAME STARTS!', { repeatFor: 1 });
        }
        // Otherwise we repeat blinking until an event that shows that the
        // user is active on the page happens, e.g. focus and click. However,
        // the iframe is not created yet, and even later. if the user clicks it
        // it won't be detected in the main window, so we need to handle it.
        else {
            clearBlink = JSUS.blinkTitle('GAME STARTS!', {
                stopOnFocus: true,
                stopOnClick: window
            });
            onFrame = function() {
                var frame;
                clearBlink();
                frame = W.getFrame();
                if (frame) {
                    frame.removeEventListener('mouseover', onFrame, false);
                }
            };
            node.events.ng.once('FRAME_GENERATED', function(frame) {
                frame.addEventListener('mouseover', onFrame, false);
            });
        }
    };

    WaitingRoom.prototype.destroy = function() {
        if (this.dots) this.dots.stop();
        node.deregisterSetup('waitroom');
    };

})(node);

/**
 * # Wall
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where log and other information is added
 * with a number and timestamp
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('Wall', Wall);

    // ## Meta-data

    Wall.version = '0.3.1';
    Wall.description = 'Intercepts all LOG events and prints them into a PRE ' +
                       'element with an ordinal number and a timestamp.';

    Wall.title = 'Wall';
    Wall.className = 'wall';

    // ## Dependencies

    Wall.dependencies = {
        JSUS: {}
    };

    /**
     * ## Wall constructor
     *
     * `Wall` prints all LOG events into a PRE.
     *
     * @param {object} options Optional. Configuration options
     * The options it can take are:
     *
     *   - id: The id of the PRE in which to write.
     *   - name: The name of this Wall.
     */
    function Wall(options) {
        /**
         * ### Wall.id
         *
         * The id of the PRE in which to write
         */
        this.id = options.id || 'wall';

        /**
         * ### Wall.name
         *
         * The name of this Wall
         */
        this.name = options.name || this.name;

        /**
         * ### Wall.buffer
         *
         * Buffer for logs which are to be logged before the document is ready
         */
        this.buffer = [];

        /**
         * ### Wall.counter
         *
         * Counts number of entries on wall
         */
        this.counter = 0;

        /**
         * ### Wall.wall
         *
         * The PRE in which to write
         */
        this.wall = node.window.getElement('pre', this.id);
    }

    // ## Wall methods

    /**
     * ### Wall.init
     *
     * Initializes the instance.
     *
     * If options are provided, the counter is set to `options.counter`
     * otherwise nothing happens.
     */
    Wall.prototype.init = function(options) {
        options = options || {};
        this.counter = options.counter || this.counter;
    };

    Wall.prototype.append = function() {
        return this.bodyDiv.appendChild(this.wall);
    };

    /**
     * ### Wall.listeners
     *
     * Wall has a listener to the `LOG` event
     */
    Wall.prototype.listeners = function() {
        var that = this;
        node.on('LOG', function(msg) {
            that.debuffer();
            that.write(msg);
        });
    };


    /**
     *  ### Wall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * Writes into this.buffer if document is not ready yet.
     */
    Wall.prototype.write = function(text) {
        var mark;
        if (document.readyState !== 'complete') {
            this.buffer.push(text);
        }
        else {
            mark = this.counter++ + ') ' + J.getTime() + ' ';
            this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        }
    };

    /**
     * ### Wall.debuffer
     *
     * If the document is ready, the buffer content is written into this.wall
     */
    Wall.prototype.debuffer = function() {
        if (document.readyState === 'complete' && this.buffer.length > 0) {
            for (var i=0; i < this.buffer.length; i++) {
                this.write(this.buffer[i]);
            }
            this.buffer = [];
        }
    };

})(node);
