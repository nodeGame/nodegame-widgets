/**
 * # Widget
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
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
    var NDDB = node.NDDB;

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
     * @param {object} opts Configuration options
     *
     * @see Widgets.get
     */
    Widget.prototype.init = function(opts) {};

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
     * @param {mixed} opts Settings controlling the content of return value
     *
     * @return {mixed} The values of the widget
     */
    Widget.prototype.getValues = function(opts) {};

    /**
     * ### Widget.setValues
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
    Widget.prototype.reset = function(opts) {};

    /**
     * ### Widget.highlight
     *
     * Hightlights the user interface of the widget in some way
     *
     * By default, it adds a red border around the bodyDiv.
     *
     * If widget was not appended, i.e., no `panelDiv` has been created,
     * nothing happens.
     *
     * @param {mixed} options Settings controlling the type of highlighting
     */
    Widget.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError(J.funcName(this.constructor) + '.highlight: ' +
                                'border must be string or undefined. Found: ' +
                                border);
        }
        if (!this.isAppended() || this.isHighlighted()) return;
        this.highlighted = true;
        this.bodyDiv.style.border = border  || '3px solid red';
        this.emit('highlighted', border);
    };

    /**
     * ### Widget.highlight
     *
     * Hightlights the user interface of the widget in some way
     *
     * Should mark the state of widget as not `highlighted`.
     *
     * If widget was not appended, i.e., no `panelDiv` has been created,
     * nothing happens.
     *
     * @see Widget.highlight
     */
    Widget.prototype.unhighlight = function() {
        if (!this.isHighlighted()) return;
        this.highlighted = false;
        this.bodyDiv.style.border = '';
        this.emit('unhighlighted');
    };

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
     * ### Widget.isDocked
     *
     * Returns TRUE if widget is currently docked
     *
     * @return {boolean} TRUE, if widget is currently docked
     */
    Widget.prototype.isDocked = function() {
        return !!this.docked;
    };

    /**
     * ### Widget.isActionRequired
     *
     * Returns TRUE if widget if the widget does not required action from user
     *
     * If the widget does not have the `required` flag it returns FALSE,
     * otherwise it invokes Widget.getValues and looks in the response for
     * incorrect or missing values.
     *
     * @param {object} opts Optional. Options to pass to Widget.getValues.
     *   Default: { markAttempt: false, highlight: false };
     *
     * @return {boolean} TRUE, if action is required
     */
    Widget.prototype.isActionRequired = function(opts) {
        var values;
        if (!this.required) return false;
        opts = opts || {};
        opts.markAttempt = opts.markAttempt || false;
        opts.highlight = opts.highlight || false;
        values = this.getValues(opts);
        if (!values) return false; // Safety check.
        // TODO: check removed: values.missValues === true ||
        return values.choice === null || values.isCorrect === false;
    };

    /**
     * ### Widget.collapse
     *
     * Collapses the widget (hides the body and footer)
     *
     * Only, if it was previously appended to DOM
     *
     * @see Widget.uncollapse
     * @see Widget.isCollapsed
     */
    Widget.prototype.collapse = function() {
        if (!this.panelDiv) return;
        this.bodyDiv.style.display = 'none';
        this.collapsed = true;
        if (this.collapseButton) {
            this.collapseButton.src = '/images/maximize_small2.png';
            this.collapseButton.title = 'Restore';
        }
        if (this.footer) this.footer.style.display = 'none';
        // Move into collapse target, if one is specified.
        if (this.collapseTarget) this.collapseTarget.appendChild(this.panelDiv);
        this.emit('collapsed');
    };

    /**
     * ### Widget.uncollapse
     *
     * Uncollapses the widget (shows the body and footer)
     *
     * Only if it was previously appended to DOM
     *
     * @see Widget.collapse
     * @see Widget.isCollapsed
     */
    Widget.prototype.uncollapse = function() {
        if (!this.panelDiv) return;
        if (this.collapseTarget) {
            this.originalRoot.appendChild(this.panelDiv);
        }
        this.bodyDiv.style.display = '';
        this.collapsed = false;
        if (this.collapseButton) {
            this.collapseButton.src = '/images/maximize_small.png';
            this.collapseButton.title = 'Minimize';
        }
        if (this.footer) this.footer.style.display = '';
        this.emit('uncollapsed');
    };

    /**
     * ### Widget.isCollapsed
     *
     * Returns TRUE if widget is currently collapsed
     *
     * @return {boolean} TRUE, if widget is currently collapsed
     */
    Widget.prototype.isCollapsed = function() {
        return !!this.collapsed;
    };

    /**
     * ### Widget.enable
     *
     * Enables the widget
     *
     * An enabled widget allows the user to interact with it
     */
    Widget.prototype.enable = function(options) {
        if (!this.disabled) return;
        this.disabled = false;
        this.emit('enabled', options);
    };

    /**
     * ### Widget.disable
     *
     * Disables the widget
     *
     * A disabled widget is still visible, but user cannot interact with it
     */
    Widget.prototype.disable = function(options) {
        if (this.disabled) return;
        this.disabled = true;
        this.emit('disabled', options);
    };

    /**
     * ### Widget.isDisabled
     *
     * Returns TRUE if widget is disabled
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
     * @see Widget.toggle
     */
    Widget.prototype.hide = function() {
        if (!this.panelDiv) return;
        if (this.hidden) return;
        this.panelDiv.style.display = 'none';
        this.hidden = true;
        this.emit('hidden');
    };

    /**
     * ### Widget.show
     *
     * Shows the widget, if it was previously appended and hidden
     *
     * Sets the 'display' property of `panelDiv` to ''
     *
     * @param {string} display Optional. The value of the display
     *    property. Default: ''
     *
     * @see Widget.hide
     * @see Widget.toggle
     */
    Widget.prototype.show = function(display) {
        if (this.panelDiv && this.panelDiv.style.display === 'none') {
            this.panelDiv.style.display = display || '';
            this.hidden = false;
            this.emit('shown');
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
        if (this.hidden) this.show();
        else this.hide();
    };

    /**
     * ### Widget.isHidden
     *
     * TRUE if widget is hidden or not yet appended
     *
     * @return {boolean} TRUE if widget is hidden, or if it was not
     *   appended to the DOM yet
     */
    Widget.prototype.isHidden = function() {
        return !!this.hidden;
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
     * @param {object} Optional. Options to be passed to `W.add` if a new
     *    heading div is created. Default: { className: 'panel-heading' }
     *
     * @see Widget.headingDiv
     * @see GameWindow.add
     */
    Widget.prototype.setTitle = function(title, options) {
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
                if (!options) {
                    // Bootstrap 3
                    // options = { className: 'panel-heading' };
                    options = { className: 'card-header' };
                }
                else if ('object' !== typeof options) {
                    throw new TypeError('Widget.setTitle: options must ' +
                                        'be object or undefined. Found: ' +
                                        options);
                }
                this.headingDiv = W.add('div', this.panelDiv, options);
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
                throw new TypeError(J.funcName(this.constructor) +
                                    '.setTitle: title must be string, ' +
                                    'HTML element or falsy. Found: ' + title);
            }
            if (this.collapsible) {
                // Generates a button that hides the body of the panel.
                (function(that) {
                    var link, img;
                    link = document.createElement('span');
                    link.className = 'panel-collapse-link';
                    img = document.createElement('img');
                    img.src = '/images/minimize_small.png';
                    link.appendChild(img);
                    link.onclick = function() {
                        if (that.isCollapsed()) that.uncollapse();
                        else that.collapse();
                    };
                    that.headingDiv.appendChild(link);
                })(this);
            }
            if (this.closable) {
                (function(that) {
                    var link, img;
                    link = document.createElement('span');
                    link.className = 'panel-collapse-link';
                    // link.style['margin-right'] = '8px';
                    img = document.createElement('img');
                    img.src = '/images/close_small.png';
                    link.appendChild(img);
                    link.onclick = function() {
                        that.destroy();
                    };
                    that.headingDiv.appendChild(link);
                })(this);
            }
            if (this.info) {
                (function(that) {
                    var link, img, a;

                    link = W.add('span', that.headingDiv);
                    link.className = 'panel-collapse-link';

                    // link.style['margin-right'] = '8px';
                    a = W.add('a', link);
                    a.href = that.info;
                    a.target = '_blank';

                    img = W.add('img', a);
                    img.src = '/images/info.png';

                })(this);
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
     * @param {object} Optional. Options to be passed to `W.add` if a new
     *    footer div is created. Default: { className: 'panel-footer' }
     *
     * @see Widget.footerDiv
     * @see GameWindow.add
     */
    Widget.prototype.setFooter = function(footer, options) {
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
                if (!options) {
                    // Bootstrap 3.
                    // options = { className: 'panel-footer' };
                    // Bootstrap 5.
                    options = { className: 'card-footer' };
                }
                else if ('object' !== typeof options) {
                    throw new TypeError('Widget.setFooter: options must ' +
                                        'be object or undefined. Found: ' +
                                        options);
                }
                this.footerDiv = W.add('div', this.panelDiv, options);
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
                throw new TypeError(J.funcName(this.constructor) +
                                    '.setFooter: footer must be string, ' +
                                    'HTML element or falsy. Found: ' + footer);
            }
        }
    };

    /**
     * ### Widget.setContext
     *
     * @deprecated
     */
    Widget.prototype.setContext = function() {
        console.log('*** Deprecation warning: setContext no longer ' +
                    'available in Bootstrap5.');
    };

    /**
     * ### Widget.addFrame
     *
     * Adds a border and margins around the bodyDiv element
     *
     * @param {string} context The type of bootstrap context.
     *   Default: 'default'
     *
     * @see Widget.panelDiv
     * @see Widget.bodyDiv
     */
    Widget.prototype.addFrame = function(context) {
        if ('undefined' === typeof context) {
            context = 'default';
        }
        else if ('string' !== typeof context || context.trim() === '') {
            throw new TypeError(J.funcName(this.constructor) +
                                '.addFrame: context must be a non-empty ' +
                                'string or undefined. Found: ' + context);
        }
        if (this.panelDiv) {
            if (this.panelDiv.className.indexOf('panel-') === -1) {
                W.addClass(this.panelDiv, 'panel-' + context);
            }
        }
        if (this.bodyDiv) {
            if (this.bodyDiv.className.indexOf('panel-body') === -1) {
                W.addClass(this.bodyDiv, 'panel-body');
            }
        }
    };

    /**
     * ### Widget.removeFrame
     *
     * Removes the border and the margins around the bodyDiv element
     *
     * @see Widget.panelDiv
     * @see Widget.bodyDiv
     */
    Widget.prototype.removeFrame = function() {
        if (this.panelDiv) W.removeClass(this.panelDiv, 'panel-[a-z]*');
        if (this.bodyDiv) W.removeClass(this.bodyDiv, 'panel-body');
    };

    /**
     * ### Widget.isAppended
     *
     * Returns TRUE if widget was appended to DOM (using Widget API)
     *
     * Checks if the panelDiv element has been created.
     *
     * @return {boolean} TRUE, if node.widgets.append was called
     */
    Widget.prototype.isAppended = function() {
        return !!this.panelDiv;
    };

    /**
     * ### Widget.isDestroyed
     *
     * Returns TRUE if widget has been destroyed
     *
     * @return {boolean} TRUE, if the widget has been destroyed
     */
    Widget.prototype.isDestroyed = function() {
        return !!this.destroyed;
    };

    /**
     * ### Widget.setSound
     *
     * Checks and assigns the value of a sound to play to user
     *
     * Throws an error if value is invalid
     *
     * @param {string} name The name of the sound to check
     * @param {mixed} path Optional. The path to the audio file. If undefined
     *    the default value from Widget.sounds is used
     *
     * @see Widget.sounds
     * @see Widget.getSound
     * @see Widget.setSounds
     * @see Widget.getSounds
     */
    Widget.prototype.setSound = function(name, value) {
        strSetter(this, name, value, 'sounds', 'Widget.setSound');
    };

    /**
     * ### Widget.setSounds
     *
     * Assigns multiple sounds at the same time
     *
     * @param {object} sounds Optional. Object containing sound paths
     *
     * @see Widget.sounds
     * @see Widget.setSound
     * @see Widget.getSound
     * @see Widget.getSounds
     */
    Widget.prototype.setSounds = function(sounds) {
        strSetterMulti(this, sounds, 'sounds', 'setSound',
                       J.funcName(this.constructor) + '.setSounds');
    };

    /**
     * ### Widget.getSound
     *
     * Returns the requested sound path
     *
     * @param {string} name The name of the sound variable.
     * @param {mixed} param Optional. Additional info to pass to the
     *   callback, if any
     *
     * @return {string} The requested sound
     *
     * @see Widget.sounds
     * @see Widget.setSound
     * @see Widget.getSound
     * @see Widget.getSounds
     */
    Widget.prototype.getSound = function(name, param) {
        return strGetter(this, name, 'sounds',
                         J.funcName(this.constructor) + '.getSound', param);
    };

    /**
     * ### Widget.getSounds
     *
     * Returns an object with selected sounds (paths)
     *
     * @param {object|array} keys Optional. An object whose keys, or an array
     *   whose values, are used of  to select the properties to return.
     *   Default: all properties in the collection object.
     * @param {object} param Optional. Object containing parameters to pass
     *   to the sounds functions (if any)
     *
     * @return {object} Selected sounds (paths)
     *
     * @see Widget.sounds
     * @see Widget.setSound
     * @see Widget.getSound
     * @see Widget.setSounds
     */
    Widget.prototype.getSounds = function(keys, param) {
        return strGetterMulti(this, 'sounds', 'getSound',
                              J.funcName(this.constructor)
                              + '.getSounds', keys, param);
    };

    /**
     * ### Widget.getAllSounds
     *
     * Returns an object with all current sounds
     *
     * @param {object} param Optional. Object containing parameters to pass
     *   to the sounds functions (if any)
     *
     * @return {object} All current sounds
     *
     * @see Widget.getSound
     */
    Widget.prototype.getAllSounds = function(param) {
        return strGetterMulti(this, 'sounds', 'getSound',
                              J.funcName(this.constructor) + '.getAllSounds',
                              undefined, param);
    };

    /**
     * ### Widget.setText
     *
     * Checks and assigns the value of a text to display to user
     *
     * Throws an error if value is invalid
     *
     * @param {string} name The name of the property to check
     * @param {mixed} value Optional. The value for the text. If undefined
     *    the default value from Widget.texts is used
     *
     * @see Widget.texts
     * @see Widget.getText
     * @see Widget.setTexts
     * @see Widget.getTexts
     */
    Widget.prototype.setText = function(name, value) {
        strSetter(this, name, value, 'texts',
                  J.funcName(this.constructor) + '.setText');
    };

    /**
     * ### Widget.setTexts
     *
     * Assigns all texts
     *
     * @param {object} texts Optional. Object containing texts
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.getText
     * @see Widget.getTexts
     */
    Widget.prototype.setTexts = function(texts) {
        strSetterMulti(this, texts, 'texts', 'setText',
                       J.funcName(this.constructor) + '.setTexts');
    };

    /**
     * ### Widget.getText
     *
     * Returns the requested text
     *
     * @param {string} name The name of the text variable.
     * @param {mixed} param Optional. Additional to pass to the callback, if any
     *
     * @return {string} The requested text
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.setTexts
     * @see Widget.getTexts
     */
    Widget.prototype.getText = function(name, param) {
        return strGetter(this, name, 'texts',
                         J.funcName(this.constructor) + '.getText', param);
    };

    /**
     * ### Widget.getTexts
     *
     * Returns an object with selected texts
     *
     * @param {object|array} keys Optional. An object whose keys, or an array
     *   whose values, are used of  to select the properties to return.
     *   Default: all properties in the collection object.
     * @param {object} param Optional. Object containing parameters to pass
     *   to the sounds functions (if any)
     *
     * @return {object} Selected texts
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.getText
     * @see Widget.setTexts
     * @see Widget.getAllTexts
     */
    Widget.prototype.getTexts = function(keys, param) {
        return strGetterMulti(this, 'texts', 'getText',
                              J.funcName(this.constructor)
                              + '.getTexts', keys, param);
    };

    /**
     * ### Widget.getAllTexts
     *
     * Returns an object with all current texts
     *
     * @param {object|array} param Optional. Object containing parameters
     *   to pass to the texts functions (if any)
     *
     * @return {object} All current texts
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.setTexts
     * @see Widget.getText
     */
    Widget.prototype.getAllTexts = function(param) {
        return strGetterMulti(this, 'texts', 'getText',
                              J.funcName(this.constructor)
                              + '.getAllTexts', undefined, param);
    };

    // ## Event-Emitter methods borrowed from NDDB

    /**
     * ### Widget.on
     *
     * Registers an event listener for the widget
     *
     * @see NDDB.off
     */
    Widget.prototype.on = function() {
        NDDB.prototype.on.apply(this, arguments);
    };

    /**
     * ### Widget.off
     *
     * Removes and event listener for the widget
     *
     * @see NDDB.off
     */
    Widget.prototype.off = function() {
        NDDB.prototype.off.apply(this, arguments);
    };

    /**
     * ### Widget.emit
     *
     * Emits an event within the widget
     *
     * @see NDDB.emit
     */
    Widget.prototype.emit = function() {
        NDDB.prototype.emit.apply(this, arguments);
    };

    /**
     * ### Widget.throwErr
     *
     * Get the name of the actual widget and throws the error
     *
     * It does **not** perform type checking on itw own input parameters.
     *
     * @param {string} type Optional. The error type, e.g. 'TypeError'.
     *   Default, 'Error'
     * @param {string} method Optional. The name of the method
     * @param {string|object} err Optional. The error. Default, 'generic error'
     *
     * @see NDDB.throwErr
     */
    Widget.prototype.throwErr = function(type, method, err) {
        var errMsg;
        errMsg = J.funcName(this.constructor) + '.' + method + ': ';
        if ('object' === typeof err) errMsg += err.stack || err;
        else if ('string' === typeof err) errMsg += err;
        if (type === 'TypeError') throw new TypeError(errMsg);
        throw new Error(errMsg);
    };

    // ## Helper methods.

    /**
     * ### strGetter
     *
     * Returns the value a property from a collection in instance/constructor
     *
     * If the string is not found in the live instance, the default value
     * from the same collection inside the contructor is returned instead.
     *
     * If the property is not found in the corresponding static
     * collection in the constructor of the instance, an error is thrown.
     *
     * @param {object} that The main instance
     * @param {string} name The name of the property inside the collection
     * @param {string} collection The name of the collection inside the instance
     * @param {string} method The name of the invoking method (for error string)
     * @param {mixed} param Optional. If the value of the requested property
     *   is a function, this parameter is passed to it to get a return value.
     *
     * @return {string} res The value of requested property as found
     *   in the instance, or its default value as found in the constructor
     */
    function strGetter(that, name, collection, method, param) {
        var res;
        if (!that.constructor[collection].hasOwnProperty(name)) {
            throw new Error(method + ': name not found: ' + name);
        }
        res = 'undefined' !== typeof that[collection][name] ?
            that[collection][name] : that.constructor[collection][name];
        if ('function' === typeof res) {
            res = res(that, param);
            if ('string' !== typeof res && res !== false) {
                throw new TypeError(method + ': cb "' + name + '" did not ' +
                                    'return neither string or false. Found: ' +
                                    res);
            }
        }
        return res;
    }

    /**
     * ### strGetterMulti
     *
     * Same as strGetter, but returns multiple values at once
     *
     * @param {object} that The main instance
     * @param {string} collection The name of the collection inside the instance
     * @param {string} getMethod The name of the method to get each value
     * @param {string} method The name of the invoking method (for error string)
     * @param {object|array} keys Optional. An object whose keys, or an array
     *   whose values, are used of this object are to select the properties
     *   to return. Default: all properties in the collection object.
     * @param {mixed} param Optional. If the value of the requested property
     *    is a function, this parameter is passed to it, when invoked to get
     *    a return value. Default: undefined
     *
     * @return {string} out The requested value.
     *
     * @see strGetter
     */
    function strGetterMulti(that, collection, getMethod, method, keys, param) {
        var out, k, len;
        if (!keys) keys = that.constructor[collection];
        if ('undefined' === typeof param) {
            param = {};
        }
        out = {};
        if (J.isArray(keys)) {
            k = -1, len = keys.length;
            for ( ; ++k < len;) {
                out[keys[k]] = that[getMethod](keys[k], param);
            }
        }
        else {
            for (k in keys) {
                if (keys.hasOwnProperty(k)) {
                    out[k] = that[getMethod](k, param);
                }
            }
        }
        return out;
    }

    /**
     * ### strSetterMulti
     *
     * Same as strSetter, but sets multiple values at once
     *
     * @param {object} that The main instance
     * @param {object} obj List of properties to set and their values
     * @param {string} collection The name of the collection inside the instance
     * @param {string} setMethod The name of the method to set each value
     * @param {string} method The name of the invoking method (for error string)
     *
     * @see strSetter
     */
    function strSetterMulti(that, obj, collection, setMethod, method) {
        var i;
        if ('object' !== typeof obj && 'undefined' !== typeof obj) {
            throw new TypeError(method + ': ' + collection +
                                ' must be object or undefined. Found: ' + obj);
        }
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                that[setMethod](i, obj[i]);
            }
        }
    }

    /**
     * ### strSetter
     *
     * Sets the value of a property in a collection if string, function or false
     *
     * @param {object} that The main instance
     * @param {string} name The name of the property to set
     * @param {string|function|false} value The value for the property
     * @param {string} collection The name of the collection inside the instance
     * @param {string} method The name of the invoking method (for error string)
     *
     * @see strSetter
     */
    function strSetter(that, name, value, collection, method) {
        if ('undefined' === typeof that.constructor[collection][name]) {
            throw new TypeError(method + ': name not found: ' + name);
        }
        if ('string' === typeof value ||
            'function' === typeof value ||
            false === value) {

            that[collection][name] = value;
        }
        else {
            throw new TypeError(method + ': value for item "' + name +
                                '" must be string, function or false. ' +
                                'Found: ' + value);
        }
    }



})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof node) ? node : module.parent.exports.node
);

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
        var WidgetPrototype, widget, changes, tmp;

        if ('string' !== typeof widgetName) {
            throw new TypeError('Widgets.get: widgetName must be string.' +
                               'Found: ' + widgetName);
        }
        if (!options) {
            options = {};
        }
        else if ('object' !== typeof options) {
            throw new TypeError('Widgets.get: ' + widgetName + ' options ' +
                                'must be object or undefined. Found: ' +
                                options);
        }
        if (options.storeRef === false) {
            if (options.docked === true) {
                throw new TypeError('Widgets.get: '  + widgetName +
                                    'options.storeRef cannot be false ' +
                                    'if options.docked is true.');
            }
        }

        WidgetPrototype = J.getNestedValue(widgetName, this.widgets);

        if (!WidgetPrototype) {
            throw new Error('Widgets.get: ' + widgetName + ' not found');
        }

        node.info('creating widget ' + widgetName  +
                  ' v.' +  WidgetPrototype.version);

        if (!this.checkDependencies(WidgetPrototype)) {
            throw new Error('Widgets.get: ' + widgetName + ' has unmet ' +
                            'dependencies');
        }

        // Create widget.
        widget = new WidgetPrototype(options);

        // Set ID.
        tmp = options.id;
        if ('undefined' !== typeof tmp) {
            if ('number' === typeof tmp) tmp += '';
            if ('string' === typeof tmp) {

                if ('undefined' !== typeof options.idPrefix) {
                    if ('string' === typeof options.idPrefix &&
                        'number' !== typeof options.idPrefix) {

                        tmp = options.idPrefix + tmp;
                    }
                    else {
                        throw new TypeError('Widgets.get: options.idPrefix ' +
                                            'must be string, number or ' +
                                            'undefined. Found: ' +
                                            options.idPrefix);
                    }
                }

                widget.id = tmp;
            }
            else {
                throw new TypeError('Widgets.get: options.id must be ' +
                                    'string, number or undefined. Found: ' +
                                    tmp);
            }
        }
        // Assign step id as widget id, if widget step and no custom id.
        else if (options.widgetStep) {
            widget.id = node.game.getStepId();
        }

        // Set prototype values or options values.
        if ('undefined' !== typeof options.title) {
            widget.title = options.title;
        }
        else if ('undefined' !== typeof WidgetPrototype.title) {
            widget.title = WidgetPrototype.title;
        }
        else {
            widget.title = '&nbsp;';
        }
        widget.panel = 'undefined' === typeof options.panel ?
            WidgetPrototype.panel : options.panel;
        widget.footer = 'undefined' === typeof options.footer ?
            WidgetPrototype.footer : options.footer;
        widget.className = WidgetPrototype.className;
        if (J.isArray(options.className)) {
            widget.className += ' ' + options.className.join(' ');
        }
        else if ('string' === typeof options.className) {
            widget.className += ' ' + options.className;
        }
        else if ('undefined' !== typeof options.className) {
            throw new TypeError('Widgets.get: className must be array, ' +
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
        widget.info = options.info || false;

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
        widget.destroyOnExit = options.destroyOnExit !== false;

        // Required widgets require action from user, otherwise they will
        // block node.done().
        if (options.required ||
            options.requiredChoice ||
            'undefined' !== typeof options.correctChoice) {

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
        widget.docked = null;

        // Properties that will modify the UI of the widget once appended.

        if (options.disabled) widget._disabled = true;
        if (options.highlighted) widget._highlighted = true;
        if (options.collapsed) widget._collapsed = true;
        if (options.hidden) widget._hidden = true;
        if (options.docked) widget._docked = true;

        // Call init.
        widget.init(options);

        // Call listeners.
        if (options.listeners !== false) {

            // TODO: future versions should pass the right event listener
            // to the listeners method. However, the problem is that it
            // does not have `on.data` methods, those are aliases.

         //  if ('undefined' === typeof options.listeners) {
         //      ee = node.getCurrentEventEmitter();
         //  }
         //  else if ('string' === typeof options.listeners) {
         //      if (options.listeners !== 'game' &&
         //          options.listeners !== 'stage' &&
         //          options.listeners !== 'step') {
         //
         //          throw new Error('Widget.get: widget ' + widgetName +
         //                          ' has invalid value for option ' +
         //                          'listeners: ' + options.listeners);
         //      }
         //      ee = node.events[options.listeners];
         //  }
         //  else {
         //      throw new Error('Widget.get: widget ' + widgetName +
         //                      ' options.listeners must be false, string ' +
         //                      'or undefined. Found: ' + options.listeners);
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
                if (node.widgets.lastAppended &&
                    node.widgets.lastAppended.wid === this.wid) {

                    node.warn('node.widgets.lastAppended destroyed.');
                    node.widgets.lastAppended = null;
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
        if (options.storeRef !== false) this.instances.push(widget);
        else widget.storeRef = false;

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

        if (options.bootstrap5) {
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

            if (options.bootstrap5) {
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
        if (options.bootstrap5) {
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
            if (options.bootstrap5) {
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
        if (w.storeRef !== false) this.lastAppended = w;

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
        this.lastAppended = null;
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

/**
 * # BackButton
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed goes to the previous step
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('BackButton', BackButton);

    // ## Meta-data

    BackButton.version = '0.4.0';
    BackButton.description = 'Creates a button that if ' +
        'pressed goes to the previous step.';

    BackButton.title = false;
    BackButton.className = 'backbutton';
    BackButton.texts.back = 'Back';

    // ## Dependencies

    BackButton.dependencies = {
        JSUS: {}
    };

    /**
     * ## BackButton constructor
     *
     * Creates a new instance of BackButton
     *
     * @param {object} options Optional. Configuration options.
     *   If a `button` option is specified, it sets it as the clickable
     *   button. All other options are passed to the init method.
     *
     * @see BackButton.init
     */
    function BackButton(options) {
        var that;
        that = this;

        /**
         * ### BackButton.button
         *
         * The HTML element.
         */
        if ('object' === typeof options.button) {
            this.button = options.button;
        }
        else if ('undefined' === typeof options.button) {
            this.button = document.createElement('input');
            this.button.type = 'button';
        }
        else {
            throw new TypeError('BackButton constructor: options.button must ' +
                                'be object or undefined. Found: ' +
                                options.button);
        }

        this.button.onclick = function() {
            var res;
            that.disable();
            res = node.game.stepBack(that.stepOptions);
            if (res === false) that.enable();
        };

        this.stepOptions = {

            /**
             * #### BackButton.stepOptions.acrossStages
             *
             * If TRUE, it allows to go back to previous stages
             *
             * Default: FALSE
             */
            acrossStages: null,

            /**
             * #### BackButton.stepOptions.acrossRounds
             *
             * If TRUE, it allows to go back previous rounds in the same stage
             *
             * Default: TRUE
             */
            acrossRounds: null,


            // ## @api: private.
            noZeroStep: true
        };
    }

    // ## BackButton methods

    /**
     * ### BackButton.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     * - id: id of the HTML button, or false to have none. Default:
     *     BackButton.className
     * - className: the className of the button (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the button. Default: BackButton.text
     * - acrossStages: if TRUE, allows going back to previous stages.
     *     Default: FALSE
     * - acrossRounds: if TRUE, allows going back to previous rounds in
     *     the same stage. Default: TRUE
     *
     * @param {object} options Optional. Configuration options
     */
    BackButton.prototype.init = function(opts) {
        var tmp;
        opts = opts || {};

        //Button
        if ('undefined' === typeof opts.id) {
            tmp = BackButton.className;
        }
        else if ('string' === typeof opts.id) {
            tmp = opts.id;
        }
        else if (false === opts.id) {
            tmp = '';
        }
        else {
            throw new TypeError('BackButton.init: opts.id must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.id);
        }
        this.button.id = tmp;

        if ('undefined' === typeof opts.className) {
            tmp  = 'btn btn-lg btn-secondary';
        }
        else if (opts.className === false) {
            tmp = '';
        }
        else if ('string' === typeof opts.className) {
            tmp = opts.className;
        }
        else if (J.isArray(opts.className)) {
            tmp = opts.className.join(' ');
        }
        else  {
            throw new TypeError('BackButton.init: opts.className must ' +
                                'be string, array, or undefined. Found: ' +
                                opts.className);
        }
        this.button.className = tmp;

        // Button text.
        this.button.value = 'string' === typeof opts.text ?
            opts.text : this.getText('back');

        this.stepOptions.acrossStages =
            'undefined' === typeof opts.acrossStages ?
            false : !!opts.acrossStages;
        this.stepOptions.acrossRounds =
            'undefined' === typeof opts.acrossRounds ?
            true : !!opts.acrossRounds;
    };

    BackButton.prototype.append = function() {
        if (!node.game.getPreviousStep(1, this.stepOptions)) this.disable();
        this.bodyDiv.appendChild(this.button);
    };

    BackButton.prototype.listeners = function() {
        var that = this;

        node.events.game.on('DONE', function() {
            that.disable();
        });

        // Locks the back button in case of a timeout.
        node.events.game.on('PLAYING', function() {
            var prop, step;

            // Check options.
            step = node.game.getPreviousStep(1, that.stepOptions);
            prop = node.game.getProperty('backbutton');

            if (!step || prop === false ||
                (prop && prop.enableOnPlaying === false)) {

                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                // It might be enabled already, but we do it again.
                if (step) that.enable();
            }

            if ('string' === typeof prop) that.button.value = prop;
            else if (prop && prop.text) that.button.value = prop.text;
        });
    };

    /**
     * ### BackButton.disable
     *
     * Disables the back button
     */
    BackButton.prototype.disable = function() {
        this.button.disabled = 'disabled';
    };

    /**
     * ### BackButton.enable
     *
     * Enables the back button
     */
    BackButton.prototype.enable = function() {
        this.button.disabled = false;
    };

})(node);

/**
 * # BoxSelector
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple box that opens a menu of items to choose from
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var NDDB =  node.NDDB;

    node.widgets.register('BoxSelector', BoxSelector);

    // ## Meta-data

    BoxSelector.version = '1.0.0';
    BoxSelector.description = 'Creates a simple box that opens a menu ' +
        'of items to choose from.';

    BoxSelector.panel = false;
    BoxSelector.title = false;
    BoxSelector.className = 'boxselector';

    // ## Dependencies

    BoxSelector.dependencies = {
        JSUS: {}
    };

    /**
     * ## BoxSelector constructor
     *
     * `BoxSelector` is a simple configurable chat
     *
     * @see BoxSelector.init
     */
    function BoxSelector() {

        /**
         * ### BoxSelector.button
         *
         * The button that if pressed shows the items
         *
         * @see BoxSelector.ul
         */
        this.button = null;

        /**
         * ### BoxSelector.buttonText
         *
         * The text on the button
         *
         * @see BoxSelector.button
         */
        this.buttonText = '';

        /**
         * ### BoxSelector.items
         *
         * List of items to choose from
         */
        this.items = [];

        /**
         * ### BoxSelector.onclick
         *
         * A callback to call when an item from the list is clicked
         *
         * Callback is executed with the BoxSelector instance as context.
         *
         * Optional. If not specified, items won't be clickable.
         *
         * @see BoxSelector.items
         */
        this.onclick = null;

        /**
         * ### BoxSelector.getDescr
         *
         * A callback that renders an element into a text
         */
        this.getDescr = null;

        /**
         * ### BoxSelector.getId
         *
         * A callback that returns the id of an item
         *
         * Default: returns item.id.
         */
        this.getId = function(item) { return item.id; };

        /**
         * ### BoxSelector.ul
         *
         * The HTML UL element displaying the list of items
         *
         * @see BoxSelector.items
         */
        this.ul = null;
    }

    // ## BoxSelector methods

    /**
     * ### BoxSelector.init
     *
     * Initializes the widget
     *
     * @param {object} options Configuration options.
     */
    BoxSelector.prototype.init = function(options) {
        if (options.onclick) {
            if ('function' !== typeof options.onclick) {
                throw new Error('BoxSelector.init: options.getId must be ' +
                                'function or undefined. Found: ' +
                                options.getId);
            }
            this.onclick = options.onclick;
        }

        if ('function' !== typeof options.getDescr) {
            throw new Error('BoxSelector.init: options.getDescr must be ' +
                            'function. Found: ' + options.getDescr);
        }
        this.getDescr = options.getDescr;

        if (options.getId && 'function' !== typeof options.getId) {
            throw new Error('BoxSelector.init: options.getId must be ' +
                            'function or undefined. Found: ' + options.getId);
        }
        this.getId = options.getId;


    };


    BoxSelector.prototype.append = function() {
        var that, ul, btn, btnGroup, toggled;

        btnGroup = W.add('div', this.bodyDiv);
        btnGroup.role = 'group';
        btnGroup['aria-label'] = 'Select Items';
        btnGroup.className = 'btn-group dropup';

        // Here we create the Button holding the treatment.
        btn = this.button = W.add('button', btnGroup);
        btn.className = 'btn btn-default btn dropdown-toggle';
        btn['data-toggle'] = 'dropdown';
        btn['aria-haspopup'] = 'true';
        btn['aria-expanded'] = 'false';
        btn.innerHTML = this.buttonText + '&nbsp;';

        W.add('span', btn, { className: 'caret' });

        // Here the create the UL of treatments.
        // It will be populated later.
        ul = this.ul = W.add('ul', btnGroup);
        ul.className = 'dropdown-menu';
        ul.style.display = 'none';

        // Variable toggled controls if the dropdown menu
        // is displayed (we are not using bootstrap js files)
        // and we redo the job manually here.
        toggled = false;
        btn.onclick = function() {
            if (toggled) {
                ul.style.display = 'none';
                toggled = false;
            }
            else {
                ul.style.display = 'block';
                toggled = true;
            }
        };

        if (this.onclick) {
            that = this;
            ul.onclick = function(eventData) {
                var id, i, len;
                id = eventData.target;
                // When '' is hidden by bootstrap class.
                ul.style.display = '';
                toggled = false;
                id = id.parentNode.id;
                // Clicked on description?
                if (!id) id = eventData.target.parentNode.parentNode.id;
                // Nothing relevant clicked (e.g., header).
                if (!id) return;
                len = that.items.length;
                // Call the onclick.
                for ( i = 0 ; i < len ; i++) {
                    if (that.getId(that.items[i]) === id) {
                        that.onclick.call(that, that.items[i], id);
                        break;
                    }
                }
            };
        }
    };

    /**
     * ### BoxSelector.addItem
     *
     * Adds an item to the list and renders it
     *
     * @param {mixed} item The item to add
     */
    BoxSelector.prototype.addItem = function(item) {
        var ul, li, a, tmp;
        ul = this.ul;
        li = document.createElement('li');
        // Text.
        tmp = this.getDescr(item);
        if (!tmp || 'string' !== typeof tmp) {
            throw new Error('BoxSelector.addItem: getDescr did not return a ' +
                            'string. Found: ' + tmp + '. Item: ' + item);
        }
        if (this.onclick) {
            a = document.createElement('a');
            a.href = '#';
            a.innerHTML = tmp;
            li.appendChild(a);
        }
        else {
            li.innerHTML = tmp;
        }
        // Id.
        tmp = this.getId(item);
        if (!tmp || 'string' !== typeof tmp) {
            throw new Error('BoxSelector.addItem: getId did not return a ' +
                            'string. Found: ' + tmp + '. Item: ' + item);
        }
        li.id = tmp;
        li.className = 'dropdown-header';
        ul.appendChild(li);
        this.items.push(item);
    };

    /**
     * ### BoxSelector.removeItem
     *
     * Removes an item with given id from the list and the dom
     *
     * @param {mixed} item The item to add
     *
     * @return {mixed|boolean} The removed item or false if not found
     */
    BoxSelector.prototype.removeItem = function(id) {
        var i, len, elem;
        len = this.items.length;
        for ( i = 0 ; i < len ; i++) {
            if (this.getId(this.items[i]) === id) {
                elem = W.gid(id);
                this.ul.removeChild(elem);
                return this.items.splice(i, 1);
            }
        }
        return false;
    };

    BoxSelector.prototype.getValues = function() {
        return this.items;
    };

    // ## Helper functions.


})(node);

/**
 * # Chat
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat
 *
 * // TODO: add bootstrap badge to count msg when collapsed
 * // TODO: check on data if message comes back
 * // TODO: highlight better incoming msg. Play sound?
 * // TODO: removeParticipant and addParticipant methods.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var NDDB =  node.NDDB;

    node.widgets.register('Chat', Chat);

    // ## Texts.

    Chat.texts = {
        outgoing: function(w, data) {
            return data.msg;
            // return '<span class="chat_msg_me">' + data.msg + '</span>';
        },
        incoming: function(w, data) {
            var str;
            str = '<span>';
            if (w.recipientsIds.length > 1) {
                str += '<span class="chat_id_other">' +
                    (w.senderToNameMap[data.id] || data.id) + '</span>: ';
            }
            str += data.msg + '</span>';
            return str;
        },
        quit: function(w, data) {
            return (w.senderToNameMap[data.id] || data.id) + ' left the chat';
        },
        noMoreParticipants: function() {
            return 'No active participant left. Chat disabled.';
        },
        // For both collapse and uncollapse.
        collapse: function(w, data) {
            return (w.senderToNameMap[data.id] || data.id) + ' ' +
                (data.collapsed ? 'mini' : 'maxi') + 'mized the chat';
        },
        textareaPlaceholder: function(w) {
            return w.useSubmitEnter ?
                'Type something and press enter to send' : 'Type something';
        },
        submitButton: 'Send',
        isTyping: 'is typing...'
    };

    // ## Meta-data

    Chat.version = '1.5.0';
    Chat.description = 'Offers a uni-/bi-directional communication interface ' +
        'between players, or between players and the server.';

    Chat.title = 'Chat';
    Chat.className = 'chat';

    Chat.panel = false;

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
         * ### Chat.chatEvent
         *
         * The suffix used to fire chat events
         *
         * Default: 'CHAT'
         */
        this.chatEvent = null;

        /**
         * ### Chat.stats
         *
         * Some basic statistics about message counts
         */
        this.stats = {
            received: 0,
            sent: 0,
            unread: 0
        };

        /**
         * ### Chat.submitButton
         *
         * Button to send a text to server
         *
         * @see Chat.useSubmitButton
         */
        this.submitButton = null;

        /**
         * ### Chat.useSubmitButton
         *
         * If TRUE, a button is added to send messages
         *
         * By default, this is TRUE on mobile devices.
         *
         * @see Chat.submitButton
         * @see Chat.receiverOnly
         */
        this.useSubmitButton = null;

        /**
         * ### Chat.useSubmitButton
         *
         * If TRUE, pressing ENTER sends the msg
         *
         * By default, TRUE
         *
         * @see Chat.submitButton
         * @see Chat.receiverOnly
         */
        this.useSubmitEnter = null;

        /**
         * ### Chat.receiverOnly
         *
         * If TRUE, users cannot send messages (no textarea and submit button)
         *
         * @see Chat.textarea
         */
        this.receiverOnly = false;

        /**
         * ### Chat.storeMsgs
         *
         * If TRUE, a copy of sent and received messages is stored in db
         *
         * @see Chat.db
         */
        this.storeMsgs = false;

        /**
         * ### Chat.db
         *
         * An NDDB database for storing incoming and outgoing messages
         *
         * @see Chat.storeMsgs
         */
        this.db = null;

        /**
         * ### Chat.chatDiv
         *
         * The DIV wherein to display the chat
         */
        this.chatDiv = null;

        /**
         * ### Chat.textarea
         *
         * The textarea wherein to write and read
         */
        this.textarea = null;

        /**
         * ### Chat.initialMsg
         *
         * An object with an initial msg and the id of sender (if not self)
         *
         * Example:
         *
         * ```
         * {
         *   id: '1234', // Optional, add only this is an 'incoming' msg.
         *   msg: 'the text'
         * }
         */
        this.initialMsg = null;

        /**
         * ### Chat.recipientsIds
         *
         * Array of ids of current recipients of messages
         */
        this.recipientsIds = null;

        /**
         * ### Chat.recipientsIdsQuitted
         *
         * Array of ids of  recipients that have previously quitted the chat
         */
        this.recipientsIdsQuitted = null;

        /**
         * ### Chat.senderToNameMap
         *
         * Map sender id (msg.from) to display name
         *
         * Note: The 'from' field of a message can be different
         * from the 'to' field of its reply (e.g., for MONITOR)
         */
        this.senderToNameMap = null;

        /**
         * ### Chat.recipientToNameMap
         *
         * Map recipient id (msg.to) to display name
         */
        this.recipientToNameMap = null;

        /**
         * ### Chat.senderToRecipientMap
         *
         * Map sender id (msg.from) to recipient id (msg.to)
         */
        this.senderToRecipientMap = null;

        /**
         * ### Chat.recipientToSenderMap
         *
         * Map recipient id (msg.to) to sender id (msg.from)
         */
        this.recipientToSenderMap = null;

        /**
         * ### Chat.showIsTyping
         *
         * TRUE, if "is typing" notice is shown
         */
        this.showIsTyping = null;

        /**
         * ### Chat.amTypingTimeout
         *
         * Timeout to send an own "isTyping" notification
         *
         * Timeout is added as soon as the user start typing, cleared when
         * a message is sent.
         */
        this.amTypingTimeout = null;

        /**
         * ### Chat.isTypingTimeouts
         *
         * Object containing timeouts for all participants currently typing
         *
         * A new timeout is added when an IS_TYPING msg is received and
         * cleared when a msg arrives or at expiration.
         */
        this.isTypingTimeouts = {};

        /**
         * ### Chat.isTypingDivs
         *
         * Object containing divs where "is typing" is diplayed
         *
         * Once created
         */
        this.isTypingDivs = {};

        /**
         * ### Chat.preprocessMsg
         *
         * A function that process the msg before being displayed
         *
         * It does not preprocess the initial message
         * and "is typing" notifications.
         *
         * Example:
         *
         * ```js
         * function(data, code) {
         *     data.msg += '!';
         * }
         * ```
         */
        this.preprocessMsg = null;

    }

    // ## Chat methods

    /**
     * ### Chat.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     *
     * The options object can have the following attributes:
     *   - `receiverOnly`: If TRUE, no message can be sent
     *   - `chatEvent`: The event to fire when sending/receiving a message
     *   - `useSubmitButton`: If TRUE, a submit button is added.
     *        Default: TRUE on mobile
     *   - `useSubmitEnter`: If TRUE, pressing ENTER sends a msg.
     *        Default: TRUE
     *   - `showIsTyping: If TRUE, a notice is displayed when users are
     *        typing. Default: TRUE
     *   - `storeMsgs`: If TRUE, a copy of every message is stored in
     *        a local db
     *   - `participants`: An array containing the ids of participants,
     *        cannot be empty
     *   - `initialMsg`: Initial message to be displayed as soon as the chat
     *        is opened.
     *   - `uncollapseOnMsg`: If TRUE, a minimized chat will automatically
     *        open when receiving a msg. Default: FALSE.
     *   - `printStartTime`: If TRUE, the initial time of the chat is
     *        printed at the beginning of the chat. Default: FALSE.
     *   - `printNames`: If TRUE, the names of the participants of the chat
     *        is printed at the beginning of the chat. Default: FALSE.
     */
    Chat.prototype.init = function(opts) {
        var tmp, i, rec, sender, that;
        opts = opts || {};
        that = this;

        // Receiver Only.
        this.receiverOnly = !!opts.receiverOnly;

        tmp = opts.preprocessMsg;
        if ('function' === typeof tmp) {
            this.preprocessMsg = tmp;
        }
        else if (tmp) {
            throw new TypeError('Chat.init: preprocessMsg must be function ' +
                                'or undefined. Found: ' + tmp);
        }

        // Chat id.
        tmp = opts.chatEvent;
        if (tmp) {
            if ('string' !== typeof tmp) {
                throw new TypeError('Chat.init: chatEvent must be a non-' +
                                    'empty string or undefined. Found: ' + tmp);
            }
            this.chatEvent = opts.chatEvent;
        }
        else {
            this.chatEvent = 'CHAT';
        }

        // Store.
        this.storeMsgs = !!opts.storeMsgs;
        if (this.storeMsgs) {
            if (!this.db) this.db = new NDDB();
        }

        // Button to send msg.
        this.useSubmitButton = 'undefined' === typeof opts.useSubmitButton ?
            J.isMobileAgent() : !!opts.useSubmitButton;

        // Enter to send msg (does not exclude button).
        this.useSubmitEnter = 'undefined' === typeof opts.useSubmitEnter ?
            true : !!opts.useSubmitEnter;

        // Participants.
        tmp = opts.participants;
        if (!J.isArray(tmp) || !tmp.length) {
            throw new TypeError('Chat.init: participants must be ' +
                                'a non-empty array. Found: ' + tmp);
        }

        // Build maps.
        this.recipientsIds = new Array(tmp.length);
        this.recipientsIdsQuitted = [];
        this.recipientToSenderMap = {};
        this.recipientToNameMap = {};
        this.senderToNameMap = {};
        this.senderToRecipientMap = {};

        for (i = 0; i < tmp.length; i++) {
            // Everything i the same if string.
            if ('string' === typeof tmp[i]) {
                this.recipientsIds[i] = tmp[i];
                this.recipientToNameMap[tmp[i]] = tmp[i];
                this.recipientToSenderMap[tmp[i]] = tmp[i];
                this.senderToRecipientMap[tmp[i]] = tmp[i];
                this.senderToNameMap[tmp[i]] = tmp[i];
            }
            // Sender may be different from receiver if object.
            else if ('object' === typeof tmp[i]) {
                rec = tmp[i].recipient;
                sender = tmp[i].sender;
                this.recipientsIds[i] = rec;
                this.recipientToSenderMap[rec] = sender || rec;
                this.recipientToNameMap[rec] = tmp[i].name || rec;
                this.senderToRecipientMap[sender] = rec;
                this.senderToNameMap[sender] = this.recipientToNameMap[rec];
            }
            else {
                throw new TypeError('Chat.init: participants array must ' +
                                    'contain string or object. Found: ' +
                                    tmp[i]);
            }
        }

        // Other.
        this.uncollapseOnMsg = opts.uncollapseOnMsg || false;

        this.printStartTime = opts.printStartTime || false;
        this.printNames = opts.printNames || false;

        if (opts.initialMsg) {
            if ('object' !== typeof opts.initialMsg) {
                throw new TypeError('Chat.init: initialMsg must be ' +
                                    'object or undefined. Found: ' +
                                    opts.initialMsg);
            }
            this.initialMsg = opts.initialMsg;
        }

        this.on('uncollapsed', function() {
            // Make sure that we do not have the title highlighted any more.
            that.setTitle(that.title);
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_COLLAPSE',
                         that.recipientsIds, false);
            }
        });

        this.on('collapsed', function() {
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_COLLAPSE',
                         that.recipientsIds, true);
            }
        });

        this.on('destroyed', function() {
            if (that.recipientsIds.length) {
                node.say(that.chatEvent + '_QUIT', that.recipientsIds);
            }
        });

        this.showIsTyping = 'undefined' === typeof opts.showIsTyping ?
            true : !!opts.showIsTyping;
    };

    Chat.prototype.append = function() {
        var that, inputGroup, initialText;
        that = this;

        this.chatDiv = W.get('div', { className: 'chat_chat' });
        this.bodyDiv.appendChild(this.chatDiv);

        if (!this.receiverOnly) {

            // Input group.
            inputGroup = document.createElement('div');
            inputGroup.className = 'chat_inputgroup';

            this.textarea = W.get('textarea', {
                className: 'chat_textarea form-control',
                placeholder: this.getText('textareaPlaceholder')
            });
            inputGroup.appendChild(this.textarea);

            if (this.useSubmitButton) {
                this.submitButton = W.get('button', {
                    className: 'btn-sm btn-info form-control chat_submit',
                    innerHTML: this.getText('submitButton')
                });
                this.submitButton.onclick = function() {
                    that.sendMsg();
                    if ('function' === typeof that.textarea.focus) {
                        that.textarea.focus();
                    }
                };
                inputGroup.appendChild(this.submitButton);
            }
            if (this.useSubmitEnter || this.showIsTyping) {
                this.textarea.onkeydown = function(e) {
                    if (that.useSubmitEnter) {
                        e = e || window.event;
                        if ((e.keyCode || e.which) === 13) that.sendMsg();
                        else sendAmTyping(that);
                    }
                    else if (that.showIsTyping) {
                        sendAmTyping(that);
                    }
                };
            }

            this.bodyDiv.appendChild(inputGroup);
        }

        if (this.printStartTime) {
            W.add('div', this.chatDiv, {
                innerHTML: Date(J.getDate()),
                className: 'chat_event'
            });
            initialText = true;
        }

        if (this.printNames) {
            W.add('div', this.chatDiv, {
                className: 'chat_event',
                innerHTML: 'Participants: ' +
                    J.keys(this.senderToNameMap).join(', ')
            });
            initialText = true;
        }

        if (initialText) {
            W.add('div', this.chatDiv, {
                className: 'chat_event',
                innerHTML: '&nbsp;'
            });
        }

        if (this.initialMsg) {
            this.writeMsg(this.initialMsg.id ? 'incoming' : 'outgoing',
                          this.initialMsg);
        }
    };

    /**
     * ### Chat.readTextarea
     *
     * Reads the value of the textarea, trims it, and removes it from textarea
     *
     * @return {string} The current value in the textarea
     */
    Chat.prototype.readTextarea = function() {
        var txt;
        txt = this.textarea.value;
        this.textarea.value = '';
        return txt.trim();
    };

    /**
     * ### Chat.writeMsg
     *
     * Writes (and formats) a message (or an event) in the message area
     *
     * Chat is scrolled up so that the message is last always on focus.
     *
     * @param {string} code A value indicating the the type of msg. Available:
     *   'incoming', 'outgoing', and anything else.
     * @param {object} data The content of the message and the id of the sender
     *
     * @return {HTMLElement} c The div just inserted with the msg
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.writeMsg = function(code, data) {
        var c;
        c = (code === 'incoming' || code === 'outgoing') ? code : 'event';
        c = W.add('div', this.chatDiv, {
            innerHTML: this.getText(code, data),
            className: 'chat_msg chat_msg_' + c
        });
        this.scrollToBottom();
        return c;
    };

    /**
     * ### Chat.writeMsg
     *
     * It calls preprocess and renders a msg from data
     *
     * If msg is a function it executes it to render it.
     *
     * @param {object} data The content of the message
     * @param {string} code A value indicating the the type of msg. Available:
     *   'incoming', 'outgoing', and anything else.
     *
     * @return {string} msg The rendered msg
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.renderMsg = function(data, code) {
        var msg;
        if ('function' === typeof this.preprocessMsg) {
            this.preprocessMsg(data, code);
        }
        if ('function' === typeof data.msg) {
            msg = data.msg(data, code);
        }
        else {
            msg = data.msg;
        }
        return msg;
    };

    /**
     * ### Chat.scrollToBottom
     *
     * Scrolls the chat to the last message
     */
    Chat.prototype.scrollToBottom = function() {
        this.chatDiv.scrollTop = this.chatDiv.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        node.on.data(this.chatEvent, function(msg) {
            if (!that.handleMsg(msg)) return;

            that.stats.received++;
            // Store message if so requested.
            if (that.storeMsgs) {
                that.db.insert({
                    from: msg.from,
                    text: msg.data,
                    time: node.timer.getTimeSince('step'),
                    timestamp: J.now()
                });
            }
            // Remove is typing sign, if any.
            that.clearIsTyping(msg.from);
            msg = {
                msg: that.renderMsg(msg.data, 'incoming'),
                id: msg.from
            };
            that.writeMsg('incoming', msg);
        });

        node.on.data(this.chatEvent + '_QUIT', function(msg) {
            var i, len, rec;
            if (!that.handleMsg(msg)) return;
            that.writeMsg('quit', { id: msg.from });
            len = that.recipientsIds.length;
            for ( i = 0 ; i < len ; i++) {
                if (that.recipientsIds[i] ===
                    that.senderToRecipientMap[msg.from]) {

                    rec = that.recipientsIds.splice(i, 1);
                    that.recipientsIdsQuitted.push(rec);

                    if (that.recipientsIds.length === 0) {
                        that.writeMsg('noMoreParticipants');
                        that.disable();
                    }
                    break;
                }
            }
            node.warn('Chat: participant quitted not found: ' + msg.from);
        });

        node.on.data(this.chatEvent + '_COLLAPSE', function(msg) {
            if (!that.handleMsg(msg)) return;
            that.writeMsg('collapse', { id: msg.from, collapsed: msg.data});
        });

        node.on.data(this.chatEvent + '_TYPING', function(msg) {
            if (!that.handleMsg(msg)) return;
            that.addIsTyping(msg.from);
        });
    };

    Chat.prototype.addIsTyping = function(id) {
        var t, div, that;
        // Stop existing timeouts.
        t = this.isTypingTimeouts[id];
        if (t) clearTimeout(t);
        // Make or show the div.
        div = this.isTypingDivs[id];
        if (div) {
            // Move last and show..
            this.chatDiv.appendChild(div);
            div.style.display = '';
        }
        else {
            this.isTypingDivs[id] = this.writeMsg('incoming', {
                msg: this.getText('isTyping'),
                id: id
            });
        }
        this.scrollToBottom();
        // Add new timeout (msg are sent every 4000).
        that = this;
        this.isTypingTimeouts[id] = setTimeout(function() {
            that.clearIsTyping(id);
            that.isTypingTimeouts[id] = null;
        }, 3000);
    };

    Chat.prototype.clearIsTyping = function(id) {
        if (this.isTypingTimeouts[id]) {
            clearTimeout(this.isTypingTimeouts[id]);
            this.isTypingTimeouts[id] = null;
        }
        // Keep the div element, just hide it, it will be recycled.
        if (this.isTypingDivs[id]) {
            this.isTypingDivs[id].style.display = 'none';
        }
    };

    /**
     * ### Chat.handleMsg
     *
     * Checks a (incoming) message and takes some actions
     *
     * If chat is minimized, it maximizes it if option `uncollapseOnMsg`
     * it TRUE; otherwise, it increments the stats for unread messages.
     *
     * @param {string} msg The content of the message
     *
     * @return {boolean} TRUE if the message is valid
     *
     * @see Chat.chatDiv
     */
    Chat.prototype.handleMsg = function(msg) {
        var from;
        from = msg.from;
        if (from === node.player.id || from === node.player.sid) {
            node.warn('Chat: your own message came back: ' + msg.id);
            return false;
        }
        if (this.isCollapsed()) {
            if (this.uncollapseOnMsg) {
                this.uncollapse();
                this.stats.unread = 0;
            }
            else {
                this.setTitle('<strong>' + this.title + '</strong>');
                this.stats.unread++;
            }
        }
        return true;
    };

    Chat.prototype.disable = function() {
        if (this.submitButton) this.submitButton.disabled = true;
        this.textarea.disabled = true;
        this.disabled = true;
    };

    Chat.prototype.enable = function() {
        if (this.submitButton) this.submitButton.disabled = false;
        this.textarea.disabled = false;
        this.disabled = false;
    };

    Chat.prototype.getValues = function() {
        var out;
        out = {
            participants: this.participants,
            totSent: this.stats.sent,
            totReceived: this.stats.received,
            totUnread: this.stats.unread,
            initialMsg: this.initialMsg
        };
        if (this.db) out.msgs = this.db.fetch();
        return out;
    };

    /* ### Chat.sendMsg
     *
     * Delivers a msg to the server
     *
     * If no options are specified, it reads the textarea.
     *
     * @param {object} opts Optional. Configutation options:
     *   - msg: the msg to send. If undefined, it reads the value from textarea;
     *          if function it executes it and uses the return value.
     *   - recipients: array of recipients. Default: this.recipientsIds.
     *   - silent: does not write the msg on the chat.
     */
    Chat.prototype.sendMsg = function(opts) {
        var to, ids, that;

        // No msg sent.
        if (this.isDisabled()) {
            node.warn('Chat is disable, msg not sent.');
            return;
        }

        if ('object' === typeof opts) {
            if ('undefined' !== typeof opts.msg) {
                if ('object' === typeof opts.msg) {
                    throw new TypeError('Chat.sendMsg: opts.msg cannot be ' +
                                        'object. Found: ' + opts.msg);
                }
            }
        }
        else {
            if ('undefined' === typeof opts) {
                opts = { msg: this.readTextarea() };
            }
            else if ('string' === typeof opts || 'number' === typeof opts) {
                opts = { msg: opts };
            }
            else {
                throw new TypeError('Chat.sendMsg: opts must be string, ' +
                                    'number, object, or undefined. Found: ' +
                                     opts);
            }
        }

        // Calls preprocessMsg and if opts.msg is function, executes it.
        opts.msg = this.renderMsg(opts, 'outgoing');

        // Move cursor at the beginning.
        if (opts.msg === '') {
            node.warn('Chat: message has no text, not sent.');
            return;
        }
        // Simplify things, if there is only one recipient.
        ids = opts.recipients || this.recipientsIds;
        if (ids.length === 0) {
            node.warn('Chat: empty recipient list, message not sent.');
            return;
        }
        // Make it a number if array of size 1, so it is faster.
        to = ids.length === 1 ? ids[0] : ids;

        node.say(this.chatEvent, to, opts);

        if (!opts.silent) {
            that = this;
            // TODO: check the comment: // to not used now.
            this.writeMsg('outgoing', opts);

            // Make sure the cursor goes back to top.
            if (that.textarea) {
                setTimeout(function() { that.textarea.value = ''; });
            }
        }

        // Clear any typing timeout.
        if (this.amTypingTimeout) {
            clearTimeout(this.amTypingTimeout);
            this.amTypingTimeout = null;
        }
    }

    // ## Helper functions.

    // ### sendMsg
    // Reads the textarea and delivers the msg to the server.
    function sendAmTyping(that) {
        var to;
        if (that.isDisabled()) return;
        // Do not send too many notifications.
        if (that.amTypingTimeout) return;
        // Simplify things, if there is only one recipient.
        to = that.recipientsIds;
        if (!to.length) return;
        else if (to.length === 1) to = to[0];
        // No new notifications for 4s.
        that.amTypingTimeout = setTimeout(function() {
            that.amTypingTimeout = null;
        }, 4000);
        node.say(that.chatEvent + '_TYPING', to);
    }

})(node);

/**
 * # ChernoffFaces
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('ChernoffFaces', ChernoffFaces);

    // ## Meta-data

    ChernoffFaces.version = '0.6.2';
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
            this.canvas = W.get('canvas', options.canvas);
            this.canvas.id = 'ChernoffFaces_canvas';

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
        }

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
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('ChernoffFacesSimple', ChernoffFaces);

    // ## Defaults

    ChernoffFaces.defaults = {};
    ChernoffFaces.defaults.id = 'ChernoffFaces';
    ChernoffFaces.defaults.canvas = {};
    ChernoffFaces.defaults.canvas.width = 100;
    ChernoffFaces.defaults.canvas.heigth = 100;

    // ## Meta-data

    ChernoffFaces.version = '0.4';
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

        this.canvas = W.getCanvas(idCanvas, this.dims);
        this.fp = new FacePainter(this.canvas);
        this.fp.draw(new FaceVector(this.features));

        var sc_options = {
            id: 'cf_controls',
            features:
                J.mergeOnKey(FaceVector.defaults, this.features, 'value'),
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
            features: J.mergeOnKey(FaceVector.defaults, features, 'value')
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
            features: J.mergeOnKey(FaceVector.defaults, fv, 'value'),
            change: this.change
        };
        this.sc.init(sc_options);
        this.sc.refresh();

        return true;
    };

    // FacePainter
    // The class that actually draws the faces on the Canvas
    function FacePainter(canvas, settings) {
        this.canvas = new W.Canvas(canvas);
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
                if (!J.inArray(key,
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
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manages a set of selectable choices forms (e.g., ChoiceTable).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ChoiceManager', ChoiceManager);

    // ## Meta-data

    ChoiceManager.version = '1.4.1';
    ChoiceManager.description = 'Groups together and manages a set of ' +
        'survey forms (e.g., ChoiceTable).';

    ChoiceManager.title = false;
    ChoiceManager.className = 'choicemanager';

    // ## Dependencies

    ChoiceManager.dependencies = {};

    /**
     * ## ChoiceManager constructor
     *
     * Creates a new instance of ChoiceManager
     */
    function ChoiceManager() {
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
         *
         * @see ChoiceManager.formsById
         */
        this.forms = null;

        /**
         * ### ChoiceManager.forms
         *
         * A map form id to form
         *
         * Note: if a form does not have an id, it will not be added here.
         *
         * @see ChoiceManager.forms
         */
        this.formsById = null;

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

        // TODO: rename in sharedOptions.
        /**
         * ### ChoiceManager.formsOptions
         *
         * An object containing options to be added to every form
         *
         * Options are added only if forms are specified as object literals,
         * and can be overriden by each individual form.
         */
        this.formsOptions =  {
            title: false,
            frame: false,
            storeRef: false
        };


        /**
         * ### ChoiceManager.simplify
         *
         * If TRUE, it returns getValues() returns forms.values
         *
         * @see ChoiceManager.getValue
         */
        this.simplify = null;

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

        /**
         * ### ChoiceManager.required
         *
         * TRUE if widget should be checked upon node.done.
         */
        this.required = null;
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
     *   - formsOptions: a set of default options to add to every form
     *
     * @param {object} options Configuration options
     *
     * @see ChoiceManager.setForms
     */
    ChoiceManager.prototype.init = function(options) {
        var tmp;

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
                                'be string or undefined. Found: ' +
                                options.mainText);
        }

        // formsOptions.
        if ('undefined' !== typeof options.formsOptions) {
            if ('object' !== typeof options.formsOptions) {
                throw new TypeError('ChoiceManager.init: options.formsOptions' +
                                    ' must be object or undefined. Found: ' +
                                    options.formsOptions);
            }
            if (options.formsOptions.hasOwnProperty('name')) {
                throw new Error('ChoiceManager.init: options.formsOptions ' +
                                'cannot contain property name. Found: ' +
                                options.formsOptions);
            }
            this.formsOptions = J.mixin(this.formsOptions,
                                        options.formsOptions);
        }

        this.freeText = 'string' === typeof options.freeText ?
            options.freeText : !!options.freeText;

        if ('undefined' !== typeof options.required) {
            this.required = !!options.required;
        }

        // If TRUE, it returns getValues returns forms.values.
        this.simplify = !!options.simplify;

        // After all configuration options are evaluated, add forms.

        if ('undefined' !== typeof options.forms) this.setForms(options.forms);
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
        var form, formsById, i, len, parsedForms, name;
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
        formsById = {};
        forms = new Array(len);
        i = -1;
        for ( ; ++i < len ; ) {
            form = parsedForms[i];
            if (!node.widgets.isWidget(form)) {
                // TODO: smart checking form name. Maybe in Stager already?
                name = form.name || 'ChoiceTable';
                // Add defaults.
                J.mixout(form, this.formsOptions);
                form = node.widgets.get(name, form);
            }

            if (form.id) {
                if (formsById[form.id]) {
                    throw new Error('ChoiceManager.setForms: duplicated ' +
                                    'form id: ' + form.id);
                }

            }
            else {
                form.id = form.className + '_' + i;
            }
            forms[i] = form;
            formsById[form.id] = forms[i];

            if (form.required || form.requiredChoice || form.correctChoice) {
                // False is set manually, otherwise undefined.
                if (this.required === false) {
                    throw new Error('ChoiceManager.setForms: required is ' +
                                    'false, but form "' + form.id +
                                    '" has required truthy');
                }
                this.required = true;
            }
        }
        // Assigned verified forms.
        this.forms = forms;
        this.formsById = formsById;

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
        var i, len, dt;
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
            if (this.id) this.textarea.id = this.id + '_text';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            this.textarea.className = ChoiceManager.className + '-freetext';
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
        this.disabled = true;
        this.emit('disabled');
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
            this.forms[i].enable();
        }
        this.disabled = false;
        this.emit('enabled')
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
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceManager.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.dl || this.highlighted === true) return;
        this.dl.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted');
    };

    /**
     * ### ChoiceManager.unhighlight
     *
     * Removes highlight from the choice dl
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.unhighlight = function() {
        if (!this.dl || this.highlighted !== true) return;
        this.dl.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### ChoiceManager.reset
     *
     * Resets all forms
     *
     * @param {object} opts Optional. Reset options to pass each form
     */
    ChoiceManager.prototype.reset = function(opts) {
        var i, len;
        i = -1;
        len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].reset(opts);
        }
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
     *      will be highlighted. Default: TRUE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceManager.verifyChoice
     */
    ChoiceManager.prototype.getValues = function(opts) {
        var obj, i, len, form, lastErrored, res;
        obj = {
            order: this.order,
            forms: {},
            missValues: []
        };
        if ('undefined' !== typeof this.id) obj.id = this.id;
        opts = opts || {};
        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (opts.markAttempt) obj.isCorrect = true;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            form = this.forms[i];
            // If it is hidden or disabled we do not do validation.
            if (form.isHidden() || form.isDisabled()) {
                res = form.getValues({
                    markAttempt: false,
                    highlight: false
                });
                if (res) obj.forms[form.id] = res;
            }
            else {
                // ContentBox does not return a value.
                res = form.getValues(opts);
                if (!res) continue;
                obj.forms[form.id] = res;
                // Backward compatible (requiredChoice).
                if ((form.required || form.requiredChoice) &&
                    (obj.forms[form.id].choice === null ||
                     (form.selectMultiple &&
                      !obj.forms[form.id].choice.length))) {

                    obj.missValues.push(form.id);
                    lastErrored = form;
                }
                if (opts.markAttempt &&
                    obj.forms[form.id].isCorrect === false) {

                    // obj.isCorrect = false;
                    lastErrored = form;
                }
            }
        }
        if (lastErrored) {
            if (opts.highlight &&
                'function' === typeof lastErrored.bodyDiv.scrollIntoView) {

                lastErrored.bodyDiv.scrollIntoView({ behavior: 'smooth' });
            }
            obj._scrolledIntoView = true;
            obj.isCorrect = false;
            // Adjust frame heights because of error msgs.
            // TODO: error msgs should not change the height.
            W.adjustFrameHeight();
        }
        // if (obj.missValues.length) obj.isCorrect = false;
        if (this.textarea) obj.freetext = this.textarea.value;

        // Simplify everything, if requested.
        if (opts.simplify || this.simplify) {
            res = obj;
            obj = obj.forms;
            if (res.isCorrect === false) obj.isCorrect = false;
            if (res.freetext) obj.freetext = res.freetext;
        }
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

// In progress.
//     const createOnClick = (choice, question) => {
//     return function(value, removed, td) {
//         var w, hide;
//         w = node.widgets.lastAppended.formsById[question];
//         if (J.isArray(choice)) {
//             hide = !J.inArray(this.currentChoice, choice);
//         }
//         else {
//             hide = this.currentChoice !== choice;
//         }
//         if (hide) w.hide();
//         else w.show();
//         W.adjustFrameHeight();
//     };
// };
// onclick: createOnClick([0, 1], 'crypto_occupation')

})(node);

/**
 * # ChoiceTable
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable table where each cell is a selectable choice
 *
 * // TODO: register time for each current choice if selectMultiple is on?
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ChoiceTable', ChoiceTable);

    // ## Meta-data

    ChoiceTable.version = '1.8.1';
    ChoiceTable.description = 'Creates a configurable table where ' +
        'each cell is a selectable choice.';

    ChoiceTable.title = 'Make your choice';
    ChoiceTable.className = 'choicetable';

    ChoiceTable.texts = {

        autoHint: function(w) {
            var res;
            if (!w.requiredChoice && !w.selectMultiple) return false;
            if (!w.selectMultiple) return '*';
            res = '(';
            if (!w.requiredChoice) {
                if ('number' === typeof w.selectMultiple) {
                    res += 'select up to ' + w.selectMultiple;
                }
                else {
                    res += 'multiple selection allowed';
                }
            }
            else {
                if ('number' === typeof w.selectMultiple) {
                    if (w.selectMultiple === w.requiredChoice) {
                        res += 'select ' + w.requiredChoice;
                    }
                    else {
                        res += 'select between ' + w.requiredChoice +
                        ' and ' + w.selectMultiple;
                    }
                }
                else {
                    res += 'select at least ' + w.requiredChoice;
                }
            }
            res += ')';
            if (w.requiredChoice) res += ' *';
            return res;
        },
        error: function(w, value) {
            if (value !== null &&
                ('number' === typeof w.correctChoice ||
                'string' === typeof w.correctChoice)) {

                return 'Not correct, try again.';
            }
            return 'Selection required.';
        }
        // correct: 'Correct.'
    };

    ChoiceTable.separator = '::';

    // ## Dependencies

    ChoiceTable.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceTable constructor
     *
     * Creates a new instance of ChoiceTable
     */
    function ChoiceTable() {
        var that;
        that = this;

        /**
         * ### ChoiceTable.table
         *
         * The HTML element triggering the listener function when clicked
         */
        this.table = null;

        /**
         * ### ChoiceTable.choicesSetSize
         *
         * How many choices can be on the same row/column
         */
        this.choicesSetSize = null;

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
         * The main function listening on clicks
         *
         * @see ChoiceTable.onclick
         */
        this.listener = function(e) {
            var name, value, td, tr;
            var i, len, removed;

            e = e || window.event;
            td = e.target || e.srcElement;

            // See if it is a clickable choice.
            if ('undefined' === typeof that.choicesIds[td.id]) {
                // It might be a nested element, try the parent.
                td = td.parentNode;
                if (!td) return;
                if ('undefined' === typeof that.choicesIds[td.id]) {
                    td = td.parentNode;
                    if (!td || 'undefined' === typeof that.choicesIds[td.id]) {
                        return;
                    }
                }
            }

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split(that.separator);

            // Separator not found, not a clickable cell.
            if (value.length === 1) return;

            name = value[0];
            value = parseInt(value[1], 10);
            // value = value[1];

            // Choice disabled.
            // console.log('VALUE: ', value);
            if (that.disabledChoices[value]) return;

            // One more click.
            that.numberOfClicks++;

            // Click on an already selected choice.
            if (that.isChoiceCurrent(value)) {
                that.unsetCurrentChoice(value);
                J.removeClass(td, 'selected');

                if (that.selectMultiple) {
                    // Remove selected TD (need to keep this clean for reset).
                    i = -1, len = that.selected.length;
                    for ( ; ++i < len ; ) {
                        if (that.selected[i].id === td.id) {
                            that.selected.splice(i, 1);
                            break;
                        }
                    }
                }
                else {
                    that.selected = null;
                }
                removed = true;
            }
            // Click on a new choice.
            else {

                // Have we exhausted available choices?
                if ('number' === typeof that.selectMultiple &&
                    that.selected.length === that.selectMultiple) return;

                J.addClass(td, 'selected');

                if (that.oneTimeClick) {
                    setTimeout(function() {
                        J.removeClass(td, 'selected');
                    }, 60);
                }
                else {

                    that.setCurrentChoice(value);

                    if (that.selectMultiple) {
                        that.selected.push(td);
                    }
                    else {
                        // If only 1 selection allowed, remove old selection.
                        if (that.selected) {
                            J.removeClass(that.selected, 'selected');
                        }
                        that.selected = td;
                    }
                }
            }

            // Remove any warning/errors on click.
            if (that.isHighlighted()) that.unhighlight();

            // Call onclick, if any.
            if (that.onclick) {
                // TODO: Should we parseInt it anyway when we store
                // the current choice?
                value = parseInt(value, 10);
                that.onclick.call(that, value, removed, td);
            }
        };

        /**
         * ## ChoiceTable.onclick
         *
         * The user-defined onclick listener
         *
         * Receives 3 input parameters: the value of the clicked choice,
         * whether it was a remove action, and the reference to the TD object.
         *
         * @see ChoiceTableGroup.listener
         */
        this.onclick = null;

        /**
         * ### ChoiceTable.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceTable.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceTable.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

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
         * ### ChoiceTable.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
        * ### CustomInput.successBox
        *
        * An HTML element displayed when a validation error occurs
        */
        this.successBox = null;

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
         * The current order of display of choices
         *
         * @see ChoiceTable.originalOrder
         */
        this.order = null;

        /**
         * ### ChoiceTable.correctChoice
         *
         * The correct choice/s
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
         * Currently selected TD elements
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
         * The number of maximum simulataneous selections (>1), or false
         *
         * Note: this option is incompatible with `oneTimeClick`.
         */
        this.selectMultiple = null;

        /**
        * ### ChoiceTable.oneTimeClick
        *
        * If TRUE, the selection is immediately removed after one click
        *
        * This is useful to create a buttons group which trigger some actions.
        *
        * Note: this option is incompatible with `selectMultiple`.
        */
        this.oneTimeClick = null;

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

        /**
         * ### ChoiceTable.tabbable
         *
         * If TRUE, the elements of the table can be accessed with TAB
         *
         * Clicking is simulated upon pressing space or enter.
         *
         * Default TRUE
         *
         * @see ChoiceTable.renderChoice
         */
        this.tabbable = null;

        /**
         * ### ChoiceTable.disabledChoices
         *
         * An object containing the list of disabled values
         */
        this.disabledChoices = {};


        /**
        * ### ChoiceTable.sameWidthCells
        *
        * If TRUE, cells have same width regardless of content
        */
        this.sameWidthCells = true;
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
     *   - listener: a function executed at every click. Context is
     *       `this` instance
     *   - onclick: a function executed after the listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - hint: a text with extra info to be displayed after mainText
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
     *   - tabbable: if TRUE, each cell can be reached with TAB and clicked
     *       with SPACE or ENTER. Default: TRUE.
     *   - disabledChoices: array of disabled choices (values).
     *
     * @param {object} opts Configuration options
     */
    ChoiceTable.prototype.init = function(opts) {
        var tmp, that;
        that = this;

        if (!this.id) {
            throw new TypeError('ChoiceTable.init: opts.id is missing');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('ChoiceTable.init: opts.orientation must ' +
                                'be string, or undefined. Found: ' +
                                opts.orientation);
        }
        else {
            tmp = opts.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('ChoiceTable.init: opts.orientation is ' +
                                'invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleChoices, default false.
        if ('undefined' === typeof opts.shuffleChoices) tmp = false;
        else tmp = !!opts.shuffleChoices;
        this.shuffleChoices = tmp;

        // Option selectMultiple, default false.
        tmp = opts.selectMultiple;
        if ('undefined' === typeof tmp) {
            tmp = false;
        }
        else if ('boolean' !== typeof tmp) {
            tmp = J.isInt(tmp, 1);
            if (!tmp) {
                throw new Error('ChoiceTable.init: selectMultiple must be ' +
                                'undefined or an integer > 1. Found: ' + tmp);
            }
        }
        this.selectMultiple = tmp;
        // Make an array for currentChoice and selected.
        if (tmp) {
            this.selected = [];
            this.currentChoice = [];
        }

        // Option requiredChoice, if any.
        if ('number' === typeof opts.requiredChoice) {
            if (!J.isInt(opts.requiredChoice, 0)) {
                throw new Error('ChoiceTable.init: if number, requiredChoice ' +
                                'must a positive integer. Found: ' +
                                opts.requiredChoice);
            }
            if ('number' === typeof this.selectMultiple &&
                opts.requiredChoice > this.selectMultiple) {

                throw new Error('ChoiceTable.init: requiredChoice cannot be ' +
                                'larger than selectMultiple. Found: ' +
                                opts.requiredChoice + ' > ' +
                                this.selectMultiple);
            }
            this.requiredChoice = opts.requiredChoice;
        }
        else if ('boolean' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice ? 1 : null;
        }
        else if ('undefined' !== typeof opts.requiredChoice) {
            throw new TypeError('ChoiceTable.init: opts.requiredChoice ' +
                                'be number, boolean or undefined. Found: ' +
                                opts.requiredChoice);
        }

        if ('undefined' !== typeof opts.oneTimeClick) {
            this.oneTimeClick = !!opts.oneTimeClick;
        }

        // Set the group, if any.
        if ('string' === typeof opts.group ||
            'number' === typeof opts.group) {

            this.group = opts.group;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('ChoiceTable.init: opts.group must ' +
                                'be string, number or undefined. Found: ' +
                                opts.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof opts.groupOrder) {
            this.groupOrder = opts.groupOrder;
        }
        else if ('undefined' !== typeof opts.groupOrder) {
            throw new TypeError('ChoiceTable.init: opts.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                opts.groupOrder);
        }

        // Set the main onclick listener, if any.
        if ('function' === typeof opts.listener) {
            this.listener = function(e) {
                opts.listener.call(this, e);
            };
        }
        else if ('undefined' !== typeof opts.listener) {
            throw new TypeError('ChoiceTable.init: opts.listener must ' +
                                'be function or undefined. Found: ' +
                                opts.listener);
        }

        // Set an additional onclick, if any.
        if ('function' === typeof opts.onclick) {
            this.onclick = opts.onclick;
        }
        else if ('undefined' !== typeof opts.onclick) {
            throw new TypeError('ChoiceTable.init: opts.onclick must ' +
                                'be function or undefined. Found: ' +
                                opts.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('ChoiceTable.init: opts.mainText must ' +
                                'be string or undefined. Found: ' +
                                opts.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof opts.hint || false === opts.hint) {
            this.hint = opts.hint;
            if (this.requiredChoice) this.hint += ' *';
        }
        else if ('undefined' !== typeof opts.hint) {
            throw new TypeError('ChoiceTable.init: opts.hint must ' +
                                'be a string, false, or undefined. Found: ' +
                                opts.hint);
        }
        else {
            // Returns undefined if there are no constraints.
            this.hint = this.getText('autoHint');
        }

        // Set the timeFrom, if any.
        if (opts.timeFrom === false ||
            'string' === typeof opts.timeFrom) {

            this.timeFrom = opts.timeFrom;
        }
        else if ('undefined' !== typeof opts.timeFrom) {
            throw new TypeError('ChoiceTable.init: opts.timeFrom must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.timeFrom);
        }

        // Set the separator, if any.
        if ('string' === typeof opts.separator) {
            this.separator = opts.separator;
        }
        else if ('undefined' !== typeof opts.separator) {
            throw new TypeError('ChoiceTable.init: opts.separator must ' +
                                'be string, or undefined. Found: ' +
                                opts.separator);
        }

        // Conflict might be generated by id or seperator.
        tmp = this.id + this.separator.substring(0, (this.separator.length -1));
        if (this.id.indexOf(this.separator) !== -1 ||
            tmp.indexOf(this.separator) !== -1) {

            throw new Error('ChoiceTable.init: separator cannot be ' +
                            'included in the id or in the concatenation ' +
                            '(id + separator). Please specify the right ' +
                            'separator option. Found: ' + this.separator);
        }

        if ('string' === typeof opts.left ||
            'number' === typeof opts.left) {

            this.left = '' + opts.left;
        }
        else if (J.isNode(opts.left) ||
                 J.isElement(opts.left)) {

            this.left = opts.left;
        }
        else if ('undefined' !== typeof opts.left) {
            throw new TypeError('ChoiceTable.init: opts.left must ' +
                                'be string, number, an HTML Element or ' +
                                'undefined. Found: ' + opts.left);
        }

        if ('string' === typeof opts.right ||
            'number' === typeof opts.right) {

            this.right = '' + opts.right;
        }
        else if (J.isNode(opts.right) ||
                 J.isElement(opts.right)) {

            this.right = opts.right;
        }
        else if ('undefined' !== typeof opts.right) {
            throw new TypeError('ChoiceTable.init: opts.right must ' +
                                'be string, number, an HTML Element or ' +
                                'undefined. Found: ' + opts.right);
        }


        // Set the className, if not use default.
        if ('undefined' === typeof opts.className) {
            this.className = ChoiceTable.className;
        }
        else if (opts.className === false) {
            this.className = false;
        }
        else if ('string' === typeof opts.className) {
            this.className =  ChoiceTable.className + ' ' + opts.className;
        }
        else if ( J.isArray(opts.className)) {
            this.className = [ChoiceTable.className].concat(opts.className);
        }
        else {
            throw new TypeError('ChoiceTable.init: opts.' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + opts.className);
        }

        if (opts.tabbable !== false) this.tabbable = true;

        // Set the renderer, if any.
        if ('function' === typeof opts.renderer) {
            this.renderer = opts.renderer;
        }
        else if ('undefined' !== typeof opts.renderer) {
            throw new TypeError('ChoiceTable.init: opts.renderer must ' +
                                'be function or undefined. Found: ' +
                                opts.renderer);
        }

        // After all configuration opts are evaluated, add choices.

        // Set table.
        if ('object' === typeof opts.table) {
            this.table = opts.table;
        }
        else if ('undefined' !== typeof opts.table &&
                 false !== opts.table) {

            throw new TypeError('ChoiceTable.init: opts.table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + opts.table);
        }

        this.table = opts.table;

        this.freeText = 'string' === typeof opts.freeText ?
            opts.freeText : !!opts.freeText;


        // Add the correct choices.
        if ('undefined' !== typeof opts.choicesSetSize) {
            if (!J.isInt(opts.choicesSetSize, 0)) {
                throw new Error('ChoiceTable.init: choicesSetSize must be ' +
                                'undefined or an integer > 0. Found: ' +
                                opts.choicesSetSize);
            }

            if (this.left || this.right) {
                throw new Error('ChoiceTable.init: choicesSetSize option ' +
                                'cannot be specified when either left or ' +
                                'right options are set.');
            }

            this.choicesSetSize = opts.choicesSetSize;
        }

        // Add the choices.
        if ('undefined' !== typeof opts.choices) {
            this.setChoices(opts.choices);
        }

        // Add the correct choices.
        if ('undefined' !== typeof opts.correctChoice) {
            if (this.requiredChoice) {
                throw new Error('ChoiceTable.init: cannot specify both ' +
                                'opts requiredChoice and correctChoice');
            }
            this.setCorrectChoice(opts.correctChoice);
        }


        // Add the correct choices.
        if ('undefined' !== typeof opts.disabledChoices) {
            if (!J.isArray(opts.disabledChoices)) {
                throw new Error('ChoiceTable.init: disabledChoices must be ' +
                                'undefined or array. Found: ' +
                                opts.disabledChoices);
            }

            // TODO: check if values of disabled choices are correct?
            // Do we have the choices now, or can they be added later?
            tmp = opts.disabledChoices.length;
            if (tmp) {
                (function() {
                    for (var i = 0; i < tmp; i++) {
                        that.disableChoice(opts.disabledChoices[i]);
                    }
                })();
            }
        }

        if ('undefined' === typeof opts.sameWidthCells) {
            this.sameWidthCells = !!opts.sameWidthCells;
        }
    };

    /**
     * ### ChoiceTable.disableChoice
     *
     * Marks a choice as disabled (will not be clickable)
     *
     * @param {string|number} value The value of the choice to disable`
     */
    ChoiceTable.prototype.disableChoice = function(value) {
        this.disabledChoices[value] = true;
    };

    /**
     * ### ChoiceTable.enableChoice
     *
     * Enables a choice (will be clickable again if previously disabled)
     *
     * @param {string|number} value The value of the choice to disable`
     */
    ChoiceTable.prototype.enableChoice = function(value) {
        this.disabledChoices[value] = null;
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
                                'must be array');
        }
        if (!choices.length) {
            throw new Error('ChoiceTable.setChoices: choices array is empty');
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
     * @see ChoiceTable.choicesSetSize
     */
    ChoiceTable.prototype.buildTable = (function() {

        function makeSet(i, len, H, doSets) {
            var tr, counter;
            counter = 0;
            // Start adding tr/s and tds based on the orientation.
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
                // Stop if we reached set size (still need to add the right).
                if (doSets && ++counter >= this.choicesSetSize) break;
            }
            if (this.rightCell) {
                if (!H) tr = createTR(this, 'right');
                tr.appendChild(this.rightCell);
            }

            // Start a new set, if necessary.
            if (i !== len) makeSet.call(this, i, len, H, doSets);
        }

        return function() {
            var len, H, doSets;

            if (!this.choicesCells) {
                throw new Error('ChoiceTable.buildTable: choices not set, ' +
                                'cannot build table. Id: ' + this.id);
            }

            H = this.orientation === 'H';
            len = this.choicesCells.length;
            doSets = 'number' === typeof this.choicesSetSize;

            // Recursively makes sets
            makeSet.call(this, -1, len, H, doSets);

            // Enable onclick listener.
            this.enable();
        };
    })();

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
        td.id = this.id + this.separator + 'special-cell-' + type;
        return td;
    };
    /* UPDATED TEXT
     * @param {mixed} choice The choice element. It must be string or
     *   number, HTML element, or an array. If array, the first
     *   element is the short value (string or number), and the second
     *   one the the full value (string, number or HTML element) to
     *   display. If a renderer function is defined there are no
     *   restriction on the format of choice
     * @param {number} idx The position of the choice within the choice array
     */

    /**
     * ### ChoiceTable.renderChoice
     *
     * Transforms a choice element into a cell of the table
     *
     * A reference to the cell is saved in `choicesCells`.
     *
     * @param {mixed} choice The choice element. It may be string, number,
     *   array where the first element is the 'value' and the second the
     *   text to display as choice, or an object with properties value and
     *   display. If a renderer function is defined there are no restriction
     *   on the format of choice.
     * @param {number} idx The position of the choice within the choice array
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.renderer
     * @see ChoiceTable.separator
     * @see ChoiceTable.choicesCells
     */
    ChoiceTable.prototype.renderChoice = function(choice, idx) {
        var td, shortValue, value, width;
        td = document.createElement('td');
        if (this.tabbable) J.makeTabbable(td);

        // Forces equal width.
        if (this.sameWidthCells && this.orientation === 'H') {
            width = this.left ? 70 : 100;
            if (this.right) width = width - 30;
            width = width / (this.choicesSetSize || this.choices.length);
            td.style.width = width.toFixed(2) + '%';
        }

        // Use custom renderer.
        if (this.renderer) {
            value = this.renderer(td, choice, idx);
            if ('undefined' === typeof value) value = idx;
        }
        // Or use standard format.
        else {
            if (J.isArray(choice)) {
                shortValue = choice[0];
                choice = choice[1];
            }
            else if ('object' === typeof choice) {
                shortValue = choice.value;
                choice = choice.display;
            }

            value = this.shuffleChoices ? this.order[idx] : idx;

            if ('string' === typeof choice || 'number' === typeof choice) {
                td.innerHTML = choice;
            }
            else if (J.isElement(choice) || J.isNode(choice)) {
                td.appendChild(choice);
            }
            else if (node.widgets.isWidget(choice)) {
                node.widgets.append(choice, td);
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
                throw new TypeError('ChoiceTable.setCorrectChoice: choice ' +
                                    'must be non-empty array. Found: ' +
                                    choice);
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
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'choicetable-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'choicetable-hint',
                innerHTML: this.hint
            });
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
            // Class.
            tmp = this.className ? [ this.className ] : [];
            if (this.orientation !== 'H') tmp.push('choicetable-vertical');
            if (tmp.length) J.addClass(this.table, tmp);
            else this.table.className = '';
            // Append table.
            this.bodyDiv.appendChild(this.table);
        }

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });


        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            if (this.id) this.textarea.id = this.id + '_text';
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
     * ### ChoiceTable.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see ChoiceTable.highlight
     * @see ChoiceTable.errorBox
     */
    ChoiceTable.prototype.setError = function(err) {
        // TODO: the errorBox is added only if .append() is called.
        // However, ChoiceTableGroup use the table without calling .append().
        if (this.errorBox) this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
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
            // Remove listener to make cells clickable with the keyboard.
            if (this.tabbable) J.makeClickable(this.table, false);
        }
        this.emit('disabled');
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
            throw new Error('ChoiceTable.enable: table not defined');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
        // Add listener to make cells clickable with the keyboard.
        if (this.tabbable) J.makeClickable(this.table);
        this.emit('enabled');
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
        if ('undefined' === typeof this.correctChoice) return null;
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
                c = correctChoice[i];
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
                                    'must be string, number or ' +
                                    'undefined. Found: ' + choice);
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
     * @param {number|string} The choice to check.
     *
     * @return {boolean} TRUE, if the choice is currently selected
     *
     * @see ChoiceTable.getChoiceAtPosition
     */
    ChoiceTable.prototype.isChoiceCurrent = function(choice) {
        var i, len;
        if ('string' === typeof choice) {
            choice = parseInt(choice, 10);
        }
        else if ('number' !== typeof choice) {
            throw new TypeError('ChoiceTable.isChoiceCurrent: choice ' +
                                'must be string or number. Found: ' + choice);
        }
        if (!this.selectMultiple) return this.currentChoice === choice;
        i = -1, len = this.currentChoice.length;
        for ( ; ++i < len ; ) {
            if (this.currentChoice[i] === choice) return true;
        }
        return false;
    };

    /**
     * ### ChoiceTable.getChoiceAtPosition
     *
     * Returns a choice displayed at a given position
     *
     * @param {string|number} i The numeric position of a choice in display
     *
     * @return {string|undefined} The value associated with the numeric
     *   position. If no value is found, returns undefined
     *
     * @see ChoiceTable.order
     * @see ChoiceTable.choices
     */
    ChoiceTable.prototype.getChoiceAtPosition = function(i) {
        if (!this.choices || !this.order) return;
        return this.choices[this.order[parseInt(i, 10)]];
    };

    /**
     * ### ChoiceTable.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '3px solid red'
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTable.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted) return;
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### ChoiceTable.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.unhighlight = function() {
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        this.highlighted = false;
        this.setError();
        this.emit('unhighlighted');
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
     *   - highlight: If TRUE, if current value is not the correct
     *       value, widget is highlighted. Default: TRUE.
     *   - reset: If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *   - addValue: If FALSE, it does not add .value property. Default: TRUE.
     *   - sortValue: If TRUE and multiple choices are allowed, the values
     *       in the `.value` property are sorted alphabetically. Note! The
     *       choices array is not sorted. Default: TRUE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceTable.verifyChoice
     * @see ChoiceTable.reset
     */
    ChoiceTable.prototype.getValues = function(opts) {
        var obj, resetOpts, i, len;
        opts = opts || {};
        obj = {
            id: this.id,
            choice: opts.reset ?
                this.currentChoice: J.clone(this.currentChoice),
            time: this.timeCurrentChoice,
            nClicks: this.numberOfClicks
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (opts.processChoice) {
            obj.choice = opts.processChoice.call(this, obj.choice);
        }
        if (this.shuffleChoices) obj.order = this.order;

        // Option getValue backward compatible.
        if (opts.addValue !== false && opts.getValue !== false) {
            if (!this.selectMultiple) {
                obj.value = getValueFromChoice(this.choices[obj.choice]);
            }
            else {
                len = obj.choice.length;
                obj.value = new Array(len);
                if (len === 1) {
                    obj.value[0] =
                        getValueFromChoice(this.choices[obj.choice[0]]);
                }
                else {
                    i = -1;
                    for ( ; ++i < len ; ) {
                        obj.value[i] =
                            getValueFromChoice(this.choices[obj.choice[i]]);
                    }
                    if (opts.sortValue !== false) obj.value.sort();
                }
            }
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
        if (obj.isCorrect === false) {
            this.setError(this.getText('error', obj.value));
        }
        else if (opts.reset) {
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
        var choice, correctChoice, tmp;
        var i, len, j, lenJ;

        if (!this.choices || !this.choices.length) {
            throw new Error('ChoiceTable.setValues: no choices found.');
        }
        options = options || {};

        // TODO: allow it to set it visually or just in the background.
        // Use options.visual.

        // TODO: allow it to set random or fixed values, or correct values
        // TODO: set freetext or not.

        if (!this.choicesCells || !this.choicesCells.length) {
            throw new Error('Choicetable.setValues: table was not ' +
                            'built yet.');
        }

        // Value this.correctChoice can be undefined, string or array.
        // If no correct choice is set, we simply ignore the correct param.
        if (options.correct && this.correctChoice !== null) {

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

        // Set values, random or pre-set.
        i = -1;
        if ('undefined' !== typeof options.values) {
            if (!J.isArray(options.values)) tmp = [ options.values ];
            len = tmp.length;
            // Can be true/false or a number > 1.
            if (this.selectMultiple) {
                tmp = 'number' === typeof this.selectMultiple ?
                    this.selectMultiple : this.choices.length;
                if (len > tmp) {
                    throw new Error('ChoiceTable.setValues: values array ' +
                                    'cannot be larger than max allowed set: ' +
                                    len +  ' > ' +  tmp);
                }
                tmp = options.values;
            }

            // Validate value.
            for ( ; ++i < len ; ) {
                choice = J.isInt(tmp[i], -1, (this.choices.length-1), 1, 1);
                if (false === choice) {
                    throw new Error('ChoiceTable.setValues: invalid ' +
                                    'choice value. Found: ' + tmp[i]);
                }
                this.choicesCells[choice].click();
            }
        }
        else {
            // How many random choices?
            len = 1;
            if (this.selectMultiple) {
                // Max random cells.
                len = 'number' === typeof this.selectMultiple ?
                    this.selectMultiple : this.choicesCells.length;
                // Min random cells.
                tmp = this.requiredChoice;
                len = J.randomInt('number' === typeof tmp ? (tmp-1) : 0, len);
            }

            for ( ; ++i < len ; ) {
                // This is the choice idx.
                choice = J.randomInt(-1, (this.choicesCells.length-1));

                // Do not click it again if it is already selected.
                // Else increment len and try again (until 300 failsafe).
                if (this.disabledChoices[choice] ||
                    this.isChoiceCurrent(choice)) {
                    // Failsafe.
                    if (len < 300) len++;
                }
                else {
                    // Resolve to cell idx (might differ if shuffled).
                    j =  this.choicesValues[choice];
                    this.choicesCells[j].click();
                }
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
        this.timeCurrentChoice = null;

        if (this.selectMultiple) {
            i = -1, len = this.selected.length;
            for ( ; ++i < len ; ) {
                J.removeClass(this.selected[i], 'selected');
            }
            this.selected = [];
            this.currentChoice = [];

        }
        else {
            if (this.selected) {
                J.removeClass(this.selected, 'selected');
                this.selected = null;
                this.currentChoice = null;
            }
        }

        if (this.textarea) this.textarea.value = '';
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
        if ('string' === typeof choice) choice = parseInt(choice, 10);
        if ('number' !== typeof choice) {
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
    function createTR(that) {
        var tr;
        tr = document.createElement('tr');
        tr.id = 'tr' + that.separator + that.id;
        that.table.appendChild(tr);
        // Store reference.
        that.trs.push(tr);
        return tr;
    }

    /**
     * ### getValueFromChoice
     *
     * Extract the value from a choice
     *
     * The value is either the text displayed or short value specified
     * by the choice.
     *
     * @param {mixed} choice
     * @param {boolean} display TRUE to return the display value instead
     *   one. Default: FALSE.
     *
     * @return {string|number|null} The value of the choice,
     *   or null if not found.
     *
     * @see ChoiceTable.getValues
     * @see ChoiceTable.renderChoice
     */
    function getValueFromChoice(choice, display) {
        if ('string' === typeof choice || 'number' === typeof choice) {
            return choice;
        }
        if (J.isArray(choice)) return choice[display ? 1 : 0];
        if ('object' === typeof choice) {
            return choice[ display ? 'display' : 'value' ];
        }
        if (J.isElement(choice) || J.isNode(choice)) return choice.innerHTML;
        return null;
    }

})(node);

/**
 * # ChoiceTableGroup
 * Copyright(c) 2021 Stefano Balietti
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

    node.widgets.register('ChoiceTableGroup', ChoiceTableGroup);

    // ## Meta-data

    ChoiceTableGroup.version = '1.8.0';
    ChoiceTableGroup.description = 'Groups together and manages sets of ' +
        'ChoiceTable widgets.';

    ChoiceTableGroup.title = 'Make your choice';
    ChoiceTableGroup.className = 'choicetable choicetablegroup';

    ChoiceTableGroup.separator = '::';

    ChoiceTableGroup.texts = {

        autoHint: function(w) {
            if (w.requiredChoice) return '*';
            else return false;
        },

        error: 'Selection required.'
    };

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
    function ChoiceTableGroup() {
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
         * The main listener function
         *
         * @see ChoiceTableGroup.enable
         * @see ChoiceTableGroup.disable
         * @see ChoiceTableGroup.onclick
         */
        this.listener = function(e) {
            var name, value, item, td, oldSelected;
            var time, removed;

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
            if ('undefined' === typeof that.choicesById[td.id]) {
                // It might be a nested element, try the parent.
                td = td.parentNode;
                if (!td || 'undefined' === typeof that.choicesById[td.id]) {
                    return;
                }
            }
            // if (!that.choicesById[td.id]) return;

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
                    removed = true;
                }
                else {
                    item.currentChoice = value;
                    J.addClass(td, 'selected');
                    item.selected = td;
                }
            }

            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();

            // Call onclick, if any.
            if (that.onclick) {
                // TODO: Should we parseInt it anyway when we store
                // the current choice?
                value = parseInt(value, 10);
                that.onclick.call(that, name, value, removed, td);
            }
        };

        /**
         * ## ChoiceTableGroup.onclick
         *
         * The user-defined onclick function
         *
         * Receives 4 input parameters: the name of the choice table clicked,
         * the value of the clicked choice, whether it was a remove action,
         * and the reference to the TD object.
         *
         * @see ChoiceTableGroup.listener
         */
        this.onclick = null;

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
         * ### ChoiceTableGroup.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

        /**
         * ### ChoiceTableGroup.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### ChoiceTableGroup.items
         *
         * The array of available items
         */
        this.items = null;

        /**
         * ### ChoiceTableGroup.itemsById
         *
         * Map of items ids to items
         */
        this.itemsById = {};

        /**
         * ### ChoiceTableGroup.itemsMap
         *
         * Maps items ids to the position in the items array
         */
        this.itemsMap = {};

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
         * The current order of display of choices
         *
         * May differ from `originalOrder` if shuffled.
         *
         * @see ChoiceTableGroup.originalOrder
         */
        this.order = null;

        /**
         * ### ChoiceTableGroup.originalOrder
         *
         * The initial order of display of choices
         *
         * @see ChoiceTable.order
         */
        this.originalOrder = null;

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

        /**
        * ### ChoiceTableGroup.header
        *
        * Header to be displayed above the table
        *
        * @experimental
        */
        this.header = null;

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

        /**
         * ### ChoiceTableGroup.tabbable
         *
         * If TRUE, the elements of each choicetable can be accessed with TAB
         *
         * Clicking is simulated upon pressing space or enter.
         *
         * Default TRUE
         *
         * @see ChoiceTable.tabbable
         */
        this.tabbable = null;
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
     *   - listener: a custom function executed at every click. Context is
     *       `this` instance.
     *   - onclick: a function executed after the listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - shuffleItems: if TRUE, items are shuffled before being added
     *       to the table
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *   - tabbable: if TRUE, each cell can be reached with TAB and clicked
     *       with SPACE or ENTER. Default: TRUE.
     *
     * @param {object} opts Configuration options
     */
    ChoiceTableGroup.prototype.init = function(opts) {
        var tmp;

        // TODO: many options checking are replicated. Skip them all?
        // Have a method in ChoiceTable?

        if (!this.id) {
            throw new TypeError('ChoiceTableGroup.init: id ' +
                                'is missing.');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('ChoiceTableGroup.init: orientation ' +
                                'must be string, or undefined. Found: ' +
                                opts.orientation);
        }
        else {
            tmp = opts.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('ChoiceTableGroup.init: orientation ' +
                                'is invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleItems, default false.
        if ('undefined' === typeof opts.shuffleItems) tmp = false;
        else tmp = !!opts.shuffleItems;
        this.shuffleItems = tmp;

        // Option requiredChoice, if any.
        if ('number' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice;
        }
        else if ('boolean' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice ? 1 : 0;
        }
        else if ('undefined' !== typeof opts.requiredChoice) {
            throw new TypeError('ChoiceTableGroup.init: ' +
                                'opts.requiredChoice ' +
                                'be number or boolean or undefined. Found: ' +
                                opts.requiredChoice);
        }

        // Set the group, if any.
        if ('string' === typeof opts.group ||
            'number' === typeof opts.group) {

            this.group = opts.group;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('ChoiceTableGroup.init: group must ' +
                                'be string, number or undefined. Found: ' +
                                opts.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof opts.groupOrder) {

            this.groupOrder = opts.groupOrder;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('ChoiceTableGroup.init: groupOrder ' +
                                'must be number or undefined. Found: ' +
                                opts.groupOrder);
        }

        // Set the main onclick listener, if any.
        if ('function' === typeof opts.listener) {
            this.listener = function(e) {
                opts.listener.call(this, e);
            };
        }
        else if ('undefined' !== typeof opts.listener) {
            throw new TypeError('ChoiceTableGroup.init: listener ' +
                                'must be function or undefined. Found: ' +
                                opts.listener);
        }

        // Set an additional onclick, if any.
        if ('function' === typeof opts.onclick) {
            this.onclick = opts.onclick;
        }
        else if ('undefined' !== typeof opts.onclick) {
            throw new TypeError('ChoiceTableGroup.init: onclick must ' +
                                'be function or undefined. Found: ' +
                                opts.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('ChoiceTableGroup.init: mainText ' +
                                'must be string or undefined. Found: ' +
                                opts.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof opts.hint || false === opts.hint) {
            this.hint = opts.hint;
        }
        else if ('undefined' !== typeof opts.hint) {
            throw new TypeError('ChoiceTableGroup.init: hint must ' +
                                'be a string, false, or undefined. Found: ' +
                                opts.hint);
        }
        else {
            // Returns undefined if there are no constraints.
            this.hint = this.getText('autoHint');
        }

        // Set the timeFrom, if any.
        if (opts.timeFrom === false ||
            'string' === typeof opts.timeFrom) {

            this.timeFrom = opts.timeFrom;
        }
        else if ('undefined' !== typeof opts.timeFrom) {
            throw new TypeError('ChoiceTableGroup.init: timeFrom ' +
                                'must be string, false, or undefined. Found: ' +
                                opts.timeFrom);
        }

        // Option shuffleChoices, default false.
        if ('undefined' !== typeof opts.shuffleChoices) {
            this.shuffleChoices = !!opts.shuffleChoices;
        }

        // Set the renderer, if any.
        if ('function' === typeof opts.renderer) {
            this.renderer = opts.renderer;
        }
        else if ('undefined' !== typeof opts.renderer) {
            throw new TypeError('ChoiceTableGroup.init: renderer ' +
                                'must be function or undefined. Found: ' +
                                opts.renderer);
        }

        // Set default choices, if any.
        if ('undefined' !== typeof opts.choices) {
            this.choices = opts.choices;
        }

        // Set the className, if not use default.
        if ('undefined' === typeof opts.className) {
            this.className = ChoiceTableGroup.className;
        }
        else if (opts.className === false ||
                 'string' === typeof opts.className ||
                 J.isArray(opts.className)) {

            this.className = opts.className;
        }
        else {
            throw new TypeError('ChoiceTableGroup.init: ' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + opts.className);
        }

        if (opts.tabbable !== false) this.tabbable = true;

        // Separator checked by ChoiceTable.
        if (opts.separator) this.separator = opts.separator;

        // After all configuration opts are evaluated, add items.

        if ('object' === typeof opts.table) {
            this.table = opts.table;
        }
        else if ('undefined' !== typeof opts.table &&
                 false !== opts.table) {

            throw new TypeError('ChoiceTableGroup.init: table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + opts.table);
        }

        this.table = opts.table;

        this.freeText = 'string' === typeof opts.freeText ?
            opts.freeText : !!opts.freeText;

        if (opts.header) {
            if (!J.isArray(opts.header) ||
                opts.header.length !== opts.choices.length) {

                throw new Error('ChoiceTableGroup.init: header ' +
                                'must be an array of length ' +
                                opts.choices.length +
                                ' or undefined. Found: ' + opts.header);
            }

            this.header = opts.header;
        }


        // Add the items.
        if ('undefined' !== typeof opts.items) this.setItems(opts.items);

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
                                'items must be array. Found: ' + items);
        }
        if (!items.length) {
            throw new Error('ChoiceTableGroup.setItems: ' +
                            'items is an empty array.');
        }

        len = items.length;
        this.itemsSettings = items;
        this.items = new Array(len);

        // Save the order in which the items will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleItems) this.order = J.shuffle(this.order);
        this.originalOrder = this.order;

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

            if (this.header) {
                tr = W.add('tr', this.table);
                W.add('td', tr, {
                    className: 'header'
                });
                for ( ; ++i < this.header.length ; ) {
                    W.add('td', tr, {
                        innerHTML: this.header[i],
                        className: 'header'
                    });
                }
                i = -1;
            }

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
            // TODO: rename, this is not the header as from options.
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
        this.enable(true);
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
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'choicetable-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'choicetable-hint',
                innerHTML: this.hint
            });
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

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            if (this.id) this.textarea.id = this.id + '_text';
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
    ChoiceTableGroup.prototype.disable = function() {
        if (this.disabled === true || !this.table) return;
        this.disabled = true;
        J.removeClass(this.table, 'clickable');
        this.table.removeEventListener('click', this.listener);
        // Remove listener to make cells clickable with the keyboard.
        if (this.tabbable) J.makeClickable(this.table, false);
        this.emit('disabled');
    };

    /**
     * ### ChoiceTableGroup.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTableGroup.prototype.enable = function(force) {
        if (!this.table || (!force && !this.disabled)) return;
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
        // Add listener to make cells clickable with the keyboard.
        if (this.tabbable) J.makeClickable(this.table);
        this.emit('enabled');
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
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTableGroup.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted === true) return;
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### ChoiceTableGroup.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTableGroup.highlighted
     */
    ChoiceTableGroup.prototype.unhighlight = function() {
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        this.highlighted = false;
        this.setError();
        this.emit('unhighlighted');
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
     *      value, widget will be highlighted. Default: TRUE.
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
            items: {},
            isCorrect: true
        };
        opts = opts || {};
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        // Make sure reset is done only at the end.
        toReset = opts.reset;
        opts.reset = false;
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            tbl = this.items[i];
            obj.items[tbl.id] = tbl.getValues(opts);
            if (obj.items[tbl.id].choice === null) {
                obj.missValues = true;
                if (tbl.requiredChoice) {
                    toHighlight = true;
                    obj.isCorrect = false;
                }
            }
            if (obj.items[tbl.id].isCorrect === false && opts.highlight) {
                toHighlight = true;
            }
        }
        if (opts.highlight && toHighlight) {
            this.setError(this.getText('error'));
        }
        else if (toReset) {
            this.reset(toReset);
        }
        opts.reset = toReset;
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };


    /**
     * ### ChoiceTableGroup.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see ChoiceTableGroup.highlight
     * @see ChoiceTableGroup.errorBox
     */
    ChoiceTableGroup.prototype.setError = function(err) {
        this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
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
        var order, i, len, j, lenJ, that, cb, newOrder;
        if (!this.items) return;
        len = this.items.length;
        if (!len) return;
        that = this;
        newOrder = new Array(len);
        // Updates the groupOrder property of each item,
        // and saves the order of items correctly.
        cb = function(el, newPos, oldPos) {
            var i;
            i = el.id.split(that.separator);
            i = that.orientation === 'H' ? i[2] : i[0];
            i = that.itemsMap[i];
            that.items[i].groupOrder = (newPos+1);
            newOrder[newPos] = i;
        };
        order = J.shuffle(this.order);
        if (this.orientation === 'H') {
            J.shuffleElements(this.table, order, cb);
        }
        else {
            // Here we maintain the columns manually. Each TR contains TD
            // belonging to different items, we make sure the order is the
            // same for all TR.
            len = this.trs.length;
            for ( i = -1 ; ++i < len ; ) {
                J.shuffleElements(this.trs[i], order, cb);
                // Call cb only on first iteration.
                cb = undefined;
            }
        }
        this.order = newOrder;
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
        else if (J.isArray(s)) {
            s = { id: s[0], left: s[1] };
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

        // No reference is stored in node.widgets.
        s.storeRef = false;

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
        var ct, s, idx;
        idx = that.order[i];
        s = mixinSettings(that, that.itemsSettings[idx], i);
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
        that.items[idx] = ct;
        that.itemsMap[ct.id] = idx;
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
 * # Consent
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Displays a consent form with buttons to accept/reject it
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Consent', Consent);

    // ## Meta-data

    Consent.version = '0.3.0';
    Consent.description = 'Displays a configurable consent form.';

    Consent.title = false;
    Consent.panel = false;
    Consent.className = 'consent';

    Consent.texts = {

        areYouSure: 'You did not consent and are about to leave the ' +
                    'study. Are you sure?',

        printText:
        '<br/><p>If you need a copy of this consent form, you may ' +
        'print a copy of this page for your records.</p>',

        printBtn: 'Print this page',

        consentTerms: 'Do you understand and consent to these terms?',

        agree: 'Yes, I agree',

        notAgree: 'No, I do not agree',

        showHideConsent: function(w, s) {
            return (s === 'hide' ? 'Hide' : 'Show') + ' Consent Form';
        }

    };

    /**
     * ## Consent constructor
     *
     * Creates a new instance of Consent
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to Consent.init.
     *
     * @see Consent.init
     */
    function Consent() {

        /**
         * ## Consent.consent
         *
         * The object containing the variables to substitute
         *
         * Default: node.game.settings.CONSENT
         */
        this.consent = null;

        /**
         * ## Consent.showPrint
         *
         * If TRUE, the print button is shown
         *
         * Default: TRUE
         */
        this.showPrint = null;
    }

    // ## Consent methods.

    /**
     * ### Consent.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    Consent.prototype.init = function(opts) {
        opts = opts || {};

        this.consent = opts.consent || node.game.settings.CONSENT;

        if (this.consent && 'object' !== typeof this.consent) {
            throw new TypeError('Consent: consent must be object or ' +
                                'undefined. Found: ' + this.consent);
        }

        this.showPrint = opts.showPrint === false ? false : true;
    };

    Consent.prototype.enable = function() {
        var a, na;
        if (this.notAgreed) return;
        a = W.gid('agree');
        if (a) a.disabled = false;
        na = W.gid('notAgree');
        if (na) na.disabled = false;
    };

    Consent.prototype.disable = function() {
        var a, na;
        if (this.notAgreed) return;
        a = W.gid('agree');
        if (a) a.disabled = true;
        na = W.gid('notAgree');
        if (na) na.disabled = true;
    };

    Consent.prototype.append = function() {
        var consent, html;
        // Hide not agreed div.
        W.hide('notAgreed');

        consent = W.gid('consent');
        html = '';

        // Print.
        if (this.showPrint) {
            html = this.getText('printText');
            html += '<input class="btn" type="button" value="' +
            this.getText('printBtn') +
            '" onclick="window.print()" /><br/><br/>';
        }

        // Header for buttons.
        html += '<strong>' + this.getText('consentTerms') + '</strong><br/>';

        // Buttons.
        html += '<div style="margin-top: 20px;">' +
        '<button class="btn btn-lg btn-info" id="agree" ' +
        'style="margin-right: 30px">' + this.getText('agree') +
        '</button><button class="btn btn-lg btn-danger" id="notAgree">' +
        this.getText('notAgree') + '</button></div>';

        consent.innerHTML += html;
        setTimeout(function() { W.adjustFrameHeight(); });
    };

    Consent.prototype.listeners = function() {
        var that = this;
        var consent = this.consent;
        node.on('FRAME_LOADED', function() {
            var a, na, p, id;

            // Replace all texts.
            if (consent) {
                for (p in consent) {
                    if (consent.hasOwnProperty(p)) {
                        // Making lower-case and replacing underscore
                        // s with dashes.
                        id = p.toLowerCase();
                        id = id.replace(new RegExp("_", 'g'), "-");
                        W.setInnerHTML(id, consent[p]);
                    }
                }
            }

            // Add listeners on buttons.
            a = W.gid('agree');
            na = W.gid('notAgree');

            if (!a) throw new Error('Consent: agree button not found');
            if (!na) throw new Error('Consent: notAgree button not found');


            a.onclick = function() { node.done({ consent: true }); };
            na.onclick = function() {
                var showIt, confirmed;

                confirmed = confirm(that.getText('areYouSure'));
                if (!confirmed) return;

                node.emit('CONSENT_REJECTING');

                that.notAgreed = true;
                node.set({
                    consent: false,
                    // Need to send these two because it's not a DONE msg.
                    time: node.timer.getTimeSince('step'),
                    timeup: false
                });
                a.disabled = true;
                na.disabled = true;
                a.onclick = null;
                na.onclick = null;

                node.socket.disconnect();
                W.hide('consent');
                W.show('notAgreed');

                // If a show-consent button is found enable it.
                showIt = W.gid('show-consent');
                if (showIt) {
                    showIt.onclick = function() {
                        var div, s;
                        div = W.toggle('consent');
                        s = div.style.display === '' ? 'hide' : 'show';
                        this.innerHTML = that.getText('showHideConsent', s);
                    };
                }
                node.emit('CONSENT_REJECTED');
            };
       });
    };

})(node);

/**
 * # ContentBox
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Displays some content.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ContentBox', ContentBox);

    // ## Meta-data

    ContentBox.version = '0.2.0';
    ContentBox.description = 'Simply displays some content';

    ContentBox.title = false;
    ContentBox.panel = false;
    ContentBox.className = 'contentbox';

    // ## Dependencies

    ContentBox.dependencies = {};

    /**
     * ## ContentBox constructor
     *
     */
    function ContentBox() {

        // ### ContentBox.mainText
        // The main text above the content.
        this.mainText = null;

        // ### ContentBox.content
        // Some content to be displayed.
        this.content = null;

        // ### ContentBox.hint
        // A hint text.
        this.hint = null;
    }

    // ## ContentBox methods
    ContentBox.prototype.init = function(opts) {
        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('ContentBox.init: mainText must ' +
                                'be string or undefined. Found: ' +
                                opts.mainText);
        }
        // Set the content, if any.
        if ('string' === typeof opts.content) {
            this.content = opts.content;
        }
        else if ('undefined' !== typeof opts.content) {
            throw new TypeError('ContentBox.init: content must ' +
                                'be string or undefined. Found: ' +
                                opts.content);
        }
        // Set the content, if any.
        if ('string' === typeof opts.hint) {
            this.hint = opts.hint;
        }
        else if ('undefined' !== typeof opts.hint) {
            throw new TypeError('ContentBox.init: hint must ' +
                                'be string or undefined. Found: ' +
                                opts.hint);
        }
    };

    ContentBox.prototype.append = function() {
        // MainText.
        if (this.mainText) {
            W.append('span', this.bodyDiv, {
                className: 'contentbox-maintext',
                innerHTML: this.mainText
            });
        }
        // Content.
        if (this.content) {
            W.append('div', this.bodyDiv, {
                className: 'contentbox-content',
                innerHTML: this.content
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.bodyDiv, {
                className: 'contentbox-hint',
                innerHTML: this.hint
            });
        }
    };

})(node);

/**
 * # Controls
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
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

    Controls.version = '0.5.1';
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
     *   - Any option that can be passed to `W.List` constructor.
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
    }

    Controls.prototype.add = function(root, id, attributes) {
        // TODO: replace W.addTextInput 
        //return W.addTextInput(root, id, attributes);
    };

    Controls.prototype.getItem = function(id, attributes) {
        // TODO: replace W.addTextInput
        //return W.getTextInput(id, attributes);
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
     *   - Any option that can be passed to `W.List` constructor.
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

        if (options.features) {
            this.features = options.features;
            this.populate();
        }
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
            this.submit = W.add('button', this.bodyDiv,
                                J.merge(this.options.attributes, {
                                    id: idButton,
                                    innerHTML: this.options.submit
                                }));

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
                    W.add('label', container, {
                        'for': elem.id,
                        innerHTML: attributes.label
                    });
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
                el = W.getElementById(key);
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
                el = W.getElementById(key);
                if (el) out[key] = Number(el.value);
            }
        }
        return out;
    };

    Controls.prototype.highlight = function(code) {
        return W.highlight(this.listRoot, code);
    };

    // ## Sub-classes

    /**
     * ### Slider
     */


    SliderControls.prototype.__proto__ = Controls.prototype;
    SliderControls.prototype.constructor = SliderControls;

    SliderControls.version = '0.2.2';
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
        attributes = attributes || {};
        attributes.id = id;
        attributes.type = 'range';
        return W.add('input', root, attributes);
    };

    SliderControls.prototype.getItem = function(id, attributes) {
        attributes = attributes || {};
        attributes.id = id;
        return W.get('input', attributes);
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
            W.generateUniqueId();
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
        attributes.id = id;
        attributes.type = 'radio';
        elem = W.add('input', root, attributes);
        // Adding the text for the radio button
        elem.appendChild(document.createTextNode(attributes.label));
        return elem;
    };

    RadioControls.prototype.getItem = function(id, attributes) {
        attributes = attributes || {};
        // add the group name if not specified
        // TODO: is this a javascript bug?
        if ('undefined' === typeof attributes.name) {
            attributes.name = this.groupName;
        }
        attributes.id = id;
        attributes.type = 'radio';
        return W.get('input', attributes);
    };

    // Override getAllValues for Radio Controls
    RadioControls.prototype.getValues = function() {
        var key, el;
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = W.getElementById(key);
                if (el.checked) return el.value;                
            }
        }
        return false;
    };

})(node);

/**
 * # CustomInput
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable input form with validation
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('CustomInput', CustomInput);

    // ## Meta-data

    CustomInput.version = '0.12.0';
    CustomInput.description = 'Creates a configurable input form';

    CustomInput.title = false;
    CustomInput.panel = false;
    CustomInput.className = 'custominput';

    CustomInput.types = {
        text: true,
        number: true,
        'float': true,
        'int': true,
        date: true,
        list: true,
        us_city_state_zip: true,
        us_state: true,
        us_zip: true
    };

    var sepNames = {
        ',': 'comma',
        ' ': 'space',
        '.': 'dot'
    };

    var usStates = {
        Alabama: 'AL',
        Alaska: 'AK',
        Arizona: 'AZ',
        Arkansas: 'AR',
        California: 'CA',
        Colorado: 'CO',
        Connecticut: 'CT',
        Delaware: 'DE',
        Florida: 'FL',
        Georgia: 'GA',
        Hawaii: 'HI',
        Idaho: 'ID',
        Illinois: 'IL',
        Indiana: 'IN',
        Iowa: 'IA',
        Kansas: 'KS',
        Kentucky: 'KY',
        Louisiana: 'LA',
        Maine: 'ME',
        Maryland: 'MD',
        Massachusetts: 'MA',
        Michigan: 'MI',
        Minnesota: 'MN',
        Mississippi: 'MS',
        Missouri: 'MO',
        Montana: 'MT',
        Nebraska: 'NE',
        Nevada: 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        Ohio: 'OH',
        Oklahoma: 'OK',
        Oregon: 'OR',
        Pennsylvania: 'PA',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        Tennessee: 'TN',
        Texas: 'TX',
        Utah: 'UT',
        Vermont: 'VT',
        Virginia: 'VA',
        Washington: 'WA',
        'West Virginia': 'WV',
        Wisconsin: 'WI',
        Wyoming: 'WY',
    };

    var usTerr = {
        'American Samoa': 'AS',
        'District of Columbia': 'DC',
        'Federated States of Micronesia': 'FM',
        Guam: 'GU',
        'Marshall Islands': 'MH',
        'Northern Mariana Islands': 'MP',
        Palau: 'PW',
        'Puerto Rico': 'PR',
        'Virgin Islands': 'VI'
    };

    // To be filled if requested.
    var usTerrByAbbr;
    var usStatesByAbbr;
    var usStatesTerr;
    var usStatesTerrByAbbr;
    // Lower case keys.
    var usStatesLow;
    var usTerrLow;
    var usTerrByAbbrLow;
    var usStatesByAbbrLow;
    var usStatesTerrLow;
    var usStatesTerrByAbbrLow;

    CustomInput.texts = {
        listErr: 'Check that there are no empty items; do not end with ' +
            'the separator',
        listSizeErr: function(w, param) {
            if (w.params.fixedSize) {
                return w.params.minItems + ' items required';
            }
            if (param === 'min') {
                return 'Too few items. Min: ' + w.params.minItems;
            }
            return 'Too many items. Max: ' + w.params.maxItems;

        },
        usStateAbbrErr: 'Not a valid state abbreviation (must be 2 characters)',
        usStateErr: 'Not a valid state (full name required)',
        usZipErr: 'Not a valid ZIP code (must be 5 digits)',
        autoHint: function(w) {
            var res, sep;
            if (w.type === 'list') {
                sep = sepNames[w.params.listSep] || w.params.listSep;
                res = '(if more than one, separate with ' + sep + ')';
            }
            else if (w.type === 'us_state') {
                res = w.params.abbr ? '(Use 2-letter abbreviation)' :
                    '(Type the full name of the state)';
            }
            else if (w.type === 'us_zip') {
                res = '(Use 5-digit ZIP code)';
            }
            else if (w.type === 'us_city_state_zip') {
                sep = w.params.listSep;
                res = '(Format: Town' + sep + ' State' + sep + ' ZIP code)';
            }
            else if (w.type === 'date') {
                if (w.params.minDate && w.params.maxDate) {
                    res = '(Must be between ' + w.params.minDate.str + ' and ' +
                        w.params.maxDate.str + ')';
                }
                else if (w.params.minDate) {
                    res = '(Must be after ' + w.params.minDate.str + ')';
                }
                else if (w.params.maxDate) {
                    res = '(Must be before ' + w.params.maxDate.str + ')';
                }
                else {
                    res = '(Format: ' + w.params.format + ')';
                }
            }
            else if (w.type === 'number' || w.type === 'int' ||
                     w.type === 'float') {

                if (w.params.min && w.params.max) {
                    res = '(Must be between ' + w.params.min + ' and ' +
                        w.params.max + ')';
                }
                else if (w.params.min) {
                    res = '(Must be after ' + w.params.min + ')';
                }
                else if (w.params.max) {
                    res = '(Must be before ' + w.params.max + ')';
                }
            }
            return w.required ? ((res || '') + ' *') : (res || false);
        },
        numericErr: function(w) {
            var str, p;
            p = w.params;
            // Weird, but valid, case.
            if (p.exactly) return 'Must enter ' + p.lower;
            // Others.
            str = 'Must be ';
            if (w.type === 'float') str += 'a floating point number';
            else if (w.type === 'int') str += 'an integer';
            if (p.between) {
                str += ' ' + (p.leq ? '&ge; ' : '<' ) + p.lower;
                str += ' and ';
                str += (p.ueq ? '&le; ' : '> ') + p.upper;
            }
            else if ('undefined' !== typeof p.lower) {
                str += ' ' + (p.leq ? '&ge; ' : '< ') + p.lower;
            }
            // It can be also a non-numeric error, e.g. a string here.
            else if ('undefined' !== typeof p.upper) {
                str += ' ' + (p.ueq ? '&le; ' : '> ') + p.upper;
            }
            return str;
        },
        textErr: function(w, param) {
            var str, p;
            if (param === 'num') return 'Cannot contain numbers';
            p = w.params;
            str = 'Must be ';
            if (p.exactly) {
                str += 'exactly ' + (p.lower + 1);
            }
            else if (p.between) {
                str += 'between ' + p.lower + ' and ' + p.upper;
            }
            else if ('undefined' !== typeof p.lower) {
                str += ' more than ' + (p.lower -1);
            }
            else if ('undefined' !== typeof p.upper) {
                str += ' less than ' + (p.upper + 1);
            }
            str += ' characters long';
            if (p.between) str += ' (extremes included)';
            str += '. Current length: ' + param;
            return str;
        },
        dateErr: function(w, param) {
            if (param === 'invalid') return 'Date is invalid';
            if (param === 'min') {
                return 'Date must be after ' + w.params.minDate.str;
            }
            if (param === 'max') {
                return 'Date must be before ' + w.params.maxDate.str;
            }
            return 'Must follow format ' + w.params.format;
        },
        emptyErr: 'Cannot be empty'
    };

    // ## Dependencies

    CustomInput.dependencies = {
        JSUS: {}
    };

    /**
     * ## CustomInput constructor
     *
     * Creates a new instance of CustomInput
     */
    function CustomInput() {

        /**
         * ### CustomInput.input
         *
         * The HTML input element
         */
        this.input = null;

        /**
         * ### CustomInput.placeholder
         *
         * The placeholder text for the input form
         *
         * Some types preset it automatically
         */
        this.placeholder = null;

        /**
         * ### CustomInput.inputWidth
         *
         * The width of the input form as string (css attribute)
         *
         * Some types preset it automatically
         */
        this.inputWidth = null;

        /**
         * ### CustomInput.type
         *
         * The type of input
         */
        this.type = null;

        /**
         * ### CustomInput.preprocess
         *
         * The function that preprocess the input before validation
         *
         * The function receives the input form and must modify it directly
         */
        this.preprocess = null;

        /**
         * ### CustomInput.validation
         *
         * The validation function for the input
         *
         * The function returns an object like:
         *
         * ```javascript
         *  {
         *    value: 'validvalue',
         *    err:   'This error occurred' // If invalid.
         *  }
         * ```
         */
        this.validation = null;

        /**
         * ### CustomInput.userValidation
         *
         * An additional validation executed after the main validation function
         *
         * Executes only if validation does not fail, takes as input the return
         * value from the validation function which can be modified accordingly.
         *
         * ```javascript
         *  {
         *    value: 'validvalue',
         *    err:   'This error occurred' // If invalid.
         *  }
         * ```
         */
        this.userValidation = null;

        /**
         * ### CustomInput.validationSpeed
         *
         * How often (in milliseconds) the validation function is called
         *
         * Default: 500
         */
        this.validationSpeed = 500;

        /**
         * ### CustomInput.postprocess
         *
         * The function that postprocess the input after validation
         *
         * The function returns the postprocessed value
         */
        this.postprocess = null;

        /**
         * ### CustomInput.oninput
         *
         * A function that is executed after any input
         *
         * It is executed after validation and receives a result object
         * and a reference to this widget.
         */
        this.oninput = null;

        /**
         * ### CustomInput.params
         *
         * Object containing extra validation params
         *
         * This object is populated by the init function
         */
        this.params = {};

        /**
         * ### CustomInput.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### CustomInput.mainText
         *
         * A text preceeding the custom input
         */
        this.mainText = null;

        /**
         * ### CustomInput.hint
         *
         * An additional text with information about the input
         *
         * If not specified, it may be auto-filled, e.g. '*'.
         *
         * @see CustomInput.texts.autoHint
         */
        this.hint = null;

        /**
         * ### CustomInput.requiredChoice
         *
         * If TRUE, the input form cannot be left empty
         *
         * Default: TRUE
         *
         * @deprecated Use CustomInput.required
         */
        this.requiredChoice = null;

        /**
         * ### CustomInput.required
         *
         * If TRUE, the input form cannot be left empty
         *
         * Default: TRUE
         */
        this.required = null;

        /**
         * ### CustomInput.timeBegin
         *
         * When the first character was inserted
         */
        this.timeBegin = null;

        /**
         * ### CustomInput.timeEnd
         *
         * When the last character was inserted
         */
        this.timeEnd = null;

        /**
         * ### CustomInput.checkbox
         *
         * A checkbox element for an additional action
         */
        this.checkbox = null;

        /**
         * ### CustomInput.checkboxText
         *
         * The text next to the checkbox
         */
        this.checkboxText = null;

        /**
         * ### CustomInput.checkboxCb
         *
         * The callback executed when the checkbox is clicked
         */
        this.checkboxCb = null;

        /**
         * ### CustomInput.orientation
         *
         * The orientation of main text relative to the input box
         *
         * Options:
         *   - 'V': main text above input box
         *   - 'H': main text next to input box
         *
         * Default: 'V'
         */
        this.orientation = null;
    }

    // ## CustomInput methods

    /**
     * ### CustomInput.init
     *
     * Initializes the instance
     *
     * @param {object} opts Configuration options
     */
    CustomInput.prototype.init = function(opts) {
        var tmp, that, e, isText, setValues;
        that = this;
        e = 'CustomInput.init: ';


        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'V';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('CustomInput.init: orientation must ' +
                                'be string, or undefined. Found: ' +
                                opts.orientation);
        }
        else {
            tmp = opts.orientation.toLowerCase().trim();
            if (tmp === 'h') tmp = 'H';
            else if (tmp === 'v') tmp = 'V';
            else {
                throw new Error('CustomInput.init: unknown orientation: ' +
                                tmp);
            }
        }
        this.orientation = tmp;

        // Backward compatible checks.
        // Option required will be used in the future.
        if ('undefined' !== typeof opts.required) {
            this.required = this.requiredChoice = !!opts.required;
        }
        if ('undefined' !== typeof opts.requiredChoice) {
            if (!!this.required !== !!opts.requiredChoice) {
                throw new TypeError('CustomInput.init: required and ' +
                                    'requiredChoice are incompatible. Option ' +
                                    'requiredChoice will be deprecated.');
            }
            this.required = this.requiredChoice = !!opts.requiredChoice;
        }
        if ('undefined' === typeof this.required) {
            this.required = this.requiredChoice = false;
        }

        if (opts.userValidation) {
            if ('function' !== typeof opts.userValidation) {
                throw new TypeError('CustomInput.init: userValidation must ' +
                                    'be function or undefined. Found: ' +
                                    opts.userValidation);
            }
            this.userValidation = opts.userValidation;
        }

        if (opts.type) {
            if (!CustomInput.types[opts.type]) {
                throw new Error(e + 'type not supported: ' + opts.type);
            }
            this.type = opts.type;
        }
        else {
            this.type = 'text';
        }

        if (opts.validation) {
            if ('function' !== typeof opts.validation) {
                throw new TypeError(e + 'validation must be function ' +
                                    'or undefined. Found: ' +
                                    opts.validation);
            }
            tmp = opts.validation;
        }
        else {
            // Add default validations based on type.

            if (this.type === 'number' || this.type === 'float' ||
                this.type === 'int' || this.type === 'text') {

                isText = this.type === 'text';

                // Greater than.
                if ('undefined' !== typeof opts.min) {
                    tmp = J.isNumber(opts.min);
                    if (false === tmp) {
                        throw new TypeError(e + 'min must be number or ' +
                                            'undefined. Found: ' + opts.min);
                    }
                    this.params.lower = opts.min;
                    this.params.leq = true;
                }
                // Less than.
                if ('undefined' !== typeof opts.max) {
                    tmp = J.isNumber(opts.max);
                    if (false === tmp) {
                        throw new TypeError(e + 'max must be number or ' +
                                            'undefined. Found: ' + opts.max);
                    }
                    this.params.upper = opts.max;
                    this.params.ueq = true;
                }

                if (opts.strictlyGreater) this.params.leq = false;
                if (opts.strictlyLess) this.params.ueq = false;

                // Checks on both min and max.
                if ('undefined' !== typeof this.params.lower &&
                    'undefined' !== typeof this.params.upper) {

                    if (this.params.lower > this.params.upper) {
                        throw new TypeError(e + 'min cannot be greater ' +
                                            'than max. Found: ' +
                                            opts.min + '> ' + opts.max);
                    }
                    // Exact length.
                    if (this.params.lower === this.params.upper) {
                        if (!this.params.leq || !this.params.ueq) {

                            throw new TypeError(e + 'min cannot be equal to ' +
                                                'max when strictlyGreater or ' +
                                                'strictlyLess are set. ' +
                                                'Found: ' + opts.min);
                        }
                        if (this.type === 'int' || this.type === 'text') {
                            if (J.isFloat(this.params.lower)) {


                                throw new TypeError(e + 'min cannot be a ' +
                                                    'floating point number ' +
                                                    'and equal to ' +
                                                    'max, when type ' +
                                                    'is not "float". Found: ' +
                                                    opts.min);
                            }
                        }
                        // Store this to create better error strings.
                        this.params.exactly = true;
                    }
                    else {
                        // Store this to create better error strings.
                        this.params.between = true;
                    }
                }

                // Checks for text only.
                if (isText) {

                    this.params.noNumbers = opts.noNumbers;

                    if ('undefined' !== typeof this.params.lower) {
                        if (this.params.lower < 0) {
                            throw new TypeError(e + 'min cannot be negative ' +
                                                'when type is "text". Found: ' +
                                                this.params.lower);
                        }
                        if (!this.params.leq) this.params.lower++;
                    }
                    if ('undefined' !== typeof this.params.upper) {
                        if (this.params.upper < 0) {
                            throw new TypeError(e + 'max cannot be negative ' +
                                                'when type is "text". Found: ' +
                                                this.params.upper);
                        }
                        if (!this.params.ueq) this.params.upper--;
                    }

                    tmp = function(value) {
                        var len, p, out, err;
                        p = that.params;
                        len = value.length;
                        out = { value: value };
                        if (p.noNumbers && /\d/.test(value)) {
                            err = that.getText('textErr', 'num');
                        }
                        else {
                            if (p.exactly) {
                                err = len !== p.lower;
                            }
                            else {
                                if (('undefined' !== typeof p.lower &&
                                     len < p.lower) ||
                                    ('undefined' !== typeof p.upper &&
                                     len > p.upper)) {

                                    err = true;
                                }
                            }
                            if (err) err = that.getText('textErr', len);
                        }
                        if (err) out.err = err;
                        return out;
                    };

                    setValues = function() {
                        var a, b;
                        a = 'undefined' !== typeof that.params.lower ?
                            (that.params.lower + 1) : 5;
                        b = 'undefined' !== typeof that.params.upper ?
                            that.params.upper : (a + 5);
                        return J.randomString(J.randomInt(a, b));
                    };
                }
                else {
                    tmp = (function() {
                        var cb;
                        if (that.type === 'float') cb = J.isFloat;
                        else if (that.type === 'int') cb = J.isInt;
                        else cb = J.isNumber;
                        return function(value) {
                            var res, p;
                            p = that.params;
                            res = cb(value, p.lower, p.upper, p.leq, p.ueq);
                            if (res !== false) return { value: res };
                            return {
                                value: value,
                                err: that.getText('numericErr')
                            };
                        };
                    })();

                    setValues = function() {
                        var p, a, b;
                        p = that.params;
                        if (that.type === 'float') return J.random();
                        a = 0;
                        if ('undefined' !== typeof p.lower) {
                            a = p.leq ? (p.lower - 1) : p.lower;
                        }
                        if ('undefined' !== typeof p.upper) {
                            b = p.ueq ? p.upper : (p.upper - 1);
                        }
                        else {
                            b = 100 + a;
                        }
                        return J.randomInt(a, b);
                    };
                }

                // Preset inputWidth.
                if (this.params.upper) {
                    if (this.params.upper < 10) this.inputWidth = '100px';
                    else if (this.params.upper < 20) this.inputWidth = '200px';
                }

            }
            else if (this.type === 'date') {
                if ('undefined' !== typeof opts.format) {
                    // TODO: use regex.
                    if (opts.format !== 'mm-dd-yy' &&
                        opts.format !== 'dd-mm-yy' &&
                        opts.format !== 'mm-dd-yyyy' &&
                        opts.format !== 'dd-mm-yyyy' &&
                        opts.format !== 'mm.dd.yy' &&
                        opts.format !== 'dd.mm.yy' &&
                        opts.format !== 'mm.dd.yyyy' &&
                        opts.format !== 'dd.mm.yyyy' &&
                        opts.format !== 'mm/dd/yy' &&
                        opts.format !== 'dd/mm/yy' &&
                        opts.format !== 'mm/dd/yyyy' &&
                        opts.format !== 'dd/mm/yyyy') {

                        throw new Error(e + 'date format is invalid. Found: ' +
                                        opts.format);
                    }
                    this.params.format = opts.format;
                }
                else {
                    this.params.format = 'mm/dd/yyyy';
                }

                this.params.sep = this.params.format.charAt(2);
                tmp = this.params.format.split(this.params.sep);
                this.params.yearDigits = tmp[2].length;
                this.params.dayPos = tmp[0].charAt(0) === 'd' ? 0 : 1;
                this.params.monthPos =  this.params.dayPos ? 0 : 1;
                this.params.dateLen = tmp[2].length + 6;
                if (opts.minDate) {
                    tmp = getParsedDate(opts.minDate, this.params);
                    if (!tmp) {
                        throw new Error(e + 'minDate must be a Date object. ' +
                                        'Found: ' + opts.minDate);
                    }
                    this.params.minDate = tmp;
                }
                if (opts.maxDate) {
                    tmp = getParsedDate(opts.maxDate, this.params);
                    if (!tmp) {
                        throw new Error(e + 'maxDate must be a Date object. ' +
                                        'Found: ' + opts.maxDate);
                    }
                    if (this.params.minDate &&
                        this.params.minDate.obj > tmp.obj) {

                        throw new Error(e + 'maxDate cannot be prior to ' +
                                        'minDate. Found: ' + tmp.str +
                                        ' < ' + this.params.minDate.str);
                    }
                    this.params.maxDate = tmp;
                }

                // Preset inputWidth.
                if (this.params.yearDigits === 2) this.inputWidth = '100px';
                else this.inputWidth = '150px';

                // Preset placeholder.
                this.placeholder = this.params.format;

                tmp = function(value) {
                    var p, tokens, tmp, res, dayNum, l1, l2;
                    p = that.params;

                    // Is the format valid.

                    tokens = value.split(p.sep);
                    if (tokens.length !== 3) {
                        return { err: that.getText('dateErr') };
                    }

                    // Year.
                    if (tokens[2].length !== p.yearDigits) {
                        return { err: that.getText('dateErr') };
                    }

                    // Now we check if the date is valid.

                    res = {};
                    if (p.yearDigits === 2) {
                        l1 = -1;
                        l2 = 100;
                    }
                    else {
                        l1 = -1;
                        l2 = 10000;
                    }
                    tmp = J.isInt(tokens[2], l1, l2);
                    if (tmp !== false) res.year = tmp;
                    else res.err = true;

                    // Month.
                    tmp = J.isInt(tokens[p.monthPos], 1, 12, 1, 1);
                    if (!tmp) res.err = true;
                    else res.month = tmp;
                    // 31 or 30 days?
                    if (tmp === 1 || tmp === 3 || tmp === 5 || tmp === 7 ||
                        tmp === 8 || tmp === 10 || tmp === 12) {

                        dayNum = 31;
                    }
                    else if (tmp !== 2) {
                        dayNum = 30;
                    }
                    else {
                        // Is it leap year?
                        dayNum = (res.year % 4 === 0 && res.year % 100 !== 0) ||
                            res.year % 400 === 0 ? 29 : 28;
                    }
                    res.month = tmp;
                    // Day.
                    tmp = J.isInt(tokens[p.dayPos], 1, dayNum, 1, 1);
                    if (!tmp) res.err = true;
                    else res.day = tmp;

                    if (res.err) {
                        res.err = that.getText('dateErr', 'invalid');
                    }
                    else if (p.minDate || p.maxDate) {
                        tmp = new Date(value);
                        if (p.minDate.obj && p.minDate.obj > tmp) {
                            res.err = that.getText('dateErr', 'min');
                        }
                        else if (p.maxDate.obj && p.maxDate.obj < tmp) {
                            res.err = that.getText('dateErr', 'max');
                        }
                    }
                    if (!res.err) {
                        res.value = value;
                        res = { value: res };
                    }
                    return res;
                };

                setValues = function() {
                    var p, minD, maxD, d, day, month, year;
                    p = that.params;
                    minD = p.minDate ? p.minDate.obj : new Date('01/01/1900');
                    maxD = p.maxDate ? p.maxDate.obj : undefined;
                    d = J.randomDate(minD, maxD);
                    day = d.getDate();
                    month = (d.getMonth() + 1);
                    year = d.getFullYear();
                    if (p.yearDigits === 2) year = ('' + year).substr(2);
                    if (p.monthPos === 0) d = month + p.sep + day;
                    else d = day + p.sep + month;
                    d += p.sep + year;
                    return d;
                };
            }
            else if (this.type === 'us_state') {
                if (opts.abbreviation) {
                    this.params.abbr = true;
                    this.inputWidth = '100px';
                }
                else {
                    this.inputWidth = '200px';
                }
                if (opts.territories !== false) {
                    this.terr = true;
                    if (this.params.abbr) {
                        tmp = getUsStatesList('usStatesTerrByAbbrLow');
                    }
                    else {
                        tmp = getUsStatesList('usStatesTerrLow');
                    }
                }
                else {
                    if (this.params.abbr) {
                        tmp = getUsStatesList('usStatesByAbbrLow');
                    }
                    else {
                        tmp = getUsStatesList('usStatesLow');
                    }
                }
                this.params.usStateVal = tmp;

                tmp = function(value) {
                    var res;
                    res = { value: value };
                    if (!that.params.usStateVal[value.toLowerCase()]) {
                        res.err = that.getText('usStateErr');
                    }
                    return res;
                };

                setValues = function() {
                    return J.randomKey(that.params.usStateVal);
                };

            }
            else if (this.type === 'us_zip') {
                tmp = function(value) {
                    var res;
                    res = { value: value };
                    if (!isValidUSZip(value)) {
                        res.err = that.getText('usZipErr');
                    }
                    return res;
                };

                setValues = function() {
                    return Math.floor(Math.random()*90000) + 10000;
                };
            }

            // Lists.

            else if (this.type === 'list' ||
                     this.type === 'us_city_state_zip') {

                if (opts.listSeparator) {
                    if ('string' !== typeof opts.listSeparator) {
                        throw new TypeError(e + 'listSeparator must be ' +
                                            'string or undefined. Found: ' +
                                            opts.listSeperator);
                    }
                    this.params.listSep = opts.listSeparator;
                }
                else {
                    this.params.listSep = ',';
                }

                if (this.type === 'us_city_state_zip') {

                    getUsStatesList('usStatesTerrByAbbr');
                    this.params.minItems = this.params.maxItems = 3;
                    this.params.fixedSize = true;
                    this.params.itemValidation = function(item, idx) {
                        if (idx === 2) {
                            if (!usStatesTerrByAbbr[item.toUpperCase()]) {
                                return { err: that.getText('usStateAbbrErr') };
                            }
                        }
                        else if (idx === 3) {
                            if (!isValidUSZip(item)) {
                                return { err: that.getText('usZipErr') };
                            }
                        }
                    };

                    this.placeholder = 'Town' + this.params.listSep +
                        ' State' + this.params.listSep + ' ZIP';
                }
                else {
                    if ('undefined' !== typeof opts.minItems) {
                        tmp = J.isInt(opts.minItems, 0);
                        if (tmp === false) {
                            throw new TypeError(e + 'minItems must be ' +
                                                'a positive integer. Found: ' +
                                                opts.minItems);
                        }
                        this.params.minItems = tmp;
                    }
                    else if (this.required) {
                        this.params.minItems = 1;
                    }
                    if ('undefined' !== typeof opts.maxItems) {
                        tmp = J.isInt(opts.maxItems, 0);
                        if (tmp === false) {
                            throw new TypeError(e + 'maxItems must be ' +
                                                'a positive integer. Found: ' +
                                                opts.maxItems);
                        }
                        if (this.params.minItems &&
                            this.params.minItems > tmp) {

                            throw new TypeError(e + 'maxItems must be larger ' +
                                                'than minItems. Found: ' +
                                                tmp + ' < ' +
                                                this.params.minItems);
                        }
                        this.params.maxItems = tmp;
                    }
                }

                tmp = function(value) {
                    var i, len, v, iVal, err;
                    value = value.split(that.params.listSep);
                    len = value.length;
                    if (!len) return value;
                    iVal = that.params.itemValidation;
                    i = 0;
                    v = value[0].trim();
                    if (!v) return { err: that.getText('listErr') };
                    if (iVal) {
                        err = iVal(v, 1);
                        if (err) return err;
                    }
                    value[i++] = v;
                    if (len > 1) {
                        v = value[1].trim();
                        if (!v) return { err: that.getText('listErr') };
                        if (iVal) {
                            err = iVal(v, (i+1));
                            if (err) return err;
                        }
                        value[i++] = v;
                    }
                    if (len > 2) {
                        v = value[2].trim();
                        if (!v) return { err: that.getText('listErr') };
                        if (iVal) {
                            err = iVal(v, (i+1));
                            if (err) return err;
                        }
                        value[i++] = v;
                    }
                    if (len > 3) {
                        for ( ; i < len ; ) {
                            v = value[i].trim();
                            if (!v) return { err: that.getText('listErr') };
                            if (iVal) {
                                err = iVal(v, (i+1));
                                if (err) return err;
                            }
                            value[i++] = v;
                        }
                    }
                    // Need to do it here, because some elements might be empty.
                    if (that.params.minItems && i < that.params.minItems) {
                        return { err: that.getText('listSizeErr', 'min') };
                    }
                    if (that.params.maxItems && i > that.params.maxItems) {
                        return { err: that.getText('listSizeErr', 'max') };
                    }
                    return { value: value };
                };

                if (this.type === 'us_city_state_zip') {
                    setValues = function() {
                        var sep;
                        sep = that.params.listSep + ' ';
                        return J.randomString(8) + sep +
                            J.randomKey(usStatesTerrByAbbr) + sep +
                            (Math.floor(Math.random()*90000) + 10000);
                    };
                }
                else {
                    setValues = function(opts) {
                        var p, minItems, nItems, i, str, sample;
                        p = that.params;
                        minItems = p.minItems || 0;
                        if (opts.availableValues) {
                            nItems = J.randomInt(minItems,
                                                 opts.availableValues.length);
                            nItems--;
                            sample = J.sample(0, (nItems-1));
                        }
                        else {
                            nItems = J.randomInt(minItems,
                                                 p.maxItems || (minItems + 5));
                            nItems--;
                        }
                        str = '';
                        for (i = 0; i < nItems; i++) {
                            if (i !== 0) str += p.listSep + ' ';
                            if (sample) str += opts.availableValues[sample[i]];
                            else str += J.randomString(J.randomInt(3,10));
                        }
                        return str;
                    };
                }

            }

            // US_Town,State, Zip Code

            // TODO: add other types, e.g., email.
        }

        // Variable tmp contains a validation function, either from
        // defaults, or from user option.

        this.validation = function(value) {
            var res;
            res = { value: value };
            if (value.trim() === '') {
                if (that.required) res.err = that.getText('emptyErr');
            }
            else if (tmp) {
                res = tmp(value);
            }
            if (that.userValidation) that.userValidation(res);
            return res;
        };

        this._setValues = setValues;

        // Preprocess

        if (opts.preprocess) {
            if ('function' !== typeof opts.preprocess) {
                throw new TypeError(e + 'preprocess must be function or ' +
                                    'undefined. Found: ' + opts.preprocess);
            }
            this.preprocess = opts.preprocess;
        }
        else if (opts.preprocess !== false) {

            if (this.type === 'date') {
                this.preprocess = function(input) {
                    var sep, len;
                    len = input.value.length;
                    sep = that.params.sep;
                    if (len === 2) {
                        if (input.selectionStart === 2) {
                            if (input.value.charAt(1) !== sep) {
                                input.value += sep;
                            }
                        }
                    }
                    else if (len === 5) {
                        if (input.selectionStart === 5) {
                            if (input.value.charAt(4) !== sep &&
                                (input.value.split(sep).length - 1) === 1) {

                                input.value += sep;
                            }
                        }
                    }
                    else if (len > this.params.dateLen) {
                        input.value =
                            input.value.substring(0, this.params.dateLen);
                    }
                };
            }
            else if (this.type === 'list' ||
                     this.type === 'us_city_state_zip') {

                // Add a space after separator, if separator is not space.
                if (this.params.listSep.trim() !== '') {
                    this.preprocess = function(input) {
                        var sep, len;
                        len = input.value.length;
                        sep = that.params.listSep;
                        if (len > 1 &&
                            len === input.selectionStart &&
                            input.value.charAt(len-1) === sep &&
                            input.value.charAt(len-2) !== sep) {

                            input.value += ' ';
                        }
                    };
                }
            }
        }

        // Postprocess.

        if (opts.postprocess) {
            if ('function' !== typeof opts.postprocess) {
                throw new TypeError(e + 'postprocess must be function or ' +
                                    'undefined. Found: ' + opts.postprocess);
            }
            this.postprocess = opts.postprocess;
        }
        else {
            // Add postprocess as needed.
        }

        // Oninput.

        if (opts.oninput) {
            if ('function' !== typeof opts.oninput) {
                throw new TypeError(e + 'oninput must be function or ' +
                                    'undefined. Found: ' + opts.oninput);
            }
            this.oninput = opts.oninput;
        }

        // Validation Speed
        if ('undefined' !== typeof opts.validationSpeed) {
            tmp = J.isInt(opts.valiadtionSpeed, 0, undefined, true);
            if (tmp === false) {
                throw new TypeError(e + 'validationSpeed must a non-negative ' +
                                    'number or undefined. Found: ' +
                                    opts.validationSpeed);
            }
            this.validationSpeed = tmp;
        }

        // MainText, Hint, and other visuals.

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError(e + 'mainText must be string or ' +
                                    'undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        if ('undefined' !== typeof opts.hint) {
            if (false !== opts.hint && 'string' !== typeof opts.hint) {
                throw new TypeError(e + 'hint must be a string, false, or ' +
                                    'undefined. Found: ' + opts.hint);
            }
            this.hint = opts.hint;
            if (this.required) this.hint += ' *';
        }
        else {
            this.hint = this.getText('autoHint');
        }
        if (opts.placeholder) {
            if ('string' !== typeof opts.placeholder) {
                throw new TypeError(e + 'placeholder must be string or ' +
                                    'undefined. Found: ' + opts.placeholder);
            }
            this.placeholder = opts.placeholder;
        }
        if (opts.width) {
            if ('string' !== typeof opts.width) {
                throw new TypeError(e + 'width must be string or ' +
                                    'undefined. Found: ' + opts.width);
            }
            this.inputWidth = opts.width;
        }

        if (opts.checkboxText) {
            if ('string' !== typeof opts.checkboxText) {
                throw new TypeError(e + 'checkboxText must be string or ' +
                                    'undefined. Found: ' + opts.checkboxText);
            }
            this.checkboxText = opts.checkboxText;
        }

        if (opts.checkboxCb) {
            if (!this.checkboxText) {
                throw new TypeError(e + 'checkboxCb cannot be defined ' +
                                    'if checkboxText is not defined');
            }
            if ('function' !== typeof opts.checkboxCb) {
                throw new TypeError(e + 'checkboxCb must be function or ' +
                                    'undefined. Found: ' + opts.checkboxCb);
            }
            this.checkboxCb = opts.checkboxCb;
        }
    };


    /**
     * ### CustomInput.append
     *
     * Implements Widget.append
     *
     * @see Widget.append
     */
    CustomInput.prototype.append = function() {
        var that, timeout;
        that = this;

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'custominput-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'custominput-hint',
                innerHTML: this.hint
            });
        }

        this.input = W.append('input', this.bodyDiv);
        if (this.placeholder) this.input.placeholder = this.placeholder;
        if (this.inputWidth) this.input.style.width = this.inputWidth;

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.input.oninput = function() {
            if (!that.timeBegin) {
                that.timeEnd = that.timeBegin = node.timer.getTimeSince('step');
            }
            else {
                that.timeEnd = node.timer.getTimeSince('step');
            }
            if (timeout) clearTimeout(timeout);
            if (that.isHighlighted()) that.unhighlight();
            if (that.preprocess) that.preprocess(that.input);
            timeout = setTimeout(function() {
                var res;
                if (that.validation) {
                    res = that.validation(that.input.value);
                    if (res.err) that.setError(res.err);
                }
                // In case something else needs to be updated.
                if (that.oninput) that.oninput(res, that);
            }, that.validationSpeed);
        };
        this.input.onclick = function() {
            if (that.isHighlighted()) that.unhighlight();
        };


        // Checkbox.
        if (this.checkboxText) {
            this.checkbox = W.append('input', this.bodyDiv, {
                type: 'checkbox',
                className: 'custominput-checkbox'
            });
            W.append('span', this.bodyDiv, {
                className: 'custominput-checkbox-text',
                innerHTML: this.checkboxText
            });

            if (this.checkboxCb) {
                J.addEvent(this.checkbox, 'change', function() {
                    that.checkboxCb(that.checkbox.checked, that);
                });
            }
        }
    };

    /**
     * ### CustomInput.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see CustomInput.highlight
     * @see CustomInput.errorBox
     */
    CustomInput.prototype.setError = function(err) {
        this.errorBox.innerHTML = err;
        this.highlight();
    };

    /**
     * ### CustomInput.highlight
     *
     * Highlights the input
     *
     * @param {string} The style for the table's border.
     *   Default '3px solid red'
     *
     * @see CustomInput.highlighted
     */
    CustomInput.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('CustomInput.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.input || this.highlighted) return;
        this.input.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### CustomInput.unhighlight
     *
     * Removes highlight from the input
     *
     * @see CustomInput.highlighted
     */
    CustomInput.prototype.unhighlight = function() {
        if (!this.input || this.highlighted !== true) return;
        this.input.style.border = '';
        this.highlighted = false;
        this.errorBox.innerHTML = '';
        this.emit('unhighlighted');
    };

    /**
     * ### CustomInput.disable
     *
     * Disables the widget
     *
     * @see CustomInput.disabled
     */
    CustomInput.prototype.disable = function(opts) {
        if (this.disabled) return;
        if (!this.isAppended()) return;
        this.disabled = true;
        this.input.disabled = true;
        if (this.checkbox && (!opts || opts.checkbox !== false)) {
            this.checkbox.disable = true;
        }
        this.emit('disabled');
    };

    /**
     * ### CustomInput.enable
     *
     * Enables the widget
     *
     * @see CustomInput.disabled
     */
    CustomInput.prototype.enable = function(opts) {
        if (this.disabled !== true) return;
        if (!this.isAppended()) return;
        this.disabled = false;
        this.input.disabled = false;
        if (this.checkbox && (!opts || opts.checkbox !== false)) {
            this.checkbox.disable = false;
        }
        this.emit('enabled');
    };

    /**
     * ### CustomInput.reset
     *
     * Resets the widget
     */
    CustomInput.prototype.reset = function() {
        if (this.input) this.input.value = '';
        if (this.isHighlighted()) this.unhighlight();
        this.timeBegin = this.timeEnd = null;
    };

    /**
     * ### CustomInput.getValues
     *
     * Returns the value currently in the input
     *
     * The postprocess function is called if specified
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available options:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *       value, widget will be highlighted. Default: TRUE.
     *   - reset:       If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *
     * @return {mixed} The value in the input
     *
     * @see CustomInput.verifyChoice
     * @see CustomInput.reset
     */
    CustomInput.prototype.getValues = function(opts) {
        var res, valid;
        opts = opts || {};
        res = this.input.value;
        if (opts.valuesOnly) return res;
        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        res = this.validation ? this.validation(res) : { value: res };
        valid = !res.err;
        res.timeBegin = this.timeBegin;
        res.timeEnd = this.timeEnd;
        if (this.postprocess) res.value = this.postprocess(res.value, valid);
        if (!valid) {
            if (opts.highlight) this.setError(res.err);
            if (opts.markAttempt) res.isCorrect = false;
        }
        else {
            if (opts.markAttempt) res.isCorrect = true;
            if (opts.reset) this.reset();
        }
        if (this.checkbox) res.checked = this.checkbox.checked;
        res.id = this.id;
        return res;
    };

    /**
     * ### CustomInput.setValues
     *
     * Set the value of the input form
     *
     * @param {object} opts An object containing values or info about how
     *   how to set values.
     *
     * @experimental
     */
    CustomInput.prototype.setValues = function(opts) {
        var value, tmp;
        opts = opts || {};
        if ('undefined' !== typeof opts.value) {
            value = opts.value;
        }
        // Alias.
        else if ('undefined' !== typeof opts.values) {
            value = opts.values;
        }
        else if (opts.availableValues) {
            tmp = opts.availableValues;
            if (!J.isArray(tmp) || !tmp.length) {
                throw new TypeError('CustomInput.setValues: availableValues ' +
                                    'must be a non-empty array or undefined. ' +
                                    'Found: ' + tmp);
            }
            if (this.type === 'list') {
                if (tmp.length < this.params.minItems) {
                    throw new Error('CustomInput.setValues: availableValues ' +
                                    'must be a non-empty array or undefined. ' +
                                    'Found: ' + tmp);
                }
                value = this._setValues(opts);
            }
            else {
                value = tmp[J.randomInt(0, tmp.length) -1];
            }
        }
        else {
            value = this._setValues(opts);
        }
        this.input.value = value;
        if (this.preprocess) this.preprocess(this.input);
    };

    // ## Helper functions.

    // ### getParsedDate
    //
    // Tries to parse a date object, catches exceptions
    //
    // @param {string|Date} d The date object
    // @param {object} p The configuration object for date format
    //
    // @return {object|boolean} An object with the parsed date or false
    //   if an error occurred
    //
    function getParsedDate(d, p) {
        var res, day;
        if ('string' === typeof d) {
            d = d === 'today' ? new Date() : new Date(d);
            // If invalid  date it return NaN.
            day = d.getDate();
            if (!day) return false;
        }
        try {
            res = {
                day: day || d.getDate(),
                month: d.getMonth() + 1,
                year: d.getFullYear(),
                obj: d
            };
        }
        catch(e) {
            return false;
        }
        res.str = (p.dayPos ? res.day + p.sep + res.month :
                   res.month + p.sep + res.day) + p.sep;
        res.str += p.yearDigits === 2 ? res.year.substring(3,4) : res.year;
        return res;
    }



    // ### getUsStatesList
    //
    // Sets the value of a global variable and returns it.
    //
    // @param {string} s A string specifying the type of list
    //
    // @return {object} The requested list
    //
    function getUsStatesList(s) {
        switch(s) {

        case 'usStatesTerrByAbbrLow':
            if (!usStatesTerrByAbbrLow) {
                getUsStatesList('usStatesTerrLow');
                usStatesTerrByAbbrLow = J.reverseObj(usStatesTerr, toLK);
            }
            return usStatesTerrByAbbrLow;
        case 'usStatesTerrByAbbr':
            if (!usStatesTerrByAbbr) {
                getUsStatesList('usStatesTerr');
                usStatesTerrByAbbr = J.reverseObj(usStatesTerr);
            }
            return usStatesTerrByAbbr;

        case 'usTerrByAbbrLow':
            if (!usTerrByAbbrLow) usTerrByAbbrLow = J.reverseObj(usTerr, toLK);
            return usTerrByAbbrLow;
        case 'usTerrByAbbr':
            if (!usTerrByAbbr) usTerrByAbbr = J.reverseObj(usTerr);
            return usTerrByAbbr;

        case 'usStatesByAbbrLow':
            if (!usStatesByAbbrLow) {
                usStatesByAbbrLow = J.reverseObj(usStates, toLK);
            }
            return usStatesByAbbrLow;
        case 'usStatesByAbbr':
            if (!usStatesByAbbr) usStatesByAbbr = J.reverseObj(usStates);
            return usStatesByAbbr;

        case 'usStatesTerrLow':
            if (!usStatesTerrLow) {
                if (!usStatesLow) usStatesLow = objToLK(usStates);
                if (!usTerrLow) usTerrLow = objToLK(usTerr);
                usStatesTerrLow = J.merge(usStatesLow, usTerrLow);
            }
            return usStatesTerrLow;
        case 'usStatesTerr':
            if (!usStatesTerr) usStatesTerr = J.merge(usStates, usTerr);
            return usStatesTerr;

        case 'usStatesLow':
            if (!usStatesLow) usStatesLow = objToLK(usStates);
            return usStatesLow;
        case 'usStates':
            return usStates;

        case 'usTerrLow':
            if (!usTerrLow) usTerrLow = objToLK(usTerr);
            return usTerrLow;
        case 'usTerr':
            return usTerr;

        default:
            throw new Error('getUsStatesList: unknown request: ' + s);
        }
    }

    // Helper function for getUsStatesList
    // @see OBJ.reverseObj
    function toLK(key, value) {
        return [ key.toLowerCase(), value ];
    }
    // Helper function for getUsStatesList
    function objToLK(obj) {
        var p, objLow;
        objLow = {};
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                objLow[p.toLowerCase()] = obj[p];
            }
        }
        return objLow;
    }

    // ### isValidUSZip
    //
    // Trivial validation of a US ZIP code
    //
    // @param {string} z
    //
    // @return {boolean} TRUE if valid
    //
    function isValidUSZip(z) {
        return z.length === 5 && J.isInt(z, 0);
    }

})(node);

/**
 * # CustomInputGroup
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that groups together several custom input widgets
 *
 * @see CustomInput
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('CustomInputGroup', CustomInputGroup);

    // ## Meta-data

    CustomInputGroup.version = '0.3.0';
    CustomInputGroup.description = 'Groups together and manages sets of ' +
        'CustomInput widgets.';

    CustomInputGroup.title = false;
    CustomInputGroup.className = 'custominput custominputgroup';

    CustomInputGroup.separator = '::';

    CustomInputGroup.texts.autoHint = function(w) {
        if (w.requiredChoice) return '*';
        else return false;
    };
    CustomInputGroup.texts.inputErr = 'One or more errors detected.';

    // ## Dependencies

    CustomInputGroup.dependencies = {
        JSUS: {}
    };

    /**
     * ## CustomInputGroup constructor
     *
     * Creates a new instance of CustomInputGroup
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as main
     *   table. All other options are passed to the init method.
     */
    function CustomInputGroup() {

        /**
         * ### CustomInputGroup.dl
         *
         * The table containing all the custom inputs
         */
        this.table = null;

        /**
         * ### CustomInputGroup.trs
         *
         * Collection of all trs created
         *
         * Useful when shuffling items/choices
         *
         * @see CustomInputGroup.shuffle
         */
        this.trs = [];

        /**
         * ### CustomInputGroup.mainText
         *
         * The main text introducing the choices
         *
         * @see CustomInputGroup.spanMainText
         */
        this.mainText = null;

        /**
         * ### CustomInputGroup.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### CustomInputGroup.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

        /**
         * ### CustomInputGroup.items
         *
         * The array of available items
         */
        this.items = null;

        /**
         * ### CustomInputGroup.itemsById
         *
         * Map of items ids to items
         */
        this.itemsById = {};

        /**
         * ### CustomInputGroup.itemsMap
         *
         * Maps items ids to the position in the items array
         */
        this.itemsMap = {};

        /**
         * ### CustomInputGroup.choices
         *
         * Array of default choices (if passed as global parameter)
         */
        this.choices = null;

        /**
         * ### CustomInputGroup.choicesById
         *
         * Map of items choices ids to corresponding cell
         *
         * Useful to detect clickable cells.
         */
        this.choicesById = {};

        /**
         * ### CustomInputGroup.itemsSettings
         *
         * The array of settings for each item
         */
        this.itemsSettings = null;

        /**
         * ### CustomInputGroup.order
         *
         * The current order of display of choices
         *
         * May differ from `originalOrder` if shuffled.
         *
         * @see CustomInputGroup.originalOrder
         */
        this.order = null;

        /**
         * ### CustomInputGroup.originalOrder
         *
         * The initial order of display of choices
         *
         * @see CustomInput.order
         */
        this.originalOrder = null;

        /**
         * ### CustomInputGroup.shuffleItems
         *
         * If TRUE, items are inserted in random order
         *
         * @see CustomInputGroup.order
         */
        this.shuffleItems = null;

        /**
         * ### CustomInputGroup.requiredChoice
         *
         * The number of required choices.
         */
        this.requiredChoice = null;

        /**
         * ### ChoiceManager.required
         *
         * TRUE if widget should be checked upon node.done.
         *
         * TODO: Harmonize required and requiredChoice
         */
        this.required = null;

        /**
         * ### CustomInputGroup.orientation
         *
         * Orientation of display of items: vertical ('V') or horizontal ('H')
         *
         * Default orientation is vertical.
         */
        this.orientation = 'V';

        /**
         * ### CustomInputGroup.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### CustomInputGroup.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### CustomInputGroup.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### CustomInputGroup.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        // Options passed to each individual item.

        /**
         * ### CustomInputGroup.timeFrom
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
         * ### CustomInputGroup.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default CustomInputGroup.separator
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.separator = CustomInputGroup.separator;

        /**
         * ### CustomInputGroup.shuffleChoices
         *
         * If TRUE, choices in items are shuffled
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.shuffleChoices = null;

        /**
         * ### CustomInputGroup.sharedOptions
         *
         * An object containing options to be added to every custom input
         *
         * Options are added only if forms are specified as object literals,
         * and can be overriden by each individual form.
         */
        this.sharedOptions = {};

        /**
         * ### CustomInputGroup.summaryInput
         *
         * A summary custom input added last which can be updated in real time
         *
         * @see CustomInputGroup.summaryInputCb
         */
        this.summaryInput = null;

        /**
         * ### CustomInputGroup.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### CustomInputGroup.validation
         *
         * The callback validating all the inputs at once
         *
         * The callback is executed by getValues.
         *
         * Input paramers:
         *
         * - res: the validation result of all inputs
         * - values: object literal containing the current value of each input
         * - widget: a reference to this widget
         *
         * Return value:
         *
         * - res: the result object as it is on success, or with with an err
         *        property containing the error message on failure. Any change
         *        to the result object is carried over.
         *
         * @see CustomInputGroup.oninput
         */
        this.validation = null;

        /**
         * ### CustomInputGroup._validation
         *
         * Reference to the user defined validation function
         *
         * @api private
         */
        this._validation = null;

        /**
         * ### CustomInputGroup.oninput
         *
         * Callback called when any input has changed
         *
         * Input paramers:
         *
         * - res: the validation result of the single input
         * - input: the custom input that fired oninput
         * - widget: a reference to this widget
         */
        this.oninput = null;

        /**
         * ### CustomInputGroup._oninput
         *
         * Reference to the user defined oninput function
         *
         * @api private
         */
        this._oninput = null;
    }

    // ## CustomInputGroup methods

    /**
     * ### CustomInputGroup.init
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
     *   - sharedOptions: Options shared across all inputs
     *   - summary: An object containing the options to instantiate a custom
     *       input summary field.
     *   - validation: A validation callback for all inputs.
     *   - oninput: A callback called when any input is changed
     *
     * @param {object} opts Configuration options
     */
    CustomInputGroup.prototype.init = function(opts) {
        var tmp, that;
        that = this;

        // TODO: many options checking are replicated. Skip them all?
        // Have a method in CustomInput?

        if (!this.id) {
            throw new TypeError('CustomInputGroup.init: id ' +
                                'is missing.');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'V';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('CustomInputGroup.init: orientation ' +
                                'must be string, or undefined. Found: ' +
                                opts.orientation);
        }
        else {
            tmp = opts.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('CustomInputGroup.init: orientation ' +
                                'is invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleItems, default false.
        if ('undefined' === typeof opts.shuffleItems) tmp = false;
        else tmp = !!opts.shuffleItems;
        this.shuffleItems = tmp;

        // Option requiredChoice, if any.
        if ('number' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice;
        }
        else if ('boolean' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice ? 1 : 0;
        }
        else if ('undefined' !== typeof opts.requiredChoice) {
            throw new TypeError('CustomInputGroup.init: ' +
                                'requiredChoice ' +
                                'be number or boolean or undefined. Found: ' +
                                opts.requiredChoice);
        }

        if ('undefined' !== typeof opts.required) {
            this.required = !!opts.required;
        }

        // Set the group, if any.
        if ('string' === typeof opts.group ||
            'number' === typeof opts.group) {

            this.group = opts.group;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('CustomInputGroup.init: group must ' +
                                'be string, number or undefined. Found: ' +
                                opts.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof opts.groupOrder) {

            this.groupOrder = opts.groupOrder;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('CustomInputGroup.init: groupOrder ' +
                                'must be number or undefined. Found: ' +
                                opts.groupOrder);
        }

        // Set the validation function.
        if ('function' === typeof opts.validation) {
            this._validation = opts.validation;

            this.validation = function(res, values) {
                if (!values) values = that.getValues({ valuesOnly: true });
                return that._validation(res || {}, values, that)
            };
        }
        else if ('undefined' !== typeof opts.validation) {
            throw new TypeError('CustomInputGroup.init: validation must ' +
                                'be function or undefined. Found: ' +
                                opts.validation);
        }

        // Set the validation function.
        if ('function' === typeof opts.oninput) {
            this._oninput = opts.oninput;

            this.oninput = function(res, input) {
                that._oninput(res, input, that);
            };
        }
        else if ('undefined' !== typeof opts.oninput) {
            throw new TypeError('CustomInputGroup.init: oninput must ' +
                                'be function or undefined. Found: ' +
                                opts.oninput);
        }

        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('CustomInputGroup.init: mainText ' +
                                'must be string or undefined. Found: ' +
                                opts.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof opts.hint) {
            this.hint = opts.hint;
            if (this.requiredChoice) this.hint += ' *';
        }
        else if ('undefined' !== typeof opts.hint) {
            throw new TypeError('CustomInputGroup.init: hint must ' +
                                'be a string, or undefined. Found: ' +
                                opts.hint);
        }
        else {
            // Returns undefined if there are no constraints.
            this.hint = this.getText('autoHint');
        }

        // Set the timeFrom, if any.
        if (opts.timeFrom === false ||
            'string' === typeof opts.timeFrom) {

            this.timeFrom = opts.timeFrom;
        }
        else if ('undefined' !== typeof opts.timeFrom) {
            throw new TypeError('CustomInputGroup.init: timeFrom ' +
                                'must be string, false, or undefined. Found: ' +
                                opts.timeFrom);
        }

        // Option shuffleChoices, default false.
        if ('undefined' !== typeof opts.shuffleChoices) {
            this.shuffleChoices = !!opts.shuffleChoices;
        }

        // Set the className, if not use default.
        if ('undefined' === typeof opts.className) {
            this.className = CustomInputGroup.className;
        }
        else if (opts.className === false ||
                 'string' === typeof opts.className ||
                 J.isArray(opts.className)) {

            this.className = opts.className;
        }
        else {
            throw new TypeError('CustomInputGroup.init: ' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + opts.className);
        }

        // sharedOptions.
        if ('undefined' !== typeof opts.sharedOptions) {
            if ('object' !== typeof opts.sharedOptions) {
                throw new TypeError('CustomInputGroup.init: sharedOptions' +
                                    ' must be object or undefined. Found: ' +
                                    opts.sharedOptions);
            }
            if (opts.sharedOptions.hasOwnProperty('name')) {
                throw new Error('CustomInputGroup.init: sharedOptions ' +
                                'cannot contain property name. Found: ' +
                                opts.sharedOptions);
            }
            this.sharedOptions = J.mixin(this.sharedOptions,
                                        opts.sharedOptions);
        }

        if ('undefined' !== typeof opts.summary) {
            if ('string' === typeof opts.summary) {
                opts.summary = { mainText: opts.summary }
            }
            else if ('object' !== typeof opts.summary) {
                throw new TypeError('CustomInputGroup.init: summary' +
                                    ' must be object or undefined. Found: ' +
                                    opts.summary);
            }

            this.summaryInput = opts.summary;
        }

        // After all configuration options are evaluated, add items.

        if ('object' === typeof opts.table) {
            this.table = opts.table;
        }
        else if ('undefined' !== typeof opts.table &&
                 false !== opts.table) {

            throw new TypeError('CustomInputGroup.init: table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + opts.table);
        }

        // TODO: check this.
        this.table = opts.table;

        this.freeText = 'string' === typeof opts.freeText ?
            opts.freeText : !!opts.freeText;

        // Add the items.
        if ('undefined' !== typeof opts.items) this.setItems(opts.items);

    };

    /**
     * ### CustomInputGroup.setItems
     *
     * Sets the available items and optionally builds the table
     *
     * @param {array} items The array of items
     *
     * @see CustomInputGroup.table
     * @see CustomInputGroup.order
     * @see CustomInputGroup.shuffleItems
     * @see CustomInputGroup.buildTable
     */
    CustomInputGroup.prototype.setItems = function(items) {
        var len;
        if (!J.isArray(items)) {
            throw new TypeError('CustomInputGroup.setItems: ' +
                                'items must be array. Found: ' + items);
        }
        if (!items.length) {
            throw new Error('CustomInputGroup.setItems: ' +
                            'items is an empty array.');
        }

        len = items.length;
        this.itemsSettings = items;
        this.items = new Array(len);

        // Save the order in which the items will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleItems) this.order = J.shuffle(this.order);
        this.originalOrder = this.order;

        // Build the table and items at once (faster).
        if (this.table) this.buildTable();
    };

    /**
     * ### CustomInputGroup.buildTable
     *
     * Builds the table of clickable items and enables it
     *
     * Must be called after items have been set already.
     *
     * @see CustomInputGroup.setCustomInputs
     */
    CustomInputGroup.prototype.buildTable = function() {
        var i, len, tr, H;

        H = this.orientation === 'H';
        i = -1, len = this.itemsSettings.length;

        if (H) tr = createTR(this, 'row1');
        for ( ; ++i < len ; ) {
            // Add new TR.
            if (!H) tr = createTR(this, 'row' + (i+1));
            addCustomInput(this, tr, i);
        }
        if (this.summaryInput) {
            if (!H) tr = createTR(this, 'row' + (i+1));
            addSummaryInput(this, tr, i);
        }


        var that = this;
        this.table.onclick = function() {
            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        this.enable(true);
    };

    /**
     * ### CustomInputGroup.append
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
    CustomInputGroup.prototype.append = function() {
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('CustomInputGroup.append: id ' +
                            'is not unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'custominputgroup-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'custominputgroup-hint',
                innerHTML: this.hint
            });
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

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            this.textarea.className = CustomInputGroup.className + '-freetext';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### CustomInputGroup.listeners
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
    CustomInputGroup.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### CustomInputGroup.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    CustomInputGroup.prototype.disable = function() {
        if (this.disabled === true || !this.table) return;
        this.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### CustomInputGroup.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    CustomInputGroup.prototype.enable = function(force) {
        if (!this.table || (!force && !this.disabled)) return;
        this.disabled = false;
        this.emit('enabled');
    };

    /**
     * ### CustomInputGroup.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see CustomInputGroup.highlighted
     */
    CustomInputGroup.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('CustomInputGroup.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted === true) return;
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### CustomInputGroup.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see CustomInputGroup.highlighted
     */
    CustomInputGroup.prototype.unhighlight = function() {
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        this.highlighted = false;
        this.errorBox.innerHTML = '';
        this.emit('unhighlighted');
    };

    /**
     * ### CustomInputGroup.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - valuesOnly: just returns the current values, no other checkings.
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *      to find the correct answer. Default: TRUE.
     *   - highlight:   If TRUE, if current value is not the correct
     *      value, widget will be highlighted. Default: TRUE.
     *   - reset:    If TRUTHY and no item raises an error,
     *       then it resets the state of all items before
     *       returning it. Default: FALSE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see CustomInputGroup.verifyChoice
     * @see CustomInputGroup.reset
     */
    CustomInputGroup.prototype.getValues = function(opts) {
        var res, i, len, input, toReset, values;

        opts = opts || {};
        i = -1, len = this.items.length;
        if (opts.valuesOnly) {
            res = {};
            for ( ; ++i < len ; ) {
                res[this.items[i].id] =
                    this.items[i].getValues({ valuesOnly: true });
            }
            return res;
        }
        res = {
            id: this.id,
            order: this.order,
            items: {},
            isCorrect: true
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        // TODO: do we need markAttempt?
        // if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;

        // Make sure reset is done only at the end.
        toReset = opts.reset;
        opts.reset = false;

        if (this.validation) values = {};
        for ( ; ++i < len ; ) {
            input = this.items[i];
            res.items[input.id] = input.getValues(opts);
            // TODO is null or empty?
            if (res.items[input.id].value === "") {
                res.missValues = true;
                // TODO: check do we need to check for correctChoice?
                if (input.requiredChoice || input.required ||
                    input.correctChoice) {

                    res.err = true;
                    res.isCorrect = false;
                }
            }
            if (res.items[input.id].isCorrect === false && opts.highlight) {
                res.err = true;
            }
            if (values) values[input.id] = res.items[input.id].value;
        }
        if (!res.err && values) {
            // res.err = this.getText('inputErr');
            this.validation(res, values);
            if (opts.highlight && res.err) this.setError(res.err);
            if (res.err) res.isCorrect = false;
        }
        else if (toReset) this.reset(toReset);
        if (!res.isCorrect && opts.highlight) this.highlight();

        // Restore opts.reset.
        opts.reset = toReset;

        if (this.textarea) res.freetext = this.textarea.value;
        return res;
    };

    /**
     * ### CustomInputGroup.setValues
     *
     * Sets values in the choice table group as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     *
     * @see CustomInput.setValues
     *
     * @experimental
     */
    CustomInputGroup.prototype.setValues = function(opts) {
        var i, len;
        if (!this.items || !this.items.length) {
            throw new Error('CustomInputGroup.setValues: no items found.');
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
     * ### CustomInputGroup.reset
     *
     * Resets all the CustomInput items and textarea
     *
     * @param {object} options Optional. Options specifying how to set
     *   to reset each item
     *
     * @see CustomInput.reset
     * @see CustomInputGroup.shuffle
     */
    CustomInputGroup.prototype.reset = function(opts) {
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
     * ### CustomInputGroup.shuffle
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
    CustomInputGroup.prototype.shuffle = function(opts) {
        var order, i, len, that, cb, newOrder;
        if (!this.items) return;
        len = this.items.length;
        if (!len) return;
        that = this;
        newOrder = new Array(len);
        // Updates the groupOrder property of each item,
        // and saves the order of items correctly.
        cb = function(el, newPos, oldPos) {
            var i;
            i = el.id.split(that.separator);
            i = that.orientation === 'H' ? i[2] : i[0];
            i = that.itemsMap[i];
            that.items[i].groupOrder = (newPos+1);
            newOrder[newPos] = i;
        };
        order = J.shuffle(this.order);
        if (this.orientation === 'H') {
            J.shuffleElements(this.table, order, cb);
        }
        else {
            // Here we maintain the columns manually. Each TR contains TD
            // belonging to different items, we make sure the order is the
            // same for all TR.
            len = this.trs.length;
            for ( i = -1 ; ++i < len ; ) {
                J.shuffleElements(this.trs[i], order, cb);
                // Call cb only on first iteration.
                cb = undefined;
            }
        }
        this.order = newOrder;
    };

    /**
     * ### CustomInputGroup.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see CustomInput.highlight
     * @see CustomInput.errorBox
     */
    CustomInputGroup.prototype.setError = function(err) {
        this.errorBox.innerHTML = err;
        this.highlight();
    };
    // ## Helper methods.

    /**
     * ### mixinSettings
     *
     * Mix-ins global settings with local settings for specific choice tables
     *
     * @param {CustomInputGroup} that This instance
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
            throw new TypeError('CustomInputGroup.buildTable: item must be ' +
                                'string or object. Found: ' + s);
        }
        s.group = that.id;
        s.groupOrder = i+1;
        s.orientation = that.orientation;
        s.title = false;

        if (that.oninput) s.oninput = that.oninput;

        if ('undefined' === typeof s.requiredChoice && that.requiredChoice) {
            s.requiredChoice = that.requiredChoice;
        }

        if ('undefined' === typeof s.timeFrom) s.timeFrom = that.timeFrom;

        s = J.mixout(s, that.sharedOptions);

        // No reference is stored in node.widgets.
        s.storeRef = false;

        return s;
    }

    /**
     * ### addCustomInput
     *
     * Creates a instance i-th of choice table with relative settings
     *
     * Stores a reference of each input in `itemsById`
     *
     * @param {CustomInputGroup} that This instance
     * @param {HTMLElement} tr A TR element where the custom input is appended
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} ct The requested choice table
     *
     * @see CustomInputGroup.itemsSettings
     * @see CustomInputGroup.itemsById
     * @see mixinSettings
     */
    function addCustomInput(that, tr, i) {
        var ci, s, td, idx;
        idx = that.order[i];
        s = mixinSettings(that, that.itemsSettings[idx], i);
        td = document.createElement('td');
        tr.appendChild(td);
        ci = node.widgets.append('CustomInput', td, s);
        if (that.itemsById[ci.id]) {
            throw new Error('CustomInputGroup.buildTable: an input ' +
                            'with the same id already exists: ' + ci.id);
        }
        that.itemsById[ci.id] = ci;
        that.items[idx] = ci;
        that.itemsMap[ci.id] = idx;

        if (s.required || s.requiredChoice || s.correctChoice) {
            // False is set manually, otherwise undefined.
            if (that.required === false) {
                throw new Error('CustomInputGroup.buildTable: required is ' +
                                'false, but item "' + s.id +
                                '" has required truthy');
            }
            that.required = true;
        }

        return ci;
    }

    /**
     * ### addSummaryInput
     *
     * Creates the last summary input
     *
     * Stores a reference in `summaryInput`
     *
     * @param {CustomInputGroup} that This instance
     * @param {HTMLElement} tr A TR element where the custom input is appended
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} ct The requested choice table
     *
     * @see CustomInputGroup.itemsSettings
     * @see CustomInputGroup.itemsById
     * @see mixinSettings
     */
    function addSummaryInput(that, tr, i) {
        var ci, s, td;
        s = J.mixout({
            id: that.id + '_summary',
            storeRef: false,
            title: false,
            panel: false,
            className: 'custominputgroup-summary',
            disabled: true
        }, that.sharedOptions);
        s = J.mixin(s, that.summaryInput);
        td = document.createElement('td');
        tr.appendChild(td);
        ci = node.widgets.append('CustomInput', td, s);
        that.summaryInput = ci;
        return ci;
    }

    /**
     * ### createTR
     *
     * Creates and append a new TR element
     *
     * If required by current configuration, the `id` attribute is
     * added to the TR in the form of: 'tr' + separator + widget_id
     *
     * @param {CustomInput} that This instance
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

        this.options = o = J.merge(D3ts.defaults, options);
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
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('DebugInfo', DebugInfo);

    // ## Meta-data

    DebugInfo.version = '0.6.2';
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
        var that;
        if ('number' === typeof options.intervalTime) {
            this.intervalTime = options.intervalTime;
        }

        that = this;
        this.on('destroyed', function() {
            clearInterval(that.interval);
            that.interval = null;
            node.silly('DebugInfo destroyed.');
        });
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

})(node);

/**
 * # DebugWall
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where all incoming and outgoing messages are printed
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DebugWall', DebugWall);

    // ## Meta-data

    DebugWall.version = '1.1.0';
    DebugWall.description = 'Intercepts incoming and outgoing messages, and ' +
        'logs and prints them numbered and timestamped. Warning! Modifies ' +
        'core functions, therefore its usage in production is ' +
        'not recommended.';

    DebugWall.title = 'Debug Wall';
    DebugWall.className = 'debugwall';

    // ## Dependencies

    DebugWall.dependencies = {
        JSUS: {}
    };

    /**
     * ## DebugWall constructor
     *
     * Creates a new DebugWall oject
     */
    function DebugWall() {

        /**
         * ### DebugWall.buttonsDiv
         *
         * Div contains controls for the display info inside the wall.
         */
        this.buttonsDiv = null;

        /**
         * ### DebugWall.hidden
         *
         * Keep tracks of what is hidden in the wall
         */
        this.hiddenTypes = {};

        /**
         * ### DebugWall.counterIn
         *
         * Counts number of incoming message printed on wall
         */
        this.counterIn = 0;

        /**
         * ### DebugWall.counterOut
         *
         * Counts number of outgoing message printed on wall
         */
        this.counterOut = 0;

        /**
         * ### DebugWall.counterLog
         *
         * Counts number of log entries printed on wall
         */
        this.counterLog = 0;

        /**
         * ### DebugWall.wall
         *
         * The table element in which to write
         */
        this.wall = null;

        /**
         * ### DebugWall.wallDiv
         *
         * The div element containing the wall (for scrolling)
         */
        this.wallDiv = null;

        /**
         * ### DebugWall.origMsgInCb
         *
         * The original function that receives incoming msgs
         */
        this.origMsgInCb = null;

        /**
         * ### DebugWall.origMsgOutCb
         *
         * The original function that sends msgs
         */
        this.origMsgOutCb = null;

        /**
         * ### DebugWall.origLogCb
         *
         * The original log callback
         */
        this.origLogCb = null;
    }

    // ## DebugWall methods

    /**
     * ### DebugWall.init
     *
     * Initializes the instance
     *
     * @param {object} opts Optional. Configuration options
     *
     *  - msgIn: If FALSE, incoming messages are ignored.
     *  - msgOut: If FALSE, outgoing  messages are ignored.
     *  - log: If FALSE, log  messages are ignored.
     *  - hiddenTypes: An object containing what is currently hidden
     *     in the wall.
     */
    DebugWall.prototype.init = function(opts) {
        var that;
        that = this;
        if (opts.msgIn !== false) {
            this.origMsgInCb = node.socket.onMessage;
            node.socket.onMessage = function(msg) {
                that.write('in', that.makeTextIn(msg));
                that.origMsgInCb.call(node.socket, msg);
            };
        }
        if (opts.msgOut !== false) {
            this.origMsgOutCb = node.socket.send;
            node.socket.send = function(msg) {
                that.write('out', that.makeTextOut(msg));
                that.origMsgOutCb.call(node.socket, msg);
            };
        }
        if (opts.log !== false) {
            this.origLogCb = node.log;
            node.log = function(txt, level, prefix) {
                that.write(level || 'info',
                           that.makeTextLog(txt, level, prefix));
                that.origLogCb.call(node, txt, level, prefix);
            };
        }

        if (opts.hiddenTypes) {
            if ('object' !== typeof opts.hiddenTypes) {
                throw new TypeError('DebugWall.init: hiddenTypes must be ' +
                                    'object. Found: ' + opts.hiddenTypes);
            }
            this.hiddenTypes = opts.hiddenTypes;
        }

        this.on('destroyed', function() {
            if (that.origLogCb) node.log = that.origLogCb;
            if (that.origMsgOutCb) node.socket.send = that.origMsgOutCb;
            if (that.origMsgInCb) node.socket.onMessage = that.origMsgInCb;
        });

    };

    DebugWall.prototype.append = function() {
        var displayIn, displayOut, displayLog, that;
        var btnGroup, cb;

        this.buttonsDiv = W.add('div', this.bodyDiv, {
            className: 'wallbuttonsdiv'
        });

        btnGroup = W.add('div', this.buttonsDiv, {
            className: 'btn-group',
            role: 'group',
            'aria-label': 'Toggle visibility of messages on wall'
        });

        // Incoming.
        W.add('input', btnGroup, {
            id: 'debug-wall-incoming',
            // name: 'debug-wall-check',
            className: 'btn-check',
            autocomplete: "off",
            checked: true,
            type: 'checkbox'
        });
        displayIn = W.add('label', btnGroup, {
            className: "btn btn-outline-primary",
            'for': "debug-wall-incoming",
            innerHTML: 'Incoming'
        });
        // Outgoing.
        W.add('input', btnGroup, {
            id: 'debug-wall-outgoing',
            className: 'btn-check',
            // name: 'debug-wall-check',
            autocomplete: "off",
            checked: true,
            type: 'checkbox'
        });
        displayOut = W.add('label', btnGroup, {
            className: "btn btn-outline-primary",
            'for': "debug-wall-outgoing",
            innerHTML: 'Outgoing'
        });
        // Log.
        W.add('input', btnGroup, {
            id: 'debug-wall-log',
            className: 'btn-check',
            // name: 'debug-wall-check',
            autocomplete: "off",
            checked: true,
            type: 'checkbox'
        });
        displayLog = W.add('label', btnGroup, {
            className: "btn btn-outline-primary",
            'for': "debug-wall-log",
            innerHTML: 'Log'
        });

        that = this;

        W.add('button', this.buttonsDiv, {
            className: "btn btn-outline-danger me-2",
            innerHTML: 'Clear'
        })
        .onclick = function() { that.clear(); };

        this.buttonsDiv.appendChild(btnGroup);

        cb = function(type) {
            var items, i, vis, className;
            className = 'wall_' + type;
            items = that.wall.getElementsByClassName(className);
            if (!items || !items.length) return;
            vis = items[0].style.display === '' ? 'none' : '';
            for (i = 0; i < items.length; i++) {
                items[i].style.display = vis;
            }
            that.hiddenTypes[type] = !!vis;
        };

        displayIn.onclick = function() { cb('in'); };
        displayOut.onclick = function() { cb('out'); };
        displayLog.onclick = function() { cb('log'); };

        this.wallDiv = W.add('div', this.bodyDiv, { className: 'walldiv' });
        this.wall = W.add('table', this.wallDiv);
    };

    /**
     * ### DebugWall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * @param {string} type 'in', 'out', or 'log' (different levels)
     * @param {string} text The text to write
     */
    DebugWall.prototype.shouldHide = function(type) {
        return this.hiddenTypes[type];
    };

    /**
     * ### DebugWall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * @param {string} type 'in', 'out', or 'log' (different levels)
     * @param {string} text The text to write
     */
    DebugWall.prototype.clear = function() {
        this.wall.innerHTML = '';
    };

    /**
     * ### DebugWall.write
     *
     * Writes argument as first entry of this.wall if document is fully loaded
     *
     * @param {string} type 'in', 'out', or 'log' (different levels)
     * @param {string} text The text to write
     */
    DebugWall.prototype.write = function(type, text) {
        var spanContainer, spanDots, spanExtra, counter, className;
        var limit;
        var TR, TDtext;
        if (this.isAppended()) {

            counter = type === 'in' ? ++this.counterIn :
                (type === 'out' ? ++this.counterOut : ++this.counterLog);

            limit = 200;
            className = 'wall_' + type;
            TR = W.add('tr', this.wall, { className: className });
            if (type !== 'in' && type !== 'out') TR.className += ' wall_log';

            if (this.shouldHide(type, text)) TR.style.display = 'none';

            W.add('td', TR, { innerHTML: counter });
            W.add('td', TR, { innerHTML: type });
            W.add('td', TR, { innerHTML: J.getTimeM()});
            TDtext = W.add('td', TR);

            if (text.length > limit) {
                spanContainer = W.add('span', TDtext, {
                    className: className + '_click' ,
                    innerHTML: text.substr(0, limit)
                });
                spanExtra = W.add('span', spanContainer, {
                    className: className + '_extra',
                    innerHTML: text.substr(limit, text.length),
                    id: 'wall_' + type + '_' + counter,
                    style: { display: 'none' }

                });
                spanDots = W.add('span', spanContainer, {
                    className: className + '_dots',
                    innerHTML: ' ...',
                    id: 'wall_' + type + '_' + counter
                });

                spanContainer.onclick = function() {
                    if (spanDots.style.display === 'none') {
                        spanDots.style.display = '';
                        spanExtra.style.display = 'none';
                    }
                    else {
                        spanDots.style.display = 'none';
                        spanExtra.style.display = '';
                    }
                };
            }
            else {
                spanContainer = W.add('span', TDtext, {
                    innerHTML: text
                });
            }
            this.wallDiv.scrollTop = this.wallDiv.scrollHeight;
        }
        else {
            node.warn('Wall not appended, cannot write.');
        }
    };

    DebugWall.prototype.makeTextIn = function(msg) {
        var text, d;
        d = new Date(msg.created);
        text = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() +
            ':' + d.getMilliseconds();
        text += ' | ' + msg.to + ' | ' + msg.target +
            ' | ' + msg.action + ' | ' + msg.text + ' | ' + msg.data;
        return text;
    };


    DebugWall.prototype.makeTextOut = function(msg) {
        var text;
        text = msg.from + ' | ' + msg.target + ' | ' + msg.action + ' | ' +
            msg.text + ' | ' + msg.data;
        return text;
    };

    DebugWall.prototype.makeTextLog = function(text) {
        return text;
    };

})(node);

/**
 * # DisconnectBox
 * Copyright(c) 2019 Stefano Balietti
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

    DisconnectBox.version = '0.4.0';
    DisconnectBox.description = 'Monitors and handles disconnections';

    DisconnectBox.title = false;
    DisconnectBox.panel = false;
    DisconnectBox.className = 'disconnectbox';

    DisconnectBox.texts = {
        leave: 'Leave Task',
        left: 'You Left',
        disconnected: 'Disconnected!',
        connected: 'Connected'
    };

    // ## Dependencies

    DisconnectBox.dependencies = {};

    /**
     * ## DisconnectBox constructor
     *
     */
    function DisconnectBox() {

        // ### DisconnectBox.showStatus
        // If TRUE, it shows current connection status. Default: TRUE
        this.showStatus = null;

        // ### DisconnectBox.showDiscBtn
        // If TRUE, it shows the disconnect button. Default: FALSE
        this.showDiscBtn = null;

        // ### DisconnectBox.statusSpan
        // The SPAN containing the status
        this.statusSpan = null;

        // ### DisconnectBox.disconnectBtn
        // The button for disconnection
        this.disconnectBtn = null;

        // ### DisconnectBox.disconnectBtn
        // TRUE, user pressed the disconnect button
        this.userDiscFlag = null;

        // ### DisconnectBox.ee
        // The event emitter with whom the events are registered
        this.ee = null;

        // ### DisconnectBox.disconnectCb
        // Callback executed when a disconnection is detected
        this.disconnectCb = null;

        // ### DisconnectBox.disconnectCb
        // Callback executed when a connection is detected
        this.connectCb = null;
    }

    // ## DisconnectBox methods
    DisconnectBox.prototype.init = function(opts) {

        if (opts.connectCb) {
            if ('function' !== typeof opts.connectCb) {
                throw new TypeError('DisconnectBox.init: connectCb must be ' +
                                    'function or undefined. Found: ' +
                                    opts.connectCb);
            }
            this.connectCb = opts.connectCb;
        }
        if (opts.disconnectCb) {
            if ('function' !== typeof opts.disconnectCb) {
                throw new TypeError('DisconnectBox.init: disconnectCb must ' +
                                    'be function or undefined. Found: ' +
                                    opts.disconnectCb);
            }
            this.disconnectCb = opts.disconnectCb;
        }

        this.showDiscBtn = !!opts.showDiscBtn;
        this.showStatus = !!opts.showStatus;
    };

    DisconnectBox.prototype.append = function() {
        var that, con;
        that = this;
        con = node.socket.isConnected();
        if (this.showStatus) {
            this.statusSpan = W.add('span', this.bodyDiv);
            this.updateStatus(con ? 'connected' : 'disconnected');
        }
        if (this.showDiscBtn) {
            this.disconnectBtn = W.add('button', this.bodyDiv, {
                innerHTML: this.getText(con ? 'leave' : 'left'),
                className: 'btn',
                style: { 'margin-left': '10px' }
            });
            if (!con) this.disconnectBtn.disabled = true;
            this.disconnectBtn.onclick = function() {
                that.disconnectBtn.disabled = true;
                that.userDiscFlag = true;
                node.socket.disconnect();
            };
        }

    };

    DisconnectBox.prototype.updateStatus = function(status) {
        if (!this.statusSpan) {
            node.warn('DisconnectBox.updateStatus: display disabled.');
            return;
        }
        this.statusSpan.innerHTML = this.getText(status);
        this.statusSpan.className = status === 'disconnected' ?
            'text-danger' : '';
    };

    DisconnectBox.prototype.listeners = function() {
        var that;
        that = this;

        this.ee = node.getCurrentEventEmitter();
        this.ee.on('SOCKET_DISCONNECT', function() {
            if (that.statusSpan) that.updateStatus('disconnected');
            if (that.disconnectBtn) {
                that.disconnectBtn.disabled = true;
                that.disconnectBtn.innerHTML = that.getText('left');
            }
            if (that.disconnectCb) that.disconnectCb(that.userDiscFlag);
        });

        this.ee.on('SOCKET_CONNECT', function() {
            if (that.statusSpan) that.updateStatus('connected');
            if (that.disconnectBtn) {
                that.disconnectBtn.disabled = false;
                that.disconnectBtn.innerHTML = that.getText('leave');
            }
            if (that.connectCb) that.disconnectCb();
            // Reset pressedDisc.
            that.userDiscFlag = false;
        });
    };


})(node);

/**
 * # DoneButton
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('DoneButton', DoneButton);

    // ## Meta-data

    DoneButton.version = '1.1.0';
    DoneButton.description = 'Creates a button that if ' +
        'pressed emits node.done().';

    DoneButton.title = false;
    DoneButton.className = 'donebutton';
    DoneButton.texts.done = 'Done';

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
            if (that.onclick && false === that.onclick()) return;
            if (node.done()) that.disable();
        };

        /**
         * ### DoneButton.onclick
         *
         * A callback executed after the button is clicked
         *
         * If it return FALSE, node.done() is not called.
         */
        this.onclick = null;

        /**
         * ### DoneButton.disableOnDisconnect
         *
         * If TRUE, the button is automatically disableb upon disconnection
         */
        this.disableOnDisconnect = null;

        /**
         * ### DoneButton.delayOnPlaying
         *
         * The number of milliseconds to wait to enable at a new step
         *
         * A small delay prevents accidental double clicking between steps.
         */
        this.delayOnPlaying = 800;
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
     * - onclick: a callback executed when the button is clicked. Default: null
     * - disableOnDisconnect: TRUE to disable upon disconnection. Default: TRUE
     * - delayOnPlaying: number of milliseconds to wait to enable after
     *     the `PLAYING` event is fired (e.g., a new step begins). Default: 800
     *
     * @param {object} opts Optional. Configuration options
     */
    DoneButton.prototype.init = function(opts) {
        var tmp;
        opts = opts || {};

        //Button
        if ('undefined' === typeof opts.id) {
            tmp = DoneButton.className;
        }
        else if ('string' === typeof opts.id) {
            tmp = opts.id;
        }
        else if (false === opts.id) {
            tmp = false;
        }
        else {
            throw new TypeError('DoneButton.init: id must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.id);
        }
        if (tmp) this.button.id = tmp;

        // Button className.
        if ('undefined' === typeof opts.className) {
            tmp  = 'btn btn-lg btn-primary';
        }
        else if (opts.className === false) {
            tmp = '';
        }
        else if ('string' === typeof opts.className) {
            tmp = opts.className;
        }
        else if (J.isArray(opts.className)) {
            tmp = opts.className.join(' ');
        }
        else  {
            throw new TypeError('DoneButton.init: className must ' +
                                'be string, array, or undefined. Found: ' +
                                opts.className);
        }
        this.button.className = tmp;

        // Button text.
        this.button.value = 'string' === typeof opts.text ?
            opts.text : this.getText('done');

        this.disableOnDisconnect =
            'undefined' === typeof opts.disableOnDisconnect ?
            true : !! opts.disableOnDisconnect;

        tmp = opts.delayOnPlaying;
        if ('number' === typeof tmp) {
            this.delayOnPlaying = tmp;
        }
        else if ('undefined' !== typeof tmp) {
            throw new TypeError('DoneButton.init: delayOnPlaying must ' +
                                'be number or undefined. Found: ' + tmp);
        }

        tmp = opts.onclick;
        if (tmp) {
            if ('function' !== typeof tmp) {
                throw new TypeError('DoneButton.init: onclick must function ' +
                                    'or undefined. Found: ' + tmp);
            }
            this.onclick = tmp;
        }
    };

    DoneButton.prototype.append = function() {
        // If added in init, it must stay disabled until the step property
        // of first step is evaluated.
        if (!node.game.isReady()) {
            this.disabled = true;
            this.button.disabled = true;
        }
        this.bodyDiv.appendChild(this.button);
    };

    DoneButton.prototype.listeners = function() {
        var that, disabled;
        that = this;

        // This is normally executed after the PLAYING listener of
        // GameWindow where lockUnlockedInputs takes place.
        // In case of a timeup, the donebutton will be locked and
        // then unlocked by GameWindow, but otherwise it must be
        // done here.
        node.on('PLAYING', function() {
            var prop, step, delay;

            step = node.game.getCurrentGameStage();
            prop = node.game.plot.getProperty(step, 'donebutton');
            if (prop === false || (prop && prop.enableOnPlaying === false)) {
                // It might be disabled already, but we do it again.
                that.disable();
            }
            else {
                if (prop && prop.hasOwnProperty &&
                    prop.hasOwnProperty('delayOnPlaying')) {
                        delay = prop.delayOnPlaying;
                }
                else {
                    delay = that.delayOnPlaying;
                }
                if (delay) {
                    setTimeout(function () {
                        // If not disabled because of a disconnection,
                        // enable it.
                        if (!disabled) that.enable();
                    }, delay);
                }
                else {
                    // It might be enabled already, but we do it again.
                    that.enable();
                }
            }
            if ('string' === typeof prop) that.button.value = prop;
            else if (prop && prop.text) that.button.value = prop.text;
        });

        if (this.disableOnDisconnect) {
            node.on('SOCKET_DISCONNECT', function() {
                if (!that.isDisabled()) {
                    that.disable();
                    disabled = true;
                }
            });

            node.on('SOCKET_CONNECT', function() {
                if (disabled) {
                    if (that.isDisabled()) that.enable();
                    disabled = false;
                }
            });
        }
    };

    /**
     * ### DoneButton.updateText
     *
     * Updates the text on the button, possibly for a given duration only
     *
     * @param {string} text The new text
     * @param {number} duration Optional. The number of milliseconds the new
     *   text is displayed. If undefined, the new text stays indefinitely.
     */
    DoneButton.prototype.updateText = function(text, duration) {
        var oldText, that;
        if (duration) {
            that = this;
            oldText = this.button.value;
            node.timer.setTimeout(function() {
                that.button.value = oldText;
            }, duration);
        }
        this.button.value = text;
    };

    /**
     * ### DoneButton.disable
     *
     * Disables the done button
     */
    DoneButton.prototype.disable = function(opts) {
        if (this.disabled) return;
        this.disabled = true;
        this.button.disabled = true;
        this.emit('disabled', opts);
    };

    /**
     * ### DoneButton.enable
     *
     * Enables the done button
     */
    DoneButton.prototype.enable = function(opts) {
        if (!this.disabled) return;
        this.disabled = false;
        this.button.disabled = false;
        this.emit('enabled', opts);
    };

})(node);

(function(node) {

    node.widgets.register('Dropdown', Dropdown);

    // Meta-data.

    Dropdown.version = '0.1.0';
    Dropdown.description = 'Creates a configurable dropdown menu.';

    Dropdown.texts = {
        // Texts here (more info on this later).
        error: function (w, value) {
            if (value !== null && w.fixedChoice &&
                w.choices.indexOf(value) < 0) {
                return 'No custom values allowed.'
            }
            if (value !== null && w.correctChoice !== null) {
                return 'Not correct, try again.';
            }
            if (value !== null && w.verifyChoice().err) {
                return w.verifyChoice().err;
            }

            return 'Answer required.';
        }
    };

    // Title is displayed in the header.
    Dropdown.title = false;
    // Classname is added to the widgets.
    Dropdown.className = 'dropdown';

    // Constructor taking a configuration parameter.
    // The options object is always existing.
    function Dropdown() {
        var that;
        that = this;

        // You can define widget properties here,
        // but they should get assigned a value in init.

        this.id = null;

        /**
         * ### Dropdown.mainText
         *
         * Main text above the dropdown
         */
        this.mainText = null;

        /**
         * ### Dropdown.labelText
         *
         * A label text for the input
         */
        this.labelText = null;

        /**
         * ### Dropdown.placeHolder
         *
         * A placeHolder text for the input
         */
        this.placeHolder = null;

        /**
         * ### Dropdown.choices
         *
         * The array available choices
         */
        this.choices = null;

        /**
         * ### Dropdown.tag
         *
         * The HTML tag: "datalist" or "select"
         */
        this.tag = null;

        /**
         * ### Dropdown.menu
         *
         * Holder of the HTML element (datalist or select)
         */
        this.menu = null;

        /**
         * ### Dropdown.listener
         *
         * The main listener
         *
         * @see Dropdown.onchange
         */
        this.listener = function (e) {
            var menu, timeout;

            e = e || window.event;
            menu = e.target || e.srcElement;

            that.currentChoice = menu.value;
            if (that.currentChoice.length === 0) that.currentChoice = null;

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            // One more change.
            that.numberOfChanges++;

            // Remove any warning/errors on change.
            if (that.isHighlighted()) that.unhighlight();

            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(function () {
                that.verifyChoice();
                if (that.verifyChoice().err) {
                    that.setError(that.verifyChoice().err)
                }

            }, that.validationSpeed);

            // Call onchange, if any.
            if (that.onchange) {


                that.onchange(that.currentChoice, that);
            }

        };

        /*
         * ### Dropdown.onchange
         *
         * User defined onchange function
         */
        this.onchange = null;

        /**
         * ### Dropdown.timeCurrentChoice
         *
         * Time when the last choice was made
         */
        this.timeCurrentChoice = null;

        /**
         * ### Dropdown.timeFrom
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
         * ### Dropdown.numberOfChanges
         *
         * Total number of changes between different choices
         */
        this.numberOfChanges = 0;

        /**
         * ### Dropdown.currentChoice
         *
         * Choice associated with currently selected cell/s
         *
         * The field is a  number.
         */
        this.currentChoice = null;

        /**
         * ###  Dropdown.shuffleChoices
         *
         * If TRUE, choices are shuffled.
         */
        this.shuffleChoices = null;

        /**
         * ### Dropdown.order
         *
         * The current order of display of choices
         *
         */
        this.order = null;

        /**
         * ### Dropdown.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### Dropdown.correctChoice
         *
         * The correct choice/s
         *
         * The field is an array or number|string.
         *
         */
        this.correctChoice = null;

        /**
         * ### Dropdown.requiredChoice
         *
         * If True, a choice is required.
         */
        this.requiredChoice = null;

        /**
         * ### Dropdown.fixedChoice
         *
         * If True, custom values in menu do not validated.
         */
        this.fixedChoice = null;

        /**
        * ### Dropdown.inputWidth
        *
        * The width of the input form as string (css attribute)
        *
        * Some types preset it automatically
        */
        this.inputWidth = null;

        /**
          * ### CustomInput.userValidation
          *
          * An additional validation executed after the main validation function
          *
          * The function returns an object like:
          *
          * ```javascript
          *  {
          *    value: 'validvalue',
          *    err:   'This error occurred' // If invalid.
          *  }
          * ```
          */
        this.validation = null;

        /**
         * ### Dropdown.validationSpeed
         *
         * How often (in milliseconds) the validation function is called
         *
         * Default: 500
         */
        this.validationSpeed = 500;

    }


    Dropdown.prototype.init = function (options) {
        // Init widget variables, but do not create
        // HTML elements, they should be created in append.

        var tmp;

        if (!this.id) {
            throw new TypeError('Dropdown.init: options.id is missing');
        }

        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('Dropdown.init: options.mainText must ' +
                'be string or undefined. Found: ' +
                options.mainText);
        }

        // Set the labelText, if any.
        if ('string' === typeof options.labelText) {
            this.labelText = options.labelText;
        }
        else if ('undefined' !== typeof options.labelText) {
            throw new TypeError('Dropdown.init: options.labelText must ' +
                'be string or undefined. Found: ' +
                options.labelText);
        }

        // Set the placeHolder text, if any.
        if ('string' === typeof options.placeHolder) {
            this.placeHolder = options.placeHolder;
        }
        else if ('undefined' !== typeof options.placeHolder) {
            throw new TypeError('Dropdown.init: options.placeHolder must ' +
                'be string or undefined. Found: ' +
                options.placeHolder);
        }

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.choices = options.choices;
        }

        // Option requiredChoice, if any.
        if ('boolean' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice;
        }
        else if ('undefined' !== typeof options.requiredChoice) {
            throw new TypeError('Dropdown.init: options.requiredChoice ' +
                'be boolean or undefined. Found: ' +
                options.requiredChoice);
        }

        // Add the correct choices.
        if ('undefined' !== typeof options.correctChoice) {
            if (this.requiredChoice) {
                throw new Error('Dropdown.init: cannot specify both ' +
                    'options requiredChoice and correctChoice');
            }
            if (J.isArray(options.correctChoice) &&
                options.correctChoice.length > options.choices.length) {
                throw new Error('Dropdown.init: options.correctChoice ' +
                    'length cannot exceed options.choices length');
            }
            else {
                this.correctChoice = options.correctChoice;
            }

        }

        // Option fixedChoice, if any.
        if ('boolean' === typeof options.fixedChoice) {
            this.fixedChoice = options.fixedChoice;
        }
        else if ('undefined' !== typeof options.fixedChoice) {
            throw new TypeError('Dropdown.init: options.fixedChoice ' +
                'be boolean or undefined. Found: ' +
                options.fixedChoice);
        }



        if ("undefined" === typeof options.tag ||
            "datalist" === options.tag ||
            "select" === options.tag) {
            this.tag = options.tag;
        }
        else {
            throw new TypeError('Dropdown.init: options.tag must ' +
                'be "datalist" or "select". Found: ' +
                options.tag);
        }

        // Set the main onchange listener, if any.
        if ('function' === typeof options.listener) {
            this.listener = function (e) {
                options.listener.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.listener) {
            throw new TypeError('Dropdown.init: opts.listener must ' +
                'be function or undefined. Found: ' +
                options.listener);
        }

        // Set an additional onchange, if any.
        if ('function' === typeof options.onchange) {
            this.onchange = options.onchange;
        }
        else if ('undefined' !== typeof options.onchange) {
            throw new TypeError('Dropdownn.init: opts.onchange must ' +
                'be function or undefined. Found: ' +
                options.onchange);
        }

        // Set an additional validation, if any.
        if ('function' === typeof options.validation) {
            this.validation = options.validation;
        }
        else if ('undefined' !== typeof options.validation) {
            throw new TypeError('Dropdownn.init: opts.validation must ' +
                'be function or undefined. Found: ' +
                options.validation);
        }


        // Option shuffleChoices, default false.
        if ('undefined' === typeof options.shuffleChoices) tmp = false;
        else tmp = !!options.shuffleChoices;
        this.shuffleChoices = tmp;

        if (options.width) {
            if ('string' !== typeof options.width) {
                throw new TypeError('Dropdownn.init:width must be string or ' +
                    'undefined. Found: ' + options.width);
            }
            this.inputWidth = options.width;
        }

        // Validation Speed
        if ('undefined' !== typeof options.validationSpeed) {

            tmp = J.isInt(options.valiadtionSpeed, 0, undefined, true);
            if (tmp === false) {
                throw new TypeError('Dropdownn.init: validationSpeed must ' +
                    ' a non-negative number or undefined. Found: ' +
                    options.validationSpeed);
            }
            this.validationSpeed = tmp;
        }


    }

    // Implements the Widget.append method.
    Dropdown.prototype.append = function () {

        if (W.gid(this.id)) {
            throw new Error('Dropdown.append: id is not unique: ' + this.id);
        }
        var text = this.text;
        var label = this.label;

        text = W.get('p');
        text.innerHTML = this.mainText;
        text.id = 'p';
        this.bodyDiv.appendChild(text);

        label = W.get('label');
        label.innerHTML = this.labelText
        this.bodyDiv.appendChild(label);

        this.setChoices(this.choices, true);

        this.errorBox = W.append('div', this.bodyDiv, {
            className: 'errbox', id: 'errbox'
        });
    };


    Dropdown.prototype.setChoices = function (choices, append) {
        var tag, option, order, placeHolder;
        var select, datalist, input, create;
        var i, len;

        // TODO validate choices.
        this.choices = choices;

        if (!append) return;

        create = false;
        if (this.menu) this.menu.innerHTML = '';
        else create = true;

        if (create) {
            placeHolder = this.placeHolder;
            tag = this.tag;
            if (tag === "datalist" || "undefined" === typeof tag) {

                datalist = W.get('datalist');
                datalist.id = "dropdown";

                input = W.get('input');
                input.setAttribute('list', datalist.id);
                input.id = this.id;
                input.autocomplete = "off";
                if (placeHolder) { input.placeholder = placeHolder; }
                if (this.inputWidth) input.style.width = this.inputWidth;
                this.bodyDiv.appendChild(input);
                this.bodyDiv.appendChild(datalist);
                this.menu = input;

            }
            else if (tag === "select") {

                select = W.get('select');
                select.id = this.id;
                if (this.inputWidth) select.style.width = this.inputWidth;
                if (placeHolder) {
                    option = W.get('option');
                    option.value = "";
                    option.innerHTML = placeHolder;
                    option.setAttribute("disabled", "");
                    option.setAttribute("selected", "");
                    option.setAttribute("hidden", "");
                    select.appendChild(option);
                }

                this.bodyDiv.appendChild(select);
                this.menu = select;
            }
        }

        len = choices.length;
        order = J.seq(0, len - 1);
        if (this.shuffleChoices) order = J.shuffle(order);

        for (i = 0; i < len; i++) {
            option = W.get('option');
            option.value = choices[order[i]];
            option.innerHTML = choices[order[i]];
            this.menu.appendChild(option);
        }

        this.enable();
    }

    /**
     * ### Dropdown.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * Depending on current settings, there are three modes of verifying
     * choices:
     *
     *    - requiredChoice: either true or false.
     *    - correctChoice:  the choices are compared against correct ones.
     *    - fixedChoice: compares the choice with given choices.
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     */
    Dropdown.prototype.verifyChoice = function () {

        var that = this;
        var correct = this.correctChoice;
        var current = this.currentChoice;
        var res = { value: '' };


        if (this.tag === "select" && this.numberOfChanges === 0) {

            current = this.currentChoice = this.menu.value;

        }

        if (this.requiredChoice) {
            res.value = current !== null;
        }

        // If no correct choice is set return null.
        if ('undefined' === typeof correct) res.value = null;
        if ('string' === typeof correct) {
            res.value = current === correct;
        }
        if ('number' === typeof correct) {
            res.value = current === this.choices[correct];
        }
        if (J.isArray(correct)) {
            var correctOptions = correct.map(function (x) {
                return that.choices[x];
            });
            res.value = correctOptions.indexOf(current) >= 0;
        }

        if (this.fixedChoice) {
            if (this.choices.indexOf(current) < 0) res.value = false;
        }

        if (this.validation) {
            if (undefined === typeof res) {
                throw new TypeError('something');
            }

            this.validation(this.currentChoice, res);
        }

        return res;
    };

    /**
     * ### ChoiceTable.setError
     *
     * Set the error msg inside the errorBox
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see Dropdown.errorBox
     */
    Dropdown.prototype.setError = function (err) {
        // TODO: the errorBox is added only if .append() is called.
        // However, ChoiceTableGroup use the table without calling .append().
        if (this.errorBox) this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
    };

    /**
     * ### Dropdown.highlight
     *
     * Highlights the input
     *
     * @param {string} The style for the table's border.
     *   Default '3px solid red'
     *
     * @see Dropdown.highlighted
     */
    Dropdown.prototype.highlight = function (border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('Dropdown.highlight: border must be ' +
                'string or undefined. Found: ' + border);
        }
        if (this.highlighted) return;
        this.menu.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### Dropdown.unhighlight
     *
     * Removes highlight
     *
     * @see Dropdown.highlighted
     */
    Dropdown.prototype.unhighlight = function () {

        if (this.highlighted !== true) return;
        this.menu.style.border = '';
        this.highlighted = false;
        this.setError();
        this.emit('unhighlighted');
    };

    /**
     * ### Dropdown.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see Dropdown.verifyChoice
     */
    Dropdown.prototype.getValues = function (opts) {
        var obj;
        opts = opts || {};
        var verif = this.verifyChoice().value;

        obj = {
            id: this.id,
            choice: this.fixedChoice ?
                this.choices.indexOf(this.currentChoice) : this.currentChoice,
            time: this.timeCurrentChoice,
            nChanges: this.numberOfChanges
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (this.shuffleChoices) obj.order = this.order;

        // Option getValue backward compatible.
        if (opts.addValue !== false && opts.getValue !== false) {
            obj.value = this.currentChoice;
        }

        if (null !== this.correctChoice || null !== this.requiredChoice ||
            null !== this.fixedChoice) {
            obj.isCorrect = verif;
            if (!obj.isCorrect && opts.highlight) this.highlight();
        }
        if (obj.isCorrect === false) {
            this.setError(this.getText('error', obj.value));
        }
        return obj;
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
    Dropdown.prototype.listeners = function () {
        var that = this;
        node.on('INPUT_DISABLE', function () {
            that.disable();
        });
        node.on('INPUT_ENABLE', function () {
            that.enable();
        });
    };

    /**
     * ### ChoiceTable.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    Dropdown.prototype.disable = function () {
        if (this.disabled === true) return;
        this.disabled = true;
        if (this.menu) {
            this.menu.removeEventListener('change', this.listener);
        }
        this.emit('disabled');
    };

    /**
     * ### ChoiceTable.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    Dropdown.prototype.enable = function () {
        if (this.disabled === false) return;
        if (!this.menu) {
            throw new Error('Dropdown.enable: menu is not defined');
        }
        this.disabled = false;
        this.menu.addEventListener('change', this.listener);
        this.emit('enabled');
    };

})(node);

/**
 * # EmailForm
 * Copyright(c) 2021 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Displays a form to input email
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('EmailForm', EmailForm);

    // ## Meta-data

    EmailForm.version = '0.13.1';
    EmailForm.description = 'Displays a configurable email form.';

    EmailForm.title = false;
    EmailForm.className = 'emailform';

    EmailForm.texts = {
        label: 'Enter your email:',
        errString: 'Not a valid email address, ' +
                   'please correct it and submit it again.',
        sent: 'Sent!'
    };

    /**
     * ## EmailForm constructor
     *
     * @param {object} options configuration option
     */
    function EmailForm(opts) {

        /**
         * ### EmailForm.onsubmit
         *
         * Options passed to `getValues` when the submit button is pressed
         *
         * @see EmailForm.getValues
         */
        if (!opts.onsubmit) {
            this.onsubmit = {
                emailOnly: true,
                send: true,
                updateUI: true
            };
        }
        else if ('object' === typeof opts.onsubmit) {
            this.onsubmit = opts.onsubmit;
        }
        else {
            throw new TypeError('EmailForm constructor: opts.onsubmit ' +
                                'must be object or undefined. Found: ' +
                                opts.onsubmit);
        }

        /**
         * ### EmailForm._email
         *
         * Internal storage of the value of the email
         *
         * This value is used when the form has not been created yet
         *
         * @see EmailForm.createForm
         */
        this._email = opts.email || null;

        /**
         * ### EmailForm.attempts
         *
         * Invalid emails tried
         */
        this.attempts = [];

        /**
         * ### EmailForm.timeInput
         *
         * Time when the email was inserted (first character, last attempt)
         */
        this.timeInput = null;

        /**
         * ### EmailForm.formElement
         *
         * The email's HTML form
         */
        this.formElement = null;

        /**
         * ### EmailForm.inputElement
         *
         * The email's HTML input form
         */
        this.inputElement = null;

        /**
         * ### EmailForm.buttonElement
         *
         * The email's HTML submit button
         */
        this.buttonElement = null;

        /**
         * ### EmailForm.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.setMsg = !!opts.setMsg || false;

        /**
         * ### EmailForm.showSubmitBtn
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.showSubmitBtn = 'undefined' === typeof opts.showSubmitBtn ?
            true : !!opts.showSubmitBtn;
    }

    // ## EmailForm methods

    EmailForm.prototype.createForm = function() {
        var that;
        var formElement, labelElement, inputElement, buttonElement;

        that = this;

        formElement = document.createElement('form');
        formElement.className = 'emailform-form';

        labelElement = document.createElement('label');
        labelElement.innerHTML = this.getText('label');

        inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('placeholder', 'Email');
        inputElement.className = 'emailform-input form-control';

        formElement.appendChild(labelElement);
        formElement.appendChild(inputElement);

        // Store references.
        this.formElement = formElement;
        this.inputElement = inputElement;

        if (this.showSubmitBtn) {
            buttonElement = document.createElement('input');
            buttonElement.setAttribute('type', 'submit');
            buttonElement.setAttribute('value', 'Submit email');
            buttonElement.className = 'btn btn-lg btn-primary ' +
            'emailform-submit';
            formElement.appendChild(buttonElement);

            // Add listeners on input form.
            J.addEvent(formElement, 'submit', function(event) {
                event.preventDefault();
                that.getValues(that.onsubmit);
            }, true);
            J.addEvent(formElement, 'input', function() {
                if (!that.timeInput) that.timeInput = J.now();
                if (that.isHighlighted()) that.unhighlight();
            }, true);

            // Store reference.
            this.buttonElement = buttonElement;
        }

        // If a value was previously set, insert it in the form.
        if (this._email) this.formElement.value = this._email;
        this._email = null;

        return formElement;
    };

    /**
     * ### EmailForm.verifyInput
     *
     * Verify current email, updates interface, and optionally marks attempt
     *
     * @param {boolean} markAttempt Optional. If TRUE, the current email
     *    is added to the attempts array. Default: TRUE
     * @param {boolean} updateUI Optional. If TRUE, the interface is updated.
     *    Default: FALSE
     *
     * @return {boolean} TRUE, if the email is valid
     *
     * @see EmailForm.getValues
     * @see getEmail
     */
    EmailForm.prototype.verifyInput = function(markAttempt, updateUI) {
        var email, res;
        email = getEmail.call(this);
        res = J.isEmail(email);
        if (res && updateUI) {
            if (this.inputElement) this.inputElement.disabled = true;
            if (this.buttonElement) {
                this.buttonElement.disabled = true;
                this.buttonElement.value = this.getText('sent');
            }
        }
        else {
            if (updateUI && this.buttonElement) {
                this.buttonElement.value = this.getText('errString');
            }
            if ('undefined' === typeof markAttempt || markAttempt) {
                this.attempts.push(email);
            }
        }
        return res;
    };

    /**
     * ### EmailForm.append
     *
     * Appends widget to this.bodyDiv
     */
    EmailForm.prototype.append = function() {
        this.createForm();
        this.bodyDiv.appendChild(this.formElement);
    };

    /**
     * ### EmailForm.setValues
     *
     * Set the value of the email input form
     */
    EmailForm.prototype.setValues = function(options) {
        var email;
        options = options || {};
        if (!options.email) email = J.randomEmail();
        else email = options.email;

        if (!this.inputElement) this._email = email;
        else this.inputElement.value = email;

        this.timeInput = J.now();
    };

    /**
     * ### EmailForm.getValues
     *
     * Returns the email and paradata
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - emailOnly:   If TRUE, returns just the email (default: FALSE),
     *   - verify:      If TRUE, check if the email is valid (default: TRUE),
     *   - reset:       If TRUTHY and the email is valid, then it resets
     *       the email value before returning (default: FALSE),
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       (default: TRUE),
     *   - updateUI:    If TRUE, the UI (form, input, button) is updated.
     *                  Default: FALSE.
     *   - highlight:   If TRUE, if email is not the valid, widget is
     *                  is highlighted. Default: (updateUI || FALSE).
     *   - send:        If TRUE, and the email is valid, then it sends
     *                  a data or set msg. Default: FALSE.
     *   - sendAnyway:  If TRUE, it sends a data or set msg regardless of
     *                  the validity of the email. Default: FALSE.
     *   - say:         same as send, but deprecated.
     *   - sayAnyway:   same as sendAnyway, but deprecated
     *
     * @return {string|object} The email, and optional paradata
     *
     * @see EmailForm.sendValues
     * @see EmailForm.verifyInput
     * @see getEmail
     */
    EmailForm.prototype.getValues = function(opts) {
        var email, res;
        opts = opts || {};

        if ('undefined' !== typeof opts.say) {
            console.log('***EmailForm.getValues: option say is deprecated, ' +
                        ' use send.***');
            opts.send = opts.say;
        }
        if ('undefined' !== typeof opts.sayAnyway) {
            console.log('***EmailForm.getValues: option sayAnyway is ' +
                        'deprecated, use sendAnyway.***');
            opts.sendAnyway = opts.sayAnyway;
        }

        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;

        email = getEmail.call(this);

        if (opts.verify !== false) {
            res = this.verifyInput(opts.markAttempt, opts.updateUI);
        }

        // Only value.
        if (!opts.emailOnly) {
            email = {
                time: this.timeInput,
                email: email,
                attempts: this.attempts,
            };
            if (opts.markAttempt) email.isCorrect = res;
        }

        if (res === false) {
            if (opts.updateUI || opts.highlight) this.highlight();
            this.timeInput = null;
        }

        // Send the message.
        if ((opts.send && res) || opts.sendAnyway) {
            this.sendValues({ values: email });
        }

        if (opts.reset) this.reset();

        return email;
    };

    /**
     * ### EmailForm.sendValues
     *
     * Sends a DATA message with label 'email' with current email and paradata
     *
     * @param {object} opts Optional. Options to pass to the `getValues`
     *    method. Additional options:
     *
     *    - values: actual values to send, instead of the return
     *        value of `getValues`
     *    - to: recipient of the message. Default: 'SERVER'
     *
     * @return {string|object} The email, and optional paradata
     *
     * @see EmailForm.getValues
     */
    EmailForm.prototype.sendValues = function(opts) {
        var values;
        opts = opts || { emailOnly: true };
        values = opts.values || this.getValues(opts);
        if (this.setMsg) {
            if ('string' === typeof values) values = { email: values };
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('email', opts.to || 'SERVER', values);
        }
        return values;
    };

    /**
     * ### EmailForm.highlight
     *
     * Highlights the email form
     *
     * @param {string} The style for the form border. Default: '1px solid red'
     *
     * @see EmailForm.highlighted
     */
    EmailForm.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('EmailForm.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.inputElement || this.highlighted === true) return;
        this.inputElement.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### EmailForm.unhighlight
     *
     * Removes highlight from the form
     *
     * @see EmailForm.highlighted
     */
    EmailForm.prototype.unhighlight = function() {
        if (!this.inputElement || this.highlighted !== true) return;
        this.inputElement.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### EmailForm.reset
     *
     * Resets email and collected paradata
     */
    EmailForm.prototype.reset = function() {
        this.attempts = [];
        this.timeInput = null;
        this._email = null;

        if (this.inputElement) this.inputElement.value = '';
        if (this.isHighlighted()) this.unhighlight();
    };

    // ## Helper methods.

    /**
     * ### getEmail
     *
     * Returns the value of the email in form or in `_email`
     *
     * Must be invoked with right context
     *
     * @return {string|null} The value of the email, if any
     */
    function getEmail() {
        return this.inputElement ? this.inputElement.value : this._email;
    }

})(node);

/**
 * # EndScreen
 * Copyright(c) 2021 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates an interface to display final earnings, exit code, etc.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    // Register the widget in the widgets collection.
    node.widgets.register('EndScreen', EndScreen);

    // ## Add Meta-data

    EndScreen.version = '0.7.2';
    EndScreen.description = 'Game end screen. With end game message, ' +
                            'email form, and exit code.';

    EndScreen.title = false;
    EndScreen.className = 'endscreen';

    EndScreen.texts = {
        headerMessage: 'Thank you for participating!',
        message: 'You have now completed this task and your data has ' +
                 'been saved. Please go back to the Amazon Mechanical Turk ' +
                 'web site and submit the HIT.',
        totalWin: 'Your total win:',
        exitCode: 'Your exit code:',
        errTotalWin: 'Error: invalid total win.',
        errExitCode: 'Error: invalid exit code.',
        copyButton: 'Copy',
        exitCopyMsg: 'Exit code copied to clipboard.',
        exitCopyError: 'Failed to copy exit code. Please copy it manually.'
    };

    // ## Dependencies

    // Checked when the widget is created.
    EndScreen.dependencies = {
        Feedback: {},
        EmailForm: {}
    };

    /**
     * ## EndScreen constructor
     *
     * Creates a new instance of EndScreen
     *
     * @param {object} options Configuration options
     *
     * @see EndScreen.init
     */
    function EndScreen(options) {

        /**
         * ### EndScreen.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        this.showEmailForm = true;

        /**
         * ### EndScreen.showFeedbackForm
         *
         * If true, the feedback form is shown
         *
         * Default: true
         */
        this.showFeedbackForm = true;

        /**
         * ### EndScreen.showTotalWin
         *
         * If true, the total win is shown
         *
         * Default: true
         */
         this.showTotalWin = true;

        /**
         * ### EndScreen.showExitCode
         *
         * If true, the exit code is shown
         *
         * Default: true
         */
        this.showExitCode = true;

        /**
         * ### EndScreen.totalWinCurrency
         *
         * The currency displayed after totalWin
         *
         * Default: 'USD'
         *
         * // TODO: deprecate and rename to currency.
         */
         this.totalWinCurrency = 'USD';

        /**
         * ### EndScreen.totalWinCb
         *
         * If defined, the return value is displayed inside the totalWin box
         *
         * Accepts two parameters: a data object (as sent from server), and
         * the reference to the EndScreen.
         */
        this.totalWinCb = null;

        /**
         * ### EndScreen.emailForm
         *
         * EmailForm widget element
         *
         * @see EmailForm
         */
        this.emailForm = null;

        /**
         * ### EndScreen.feedback
         *
         * Feedback widget element
         *
         * @see Feedback
         */
        this.feedback = null;

        /**
         * ### EndScreen.endScreenElement
         *
         * Endscreen HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.endScreenHTML = null;

        /**
         * ### EndScreen.askServer
         *
         * If TRUE, after being appended it sends a 'WIN' message to server
         *
         * Default: FALSE
         */
        this.askServer = options.askServer || false;
    }

    EndScreen.prototype.init = function(options) {

        if (options.email === false) {
            this.showEmailForm = false;
        }
        else if ('boolean' === typeof options.showEmailForm) {
            this.showEmailForm = options.showEmailForm;
        }
        else if ('undefined' !== typeof options.showEmailForm) {
            throw new TypeError('EndScreen.init: ' +
                                'options.showEmailForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showEmailForm);
        }

        if (options.feedback === false) {
            this.showFeedbackForm = false;
        }
        else if ('boolean' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = options.showFeedbackForm;
        }
        else if ('undefined' !== typeof options.showFeedbackForm) {
            throw new TypeError('EndScreen.init: ' +
                                'options.showFeedbackForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showFeedbackForm);
        }

        if (options.totalWin === false) {
            this.showTotalWin = false;
        }
        else if ('boolean' === typeof options.showTotalWin) {
            this.showTotalWin = options.showTotalWin;
        }
        else if ('undefined' !== typeof options.showTotalWin) {
            throw new TypeError('EndScreen.init: ' +
                                'options.showTotalWin ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showTotalWin);
        }

        if (options.exitCode === false) {
            options.showExitCode !== false
        }
        else if ('boolean' === typeof options.showExitCode) {
            this.showExitCode = options.showExitCode;
        }
        else if ('undefined' !== typeof options.showExitCode) {
            throw new TypeError('EndScreen.init: ' +
                                'options.showExitCode ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showExitCode);
        }

        if ('string' === typeof options.totalWinCurrency &&
                 options.totalWinCurrency.trim() !== '') {

            this.totalWinCurrency = options.totalWinCurrency;
        }
        else if ('undefined' !== typeof options.totalWinCurrency) {
            throw new TypeError('EndScreen.init: ' +
                                'options.totalWinCurrency must be undefined ' +
                                'or a non-empty string. Found: ' +
                                options.totalWinCurrency);
        }

        if (options.totalWinCb) {
            if ('function' === typeof options.totalWinCb) {
                this.totalWinCb = options.totalWinCb;
            }
            else {
                throw new TypeError('EndScreen.init: ' +
                                    'options.totalWinCb ' +
                                    'must be function or undefined. ' +
                                    'Found: ' + options.totalWinCb);
            }
        }

        if (this.showEmailForm && !this.emailForm) {
            // TODO: nested properties are overwitten fully. Update.
            this.emailForm = node.widgets.get('EmailForm', J.mixin({
                onsubmit: {
                    send: true,
                    emailOnly: true,
                    updateUI: true
                },
                storeRef: false,
                texts: {
                    label: 'If you would like to be contacted for future ' +
                        'studies, please enter your email (optional):',
                    errString: 'Please enter a valid email and retry'
                },
                setMsg: true // Sends a set message for logic's db.
            }, options.email));
        }

        if (this.showFeedbackForm) {
            this.feedback = node.widgets.get('Feedback', J.mixin(
                { storeRef: false, minChars: 50, setMsg: true },
                options.feedback));
        }
    };

    // Implements the Widget.append method.
    EndScreen.prototype.append = function() {
        this.endScreenHTML = this.makeEndScreen();
        this.bodyDiv.appendChild(this.endScreenHTML);
        if (this.askServer) setTimeout(function() { node.say('WIN'); });
    };

    /**
     * ### EndScreen.makeEndScreen
     *
     * Builds up the end screen (HTML + nested widgets)
     */
    EndScreen.prototype.makeEndScreen = function() {
        var endScreenElement;
        var headerElement, messageElement;
        var totalWinElement, totalWinParaElement, totalWinInputElement;
        var exitCodeElement, exitCodeParaElement, exitCodeInputElement;
        var exitCodeBtn, exitCodeGroup;
        var that = this;

        endScreenElement = document.createElement('div');
        endScreenElement.className = 'endscreen';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.getText('headerMessage');
        endScreenElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = this.getText('message');
        endScreenElement.appendChild(messageElement);

        if (this.showTotalWin) {
            totalWinElement = document.createElement('div');

            totalWinParaElement = document.createElement('p');
            totalWinParaElement.innerHTML = '<strong>' +
                this.getText('totalWin') +
                '</strong>';

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
            exitCodeElement.className = 'input-group';

            exitCodeParaElement = document.createElement('span');
            exitCodeParaElement.innerHTML = '<strong>' +
                this.getText('exitCode') + '</strong>';

            exitCodeInputElement = document.createElement('input');
            exitCodeInputElement.id = 'exit_code';
            exitCodeInputElement.className = 'endscreen-exit-code ' +
                                             'form-control';
            exitCodeInputElement.setAttribute('disabled', 'true');

            exitCodeGroup = document.createElement('span');
            exitCodeGroup.className = 'input-group-btn';

            exitCodeBtn = document.createElement('button');
            exitCodeBtn.className = 'btn btn-default endscreen-copy-btn';
            exitCodeBtn.innerHTML = this.getText('copyButton');
            exitCodeBtn.type = 'button';
            exitCodeBtn.onclick = function() {
                that.copy(exitCodeInputElement.value);
            };

            exitCodeGroup.appendChild(exitCodeBtn);
            endScreenElement.appendChild(exitCodeParaElement);
            exitCodeElement.appendChild(exitCodeGroup);
            exitCodeElement.appendChild(exitCodeInputElement);

            endScreenElement.appendChild(exitCodeElement);
            this.exitCodeInputElement = exitCodeInputElement;
        }

        if (this.showEmailForm) {
            node.widgets.append(this.emailForm, endScreenElement, {
                title: false,
                panel: false
            });
        }

        if (this.showFeedbackForm) {
            node.widgets.append(this.feedback, endScreenElement, {
                title: false,
                panel: false
            });
        }

        return endScreenElement;
    };

    // Implements the Widget.listeners method.
    EndScreen.prototype.listeners = function() {
        var that;
        that = this;
        node.on.data('WIN', function(message) {
            that.updateDisplay(message.data);
        });
    };

    EndScreen.prototype.copy = function(text) {
        var inp = document.createElement('input');
        try {
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
            alert(this.getText('exitCopyMsg'));
        } catch (err) {
            alert(this.getText('exitCopyError'));
        }
    };

    /**
     * ### EndScreen.updateDisplay
     *
     * Updates the display
     *
     * @param {object} data An object containing the info to update. Format:
     *    - total: The total won.
     *    - exit: An exit code.
     */
    EndScreen.prototype.updateDisplay = function(data) {
        var preWin, totalWin, totalRaw, exitCode;
        var totalHTML, exitCodeHTML, ex, err;

        if (this.totalWinCb) {
            totalWin = this.totalWinCb(data, this);
        }
        else {
            if ('undefined' === typeof data.total &&
                'undefined' === typeof data.totalRaw) {

                throw new Error('EndScreen.updateDisplay: data.total and ' +
                                'data.totalRaw cannot be both undefined.');
            }

            if ('undefined' !== typeof data.total) {
                totalWin = J.isNumber(data.total);
                if (totalWin === false) {
                    node.err('EndScreen.updateDisplay: invalid data.total: ' +
                             data.total);
                    totalWin = this.getText('errTotalWin');
                    err = true;
                }
            }

            preWin = '';

            if ('undefined' !== typeof data.basePay) {
                preWin = data.basePay;

            }

            if ('undefined' !== typeof data.bonus &&
                data.showBonus !== false) {

                if (preWin !== '') preWin += ' + ';
                preWin += data.bonus;
            }

            if (data.partials) {
                if (!J.isArray(data.partials)) {
                    node.err('EndScreen error, invalid partials win: ' +
                             data.partials);
                }
                else {
                    // If there is a basePay we already have a preWin.
                    if (preWin !== '') preWin += ' + ';
                    preWin += data.partials.join(' + ');
                }
            }

            if ('undefined' !== typeof data.totalRaw) {
                if (preWin) preWin += ' = ';
                else preWin = '';
                preWin += data.totalRaw;

                // Get Exchange Rate.
                ex = 'undefined' !== typeof data.exchangeRate ?
                    data.exchangeRate : node.game.settings.EXCHANGE_RATE;

                // If we have an exchange rate, check if we have a totalRaw.
                if ('undefined' !== typeof ex) preWin += '*' + ex;

                // Need to compute total manually.
                if ('undefined' === typeof totalWin) {
                    totalRaw = J.isNumber(data.totalRaw, 0);
                    totalWin = parseFloat(ex*totalRaw).toFixed(2);
                    totalWin = J.isNumber(totalWin, 0);
                    if (totalWin === false) {
                        node.err('EndScreen.updateDisplay: invalid : ' +
                                 'totalWin calculation from totalRaw.');
                        totalWin = this.getText('errTotalWin');
                        err = true;
                    }
                }
            }

            if (!err) {
                if (totalWin !== preWin & preWin !== '') {
                    totalWin = preWin + ' = ' + totalWin;
                }
                totalWin += ' ' + this.totalWinCurrency;
            }
        }

        exitCode = data.exit;
        if ('string' !== typeof exitCode) {
            node.err('EndScreen error, invalid exit code: ' + exitCode);
            exitCode = this.getText('errExitCode');
        }

        totalHTML = this.totalWinInputElement;
        exitCodeHTML = this.exitCodeInputElement;

        if (totalHTML && this.showTotalWin) {
            totalHTML.value = totalWin;
        }

        if (exitCodeHTML && this.showExitCode) {
            exitCodeHTML.value = exitCode;
        }
    };

})(node);

/**
 * # Feedback
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server
 *
 * www.nodegame.org
 *
 * TODO: rename css class feedback-char-count
 * TODO: words and chars count without contraints, just show.
 * TODO: shows all constraints in gray before the textarea.
 */
(function(node) {

    "use strict";

    node.widgets.register('Feedback', Feedback);

    // ## Meta-data

    Feedback.version = '1.6.0';
    Feedback.description = 'Displays a configurable feedback form';

    Feedback.title = 'Feedback';
    Feedback.className = 'feedback';

    Feedback.texts = {
        autoHint: function(w) {
            var res, res2;
            if (w.minChars && w.maxChars) {
                res = 'between ' + w.minChars + ' and ' + w.maxChars +
                    ' characters';
            }
            else if (w.minChars) {
                res = 'at least ' + w.minChars + ' character';
                if (w.minChars > 1) res += 's';
            }
            else if (w.maxChars) {
                res = 'at most ' +  w.maxChars + ' character';
                if (w.maxChars > 1) res += 's';
            }
            if (w.minWords && w.maxWords) {
                res2 = 'beetween ' + w.minWords + ' and ' + w.maxWords +
                    ' words';
            }
            else if (w.minWords) {
                res2 = 'at least ' + w.minWords + ' word';
                if (w.minWords > 1) res2 += 's';
            }
            else if (w.maxWords) {
                res2 = 'at most ' +  w.maxWords + ' word';
                if (w.maxWords > 1) res2 += 's';
            }
            if (res) {
                res = '(' + res;
                if (res2) res +=  ', and ' + res2;
                return res + ')';
            }
            else if (res2) {
                return '(' + res2 + ')';
            }
            return false;
        },
        submit: 'Submit feedback',
        label: 'Any feedback? Let us know here:',
        sent: 'Sent!',
        counter: function(w, param) {
            var res;
            res = param.chars ? ' character' : ' word';
            if (param.len !== 1) res += 's';
            if (param.needed) res += ' needed';
            else if (param.over) res += ' over';
            else if (!param.justcount) res += ' remaining';
            return res;
        }
    };

    // Colors for missing, excess or ok.
    var colNeeded, colOver, colRemain;
    colNeeded = '#a32020'; // #f2dede';
    colOver = '#a32020'; // #f2dede';
    colRemain = '#78b360'; // '#dff0d8';

    // ## Dependencies

    Feedback.dependencies = {
        JSUS: {}
    };

    /**
     * ## Feedback constructor
     *
     * `Feedback` sends a feedback message to the server
     *
     * @param {object} options Optional. Configuration options
     */
    function Feedback(options) {
        var tmp;

        if ('undefined' !== typeof options.maxLength) {
            console.log('***Feedback constructor: maxLength is deprecated, ' +
                        'use maxChars instead***');
            options.maxChars = options.maxLength;
        }
        if ('undefined' !== typeof options.minLength) {
            console.log('***Feedback constructor: minLength is deprecated, ' +
                        'use minChars instead***');
            options.minChars = options.minLength;
        }

        /**
         * ### Feedback.mainText
         *
         * The main text introducing the choices
         *
         * @see Feedback.spanMainText
         */
        this.mainText = null;

        /**
         * ### Feedback.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

        /**
         * ### Feedback.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### Feedback.maxChars
         *
         * The maximum character length for feedback to be submitted
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxChars) {
            this.maxChars = 0;
        }
        else {
            tmp = J.isInt(options.maxChars, 0);
            if (tmp !== false) {
                this.maxChars = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: maxChars ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.maxChars);
            }
        }

        /**
         * ### Feedback.minChars
         *
         * The minimum character length for feedback to be submitted
         *
         * If minChars = 0, then there is no minimum length checked.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.minChars) {
            this.minChars = 0;
        }
        else {
            tmp = J.isInt(options.minChars, 0, undefined, true);
            if (tmp !== false) {
                if (this.maxChars && tmp > this.maxChars) {
                    throw new TypeError('Feedback constructor: minChars ' +
                                        'cannot be greater than maxChars. ' +
                                        'Found: ' + tmp + ' > ' +
                                        this.maxChars);
                }
                this.minChars = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: minChars ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.minChars);
            }
        }

        /**
         * ### Feedback.maxWords
         *
         * The maximum number of words for feedback to be submitted
         *
         * Set to 0 for no checks.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxWords) {
            this.maxWords = 0;
        }
        else {
            tmp = J.isInt(options.maxWords, 0, undefined, true);
            if (tmp !== false) {
                this.maxWords = options.maxWords;
            }
            else {
                throw new TypeError('Feedback constructor: maxWords ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.maxWords);
            }
        }

        /**
         * ### Feedback.minWords
         *
         * The minimum number of words for feedback to be submitted
         *
         * If minWords = 0, then there is no minimum checked.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.minWords) {
            this.minWords = 0;
        }
        else {
            tmp = J.isInt(options.minWords, 0, undefined, true);
            if (tmp  !== false) {
                this.minWords = options.minWords;

                // Checking if words and characters limit are compatible.
                if (this.maxChars) {
                    tmp = (this.maxChars+1)/2;
                    if (this.minWords > tmp) {

                        throw new TypeError('Feedback constructor: minWords ' +
                                            'cannot be larger than ' +
                                            '(maxChars+1)/2. Found: ' +
                                            this.minWords + ' > ' + tmp);
                    }
                }
            }
            else {
                throw new TypeError('Feedback constructor: minWords ' +
                                    'must be an integer >= 0 or undefined. ' +
                                    'Found: ' + options.minWords);
            }
        }

        // Extra checks.
        if (this.maxWords) {
            if (this.maxChars && this.maxChars < this.maxWords) {
                throw new TypeError('Feedback constructor: maxChars ' +
                                    'cannot be smaller than maxWords. ' +
                                    'Found: ' + this.maxChars + ' > ' +
                                    this.maxWords);
            }
            if (this.minChars > this.maxWords) {
                throw new TypeError('Feedback constructor: minChars ' +
                                    'cannot be greater than maxWords. ' +
                                    'Found: ' + this.minChars + ' > ' +
                                    this.maxWords);
            }
        }

        /**
         * ### Feedback.rows
         *
         * The number of initial rows of the texarea
         *
         * Default: 3
         */
        if ('undefined' === typeof options.rows) {
            this.rows = 3;
        }
        else if (J.isInt(options.rows, 0) !== false) {
            this.rows = options.rows;
        }
        else {
            throw new TypeError('Feedback constructor: rows ' +
                                'must be an integer > 0 or undefined. ' +
                                'Found: ' + options.rows);
        }

        /**
         * ### Feedback.maxAttemptLength
         *
         * The maximum character length for an attempt to submit feedback
         *
         * Attempts are stored in the attempts array. You can store attempts
         * longer than valid feedbacks.
         *
         * Set to 0 for no limit.
         *
         * Default: 0
         */
        if ('undefined' === typeof options.maxAttemptLength) {
            this.maxAttemptLength = 0;
        }
        else {
            tmp = J.isNumber(options.maxAttemptLength, 0);
            if (tmp !== false) {
                this.maxAttemptLength = tmp;
            }
            else {
                throw new TypeError('Feedback constructor: ' +
                                'options.maxAttemptLength must be a number ' +
                                '> 0 or undefined. Found: ' +
                                options.maxAttemptLength);
            }
        }

        /**
         * ### Feedback.showSubmit
         *
         * If TRUE, the submit button is shown
         *
         * Default: true
         *
         * @see Feedback.submitButton
         */
        this.showSubmit = 'undefined' === typeof options.showSubmit ?
            true : !!options.showSubmit;

        /**
         * ### Feedback.onsubmit
         *
         * Options passed to `getValues` when the submit button is pressed
         *
         * @see Feedback.getValues
         */
        if (!options.onsubmit) {
            this.onsubmit = { feedbackOnly: true, send: true, updateUI: true };
        }
        else if ('object' === typeof options.onsubmit) {
            this.onsubmit = options.onsubmit;
        }
        else {
            throw new TypeError('Feedback constructor: onsubmit ' +
                                'must be string or object. Found: ' +
                                options.onsubmit);
        }

        /**
         * ### Feedback._feedback
         *
         * Internal storage of the value of the feedback
         *
         * This value is used when the form has not been created yet
         */
        this._feedback = options.feedback || null;

        /**
         * ### Feedback.attempts
         *
         * Invalid feedbacks tried
         */
        this.attempts = [];

        /**
         * ### Feedback.timeInputBegin
         *
         * Time when feedback was inserted (first character, last attempt)
         */
        this.timeInputBegin = null;

        /**
         * ### Feedback.feedbackForm
         *
         * The HTML form element containing the textarea
         */
        this.feedbackForm = null;

        /**
         * ### Feedback.textareaElement
         *
         * The HTML textarea element containing the feedback
         */
        this.textareaElement = null;

        /**
         * ### Feedback.charCounter
         *
         * The HTML span element containing the characters count
         */
        this.charCounter = null;

        /**
         * ### Feedback.wordCounter
         *
         * The HTML span element containing the words count
         */
        this.wordCounter = null;

        /**
         * ### Feedback.submitButton
         *
         * The HTML submit button
         */
        this.submitButton = null;

        /**
         * ### Feedback.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.setMsg = !!options.setMsg || false;

    }

    // ## Feedback methods

    // TODO: move all initialization here from constructor.
    Feedback.prototype.init = function(options) {
        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' === typeof options.mainText) {
            this.mainText = this.getText('label');
        }
        else {
            throw new TypeError('Feedback.init: options.mainText must ' +
                                'be string or undefined. Found: ' +
                                options.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof options.hint || false === options.hint) {
            this.hint = options.hint;
        }
        else if ('undefined' !== typeof options.hint) {
            throw new TypeError('Feedback.init: options.hint must ' +
                                'be a string, false, or undefined. Found: ' +
                                options.hint);
        }
        else {
            // Returns undefined if there are no constraints.
            this.hint = this.getText('autoHint');
        }
    };

    /**
     * ### Feedback.verifyFeedback
     *
     * Verify feedback and optionally marks attempt and updates interface
     *
     * @param {boolean} markAttempt Optional. If TRUE, the current feedback
     *    is added to the attempts array (if too long, may be truncateed).
     *    Default: TRUE
     * @param {boolean} updateUI Optional. If TRUE, the interface is updated.
     *    Default: FALSE
     *
     * @return {boolean} TRUE, if the feedback is valid
     *
     * @see Feedback.getValues
     * @see Feedback.maxAttemptLength
     * @see getFeedback
     */
    Feedback.prototype.verifyFeedback = function(markAttempt, updateUI) {
        var feedback, length,  res;
        var submitButton, charCounter, wordCounter, tmp;
        var updateCharCount, updateCharColor, updateWordCount, updateWordColor;

        feedback = getFeedback.call(this);
        length = feedback ? feedback.length : 0;

        submitButton = this.submitButton;
        charCounter = this.charCounter;
        wordCounter = this.wordCounter;

        res = true;

        if (length < this.minChars) {
            res = false;
            tmp = this.minChars - length;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                needed: true,
                len: tmp
            });
            updateCharColor = colNeeded;
        }
        else if (this.maxChars && length > this.maxChars) {
            res = false;
            tmp = length - this.maxChars;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                over: true,
                len: tmp
            });
            updateCharColor = colOver;
        }
        else {
            tmp = this.maxChars ? this.maxChars - length : length;
            updateCharCount = tmp + this.getText('counter', {
                chars: true,
                len: tmp,
                justcount: !this.maxChars
            });
            updateCharColor = colRemain;
        }

        if (wordCounter) {
            // kudos: https://css-tricks.com/build-word-counter-app/
            // word count using \w metacharacter -
            // replacing this with .* to match anything between word
            // boundaries since it was not taking 'a' as a word.
            // this is a masterstroke - to count words with any number
            // of hyphens as one word
            // [-?(\w+)?]+ looks for hyphen and a word (we make
            // both optional with ?). + at the end makes it a repeated pattern
            // \b is word boundary metacharacter
            tmp = feedback ? feedback.match(/\b[-?(\w+)?]+\b/gi) : 0;
            length = tmp ? tmp.length : 0;
            if (length < this.minWords) {
                res = false;
                tmp = tmp = this.minWords - length;
                updateWordCount = tmp + this.getText('counter', {
                    needed: true,
                    len: tmp
                });
                updateWordColor = colNeeded;
            }
            else if (this.maxWords && length > this.maxWords) {
                res = false;
                tmp = length - this.maxWords;
                updateWordCount = tmp + this.getText('counter', {
                    over: true,
                    len: tmp
                });
                updateWordColor = colOver;
            }
            else {
                tmp = this.maxWords ? this.maxWords - length : length;
                updateWordCount = tmp + this.getText('counter', {
                    len: tmp,
                    justcount: !this.maxWords
                });
                updateWordColor = colRemain;
            }
        }

        if (updateUI) {
            if (submitButton) submitButton.disabled = !res;
            if (charCounter) {
                charCounter.style.backgroundColor = updateCharColor;
                charCounter.innerHTML = updateCharCount;
            }
            if (wordCounter) {
                wordCounter.style.backgroundColor = updateWordColor;
                wordCounter.innerHTML = updateWordCount;
            }
        }

        if (!res && ('undefined' === typeof markAttempt || markAttempt)) {
            if (this.maxAttemptLength && length > this.maxAttemptLength) {
                feedback = feedback.substr(0, this.maxAttemptLength);
            }
            this.attempts.push(feedback);
        }
        return res;
    };

    /**
     * ### Feedback.append
     *
     * Appends widget to this.bodyDiv
     */
    Feedback.prototype.append = function() {
        var that;
        that = this;

        // this.feedbackForm = W.get('div', { className: 'feedback' });

        this.feedbackForm = W.append('form', this.bodyDiv, {
            className: 'feedback-form'
        });

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.feedbackForm, {
                className: 'feedback-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.feedbackForm, {
                className: 'feedback-hint',
                innerHTML: this.hint
            });
        }

        this.textareaElement = W.append('textarea', this.feedbackForm, {
            className: 'form-control feedback-textarea',
            type: 'text',
            rows: this.rows
        });

        if (this.showSubmit) {
            this.submitButton = W.append('input', this.feedbackForm, {
                className: 'btn btn-lg btn-primary',
                type: 'submit',
                value: this.getText('submit')
            });

            // Add listeners.
            J.addEvent(this.feedbackForm, 'submit', function(event) {
                event.preventDefault();
                that.getValues(that.onsubmit);
            });
        }

        this.showCounters();

        J.addEvent(this.feedbackForm, 'input', function() {
            if (that.isHighlighted()) that.unhighlight();
            that.verifyFeedback(false, true);
        });
        J.addEvent(this.feedbackForm, 'click', function() {
            if (that.isHighlighted()) that.unhighlight();
        });

        // Check it once at the beginning to initialize counter.
        this.verifyFeedback(false, true);
    };

    /**
     * ### Feedback.setValues
     *
     * Set the value of the feedback
     *
     * @param {object} options Conf options. Values:
     *
     *   - feedback: a string containing the desired feedback.
     *               If not set, a random string will be set.
     *   - verify: if TRUE, the method verifyFeedback is called
     *             afterwards, updating the UI. Default: TRUE
     *   - markAttempt: if TRUE, the verify attempt is added. Default: TRUE
     */
    Feedback.prototype.setValues = function(options) {
        var feedback, maxChars, minChars, nWords, i;
        options = options || {};
        if (!options.feedback) {
            minChars = this.minChars || 0;
            if (this.maxChars) maxChars = this.maxChars;
            else if (this.maxWords) maxChars = this.maxWords * 4;
            else if (minChars) maxChars = minChars + 80;
            else maxChars = 80;

            feedback = J.randomString(J.randomInt(minChars, maxChars), 'aA_1');
            if (this.minWords) {
                nWords = this.minWords - feedback.split(' ').length;
                if (nWords > 0) {
                    for (i = 0; i < nWords ; i++) {
                        feedback += ' ' + i;
                    }
                }
            }
        }
        else {
            feedback = options.feedback;
        }

        if (!this.textareaElement) this._feedback = feedback;
        else this.textareaElement.value = feedback;

        this.timeInputBegin = J.now();

        if (options.verify !== false) {
            this.verifyFeedback(options.markAttempt, true);
        }
    };

    /**
     * ### Feedback.getValues
     *
     * Returns the feedback and paradata
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - feedbackOnly:If TRUE, returns just the feedback (default: FALSE),
     *   - keepBreaks:  If TRUE, returns a value where all line breaks are
     *                  substituted with HTML <br /> tags (default: FALSE)
     *   - verify:      If TRUE, check if the feedback is valid (default: TRUE),
     *   - reset:       If TRUTHY and the feedback is valid, then it resets
     *       the feedback value before returning (default: FALSE),
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       (default: TRUE),
     *   - updateUI:    If TRUE, the UI (form, input, button) is updated.
     *                  Default: FALSE.
     *   - highlight:   If TRUE, if feedback is not the valid, widget is
     *                  is highlighted. Default: (updateUI || FALSE).
     *   - send:        If TRUE, and the email is valid, then it sends
     *                  a data or set msg. Default: FALSE.
     *   - sendAnyway:  If TRUE, it sends a data or set msg regardless of
     *                  the validity of the email. Default: FALSE.
     *   - say:         same as send, but deprecated.
     *   - sayAnyway:   same as sendAnyway, but deprecated
     *
     * @return {string|object} The feedback, and optional paradata
     *
     * @see Feedback.sendValues
     * @see Feedback.verifyFeedback
     * @see getFeedback
     */
    Feedback.prototype.getValues = function(opts) {
        var feedback, res;

        opts = opts || {};

        if ('undefined' !== typeof opts.say) {
            console.log('***EmailForm.getValues: option say is deprecated, ' +
                        ' use send.***');
            opts.send = opts.say;
        }
        if ('undefined' !== typeof opts.sayAnyway) {
            console.log('***EmailForm.getValues: option sayAnyway is ' +
                        'deprecated, use sendAnyway.***');
            opts.sendAnyway = opts.sayAnyway;
        }

        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;

        feedback = getFeedback.call(this);

        if (opts.keepBreaks) feedback = feedback.replace(/\n\r?/g, '<br />');

        if (opts.verify !== false) res = this.verifyFeedback(opts.markAttempt,
                                                             opts.updateUI);

        if (res === false &&
            (opts.updateUI || opts.highlight)) this.highlight();

        // Only value.
        if (!opts.feedbackOnly) {
            feedback = {
                timeBegin: this.timeInputBegin,
                feedback: feedback,
                attempts: this.attempts,
                valid: res
            };
            if (opts.markAttempt) feedback.isCorrect = res;
        }

        // Send the message.
        if (feedback !== '' && ((opts.send && res) || opts.sendAnyway)) {
            this.sendValues({ values: feedback });
            if (opts.updateUI) {
                this.submitButton.setAttribute('value', this.getText('sent'));
                this.submitButton.disabled = true;
                this.textareaElement.disabled = true;
            }
        }

        if (opts.reset) this.reset();

        return feedback;
    };

    /**
     * ### Feedback.sendValues
     *
     * Sends a DATA message with label 'feedback' with feedback and paradata
     *
     * @param {object} opts Optional. Options to pass to the `getValues`
     *    method. Additional options:
     *
     *    - values: actual values to send, instead of the return
     *        value of `getValues`
     *    - to: recipient of the message. Default: 'SERVER'
     *
     * @return {string|object} The feedback, and optional paradata
     *
     * @see Feedback.getValues
     */
    Feedback.prototype.sendValues = function(opts) {
        var values;
        opts = opts || { feedbackOnly: true };
        values = opts.values || this.getValues(opts);
        if (this.setMsg) {
            if ('string' === typeof values) values = { feedback: values };
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('feedback', opts.to || 'SERVER', values);
        }
        return values;
    };

    /**
     * ### Feedback.highlight
     *
     * Highlights the feedback form
     *
     * @param {string} The style for the form border. Default: '1px solid red'
     *
     * @see Feedback.highlighted
     */
    Feedback.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('Feedback.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.isAppended() || this.highlighted === true) return;
        this.textareaElement.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### Feedback.unhighlight
     *
     * Removes highlight from the form
     *
     * @see Feedback.highlighted
     */
    Feedback.prototype.unhighlight = function() {
        if (!this.isAppended() || this.highlighted !== true) return;
        this.textareaElement.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### Feedback.reset
     *
     * Resets feedback and collected paradata
     */
    Feedback.prototype.reset = function() {
        this.attempts = [];
        this.timeInputBegin = null;
        this._feedback = null;

        if (this.textareaElement) this.textareaElement.value = '';
        if (this.isHighlighted()) this.unhighlight();
    };

    /**
     * ### Feedback.disable
     *
     * Disables texarea and submit button (if present)
     */
    Feedback.prototype.disable = function() {
        // TODO: This gets off when WaitScreen locks all inputs.
        // if (this.disabled === true) return;
        if (!this.textareaElement || this.textareaElement.disabled) return;
        this.disabled = true;
        if (this.submitElement) this.submitElement.disabled = true;
        this.textareaElement.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### Feedback.enable
     *
     * Enables texarea and submit button (if present)
     *
     */
    Feedback.prototype.enable = function() {
        // TODO: This gets off when WaitScreen locks all inputs.
        // if (this.disabled === false || !this.textareaElement) return;
        if (!this.textareaElement || !this.textareaElement.disabled) return;
        this.disabled = false;
        if (this.submitElement) this.submitElement.disabled = false;
        this.textareaElement.disabled = false;
        this.emit('enabled');
    };

    /**
     * ### Feedback.showCounters
     *
     * Shows the character counter
     *
     * If not existing before, it creates it.
     *
     * @see Feedback.charCounter
     */
    Feedback.prototype.showCounters = function() {
        if (!this.charCounter) {
            if (this.minChars || this.maxChars) {
                this.charCounter = W.append('span', this.feedbackForm, {
                    className: 'feedback-char-count badge',
                    innerHTML: this.maxChars
                });
            }
        }
        else {
            this.charCounter.style.display = '';
        }
        if (!this.wordCounter) {
            if (this.minWords || this.maxWords) {
                this.wordCounter = W.append('span', this.feedbackForm, {
                    className: 'feedback-char-count badge',
                    innerHTML: this.maxWords
                });
                if (this.charCounter) {
                    this.wordCounter.style['margin-left'] = '10px';
                }
            }
        }
        else {
            this.wordCounter.style.display = '';
        }
    };

    /**
     * ### Feedback.hideCounters
     *
     * Hides the character counter
     */
    Feedback.prototype.hideCounters = function() {
        if (this.charCounter) this.charCounter.style.display = 'none';
        if (this.wordCounter) this.wordCounter.style.display = 'none';
    };

    // ## Helper functions.

    /**
     * ### getFeedback
     *
     * Returns the value of the feedback textarea or in `_feedback`
     *
     * Must be invoked with right context
     *
     * @return {string|null} The value of the feedback, if any
     */
    function getFeedback() {
        var out;
        out = this.textareaElement ?
            this.textareaElement.value : this._feedback;
        return out ? out.trim() : out;
    }

})(node);

/**
 * # GroupMalleability
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' perception of group malleability.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('GroupMalleability', GroupMalleability);

    // ## Meta-data

    GroupMalleability.version = '0.1.0';
    GroupMalleability.description = 'Displays an interface to measure ' +
        'perception for group malleability.';

    GroupMalleability.title = 'Group Malleability';
    GroupMalleability.className = 'group-malleability';


    var items = [
        'As hard as it is to admit, it is impossible to change the ' +
            'central characteristics of nationalities and groups.',
        'Groups that are characterized by extreme and violent traits ' +
            'will never change as these traits are inherently ingrained ' +
            'in their nature.',
        'Groups can sometimes change their outward behavior, but can ' +
            'never change who they really are.',
        'Every nationality or group has a fixed set of beliefs and ' +
            'values that cannot be changed.',
        'Social and political processes can lead to changes in a ' +
            'group\'s values and morality.'
    ];

    var choices = [ 1,2,3,4,5,6,7 ];

    var header = [
        'Strongly Oppose',
        'Somewhat Oppose',
        'Slightly Oppose',
        'Neutral',
        'Slightly Favor',
        'Somewhat Favor',
        'Strongly Favor'
    ];

    GroupMalleability.texts = {

        mainText:
            'Show how much you favor or oppose each idea below by ' +
            'selecting a number from 1 to 7 on the scale below. <em>You ' +
            'can work quickly, your first feeling is generally best.</em>'
    };

    // ## Dependencies

    GroupMalleability.dependencies = {};

    /**
     * ## GroupMalleability constructor
     *
     * Creates a new instance of GroupMalleability
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to GroupMalleability.init.
     *
     * @see GroupMalleability.init
     */
    function GroupMalleability() {

        /**
         * ## GroupMalleability.ct
         *
         * The ChoiceTableGroup widget containing the items
         */
        this.ctg = null;

        /**
         * ## GroupMalleability.choices
         *
         * The numerical scale used
         */
        this.choices = choices;

        /**
         * ## GroupMalleability.header
         *
         * The categorical scale used
         */
        this.header = header;

        /**
         * ### GroupMalleability.mainText
         *
         * A text preceeding the GroupMalleability scale
         */
        this.mainText = null;
    }

    // ## GroupMalleability methods.

    /**
     * ### GroupMalleability.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    GroupMalleability.prototype.init = function(opts) {
        opts = opts || {};

        if (opts.choices) {
            if (!J.isArray(opts.choices) || opts.choices.length < 2) {
                throw new Error('GroupMalleability.init: choices must be an ' +
                                'array of length > 1 or undefined. Found: ' +
                                opts.choices);
            }
            this.choices = opts.choices;
        }

        if (opts.header) {
            if (!J.isArray(opts.header) ||
                opts.header.length !== this.choices.length) {

                throw new Error('GroupMalleability.init: header must be an ' +
                                'array of length equal to the number of ' +
                                'choices or undefined. Found: ' + opts.header);
            }
            this.header = opts.header;
        }

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText && opts.mainText !== false) {
                throw new Error('GroupMalleability.init: mainText must be ' +
                                'string, false, or undefined. Found: ' +
                                opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        else if (opts.mainText !== false) {
             this.mainText = this.getText('mainText');
        }
    };

    GroupMalleability.prototype.append = function() {
        this.ctg = node.widgets.add('ChoiceTableGroup', this.panelDiv, {
            id: this.id || 'groupmalleability_choicetable',
            items: items.map(function(item, i) {
                return [('GM_' + (i+1)), item ];
            }),
            choices: this.choices,
            mainText: this.mainText,
            title: false,
            panel: false,
            requiredChoice: this.required,
            header: this.header
        });
    };

    GroupMalleability.prototype.getValues = function(opts) {
        opts = opts || {};
        return this.ctg.getValues(opts);
    };

    GroupMalleability.prototype.setValues = function(opts) {
        opts = opts || {};
        return this.ctg.setValues(opts);
    };

    GroupMalleability.prototype.enable = function(opts) {
        return this.ctg.enable(opts);
    };

    GroupMalleability.prototype.disable = function(opts) {
        return this.ctg.disable(opts);
    };

    GroupMalleability.prototype.highlight = function(opts) {
        return this.ctg.highlight(opts);
    };

    GroupMalleability.prototype.unhighlight = function(opts) {
        return this.ctg.unhighlight(opts);
    };

})(node);

/**
 * # LanguageSelector
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Manages and displays information about languages available and selected
 *
 * @TODO: bubble event in case of buttons (now there are many listeners).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('LanguageSelector', LanguageSelector);

    // ## Meta-data

    LanguageSelector.version = '0.6.2';
    LanguageSelector.description = 'Display information about the current ' +
        'language and allows to change language.';
    LanguageSelector.title = 'Language';
    LanguageSelector.className = 'languageselector';

    LanguageSelector.texts.loading = 'Loading language information...';

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
         *
         * Default: TRUE.
         */
        this.usingButtons = true;

        /**
         * ## LanguageSelector.updatePlayer
         *
         * Specifies when updating the player
         *
         * Available options:
         *
         *   - false: alias for 'never',
         *   - 'never': never notifies,
         *   - 'onselect': each time a selection is made,
         *   - 'ondone': when current step is done.
         *
         * Default: 'ondone'
         */
        this.updatePlayer = 'ondone';

        /**
         * ## LanguageSelector.setUriPrefix
         *
         * If TRUE, the Window URI prefix is updated when the player is updated
         *
         * Default: TRUE.
         *
         * @see GameWindow.setUriPrefix
         */
        this.setUriPrefix = true;

        /**
         * ## LanguageSelector.notifyServer
         *
         * If TRUE, a message is sent to the server when the player is updated
         *
         * Default: TRUE.
         */
        this.notifyServer = true;

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
                        that.optionsLabel[language] = W.get('label', {
                            id: language + 'Label',
                            'for': language + 'RadioButton'
                        });

                        that.optionsDisplay[language] = W.get('input', {
                            id: language + 'RadioButton',
                            type: 'radio',
                            name: 'languageButton',
                            value: msg.data[language].name
                        });

                        that.optionsDisplay[language].onclick =
                            makeSetLanguageOnClick(language);

                        that.optionsLabel[language].appendChild(
                            that.optionsDisplay[language]);
                        that.optionsLabel[language].appendChild(
                            document.createTextNode(
                                msg.data[language].nativeName));
                        W.add('br', that.displayForm);
                        that.optionsLabel[language].className =
                            'unselectedButtonLabel';
                        that.displayForm.appendChild(
                            that.optionsLabel[language]);
                    }
                }
            }
            else {

                that.displaySelection = W.get('select', 'selectLanguage');
                for (language in msg.data) {
                    that.optionsLabel[language] =
                        document.createTextNode(msg.data[language].nativeName);
                    that.optionsDisplay[language] = W.get('option', {
                        id: language + 'Option',
                        value: language
                    });
                    that.optionsDisplay[language].appendChild(
                        that.optionsLabel[language]);
                    that.displaySelection.appendChild(
                        that.optionsDisplay[language]);

                }
                that.displayForm.appendChild(that.displaySelection);
                that.displayForm.onchange = function() {
                    that.setLanguage(that.displaySelection.value,
                                     that.updatePlayer === 'onselect');
                };
            }

            that.loadingDiv.style.display = 'none';
            that.languagesLoaded = true;

            // Initialize with current value inside player object,
            // or default to English. Does not update the player object yet.
            that.setLanguage(node.player.lang.shortName || 'en', false);

            // Extension point.
            if (that.onLangCallbackExtension) {
                that.onLangCallbackExtension(msg);
                that.onLangCallbackExtension = null;
            }

            function makeSetLanguageOnClick(langStr) {
                return function() {
                    that.setLanguage(langStr, that.updatePlayer === 'onselect');
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

        if ('undefined' !== typeof this.options.usingButtons) {
            this.usingButtons = !!this.options.usingButtons;
        }

        if ('undefined' !== typeof this.options.notifyServer) {
            if (false === this.options.notifyServer) {
                this.options.notifyServer = 'never';
            }
            else if ('string' === typeof this.options.notifyServer) {
                if ('never' === this.options.notifyServer ||
                    'onselect' === this.options.notifyServer ||
                    'ondone' === this.options.notifyServer) {

                    this.notifyServer = this.options.notifyServer;
                }
                else {
                    throw new Error('LanguageSelector.init: invalid value ' +
                                    'for notifyServer: "' +
                                    this.options.notifyServer + '". Valid ' +
                                    'values: "never","onselect", "ondone".');
                }
            }
            else {
                throw new Error('LanguageSelector.init: options.notifyServer ' +
                                'must be ' +
                                this.options.notifyServer);
            }
        }

        if ('undefined' !== typeof this.options.setUriPrefix) {
            this.setUriPrefix = !!this.options.setUriPrefix;
        }

        // Register listener.
        // TODO: should it be moved into the listeners method?
        // TODO: calling init twice will add it twice.
        node.on.lang(this.onLangCallback);

        // Display initialization.
        this.displayForm = W.get('form', 'radioButtonForm');
        this.loadingDiv = W.add('div', this.displayForm);
        this.loadingDiv.innerHTML = this.getText('loading');

        this.loadLanguages();
    };

    LanguageSelector.prototype.append = function() {
        this.bodyDiv.appendChild(this.displayForm);
    };

    /**
     * ### LanguageSelector.setLanguage
     *
     * Sets language within the widget and globally and updates the display
     *
     * @param {string} langName shortName of language to be set
     * @param {boolean} updatePlayer If FALSE, the language is set only
     *   inside the widget, and no changes are made to the player object.
     *   Default: TRUE
     *
     * @see NodeGameClient.setLanguage
     */
    LanguageSelector.prototype.setLanguage = function(langName, updatePlayer) {

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
        if (updatePlayer !== false) {
            node.setLanguage(this.availableLanguages[this.currentLanguage],
                             this.setUriPrefix, this.notifyServer);
        }
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
        if (!this.languagesLoaded) this.updateAvalaibleLanguages(options);
        else if (options && options.callback) options.callback();
    };

    /**
     * ### LanguageSelector.listeners
     *
     * Implements Widget.listeners
     */
    LanguageSelector.prototype.listeners = function() {
        var that;
        that = this;
        node.events.step.on('REALLY_DONE', function() {
            if (that.updatePlayer === 'ondone') {
                node.setLanguage(that.availableLanguages[that.currentLanguage],
                                 that.setUriPrefix, that.notifyServer);
            }
        });
    };

})(node);

/**
 * # MoneyTalks
 * Copyright(c) 2020 Stefano Balietti
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

    MoneyTalks.version = '0.5.0';
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
     * `MoneyTalks` displays the earnings ("money") of players
     *
     * @see MoneyTalks.init
     */
    function MoneyTalks() {

        /**
         * ### MoneyTalks.spanCurrency
         *
         * The SPAN which holds information on the currency
         */
        this.spanCurrency = null;

        /**
         * ### MoneyTalks.spanMoney
         *
         * The SPAN which holds information about the money earned so far
         */
        this.spanMoney = null;

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

        /**
         * ### MoneyTalks.showCurrency
         *
         * If TRUE, the currency is displayed after the money
         */
        this.showCurrency = true;

        /**
         * ### MoneyTalks.currencyClassname
         *
         * Class name to be attached to the currency span
         */
        this.classnameCurrency = 'moneytalkscurrency';

        /**
         * ### MoneyTalks.currencyClassname
         *
         * Class name to be attached to the money span
         */
        this.classnameMoney = 'moneytalksmoney';
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
     *
     *   - `currency`: The name of currency.
     *   - `money`: Initial amount of money earned.
     *   - `precision`: How mamy floating point digits to use.
     *   - `currencyClassName`: Class name to be set for this.spanCurrency.
     *   - `moneyClassName`: Class name to be set for this.spanMoney.
     *   - `showCurrency`: Flag whether the name of currency is to be displayed.
     */
    MoneyTalks.prototype.init = function(options) {
        options = options || {};
        if ('string' === typeof options.currency) {
            this.currency = options.currency;
        }
        if ('undefined' !== typeof options.showCurrency) {
            this.showCurrency = !!options.showCurrency;
        }
        if ('number' === typeof options.money) {
            this.money = options.money;
        }
        if ('number' === typeof options.precision) {
            this.precision = options.precision;
        }
        if ('string' === typeof options.MoneyClassName) {
            this.classnameMoney = options.MoneyClassName;
        }
        if ('string' === typeof options.currencyClassName) {
            this.classnameCurrency = options.currencyClassName;
        }
    };

    MoneyTalks.prototype.append = function() {
        if (!this.spanMoney) {
            this.spanMoney = document.createElement('span');
        }
        if (!this.spanCurrency) {
            this.spanCurrency = document.createElement('span');
        }
        if (!this.showCurrency) this.spanCurrency.style.display = 'none';

        this.spanMoney.className = this.classnameMoney;
        this.spanCurrency.className = this.classnameCurrency;

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;

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
     * @return {number} The current value after the update
     *
     * @see MoneyTalks.money
     * @see MonetyTalks.spanMoney
     */
    MoneyTalks.prototype.update = function(amount, clear) {
        var parsedAmount;
        parsedAmount = J.isNumber(amount);
        if (parsedAmount === false) {
            node.err('MoneyTalks.update: invalid amount: ' + amount);
            return;
        }
        if (clear) this.money = 0;
        this.money += parsedAmount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
        return this.money;
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
 * Copyright(c) 2019 Stefano Balietti
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

    MoodGauge.version = '0.4.0';
    MoodGauge.description = 'Displays an interface to measure mood ' +
        'and emotions.';

    MoodGauge.title = 'Mood Gauge';
    MoodGauge.className = 'moodgauge';

    MoodGauge.texts.mainText = 'Thinking about yourself and how you normally' +
                ' feel, to what extent do you generally feel: ';

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
         * ### MoodGauge.mainText
         *
         * A text preceeding the SVO gauger
         */
        this.mainText = null;

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
     * @param {object} opts Optional. Configuration options.
     */
    MoodGauge.prototype.init = function(opts) {
        var gauge;
        if ('undefined' !== typeof opts.method) {
            if ('string' !== typeof opts.method) {
                throw new TypeError('MoodGauge.init: method must be string ' +
                                    'or undefined: ' + opts.method);
            }
            if (!this.methods[opts.method]) {
                throw new Error('MoodGauge.init: method is invalid: ' +
                                opts.method);
            }
            this.method = opts.method;
        }
        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError('MoodGauge.init: mainText must be string ' +
                                    'or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        // Call method.
        gauge = this.methods[this.method].call(this, opts);
        // Check properties.
        checkGauge(this.method, gauge);
        // Approved.
        this.gauge = gauge;

        this.on('enabled', function() {
            gauge.enable();
        });

        this.on('disabled', function() {
            gauge.disable();
        });

        this.on('highlighted', function() {
            gauge.highlight();
        });

        this.on('unhighlighted', function() {
            gauge.unhighlight();
        });
    };

    MoodGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv, { panel: false });
    };

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
        var items, emotions, choices, left, right;
        var gauge, i, len;

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
            id: options.id || 'ipnassf',
            items: items,
            mainText: this.mainText || this.getText('mainText'),
            title: false,
            requiredChoice: true,
            storeRef: false
        });

        return gauge;
    }

})(node);

/**
 * # Requirements
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
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

    node.widgets.register('Requirements', Requirements);

    // ## Meta-data

    Requirements.version = '0.7.2';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    Requirements.title = 'Requirements';
    Requirements.className = 'requirements';

    Requirements.texts.errStr = 'One or more function is taking too long. ' +
                                'This is likely to be due to a compatibility' +
                                ' issue with your browser or to bad network' +
                                ' connectivity.';
    Requirements.texts.testPassed = 'All tests passed.';

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
         * ### Requirements.callbacksExecuted
         *
         * TRUE, the callbacks have been executed
         */
        this.callbacksExecuted = false;

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
            throw new TypeError('Requirements.init: conf must be object. ' +
                                'Found: ' + conf);
        }
        if (conf.requirements) {
            if (!J.isArray(conf.requirements)) {
                throw new TypeError('Requirements.init: conf.requirements ' +
                                    'must be array or undefined. Found: ' +
                                    conf.requirements);
            }
            this.requirements = conf.requirements;
        }
        if ('undefined' !== typeof conf.onComplete) {
            if (null !== conf.onComplete &&
                'function' !== typeof conf.onComplete) {

                throw new TypeError('Requirements.init: conf.onComplete must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onComplete);
            }
            this.onComplete = conf.onComplete;
        }
        if ('undefined' !== typeof conf.onSuccess) {
            if (null !== conf.onSuccess &&
                'function' !== typeof conf.onSuccess) {

                throw new TypeError('Requirements.init: conf.onSuccess must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onSuccess);
            }
            this.onSuccess = conf.onSuccess;
        }
        if ('undefined' !== typeof conf.onFailure) {
            if (null !== conf.onFailure &&
                'function' !== typeof conf.onFailure) {

                throw new TypeError('Requirements.init: conf.onFailure must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onFailure);
            }
            this.onFailure = conf.onFailure;
        }
        if (conf.maxExecTime) {
            if (null !== conf.maxExecTime &&
                'number' !== typeof conf.maxExecTime) {

                throw new TypeError('Requirements.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined. ' +
                                    'Found: ' + conf.maxExecTime);
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
                                    'requirements must be function or ' +
                                    'object. Found: ' + arguments[i]);
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
                            'to check.');
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

        if (this.withTimeout) this.addTimeout();

        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }

        if (this.isCheckingFinished()) this.checkingFinished();

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

        this.timeoutId = setTimeout(function() {
            if (that.stillChecking > 0) {
                that.displayResults([that.getText('errStr')]);
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
     * ### Requirements.checkingFinished
     *
     * Clears up timer and dots, and executes final callbacks accordingly
     *
     * First, executes the `onComplete` callback in any case. Then if no
     * errors have been raised executes the `onSuccess` callback, otherwise
     * the `onFailure` callback.
     *
     * @param {boolean} force If TRUE, the function is executed again,
     *   regardless of whether it was already executed. Default: FALSE
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.checkingFinished = function(force) {
        var results;

        // Sometimes, if all requirements are almost synchronous, it
        // can happen that this function is called twice (from resultCb
        // and at the end of all requirements checkings.
        if (this.callbacksExecuted && !force) return;
        this.callbacksExecuted = true;

        if (this.timeoutId) clearTimeout(this.timeoutId);

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

        if (this.onComplete) this.onComplete();

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
                                'be array. Found: ' + results);
        }

        // No errors.
        if (!this.hasFailed && this.stillChecking <= 0) {
            // All tests passed.
            this.list.addDT({
                success: true,
                text: this.getText('testPassed')
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

        this.on('destroyed', function() {
            node.deregisterSetup('requirements');
        });
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
                                    'errors must be array or undefined. ' +
                                    'Found: ' + errors);
                }
                that.displayResults(errors);
            }

            that.results.push({
                name: name,
                success: success,
                errors: errors,
                data: data
            });

            if (that.isCheckingFinished()) that.checkingFinished();
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
 * # RiskGauge
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure risk preferences with different methods
 *
 * Available methods: Holt_Laury (default), and Bomb.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('RiskGauge', RiskGauge);

    // ## Meta-data

    RiskGauge.version = '0.8.0';
    RiskGauge.description = 'Displays an interface to ' +
        'measure risk preferences with different methods.';

    RiskGauge.title = 'Risk Gauge';
    RiskGauge.className = 'riskgauge';

    RiskGauge.texts =  {

        // Holt Laury.

        holt_laury_mainText:
            'Below you find a series of hypothetical lotteries, each ' +
            'contains two lotteries with different probabalities of winning. ' +
            'In each row, select the lottery you would rather take part in.',

        // Bomb.

        // probBomb is passed as input param because it may be hidden.
        bomb_mainText: function(widget, probBomb) {
            var str;
            str = '<p style="margin-bottom: 0.3em">';
            str +=  'Below there are ' + widget.totBoxes + ' black boxes. ';
            str += 'Every box contains a prize of ' +
                    widget.boxValue + ' ' + widget.currency + ', but ';
            if (probBomb === 1) {
                str += 'one random box contains a <em>bomb</em>.';
            }
            else {
                if (widget.revealProbBomb) {
                    str += 'with probability ' + probBomb +
                    ' one random box contains a <em>bomb</em>.';
                }
                else {
                    str += 'one random box might contain a <em>bomb</em>.';
                }
            }
            str += ' You must decide how many boxes you want to open.';
            str += '</p>';
            if (widget.withPrize) {
                str += '<p style="margin-bottom: 0.3em">';
                str += 'You will receive a reward equal to the ' +
                       'sum of all the prizes in every opened ' +
                       'box. However, if you open the box ' +
                       'with the bomb, you get nothing.</p>'
            }
            str += '<p style="margin-bottom: 0.5em">';
            str += '<strong>How many boxes do you want to open ';
            str += 'between 1 and ' + widget.maxBoxes + '?</strong></p>';
            return str;
        },

        bomb_sliderHint:
            'Move the slider to choose the number of boxes to open, ' +
            'then click "Open Boxes"',

        bomb_boxValue: 'Prize per box: ',

        bomb_numBoxes: 'Number of boxes: ',

        bomb_totalWin: 'Total reward: ',

        bomb_openButton: 'Open Boxes',

        bomb_warn: 'Open at least one box.',

        bomb_won: 'You won! You did not open the box with the bomb.',

        bomb_lost: 'You lost! You opened the box with the bomb.'
    };

    // Backward compatibility.
    RiskGauge.texts.mainText = RiskGauge.texts.holt_laury_mainText;

    // ## Dependencies
    RiskGauge.dependencies = {
        JSUS: {}
    };

    /**
     * ## RiskGauge constructor
     *
     * Creates a new instance of RiskGauge
     *
     * @see RiskGauge.init
     */
    function RiskGauge() {

        /**
         * ### RiskGauge.methods
         *
         * List of available methods
         *
         * Maps names to functions.
         *
         * Each function is called with `this` instance as context,
         * and accepts the `options` parameters passed to constructor.
         * Each method must return widget-like gauge object
         * implementing functions: append, enable, disable, getValues
         * or an error will be thrown.
         */
        this.methods = {};

        /**
         * ## RiskGauge.method
         *
         * The method used to measure mood
         *
         * Available methods: 'Holt_Laury', 'Bomb'
         *
         * Default method is: 'Holt_Laury'
         *
         * References:
         *
         * Holt, C. A., & Laury, S. K. (2002).
         * Risk aversion and incentive effects.
         * American economic review, 92(5), 1644-1655.
         */
        this.method = 'Holt_Laury';

        /**
         * ### RiskGauge.mainText
         *
         * A text preceeding the SVO gauger
         */
        this.mainText = null;

        /**
         * ## SVOGauge.gauge
         *
         * The object measuring mood
         *
         * @see SVOGauge.method
         */
        this.gauge = null;

        this.addMethod('Holt_Laury', holtLaury);
        this.addMethod('Bomb', bomb);
    }

    // ## RiskGauge methods.

    /**
     * ### RiskGauge.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    RiskGauge.prototype.init = function(opts) {
        var gauge, that;
        if ('undefined' !== typeof opts.method) {
            if ('string' !== typeof opts.method) {
                throw new TypeError('RiskGauge.init: method must be string ' +
                                    'or undefined: ' + opts.method);
            }
            if (!this.methods[opts.method]) {
                throw new Error('RiskGauge.init: method is invalid: ' +
                                opts.method);
            }
            this.method = opts.method;
        }
        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError('RiskGauge.init: mainText must be string ' +
                                    'or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        // Call method.
        gauge = this.methods[this.method].call(this, opts);

        // Add defaults.
        that = this;
        gauge.isHidden = function() { return that.isHidden(); };
        gauge.isCollapsed = function() { return that.isCollapsed(); };

        // Check properties.
        if (!node.widgets.isWidget(gauge)) {
            throw new Error('RiskGauge.init: method ' + this.method +
                            ' created invalid gauge: missing default widget ' +
                            'methods.')
        }

        // Approved.
        this.gauge = gauge;

        this.on('enabled', function() {
            if (gauge.enable) gauge.enable();
        });

        this.on('disabled', function() {
            if (gauge.disable) gauge.disable();
        });

        this.on('highlighted', function() {
            if (gauge.highlight) gauge.highlight();
        });

        this.on('unhighlighted', function() {
            if (gauge.unhighlight) gauge.unhighlight();
        });
    };

    RiskGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv, { panel: false });
    };

    /**
     * ## RiskGauge.addMethod
     *
     * Adds a new method to measure mood
     *
     * @param {string} name The name of the method
     * @param {function} cb The callback implementing it
     */
    RiskGauge.prototype.addMethod = function(name, cb) {
        if ('string' !== typeof name) {
            throw new TypeError('RiskGauge.addMethod: name must be string: ' +
                            name);
        }
        if ('function' !== typeof cb) {
            throw new TypeError('RiskGauge.addMethod: cb must be function: ' +
                            cb);
        }
        if (this.methods[name]) {
            throw new Error('RiskGauge.addMethod: name already existing: ' +
                            name);
        }
        this.methods[name] = cb;
    };

    RiskGauge.prototype.getValues = function(opts) {
        return this.gauge.getValues(opts);
    };

    RiskGauge.prototype.setValues = function(opts) {
        return this.gauge.setValues(opts);
    };

    // ## Methods.

    // ### Holt and Laury

    function makeProbString(p1, v1, p2, v2, opts) {
        var of, cur, sep, out;
        opts = opts || {};
        of = (opts.of || ' chance to win ');
        cur = opts.currency || '$';
        sep = opts.sep || '<span class="sep">and</span>';
        out = p1 + of;
        // Place currency sign before or after.
        out += opts.currencyAfter ? v1 + cur : cur + v1;
        out += sep + p2 + of;
        return out + (opts.currencyAfter ? v2 + cur : cur + v2);
    }

    function holtLaury(options) {
        var items, gauge, i, len, j;
        var tmp, v1, v2, v3, v4, p1, p2;

        tmp = options.values || [ 2, 1.6, 3.85, 0.1 ];

        if (options.scale) {
            tmp = tmp.map(function(i) { return i * options.scale; });
        }
        // Make it two decimals.
        v1 = tmp[0].toFixed(2);
        v2 = tmp[1].toFixed(2);
        v3 = tmp[2].toFixed(2);
        v4 = tmp[3].toFixed(2);

        len = 10;
        items = new Array(len);
        for (i = 0; i < len ; i++) {
            j = i + 1;
            p1 = j + '/' + len;
            p2 = (len - j) + '/' + len;
            items[i] = {
                id: 'hl_' + j,
                left: j + '. ',
                choices: [
                    makeProbString(p1, v1, p2, v2, options),
                    makeProbString(p1, v3, p2, v4, options),
                ]
            };
        }

        gauge = node.widgets.get('ChoiceTableGroup', {
            id: options.id || 'holt_laury',
            items: items,
            mainText: this.mainText || this.getText('holt_laury_mainText'),
            title: false,
            requiredChoice: true,
            storeRef: false
        });

        return gauge;
    }


    // ### Bomb Risk

    function bomb(opts) {
        var that;
        that = this;

        // Private variables.

        // Probability that there is a bomb. Default 1.
        var probBomb;

        // The index of the box with the bomb (0 to totBoxes), or -1 if no bomb.
        var bombBox;

        // Div containing info about how many boxes to open, etc.
        var infoDiv;

        // Paragraph containing the outcome of opening the box or a warning.
        var bombResult;

        // The Slider widget to select how many boxes to open.
        var slider;

        // The open box button.
        var button;

        // Flag that participant did not found the bomb.
        var isWinner;

        // Holds the final number of boxes opened after clicking the button.
        var finalValue;

        // Init private variables.

        // The height of every box in px (default: 30px in css).
        if (opts.boxHeight) {
            if ('string' !== typeof opts.boxHeight) {
                throw new Error('Bomb.init: boxHeight must be string ' +
                                'or undefined. Found: ' + opts.boxHeight);
            }
            W.cssRule('div.riskgauge .bomb-box { height: ' +
                      opts.boxHeight + '}');
        }

        if ('undefined' !== typeof opts.probBomb) {
            if (false === J.isNumber(opts.probBomb, 0, 1, true, true)) {
                throw new Error('Bomb.init: probBomb must be a number ' +
                'between 0 and 1 or undefined. Found: ' +
                opts.probBomb);
            }
            probBomb = opts.probBomb;
        }
        else {
            probBomb = 1;
        }

        // Variable bombBox is init after totBoxes is validated.

        // Public variables.

        // Store locally because they are overwritten. TODO: check if needed.
        this._highlight = this.highlight;
        this._unhighlight = this.unhighlight;

        // The value of each box. Default 0.01.
        if ('undefined' !== typeof opts.boxValue) {
            this.boxValue = J.isNumber(opts.boxValue, 0);
            if (!this.boxValue) {
                throw new TypeError('Bomb.init: boxValue must be an ' +
                                    'a number > 0 or undefined. Found: ' +
                                    opts.boxValue);
            }
        }
        else {
            this.boxValue = 0.01;
        }

        // The currency of the prize. Default: USD.
        this.currency = opts.currency || 'USD';

        // Flag TRUE if the probability that a bomb exists is revealed.
        this.revealProbBomb = 'undefined' === typeof opts.revealProbBomb ?
                              true : !!opts.revealProbBomb;

        // Max number of boxes to open (default 99 if probBomb = 1, else 100).
        if ('undefined' !== typeof opts.totBoxes) {
            if (!J.isInt(opts.totBoxes, 0, 10000, false, true)) {
                throw new TypeError('Bomb.init: maxBoxes must be an ' +
                'integer > 0 and <= 10000 or undefined. Found: ' +
                opts.totBoxes);
            }
            this.totBoxes = opts.totBoxes;
        }
        else {
            this.totBoxes = 100;
        }

        // Max num of boxes to open.
        // Default totBoxes -1 if probBomb = 1, else this.totBoxes.
        if ('undefined' !== typeof opts.maxBoxes) {
            if (!J.isInt(opts.maxBoxes, 0, this.totBoxes)) {
                throw new TypeError('Bomb.init: maxBoxes must be a positive' +
                                    ' integer <= ' + this.totBoxes +
                                    ' or undefined. Found: ' + opts.maxBoxes);
            }
            this.maxBoxes = opts.maxBoxes;
        }
        else {
            this.maxBoxes = probBomb === 1 ? this.totBoxes - 1 : this.totBoxes;
        }

        // Number of boxes in each row.
        if ('undefined' !== typeof opts.boxesInRow) {
            if (!J.isInt(opts.boxesInRow, 0)) {
                throw new TypeError('Bomb.init: boxesInRow must be a positive' +
                                    ' integer or undefined. Found: ' +
                                    opts.boxesInRow);
            }
            this.boxesInRow = opts.boxesInRow > this.totBoxes ?
                                  this.totBoxes : opts.boxesInRow;
        }
        else {
            this.boxesInRow = this.totBoxes < 10 ? this.totBoxes : 10;
        }

        // If TRUE, there is an actual prize for the participant. Default: TRUE.
        this.withPrize = 'undefined' === typeof opts.withPrize ?
                         true : !!opts.withPrize;

        // Bomb box.
        // Pick bomb box id, if probability permits it, else set to -1.
        // Resulting id is between 1 and totBoxes.
        bombBox = Math.random() >= probBomb ?
                  -1 : Math.ceil(Math.random() * this.totBoxes);

        // Return widget-like object.
        return {

            setValues: function(opts) {
                slider.setValues(opts);
            },

            getValues: function(opts) {
                var out, values, nb, ic;
                opts = opts || {};
                values = slider.getValues();
                // We use finalValue, because values.value might be manipulated.
                if ('undefined' !== typeof finalValue) {
                    nb = finalValue;
                    ic = true
                }
                else {
                    // TODO: slider.getValues returns non-integers. Check.
                    nb = parseInt(slider.slider.value, 10);
                    ic = false;
                }
                out = {
                    value: nb,
                    isCorrect: ic,
                    totalMove: values.totalMove,
                    isWinner: isWinner,
                    time: values.time,
                    reward: 0
                };
                if (!out.isCorrect &&
                    ('undefined' === typeof opts.highlight || opts.highlight)) {

                        slider.highlight();
                }
                if (isWinner === true) out.reward = finalValue * that.boxValue;
                return out;
            },

            highlight: function() {
                slider.highlight();
            },

            unhighlight: function() {
                slider.unhighlight();
            },

            // slider: slider,

            append: function() {
                var nRows;

                // Main text.
                W.add('div', that.bodyDiv, {
                    innerHTML: that.mainText ||
                               that.getText('bomb_mainText', probBomb)
                });

                // Slider.
                slider = node.widgets.add('Slider', that.bodyDiv, {
                    min: 0,
                    max: that.maxBoxes,
                    hint: that.getText('bomb_sliderHint'),
                    title: false,
                    initialValue: 0,
                    displayValue: false,
                    displayNoChange: false,
                    type: 'flat',
                    required: true,
                    panel: false,
                    // texts: {
                    //     currentValue: that.getText('sliderValue')
                    // },
                    onmove: function(value) {
                        var i, div, c, v;

                        // TODO: not working.
                        // if (that.isHighlighted()) that._unhighlight();
                        that._unhighlight();

                        if (value > 0) {
                            button.style.display = '';
                            button.disabled = false;
                            bombResult.innerHTML = '';
                        }
                        else {
                            button.style.display = 'none';
                            bombResult.innerHTML = that.getText('bomb_warn');
                            button.disabled = true;
                        }

                        // Need to do until maxBoxes
                        // in case we are reducing the value.
                        for (i = 0; i < that.maxBoxes; i++) {
                            div = W.gid(getBoxId(i));
                            if (value > i) div.style.background = '#1be139';
                            else div.style.background = '#000000';
                        }

                        // Update display.
                        W.gid('bomb_numBoxes').innerText = value;
                        c = that.currency;
                        v = that.boxValue;
                        if (that.withPrize) {
                            W.gid('bomb_boxValue').innerText = v + c;
                            W.gid('bomb_totalWin').innerText =
                                Number((value * v)).toFixed(2) + c;
                        }
                    },
                    storeRef: false,
                    width: '100%'
                });

                // Table.
                nRows = Math.ceil(that.totBoxes / that.boxesInRow);
                W.add('div', that.bodyDiv, {
                    innerHTML: makeTable(nRows, that.boxesInRow, that.totBoxes)
                });

                // Info div.
                infoDiv = W.add('div', that.bodyDiv, {
                    className: 'risk-info',
                });

                W.add('p', infoDiv, {
                    innerHTML: that.getText('bomb_numBoxes') +
                               '&nbsp;<span id="bomb_numBoxes">0</span>'
                });

                if (that.withPrize) {
                    W.add('p', infoDiv, {
                        innerHTML: that.getText('bomb_boxValue') +
                        '&nbsp;<span id="bomb_boxValue">' +
                        this.boxValue + '</span>'
                    });
                    W.add('p', infoDiv, {
                        innerHTML: that.getText('bomb_totalWin') +
                        '&nbsp;<span id="bomb_totalWin">0</span>'
                    });
                }

                bombResult = W.add('p', infoDiv, { id: 'bomb_result' });

                button = W.add('button', that.bodyDiv, {
                    className: 'btn-danger',
                    innerHTML: that.getText('bomb_openButton'),
                });
                // Initially hidden.
                button.style.display = 'none';

                button.onclick = function() {
                    var cl;
                    // Set global variables.
                    // slider.getValues().value fails (no int numbers).
                    finalValue = parseInt(slider.slider.value, 10);

                    // Update table.
                    if (bombBox > -1) {
                        // Variable bombBox is between 1 and totBoxes.
                        // Cells in table are 0-indexed.
                        W.gid(getBoxId(bombBox-1)).style.background = '#fa0404';
                        isWinner = finalValue < bombBox;
                    }
                    else {
                        isWinner = true;
                    }
                    // Hide slider and button
                    slider.hide();
                    W.hide(button);
                    // Give feedback.
                    cl = 'bomb_' + (isWinner ? 'won' : 'lost');
                    bombResult.innerHTML = that.getText(cl);
                    bombResult.className += (' ' + cl);
                };
            }
        };
    }

    // ### Helper methods.

    // Returns the Bomb Box Id in the HTML from its index.
    function getBoxId(i) {
        return 'bc_' + i;
    }

    //
    function makeBoxRow(rowId, boxesInRow, colSpan) {
        var i, out;
        out = '<tr>';
        for (i = 0; i < boxesInRow; i++) {
            // If there are not enough boxes in this row, do a long colspan.
            if (colSpan && i > colSpan) {
                out = out + '<td colspan="' + (boxesInRow - colSpan) +
                      '"></td>';
                break;
            }
            out = out + '<td><div class="bomb-box square" id="' +
            getBoxId(i + (boxesInRow * rowId)) + '"></td>';
        }
        out += '</tr>';
        return out;
    }

    function makeTable(nRows, boxesInRow, totBoxes) {
        var rowId, out, boxCount, colSpan;
        out = '<table class="bomb-table">';
        for (rowId = 0; rowId < nRows; rowId++) {
            // Check if the last row has less cells to complete the row.
            boxCount = (rowId+1) * boxesInRow;
            if (boxCount > totBoxes) {
                colSpan = totBoxes - (rowId * boxesInRow) - 1;
            }
            out = out + makeBoxRow(rowId, boxesInRow, colSpan);
        }
        out += '</table><br>';
        return out;
    }

})(node);

/**
 * # SDO
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' social dominance orientation (S.D.O.)
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('SDO', SDO);

    // ## Meta-data

    SDO.version = '0.3.0';
    SDO.description = 'Displays an interface to measure Social ' +
        'Dominance Orientation (S.D.O.).';

    SDO.title = 'SDO';
    SDO.className = 'SDO';


    var scales = {

        SDO7: [
            // Dominance Sub-Scale.
            'Some groups of people must be kept in their place.',
            'It\'s probably a good thing that certain groups are at the ' +
                'top and other groups are at the bottom.',
            'An ideal society requires some groups to be on top and others ' +
                'to be on the bottom.',
            'Some groups of people are simply inferior to other groups.',
            // Reverse-scored:
            'Groups at the bottom are just as deserving as groups at the top.',
            'No one group should dominate in society.',
            'Groups at the bottom should not have to stay in their place.',
            'Group dominance is a poor principle.',

            // Anti-Egalitarianism Sub-Scale.
            'We should not push for group equality.',
            'We shouldn\'t try to guarantee that every group has the same ' +
                'quality of life.',
            'It is unjust to try to make groups equal.',
            'Group equality should not be our primary goal.',
            // Reverse-scored:
            'We should work to give all groups an equal chance to succeed.',
            'We should do what we can to equalize conditions for ' +
                'different groups.',
            'No matter how much effort it takes, we ought to strive to ' +
                'ensure that all groups have the same chance in life.',
            'Group equality should be our ideal.'
        ],

        SDO16: [
            'Some groups of people are simply inferior to other groups.',
            'In getting what you want, it is sometimes necessary to use ' +
                'force against other groups.',
            'It\'s OK if some groups have more of a chance in life ' +
                'than others.',
            'To get ahead in life, it is sometimes necessary to step on ' +
                'other groups.',
            'If certain groups stayed in their place, we would have ' +
                'fewer problems.',
            'It\'s probably a good thing that certain groups are at the ' +
                'top and other groups are at the bottom.',
            'Inferior groups should stay in their place.',
            'Sometimes other groups must be kept in their place.',

            'It would be good if groups could be equal.',
            'Group equality should be our ideal.',
            'All groups should be given an equal chance in life.',
            'We should do what we can to equalize conditions for different ' +
                'groups.',
            'Increased social equality is beneficial to society.',
            'We would have fewer problems if we treated people more equally.',
            'We should strive to make incomes as equal as possible.',
            'No group should dominate in society.'
        ]
    };

    scales.SDO7s = [
        scales.SDO7[2], scales.SDO7[3], scales.SDO7[5], scales.SDO7[6],
        scales.SDO7[11], scales.SDO7[10], scales.SDO7[13], scales.SDO7[12]
    ];

    // var choices = [
    //     '1 ' + '<hr/>' + 'Strongly Oppose',
    //     '2 ' + '<hr/>' + 'Somewhat Oppose',
    //     '3 ' + '<hr/>' + 'Slightly Oppose',
    //     '4 ' + '<hr/>' + 'Neutral',
    //     '5 ' + '<hr/>' + 'Slightly Favor',
    //     '6 ' + '<hr/>' + 'Somewhat Favor',
    //     '7 ' + '<hr/>' + 'Strongly Favor'
    // ];

    var choices = [ 1,2,3,4,5,6,7 ];

    var header = [
        'Strongly Oppose',
        'Somewhat Oppose',
        'Slightly Oppose',
        'Neutral',
        'Slightly Favor',
        'Somewhat Favor',
        'Strongly Favor'
    ];

    SDO.texts = {

        mainText: 'Show how much you favor or oppose each idea below by ' +
        'selecting a number from 1 to 7 on the scale below. <em>You ' +
        'can work quickly, your first feeling is generally best.</em>',
    };

    // ## Dependencies

    SDO.dependencies = {};

    /**
     * ## SDO constructor
     *
     * Creates a new instance of SDO
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to SDO.init.
     *
     * @see SDO.init
     */
    function SDO() {

        /**
         * ## SDO.sdo
         *
         * The ChoiceTableGroup widget containing the items
         */
        this.sdo = null;

        /**
         * ## SDO.scale
         *
         * The scale used to measure SDO
         *
         * Available methods: SDO16, SDO7, SDO7s (default).
         *
         * References:
         *
         * SDO7
         * Ho et al. (2015). "The nature of social dominance orientation:
         * Theorizing and measuring preferences for intergroup inequality
         * using the new SDO₇ scale".
         * Journal of Personality and Social Psychology. 109 (6): 1003–1028.
         *
         * SDO16
         * Sidanius and Pratto (1999). Social Dominance: An Intergroup
         * Theory of Social Hierarchy and Oppression.
         * Cambridge: Cambridge University Press.
         */
        this.scale = 'SDO7s';

        /**
         * ## SDO.choices
         *
         * The numerical scale used
         */
        this.choices = choices;

        /**
         * ## SDO.header
         *
         * The categorical scale used
         */
        this.header = header;

        /**
         * ### SDO.mainText
         *
         * A text preceeding the SDO scale
         */
        this.mainText = null;
    }

    // ## SDO methods.

    /**
     * ### SDO.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    SDO.prototype.init = function(opts) {
        opts = opts || {};

        if (opts.scale) {
            if (opts.scale !== 'SDO16' &&
                opts.scale !== 'SDO7' && opts.scale !== 'SDO7s') {

                throw new Error('SDO.init: scale must be SDO16, SDO7, SDO7s ' +
                                'or undefined. Found: ' + opts.scale);
            }

            this.scale = opts.scale;
        }

        if (opts.choices) {
            if (!J.isArray(opts.choices) || opts.choices.length < 2) {
                throw new Error('SDO.init: choices must be an array ' +
                                'of length > 1 or undefined. Found: ' +
                                opts.choices);
            }
            this.choices = opts.choices;
        }

        if (opts.header) {
            if (!J.isArray(opts.header) ||
                opts.header.length !== this.choices.length) {

                throw new Error('SDO.init: header must be an array ' +
                                'of length equal to the number of choices ' +
                                'or undefined. Found: ' + opts.header);
            }
            this.header = opts.header;
        }

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText && opts.mainText !== false) {
                throw new Error('SDO.init: mainText must be string, ' +
                                'false, or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
    };

    SDO.prototype.append = function() {
        this.sdo = node.widgets.add('ChoiceTableGroup', this.panelDiv, {
            id: this.id || 'SDO_choicetable',
            items: this.getItems(this.scale),
            choices: this.choices,
            mainText: (this.mainText || this.getText('mainText')),
            title: false,
            panel: false,
            requiredChoice: this.required,
            header: this.header
        });
    };

    SDO.prototype.getItems = function() {
        // E.g., ID: SDO7_1.
        var s = this.scale;
        return scales[s].map(function(item, idx) {
            return [ s + '_' + (idx+1), item ];
        });
    };

    SDO.prototype.getValues = function(opts) {
        opts = opts || {};
        return this.sdo.getValues(opts);
    };

    SDO.prototype.setValues = function(opts) {
        opts = opts || {};
        return this.sdo.setValues(opts);
    };

    SDO.prototype.enable = function(opts) {
        return this.sdo.enable(opts);
    };

    SDO.prototype.disable = function(opts) {
        return this.sdo.disable(opts);
    };

    SDO.prototype.highlight = function(opts) {
        return this.sdo.highlight(opts);
    };

    SDO.prototype.unhighlight = function(opts) {
        return this.sdo.unhighlight(opts);
    };

})(node);

/**
 * # Slider
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable slider.
 *
 * Kudos for initial code: https://codepen.io/gotpop/pen/RMZbya.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Slider', Slider);

    // ## Meta-data

    Slider.version = '0.4.0';
    Slider.description = 'Creates a configurable slider';

    Slider.title = false;
    Slider.className = 'slider';

    // ## Dependencies

    Slider.texts = {
        currentValue: function(widget, value) {
            return 'Value: ' + value;
        },
        noChange: 'No change'
    };


    /**
     * ## Slider constructor
     *
     * Creates a new instance of Slider
     */
    function Slider() {
        var that;
        that = this;

        /** Slider.slider
         *
         * The HTML input slider Element
         */
        this.slider = null;

        /** Slider.slider
         *
         * The HTML div Element creating the slider background
         */
        this.rangeFill = null;

        /** Slider.scale
         *
         * Scaling factor for the slider (fixed to 1 for now)
         */
        this.scale = 1;

        /** Slider.currentValue
         *
         * The current value of the slider
         */
        this.currentValue = 50;

        /** Slider.initialValue
        *
        * The initial value of the slider
        */
        this.initialValue = 50;

        /**
        * ### Slider.mainText
        *
        * A text preceeding the slider
        */
        this.mainText = null;

        /**
        * ### Slider.required
        *
        * If TRUE, the user must move the slider
        */
        this.required = null;

        /**
        * ### Slider.requiredChoice
        *
        * Same as Slider.required (backward compatibility)
        */
        this.requiredChoice = null;

        /**
        * ### Slider.hint
        *
        * An additional informative text
        *
        * If not specified, it may be auto-filled, e.g. '*'.
        *
        * TODO: autoHint
        * @see Slider.texts.autoHint
        */
        this.hint = null;

        /** Slider.min
         *
         * The value of the slider at the leftmost position
         */
        this.min = 0;

        /** Slider.max
         *
         * The value of the slider at the rightmost position
         */
        this.max = 100;

        /** Slider.correctValue
         *
         * The correct value of the slider, if any
         */
        this.correctValue = null;

        /** Slider.displayValue
         *
         * If TRUE, the current value of the slider is displayed
         */
        this.displayValue = true;

        /** Slider.valueSpan
         *
         * The SPAN element containing the current value
         *
         * @see Slider.displayValue
         */
        this.valueSpan = null;

        /** Slider.displayNoChange
        *
        * If TRUE, a checkbox for marking a no-change is added
        */
        this.displayNoChange = true;

        /** Slider.noChangeSpan
        *
        * The checkbox form marking the no-change
        *
        * @see Slider.displayNoChange
        * @see Slider.noChangeCheckbox
        */
        this.noChangeSpan = null;

        /** Slider.totalMove
         *
         * The total movement of the slider
         */
        this.totalMove = 0;

        /** Slider.volumeSlider
         *
         * If TRUE, only the slider to the left of the pointer is colored
         *
         * Available types: 'volume', 'flat'.
         */
        this.type = 'volume';

        /** Slider.hoverColor
         *
         * The color of the slider on mouse over
         */
        this.hoverColor = '#2076ea';

        /** Slider.listener
         *
         * The main function listening for slider movement
         *
         * Calls user-defined listener oninput
         *
         * @param {boolean} noChange Optional. The function is invoked
         *   by the no-change checkbox. Note: when the function is invoked
         *   by the browser, noChange is the change event.
         *
         * @see Slider.onmove
         */
        var timeOut = null;
        this.listener = function(noChange) {
            if (!noChange && timeOut) return;

            if (that.isHighlighted()) that.unhighlight();

            timeOut = setTimeout(function() {
                var percent, diffPercent;

                percent = (that.slider.value - that.min) * that.scale;
                diffPercent = percent - that.currentValue;
                that.currentValue = percent;

                // console.log(diffPercent);
                // console.log(that.slider.value, percent);

                if (that.type === 'volume') {
                    // Otherwise it goes a bit outside.
                    if (percent > 99) percent = 99;
                    that.rangeFill.style.width = percent + '%';
                }
                else {
                    that.rangeFill.style.width = '99%';
                }

                if (that.displayValue) {
                    that.valueSpan.innerHTML =
                        that.getText('currentValue', that.slider.value);
                }

                if (that.displayNoChange && noChange !== true) {
                    if (that.noChangeCheckbox.checked) {
                        that.noChangeCheckbox.checked = false;
                        J.removeClass(that.noChangeSpan, 'italic');
                    }
                }

                that.totalMove += Math.abs(diffPercent);

                if (that.onmove) {
                    that.onmove.call(that, that.slider.value, diffPercent);
                }

                timeOut = null;
            }, 0);
        }

        /** Slider.onmove
         *
         * User-defined listener function to slider movement
         *
         * @see Slider.listener
         */
         this.onmove = null;

         /**
         * ### Slider.timeFrom
         *
         * Time event from which measuring time
         *
         * Default: 'step'
         *
         * @see node.timer.getTimeSince
         */
         this.timeFrom = 'step';

    }

    // ## Slider methods

    /**
     * ### Slider.init
     *
     *
     * @param {object} opts Configuration options
     */
    Slider.prototype.init = function(opts) {
        var tmp, e;
        e = 'Slider.init: '

        if ('undefined' !== typeof opts.min) {
            tmp = J.isInt(opts.min);
            if ('number' !== typeof tmp) {
                throw new TypeError(e + 'min must be an integer or ' +
                'undefined. Found: ' + opts.min);
            }
            this.min = tmp;
        }
        if ('undefined' !== typeof opts.max) {
            tmp = J.isInt(opts.max);
            if ('number' !== typeof tmp) {
                throw new TypeError(e + 'max must be an integer or ' +
                'undefined. Found: ' + opts.max);
            }
            this.max = tmp;
        }

        this.scale = 100 / (this.max - this.min);

        tmp = opts.initialValue;
        if ('undefined' !== typeof tmp) {
            if (tmp === 'random') {
                tmp = J.randomInt((this.min-1), this.max);
            }
            else {
                tmp = J.isInt(tmp, this.min, this.max, true, true);
                if ('number' !== typeof tmp) {
                    throw new TypeError(e + 'initialValue must be an ' +
                    'integer >= ' + this.min + ' and =< ' + this.max +
                    ' or undefined. Found: ' + opts.initialValue);
                }

            }
            // currentValue is used with the first update.
            this.initialValue = this.currentValue = tmp;
        }

        if ('undefined' !== typeof opts.displayValue) {
            this.displayValue = !!opts.displayValue;
        }
        if ('undefined' !== typeof opts.displayNoChange) {
            this.displayNoChange = !!opts.displayNoChange;
        }

        if (opts.type) {
            if (opts.type !== 'volume' && opts.type !== 'flat') {
                throw new TypeError(e + 'type must be "volume", "flat", or ' +
                'undefined. Found: ' + opts.type);
            }
            this.type = opts.type;
        }

        tmp = opts.requiredChoice;

        if ('undefined' !== typeof tmp) {
            console.log('***Slider.init: requiredChoice is deprecated. Use ' +
            'required instead.***');
        }
        else if ('undefined' !== typeof opts.required) {
            tmp = opts.required;
        }
        if ('undefined' !== typeof tmp) {
            this.requiredChoice = this.required = !!tmp;
        }

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText) {
                throw new TypeError(e + 'mainText must be string or ' +
                                    'undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        if ('undefined' !== typeof opts.hint) {
            if (false !== opts.hint && 'string' !== typeof opts.hint) {
                throw new TypeError(e + 'hint must be a string, false, or ' +
                                    'undefined. Found: ' + opts.hint);
            }
            this.hint = opts.hint;
        }
        else {
            // TODO: Do we need it?
            // this.hint = this.getText('autoHint');
        }

        if (this.required && this.hint !== false) {
            if (!this.hint) this.hint = 'Movement required';
            this.hint += ' *';
        }

        if (opts.onmove) {
            if ('function' !== typeof opts.onmove) {
                throw new TypeError(e + 'onmove must be a function or ' +
                                    'undefined. Found: ' + opts.onmove);
            }
            this.onmove = opts.onmove;
        }

        if (opts.width) {
            if ('string' !== typeof opts.width) {
                throw new TypeError(e + 'width must be string or ' +
                                    'undefined. Found: ' + opts.width);
            }
            this.sliderWidth = opts.width;
        }

        if (opts.hoverColor) {
            if ('string' !== typeof opts.hoverColor) {
                throw new TypeError(e + 'hoverColor must be string or ' +
                                    'undefined. Found: ' + opts.hoverColor);
            }
            this.hoverColor = opts.hoverColor;
        }

        if ('undefined' !== typeof opts.correctValue) {
            if (false === J.isNumber(opts.correctValue,
                                     this.min, this.max, true, true)) {

                throw new Error(e + 'correctValue must be a number between ' +
                                this.min + ' and ' + this.max + '. Found: ' +
                                opts.correctValue);
            }
            this.correctValue = opts.correctValue;
        }
    };

    /**
     * ### Slider.append
     *
     *g
     * @param {object} opts Configuration options
     */
    Slider.prototype.append = function() {
        var container;

        // The original color of the rangeFill container (default black)
        // that is replaced upon highlighting.
        // Need to do js onmouseover because ccs:hover does not work here.
        var tmpColor;

        var that = this;

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'slider-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.bodyDiv, {
                className: 'slider-hint',
                innerHTML: this.hint
            });
        }

        container = W.add('div', this.bodyDiv, {
            className: 'container-slider'
        });

        this.rangeFill = W.add('div', container, {
            className: 'fill-slider',
            // id: 'range-fill'
        });

        this.slider = W.add('input', container, {
            className: 'volume-slider',
            // id: 'range-slider-input',
            name: 'rangeslider',
            type: 'range',
            min: this.min,
            max: this.max
        });

        this.slider.onmouseover = function() {
            tmpColor = that.rangeFill.style.background || 'black';
            that.rangeFill.style.background = that.hoverColor;
        };
        this.slider.onmouseout = function() {
            that.rangeFill.style.background = tmpColor;
        };

        if (this.sliderWidth) this.slider.style.width = this.sliderWidth;

        if (this.displayValue) {
            this.valueSpan = W.add('span', this.bodyDiv, {
                className: 'slider-display-value'
            });
        }

        if (this.displayNoChange) {
            this.noChangeSpan = W.add('span', this.bodyDiv, {
                className: 'slider-display-nochange',
                innerHTML: this.getText('noChange') + '&nbsp;'
            });
            this.noChangeCheckbox = W.add('input', this.noChangeSpan, {
                type: 'checkbox'
            });
            this.noChangeCheckbox.onclick = function() {
                if (that.noChangeCheckbox.checked) {
                    if (that.slider.value === that.initialValue) return;
                    that.slider.value = that.initialValue;
                    that.listener(true);
                    J.addClass(that.noChangeSpan, 'italic');
                }
                else {
                    J.removeClass(that.noChangeSpan, 'italic');
                }

            };
        }

        this.slider.oninput = this.listener;
        this.slider.value = this.initialValue;

        this.slider.oninput();
    };

    Slider.prototype.getValues = function(opts) {
        var res, value, nochange;
        opts = opts || {};
        res = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        value = this.currentValue;
        nochange = this.noChangeCheckbox && this.noChangeCheckbox.checked;
        if ((this.required && this.totalMove === 0 && !nochange) ||
           (null !== this.correctValue && this.correctValue !== value)) {

            if (opts.highlight) this.highlight();
            res = false;
        }

        return {
            value: value,
            noChange: !!nochange,
            initialValue: this.initialValue,
            totalMove: this.totalMove,
            isCorrect: res,
            time: node.timer.getTimeSince(this.timeFrom)
        };
    };

    Slider.prototype.setValues = function(opts) {
        opts = opts || {};
        this.slider.value = opts.value;
        this.slider.oninput();
    };

})(node);

/**
 * # SVOGauge
 * Copyright(c) 2021 Stefano Balietti
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

    SVOGauge.version = '0.8.1';
    SVOGauge.description = 'Displays an interface to measure social ' +
        'value orientation (S.V.O.).';

    SVOGauge.title = 'SVO Gauge';
    SVOGauge.className = 'svogauge';

    SVOGauge.texts = {
        mainText: 'You and another randomly selected participant ' +
        'will receive an <em>extra bonus</em>.<br/>' +
        'Choose the preferred bonus amounts (in cents) for you ' +
        'and the other participant in each row.<br/>' +
        'We will select <em>one row at random</em> ' +
        'and add the bonus to your and the ' +
        'other participant\'s payment. Your choice will remain '  +
        '<em>anonymous</em>.',

        left: 'Your Bonus:<hr/>Other\'s Bonus:'
    };

    // ## Dependencies

    SVOGauge.dependencies = {};

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
    function SVOGauge() {

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
         * ### SVOGauge.mainText
         *
         * A text preceeding the SVO gauger
         */
        this.mainText = null;

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
     * @param {object} opts Optional. Configuration options.
     */
    SVOGauge.prototype.init = function(opts) {
        var gauge, that;
        if ('undefined' !== typeof opts.method) {
            if ('string' !== typeof opts.method) {
                throw new TypeError('SVOGauge.init: method must be string ' +
                                    'or undefined. Found: ' + opts.method);
            }
            if (!this.methods[opts.method]) {
                throw new Error('SVOGauge.init: method is invalid: ' +
                                opts.method);
            }
            this.method = opts.method;
        }
        if ('undefined' !== typeof opts.mainText) {
            if (opts.mainText !== false && 'string' !== typeof opts.mainText) {
                throw new TypeError('SVOGauge.init: mainText must be string ' +
                                    'false, or undefined. Found: ' +
                                     opts.mainText);
            }
            this.mainText = opts.mainText;
        }

        // Call method.
        gauge = this.methods[this.method].call(this, opts);

        // Add defaults.
        that = this;
        gauge.isHidden = function() { return that.isHidden(); };
        gauge.isCollapsed = function() { return that.isCollapsed(); };

        // Check properties.
        if (!node.widgets.isWidget(gauge)) {
            throw new Error('SVOGauge.init: method ' + this.method +
                            ' created invalid gauge: missing default widget ' +
                            'methods.')
        }
        // Approved.
        this.gauge = gauge;

        this.on('enabled', function() {
            gauge.enable();
        });

        this.on('disabled', function() {
            gauge.disable();
        });

        this.on('highlighted', function() {
            gauge.highlight();
        });

        this.on('unhighlighted', function() {
            gauge.unhighlight();
        });
    };

    SVOGauge.prototype.append = function() {
        node.widgets.append(this.gauge, this.bodyDiv);
    };

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

    // ## Available methods.

    // ### SVO_Slider
    function SVO_Slider(options) {
        var items, sliders, mainText;
        var gauge, i, len;
        var renderer;

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

        len = sliders.length;
        items = new Array(len);

        i = -1;
        for ( ; ++i < len ; ) {
            items[i] = {
                id: (i+1),
                left: this.getText('left'),
                choices: sliders[i]
            };
        }

        if (this.mainText) {
            mainText = this.mainText;
        }
        else if (this.mainText !== false) {
            mainText = this.getText('mainText');
        }
        gauge = node.widgets.get('ChoiceTableGroup', {
            id: options.id || 'svo_slider',
            items: items,
            mainText: mainText,
            title: false,
            renderer: renderer,
            requiredChoice: this.required,
            storeRef: false
        });

        return gauge;
    }

})(node);

/**
 * # VisualRound
 * Copyright(c) 2020 Stefano Balietti
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

    node.widgets.register('VisualRound', VisualRound);

    // ## Meta-data

    VisualRound.version = '0.9.0';
    VisualRound.description = 'Displays current/total/left round/stage/step. ';

    VisualRound.title = false;
    VisualRound.className = 'visualround';

    VisualRound.texts = {
        round: 'Round',
        step: 'Step',
        stage: 'Stage',
        roundLeft: 'Rounds Left',
        stepLeft: 'Steps Left',
        stageLeft: 'Stages Left'
    };

    // ## Dependencies

    VisualRound.dependencies = {
        GamePlot: {}
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

        /**
         * ### VisualRound.separator
         *
         * Stages and rounds are separated with this string, if needed
         *
         * E.g., Stage 3/5
         */
        this.separator = ' / ';

        /**
         * ### VisualRound.layout
         *
         * Display layout
         *
         * @see VisualRound.setLayout
         */
        this.layout = null;

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
     *   - `preprocess`: a function that may modify information about
     *     steps, rounds and stages before they are displayed; its context
     *     is the current widget and it receives an object to modify:
     *     ```js
     *     {
     *       totRound: 1,
     *       totStep: 2,
     *       totStage: 5,
     *       curStep: 1,
     *       curStage: 1,
     *       curRound: 1
     *     }
     *   ```
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
     *
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
            this.curStep = this.options.curStep || 1;
            this.curRound = this.options.curRound || 1;
            this.totStage = this.options.totStage;
            this.totRound = this.options.totRound;
            this.totStep = this.options.totStep;
            this.oldStageId = this.options.oldStageId;
        }

        // Save references to gamePlot and stager for convenience.
        if (!this.gamePlot) this.gamePlot = node.game.plot;
        if (!this.stager) this.stager = this.gamePlot.stager;

        this.updateInformation();

        if (!this.options.displayMode && this.options.displayModeNames) {
            console.log('***VisualTimer.init: options.displayModeNames is ' +
                        'deprecated. Use options.displayMode instead.***');
            this.options.displayMode = this.options.displayModeNames;
        }

        if (!this.options.displayMode) {
            this.setDisplayMode([
                'COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1',
                'COUNT_UP_STAGES_TO_TOTAL'
            ]);
        }
        else {
            this.setDisplayMode(this.options.displayMode);
        }

        if ('undefined' !== typeof options.separator) {
            this.separator = options.separator;
        }

        if ('undefined' !== typeof options.layout) {
            this.layout = options.layout;
        }

        if ('undefined' !== typeof options.preprocess) {
            if ('function' === typeof options.preprocess) {
                this.preprocess = options.preprocess;
            }
            else {
                throw new TypeError('VisualRound.init: preprocess must ' +
                                    'function or undefined. Found: ' +
                                    options.preprocess);
            }
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
        if (this.displayMode) this.displayMode.updateDisplay();
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
     * - `COUNT_UP_STEPS`: Display only current step number.
     * - `COUNT_UP_STEPS_IFNOT1`: Skip stages with one step.
     * - `COUNT_UP_ROUNDS`: Display only current round number.
     * - `COUNT_UP_ROUNDS_IFNOT1`: Skip stages with one round.
     * - `COUNT_UP_STAGES_TO_TOTAL`: Display current and total stage number.
     * - `COUNT_UP_ROUNDS_TO_TOTAL`: Display current and total round number.
     * - `COUNT_UP_STEPS_TO_TOTAL`: Display current and total step number.
     * - `COUNT_UP_STEPS_TO_TOTAL_IFNOT1`: Skip stages with one step.
     * - `COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1`: Skip stages with one round.
     * - `COUNT_DOWN_STAGES`: Display number of stages left to play.
     * - `COUNT_DOWN_STEPS`: Display number of steps left to play.
     * - `COUNT_DOWN_ROUNDS`: Display number of rounds left in this stage.
     *
     * @param {array|string} displayMode Array of strings representing the names
     *
     * @see VisualRound.displayMode
     * @see CompoundDisplayMode
     * @see VisualRound.init
     */
    VisualRound.prototype.setDisplayMode = function(displayMode) {
        var i, len, displayModes;

        if ('string' === typeof displayMode) {
            displayMode = [ displayMode ];
        }
        else if (!J.isArray(displayMode)) {
            throw new TypeError('VisualRound.setDisplayMode: ' +
                                'displayMode must be array or string. ' +
                                'Found: ' + displayMode);
        }
        len = displayMode.length;
        if (len === 0) {
            throw new Error('VisualRound.setDisplayMode: displayMode is empty');
        }

        if (this.displayMode) {
            // Nothing to do if mode is already active.
            if (displayMode.join('&') === this.displayMode.name) return;
            this.deactivate(this.displayMode);
        }

        // Build `CompoundDisplayMode`.
        displayModes = [];
        i = -1;
        for (; ++i < len; ) {
            switch (displayMode[i]) {
            case 'COUNT_UP_STAGES_TO_TOTAL':
                displayModes.push(new CountUpStages(this, { toTotal: true }));
                break;
            case 'COUNT_UP_STAGES':
                displayModes.push(new CountUpStages(this));
                break;
            case 'COUNT_DOWN_STAGES':
                displayModes.push(new CountDownStages(this));
                break;
            case 'COUNT_UP_STEPS_TO_TOTAL':
                displayModes.push(new CountUpSteps(this, { toTotal: true }));
                break;
            case 'COUNT_UP_STEPS_TO_TOTAL_IFNOT1':
                displayModes.push(new CountUpSteps(this, {
                    toTotal: true,
                    ifNotOne: true
                }));
                break;
            case 'COUNT_UP_STEPS':
                displayModes.push(new CountUpSteps(this));
                break;
            case 'COUNT_UP_STEPS_IFNOT1':
                displayModes.push(new CountUpSteps(this, { ifNotOne: true }));
                break;
            case 'COUNT_DOWN_STEPS':
                displayModes.push(new CountDownSteps(this));
                break;
            case 'COUNT_UP_ROUNDS_TO_TOTAL':
                displayModes.push(new CountUpRounds(this, { toTotal: true }));
                break;
            case 'COUNT_UP_ROUNDS':
                displayModes.push(new CountUpRounds(this));
                break;
            case 'COUNT_UP_ROUNDS_TO_TOTAL_IFNOT1':
                displayModes.push(new CountUpRounds(this, {
                    toTotal: true,
                    ifNotOne: true
                }));
                break;
            case 'COUNT_UP_ROUNDS_IFNOT1':
                displayModes.push(new CountUpRounds(this, { ifNotOne: true }));
                break;
            case 'COUNT_DOWN_ROUNDS':
                displayModes.push(new CountDownRounds(this));
                break;
            default:
                throw new Error('VisualRound.setDisplayMode: unknown mode: ' +
                                displayMode[i]);
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
        if (this.bodyDiv) this.bodyDiv.appendChild(displayMode.displayDiv);
        if (displayMode.activate) displayMode.activate();
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
        if (displayMode.deactivate) displayMode.deactivate();
    };

    VisualRound.prototype.listeners = function() {
        var that;
        that = this;
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
        var stage, len, tmp;

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

            // Compute current values.

            this.curStage = stage.stage;

            // Stage can be indexed by id or number in the sequence.
            if ('string' === typeof this.curStage) {
                this.curStage =
                    this.gamePlot.normalizeGameStage(stage).stage;
            }
            this.curStage -= this.stageOffset;
            // 0.0.0
            if (this.curStage < 1) return;

            this.curStep = stage.step;
            this.curRound = stage.round;

            // Compute total values.

            len = this.stager.sequence.length;
            this.totStage = len - this.totStageOffset;
            if (this.stager.sequence[(len-1)].type === 'gameover') {
                this.totStage--;
            }

            tmp = this.stager.sequence[this.curStage -1];
            this.totRound = tmp.num || 1;
            this.totStep = tmp.steps.length;

            // Let user preprocess.
            if (this.preprocess) {
                tmp = {
                    totRound: this.totRound,
                    totStep: this.totStep,
                    totStage: this.totStage,
                    curStep: this.curStep,
                    curStage: this.curStage,
                    curRound: this.curRound,
                };
                this.preprocess(tmp);

                this.curRound = tmp.curRound
                this.curStep = tmp.curStep;
                this.curStage = tmp.curStage
                this.totStage = tmp.totStage;
                this.totStep = tmp.totStep;
                this.totRound = tmp.totRound;
            }
        }
        // Update display.
        this.updateDisplay();
    };

    /**
     * ### VisualRound.setLayout
     *
     * Arranges the relative position of the various elements of VisualRound
     *
     * @param {string} layout. Valid options:
     *   - 'vertical' (alias: 'multimode_vertical')
     *   - 'horizontal'
     *   - 'multimode_horizontal'
     *   - 'all_horizontal'
     */
    VisualRound.prototype.setLayout = function(layout) {
        if ('string' !== typeof layout || layout.trim() === '') {
            throw new TypeError('VisualRound.setLayout: layout must be ' +
                                'a non-empty string. Found: ' + layout);
        }
        this.layout = layout;
        if (this.displayMode) this.displayMode.setLayout(layout);
    };

    // ## Display Modes.

    /**
     * # CountUpStages
     *
     * Display current/total number of stages
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
     */
    function CountUpStages(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_STAGES', options);
        generalInit(this, 'stagediv', this.visualRound.getText('stage'));
    }

    // ## CountUpStages methods

    /**
     * ### CountUpStages.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpStages.prototype.updateDisplay = function() {
        this.current.innerHTML = this.visualRound.curStage;
        if (this.total) this.total.innerHTML = this.visualRound.totStage || '?';
    };

   /**
     * # CountDownStages
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
     */
    function CountDownStages(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_STAGES', options);
        generalInit(this, 'stagediv', visualRound.getText('stageLeft'));
    }

    // ## CountDownStages methods

    /**
     * ### CountDownStages.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     */
    CountDownStages.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totStage === v.curStage) {
            this.current.innerHTML = 0;
        }
        else {
            this.current.innerHTML = (v.totStage - v.curStage) || '?';
        }
    };

    /**
      * # CountUpSteps
      *
      * Displays the current/total number of steps
      */

    /**
     * ## CountUpSteps constructor
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
     */
    function CountUpSteps(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_STEPS', options);
        generalInit(this, 'stepdiv', this.visualRound.getText('step'));
    }

    /**
     * ### CountUpSteps.updateDisplay
     *
     * Updates the content of `curStageNumber` and `totStageNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpSteps.prototype.updateDisplay = function() {
        if (this.options.ifNotOne && this.visualRound.totStep === 1) {
            this.displayDiv.style.display = 'none';
        }
        else {
            this.current.innerHTML = this.visualRound.curStep;
            if (this.total) {
                this.total.innerHTML = this.visualRound.totStep || '?';
            }
            this.displayDiv.style.display = '';
        }
    };

   /**
     * # CountDownSteps
     *
     * DisplayMode which displays the remaining number of steps
     */

    /**
     * ## CountDownStages constructor
     *
     * Display mode which displays the remaining number of steps
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs.
     * @param {object} options Optional. Configuration options
     */
    function CountDownSteps(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_STEPS', options);
        generalInit(this, 'stepdiv', this.visualRound.getText('stepLeft'));
    }

    // ## CountDownSteps methods

    /**
     * ### CountDownSteps.updateDisplay
     *
     * Updates the content of `stagesLeft` according to `visualRound`
     */
    CountDownSteps.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totStep === v.curStep) this.current.innerHTML = 0;
        else this.current.innerHTML = (v.totStep - v.curStep) || '?';
    };

   /**
     * # CountUpRounds
     *
     * Displays the current and possibly the total number of rounds
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
     */
    function CountUpRounds(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_UP_ROUNDS', options);
        generalInit(this, 'rounddiv', visualRound.getText('round'));
    }

    // ## CountUpRounds methods

    /**
     * ### CountUpRounds.updateDisplay
     *
     * Updates the content of `curRoundNumber` and `totRoundNumber`
     *
     * Values are updated according to the state of `visualRound`.
     */
    CountUpRounds.prototype.updateDisplay = function() {
        if (this.options.ifNotOne && this.visualRound.totRound === 1) {
            this.displayDiv.style.display = 'none';
        }
        else {
            this.current.innerHTML = this.visualRound.curRound;
            if (this.total) {
                this.total.innerHTML = this.visualRound.totRound || '?';
            }
            this.displayDiv.style.display = '';
        }
    };


   /**
     * # CountDownRounds
     *
     * Displays the remaining number of rounds
     */

    /**
     * ## CountDownRounds constructor
     *
     * Display mode which displays the remaining number of rounds
     *
     * @param {VisualRound} visualRound The `VisualRound` object to which the
     *   displayMode belongs
     * @param {object} options Optional. Configuration options
     */
    function CountDownRounds(visualRound, options) {
        generalConstructor(this, visualRound, 'COUNT_DOWN_ROUNDS', options);
        generalInit(this, 'rounddiv', visualRound.getText('roundLeft'));
    }

    // ## CountDownRounds methods

    /**
     * ### CountDownRounds.updateDisplay
     *
     * Updates the content of `roundsLeft` according to `visualRound`
     */
    CountDownRounds.prototype.updateDisplay = function() {
        var v;
        v = this.visualRound;
        if (v.totRound === v.curRound) this.current.innerHTML = 0;
        else this.current.innerHTML = (v.totRound - v.curRound) || '?';
    };

    /**
     * # CompoundDisplayMode
     *
     * Creates a display mode which groups together other display modes
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
     */
    function CompoundDisplayMode(visualRound, displayModes, options) {

        /**
         * ### CompoundDisplayMode.visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         */
        this.visualRound = visualRound;

         /**
         * ### CompoundDisplayMode.displayModes
         *
         * The array of displayModes to be used in combination
         */
        this.displayModes = displayModes;

        /**
         * ### CompoundDisplayMode.name
         *
         * The name of the displayMode
         */
        this.name = displayModes.join('&');

        /**
         * ### CompoundDisplayMode.options
         *
         * Current options
         */
        this.options = options || {};

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
     CompoundDisplayMode.prototype.init = function() {
         var i, len;
         this.displayDiv = W.get('div');
         i = -1, len = this.displayModes.length;
         for (; ++i < len; ) {
             this.displayDiv.appendChild(this.displayModes[i].displayDiv);
         }
         this.updateDisplay();
     };

    /**
     * ### CompoundDisplayMode.updateDisplay
     *
     * Calls `updateDisplay` for all displayModes in the combination
     */
    CompoundDisplayMode.prototype.updateDisplay = function() {
        var i, len;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            this.displayModes[i].updateDisplay();
        }
    };

    CompoundDisplayMode.prototype.activate = function() {
        var i, len, d, layout;
        layout = this.visualRound.layout;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            if (d.activate) this.displayModes[i].activate();
            if (layout) setLayout(d, layout, i === (len-1));
        }
    };

    CompoundDisplayMode.prototype.deactivate = function() {
        var i, len, d;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            if (d.deactivate) d.deactivate();
        }
    };

    CompoundDisplayMode.prototype.setLayout = function(layout) {
        var i, len, d;
        i = -1, len = this.displayModes.length;
        for (; ++i < len; ) {
            d = this.displayModes[i];
            setLayout(d, layout, i === (len-1));
        }
    };

    // ## Helper Methods.

    function setLayout(d, layout, lastDisplay) {
        if (layout === 'vertical' || layout === 'multimode_vertical' ||
            layout === 'all_vertical') {

            d.displayDiv.style.float = 'none';
            d.titleDiv.style.float = 'none';
            d.titleDiv.style['margin-right'] = '0px';
            d.contentDiv.style.float = 'none';
            return true;
        }
        if (layout === 'horizontal') {
            d.displayDiv.style.float = 'none';
            d.titleDiv.style.float = 'left';
            d.titleDiv.style['margin-right'] = '6px';
            d.contentDiv.style.float = 'right';
            return true;
        }
        if (layout === 'multimode_horizontal') {
            d.displayDiv.style.float = 'left';
            d.titleDiv.style.float = 'none';
            d.titleDiv.style['margin-right'] = '0px';
            d.contentDiv.style.float = 'none';
            if (!lastDisplay) {
                d.displayDiv.style['margin-right'] = '10px';
            }
            return true;
        }
        if (layout === 'all_horizontal') {
            d.displayDiv.style.float = 'left';
            d.titleDiv.style.float = 'left';
            d.titleDiv.style['margin-right'] = '6px';
            d.contentDiv.style.float = 'right';
            if (!lastDisplay) {
                d.displayDiv.style['margin-right'] = '10px';
            }
            return true;
        }
        return false;
    }

    /**
     * ### generalConstructor
     *
     * Sets up the basic attributes of visualization mode for VisualRound
     *
     * @param {object} that The visualization mode instance
     * @param {VisualRound} visualRound The VisualRound instance
     * @param {string} name The name of the visualization mode
     * @param {object} options Additional options, e.g. 'toTotal'
     */
    function generalConstructor(that, visualRound, name, options) {
        options = options || {};

        /**
         * #### visualRound
         *
         * The `VisualRound` object to which the displayMode belongs
         */
        that.visualRound = visualRound;

        /**
         * #### name
         *
         * The name of the displayMode
         */
        that.name = name;
        if (options.toTotal) that.name += '_TO_TOTAL';

        /**
         * #### options
         *
         * The options for this instance
         */
        that.options = options;

        /**
         * #### displayDiv
         *
         * The DIV in which the information is displayed
         */
        that.displayDiv = null;

        /**
         * #### displayDiv
         *
         * The DIV in which the title is displayed
         */
        that.titleDiv = null;

        /**
         * #### contentDiv
         *
         * The DIV containing the actual information
         */
        that.contentDiv = null;

        /**
         * #### current
         *
         * The span in which the number (of rounds, steps, stages) is displayed
         */
        that.current = null;

        /**
         * #### textDiv
         *
         * The span in which the text ` of ` is displayed
         *
         * It is created only if the display mode requires it
         */
        that.textDiv = null;

        /**
         * #### total
         *
         * The span in which the total number (of rounds, etc.) is displayed
         *
         * It is created only if the display mode requires it
         */
        that.total = null;
    }

    /**
     * ### generalInit
     *
     * Adds three divs: a container with a nested title and content div
     *
     * Adds references to the instance: displayDiv, titleDiv, contentDiv.
     *
     * @param {object} The instance to which the references are added.
     * @param {string} The name of the container div
     */
    function generalInit(that, containerName, title) {
        that.displayDiv = W.get('div', { className: containerName });
        that.titleDiv = W.add('div', that.displayDiv, {
            className: 'title',
            innerHTML: title
        });
        that.contentDiv = W.add('div', that.displayDiv, {
            className: 'content'
        });
        that.current = W.append('span', that.contentDiv, {
            className: 'number'
        });
        if (that.options.toTotal) {
            that.textDiv = W.append('span', that.contentDiv, {
                className: 'text',
                innerHTML: that.visualRound.separator
            });
            that.total = W.append('span', that.contentDiv, {
                className: 'number'
            });
        }
        that.updateDisplay();
    }

})(node);

/**
 * # VisualStage
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Shows the name of the current, previous and next step.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var Table = W.Table;

    node.widgets.register('VisualStage', VisualStage);

    // ## Meta-data

    VisualStage.version = '0.11.0';
    VisualStage.description =
        'Displays the name of the current, previous and next step of the game.';

    VisualStage.title = false;
    VisualStage.className = 'visualstage';

    VisualStage.texts = {
        miss: '',
        current: 'Stage: ',
        previous: 'Prev: ',
        next: 'Next: '
    };

    // ## Dependencies

    VisualStage.dependencies = {
        Table: {}
    };

    /**
     * ## VisualStage constructor
     */
    function VisualStage() {

        // ### VisualStage.displayMode
        //
        // The display mode: 'compact', 'table'.
        this.displayMode = 'inline';

        // ### VisualStage.table
        //
        // The HTML element containing the information in 'table' mode
        this.table = null;

        // ### VisualStage.preprocess
        //
        // A callback function preprocessing the information displayed
        this.preprocess = null;

        // ### VisualStage.order
        //
        // The order in which information is displayed, if available.
        //
        // In 'init' it gets reassigned based on displayMode.
        this.order = [ 'current', 'next', 'previous' ];

        // ### VisualStage.capitalize
        //
        // If TRUE, the name/id of a step is capitalized. Default: TRUE.
        this.capitalize = true;

        // ### VisualStage.replaceUnderscore
        //
        // If TRUE, underscores are replaced with spaces. Default: TRUE.
        this.replaceUnderscore = true;

        // Default display settings.

        // ### VisualStage.addRound
        //
        // If TRUE, round number is added to the name of steps in repeat stages
        this.addRound = true;

        // ### VisualStage.showPrevious
        //
        // If TRUE, the name of the previuos step is displayed.
        this.showPrevious = false;

        // ### VisualStage.showCurrent
        //
        // If TRUE, the name of the current step is displayed.
        this.showCurrent = true;

        // ### VisualStage.showNext
        //
        // If TRUE, the name of the next step is displayed.
        this.showNext = true;
    }

    // ## VisualStage methods

    VisualStage.prototype.init = function(opts) {
        var err;
        if ('undefined' !== typeof opts.displayMode) {
            if (opts.displayMode !== 'inline' &&
                opts.displayMode !== 'table') {

                throw new TypeError('VisualStage.init: displayMode must be ' +
                                    '"inline", "table" or undefined. ' +
                                    'Found: ' + opts.displayMode);
            }
            this.displayMode = opts.displayMode;
        }
        if ('undefined' !== typeof opts.addRound) {
            this.addRound = !!opts.addRound;
        }
        if ('undefined' !== typeof opts.previous) {
            this.showPrevious = !!opts.previous;
        }
        if ('undefined' !== typeof opts.next) {
            this.showNext = !!opts.next;
        }
        if ('undefined' !== typeof opts.current) {
            this.showCurrent = !!opts.current;
        }
        if ('undefined' !== typeof opts.order) {
            if (!J.isArray(opts.order) || opts.order.length !== 3) {
                throw new TypeError('VisualStage.init: order must be ' +
                                    'an array of length 3 or undefined. ' +
                                    'Found: ' + opts.order);
            }
            err = checkOrderOption(opts.order, this.order.slice(0));
            if (err) {
                throw new TypeError('VisualStage.init: order contains ' +
                                    'errors: ' + opts.order);
            }
            this.order = opts.order;
        }
        else {
            if (this.displayMode === 'inline') {
                this.order = [ 'previous', 'current', 'next' ];
            }
        }
        if ('undefined' !== typeof opts.preprocess) {
            if ('function' !== typeof opts.preprocess) {
                throw new TypeError('VisualStage.init: preprocess must be ' +
                                    'function or undefined. Found: ' +
                                    opts.preprocess);
            }
            this.preprocess = opts.preprocess;
        }
        if ('undefined' !== typeof opts.capitalize) {
            this.capitalize = !!opts.capitalize;
        }

        if ('undefined' !== typeof opts.replaceUnderscore) {
            this.replaceUnderscore = !!opts.replaceUnderscore;
        }
    };

    /**
     * ### VisualStage.append
     *
     * Appends widget to `this.bodyDiv` and writes the stage
     *
     * @see VisualStage.updateDisplay
     */
    VisualStage.prototype.append = function() {
        if (this.displayMode === 'table') {
            this.table = new Table();
            this.bodyDiv.appendChild(this.table.table);
        }
        else {
            this.div = W.append('div', this.bodyDiv);
        }
        this.updateDisplay();
    };

    VisualStage.prototype.listeners = function() {
        var that = this;
        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.updateDisplay();
        });
        // Game over and init?
    };

    /**
     * ### VisualStage.updateDisplay
     *
     * Writes the current, previous and next step names
     *
     * It uses the step property `name`, if existing, otherwise `id`.
     * Depending on current settings, it capitalizes it, and preprocess it.
     *
     * @see VisualStage.getStepName
     */
    VisualStage.prototype.updateDisplay = function() {
        var curStep, nextStep, prevStep;
        var curStepName, nextStepName, prevStepName;
        var order, t;

        order = {};
        curStep = node.game.getCurrentGameStage();
        if (curStep) {
            if (this.showCurrent) {
                curStepName = this.getStepName(curStep, curStep, 'current');
                order.current = curStepName;
            }
            if (this.showNext) {
                nextStep = node.game.plot.next(curStep);
                if (nextStep) {
                    nextStepName = this.getStepName(nextStep, curStep, 'next');
                    order.next = nextStepName;
                }
            }
            if (this.showPrevious) {
                prevStep = node.game.plot.previous(curStep);
                if (prevStep) {
                    prevStepName = this.getStepName(prevStep, curStep,
                                                    'previous');
                    order.previous = prevStepName;
                }
            }
        }

        if (this.displayMode === 'table') {
            this.table.clear(true);
            addRow(this, 0, order);
            addRow(this, 1, order);
            addRow(this, 2, order);
            //
            t = this.table.selexec('y', '=', 0);
            t.addClass('strong');
            // t.selexec('x', '=', 1).addClass('underline');
            this.table.parse();
        }
        else {
            this.div.innerHTML = '';
            addSpan(this, 0, order);
            addSpan(this, 1, order);
            addSpan(this, 2, order);
        }
    };

    /**
     * ### VisualStage.getStepName
     *
     * Returns the step name of a given step
     *
     * @param {GameStage} gameStage The game stage we want to to get the name
     * @param {GameStage} curStage The current game stage
     * @param {string} mod A modifier: 'current', 'previous', 'next'.
     *
     * @return {string} name The name of the step
     */
    VisualStage.prototype.getStepName = function(gameStage, curStage, mod) {
        var name, round, preprocess, addRound;
        // Get the name. If no step property is defined, use the id and
        // do some text replacing.
        name = node.game.plot.getProperty(gameStage, 'name');
        if ('function' === typeof name) {
            preprocess = name;
            name = null;
        }
        else if ('object' === typeof name && name !== null) {
            preprocess = name.preprocess;
            addRound = name.addRound;
            name = name.name;
        }
        if (!name) {
            name = node.game.plot.getStep(gameStage);
            if (!name) {
                name = this.getText('miss');
            }
            else {
                name = name.id;
                if (this.replaceUnderscore) name = name.replace(/_/g, " ");
                if (this.capitalize) name = capitalize(name);
            }
        }
        if (!preprocess) preprocess = this.preprocess;
        if ('undefined' === typeof addRound) addRound = this.addRound;

        round = getRound(gameStage, curStage, mod);

        // If function, executes it.
        if (preprocess) name = preprocess.call(node.game, name, mod, round);
        if (addRound && round) name += ' ' + round;

        return name;
    };

    // ## Helper functions.


    /**
     * ### getRound
     *
     * Returns the round for a given step, if its stage is a repeat stage
     *
     * @param {GameStage} gameStage The game stage we want to to get the round
     * @param {GameStage} gameStage The current game stage
     * @param {string} A modifier: 'current', 'previous', 'next'.
     *
     * @return {number} round The round for the step
     *
     * @see getName
     */
    function getRound(gameStage, curStage, mod) {
        var round, totRounds;
        if (!gameStage.stage) return;
        totRounds = node.game.plot.stager.sequence[(gameStage.stage - 1)].num;
        if (!totRounds) return;
        round = node.game.getRound();
        // Same stage: can be current, next, or previous.
        if (curStage.stage === gameStage.stage) {
            if (mod === 'next') round++;
            else if (mod === 'previous') round--;
        }
        // This is a previous stage.
        else if (curStage.stage > gameStage.stage) {
            round = totRounds;
        }
        // This is a next stage.
        else {
            round = 1;
        }
        return round;
    }

    function capitalize(str) {
        var tks, i, len;
        tks = str.split(' ');
        str = capWord(tks[0]);
        len = tks.length;
        if (len > 1) str += ' ' + capWord(tks[1]);
        if (len > 2) {
            for (i = 2; i < len; i++) {
                str += ' ' + capWord(tks[i]);
            }
        }
        return str;
    }

    function capWord(word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    }

    function addRow(that, idx, order) {
        var row, str, type, name, className, obj;
        type = that.order[idx];
        str = that.getText(type);
        name = order[type];
        if (!name) return;
        className = 'visualstage-' + type;
        obj = {
            className: className,
            content: name
        };
        if (str === false) row = [ obj ];
        else if (type === 'current') row = [ { content: name, colspan: 2 } ];
        else row = [ { className: className, content: str }, obj ];
        that.table.addRow(row);
    }

    function addSpan(that, idx, order) {
        var str, tmp;
        tmp = that.order[idx];
        str = order[tmp];
        if (!str) return;
        if (tmp !== 'current') {
            str = '<span class="strong">' +
                that.getText(tmp) + '</span>' + str;
        }
        W.add('span', that.div, {
            innerHTML: str,
            className: 'visualstage-' + tmp
        });
    }

    function checkOrderOption(order, arr) {
        var i;
        i = arr.indexOf(order[0]);
        if (i === -1) return 'unknown item: ' + order[0];
        arr.splice(i,1);
        i = arr.indexOf(order[1]);
        if (i === -1) return 'unknown item: ' + order[1];
        arr.splice(i,1);
        i = arr.indexOf(order[2]);
        if (i === -1) return 'unknown item: ' + order[2];
        arr.splice(i,1);
        if (arr.length) return 'duplicated entry: ' + arr[0];
        return;
    }

})(node);

/**
 * # VisualTimer
 * Copyright(c) 2021 Stefano Balietti <ste@nodegame.org>
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

    node.widgets.register('VisualTimer', VisualTimer);

    // ## Meta-data

    VisualTimer.version = '0.9.3';
    VisualTimer.description = 'Display a configurable timer for the game. ' +
        'Can trigger events. Only for countdown smaller than 1h.';

    VisualTimer.title = 'Time Left';
    VisualTimer.className = 'visualtimer';

    // ## Dependencies

    VisualTimer.dependencies = {
        GameTimer: {}
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

        // We keep the check for object, because this widget is often
        // called by users and the restart methods does not guarantee
        // an object.
        options = options || {};
        if ('object' !== typeof options) {
            throw new TypeError('VisualTimer.init: options must be ' +
                                'object or undefined. Found: ' + options);
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
                    name: options.name || 'VisualTimer_' + J.randomInt(10000000)
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

        // Must be after this.options is assigned.
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

        destroyTimer(this);

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
     * @param {object|number} options Configuration object or the number of
     *     milliseconds
     *
     * @see VisualTimer.init
     * @see VisualTimer.start
     * @see VisualTimer.stop
     */
    VisualTimer.prototype.restart = function(options) {
        this.stop();
        if ('number' === typeof options) options = { milliseconds: options };
        this.init(options);
        this.start();
    };

    /**
     * ### VisualTimer.stop
     *
     * Stops the timer display and stores the time left in `activeBox.timeLeft`
     *
     * @see GameTimer.isStopped
     * @see GameTimer.stop
     */
    VisualTimer.prototype.stop = function() {
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

        // Handle destroy.
        this.on('destroyed', function() {
            destroyTimer(that);
            that.bodyDiv.removeChild(that.mainBox.boxDiv);
            that.bodyDiv.removeChild(that.waitBox.boxDiv);
        });
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

        this.boxDiv =   W.get('div');
        this.titleDiv = W.add('div', this.boxDiv);
        this.bodyDiv =  W.add('div', this.boxDiv);

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

    // Helper function.

    function destroyTimer(that) {
        if (that.internalTimer) {
            if (!that.gameTimer.isDestroyed()) {
                node.timer.destroyTimer(that.gameTimer);
            }
            that.internalTimer = null;
        }
        else {
            that.gameTimer.removeHook('VisualTimer_' + that.wid);
        }
    }

    // if (this.internalTimer) {
    //     if (!this.gameTimer.isDestroyed()) {
    //         node.timer.destroyTimer(this.gameTimer);
    //     }
    //     this.internalTimer = null;
    // }
    // else {
    //     this.gameTimer.removeHook(this.updateHookName);
    // }

})(node);

/**
 * # WaitingRoom
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Displays the number of connected/required players to start a game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('WaitingRoom', WaitingRoom);
    // ## Meta-data

    WaitingRoom.version = '1.3.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'Waiting Room';
    WaitingRoom.className = 'waitingroom';

    // ## Dependencies

    WaitingRoom.dependencies = {
        VisualTimer: {}
    };

    // ## Prototype Properties.

    /** ### WaitingRoom.sounds
     *
     * Default sounds to play on particular events
     */
    WaitingRoom.sounds = {

        // #### dispatch
        dispatch: '/sounds/doorbell.ogg'
    };

    /** ### WaitingRoom.texts
     *
     * Default texts to display
     */
    WaitingRoom.texts = {

        // #### blinkTitle
        blinkTitle: 'GAME STARTS!',

        // #### waitingForConf
        waitingForConf: 'Waiting to receive data',

        // #### executionMode
        executionMode: function(w) {
            if (w.executionMode === 'WAIT_FOR_N_PLAYERS') {
                return 'Waiting for All Players to Connect: ';
            }
            if (w.executionMode === 'WAIT_FOR_DISPATCH') {
                return 'Task will start soon. Please be patient.';
            }
            // TIMEOUT.
            return 'Task will start at: <br>' + w.startDate;
        },

        // #### disconnect
        disconnect: '<span style="color: red">You have been ' +
            '<strong>disconnected</strong>. Please try again later.' +
            '</span><br><br>',

        // #### waitedTooLong
        waitedTooLong: 'Waiting for too long. Please look ' +
            'for a HIT called <strong>Trouble Ticket</strong> and file' +
            ' a new trouble ticket reporting your experience.',

        // #### notEnoughPlayers
        notEnoughPlayers: '<h3 align="center" style="color: red">' +
            'Thank you for your patience.<br>' +
            'Unfortunately, there are not enough participants in ' +
            'your group to start the experiment.<br>',

        // #### roomClosed
        roomClosed: '<span style="color: red"> The ' +
            'waiting room is <strong>CLOSED</strong>. You have been ' +
            'disconnected. Please try again later.</span><br><br>',

        // #### tooManyPlayers
        tooManyPlayers: function(widget, data) {
            var str;
            str = 'There are more players in this waiting room ' +
                'than playslots in the game. ';
            if (widget.poolSize === 1) {
                str += 'Each player will play individually.';
            }
            else {
                str += 'Only ' + data.nGames + ' players will be selected ' +
                    'to play the game.';
            }
            return str;
        },

        // #### notSelectedClosed
        notSelectedClosed: '<h3 align="center">' +
            '<span style="color: red">Unfortunately, you were ' +
            '<strong>not selected</strong> to join the game this time. ' +
            'Thank you for your participation.</span></h3><br><br>',

        // #### notSelectedOpen
        notSelectedOpen: '<h3 align="center">' +
            '<span style="color: red">Unfortunately, you were ' +
            '<strong>not selected</strong> to join the game this time, ' +
            'but you may join the next one.</span><a class="hand" ' +
            'onclick=javascript:this.parentElement.innerHTML="">' +
            'Ok, I got it.</a></h3><br><br>' +
            'Thank you for your participation.</span></h3><br><br>',

        // #### exitCode
        exitCode: function(widget, data) {
            return '<br>You have been disconnected. ' +
                ('undefined' !== typeof data.exit ?
                 ('Please report this exit code: ' + data.exit) : '') +
                '<br></h3>';
        },

        // #### playBot
        playBot: function(widget) {
            if (widget.poolSize === widget.groupSize &&
                widget.groupSize === 1) {

                return 'Play';
            }
            if (widget.groupSize === 2) return 'Play With Bot';
            return 'Play With Bots';
        },

        // #### connectingBots
        connectingBots:  function(widget) {
            console.log(widget.poolSize, widget.groupSize);
            if (widget.poolSize === widget.groupSize &&
                widget.groupSize === 1) {

                return 'Starting, Please Wait...';
            }
            if (widget.groupSize === 2) return 'Connecting Bot, Please Wait...';
            return 'Connecting Bot/s, Please Wait...';
        },

        // #### selectTreatment
        // Trailing space makes it nicer.
        selectTreatment: 'Select Treatment ',

        // #### gameTreatments
        gameTreatments: 'Game:',

        // #### defaultTreatments
        defaultTreatments: 'Defaults:'


    };

    /**
     * ## WaitingRoom constructor
     *
     * Instantiates a new WaitingRoom object
     *
     * @param {object} options
     */
    function WaitingRoom() {

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
         *
         * Server will close the waiting room afterwards.
         *
         * Undefined means no limit.
         */
        this.nGames = undefined;

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
         * ### WaitingRoom.executionMode
         *
         * The execution mode.
         */
        this.executionMode = null;

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
         * ### WaitingRoom.execModeDiv
         *
         * Div containing the span for displaying the number of players
         *
         * @see WaitingRoom.playerCount
         */
        this.execModeDiv = null;

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
         * ### WaitingRoom.disconnectIfNotSelected
         *
         * Flag that indicates whether to disconnect an not selected player
         */
        this.disconnectIfNotSelected = null;

        /**
         * ### WaitingRoom.playWithBotOption
         *
         * If TRUE, it displays a button to begin the game with bots
         *
         * This option is set by the server, local modifications will
         * not have an effect if server does not allow it
         *
         * @see WaitingRoom.playBotBtn
         */
        this.playWithBotOption = null;

        /**
         * ### WaitingRoom.playBotBtn
         *
         * Reference to the button to play with bots
         *
         * Will be created if requested by options.
         *
         * @see WaitingRoom.playWithBotOption
         */
        this.playBotBtn = null;

        /**
         * ### WaitingRoom.selectTreatmentOption
         *
         * If TRUE, it displays a selector to choose the treatment of the game
         *
         * This option is set by the server, local modifications will
         * not have an effect if server does not allow it
         */
        this.selectTreatmentOption = null;

        /**
         * ### WaitingRoom.treatmentBtn
         *
         * Holds the name of selected treatment
         *
         * Only used if `selectTreatmentOption` is enabled
         *
         * @see WaitingRoom.selectTreatmentOption
         */
        this.selectedTreatment = null;

    }

    // ## WaitingRoom methods

    /**
     * ### WaitingRoom.init
     *
     * Setups the requirements widget
     *
     * TODO: Update this doc (list of options).
     *
     * Available options:
     *
     *   - onComplete: function executed with either failure or success
     *   - onTimeout: function executed when timer runs out
     *   - onSuccess: function executed when all tests succeed
     *   - waitTime: max waiting time to execute all tests (in milliseconds)
     *   - startDate: max waiting time to execute all tests (in milliseconds)
     *   - playWithBotOption: displays button to dispatch players with bots
     *   - selectTreatmentOption: displays treatment selector
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        var that = this;

        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object. ' +
                                'Found: ' + conf);
        }

        // It receives the TEXTS AND SOUNDS only first.
        if (!conf.executionMode) return;

        // TODO: check types and conditions?
        this.executionMode = conf.executionMode;

        if (conf.onTimeout) {
            if ('function' !== typeof conf.onTimeout) {
                throw new TypeError('WaitingRoom.init: conf.onTimeout must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onTimeout);
            }
            this.onTimeout = conf.onTimeout;
        }

        if (conf.waitTime) {
            if (null !== conf.waitTime &&
                'number' !== typeof conf.waitTime) {

                throw new TypeError('WaitingRoom.init: conf.waitTime ' +
                                    'must be number, null or undefined. ' +
                                    'Found: ' + conf.waitTime);
            }
            this.waitTime = conf.waitTime;
        }

        if (conf.startDate) {
            this.startDate = new Date(conf.startDate).toString();
        }

        if (conf.poolSize) {
            if (conf.poolSize && 'number' !== typeof conf.poolSize) {
                throw new TypeError('WaitingRoom.init: conf.poolSize ' +
                                    'must be number or undefined. Found: ' +
                                    conf.poolSize);
            }
            this.poolSize = conf.poolSize;
        }

        if (conf.groupSize) {
            if (conf.groupSize && 'number' !== typeof conf.groupSize) {
                throw new TypeError('WaitingRoom.init: conf.groupSize ' +
                                    'must be number or undefined. Found: ' +
                                    conf.groupSize);
            }
            this.groupSize = conf.groupSize;
        }
        if (conf.nGames) {
            if (conf.nGames && 'number' !== typeof conf.nGames) {
                throw new TypeError('WaitingRoom.init: conf.nGames ' +
                                    'must be number or undefined. Found: ' +
                                    conf.nGames);
            }
            this.nGames = conf.nGames;
        }

        if (conf.connected) {
            if (conf.connected && 'number' !== typeof conf.connected) {
                throw new TypeError('WaitingRoom.init: conf.connected ' +
                                    'must be number or undefined. Found: ' +
                                    conf.connected);
            }
            this.connected = conf.connected;
        }

        if (conf.disconnectIfNotSelected) {
            if ('boolean' !== typeof conf.disconnectIfNotSelected) {
                throw new TypeError('WaitingRoom.init: ' +
                    'conf.disconnectIfNotSelected must be boolean or ' +
                    'undefined. Found: ' + conf.disconnectIfNotSelected);
            }
            this.disconnectIfNotSelected = conf.disconnectIfNotSelected;
        }
        else {
            this.disconnectIfNotSelected = false;
        }


        if (conf.playWithBotOption) this.playWithBotOption = true;
        else this.playWithBotOption = false;
        if (conf.selectTreatmentOption) this.selectTreatmentOption = true;
        else this.selectTreatmentOption = false;


        // Display Exec Mode.
        this.displayExecMode();

        // Button for bots and treatments.

        if (this.playWithBotOption && !document.getElementById('bot_btn')) {
            // Closure to create button group.
            (function(w) {
                var btnGroup = document.createElement('div');
                btnGroup.role = 'group';
                btnGroup['aria-label'] = 'Play Buttons';
                btnGroup.className = 'btn-group';

                var playBotBtn = document.createElement('input');
                playBotBtn.className = 'btn btn-primary btn-lg';
                playBotBtn.value = w.getText('playBot');
                playBotBtn.id = 'bot_btn';
                playBotBtn.type = 'button';
                playBotBtn.onclick = function() {
                    w.playBotBtn.value = w.getText('connectingBots');
                    w.playBotBtn.disabled = true;
                    node.say('PLAYWITHBOT', 'SERVER', w.selectedTreatment);
                    setTimeout(function() {
                        w.playBotBtn.value = w.getText('playBot');
                        w.playBotBtn.disabled = false;
                    }, 5000);
                };

                btnGroup.appendChild(playBotBtn);

                // Store reference in widget.
                w.playBotBtn = playBotBtn;

                if (w.selectTreatmentOption) {

                    var btnGroupTreatments = document.createElement('div');
                    btnGroupTreatments.role = 'group';
                    btnGroupTreatments['aria-label'] = 'Select Treatment';
                    btnGroupTreatments.className = 'btn-group';

                    var btnTreatment = document.createElement('button');
                    btnTreatment.className = 'btn btn-default btn-lg ' +
                        'dropdown-toggle';
                    btnTreatment['data-toggle'] = 'dropdown';
                    btnTreatment['aria-haspopup'] = 'true';
                    btnTreatment['aria-expanded'] = 'false';
                    btnTreatment.innerHTML = w.getText('selectTreatment');

                    var span = document.createElement('span');
                    span.className = 'caret';

                    btnTreatment.appendChild(span);

                    var ul = document.createElement('ul');
                    ul.className = 'dropdown-menu';
                    ul.style['text-align'] = 'left';

                    var li, a, t, liT1, liT2, liT3;
                    if (conf.availableTreatments) {
                        li = document.createElement('li');
                        li.innerHTML = w.getText('gameTreatments');
                        li.className = 'dropdown-header';
                        ul.appendChild(li);
                        for (t in conf.availableTreatments) {
                            if (conf.availableTreatments.hasOwnProperty(t)) {
                                li = document.createElement('li');
                                li.id = t;
                                a = document.createElement('a');
                                a.href = '#';
                                a.innerHTML = '<strong>' + t + '</strong>: ' +
                                    conf.availableTreatments[t];
                                li.appendChild(a);
                                if (t === 'treatment_latin_square') liT3 = li;
                                else if (t === 'treatment_rotate') liT1 = li;
                                else if (t === 'treatment_random') liT2 = li;
                                else ul.appendChild(li);
                            }
                        }
                        li = document.createElement('li');
                        li.role = 'separator';
                        li.className = 'divider';
                        ul.appendChild(li);
                        li = document.createElement('li');
                        li.innerHTML = w.getText('defaultTreatments');
                        li.className = 'dropdown-header';
                        ul.appendChild(li);
                        ul.appendChild(liT1);
                        ul.appendChild(liT2);
                        ul.appendChild(liT3);
                    }

                    btnGroupTreatments.appendChild(btnTreatment);
                    btnGroupTreatments.appendChild(ul);

                    btnGroup.appendChild(btnGroupTreatments);

                    // We are not using bootstrap js files
                    // and we redo the job manually here.
                    btnTreatment.onclick = function() {
                        // When '' is hidden by bootstrap class.
                        if (ul.style.display === '') {
                            ul.style.display = 'block';
                        }
                        else {
                            ul.style.display = '';
                        }
                    };

                    ul.onclick = function(eventData) {
                        var t;
                        t = eventData.target;
                        // When '' is hidden by bootstrap class.
                        ul.style.display = '';
                        t = t.parentNode.id;
                        // Clicked on description?
                        if (!t) t = eventData.target.parentNode.parentNode.id;
                        // Nothing relevant clicked (e.g., header).
                        if (!t) return;
                        btnTreatment.innerHTML = t + ' ';
                        btnTreatment.appendChild(span);
                        w.selectedTreatment = t;
                    };

                    // Store Reference in widget.
                    w.treatmentBtn = btnTreatment;
                }
                // Append button group.
                w.bodyDiv.appendChild(document.createElement('br'));
                w.bodyDiv.appendChild(btnGroup);

            })(this);
        }

        // Handle destroy.
        this.on('destroyed', function() {
            if (that.dots) that.dots.stop();
            node.deregisterSetup('waitroom');
        });
    };

    /**
     * ### WaitingRoom.startTimer
     *
     * Starts a timeout for the max waiting time
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
                that.bodyDiv.innerHTML = that.getText('waitedTooLong');
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
     * Displays the state of the waiting room on screen (player count)
     *
     * @see WaitingRoom.updateState
     */
    WaitingRoom.prototype.updateDisplay = function() {
        var numberOfGameSlots, numberOfGames;
        if (this.connected > this.poolSize) {
            numberOfGames = Math.floor(this.connected / this.groupSize);
            if ('undefined' !== typeof this.nGames) {
                numberOfGames = numberOfGames > this.nGames ?
                    this.nGames : numberOfGames;
            }
            numberOfGameSlots = numberOfGames * this.groupSize;

            this.playerCount.innerHTML = '<span style="color:red">' +
                this.connected + '</span>' + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = '';

            // Update text.
            this.playerCountTooHigh.innerHTML =
                this.getText('tooManyPlayers', { nGames: numberOfGameSlots });
        }
        else {
            this.playerCount.innerHTML = this.connected + ' / ' + this.poolSize;
            this.playerCountTooHigh.style.display = 'none';
        }
    };

    /**
     * ### WaitingRoom.displayExecMode
     *
     * Builds the basic layout of the execution mode
     *
     * @see WaitingRoom.executionMode
     */
    WaitingRoom.prototype.displayExecMode = function() {
        this.bodyDiv.innerHTML = '';

        this.execModeDiv = document.createElement('div');
        this.execModeDiv.id = 'exec-mode-div';

        this.execModeDiv.innerHTML = this.getText('executionMode');

        // TODO: add only on some modes? Depending on settings?
        this.playerCount = document.createElement('p');
        this.playerCount.id = 'player-count';
        this.execModeDiv.appendChild(this.playerCount);

        this.playerCountTooHigh = document.createElement('div');
        this.playerCountTooHigh.style.display = 'none';
        this.execModeDiv.appendChild(this.playerCountTooHigh);

        this.startDateDiv = document.createElement('div');
        this.startDateDiv.style.display= 'none';
        this.execModeDiv.appendChild(this.startDateDiv);

        this.dots = W.getLoadingDots();
        this.execModeDiv.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.execModeDiv);

        this.msgDiv = document.createElement('div');
        this.bodyDiv.appendChild(this.msgDiv);


        // if (this.startDate) this.setStartDate(this.startDate);
        if (this.waitTime) this.startTimer();

    };

    WaitingRoom.prototype.append = function() {
        // Configuration will arrive soon.
        this.bodyDiv.innerHTML = this.getText('waitingForConf');
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

            // It receives 2 conf messages.
            if (!conf.executionMode) {
                // Sounds.
                that.setSounds(conf.sounds);
                // Texts.
                that.setTexts(conf.texts);
            }
            else {
                // Configure all requirements.
                that.init(conf);
            }

            return conf;
        });

        // NodeGame Listeners.
        node.on.data('PLAYERSCONNECTED', function(msg) {
            if (!msg.data) return;
            that.connected = msg.data;
            that.updateDisplay();
        });

        node.on.data('DISPATCH', function(msg) {
            var data, reportExitCode;
            msg = msg || {};
            data = msg.data || {};

            if (that.dots) that.dots.stop();

            // Alert player he/she is about to play.
            if (data.action === 'allPlayersConnected') {
                that.alertPlayer();
            }
            // Not selected/no game/etc.
            else {
                reportExitCode = that.getText('exitCode', data);

                if (data.action === 'notEnoughPlayers') {
                    that.bodyDiv.innerHTML = that.getText(data.action);
                    if (that.onTimeout) that.onTimeout(msg.data);
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
                else if (data.action === 'notSelected') {

                    if (false === data.shouldDispatchMoreGames ||
                        that.disconnectIfNotSelected) {

                        that.bodyDiv.innerHTML =
                            that.getText('notSelectedClosed');

                        that.disconnect(that.bodyDiv.innerHTML +
                                        reportExitCode);
                    }
                    else {
                        that.msgDiv.innerHTML = that.getText('notSelectedOpen');
                    }
                }
                else if (data.action === 'disconnect') {
                    that.disconnect(that.bodyDiv.innerHTML + reportExitCode);
                }
            }
        });

        node.on.data('TIME', function() {
            node.info('waiting room: TIME IS UP!');
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
            that.bodyDiv.innerHTML = that.getText('disconnect');

            // Enough to not display it in case of page refresh.
            // setTimeout(function() {
            //              alert('Disconnection from server detected!');
            //             }, 200);
        });

        node.on.data('ROOM_CLOSED', function() {
            that.disconnect(that.getText('roomClosed'));
        });
    };

    WaitingRoom.prototype.stopTimer = function() {
        if (this.timer) {
            node.info('waiting room: STOPPING TIMER');
            this.timer.destroy();
        }
    };

    /**
     * ### WaitingRoom.disconnect
     *
     * Disconnects the playr, stops the timer, and displays a msg
     *
     * @param {string|function} msg. Optional. A disconnect message. If set,
     *    replaces the current value for future calls.
     *
     * @see WaitingRoom.setText
     */
    WaitingRoom.prototype.disconnect = function(msg) {
        if (msg) this.setText('disconnect', msg);
        node.socket.disconnect();
        this.stopTimer();
    };

    WaitingRoom.prototype.alertPlayer = function() {
        var clearBlink, onFrame;
        var blink, sound;

        blink = this.getText('blinkTitle');

        sound = this.getSound('dispatch');

        // Play sound, if requested.
        if (sound) J.playSound(sound);

        // If blinkTitle is falsy, don't blink the title.
        if (!blink) return;

        // If document.hasFocus() returns TRUE, then just one repeat is enough.
        if (document.hasFocus && document.hasFocus()) {
            J.blinkTitle(blink, { repeatFor: 1 });
        }
        // Otherwise we repeat blinking until an event that shows that the
        // user is active on the page happens, e.g. focus and click. However,
        // the iframe is not created yet, and even later. if the user clicks it
        // it won't be detected in the main window, so we need to handle it.
        else {
            clearBlink = J.blinkTitle(blink, {
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

})(node);
