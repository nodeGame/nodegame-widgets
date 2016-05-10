/**
 * # ChoiceTable
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable table where each cell is a selectable choice
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceTable', ChoiceTable);

    // ## Meta-data

    ChoiceTable.version = '1.0.0';
    ChoiceTable.description = 'Creates a configurable table where ' +
        'each cell is a selectable choice.';

    ChoiceTable.title = 'Make your choice';
    ChoiceTable.className = 'choicetable';

    ChoiceTable.separator = '::';

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

        if ('string' !== typeof options.id) {
            throw new TypeError('ChoiceTable constructor: options.id must ' +
                                'be string. Found: ' + options.id);
        }
        if (W.getElementById(options.id)) {
            throw new TypeError('ChoiceTable constructor: options.id is not ' +
                                'unique: ' + options.id);
        }

        /**
         * ### ChoiceTable.id
         *
         * The ID of the instance
         *
         * Will be used as the table id, and as prefix for all choice TDs
         */
        this.id = options.id;

        /**
         * ### ChoiceTable.className
         *
         * The className of the instance
         */
        this.className = null;

        /**
         * ### ChoiceTable.table
         *
         * The HTML element triggering the listener function when clicked
         */
        this.table = null;

        /**
         * ## ChoiceTable.listener
         *
         * The listener function
         *
         * @see GameChoice.enable
         * @see GameChoice.disable
         */
        this.listener = function(e) {
            var name, value, td, oldSelected;

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
         * ### ChoiceTable.choicesCells
         *
         * The cells of the table associated with each choice
         */
        this.choicesCells = null;

        /**
         * ### ChoiceTable.description
         *
         * A title included in the first cell of the row/column
         *
         * It will be placed to the left of the choices if orientation
         * is horizontal, or above the choices if orientation is vertical
         *
         * @see ChoiceTable.orientation
         */
        this.description = null;

        /**
         * ### ChoiceTable.descriptionCell
         *
         * The rendered title cell
         *
         * @see ChoiceTable.renderChoicesTitle
         */
        this.descriptionCell = null;

        /**
         * ### ChoiceTable.timeCurrentChoice
         *
         * Time when the last choice was made
         */
        this.timeCurrentChoice = null;

        /**
         * ### ChoiceTable.timeFrom
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
         * ### ChoiceTable.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default ChoiceTable.separator
         */
        this.separator = ChoiceTable.separator;

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
     *   - groupOrder: the order of the table in the group, if any
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
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceTable.prototype.init = function(options) {
        var tmp, that;
        options = options || {};
        that = this;

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

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceTable.init: options.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the onclick listener, if any.
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

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceTable.init: options.mainText must ' +
                                'be string, undefined. Found: ' +
                                options.mainText);
        }

        // Set the timeFrom, if any.
        if (options.timeFrom === false ||
            'string' === typeof options.timeFrom) {

            this.timeFrom = options.timeFrom;
        }
        else if ('undefined' !== typeof options.timeFrom) {
            throw new TypeError('ChoiceTable.init: options.timeFrom must ' +
                                'be string, false, or undefined. Found: ' +
                                options.timeFrom);
        }

        // Set the separator, if any.
        if ('string' === typeof options.separator) {
            this.separator = options.separator;
        }
        else if ('undefined' !== typeof options.separator) {
            throw new TypeError('ChoiceTable.init: options.separator must ' +
                                'be string, or undefined. Found: ' +
                                options.separator);
        }

        // Conflict might be generated by id or seperator,
        // as specified by user.
        if (this.id.indexOf(options.separator) !== -1) {
            throw new Error('ChoiceTable.init: options.separator ' +
                            'cannot be a sequence of characters ' +
                            'included in the table id. Found: ' +
                            options.separator);
        }

        // Copy short-form for description (only if not defined).
        if ('undefined' !== typeof options.descr &&
            'undefined' === typeof options.description) {

            options.description = options.descr;
        }

        if ('string' === typeof options.description ||
            'number' === typeof options.description) {

            this.description = '' + options.description;
        }
        else if ('undefined' !== typeof options.description) {
            throw new TypeError('ChoiceTable.init: options.description must ' +
                                'be string, number or undefined. Found: ' +
                                options.description);
        }

        // Set the className, if not use default.
        if ('undefined' === typeof options.className) {
            this.className = ChoiceTable.className;
        }
        else if (options.className === false ||
                 'string' === typeof options.className ||
                 J.isArray(options.className)) {

            this.className = options.className;
        }
        else {
            throw new TypeError('ChoiceTable.init: options.' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + options.className);
        }

        // After all configuration options are evaluated, add choices.

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

            if (this.className) J.addClass(this.table, this.className);
            else this.table.className = '';
        }

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.setChoices(options.choices);
        }

        // Add the correct choices.
        if ('undefined' !== typeof options.correctChoice) {
            this.setCorrectChoice(options.correctChoice);
        }

        // Creates a free-text textarea, possibly with an initial text
        if (options.freeText) {

            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            tmp = this.className ? this.className + '-freetext' : 'freetext';
            this.textarea.className = tmp;

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
     * Sets the available choices and optionally builds the table
     *
     * If a table is defined, it will automatically append the choices
     * as TD cells. Otherwise, the choices will be built but not appended.
     *
     * @param {array} choices The array of choices
     *
     * @see ChoiceTable.table
     * @see ChoiceTable.shuffleChoices
     * @see ChoiceTable.order
     * @see ChoiceTable.buildChoices
     * @see ChoiceTable.buildTableAndChoices
     */
    ChoiceTable.prototype.setChoices = function(choices) {
        var len;
        if (!J.isArray(choices)) {
            throw new TypeError('ChoiceTable.setChoices: choices ' +
                                'must be array.');
        }
        if (!choices.length) {
            throw new Error('ChoiceTable.setChoices: choices is empty array.');
        }
        this.choices = choices;
        len = choices.length;

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleChoices) this.order = J.shuffle(this.order);

        // Build the table and choices at once (faster).
        if (this.table) this.buildTableAndChoices();
        // Or just build choices.
        else this.buildChoices();
    };


    /**
     * ### ChoiceTable.buildChoices
     *
     * Render every choice and stores cell in `choicesCells` array
     *
     * Follows a shuffled order, if set
     *
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.descriptionCell
     */
    ChoiceTable.prototype.buildChoices = function() {
        var i, len;
        i = -1, len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);
        for ( ; ++i < len ; ) {
            this.renderChoice(this.choices[this.order[i]], i);
        }
        if (this.description) this.renderChoicesTitle(this.description);
    };

    /**
     * ### ChoiceTable.buildTable
     *
     * Builds the table of clickable choices and enables it
     *
     * Must be called after choices have been set already.
     *
     * @see ChoiceTable.setChoices
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.orientation
     */
    ChoiceTable.prototype.buildTable = function() {
        var i, len, tr, H;

        len = this.choicesCells.length;

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = document.createElement('tr');
            this.table.appendChild(tr);
            // Add horizontal choices title.
            if (this.descriptionCell) tr.appendChild(this.descriptionCell);
        }
        // Main loop.
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = document.createElement('tr');
                this.table.appendChild(tr);
                // Add vertical choices title.
                if (i === 0 && this.descriptionCell) {
                    tr.appendChild(this.descriptionCell);
                    tr = document.createElement('tr');
                    this.table.appendChild(tr);
                }
            }
            // Clickable cell.
            tr.appendChild(this.choicesCells[i]);
        }
        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTable.buildTableAndChoices
     *
     * Builds the table of clickable choices
     *
     * @see ChoiceTable.choices
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.orientation
     */
    ChoiceTable.prototype.buildTableAndChoices = function() {
        var i, len, tr, td, H;

        len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = document.createElement('tr');
            this.table.appendChild(tr);
            // Add horizontal choices description.
            if (this.description) {
                td = this.renderDescription(this.description);
                tr.appendChild(td);
            }
        }
        // Main loop.
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = document.createElement('tr');
                this.table.appendChild(tr);
                // Add vertical choices description.
                if (i === 0 && this.description) {
                    td = this.renderDescription(this.description);
                    tr.appendChild(td);
                    tr = document.createElement('tr');
                    this.table.appendChild(tr);
                }
            }
            // Clickable cell.
            td = this.renderChoice(this.choices[this.order[i]], i);
            tr.appendChild(td);
        }

        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTable.renderDescription
     *
     * Transforms a choice element into a cell of the table
     *
     * @param {mixed} descr The description. It must be string or number,
     *   or array where the first element is the 'value' (incorporated in the
     *   `id` field) and the second the text to display as choice. If a
     *   If renderer function is defined there are no restriction on the
     *   format of choice
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.description
     */
    ChoiceTable.prototype.renderDescription = function(title) {
        var td;
        td = document.createElement('td');
        td.innerHTML = title;
        td.className = this.className ? this.className + '-descr' : 'descr';
        this.descriptionCell = td;
        return td;
    };

    /**
     * ### ChoiceTable.renderChoice
     *
     * Transforms a choice element into a cell of the table
     *
     * A reference to the cell is saved in `choicesCells`.
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
     * @see ChoiceTable.separator
     * @see ChoiceTable.choicesCells
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
        if (!td.id || td.id === '') {
            td.id = this.id + this.separator + value;
        }

        // All fine, updates global variables.
        this.choicesValues[value] = idx;
        this.choicesCells[idx] = td;

        return td;
    };

    /**
     * ### ChoiceTable.setCorrectChoice
     *
     * Set the correct choice/s
     *
     * Correct choice/s are always stored as 'strings', or not number
     * because then they are compared against the valued saved in
     * the `id` field of the cell
     *
     * @param {number|string|array} If `selectMultiple` is set, param must
     *   be an array, otherwise a string or a number. Each correct choice
     *   must have been already defined as choice (value)
     *
     * @see ChoiceTable.setChoices
     * @see checkCorrectChoiceParam
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
            this.spanMainText.className = this.className ?
                ChoiceTable.className + '-maintext' : 'maintext';
            this.spanMainText.innerHTML = this.mainText;
            this.bodyDiv.appendChild(this.spanMainText);
        }
        if (this.table) this.bodyDiv.appendChild(this.table);
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
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
        }
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
        if (!this.table) {
            throw new Error('ChoiceTable.enable: table not defined.');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
    };

    /**
     * ### ChoiceTable.verifyChoice
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
     * @see ChoiceTable.attempts
     * @see ChoiceTable.setCorrectChoice
     */
    ChoiceTable.prototype.verifyChoice = function(markAttempt) {
        var i, len, j, lenJ, c, clone, found;
        // If no correct choice is set return null.
        if (!this.correctChoice) return null;
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        if (markAttempt) this.attempts.push(this.currentChoice);
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
        if (!this.table) return;
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
        if (!this.table) return;
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
     * @see ChoiceTable.verifyChoice
     */
    ChoiceTable.prototype.getAllValues = function(opts) {
        var obj;
        obj = {
            id: this.id,
            choice: J.clone(this.currentChoice),
            time: this.timeCurrentChoice,
            nClicks: this.numberOfClicks
        };
        opts = opts || {};
        if (this.shuffleChoices) {
            obj.order = this.order;
        }
        if (this.group === 0 || this.group) {
            obj.group = this.group;
        }
        if (this.groupOrder === 0 || this.groupOrder) {
            obj.groupOrder = this.groupOrder;
        }
        if (null !== this.correctChoice) {
            obj.isCorrect = this.verifyChoice(opts.markAttempt);
            obj.attemps = this.attemps;
        }
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
