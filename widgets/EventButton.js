/**
 * # EventButton
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a clickable button that fires an event
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS;

    node.widgets.register('EventButton', EventButton);

    // ## Defaults

    EventButton.defaults = {};
    EventButton.defaults.id = 'eventbutton';
    EventButton.defaults.fieldset = false;

    // ## Meta-data

    EventButton.version = '0.2';

    // ## Dependencies

    EventButton.dependencies = {
        JSUS: {}
    };

    function EventButton(options) {
        this.options = options;
        this.id = options.id;

        this.root = null;
        this.text = 'Send';
        this.button = document.createElement('button');
        this.callback = null;
        this.init(this.options);
    }

    EventButton.prototype.init = function(options) {
        options = options || this.options;
        this.button.id = options.id || this.id;
        var text = options.text || this.text;
        while (this.button.hasChildNodes()) {
            this.button.removeChild(this.button.firstChild);
        }
        this.button.appendChild(document.createTextNode(text));
        this.event = options.event || this.event;
        this.callback = options.callback || this.callback;
        var that = this;
        if (this.event) {
            // Emit Event only if callback is successful
            this.button.onclick = function() {
                var ok = true;
                if (this.callback){
                    ok = options.callback.call(node.game);
                }
                if (ok) node.emit(that.event);
            };
        }

        //// Emit DONE only if callback is successful
        //this.button.onclick = function() {
        //        var ok = true;
        //        if (options.exec) ok = options.exec.call(node.game);
        //        if (ok) node.emit(that.event);
        //}
    };

    EventButton.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.button);
        return root;
    };

    EventButton.prototype.listeners = function() {};

    // # DoneButton

    node.widgets.register('DoneButton', DoneButton);

    DoneButton.prototype.__proto__ = EventButton.prototype;
    DoneButton.prototype.constructor = DoneButton;

    // ## Meta-data

    DoneButton.id = 'donebutton';
    DoneButton.version = '0.1';

    // ## Dependencies

    DoneButton.dependencies = {
        EventButton: {}
    };

    function DoneButton (options) {
        options.event = 'DONE';
        options.text = options.text || 'Done!';
        EventButton.call(this, options);
    }

})(node);
