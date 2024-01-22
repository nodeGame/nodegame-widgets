/**
 * # ChoiceTable
 * Copyright(c) 2024 Stefano Balietti
 * MIT Licensed
 *
 * Creates a configurable table where each cell is a selectable choice
 *
 * // TODO: register time for each current choice if selectMultiple is on?
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ChoiceTable', ChoiceTable);

    // ## Meta-data

    ChoiceTable.version = '1.11.0';
    ChoiceTable.description = 'Creates a configurable table where ' +
        'each cell is a selectable choice.';

    ChoiceTable.className = 'choicetable';

    ChoiceTable.texts = {

        autoHint: function(w) {
            var res;
            if (!w.requiredChoice && !w.selectMultiple) return false;
            if (!w.selectMultiple) {
                return w.displayRequired ? w.requiredMark : false;
            }
            res = '(';
            if (!w.requiredChoice) {
                if ('number' === typeof w.selectMultiple) {
                    res += 'select up to ' + w.selectMultiple;
                }
                else {
                    res += 'multiple selection allowed';
                }
            }
            else {
                if ('number' === typeof w.selectMultiple) {
                    if (w.selectMultiple === w.requiredChoice) {
                        res += 'select ' + w.requiredChoice;
                    }
                    else {
                        res += 'select between ' + w.requiredChoice +
                        ' and ' + w.selectMultiple;
                    }
                }
                else {
                    res += 'select at least ' + w.requiredChoice;
                }
            }
            res += ')';
            if (w.requiredChoice && w.displayRequired) {
                res += ' ' + w.requiredMark;
            }
            return res;
        },

        error: function(w, value) {
            if (value !== null &&
                ('number' === typeof w.correctChoice ||
                'string' === typeof w.correctChoice)) {

                return 'Not correct, try again.';
            }
            return 'Selection required.';
        },

        other: 'Other',

        customInput: 'Please specify.'

    };

    ChoiceTable.separator = '::';

    /**
     * ## ChoiceTable constructor
     *
     * Creates a new instance of ChoiceTable
     */
    function ChoiceTable() {
        var that;
        that = this;

        /**
         * ### ChoiceTable.table
         *
         * The HTML element triggering the listener function when clicked
         */
        this.table = null;

        /**
         * ### ChoiceTable.choicesSetSize
         *
         * How many choices can be on the same row/column
         */
        this.choicesSetSize = null;

        /**
         * ### ChoiceTable.tr
         *
         * Reference to TR elements of the table
         *
         * Note: if the orientation is vertical there will be multiple TR
         * otherwise just one.
         *
         * @see createTR
         */
        this.trs = [];

        /**
         * ### ChoiceTable.listener
         *
         * The main function listening on clicks
         *
         * @see ChoiceTable.onclick
         */
        this.listener = function(e) {
            var name, value, td, ci, lastClicked;
            var i, len, removed, otherSel;

            e = e || window.event;
            td = e.target || e.srcElement;

            // See if it is a clickable choice.
            ci = that.choicesIds;
            if ('undefined' === typeof ci[td.id]) {
                // It might be a nested element, try the parent.
                td = td.parentNode;
                if (!td) return;
                if ('undefined' === typeof ci[td.id]) {
                    td = td.parentNode;
                    if (!td) return;
                    if ('undefined' === typeof ci[td.id]) {
                        td = td.parentNode;
                        if (!td || 'undefined' === typeof ci[td.id]) {
                            return;
                        }
                    }
                }
            }

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            // Id of elements are in the form of name_value or name_item_value.
            value = td.id.split(that.separator);

            // Separator not found, not a clickable cell.
            if (value.length === 1) return;

            name = value[0];
            value = parseInt(value[1], 10);
            // value = value[1];

            // Choice disabled.
            // console.log('VALUE: ', value);
            if (that.disabledChoices[value]) return;

            // One more click.
            that.numberOfClicks++;

            removed = that.isChoiceCurrent(value);
            len = that.choices.length;

            if (that.customInput) {
                // Is "Other" currently selected?
                otherSel = value === (len - 1);
                if (otherSel && !removed) {
                    that.customInput.show();
                }
                else if (!that.selectMultiple || otherSel) {
                    that.customInput.hide();
                }
            }

            // Click on an already selected choice.
            if (removed) {
                that.unsetCurrentChoice(value);
                J.removeClass(td, 'selected');

                if (that.selectMultiple) {
                    // Remove selected TD (need to keep this clean for reset).
                    i = -1, len = that.selected.length;
                    for ( ; ++i < len ; ) {
                        if (that.selected[i].id === td.id) {
                            that.selected.splice(i, 1);
                            break;
                        }
                    }
                }
                else {
                    that.selected = null;
                }
            }
            // Click on a new choice.
            else {

                // Have we exhausted available choices?
                if ('number' === typeof that.selectMultiple &&
                    that.selected.length === that.selectMultiple) return;

                J.addClass(td, 'selected');

                if (that.oneTimeClick) {
                    setTimeout(function() {
                        J.removeClass(td, 'selected');
                    }, 60);
                }
                else {

                    that.setCurrentChoice(value);

                    if (that.selectMultiple) {
                        that.selected.push(td);
                    }
                    else {
                        // If only 1 selection allowed, remove old selection.
                        if (that.selected) {
                            J.removeClass(that.selected, 'selected');
                        }
                        that.selected = td;
                    }
                }
            }

            // Remove any warning/errors on click.
            if (that.isHighlighted()) that.unhighlight();

            // Call onclick, if any.
            if (that.onclick) {
                // TODO: Should we parseInt it anyway when we store
                // the current choice?
                value = parseInt(value, 10);
                that.onclick.call(that, value, removed, td);
            }

            that.lastClicked = value;

            if (that.doneOnClick) node.done();
        };

        /**
         * ## ChoiceTable.onclick
         *
         * The user-defined onclick listener
         *
         * Receives 3 input parameters: the value of the clicked choice,
         * whether it was a remove action, and the reference to the TD object.
         *
         * @see ChoiceTableGroup.listener
         */
        this.onclick = null;

        /**
         * ### ChoiceTable.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceTable.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceTable.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

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
         * ### ChoiceTable.choicesValues
         *
         * Map of choices' values to indexes in the choices array
         */
        this.choicesValues = {};

        /**
         * ### ChoiceTable.choicesIds
         *
         * Map of choices' cells ids to choices
         *
         * Used to determine what are the clickable choices.
         */
        this.choicesIds = {};

        /**
         * ### ChoiceTable.choicesCells
         *
         * The cells of the table associated with each choice
         */
        this.choicesCells = null;

        /**
         * ### ChoiceTable.left
         *
         * A non-clickable first cell of the row/column
         *
         * It will be placed to the left of the choices if orientation
         * is horizontal, or above the choices if orientation is vertical
         *
         * @see ChoiceTable.orientation
         */
        this.left = null;

        /**
         * ### ChoiceTable.leftCell
         *
         * The rendered left cell
         *
         * @see ChoiceTable.renderSpecial
         */
        this.leftCell = null;

        /**
         * ### ChoiceTable.right
         *
         * A non-clickable last cell of the row/column
         *
         * It will be placed to the right of the choices if orientation
         * is horizontal, or below the choices if orientation is vertical
         *
         * @see ChoiceTable.orientation
         */
        this.right = null;

        /**
         * ### ChoiceTable.rightCell
         *
         * The rendered right cell
         *
         * @see ChoiceTable.renderSpecial
         */
        this.rightCell = null;

        /**
         * ### ChoiceTable.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
        * ### CustomInput.successBox
        *
        * An HTML element displayed when a validation error occurs
        */
        this.successBox = null;

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
         * The current order of display of choices
         *
         * @see ChoiceTable.originalOrder
         */
        this.order = null;

        /**
         * ### ChoiceTable.correctChoice
         *
         * The correct choice/s
         *
         * The field is an array or number|string depending
         * on the value of ChoiceTable.selectMultiple
         *
         * @see ChoiceTable.selectMultiple
         */
        this.correctChoice = null;

        /**
         * ### ChoiceTable.requiredChoice
         *
         * The number of required choices. Default 0
         */
        this.requiredChoice = null;

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
         * Currently selected TD elements
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
         * The number of maximum simulataneous selections (>1), or false
         *
         * Note: this option is incompatible with `oneTimeClick`.
         */
        this.selectMultiple = null;

        /**
        * ### ChoiceTable.oneTimeClick
        *
        * If TRUE, the selection is immediately removed after one click
        *
        * This is useful to create a buttons group which trigger some actions.
        *
        * Note: this option is incompatible with `selectMultiple`.
        */
        this.oneTimeClick = null;

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
         * If 'string', the text will be added inside the textarea
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
         *
         * @see ChoiceTable.renderChoice
         */
        this.separator = ChoiceTable.separator;

        /**
         * ### ChoiceTable.tabbable
         *
         * If TRUE, the elements of the table can be accessed with TAB
         *
         * Clicking is simulated upon pressing space or enter.
         *
         * Default TRUE
         *
         * @see ChoiceTable.renderChoice
         */
        this.tabbable = null;

        /**
         * ### ChoiceTable.disabledChoices
         *
         * An object containing the list of disabled values
         */
        this.disabledChoices = {};


        /**
        * ### ChoiceTable.sameWidthCells
        *
        * If truthy, it forces cells to have same width regardless of content
        *
        *  - If TRUE, it automatically computes the equal size of the cells
        *      (options `left` and `right` affect computation).
        *  - If string, it is the value of width for all cells
        *
        * Only applies in horizontal mode.
        */
        this.sameWidthCells = true;

        /**
        * ### ChoiceTable.other
        *
        * If TRUE, adds an "Other" choice as last choice
        *
        * Accepted values:
        * - true: adds "Other" choice as last choice.
        * - 'CustomInput':  adds "Other" choice AND a CustomInput widget below
        *   the choicetable (initially hidden).
        * - object: as previous, but it also allows for custom options for the
        *   custom input
        *
        * @see ChoiceTable.customInput
        */
        this.other = null;

        /**
        * ### ChoiceTable.customInput
        *
        * The customInput widget
        *
        * @see ChoiceTable.other
        */
        this.customInput = null;

        /**
        * ### ChoiceTable.lastClicked
        *
        * The idx of the last selected choice
        */
        this.lastClicked = null;

        /**
        * ### ChoiceTable.doneOnClick
        *
        * If TRUE, node.done() will be invoked after the first click
        */
        this.doneOnClick = null;

        /**
        * ### ChoiceTable.solution
        *
        * Additional information to be displayed after a selection is confirmed
        *
        * If no answer is provided and the next method is triggered, the
        * solution is displayed only if solutionNoChoice is TRUE
        *
        * @see ChoiceTable.solutionNoChoice
        * @see ChoiceTable.next
        */
        this.solution = null;

        /**
        * ### ChoiceTable.solutionDisplayed
        *
        * TRUE, if the solution is currently displayed
        */
        this.solutionDisplayed = false;

        /**
        * ### ChoiceTable.solutionNoChoice
        *
        * TRUE, he solution is displayed upon trigger even with no choice
        */
        this.solutionNoChoice = false;

        /**
        * ### ChoiceTable.solutionDiv
        *
        * The <div> element containing the solution
        */
        this.solutionDiv = null;
    }

    // ## ChoiceTable methods

    /**
     * ### ChoiceTable.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - left: the content of the left (or top) cell
     *   - right: the content of the right (or bottom) cell
     *   - className: the className of the table (string, array), or false
     *       to have none.
     *   - orientation: orientation of the table: vertical (v) or horizontal (h)
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the table in the group, if any
     *   - listener: a function executed at every click. Context is
     *       `this` instance
     *   - onclick: a function executed after the listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - hint: a text with extra info to be displayed after mainText
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
     *       if 'string', the text will be added inside the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *   - tabbable: if TRUE, each cell can be reached with TAB and clicked
     *       with SPACE or ENTER. Default: TRUE.
     *   - disabledChoices: array of disabled choices (values).
     *
     * @param {object} opts Configuration options
     */
    ChoiceTable.prototype.init = function(opts) {
        var tmp, that;
        that = this;

        if (!this.id) {
            throw new TypeError('ChoiceTable.init: opts.id is missing');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'H';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('ChoiceTable.init: opts.orientation must ' +
                                'be string, or undefined. Found: ' +
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
                throw new Error('ChoiceTable.init: opts.orientation is ' +
                                'invalid: ' + tmp);
            }
        }
        this.orientation = tmp;

        // Option shuffleChoices, default false.
        if ('undefined' === typeof opts.shuffleChoices) tmp = false;
        else tmp = !!opts.shuffleChoices;
        this.shuffleChoices = tmp;

        // Option selectMultiple, default false.
        tmp = opts.selectMultiple;
        if ('undefined' === typeof tmp) {
            tmp = false;
        }
        else if ('boolean' !== typeof tmp) {
            tmp = J.isInt(tmp, 1);
            if (!tmp) {
                throw new Error('ChoiceTable.init: selectMultiple must be ' +
                                'undefined or an integer > 1. Found: ' + tmp);
            }
        }
        this.selectMultiple = tmp;
        // Make an array for currentChoice and selected.
        if (tmp) {
            this.selected = [];
            this.currentChoice = [];
        }

        // Option requiredChoice, if any.
        if ('number' === typeof opts.requiredChoice) {
            if (!J.isInt(opts.requiredChoice, 0)) {
                throw new Error('ChoiceTable.init: if number, requiredChoice ' +
                                'must a positive integer. Found: ' +
                                opts.requiredChoice);
            }
            if ('number' === typeof this.selectMultiple &&
                opts.requiredChoice > this.selectMultiple) {

                throw new Error('ChoiceTable.init: requiredChoice cannot be ' +
                                'larger than selectMultiple. Found: ' +
                                opts.requiredChoice + ' > ' +
                                this.selectMultiple);
            }
            this.requiredChoice = opts.requiredChoice;
        }
        else if ('boolean' === typeof opts.requiredChoice) {
            this.requiredChoice = opts.requiredChoice ? 1 : null;
        }
        else if ('undefined' !== typeof opts.requiredChoice) {
            throw new TypeError('ChoiceTable.init: opts.requiredChoice ' +
                                'be number, boolean or undefined. Found: ' +
                                opts.requiredChoice);
        }

        if ('undefined' !== typeof opts.oneTimeClick) {
            this.oneTimeClick = !!opts.oneTimeClick;
        }

        // Set the group, if any.
        if ('string' === typeof opts.group ||
            'number' === typeof opts.group) {

            this.group = opts.group;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('ChoiceTable.init: opts.group must ' +
                                'be string, number or undefined. Found: ' +
                                opts.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof opts.groupOrder) {
            this.groupOrder = opts.groupOrder;
        }
        else if ('undefined' !== typeof opts.groupOrder) {
            throw new TypeError('ChoiceTable.init: opts.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                opts.groupOrder);
        }

        // Set the main onclick listener, if any.
        if ('function' === typeof opts.listener) {
            this.listener = function(e) {
                opts.listener.call(this, e);
            };
        }
        else if ('undefined' !== typeof opts.listener) {
            throw new TypeError('ChoiceTable.init: opts.listener must ' +
                                'be function or undefined. Found: ' +
                                opts.listener);
        }

        // Set an additional onclick, if any.
        if ('function' === typeof opts.onclick) {
            this.onclick = opts.onclick;
        }
        else if ('undefined' !== typeof opts.onclick) {
            throw new TypeError('ChoiceTable.init: opts.onclick must ' +
                                'be function or undefined. Found: ' +
                                opts.onclick);
        }

        // Set the mainText, if any.
        tmp = opts.mainText
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
            if ('string' !== typeof tmp) {
                throw new TypeError('ChoiceTable.init: opts.mainText cb ' +
                                    'must return a string. Found: ' +
                                    tmp);
            }
        }
        if ('string' === typeof tmp) {
            this.mainText = tmp;
        }
        else if ('undefined' !== typeof tmp) {
            throw new TypeError('ChoiceTable.init: opts.mainText must ' +
                                'be function, string or undefined. Found: ' +
                                tmp);
        }

        // Set the hint, if any.
        tmp = opts.hint;
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
            if ('string' !== typeof tmp && false !== tmp) {
                throw new TypeError('ChoiceTable.init: opts.hint cb must ' +
                                    'return string or false. Found: ' +
                                    tmp);
            }
        }
        if ('string' === typeof tmp || false === tmp) {
            this.hint = tmp;
            if (this.requiredChoice && tmp !== false && this.displayRequired) {
                this.hint += ' ' + this.requiredMark;
            }
        }
        else if ('undefined' !== typeof tmp) {
            throw new TypeError('ChoiceTable.init: opts.hint must ' +
                                'be a string, false, or undefined. Found: ' +
                                tmp);
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
            throw new TypeError('ChoiceTable.init: opts.timeFrom must ' +
                                'be string, false, or undefined. Found: ' +
                                opts.timeFrom);
        }

        // Set the separator, if any.
        if ('string' === typeof opts.separator) {
            this.separator = opts.separator;
        }
        else if ('undefined' !== typeof opts.separator) {
            throw new TypeError('ChoiceTable.init: opts.separator must ' +
                                'be string, or undefined. Found: ' +
                                opts.separator);
        }

        // Conflict might be generated by id or seperator.
        tmp = this.id + this.separator.substring(0, (this.separator.length -1));
        if (this.id.indexOf(this.separator) !== -1 ||
            tmp.indexOf(this.separator) !== -1) {

            throw new Error('ChoiceTable.init: separator cannot be ' +
                            'included in the id or in the concatenation ' +
                            '(id + separator). Please specify the right ' +
                            'separator option. Found: ' + this.separator);
        }

        // left.
        tmp = opts.left;
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
            if ('string' !== typeof tmp && 'undefined' !== typeof tmp) {
                throw new TypeError('ChoiceTable.init: opts.left cb must ' +
                                    'return string or undefined. Found: ' +
                                    tmp);
            }
        }
        if ('string' === typeof tmp || 'number' === typeof tmp) {
            this.left = '' + tmp;
        }
        else if (J.isNode(opts.left) ||
                 J.isElement(opts.left)) {

            this.left = opts.left;
        }
        else if ('undefined' !== typeof opts.left) {
            throw new TypeError('ChoiceTable.init: opts.left must be string, ' +
                                'number, function, an HTML Element or ' +
                                'undefined. Found: ' + tmp);
        }

        tmp = opts.right;
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
            if ('string' !== typeof tmp && 'undefined' !== typeof tmp) {
                throw new TypeError('ChoiceTable.init: opts.right cb must ' +
                                    'return string or undefined. Found: ' +
                                    tmp);
            }
        }
        if ('string' === typeof tmp || 'number' === typeof tmp) {
            this.right = '' + tmp;
        }
        else if (J.isNode(opts.right) || J.isElement(opts.right)) {
            this.right = opts.right;
        }
        else if ('undefined' !== typeof opts.right) {
            throw new TypeError('ChoiceTable.init: opts.right must ' +
                                'be string, number, an HTML Element or ' +
                                'undefined. Found: ' + opts.right);
        }


        // Set the className, if not use default.
        if ('undefined' === typeof opts.className) {
            this.className = ChoiceTable.className;
        }
        else if (opts.className === false) {
            this.className = false;
        }
        else if ('string' === typeof opts.className) {
            this.className =  ChoiceTable.className + ' ' + opts.className;
        }
        else if ( J.isArray(opts.className)) {
            this.className = [ChoiceTable.className].concat(opts.className);
        }
        else {
            throw new TypeError('ChoiceTable.init: opts.' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + opts.className);
        }

        if (opts.tabbable !== false) this.tabbable = true;

        // Set the renderer, if any.
        if ('function' === typeof opts.renderer) {
            this.renderer = opts.renderer;
        }
        else if ('undefined' !== typeof opts.renderer) {
            throw new TypeError('ChoiceTable.init: opts.renderer must ' +
                                'be function or undefined. Found: ' +
                                opts.renderer);
        }

        // After all configuration opts are evaluated, add choices.

        // Set table.
        if ('object' === typeof opts.table) {
            this.table = opts.table;
        }
        else if ('undefined' !== typeof opts.table &&
                 false !== opts.table) {

            throw new TypeError('ChoiceTable.init: opts.table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + opts.table);
        }

        this.table = opts.table;

        this.freeText = 'string' === typeof opts.freeText ?
            opts.freeText : !!opts.freeText;


        // Add the correct choices.
        tmp = opts.choicesSetSize;
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
        }
        if ('undefined' !== typeof tmp) {
            if (!J.isInt(tmp, 0)) {
                throw new Error('ChoiceTable.init: choicesSetSize must be ' +
                                'undefined or an integer > 0. Found: ' + tmp);
            }

            if (this.left || this.right) {
                throw new Error('ChoiceTable.init: choicesSetSize option ' +
                                'cannot be specified when either left or ' +
                                'right options are set.');
            }

            this.choicesSetSize = tmp;
        }

        // Add other.
        if ('undefined' !== typeof opts.sameWidthCells) {
            this.sameWidthCells = opts.sameWidthCells;
        }

        // Add other.
        if ('undefined' !== typeof opts.other) {
            this.other = opts.other;
        }

        // Add the choices.
        tmp = opts.choices;
        if ('function' === typeof tmp) {
            tmp = tmp.call(this);
            if (!J.isArray(tmp) || !tmp.length) {
                throw new TypeError('ChoiceTable.init: opts.choices cb must ' +
                                    'return a non-empty array. Found: ' + tmp);
            }
        }
        if ('undefined' !== typeof tmp) {
            this.setChoices(tmp);
        }

        // Add the correct choices.
        tmp = opts.correctChoice;
        if ('undefined' !== typeof tmp) {
            if (this.requiredChoice) {
                this.requiredChoice = null;
                this.required = null;
                node.warn('ChoiceTable.init: requiredChoice and ' +
                          'correctChoice are both set; requiredChoice ignored.'
                );
            }
            if ('function' === typeof tmp) {
                tmp = tmp.call(this);
                // No checks.
            }
            this.setCorrectChoice(opts.correctChoice);
        }


        // Add the correct choices.
        tmp = opts.disabledChoices;
        if ('undefined' !== typeof tmp) {
            if ('function' === typeof tmp) {
                tmp = tmp.call(this);
            }
            if (!J.isArray(opts.disabledChoices)) {
                throw new TypeError('ChoiceTable.init: disabledChoices ' +
                                    'must be undefined or array. Found: ' +
                                    tmp);
            }

            // TODO: check if values of disabled choices are correct?
            // Do we have the choices now, or can they be added later?
            if (tmp) {
                (function() {
                    for (var i = 0; i < tmp.length; i++) {
                        that.disableChoice(tmp[i]);
                    }
                })();
            }
        }

        if ('undefined' !== typeof opts.doneOnClick) {
            this.doneOnClick = !!opts.doneOnClick;
        }

        tmp = opts.solution;
        if ('undefined' !== typeof tmp) {
            if ('string' !== typeof tmp && 'function' !== typeof tmp) {
                throw new TypeError('ChoiceTable.init: solution must be ' +
                                    'string or undefined. Found: ' + tmp);
            }
            this.solution = tmp;
        }
    };

    /**
     * ### ChoiceTable.disableChoice
     *
     * Marks a choice as disabled (will not be clickable)
     *
     * @param {string|number} idx The idx of the choice to disable
     */
    ChoiceTable.prototype.disableChoice = function(idx) {
        if (!this.disabledChoices[idx]) {
            this.disabledChoices[idx] = true;
            J.addClass(this.choicesCells[idx], 'disabled');
        }
    };

    /**
     * ### ChoiceTable.enableChoice
     *
     * Enables a choice (will be clickable again if previously disabled)
     *
     * @param {string|number} idx The value of the choice to disable
     */
    ChoiceTable.prototype.enableChoice = function(idx) {
        if (this.disabledChoices[idx]) {
            this.disabledChoices[idx] = null;
            J.removeClass(this.choicesCells[idx], 'disabled');
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
        var len, idxOther;
        if (!J.isArray(choices)) {
            throw new TypeError('ChoiceTable.setChoices: choices ' +
                                'must be array');
        }
        if (!choices.length) {
            throw new Error('ChoiceTable.setChoices: choices array is empty');
        }
        // Check and drop previous "other" choices.
        if (this.other) {
            idxOther = choices.indexOf(this.getText('other'));
            if (idxOther >= 0) choices.splice(idxOther, 1);
        }
        this.choices = choices;
        len = choices.length;

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleChoices) this.order = J.shuffle(this.order);

        // Loop through all choices and see if there is any fixed position.
        // TODO: we could add validation here.
        (function(w) {
            var i, c, fixedPos, idxOrder, allFixedPos = [], allFixedLen;
            // See if there is any fixed-choice.
            for (i = -1 ; ++i < len ; ) {
                fixedPos = undefined;
                idxOrder = w.order[i];
                c = choices[idxOrder];
                if (J.isArray(c)) {
                    // Third position after id and text is fixedPos.
                    fixedPos = c[2];
                }
                else if ('object' === typeof choices[i]) {
                    fixedPos = c.fixedPos;
                }
                if ('undefined' !== typeof fixedPos) {
                    allFixedPos.push({ fixed: fixedPos, pos: i, idx: idxOrder});
                }
            }
            // All fixed position collected, we need to sort them from
            // lowest to highest, then we can do the placing.
            allFixedLen = allFixedPos.length; 
            if (allFixedLen) {
                if (allFixedLen > 1) {
                    allFixedPos.sort(function(a, b) {return a.fixed < b.fixed});
                }
                for (i = -1 ; ++i < allFixedLen ; ) {
                    c = allFixedPos[i];
                    // Remove from old position and place it in new one.
                    w.order.splice(c.pos, 1);
                    w.order.splice(c.fixed, 0, c.idx);
                }
            }
        })(this)

        // Add 'Other' field at the end.
        if (this.other) {
            this.choices[len] = this.getText('other');
            this.order[len] = len
        }

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
     * Left and right cells are also rendered, if specified.
     *
     * Follows a shuffled order, if set
     *
     * @see ChoiceTable.order
     * @see ChoiceTable.renderChoice
     * @see ChoiceTable.renderSpecial
     */
    ChoiceTable.prototype.buildChoices = function() {
        var len, pos, idx;
        pos = -1, len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);
        for ( ; ++pos < len ; ) {
            idx = this.order[pos];
            this.renderChoice(this.choices[idx], idx, pos);
        }
        if (this.left) this.renderSpecial('left', this.left);
        if (this.right) this.renderSpecial('right', this.right);
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
     * @see ChoiceTable.choicesSetSize
     */
    ChoiceTable.prototype.buildTable = (function() {

        function makeSet(i, len, H, doSets) {
            var tr, counter, pos;
            counter = 0;
            // Start adding tr/s and tds based on the orientation.
            if (H) {
                tr = createTR(this, 'main');
                // Add horizontal choices title.
                if (this.leftCell) tr.appendChild(this.leftCell);
            }
            // Main loop.
            for ( ; ++i < len ; ) {
                if (!H) {
                    tr = createTR(this, 'left');
                    // Add vertical choices title.
                    if (i === 0 && this.leftCell) {
                        tr.appendChild(this.leftCell);
                        tr = createTR(this, i);
                    }
                }
                // Clickable cell.
                pos = this.order[i];
                tr.appendChild(this.choicesCells[pos]);
                // Stop if we reached set size (still need to add the right).
                if (doSets && ++counter >= this.choicesSetSize) break;
            }
            if (this.rightCell) {
                if (!H) tr = createTR(this, 'right');
                tr.appendChild(this.rightCell);
            }

            // Start a new set, if necessary.
            if (i !== len) makeSet.call(this, i, len, H, doSets);
        }

        return function() {
            var len, H, doSets;

            if (!this.choicesCells) {
                throw new Error('ChoiceTable.buildTable: choices not set, ' +
                                'cannot build table. Id: ' + this.id);
            }

            H = this.orientation === 'H';
            len = this.choicesCells.length;
            doSets = 'number' === typeof this.choicesSetSize;

            // Recursively makes sets
            makeSet.call(this, -1, len, H, doSets);

            // Enable onclick listener.
            this.enable();
        };
    })();

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
        var i, idx, len, tr, td, H;

        len = this.choices.length;
        // Pre-allocate the choicesCells array.
        this.choicesCells = new Array(len);

        // Start adding tr/s and tds based on the orientation.
        i = -1, H = this.orientation === 'H';

        if (H) {
            tr = createTR(this, 'main');
            // Add horizontal choices left.
            if (this.left) {
                td = this.renderSpecial('left', this.left);
                tr.appendChild(td);
            }
        }
        // Main loop.
        for ( ; ++i < len ; ) {
            if (!H) {
                tr = createTR(this, 'left');
                // Add vertical choices left.
                if (i === 0 && this.left) {
                    td = this.renderSpecial('left', this.left);
                    tr.appendChild(td);
                    tr = createTR(this, i);
                }
            }
            // Clickable cell.
            idx = this.order[i];
            td = this.renderChoice(this.choices[idx], idx, i);
            tr.appendChild(td);
        }
        if (this.right) {
            if (!H) tr = createTR(this, 'right');
            td = this.renderSpecial('right', this.right);
            tr.appendChild(td);
        }

        // Enable onclick listener.
        this.enable();
    };

    /**
     * ### ChoiceTable.renderSpecial
     *
     * Renders a non-choice element into a cell of the table (e.g. left/right)
     *
     * @param {string} type The type of special cell ('left' or 'right').
     * @param {mixed} special The special element. It must be string or number,
     *   or array where the first element is the 'value' (incorporated in the
     *   `id` field) and the second the text to display as choice.
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.left
     * @see ChoiceTable.right
     */
    ChoiceTable.prototype.renderSpecial = function(type, special) {
        var td, className;
        td = document.createElement('td');
        if ('string' === typeof special) td.innerHTML = special;
        // HTML element (checked before).
        else td.appendChild(special);
        if (type === 'left') {
            className = this.className ? this.className + '-left' : 'left';
            this.leftCell = td;
        }
        else if (type === 'right') {
            className = this.className ? this.className + '-right' : 'right';
            this.rightCell = td;
        }
        else {
            throw new Error('ChoiceTable.renderSpecial: unknown type: ' + type);
        }
        td.className = className;
        td.id = this.id + this.separator + 'special-cell-' + type;
        return td;
    };
    /* UPDATED TEXT
     * @param {mixed} choice The choice element. It must be string or
     *   number, HTML element, or an array. If array, the first
     *   element is the short value (string or number), and the second
     *   one the the full value (string, number or HTML element) to
     *   display. If a renderer function is defined there are no
     *   restriction on the format of choice
     * @param {number} idx The position of the choice within the choice array
     */

    /**
     * ### ChoiceTable.renderChoice
     *
     * Transforms a choice element into a cell of the table
     *
     * A reference to the cell is saved in `choicesCells`.
     *
     * @param {mixed} choice The choice element. It may be string, number,
     *   array where the first element is the 'value' and the second the
     *   text to display as choice, or an object with properties value and
     *   display. If a renderer function is defined there are no restriction
     *   on the format of choice.
     * @param {number} idx The position of the choice within the choices array
     *
     * @return {HTMLElement} td The newly created cell of the table
     *
     * @see ChoiceTable.renderer
     * @see ChoiceTable.separator
     * @see ChoiceTable.choicesCells
     */
    ChoiceTable.prototype.renderChoice = function(choice, idx, pos) {
        var td, shortValue, value, width;
        td = document.createElement('td');
        if (this.tabbable) J.makeTabbable(td);

        // Forces equal width.
        if (this.sameWidthCells && this.orientation === 'H') {
            if (this.sameWidthCells === true) {
                width = this.left ? 70 : 100;
                if (this.right) width = width - 20;
                width = width / (this.choicesSetSize || this.choices.length);
                width = width.toFixed(2) + '%';
            }
            else {
                width = this.sameWidthCells;
            }
            td.style.width = width;
        }

        // Use custom renderer.
        if (this.renderer) {
            value = this.renderer(td, choice, idx);
            if ('undefined' === typeof value) value = idx;
        }
        // Or use standard format.
        else {
            if (J.isArray(choice)) {
                shortValue = choice[0];
                choice = choice[1];
            }
            else if ('object' === typeof choice) {
                shortValue = choice.value;
                choice = choice.display;
            }

            // value = this.shuffleChoices ? this.order[idx] : idx;
            value = idx;

            if ('string' === typeof choice || 'number' === typeof choice) {
                td.innerHTML = choice;
            }
            else if (J.isElement(choice) || J.isNode(choice)) {
                td.appendChild(choice);
            }
            else if (node.widgets.isWidget(choice)) {
                node.widgets.append(choice, td);
            }
            else {
                throw new Error('ChoiceTable.renderChoice: invalid choice: ' +
                                choice);
            }
        }

        // Map a value to the index.
        if ('undefined' !== typeof this.choicesValues[value]) {
            throw new Error('ChoiceTable.renderChoice: value already ' +
                            'in use: ' + value);
        }

        // Add the id if not added already by the renderer function.
        if (!td.id || td.id === '') {
            td.id = this.id + this.separator + value;
        }

        // All fine, updates global variables.
        this.choicesValues[value] = pos;
        this.choicesCells[idx] = td;
        this.choicesIds[td.id] = td;

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
                throw new TypeError('ChoiceTable.setCorrectChoice: choice ' +
                                    'must be non-empty array. Found: ' +
                                    choice);
            }
        }
        this.correctChoice = choice;
    };

    /**
     * ### ChoiceTable.append
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
    ChoiceTable.prototype.append = function() {
        var tmp;
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('ChoiceTable.append: id is not ' +
                            'unique: ' + this.id);
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

        // Create/set table.
        if (this.table !== false) {
            // Create table, if it was not passed as object before.
            if ('undefined' === typeof this.table) {
                this.table = document.createElement('table');
                this.buildTable();
            }
            // Set table id.
            this.table.id = this.id;
            // Class.
            tmp = this.className ? [ this.className ] : [];
            if (this.orientation !== 'H') tmp.push('choicetable-vertical');
            if (tmp.length) J.addClass(this.table, tmp);
            else this.table.className = '';
            // Append table.
            this.bodyDiv.appendChild(this.table);
        }

        this.errorBox = W.append('div', this.bodyDiv, { className: 'errbox' });

        this.setCustomInput(this.other, this.bodyDiv);

        if (this.solution) {
            this.solutionDiv = W.append('div', this.bodyDiv);
        }

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            if (this.id) this.textarea.id = this.id + '_text';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            tmp = this.className ? this.className + '-freetext' : 'freetext';
            this.textarea.className = tmp;
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### ChoiceTable.setCustomInput
     *
     * Set Custom Input widget.
     *
     */
    ChoiceTable.prototype.setCustomInput = function(other, root) {
        var opts;
        if (other === null || 'boolean' === typeof other) return;
        opts = {
            id: 'other' + this.id,
            mainText: this.getText('customInput'),
            requiredChoice: this.requiredChoice,
            displayRequired: this.displayRequired,
            requiredMark: this.requiredMark
        };
        // other is the string 'CustomInput' or a conf object.
        if ('object' === typeof other) J.mixin(opts, other);
        // Force initially hidden.
        opts.hidden = true;
        this.customInput = node.widgets.append('CustomInput', root, opts);

    };

    /**
     * ### ChoiceTable.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see ChoiceTable.highlight
     * @see ChoiceTable.errorBox
     */
    ChoiceTable.prototype.setError = function(err) {
        // TODO: the errorBox is added only if .append() is called.
        // However, ChoiceTableGroup use the table without calling .append().
        if (this.errorBox) this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
    };

    /**
     * ### ChoiceTable.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * @see Widget.listeners
     */
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
        if (this.disabled === true) return;
        this.disabled = true;
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
            // Remove listener to make cells clickable with the keyboard.
            if (this.tabbable) J.makeClickable(this.table, false);
        }
        if (this.customInput) this.customInput.disable();
        this.emit('disabled');
    };

    /**
     * ### ChoiceTable.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceTable.prototype.enable = function() {
        if (this.disabled === false) return;
        if (!this.table) {
            throw new Error('ChoiceTable.enable: table not defined');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
        // Add listener to make cells clickable with the keyboard.
        if (this.tabbable) J.makeClickable(this.table);
        if (this.customInput) this.customInput.enable();
        this.emit('enabled');
    };

    /**
     * ### ChoiceTable.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * Depending on current settings, there are two modes of verifying
     * choices:
     *
     *    - requiredChoice: there must be at least N choices selected
     *    - correctChoice:  the choices are compared against correct ones.
     *
     * @param {boolean} markAttempt Optional. If TRUE, the value of
     *   current choice is added to the attempts array. Default: TRUE
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
        var correctChoice, ci, ciCorrect;

        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        if (markAttempt) this.attempts.push(this.currentChoice);

         // Custom input to check.
         ci = this.customInput && !this.customInput.isHidden();
         if (ci) {
             ciCorrect = this.customInput.getValues({
                 markAttempt: markAttempt
             }).isCorrect;
             if (ciCorrect === false) return false;
             // Set it to null so it is returned correctly, later below.
             if ('undefined' === typeof ciCorrect) ciCorrect = null;
         }

        // Check the number of choices.
        if (this.requiredChoice !== null) {
            if (!this.selectMultiple) return this.currentChoice !== null;
            else return this.currentChoice.length >= this.requiredChoice;
        }

        correctChoice = this.correctChoice;
        // If no correct choice is set return null or ciCorrect (true|null).
        if (null === correctChoice) return ci ? ciCorrect : null;

        // Only one choice allowed, ci is correct,
        // otherwise we would have returned already.
        if (!this.selectMultiple) return this.currentChoice === correctChoice;

        // Multiple selections allowed.

        // Make it an array (can be a string).
        if (!J.isArray(correctChoice)) correctChoice = [correctChoice];

        len = correctChoice.length;
        lenJ = this.currentChoice.length;
        // Quick check.
        if (len !== lenJ) return false;
        // Check every item.
        i = -1;
        clone = this.currentChoice.slice(0);
        for ( ; ++i < len ; ) {
            found = false;
            c = correctChoice[i];
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
     * Deletes the value of currentChoice
     *
     * If `ChoiceTable.selectMultiple` is activated, then it is
     * possible to select the choice to unset.
     *
     * @param {number|string} Optional. The choice to delete from
     *   currentChoice when multiple selections are allowed
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
                                    'must be string, number or ' +
                                    'undefined. Found: ' + choice);
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
     * @param {number|string} The choice to check.
     *
     * @return {boolean} TRUE, if the choice is currently selected
     *
     * @see ChoiceTable.getChoiceAtPosition
     */
    ChoiceTable.prototype.isChoiceCurrent = function(choice) {
        var i, len;
        if ('string' === typeof choice) {
            choice = parseInt(choice, 10);
        }
        else if ('number' !== typeof choice) {
            throw new TypeError('ChoiceTable.isChoiceCurrent: choice ' +
                                'must be string or number. Found: ' + choice);
        }
        if (!this.selectMultiple) return this.currentChoice === choice;
        i = -1, len = this.currentChoice.length;
        for ( ; ++i < len ; ) {
            if (this.currentChoice[i] === choice) return true;
        }
        return false;
    };

    /**
     * ### ChoiceTable.getChoiceAtPosition
     *
     * Returns a choice displayed at a given position
     *
     * @param {string|number} i The numeric position of a choice in display
     *
     * @return {string|undefined} The value associated with the numeric
     *   position. If no value is found, returns undefined
     *
     * @see ChoiceTable.order
     * @see ChoiceTable.choices
     */
    ChoiceTable.prototype.getChoiceAtPosition = function(i) {
        if (!this.choices || !this.order) return;
        return this.choices[this.order[parseInt(i, 10)]];
    };

    /**
     * ### ChoiceTable.highlight
     *
     * Highlights the choice table
     *
     * @param {string|obj} opts Optional. If string is the 'border'
     *   option for backward compatibilityThe style for the table's border.
     *   Default '3px solid red'
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.highlight = function(opts) {
        var border, ci;
        opts = opts || {};
        // Backward compatible.
        if ('string' === typeof opts) opts = { border: opts };
        border = opts.border;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceTable.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted) return;
        this.table.style.border = border || '3px solid red';
        ci = this.customInput;
        if (opts.customInput !== false && ci && !ci.isHidden()) ci.highlight();
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### ChoiceTable.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceTable.highlighted
     */
    ChoiceTable.prototype.unhighlight = function(opts) {
        var ci;
        opts = opts || {};
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        ci = this.customInput;
        if (opts.customInput !== false && ci && !ci.isHidden()) {
            ci.unhighlight();
        }
        this.highlighted = false;
        this.setError();
        this.emit('unhighlighted');
    };

    /**
     * ### ChoiceTable.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *       to find the correct answer. Default: TRUE.
     *   - highlight: If TRUE, if current value is not the correct
     *       value, widget is highlighted. Default: TRUE.
     *   - reset: If TRUTHY and a correct choice is selected (or not
     *       specified), then it resets the state of the widgets before
     *       returning it. Default: FALSE.
     *   - addValue: If FALSE, it does not add .value property. Default: TRUE.
     *   - sortValue: If TRUE and multiple choices are allowed, the values
     *       in the `.value` property are sorted alphabetically. Note! The
     *       choices array is not sorted. Default: TRUE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceTable.verifyChoice
     * @see ChoiceTable.reset
     */
    ChoiceTable.prototype.getValues = function(opts) {
        var obj, resetOpts, i, len, ci, ciCorrect;
        var that;

        that = this;
        opts = opts || {};
        obj = {
            id: this.id,
            choice: opts.reset ?
                this.currentChoice: J.clone(this.currentChoice),
            time: this.timeCurrentChoice,
            nClicks: this.numberOfClicks
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (opts.processChoice) {
            obj.choice = opts.processChoice.call(this, obj.choice);
        }
        if (this.shuffleChoices) obj.order = this.order;

        // Option getValue backward compatible.
        if (opts.addValue !== false && opts.getValue !== false) {
            if (!this.selectMultiple) {
                obj.value = getValueFromChoice(that,this.choices[obj.choice]);
            }
            else {
                len = obj.choice.length;
                obj.value = new Array(len);
                if (len === 1) {
                    obj.value[0] =
                        getValueFromChoice(that,this.choices[obj.choice[0]]);
                }
                else {
                    i = -1;
                    for ( ; ++i < len ; ) {
                        obj.value[i] =
                            getValueFromChoice(that,
                                               this.choices[obj.choice[i]]);
                    }
                    if (opts.sortValue !== false) obj.value.sort();
                }
            }
        }

        if (this.group === 0 || this.group) {
            obj.group = this.group;
        }
        if (this.groupOrder === 0 || this.groupOrder) {
            obj.groupOrder = this.groupOrder;
        }

        ci = this.customInput;
        if (this.required !== false &&
            (null !== this.correctChoice || null !== this.requiredChoice ||
            (ci && !ci.isHidden()))) {

            obj.isCorrect = this.verifyChoice(opts.markAttempt);
            obj.attempts = this.attempts;
            if (!obj.isCorrect && opts.highlight) this.highlight({
                // If errored, it is already highlighted
                customInput: false
            });
        }

        if (this.textarea) obj.freetext = this.textarea.value;

        if (obj.isCorrect === false) {
            // If there is an error on CI, we just highlight CI.
            // However, there could be an error also on the choice table,
            // e.g., not enough options selected. It will be catched
            // at next click.
            // TODO: change verifyChoice to say where the error is coming from.
            if (ci) {
                ciCorrect = ci.getValues({
                    markAttempt: false
                }).isCorrect;
            }
            if (ci && !ciCorrect && !ci.isHidden()) {
                this.unhighlight({ customInput: false });
            }
            else {
                this.setError(this.getText('error', obj.value));
            }
        }
        else if (opts.reset) {
             resetOpts = 'object' !== typeof opts.reset ? {} : opts.reset;
             this.reset(resetOpts);
        }
        return obj;
    };

    /**
     * ### ChoiceTable.setValues
     *
     * Sets values in the choice table as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     *
     * @experimental
     */
    ChoiceTable.prototype.setValues = function(options) {
        var choice, correctChoice, tmp;
        var i, len, j, lenJ;

        if (!this.choices || !this.choices.length) {
            throw new Error('ChoiceTable.setValues: no choices found.');
        }
        options = options || {};

        // TODO: allow it to set it visually or just in the background.
        // Use options.visual.

        // TODO: allow it to set random or fixed values, or correct values
        // TODO: set freetext or not.

        if (!this.choicesCells || !this.choicesCells.length) {
            throw new Error('Choicetable.setValues: table was not ' +
                            'built yet.');
        }

        // Value this.correctChoice can be undefined, string or array.
        // If no correct choice is set, we simply ignore the correct param.
        if (options.correct && this.correctChoice !== null) {

            // Make it an array (can be a string).
            correctChoice = J.isArray(this.correctChoice) ?
                this.correctChoice : [this.correctChoice];

            i = -1, len = correctChoice.length;
            for ( ; ++i < len ; ) {
                choice = parseInt(correctChoice[i], 10);
                if (this.shuffleChoices) {
                    j = -1, lenJ = this.order.length;
                    for ( ; ++j < lenJ ; ) {
                        if (this.order[j] === choice) {
                            choice = j;
                            break;
                        }
                    }
                }

                this.choicesCells[choice].click();
            }
            return;
        }

        // Set values, random or pre-set.
        i = -1;
        // Pre-set.
        if ('undefined' !== typeof options.values) {
            if (!J.isArray(options.values)) tmp = [ options.values ];
            len = tmp.length;
            // Can be true/false or a number > 1.
            if (this.selectMultiple) {
                tmp = 'number' === typeof this.selectMultiple ?
                    this.selectMultiple : this.choices.length;
                if (len > tmp) {
                    throw new Error('ChoiceTable.setValues: values array ' +
                                    'cannot be larger than max allowed set: ' +
                                    len +  ' > ' +  tmp);
                }
                tmp = options.values;
            }

            // Validate value.
            for ( ; ++i < len ; ) {
                choice = J.isInt(tmp[i], -1, (this.choices.length-1), 1, 1);
                if (false === choice) {
                    throw new Error('ChoiceTable.setValues: invalid ' +
                                    'choice value. Found: ' + tmp[i]);
                }
                this.choicesCells[choice].click();
            }
        }
        else {
            // How many random choices?
            len = 1;
            if (this.selectMultiple) {
                // Max random cells.
                len = 'number' === typeof this.selectMultiple ?
                    this.selectMultiple : this.choicesCells.length;
                // Min random cells.
                tmp = this.requiredChoice;
                len = J.randomInt('number' === typeof tmp ? (tmp-1) : 0, len);
            }

            for ( ; ++i < len ; ) {
                // This is the choice idx.
                choice = J.randomInt(-1, (this.choicesCells.length-1));

                // Do not click it again if it is already selected.
                // Else increment len and try again (until 300 failsafe).
                if (this.disabledChoices[choice] ||
                    this.isChoiceCurrent(choice)) {
                    // Failsafe.
                    if (len < 300) len++;
                }
                else {
                    // Resolve to cell idx (might differ if shuffled).
                    j =  this.choicesValues[choice];
                    this.choicesCells[j].click();
                }
            }
        }

        // Make a random comment.
        if (this.textarea) this.textarea.value = J.randomString(100, '!Aa0');
        if (this.customInput && !this.customInput.isHidden()) {
            this.customInput.setValues();
        }
    };

    /**
     * ### ChoiceTable.reset
     *
     * Resets current selection and collected paradata
     *
     * @param {object} options Optional. Available options:
     *    - shuffleChoices: If TRUE, choices are shuffled. Default: FALSE
     */
    ChoiceTable.prototype.reset = function(options) {
        var i, len;

        options = options || {};

        this.attempts = [];
        this.numberOfClicks = 0;
        this.timeCurrentChoice = null;

        if (this.selectMultiple) {
            i = -1, len = this.selected.length;
            for ( ; ++i < len ; ) {
                J.removeClass(this.selected[i], 'selected');
            }
            this.selected = [];
            this.currentChoice = [];

        }
        else {
            if (this.selected) {
                J.removeClass(this.selected, 'selected');
                this.selected = null;
                this.currentChoice = null;
            }
        }

        if (this.textarea) this.textarea.value = '';
        if (this.isHighlighted()) this.unhighlight();

        if (options.shuffleChoices) this.shuffle();
        if (this.customInput) this.customInput.reset();
    };

    /**
     * ### ChoiceTable.shuffle
     *
     * Shuffles the order of the choices
     */
    ChoiceTable.prototype.shuffle = function() {
        var order, H;
        var i, len, cell, choice;
        var choicesValues, choicesCells;
        var parentTR;

        H = this.orientation === 'H';
        len = this.order.length;
        if (this.other) {
            order = J.shuffle(this.order.slice(0,-1));
            order.push(this.order[len - 1]);
        }
        else {
            order = J.shuffle(this.order);
        }
        i = -1;
        choicesValues = {};
        choicesCells = new Array(len);

        for ( ; ++i < len ; ) {
            choice = order[i];
            cell = this.choicesCells[this.choicesValues[choice]];
            choicesCells[i] = cell;
            choicesValues[choice] = i;
            if (H) {
                this.trs[0].appendChild(cell);
            }
            else {
                parentTR = cell.parentElement || cell.parentNode;
                this.table.appendChild(parentTR);
            }
        }
        if (this.rightCell) {
            if (H) {
                this.trs[0].appendChild(this.rightCell);
            }
            else {
                parentTR = this.rightCell.parentElement ||
                    this.rightCell.parentNode;
                this.table.appendChild(parentTR);
            }
        }

        this.order = order;
        this.choicesCells = choicesCells;
        this.choicesValues = choicesValues;
    };

    /**
     * ### ChoiceManager.setValues
     *
     * Sets values for forms in manager as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     */
    ChoiceTable.prototype.next = function() {
        var sol;
        sol = this.solution;
        // No solution or solution already displayed.
        if (!sol || this.solutionDisplayed) return false;
        // Solution, but no answer provided.
        if (sol) {
            if (!this.isChoiceDone() && !this.solutionNoChoice) return false;
            this.solutionDisplayed = true;
            if ('function' === typeof sol) {
                sol = this.solution(this.verifyChoice(false), this);
            }
            this.solutionDiv.innerHTML = sol;
        }
        this.disable();
        W.adjustFrameHeight();
        node.emit('WIDGET_NEXT', this);
        return true;
    };

    ChoiceTable.prototype.prev = function() {
        return false;
        if (!this.solutionDisplayed) return false;
        this.solutionDisplayed = false;
        this.solutionDiv.innerHTML = '';
        this.enable();
        W.adjustFrameHeight();
        node.emit('WIDGET_PREV', this);
        return true;
    };

    ChoiceTable.prototype.isChoiceDone = function(complete) {
        var cho, mul, len, ci;
        ci = this.customInput;
        cho = this.currentChoice;
        mul = this.selectMultiple;
        // Selected "Other, Specify"
        if (ci && this.isChoiceCurrent(this.choices.length-1)) return false;
        // Single choice.
        if ((!complete || !mul) && null !== cho) return true;
        // Multiple choices.
        if (J.isArray(cho)) len = cho.length;
        if (mul === true && len === this.choices.length) return true;
        if ('number' === typeof mul && len === mul) return true;
        // Not done.
        return false;
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
        if ('string' === typeof choice) choice = parseInt(choice, 10);
        if ('number' !== typeof choice) {
            throw new TypeError('ChoiceTable.setCorrectChoice: each choice ' +
                                'must be number or string. Found: ' + choice);
        }
        if ('undefined' === typeof that.choicesValues[choice]) {

            throw new TypeError('ChoiceTable.setCorrectChoice: choice ' +
                                'not found: ' + choice);
        }
        return choice;
    }

    /**
     * ### createTR
     *
     * Creates and append a new TR element
     *
     * Adds the the `id` attribute formatted as:
     *   'tr' + separator + widget_id
     *
     * @param {ChoiceTable} that This instance
     *
     * @return {HTMLElement} Thew newly created TR element
     *
     * @see ChoiceTable.tr
     */
    function createTR(that) {
        var tr;
        tr = document.createElement('tr');
        tr.id = 'tr' + that.separator + that.id;
        that.table.appendChild(tr);
        // Store reference.
        that.trs.push(tr);
        return tr;
    }

    /**
     * ### getValueFromChoice
     *
     * Extract the value from a choice
     *
     * The value is either the text displayed or short value specified
     * by the choice.
     *
     * @param {mixed} choice
     * @param {boolean} display TRUE to return the display value instead
     *   one. Default: FALSE.
     *
     * @return {string|number|null} The value of the choice,
     *   or null if not found.
     *
     * @see ChoiceTable.getValues
     * @see ChoiceTable.renderChoice
     */
    function getValueFromChoice(that, choice, display) {
        if (choice === that.getText('other') && that.customInput) {
          return that.customInput.getValues().value;
        }
        if ('string' === typeof choice || 'number' === typeof choice) {
            return choice;
        }
        if (J.isArray(choice)) return choice[display ? 1 : 0];
        if ('object' === typeof choice) {
            return choice[ display ? 'display' : 'value' ];
        }
        if (J.isElement(choice) || J.isNode(choice)) return choice.innerHTML;
        return null;
    }

})(node);
