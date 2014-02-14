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

    function Widget() {
        this.root = null;
    }

    Widget.prototype.dependencies = {};

    Widget.prototype.defaults = {};

    Widget.prototype.defaults.fieldset = {
        legend: 'Widget'
    };


    Widget.prototype.listeners = function() {};

    Widget.prototype.getRoot = function() {
        return this.root;
    };

    Widget.prototype.getValues = function() {};

    Widget.prototype.append = function() {};

    Widget.prototype.init = function() {};

    Widget.prototype.getRoot = function() {};

    Widget.prototype.listeners = function() {};

    Widget.prototype.getAllValues = function() {};

    Widget.prototype.highlight = function() {};

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof node) ? node : module.parent.exports.node
);