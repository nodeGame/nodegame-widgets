/**
 * # ChoiceTableGroup
 * Copyright(c) 2023 Stefano Balietti
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

    ChoiceTableGroup.version = '1.9.0';
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
        ChoiceTable: {}
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
            tmp = opts.header;
            // One td will colspan all choices.
            if ('string' === typeof tmp) {
                tmp = [ tmp ];
            }
            else if (!J.isArray(tmp) ||
                    (tmp.length !== 1 && tmp.length !== opts.choices.length)) {

                throw new Error('ChoiceTableGroup.init: header ' +
                                'must be string, array (size ' +
                                opts.choices.length +
                                '), or undefined. Found: ' + tmp);
            }

            this.header = tmp;
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
        var i, len, td, tr, H, ct;
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
                    td = W.add('td', tr, {
                        innerHTML: this.header[i],
                        className: 'header'
                    });
                }
                // Only one element, header spans throughout.
                if (i === 1) td.setAttribute('colspan', this.choices.length);
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
        var obj, i, len, tbl, toHighlight, toReset, res;
        obj = {
            id: this.id,
            order: this.order,
            nClicks: 0,
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
            res = tbl.getValues(opts);
            obj.items[tbl.id] = opts.simplify ? res.value : res;
            if (res.choice === null) {
                obj.missValues = true;
                if (this.required || tbl.requiredChoice) {
                    toHighlight = true;
                    obj.isCorrect = false;
                }
            }
            else {
                obj.nClicks += res.nClicks;
            }
            if (res.isCorrect === false && opts.highlight) {
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
