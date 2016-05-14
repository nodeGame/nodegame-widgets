/**
 * # Widget
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Prototype of a widget class
 *
 * Prototype methods will be injected in every new widget, if missing.
 *
 * Properties:
 *
 *  - headingDiv,
 *  - bodyDiv,
 *  - footer
 *
 * can be automatically, depending on widget configuration.
 *
 * @see Widgets.get
 * @see Widgets.append
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.Widget = Widget;

    function Widget() {}

    Widget.prototype.dependencies = {};

    Widget.prototype.listeners = function() {};

    Widget.prototype.getValues = function() {};

    Widget.prototype.append = function() {};

    Widget.prototype.init = function() {};

    Widget.prototype.getAllValues = function() {};

    Widget.prototype.highlight = function() {};

    Widget.prototype.unhighlight = function() {};

    Widget.prototype.isHighlighted = function() {};

    Widget.prototype.enable = function() {};

    Widget.prototype.disable = function() {};

    /**
     * ### Widget.isEnabled
     *
     * Returns TRUE if widget is enabled
     *
     * `Widgets.get` wraps this method in an outer callback performing
     * default cleanup operations.
     *
     * @return {boolean} TRUE if
     *
     * @see Widget.enable
     * @see Widget.disable
     * @see Widget.enabled
     */
    Widget.prototype.isEnabled = function() {
        return this.enabled;
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
