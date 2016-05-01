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

    ChoiceTable.version = '0.1.0';
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

        /**
         * ### ChoiceTable.disabled
         *
         * Flag indicating if the event listener onclick is active
         */
        this.disabled = true;

        // Enable onclick listener.
        this.enable();

        /**
         * ### ChoiceTable.
         *
         * The main text introducing the choices
         */
        this.id = null;

        /**
         * ### ChoiceTable.mainText
         *
         * The main text introducing the choices
         */
        this.mainText = null;

        /**
         * ### ChoiceTable.secondaryText
         *
         * A secondary text to display when needed
         */
        this.secondaryText = null;

        /**
         * ### ChoiceTable.choices
         *
         * The array available choices
         */
        this.choices = null;

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
     * - id: id of the HTML table, or false to have none. Default:
     *     ChoiceTable.className
     * - className: the className of the table (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the table. Default: ChoiceTable.text
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceTable.prototype.init = function(options) {
        var tmp;
        options = options || {};

        // Table id.
        if ('string' === typeof options.id) {
            this.table.id = tmp;
        }
        if ('undefined' !== typeof options.id) {
            throw new TypeError('ChoiceTable.init: options.id must ' +
                                'be string or undefined. Found: ' +
                                options.id);
        }

        // Table className.
        if (options.className === false) {
            tmp = '';
        }
        else if ('string' === typeof options.className) {
            tmp = options.className;
        }
        else if (J.isArray(options.className)) {
            tmp = options.className.join(' ');
        }
        else  {
            throw new TypeError('ChoiceTable.init: options.className must ' +
                                'be string, array, or undefined. Found: ' +
                                options.className);
        }
        this.table.className = tmp;

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
            tmp = options.orientation.lowercase().trim();
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

        // Option selectMultiple, default false.
        if ('undefined' === typeof options.selectMultiple) tmp = false;
        else tmp = !!options.selectMultiple;
        this.selectMultiple = tmp;

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.setChoices(options.choices);
        }
    };

    ChoiceTable.prototype.setChoices = function(choices) {
        var i, len, tr, td, H;
        if (!J.isArray(options.choices)) {
            throw new TypeError('ChoiceTable.init: choices must be array.');
        }
        if (!options.choices.length) {
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
            table.appendChild(tr);
        }
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = document.createElement('tr');
                table.appendChild(tr);
            }
            td = this.renderChoice(this.choices[this.order[i]], i);
            tr.appendChild(td);
            // Save reference to cell.
            this.choiceCells[i] = td;
        }
    };

    ChoiceTable.prototype.renderChoice = function(choice, idx) {
        var td, value;
        td = document.createElement('td');

        // If a callback is defined, use it.
        if (this.renderer) {
            this.renderer(td, choice, idx);
        }

        else if (J.isArray(choice)) {
            value = choice[0];
            choice = choice[1];
        }

        if ('string' === typeof choice) {
            td.innerHTML = choice;
        }
        else if (J.isElement(choice) || J.isNode(choice)) {
            td.appendChild(choice);
        }
        else {
            throw new Error('ChoiceTable.renderChoice: invalid choice: ' +
                            choice);
        }

        td.id =

    };

    ChoiceTable.prototype.setCorrectChoices = function(choices) {
        if (!choices) return;

        if (J.isArray(options.choices)) {
            // Array of strings or object {key: value}.
        }
        else {
            throw new TypeError('ChoiceTable.init: option.choices must be ' +
                                'array or object.');
        }


    };

    ChoiceTable.prototype.append = function() {
        this.bodyDiv.appendChild(this.table);
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
     * Disables clicking on the table
     */
    ChoiceTable.prototype.disable = function() {
        if (this.disabled) return;
        this.disabled = true;
        this.table.removeEventListener('click', this.makeChoiceTD);
    };

    /**
     * ### ChoiceTable.enable
     *
     * Enables clicking on the table
     */
    ChoiceTable.prototype.enable = function() {
        if (!this.disabled) return;
        this.disabled = false;
        this.table.addEventListener('click', this.makeChoiceTD);
    };

    /**
     * ### ChoiceTable.enable
     *
     * Set the text for the done table
     *
     * @param {string} text Optional. The text of the table.
     *   Default: ChoiceTable.text
     */
    ChoiceTable.prototype.makeChoiceTD = function(e) {
        var item, name, value, td, q, oldSelected, form;
        e = e || window.event;
        td = e.target || e.srcElement;
        // Id of elements are in the form of name_value or name_item_value.
        value = td.id.split('_');
        if (value.length === 2) {
            name = value[0];
            value = value[1];
            q = node.game.questionnaire;
        }
        else {
            name = value[0];
            item = value[1];
            value = value[2];
            // TODO: improve here.
            q = node.game.questionnaire[name];
            name = item;
            if (!q[name]) q[name] = { numberOfClicks: 0 };
        }

        oldSelected = q[name].oldSelected;
        if (oldSelected) oldSelected.className = ''

        ++q[name].numberOfClicks;
        q[name].currentAnswer = value;

        td.className = 'selected';
        q[name].oldSelected = td;

        // Remove any warning/error from form on click.
        form = W.getElementById(name);
        if (form) form.style.border = '';
    };

    // ## Helper methods.

    function makeId(td, idx) {

    }

})(node);
