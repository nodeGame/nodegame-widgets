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
