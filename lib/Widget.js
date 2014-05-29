/**
 * # Widget
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Prototype of a widget class.
 * ---
 */
(function(node) {

    "use strict";

    node.Widget = Widget;

    function Widget() {}

    Widget.prototype.dependencies = {};

    Widget.prototype.listeners = function() {};

    Widget.prototype.getValues = function() {};

    Widget.prototype.append = function() {};

    Widget.prototype.init = function() {};

    Widget.prototype.getAllValues = function() {};

    Widget.prototype.highlight = function() {};

    Widget.prototype.destroy = function() {};

    Widget.prototype.setTitle = function(title) {
        if (!this.panelDiv) {
            throw new Error('Widget.setTitle: panelDiv is missing.');
        }

        // Remove heading with false-ish argument.
        if (!title) {
            if (this.headingDiv) {
                this.panelDiv.removeChild(this.headingDiv);
                delete this.headingDiv;
            }
        }
        else {
            if (!this.headingDiv) {
                // Add heading.
                this.headingDiv = W.addDiv(this.panelDiv, undefined,
                        {className: 'panel-heading'});
                // Move it to before the body.
                this.panelDiv.insertBefore(this.headingDiv, this.bodyDiv);
            }

            // Set title.
            this.headingDiv.innerHTML = title;
        }
    };

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
            this.footerDiv.innerHTML = footer;
        }
    };

    Widget.prototype.setContext = function(context) {
        // TODO
    };

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof node) ? node : module.parent.exports.node
);
