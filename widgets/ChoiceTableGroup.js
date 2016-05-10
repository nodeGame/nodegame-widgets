/**
 * # ChoiceTableGroup
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceTableGroup', ChoiceTableGroup);

    // ## Meta-data

    ChoiceTableGroup.version = '1.0.0';
    ChoiceTableGroup.description = 'Groups together and manages sets of ' +
        'ChoiceTable widgets.';

    ChoiceTableGroup.title = 'Make your choice';
    ChoiceTableGroup.className = 'choicetable';

    ChoiceTableGroup.separator = '::';

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
     *
     * @see ChoiceTableGroup.init
     */
    function ChoiceTableGroup(options) {
        var that;
        that = this;

        // TODO: move them in the Widgets as a check?
        if ('string' !== typeof options.id) {
            throw new TypeError('ChoiceTableGroup constructor: options.id ' +
                                'must be string. Found: ' + options.id);
        }
        if (W.getElementById(options.id)) {
            throw new TypeError('ChoiceTableGroup constructor: options.id ' +
                                'is not unique: ' + options.id);
        }

        /**
         * ### ChoiceTableGroup.id
         *
         * The ID of the instance
         *
         * Will be used as the table id, and as prefix for all choice TDs
         */
        this.id = options.id;

        /**
         * ### ChoiceTableGroup.dl
         *
         * The clickable table containing all the cells
         */
        this.table = null;

        /**
         * ## ChoiceTableGroup.listener
         *
         * The listener function
         *
         * @see GameChoice.enable
         * @see GameChoice.disable
         */
        this.listener = function(e) {
            var name, value, item, td, oldSelected;

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            e = e || window.event;
            td = e.target || e.srcElement;

            // Not a clickable choice.
            if (!td.id || td.id === '') return;

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split(that.separator);

            // Separator not found, not a clickable cell.
            if (value.length === 1) return;

            name = value[0];
            value = value[1];

            item = that.itemsById[name];

            // One more click.
            item.numberOfClicks++;

            // If only 1 selection allowed, remove selection from oldSelected.
            if (!item.selectMultiple) {
                oldSelected = item.selected;
                if (oldSelected) J.removeClass(oldSelected, 'selected');

                if (item.isChoiceCurrent(value)) {
                    item.unsetCurrentChoice(value);
                }
                else {
                    item.currentChoice = value;
                    J.addClass(td, 'selected');
                    item.selected = td;
                }
            }

            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        /**
         * ### ChoiceTableGroup.disabled
         *
         * Flag indicating if the event listener onclick is active
         */
        this.disabled = true;

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
         * ### ChoiceTableGroup.items
         *
         * The array available items
         */
        this.items = null;

        /**
         * ### ChoiceTableGroup.itemsById
         *
         * Map of items ids to items
         */
        this.itemsById = {};

        /**
         * ### ChoiceTableGroup.itemsSettings
         *
         * The array of settings for each item
         */
        this.itemsSettings = null;

        /**
         * ### ChoiceTableGroup.timeFrom
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
         * ### ChoiceTableGroup.order
         *
         * The order of the items as displayed (if shuffled)
         */
        this.order = null;

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
         * ### ChoiceTableGroup.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default ChoiceTableGroup.separator
         */
        this.separator = ChoiceTableGroup.separator;

        // Init.
        this.init(options);
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
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - shuffleTables: if TRUE, items are shuffled before being added
     *       to the table
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceTableGroup.prototype.init = function(options) {
        var tmp, that;
        options = options || {};
        that = this;

        // Option orientation, default 'H'.
        if ('undefined' === typeof options.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof options.orientation) {
            throw new TypeError('ChoiceTableGroup.init: options.orientation ' +
                                'must be string, or undefined. Found: ' +
                                options.orientation);
        }
        else {
            tmp = options.orientation.toLowerCase().trim();
            if (tmp === 'horizontal' || tmp === 'h') {
                tmp = 'H';
            }
            else if (tmp === 'vertical' || tmp === 'v') {
                tmp = 'V';
            }
            else {
                throw new Error('ChoiceTableGroup.init: options.orientation ' +
                                'is invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleTables, default false.
        if ('undefined' === typeof options.shuffleTables) tmp = false;
        else tmp = !!options.shuffleTables;
        this.shuffleTables = tmp;


        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTableGroup.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTableGroup.init: options.groupOrder ' +
                                'must be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the onclick listener, if any.
        if ('function' === typeof options.onclick) {
            this.listener = function(e) {
                options.onclick.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.onclick) {
            throw new TypeError('ChoiceTableGroup.init: options.onclick must ' +
                                'be function or undefined. Found: ' +
                                options.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceTableGroup.init: options.mainText ' +
                                'must be string, undefined. Found: ' +
                                options.mainText);
        }

        // Set the timeFrom, if any.
        if (options.timeFrom === false ||
            'string' === typeof options.timeFrom) {

            this.timeFrom = options.timeFrom;
        }
        else if ('undefined' !== typeof options.timeFrom) {
            throw new TypeError('ChoiceTableGroup.init: options.timeFrom ' +
                                'must be string, false, or undefined. Found: ' +
                                options.timeFrom);
        }




        // After all configuration options are evaluated, add items.

        // Create/set table, if requested.
        if (options.table !== false) {
            if ('object' === typeof options.table) {
                this.table = options.table;
            }
            else if ('undefined' === typeof options.table) {
                this.table = document.createElement('table');
            }
            else {
                throw new TypeError('ChoiceTable constructor: options.table ' +
                                    'must be object, false or undefined. ' +
                                    'Found: ' + options.table);
            }

            // Set table id.
            this.table.id = this.id;
            // Table className.
            if ('undefined' !== typeof options.className) {
                if (options.className === false) {
                    this.table.className = '';
                }
                else if ('string' === typeof options.className ||
                         J.isArray(options.className)) {

                    J.addClass(this.table, options.className);
                }
                else {
                    throw new TypeError('ChoiceTable.init: options.' +
                                        'className must be string, array, ' +
                                        'or undefined. Found: ' +
                                        options.className);
                }
            }
            else {
                // Add default 'choicetable' class to table.
                J.addClass(this.table, ChoiceTableGroup.className);
            }
        }

        // Add the items.
        if ('undefined' !== typeof options.items) {
            this.setItems(options.items);
        }

        // Creates a free-text textarea, possibly with an initial text
        if (options.freeText) {

            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            this.textarea.className = ChoiceTableGroup.className + '-freetext';

            if ('string' === typeof options.freeText) {
                this.textarea.placeholder = options.freeText;
                this.freeText = options.freeText;
            }
            else {
                this.freeText = !!options.freeText;
            }
        }
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
                                'items must be array.');
        }
        if (!items.length) {
            throw new Error('ChoiceTableGroup.setItems: ' +
                            'items is empty array.');
        }

        len = items.length;
        this.itemsSettings = items;
        this.items = new Array(len);

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleItems) this.order = J.shuffle(this.order);

        // Build the table and choices at once (faster).
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
        var j, lenJ, lenJOld, titleOld;

        H = this.orientation === 'H';
        i = -1, len = this.itemsSettings.length;
        if (H) {
            for ( ; ++i < len ; ) {
                // Add new TR.
                tr = document.createElement('tr');
                this.table.appendChild(tr);

                // Get item, append choices for item.
                ct = getChoiceTable(this, i);

                if (!ct.descriptionCell) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'is missing a description: ' + s.id);
                }
                tr.appendChild(ct.descriptionCell);
                j = -1, lenJ = ct.choicesCells.length;
                // Make sure all items have same number of choices.
                if (i === 0) {
                    lenJOld = lenJ;
                }
                else if (lenJ !== lenJOld) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'do not have same number of choices: ' +
                                    s.id);
                }
                // TODO: might optimize. There are two loops (+1 inside ct).
                for ( ; ++j < lenJ ; ) {
                    tr.appendChild(ct.choicesCells[j]);
                }
            }
        }
        else {

            // Add new TR.
            tr = document.createElement('tr');
            this.table.appendChild(tr);

            // Build all items first.
            for ( ; ++i < len ; ) {

                // Get item, append choices for item.
                ct = getChoiceTable(this, i);

                if (!ct.descriptionCell) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'is missing a description: ' + s.id);
                }
                // Make sure all items have same number of choices.
                lenJ = ct.choicesCells.length;
                if (i === 0) {
                    lenJOld = lenJ;
                }
                else if (lenJ !== lenJOld) {
                    throw new Error('ChoiceTableGroup.buildTable: item ' +
                                    'do not have same number of choices: ' +
                                    s.id);
                }

                // Add titles.
                tr.appendChild(ct.descriptionCell);
            }

            j = -1;
            for ( ; ++j < lenJ ; ) {
                // Add new TR.
                tr = document.createElement('tr');
                this.table.appendChild(tr);

                i = -1;
                // TODO: might optimize. There are two loops (+1 inside ct).
                for ( ; ++i < len ; ) {
                    tr.appendChild(this.items[i].choicesCells[j]);
                }
            }
        }

        // Enable onclick listener.
        this.enable();
    };



    ChoiceTableGroup.prototype.append = function() {

        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className =
                ChoiceTableGroup.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            this.bodyDiv.appendChild(this.spanMainText);
        }
        if (this.table) this.bodyDiv.appendChild(this.table);
        if (this.textarea) this.bodyDiv.appendChild(this.textarea);
    };

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
        if (this.disabled) return;
        this.disabled = true;
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
        }
    };

    /**
     * ### ChoiceTableGroup.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTableGroup.prototype.enable = function() {
        if (!this.disabled) return;
        if (!this.table) {
            throw new Error('ChoiceTableGroup.enable: table not defined.');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
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
     * ### ChoiceTableGroup.unsetCurrentChoice
     *
     * Deletes the value for currentChoice
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
        i = -1, len = this.items[i].length;
        for ( ; ++i < len ; ) {
            this.items[i].unsetCurrentChoice();
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
        if (!this.table) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTableGroup.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceTableGroup.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTableGroup.highlighted
     */
    ChoiceTableGroup.prototype.unhighlight = function() {
        if (!this.table) return;
        this.table.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceTableGroup.isHighlighted
     *
     * Returns TRUE if the choice table is highlighted
     *
     * @return {boolean} ChoiceTableGroup.highlighted
     */
    ChoiceTableGroup.prototype.isHighlighted = function() {
        return this.highlighted;
    };

    /**
     * ### ChoiceTableGroup.getAllValues
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
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceTableGroup.verifyChoice
     */
    ChoiceTableGroup.prototype.getAllValues = function(opts) {
        var obj, i, len, tbl;
        obj = {
            id: this.id,
            order: this.order
        };
        opts = opts || {};
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            tbl = this.items[i];
            obj[tbl.id] = tbl.getAllValues(opts);
        }
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    // ## Helper methods.

    function mixinSettings(that, s, i) {
        s.group = that.id;
        s.groupOrder = i+1;
        s.orientation = that.orientation;
        s.title = false;
        s.listeners = false;

        // TODO: more.
        return s;
    }

    function getChoiceTable(that, i) {
        var ct, s;
        s = mixinSettings(that, that.itemsSettings[i], i);
        ct = node.widgets.get('ChoiceTable', s);
        if (that.itemsById[ct.id]) {
            throw new Error('ChoiceTableGroup: an item with the same id ' +
                            'already exists: ' + ct.id);
        }
        that.itemsById[ct.id] = ct;
        that.items[i] = ct;
        return ct;
    }

    var test = {
        id: 'ok',
        title: false,
        orientation: 'V',
        items: [
            {
                id: 'one',
                choices: [1,2,3,4,5],
                description: 'one'
            },
            {
                id: 'three',
                choices: [1,2,3,4,5],
                description: 'three'
            },
            {
                id: 'four',
                choices: [1,2,3,4,5],
                description: 'four'
            }
        ]
    };

    if (node.player.stage.stage !== 0) {
        node.widgets.append('ChoiceTableGroup', document.body, test);
    }

})(node);
