/**
 * # ChoiceTable
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

    node.widgets.register('ChoiceTable', ChoiceTable);

    // ## Meta-data

    ChoiceTable.version = '0.7.0';
    ChoiceTable.description = 'Creates a configurable table where ' +
        'each cell is a selectable choice.';

    ChoiceTable.title = 'Make your choice';
    ChoiceTable.className = 'choicetable';

    // ## Dependencies

    ChoiceTable.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceTable constructor
     *
     * Creates a new instance of ChoiceTable
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as the clickable
     *   table. All other options are passed to the init method.
     *
     * @see ChoiceTable.init
     */
    function ChoiceTable(options) {
        var that;
        that = this;

        /**
         * ### ChoiceTable.table
         *
         * The HTML element triggering node.done() when pressed
         */
        if ('object' === typeof options.table) {
            this.table = options.table;
        }
        else if ('undefined' === typeof options.table) {
            this.table = document.createElement('table');
        }
        else {
            throw new TypeError('ChoiceTable constructor: options.table must ' +
                                'be object or undefined. Found: ' +
                                options.table);
        }

        // Table id.
        if ('string' === typeof options.tableId) {
            this.table.id = options.tableId;
        }
        else {
            throw new TypeError('ChoiceTable.init: options.tableId must ' +
                                'be string. Found: ' + options.tableId);
        }

        // Add 'choicetable' class to table.
        J.addClass(this.table, ChoiceTable.className);

        /**
         * ## ChoiceTable.listener
         *
         * The listener function
         *
         * @see GameChoice.enable
         * @see GameChoice.disable
         */
        this.listener = function(e) {
            var item, name, value, td, q, oldSelected, unset;
            e = e || window.event;
            td = e.target || e.srcElement;

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split('_');

//            if (value.length === 2) {
                name = value[0];
                value = value[1];
//            }
// For multiple rows.
//             else {
//                 name = value[0];
//                 item = value[1];
//                 value = value[2];
//
//                 name = item;
//             }

            // One more click.
            that.numberOfClicks++;

            // If only 1 selection allowed, remove selection from oldSelected.
            if (!that.selectMultiple) {
                oldSelected = that.selected;
                if (oldSelected) J.removeClass(oldSelected, 'selected');

                if (that.isChoiceCurrent(value)) {
                    that.unsetCurrentChoice(value);
                }
                else {
                    that.currentChoice = value;
                    J.addClass(td, 'selected');
                    that.selected = td;
                }
            }

            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        /**
         * ### ChoiceTable.disabled
         *
         * Flag indicating if the event listener onclick is active
         */
        this.disabled = true;

        // Enable onclick listener.
        this.enable();

        /**
         * ### ChoiceTable.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceTable.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceTable.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceTable.choices
         *
         * The array available choices
         */
        this.choices = null;

        /**
         * ### ChoiceTable.values
         *
         * Map of choices' values to indexes in the choices array
         */
        this.choicesValues = {};

        /**
         * ### ChoiceTable.order
         *
         * The order of the choices as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceTable.correctChoice
         *
         * The array of correct choice/s
         *
         * The field is an array or number|string depending
         * on the value of ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selectMultiple
         */
        this.correctChoice = null;

        /**
         * ### ChoiceTable.attempts
         *
         * List of currentChoices at the moment of verifying correct answers
         */
        this.attempts = [];

        /**
         * ### ChoiceTable.choiceCells
         *
         * The cells of the table associated with each choice
         */
        this.choiceCells = null;

        /**
         * ### ChoiceTable.numberOfClicks
         *
         * Total number of clicks on different choices
         */
        this.numberOfClicks = 0;

        /**
         * ### ChoiceTable.selected
         *
         * Currently selected cell/s
         *
         * @see ChoiceTable.currentChoice
         */
        this.selected = null;

        /**
         * ### ChoiceTable.currentChoice
         *
         * Choice/s associated with currently selected cell/s
         *
         * The field is an array or number|string depending
         * on the value of ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selected
         */
        this.currentChoice = null;

        /**
         * ### ChoiceTable.selectMultiple
         *
         * If TRUE, it allows to select multiple cells
         */
        this.selectMultiple = null;

        /**
         * ### ChoiceTable.shuffleChoices
         *
         * If TRUE, choices are randomly assigned to cells
         *
         * @see ChoiceTable.order
         */
        this.shuffleChoices = null;

        /**
         * ### ChoiceTable.renderer
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
         */
        this.renderer = null;

        /**
         * ### ChoiceTable.orientation
         *
         * Orientation of display of choices: vertical ('V') or horizontal ('H')
         *
         * Default orientation is horizontal.
         */
        this.orientation = 'H';

        /**
         * ### ChoiceTable.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceTable.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceTable.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceTable.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        /**
         * ### ChoiceTable.highlighted
         *
         * TRUE, when the choice table was highlighted
         *
         * @see ChoiceTable.highlight
         */
        this.textareaUsed = null;


        // Init.
        this.init(options);
    }

    // ## ChoiceTable methods

    /**
     * ### ChoiceTable.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the table (string, array), or false
     *       to have none.
     *   - orientation: orientation of the table: vertical (v) or horizontal (h)
     *   - group: the name of the group (number or string), if any
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - choices: the array of available choices. See
     *       `ChoiceTable.renderChoice` for info about the format
     *   - correctChoice: the array|number|string of correct choices. See
     *       `ChoiceTable.setCorrectChoice` for info about the format
     *   - selectMultiple: if TRUE multiple cells can be selected
     *   - shuffleChoices: if TRUE, choices are shuffled before being added
     *       to the table
     *   - renderer: a function that will render the choices. See
     *       ChoiceTable.renderer for info about the format
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceTable.prototype.init = function(options) {
        var tmp, that;
        options = options || {};
        that = this;

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
                throw new TypeError('ChoiceTable.init: options.className ' +
                                    'must be string, array, or undefined. ' +
                                    'Found: ' + options.className);
            }
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof options.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof options.orientation) {
            throw new TypeError('ChoiceTable.init: options.orientation must ' +
                                'be string, or undefined. Found: ' +
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
                throw new Error('ChoiceTable.init: options.orientation is ' +
                                'invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleChoices, default false.
        if ('undefined' === typeof options.shuffleChoices) tmp = false;
        else tmp = !!options.shuffleChoices;
        this.shuffleChoices = tmp;

        // Option selectMultiple, default false.
        if ('undefined' === typeof options.selectMultiple) tmp = false;
        else tmp = !!options.selectMultiple;
        this.selectMultiple = tmp;

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.setChoices(options.choices);
        }

        // Add the correct choices.
        if ('undefined' !== typeof options.correctChoice) {
            this.setCorrectChoice(options.correctChoice);
        }

        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTable.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the group, if any.
        if ('function' === typeof options.onclick) {
            this.listener = function(e) {
                options.onclick.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.onclick) {
            throw new TypeError('ChoiceTable.init: options.onclick must ' +
                                'be function or undefined. Found: ' +
                                options.onclick);
        }

        // Set the group, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceTable.init: options.group must ' +
                                'be string, undefined. Found: ' +
                                options.mainText);
        }

        // Creates a free-text textarea, possibly with an initial text
        if (options.freeText) {

            this.textarea = document.createElement('textarea');
            this.textarea.id = this.table.id + '_text';
            this.textarea.className = ChoiceTable.className + '-freetext';

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
     * ### ChoiceTable.setChoices
     *
     * Sets the available choices and builds the table accordingly
     *
     * @param {array} choices The array of choices
     *
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.orientation
     */
    ChoiceTable.prototype.setChoices = function(choices) {
        var i, len, tr, td, H;
        if (!J.isArray(choices)) {
            throw new TypeError('ChoiceTable.init: choices must be array.');
        }
        if (!choices.length) {
            throw new Error('ChoiceTable.setChoices: choices is empty array.');
        }
        this.choices = choices;
        len = choices.length;

        // Pre-allocate the choiceCells array.
        this.choiceCells = new Array(len);

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleChoices) this.order = J.shuffle(this.order);

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = document.createElement('tr');
            this.table.appendChild(tr);
        }
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = document.createElement('tr');
                this.table.appendChild(tr);
            }
            td = this.renderChoice(this.choices[this.order[i]], i);
            tr.appendChild(td);
            // Save reference to cell.
            this.choiceCells[i] = td;
        }
    };

    /**
     * ### ChoiceTable.renderChoice
     *
     * Transforms a choice element into a cell of the table
     *
     * @param {mixed} choice The choice element. It must be string or number,
     *   or array where the first element is the 'value' (incorporated in the
     *   `id` field) and the second the text to display as choice. If a
     *   If renderer function is defined there are no restriction on the
     *   format of choice
     * @param {number} idx The position of the choice within the choice array
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.renderer
     */
    ChoiceTable.prototype.renderChoice = function(choice, idx) {
        var td, value;
        td = document.createElement('td');

        // Get value and choice.
        if (this.renderer) {
            // If a callback is defined, use it.
            value = this.renderer(td, choice, idx);
        }
        else if (J.isArray(choice)) {
            value = choice[0];
            choice = choice[1];
        }
        else {
            value = this.shuffleChoices ? this.order[idx] : idx;
        }

        // Map a value to the index.
        if ('undefined' !== typeof this.choicesValues[value]) {
            throw new Error('ChoiceTable.renderChoice: value already ' +
                            'in use: ' + value);
        }
        this.choicesValues[value] = idx;

        if ('string' === typeof choice || 'number' === typeof choice) {
            td.innerHTML = choice;
        }
        else if (J.isElement(choice) || J.isNode(choice)) {
            td.appendChild(choice);
        }
        else {
            throw new Error('ChoiceTable.renderChoice: invalid choice: ' +
                            choice);
        }

        // Add the id if not added already by the renderer function.
        if (!td.id || td.id === '') td.id = this.table.id + '_' + value;

        return td;
    };

    /**
     * ### ChoiceTable.setCorrectChoice
     *
     * Set the correct choice/s
     *
     * @param {number|string|array} If `selectMultiple` is set, param must
     *   be an array, otherwise a string or a number. Each correct choice
     *   must have been already defined as choice (value)
     *
     * @see ChoiceTable.setChoices
     */
    ChoiceTable.prototype.setCorrectChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple) {
            choice = checkCorrectChoiceParam(this, choice);
        }
        else {
            if (J.isArray(choice) && choice.length) {
                i = -1, len = choice.length;
                for ( ; ++i < len ; ) {
                    choice[i] = checkCorrectChoiceParam(this, choice[i]);
                }
            }
            else {
                throw new TypeError('ChoiceTable.setCorrectChoice: choices ' +
                                    'must be non-empty array.');
            }
        }
        this.correctChoice = choice;
    };

    ChoiceTable.prototype.append = function() {

        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = ChoiceTable.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            this.bodyDiv.appendChild(this.spanMainText);
        }

        this.bodyDiv.appendChild(this.table);
        if (this.textarea) this.bodyDiv.appendChild(this.textarea);
    };

    ChoiceTable.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceTable.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    ChoiceTable.prototype.disable = function() {
        if (this.disabled) return;
        this.disabled = true;
        J.removeClass(this.table, 'clickable');
        this.table.removeEventListener('click', this.listener);
    };

    /**
     * ### ChoiceTable.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTable.prototype.enable = function() {
        if (!this.disabled) return;
        J.addClass(this.table, 'clickable');
        this.disabled = false;
        this.table.addEventListener('click', this.listener);
    };

    /**
     * ### ChoiceTable.verifyChoices
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTable.prototype.verifyChoices = function() {
        var i, len, j, lenJ, c, clone, found;
        if (!this.selectMultiple) {
            return this.currentChoice === this.correctChoice;
        }
        else {
            len = this.correctChoice.length;
            lenJ = this.currentChoice.length;
            // Quick check.
            if (len !== lenJ) return false;
            // Check every item
            i = -1;
            clone = this.currentChoice.slice(0);
            for ( ; ++i < len ; ) {
                found = false;
                c = this.correctChoices[i];
                j = -1;
                for ( ; ++j < lenJ ; ) {
                    if (clone[j] === c) {
                        found = true;
                        break;
                    }
                }
                if (!found) return false;
            }
            return true;
        }
    };

    /**
     * ### ChoiceTable.setCurrentChoice
     *
     * Marks a choice as current
     *
     * If `ChoiceTable.selectMultiple` is set multiple choices can be current.
     *
     * @param {number|string} The choice to mark as current
     *
     * @see ChoiceTable.currentChoice
     * @see ChoiceTable.selectMultiple
     */
    ChoiceTable.prototype.setCurrentChoice = function(choice) {
        if (!this.selectMultiple) this.currentChoice = choice;
        else this.currentChoice.push(choice);
    };

    /**
     * ### ChoiceTable.unsetCurrentChoice
     *
     * Deletes the value for currentChoice
     *
     * If `ChoiceTable.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete from currentChoice
     *   when multiple selections are allowed
     *
     * @see ChoiceTable.currentChoice
     * @see ChoiceTable.selectMultiple
     */
    ChoiceTable.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple || 'undefined' === typeof choice) {
            this.currentChoice = null;
        }
        else {
            if ('string' !== typeof choice && 'number' !== typeof choice) {
                throw new TypeError('ChoiceTable.unsetCurrentChoice: choice ' +
                                    'must be string, number or undefined.');
            }
            i = -1, len = this.currentChoice.length;
            for ( ; ++i < len ; ) {
                if (this.currentChoice[i] === choice) {
                    this.currentChoice.splice(i,1);
                    break;
                }
            }
        }
    };

    /**
     * ### ChoiceTable.isChoiceCurrent
     *
     * Returns TRUE if a choice is currently selected
     *
     * @param {number|string} The choice to check
     *
     * @return {boolean} TRUE, if the choice is currently selected
     */
    ChoiceTable.prototype.isChoiceCurrent = function(choice) {
        var i, len;
        if ('string' !== typeof choice && 'number' !== typeof choice) {
            throw new TypeError('ChoiceTable.isChoiceCurrent: choice ' +
                                'must be string or number.');
        }
        if (!this.selectMultiple) {
            return this.currentChoice === choice;
        }
        else {
            i = -1, len = this.currentChoice.length;
            for ( ; ++i < len ; ) {
                if (this.currentChoice[i] === choice) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * ### ChoiceTable.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTable.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceTable.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.unhighlight = function() {
        this.table.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceTable.isHighlighted
     *
     * Returns TRUE if the choice table is highlighted
     *
     * @return {boolean} ChoiceTable.highlighted
     */
    ChoiceTable.prototype.isHighlighted = function() {
        return this.highlighted;
    };

    /**
     * ### ChoiceTable.getAllValues
     *
     * Returns the values for current selection and other paradata
     *
     * @return {object} Object containing the choice and paradata
     */
    ChoiceTable.prototype.getAllValues = function() {
        var obj;
        obj = {
            id: this.table.id,
            freetext: 'NA',
            choice: J.clone(this.currentChoice),
            time: 'NA',
            attempts: 'NA',
            nClicks: this.numberOfClicks,
            order: this.order,
            group: this.group,
            groupOrder: this.groupOrder
        };
        if (null !== this.correctChoice) obj.isCorrect = this.verifyChoices();
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    // ## Helper methods.

    /**
     * ### checkCorrectChoiceParam
     *
     * Checks the input parameters of method ChoiceTable.setCorrectChoice
     *
     * The function transforms numbers into string, because then the checking
     * is done with strings (they are serialized in the id property of tds).
     *
     * If `ChoiceTable.selectMultiple` is set, the function checks each
     * value of the array separately.
     *
     * @param {ChoiceTable} that This instance
     * @param {string|number} An already existing value of a choice
     *
     * @return {string} The checked choice
     */
    function checkCorrectChoiceParam(that, choice) {
        if ('number' === typeof choice) choice = '' + choice;
        if ('string' !== typeof choice) {
            throw new TypeError('ChoiceTable.setCorrectChoice: each choice ' +
                                'must be number or string. Found: ' + choice);
        }
        if ('undefined' === typeof that.choicesValues[choice]) {
            throw new TypeError('ChoiceTable.setCorrectChoice: choice ' +
                                'not found: ' + choice);
        }
        return choice;
    }

})(node);
