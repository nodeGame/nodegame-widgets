/**
 * # Widgets
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets
 *
 * http://nodegame.org
 */
(function(window, node) {

    "use strict";

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
         * @see Widgets.last
         */
        this.instances = [];

        /**
        * ### Widgets.last|lastAppended
         *
         * Reference to lastAppended widget
         *
         * @see Widgets.append
         */
        this.last = this.lastAppended = null;

        /**
         * ### Widgets.docked
         *
         * List of docked widgets
         */
        this.docked = [];

        /**
         * ### Widgets.dockedHidden
         *
         * List of hidden docked widgets (cause not enough space on page)
         */
        this.dockedHidden = [];

        /**
         * ### Widgets.boxSelector
         *
         * A box selector widget containing hidden docked widgets
         */
        this.boxSelector = null;

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
            if (conf.destroyAll) that.destroyAll();

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

        // Garbage collection.
        node.on('FRAME_LOADED', function() {
            node.widgets.garbageCollection();
        });

        node.info('node-widgets: loading');
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
     *   - id: user-defined id
     *   - wid: random unique widget id
     *   - hooks: object containing event listeners
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
     *   - removes the widget from DOM (if it was appended),
     *   - removes listeners defined during the creation,
     *   - and remove the widget from Widget.instances,
     *   - invoke the event 'destroyed'.
     *
     *
     * Finally, a reference to the widget is added in `Widgets.instances`.
     *
     * @param {string} widgetName The name of the widget to load
     * @param {object} opts Optional. Configuration options, will be
     *    mixed out with attributes in the `defaults` property
     *    of the widget prototype.
     *
     * @return {object} widget The requested widget
     *
     * @see Widgets.append
     * @see Widgets.instances
     */
    Widgets.prototype.get = function(widgetName, opts) {
        var WidgetProto, widget, changes, tmp, err;

        err = 'Widgets.get';

        if ('string' !== typeof widgetName) {
            throw new TypeError(err + ': widgetName must be string.' +
                               'Found: ' + widgetName);
        }

        err += widgetName + ': ';

        if (!opts) {
            opts = {};
        }
        else if ('object' !== typeof opts) {
            throw new TypeError(err + ' opts must be object or undefined. ' +
                                'Found: ' + opts);
        }

        WidgetProto = J.getNestedValue(widgetName, this.widgets);

        if (!WidgetProto) throw new Error(err + ' not found');

        node.info('creating widget ' + widgetName  + ' v.' +
                  WidgetProto.version);

        if (opts.storeRef === false) {
            if (opts.docked === true || WidgetProto.docked) {
                node.warn(err + ' storeRef=false ignored, widget is docked');
            }
        }

        if (!this.checkDependencies(WidgetProto)) {
            throw new Error(err + ' has unmet dependencies');
        }

        // Create widget.
        widget = new WidgetProto(opts);

        // Set ID.
        tmp = opts.id;
        if ('undefined' !== typeof tmp) {
            if ('number' === typeof tmp) tmp += '';
            if ('string' === typeof tmp) {

                if ('undefined' !== typeof opts.idPrefix) {
                    if ('string' === typeof opts.idPrefix &&
                        'number' !== typeof opts.idPrefix) {

                        tmp = opts.idPrefix + tmp;
                    }
                    else {
                        throw new TypeError('Widgets.get: opts.idPrefix ' +
                                            'must be string, number or ' +
                                            'undefined. Found: ' +
                                            opts.idPrefix);
                    }
                }

                widget.id = tmp;
            }
            else {
                throw new TypeError('Widgets.get: opts.id must be ' +
                                    'string, number or undefined. Found: ' +
                                    tmp);
            }
        }
        // Assign step id as widget id, if widget step and no custom id.
        else if (opts.widgetStep) {
            widget.id = node.game.getStepId();
        }

        // Set prototype values or opts values.
        if ('undefined' !== typeof opts.title) {
            widget.title = opts.title;
        }
        else if ('undefined' !== typeof WidgetProto.title) {
            widget.title = WidgetProto.title;
        }
        else {
            widget.title = '&nbsp;';
        }
        widget.panel = 'undefined' === typeof opts.panel ?
            WidgetProto.panel : opts.panel;
        widget.footer = 'undefined' === typeof opts.footer ?
            WidgetProto.footer : opts.footer;
        widget.className = WidgetProto.className;
        if (J.isArray(opts.className)) {
            widget.className += ' ' + opts.className.join(' ');
        }
        else if ('string' === typeof opts.className) {
            widget.className += ' ' + opts.className;
        }
        else if ('undefined' !== typeof opts.className) {
            throw new TypeError('Widgets.get: className must be array, ' +
                                'string, or undefined. Found: ' +
                                opts.className);
        }
        widget.context = 'undefined' === typeof opts.context ?
            WidgetProto.context : opts.context;
        widget.sounds = 'undefined' === typeof opts.sounds ?
            WidgetProto.sounds : opts.sounds;
        widget.texts = 'undefined' === typeof opts.texts ?
            WidgetProto.texts : opts.texts;

        widget.docked = 'undefined' === typeof opts.docked ?
            WidgetProto.docked : opts.docked;

        widget.collapsible = opts.collapsible || false;
        widget.closable = opts.closable || false;
        widget.collapseTarget =
            opts.collapseTarget || this.collapseTarget || null;
        widget.info = opts.info || false;

        widget.hooks = {
            hidden: [],
            shown: [],
            collapsed: [],
            uncollapsed: [],
            disabled: [],
            enabled: [],
            destroyed: [],
            highlighted: [],
            unhighlighted: []
        };

        // By default destroy widget on exit step.
        widget.destroyOnExit = opts.destroyOnExit !== false;

        // Required widgets require action from user, otherwise they will
        // block node.done().
        if (opts.required === false) {
            widget.required = false;
        }
        else if (opts.required || opts.requiredChoice ||
            ('undefined' !== typeof opts.correctChoice &&
             opts.correctChoice !== false)) {

            // Flag required is undefined, if not set to false explicitely.
            widget.required = true;
        }

        // Fixed properties.

        // Widget Name.
        widget.widgetName = widgetName;
        // Add random unique widget id.
        widget.wid = '' + J.randomInt(0,10000000000000000000);

        // UI properties.

        widget.disabled = null;
        widget.highlighted = null;
        widget.collapsed = null;
        widget.hidden = null;

        // Properties that will modify the UI of the widget once appended.

        // Option already checked.
        if (widget.docked) widget._docked = true;

        // Bootstrap 5 by default.
        if (opts.bootstrap5 !== false) widget._bootstrap5 = true;

        if (opts.disabled) widget._disabled = true;
        if (opts.highlighted) widget._highlighted = true;
        if (opts.collapsed) widget._collapsed = true;
        if (opts.hidden) widget._hidden = true;


        // Call init.
        widget.init(opts);

        // Call listeners.
        if (opts.listeners !== false) {

            // TODO: future versions should pass the right event listener
            // to the listeners method. However, the problem is that it
            // does not have `on.data` methods, those are aliases.

         //  if ('undefined' === typeof opts.listeners) {
         //      ee = node.getCurrentEventEmitter();
         //  }
         //  else if ('string' === typeof opts.listeners) {
         //      if (opts.listeners !== 'game' &&
         //          opts.listeners !== 'stage' &&
         //          opts.listeners !== 'step') {
         //
         //          throw new Error('Widget.get: widget ' + widgetName +
         //                          ' has invalid value for option ' +
         //                          'listeners: ' + opts.listeners);
         //      }
         //      ee = node.events[opts.listeners];
         //  }
         //  else {
         //      throw new Error('Widget.get: widget ' + widgetName +
         //                      ' opts.listeners must be false, string ' +
         //                      'or undefined. Found: ' + opts.listeners);
         //  }

            // Start recording changes.
            node.events.setRecordChanges(true);

            widget.listeners.call(widget);

            // Get registered listeners, clear changes, and stop recording.
            changes = node.events.getChanges(true);
            node.events.setRecordChanges(false);
        }

        // If any listener was added or removed, the original situation will
        // be restored when the widget is destroyed.
        // The widget is also automatically removed from parent.
        widget.destroy = function() {
            var i, len, ee, eeName;

            (function() {
                try {
                    // Remove the widget's div from its parent.
                    if (widget.panelDiv && widget.panelDiv.parentNode) {
                        widget.panelDiv.parentNode.removeChild(widget.panelDiv);
                    }
                }
                catch(e) {
                    node.warn(widgetName + '.destroy: error caught: ' + e);
                }
            })();

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
            if (widget.storeRef !== false) {
                i = -1, len = node.widgets.instances.length;
                for ( ; ++i < len ; ) {
                    if (node.widgets.instances[i].wid === widget.wid) {
                        node.widgets.instances.splice(i,1);
                        break;
                    }
                }
                // Remove from lastAppended.
                if (node.widgets.last &&
                    node.widgets.last.wid === this.wid) {

                    node.warn('node.widgets.last destroyed.');
                    node.widgets.lastAppended = node.widgets.last = null;
                }
            }

            // Remove from docked or adjust frame height.
            if (this.docked) closeDocked(widget.wid, false);
            else if (node.window) node.window.adjustFrameHeight(undefined, 120);

            // In case the widget is stored somewhere else, set destroyed.
            this.destroyed = true;

            this.emit('destroyed');
        };

        // Store widget instance (e.g., used for destruction).
        if (opts.storeRef !== false) this.instances.push(widget);
        else widget.storeRef = false;

        return widget;
    };

    /**
     * ### Widgets.append|add
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
     * @param {object|string} root Optional. The HTML element (or its id) under
     *   which the widget will be appended. Default: `document.body` of the
     *   frame (if one is defined) or of the page
     * @param {options} options Optional. Configuration options to be passed
     *   to the widget
     *
     * @return {object|boolean} The requested widget, or FALSE is an error
     *   occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.add =
    Widgets.prototype.append = function(w, root, options) {
        var tmp;

        if ('string' !== typeof w && 'object' !== typeof w) {
            throw new TypeError('Widgets.append: w must be string or object. ' +
                               'Found: ' + w);
        }

        // If no root is defined, use the body element of the main frame,
        // if none is found, use the document.body.
        if (!root) {
            root = W.getFrameDocument();
            if (root) root = root.body;
            if (!root) root = document.body;
        }
        else if ('string' === typeof root) {
            tmp = W.gid(root);
            if (!tmp) {
                throw new Error('Widgets.append: element with id "' + root +
                                '" not found');
            }
            root = tmp;
        }
        if (!J.isElement(root)) {
            throw new TypeError('Widgets.append: root must be HTMLElement, ' +
                                'string or undefined. Found: ' + root);
        }

        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.append: options must be object or ' +
                                'undefined. Found: ' + options);
        }

        // Init default values.
        options = options || {};
        if ('undefined' === typeof options.panel) {
            if (root === W.getHeader()) options.panel = false;
        }

        // Check if it is a object (new widget).
        // If it is a string is the name of an existing widget.
        // In this case a dependencies check is done.
        if ('string' === typeof w) w = this.get(w, options);

        // Add panelDiv (with or without panel).
        tmp = options.panel === false ? true : w.panel === false;

        if (w._bootstrap5) {
            // Bootstrap 5
            tmp = {
                className: tmp ? [ 'ng_widget', 'no-panel', w.className ] :
                    [ 'ng_widget', 'card', w.className ]
            };
        }
        else {
            // Bootstrap 3
            tmp = {
                className: tmp ? [ 'ng_widget',  'no-panel', w.className ] :
                    [ 'ng_widget', 'panel', 'panel-default', w.className ]
            };
        }

        // Dock it.
        if (options.docked || w._docked) {
            tmp.className.push('docked');
            this.docked.push(w);
            w.docked = true;
        }

        // Add div inside widget.
        w.panelDiv = W.get('div', tmp);

        // Optionally add title (and div).
        if (options.title !== false && w.title) {

            if (w._bootstrap5) {
                // Bootstrap 5.
                tmp = options.panel === false ?
                    'no-panel-heading' : 'card-header';
            }
            else {
                // Bootstrap 3.
                tmp = options.panel === false ?
                    'no-panel-heading' : 'panel-heading';
            }

            w.setTitle(w.title, { className: tmp });
        }

        // Add body (with or without panel).
        if (w._bootstrap5) {
            // Bootstrap 5.
            tmp = options.panel !== false ? 'card-body' : 'no-panel-body';
        }
        else {
            // Bootstrap 3.
            tmp = options.panel !== false ? 'panel-body' : 'no-panel-body';
        }

        w.bodyDiv = W.append('div', w.panelDiv, { className: tmp });

        // Optionally add footer.
        if (w.footer) {
            if (w._bootstrap5) {
                // Bootstrap 5.
                tmp = options.panel === false ?
                    'no-panel-heading' : 'card-footer';
            }
            else {
                    // Bootstrap 3.
                    tmp = options.panel === false ?
                        'no-panel-heading' : 'panel-heading';
            }

            w.setFooter(w.footer);
        }

        // Optionally set context.
        if (w.context) w.setContext(w.context);

        // Adapt UI 1: visibility.
        if (options.hidden || w._hidden) w.hide();
        if (options.collapsed || w._collapsed) w.collapse();

        // Append.
        root.appendChild(w.panelDiv);
        w.originalRoot = root;
        w.append();

        // Adapt UI 2: changes to elements. Needs to be after append, because
        // some elements needs to be created by append and then disabled.
        if (options.highlighted || w._highlighted) w.highlight();
        if (options.disabled || w._disabled) w.disable();

        if (w.docked) {
            // Make sure the distance from the right side is correct.
            setRightStyle(w);
        }
        else if (!w.isHidden() && !w.isCollapsed()) {
            W.adjustFrameHeight(undefined, 150);
        }

        // Store reference of last appended widget (.get method set storeRef).
        if (w.storeRef !== false) this.lastAppended = this.last = w;

        return w;
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
     *
     * @api experimental
     */
    Widgets.prototype.isWidget = function(w, strict) {
        if (strict) return w instanceof node.Widget;
        return ('object' === typeof w &&
                'function' === typeof w.append &&
                'function' === typeof w.getValues &&
                // Used by widgets.append
                'function' === typeof w.isHidden &&
                'function' === typeof w.isCollapsed
            );
    };

    /**
     * ### Widgets.destroyAll
     *
     * Removes all widgets that have been created through Widgets.get
     *
     * @see Widgets.instances
     */
    Widgets.prototype.destroyAll = function() {
        var i, len;
        i = -1, len = this.instances.length;
        // Nested widgets can be destroyed by previous calls to destroy,
        // and each call to destroy modify the array of instances.
        for ( ; ++i < len ; ) {
            this.instances[0].destroy();
        }
        this.lastAppended = this.last = null;
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

    /**
     * ### Widgets.garbageCollection
     *
     * Destroys previously appended widgets nowehere to be found on page
     *
     * @return {array} res List of destroyed widgets
     */
    Widgets.prototype.garbageCollection = (function() {

        // Some IE were missing .contains, so we fallback gracefully.
        function contains(target, widget) {
            var parentNode;
            if (target.contains) return target.contains(widget.panelDiv);
            parentNode = widget.panelDiv.parentNode;
            while (parentNode != null) {
                if (parentNode == target) return true;
                parentNode = parentNode.parentNode;
            }
            return false;
        }

        return function() {
            var w, i, fd, res;
            res = [];
            fd = W.getFrameDocument();
            w = node.widgets.instances;
            for (i = 0; i < w.length; i++) {
                // Check if widget is not on page any more.
                if (w[i].isAppended() &&
                (fd && !contains(fd, w[i])) &&
                !contains(document.body, w[i])) {

                    res.push(w[i]);
                    w[i].destroy();
                    i--;
                }
            }
            return res;
        };
    })();

    /**
     * ### Widgets.isActionRequired
     *
     * Returns TRUE, if any widget currently requires user action
     *
     * Loops trough all widgets that have the `required` flag.
     *
     * @param {object} opts Optional. Options to pass to Widget.getValues.
     *   Default: { markAttempt: false, highlight: false };
     *
     * @return {boolean} TRUE, if any widget requires action
     *
     * @see Widget.isActionRequired
     */
    Widgets.prototype.isActionRequired = function(opts) {
        var w, i, lastErrored, res;
        w = node.widgets.instances;
        res = false;
        for (i = 0; i < w.length; i++) {
            if (w[i].required) {
                if (w[i].isActionRequired(opts)) {
                    res = true;
                    lastErrored = w[i];
                }
            }
        }
        // Scroll to error.
        if (lastErrored && opts.highlight &&
            'function' === typeof lastErrored.bodyDiv.scrollIntoView) {

            lastErrored.bodyDiv.scrollIntoView({ behavior: 'smooth' });
        }
        return res;
    };

    // ## Helper functions

    // ### checkDepErrMsg
    //
    // Prints out an error message for a dependency not met.
    //
    // @param {Widget} w The widget
    // @param {string} d The dependency
    function checkDepErrMsg(w, d) {
        var name = w.name || w.id;
        node.err(d + ' not found. ' + name + ' cannot be loaded');
    }

    // ### closeDocked
    //
    // Shifts docked widgets on page and remove a widget from the docked list
    //
    // @param {string} wid The widget id
    // @param {boolean} remove TRUE, if widget should be removed from
    //    docked list. Default: FALSE.
    //
    // @return {boolean} TRUE if a widget with given wid was found
    //
    // @see BoxSelector
    function closeDocked(wid, hide) {
        var d, i, len, width, closed;
        d = node.widgets.docked;
        len = d.length;
        for (i = 0; i < len; i++) {
            if (width) {
                d[i].panelDiv.style.right =
                    (getPxNum(d[i].panelDiv.style.right) - width) + 'px';
            }
            else if (d[i].wid === wid) {
                width = d[i].dockedOffsetWidth;
                // Remove from docked list.
                closed = node.widgets.docked.splice(i, 1)[0];
                if (hide) {
                    node.widgets.dockedHidden.push(closed);
                    closed.hide();

                    if (!node.widgets.boxSelector) {
                        node.widgets.boxSelector =
                            node.widgets.append('BoxSelector', document.body, {
                                className: 'docked-left',
                                getId: function(i) { return i.wid; },
                                getDescr: function(i) { return i.title; },
                                onclick: function(i, id) {
                                    i.show();
                                    // First add back to docked list,
                                    // then set right style.
                                    node.widgets.docked.push(i);
                                    setRightStyle(i);
                                    this.removeItem(id);
                                    if (this.items.length === 0) {
                                        this.destroy();
                                        node.widgets.boxSelector = null;
                                    }
                                },
                            });

                    }
                    node.widgets.boxSelector.addItem(closed);
                }
                // Decrement len and i.
                len--;
                i--;
            }
        }
        return !!width;
    }

    // ### setRightStyle
    //
    // Sets the right property of the panelDiv of a docked widget
    //
    // May close docked widgets to make space to this one.
    //
    // @param {Widget} w The widget
    function setRightStyle(w) {
        var dockedMargin, safeMargin;
        var lastDocked, right, ws, tmp;

        safeMargin = 200;
        dockedMargin = 20;

        ws = node.widgets;

        right = 0;
        // The widget w has been already added to the docked list.
        if (ws.docked.length > 1) {
            lastDocked = ws.docked[(ws.docked.length - 2)];
            right = getPxNum(lastDocked.panelDiv.style.right);
            right += lastDocked.panelDiv.offsetWidth;
        }
        right += dockedMargin;

        w.panelDiv.style.right = (right + "px");

        // Check if there is enough space on page?
        tmp = 0;
        right += w.panelDiv.offsetWidth + safeMargin;
        while (ws.docked.length > 1 &&
               right > window.innerWidth &&
               tmp < (ws.docked.length - 1)) {

            // Make some space...
            closeDocked(ws.docked[tmp].wid, true);
            tmp++;
        }
        // Store final offsetWidth in widget, because we need it after
        // it is destroyed.
        w.dockedOffsetWidth = w.panelDiv.offsetWidth + dockedMargin;
    }

    // ### getPxNum
    //
    // Returns the numeric value of string containg 'px' at the end, e.g. 20px.
    //
    // @param {string} The value of a css property containing 'px' at the end
    //
    // @return {number} The numeric value of the css property
    function getPxNum(str) {
        return parseInt(str.substring(0, str.length - 2), 10);
    }

    // Expose Widgets to the global object.
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
