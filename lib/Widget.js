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
