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
