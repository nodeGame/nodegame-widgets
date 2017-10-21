/**
 * # Widget
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
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
                    options = { className: 'panel-heading' };
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
                    options = { className: 'panel-footer' };
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
                                    'HTML element or falsy. Found: ' + title);
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
            throw new TypeError(J.funcName(this.constructor) + '.setContext: ' +
                                'context must be string. Found: ' + context);

        }
        W.removeClass(this.panelDiv, 'panel-[a-z]*');
        W.addClass(this.panelDiv, 'panel-' + context);
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
                       'Widget.setSounds');
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
        return strGetter(this, name, 'sounds', 'Widget.getSound', param);
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
     * @return {object} out Selected sounds (paths)
     *
     * @see Widget.sounds
     * @see Widget.setSound
     * @see Widget.getSound
     * @see Widget.setSounds
     */
    Widget.prototype.getSounds = function(keys, param) {
        return strGetterMulti(this, 'sounds', 'getSound',
                              'Widget.getSounds', keys, param);
    };

    /**
     * ### Widget.getAllSounds
     *
     * Returns an object with all current sounds
     *
     * @param {object} param Optional. Object containing parameters to pass
     *   to the sounds functions (if any)
     *
     * @return {object} out All current sounds
     *
     * @see Widget.getSound
     */
    Widget.prototype.getAllSounds = function(param) {
        return strGetterMulti(this, 'sounds', 'getSound',
                              'Widget.getAllSounds', undefined, param);
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
        strSetter(this, name, value, 'texts', 'Widget.setText');
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
        strSetterMulti(this, texts, 'texts', 'setText', 'Widget.setTexts');
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
        return strGetter(this, name, 'texts', 'Widget.getText', param);
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
     * @return {object} out Selected texts
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.getText
     * @see Widget.setTexts
     * @see Widget.getAllTexts
     */
    Widget.prototype.getTexts = function(keys, param) {
        return strGetterMulti(this, 'texts', 'getText',
                              'Widget.getTexts', keys, param);
    };

    /**
     * ### Widget.getAllTexts
     *
     * Returns an object with all current texts
     *
     * @param {object|array} param Optional. Object containing parameters
     *   to pass to the texts functions (if any)
     *
     * @return {object} out All current texts
     *
     * @see Widget.texts
     * @see Widget.setText
     * @see Widget.setTexts
     * @see Widget.getText
     */
    Widget.prototype.getAllTexts = function(param) {
        return strGetterMulti(this, 'texts', 'getText',
                              'Widget.getAllTexts', undefined, param);
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
        res = that[collection][name] || that.constructor[collection][name];
        if ('function' === typeof res) {
            res = res(that, param);
            if ('string' !== typeof res) {
                throw new TypeError(method + ': cb "' + name +
                                    'did not return a string. Found: ' + res);
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
     * @return {string} res The requested value.
     *
     * @see strGetter
     */
    function strGetterMulti(that, collection, getMethod, method, keys, param) {
        var out, k, len;
        if (!keys) keys = that.constructor[collection];

        out = {};
        if (J.isArray(keys)) {
            k = -1, len = keys.length;
            for ( ; ++k < len; ) {
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
        var i, out;
        out = out || {};
        if ('object' !== typeof obj && 'undefined' !== typeof obj) {
            throw new TypeError(method + ': ' +  collection +
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
