/**
 * # CustomInputGroup
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that groups together several custom input widgets
 *
 * @see CustomInput
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('CustomInputGroup', CustomInputGroup);

    // ## Meta-data

    CustomInputGroup.version = '0.3.0';
    CustomInputGroup.description = 'Groups together and manages sets of ' +
        'CustomInput widgets.';

    CustomInputGroup.title = false;
    CustomInputGroup.className = 'custominput custominputgroup';

    CustomInputGroup.separator = '::';

    CustomInputGroup.texts.autoHint = function(w) {
        if (w.requiredChoice) return '*';
        else return false;
    };
    CustomInputGroup.texts.inputErr = 'One or more errors detected.';

    /**
     * ## CustomInputGroup constructor
     *
     * Creates a new instance of CustomInputGroup
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as main
     *   table. All other options are passed to the init method.
     */
    function CustomInputGroup() {

        /**
         * ### CustomInputGroup.dl
         *
         * The table containing all the custom inputs
         */
        this.table = null;

        /**
         * ### CustomInputGroup.trs
         *
         * Collection of all trs created
         *
         * Useful when shuffling items/choices
         *
         * @see CustomInputGroup.shuffle
         */
        this.trs = [];

        /**
         * ### CustomInputGroup.mainText
         *
         * The main text introducing the choices
         *
         * @see CustomInputGroup.spanMainText
         */
        this.mainText = null;

        /**
         * ### CustomInputGroup.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### CustomInputGroup.hint
         *
         * An additional text with information about how to select items
         *
         * If not specified, it may be auto-filled, e.g. '(pick 2)'.
         *
         * @see Feedback.texts.autoHint
         */
        this.hint = null;

        /**
         * ### CustomInputGroup.items
         *
         * The array of available items
         */
        this.items = null;

        /**
         * ### CustomInputGroup.itemsById
         *
         * Map of items ids to items
         */
        this.itemsById = {};

        /**
         * ### CustomInputGroup.itemsMap
         *
         * Maps items ids to the position in the items array
         */
        this.itemsMap = {};

        /**
         * ### CustomInputGroup.choices
         *
         * Array of default choices (if passed as global parameter)
         */
        this.choices = null;

        /**
         * ### CustomInputGroup.choicesById
         *
         * Map of items choices ids to corresponding cell
         *
         * Useful to detect clickable cells.
         */
        this.choicesById = {};

        /**
         * ### CustomInputGroup.itemsSettings
         *
         * The array of settings for each item
         */
        this.itemsSettings = null;

        /**
         * ### CustomInputGroup.order
         *
         * The current order of display of choices
         *
         * May differ from `originalOrder` if shuffled.
         *
         * @see CustomInputGroup.originalOrder
         */
        this.order = null;

        /**
         * ### CustomInputGroup.originalOrder
         *
         * The initial order of display of choices
         *
         * @see CustomInput.order
         */
        this.originalOrder = null;

        /**
         * ### CustomInputGroup.shuffleItems
         *
         * If TRUE, items are inserted in random order
         *
         * @see CustomInputGroup.order
         */
        this.shuffleItems = null;

        /**
         * ### CustomInputGroup.requiredChoice
         *
         * The number of required choices.
         */
        this.requiredChoice = null;

        /**
         * ### ChoiceManager.required
         *
         * TRUE if widget should be checked upon node.done.
         *
         * TODO: Harmonize required and requiredChoice
         */
        this.required = null;

        /**
         * ### CustomInputGroup.orientation
         *
         * Orientation of display of items: vertical ('V') or horizontal ('H')
         *
         * Default orientation is vertical.
         */
        this.orientation = 'V';

        /**
         * ### CustomInputGroup.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### CustomInputGroup.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### CustomInputGroup.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### CustomInputGroup.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        // Options passed to each individual item.

        /**
         * ### CustomInputGroup.timeFrom
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
         * ### CustomInputGroup.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default CustomInputGroup.separator
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.separator = CustomInputGroup.separator;

        /**
         * ### CustomInputGroup.shuffleChoices
         *
         * If TRUE, choices in items are shuffled
         *
         * This option is passed to each individual item.
         *
         * @see mixinSettings
         */
        this.shuffleChoices = null;

        /**
         * ### CustomInputGroup.sharedOptions
         *
         * An object containing options to be added to every custom input
         *
         * Options are added only if forms are specified as object literals,
         * and can be overriden by each individual form.
         */
        this.sharedOptions = {};

        /**
         * ### CustomInputGroup.summaryInput
         *
         * A summary custom input added last which can be updated in real time
         *
         * @see CustomInputGroup.summaryInputCb
         */
        this.summaryInput = null;

        /**
         * ### CustomInputGroup.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### CustomInputGroup.validation
         *
         * The callback validating all the inputs at once
         *
         * The callback is executed by getValues.
         *
         * Input paramers:
         *
         * - res: the validation result of all inputs
         * - values: object literal containing the current value of each input
         * - widget: a reference to this widget
         *
         * Return value:
         *
         * - res: the result object as it is on success, or with with an err
         *        property containing the error message on failure. Any change
         *        to the result object is carried over.
         *
         * @see CustomInputGroup.oninput
         */
        this.validation = null;

        /**
         * ### CustomInputGroup._validation
         *
         * Reference to the user defined validation function
         *
         * @api private
         */
        this._validation = null;

        /**
         * ### CustomInputGroup.oninput
         *
         * Callback called when any input has changed
         *
         * Input paramers:
         *
         * - res: the validation result of the single input
         * - input: the custom input that fired oninput
         * - widget: a reference to this widget
         */
        this.oninput = null;

        /**
         * ### CustomInputGroup._oninput
         *
         * Reference to the user defined oninput function
         *
         * @api private
         */
        this._oninput = null;
    }

    // ## CustomInputGroup methods

    /**
     * ### CustomInputGroup.init
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
     *   - shuffleItems: if TRUE, items are shuffled before being added
     *       to the table
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *   - sharedOptions: Options shared across all inputs
     *   - summary: An object containing the options to instantiate a custom
     *       input summary field.
     *   - validation: A validation callback for all inputs.
     *   - oninput: A callback called when any input is changed
     *
     * @param {object} opts Configuration options
     */
    CustomInputGroup.prototype.init = function(opts) {
        var tmp, that;
        that = this;

        // TODO: many options checking are replicated. Skip them all?
        // Have a method in CustomInput?

        if (!this.id) {
            throw new TypeError('CustomInputGroup.init: id ' +
                                'is missing.');
        }

        // Option orientation, default 'H'.
        if ('undefined' === typeof opts.orientation) {
            tmp = 'V';
        }
        else if ('string' !== typeof opts.orientation) {
            throw new TypeError('CustomInputGroup.init: orientation ' +
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
                throw new Error('CustomInputGroup.init: orientation ' +
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
            throw new TypeError('CustomInputGroup.init: ' +
                                'requiredChoice ' +
                                'be number or boolean or undefined. Found: ' +
                                opts.requiredChoice);
        }

        if ('undefined' !== typeof opts.required) {
            this.required = !!opts.required;
        }

        // Set the group, if any.
        if ('string' === typeof opts.group ||
            'number' === typeof opts.group) {

            this.group = opts.group;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('CustomInputGroup.init: group must ' +
                                'be string, number or undefined. Found: ' +
                                opts.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof opts.groupOrder) {

            this.groupOrder = opts.groupOrder;
        }
        else if ('undefined' !== typeof opts.group) {
            throw new TypeError('CustomInputGroup.init: groupOrder ' +
                                'must be number or undefined. Found: ' +
                                opts.groupOrder);
        }

        // Set the validation function.
        if ('function' === typeof opts.validation) {
            this._validation = opts.validation;

            this.validation = function(res, values) {
                if (!values) values = that.getValues({ valuesOnly: true });
                return that._validation(res || {}, values, that)
            };
        }
        else if ('undefined' !== typeof opts.validation) {
            throw new TypeError('CustomInputGroup.init: validation must ' +
                                'be function or undefined. Found: ' +
                                opts.validation);
        }

        // Set the validation function.
        if ('function' === typeof opts.oninput) {
            this._oninput = opts.oninput;

            this.oninput = function(res, input) {
                that._oninput(res, input, that);
            };
        }
        else if ('undefined' !== typeof opts.oninput) {
            throw new TypeError('CustomInputGroup.init: oninput must ' +
                                'be function or undefined. Found: ' +
                                opts.oninput);
        }

        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('CustomInputGroup.init: mainText ' +
                                'must be string or undefined. Found: ' +
                                opts.mainText);
        }

        // Set the hint, if any.
        if ('string' === typeof opts.hint) {
            this.hint = opts.hint;
            if (this.requiredChoice) this.hint += ' *';
        }
        else if ('undefined' !== typeof opts.hint) {
            throw new TypeError('CustomInputGroup.init: hint must ' +
                                'be a string, or undefined. Found: ' +
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
            throw new TypeError('CustomInputGroup.init: timeFrom ' +
                                'must be string, false, or undefined. Found: ' +
                                opts.timeFrom);
        }

        // Option shuffleChoices, default false.
        if ('undefined' !== typeof opts.shuffleChoices) {
            this.shuffleChoices = !!opts.shuffleChoices;
        }

        // Set the className, if not use default.
        if ('undefined' === typeof opts.className) {
            this.className = CustomInputGroup.className;
        }
        else if (opts.className === false ||
                 'string' === typeof opts.className ||
                 J.isArray(opts.className)) {

            this.className = opts.className;
        }
        else {
            throw new TypeError('CustomInputGroup.init: ' +
                                'className must be string, array, ' +
                                'or undefined. Found: ' + opts.className);
        }

        // sharedOptions.
        if ('undefined' !== typeof opts.sharedOptions) {
            if ('object' !== typeof opts.sharedOptions) {
                throw new TypeError('CustomInputGroup.init: sharedOptions' +
                                    ' must be object or undefined. Found: ' +
                                    opts.sharedOptions);
            }
            if (opts.sharedOptions.hasOwnProperty('name')) {
                throw new Error('CustomInputGroup.init: sharedOptions ' +
                                'cannot contain property name. Found: ' +
                                opts.sharedOptions);
            }
            this.sharedOptions = J.mixin(this.sharedOptions,
                                        opts.sharedOptions);
        }

        if ('undefined' !== typeof opts.summary) {
            if ('string' === typeof opts.summary) {
                opts.summary = { mainText: opts.summary }
            }
            else if ('object' !== typeof opts.summary) {
                throw new TypeError('CustomInputGroup.init: summary' +
                                    ' must be object or undefined. Found: ' +
                                    opts.summary);
            }

            this.summaryInput = opts.summary;
        }

        // After all configuration options are evaluated, add items.

        if ('object' === typeof opts.table) {
            this.table = opts.table;
        }
        else if ('undefined' !== typeof opts.table &&
                 false !== opts.table) {

            throw new TypeError('CustomInputGroup.init: table ' +
                                'must be object, false or undefined. ' +
                                'Found: ' + opts.table);
        }

        // TODO: check this.
        this.table = opts.table;

        this.freeText = 'string' === typeof opts.freeText ?
            opts.freeText : !!opts.freeText;

        // Add the items.
        if ('undefined' !== typeof opts.items) this.setItems(opts.items);

    };

    /**
     * ### CustomInputGroup.setItems
     *
     * Sets the available items and optionally builds the table
     *
     * @param {array} items The array of items
     *
     * @see CustomInputGroup.table
     * @see CustomInputGroup.order
     * @see CustomInputGroup.shuffleItems
     * @see CustomInputGroup.buildTable
     */
    CustomInputGroup.prototype.setItems = function(items) {
        var len;
        if (!J.isArray(items)) {
            throw new TypeError('CustomInputGroup.setItems: ' +
                                'items must be array. Found: ' + items);
        }
        if (!items.length) {
            throw new Error('CustomInputGroup.setItems: ' +
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
     * ### CustomInputGroup.buildTable
     *
     * Builds the table of clickable items and enables it
     *
     * Must be called after items have been set already.
     *
     * @see CustomInputGroup.setCustomInputs
     */
    CustomInputGroup.prototype.buildTable = function() {
        var i, len, tr, H;

        H = this.orientation === 'H';
        i = -1, len = this.itemsSettings.length;

        if (H) tr = createTR(this, 'row1');
        for ( ; ++i < len ; ) {
            // Add new TR.
            if (!H) tr = createTR(this, 'row' + (i+1));
            addCustomInput(this, tr, i);
        }
        if (this.summaryInput) {
            if (!H) tr = createTR(this, 'row' + (i+1));
            addSummaryInput(this, tr, i);
        }


        var that = this;
        this.table.onclick = function() {
            // Remove any warning/error from form on click.
            if (that.isHighlighted()) that.unhighlight();
        };

        this.enable(true);
    };

    /**
     * ### CustomInputGroup.append
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
    CustomInputGroup.prototype.append = function() {
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('CustomInputGroup.append: id ' +
                            'is not unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = W.append('span', this.bodyDiv, {
                className: 'custominputgroup-maintext',
                innerHTML: this.mainText
            });
        }
        // Hint.
        if (this.hint) {
            W.append('span', this.spanMainText || this.bodyDiv, {
                className: 'custominputgroup-hint',
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
            this.textarea.id = this.id + '_text';
            this.textarea.className = CustomInputGroup.className + '-freetext';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### CustomInputGroup.listeners
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
    CustomInputGroup.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### CustomInputGroup.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    CustomInputGroup.prototype.disable = function() {
        if (this.disabled === true || !this.table) return;
        this.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### CustomInputGroup.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    CustomInputGroup.prototype.enable = function(force) {
        if (!this.table || (!force && !this.disabled)) return;
        this.disabled = false;
        this.emit('enabled');
    };

    /**
     * ### CustomInputGroup.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see CustomInputGroup.highlighted
     */
    CustomInputGroup.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('CustomInputGroup.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.table || this.highlighted === true) return;
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### CustomInputGroup.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see CustomInputGroup.highlighted
     */
    CustomInputGroup.prototype.unhighlight = function() {
        if (!this.table || this.highlighted !== true) return;
        this.table.style.border = '';
        this.highlighted = false;
        this.errorBox.innerHTML = '';
        this.emit('unhighlighted');
    };

    /**
     * ### CustomInputGroup.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - valuesOnly: just returns the current values, no other checkings.
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
     * @see CustomInputGroup.verifyChoice
     * @see CustomInputGroup.reset
     */
    CustomInputGroup.prototype.getValues = function(opts) {
        var res, i, len, input, toReset, values;

        opts = opts || {};
        i = -1, len = this.items.length;
        if (opts.valuesOnly) {
            res = {};
            for ( ; ++i < len ; ) {
                res[this.items[i].id] =
                    this.items[i].getValues({ valuesOnly: true });
            }
            return res;
        }
        res = {
            id: this.id,
            order: this.order,
            items: {},
            isCorrect: true
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        // TODO: do we need markAttempt?
        // if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;

        // Make sure reset is done only at the end.
        toReset = opts.reset;
        opts.reset = false;

        if (this.validation) values = {};
        for ( ; ++i < len ; ) {
            input = this.items[i];
            res.items[input.id] = input.getValues(opts);
            // TODO is null or empty?
            if (res.items[input.id].value === "") {
                res.missValues = true;
                // TODO: check do we need to check for correctChoice?
                if (input.requiredChoice || input.required ||
                    input.correctChoice) {

                    res.err = true;
                    res.isCorrect = false;
                }
            }
            if (res.items[input.id].isCorrect === false && opts.highlight) {
                res.err = true;
            }
            if (values) values[input.id] = res.items[input.id].value;
        }
        if (!res.err && values) {
            // res.err = this.getText('inputErr');
            this.validation(res, values);
            if (opts.highlight && res.err) this.setError(res.err);
            if (res.err) res.isCorrect = false;
        }
        else if (toReset) this.reset(toReset);
        if (!res.isCorrect && opts.highlight) this.highlight();

        // Restore opts.reset.
        opts.reset = toReset;

        if (this.textarea) res.freetext = this.textarea.value;
        return res;
    };

    /**
     * ### CustomInputGroup.setValues
     *
     * Sets values in the choice table group as specified by the options
     *
     * @param {object} options Optional. Options specifying how to set
     *   the values. If no parameter is specified, random values will
     *   be set.
     *
     * @see CustomInput.setValues
     *
     * @experimental
     */
    CustomInputGroup.prototype.setValues = function(opts) {
        var i, len;
        if (!this.items || !this.items.length) {
            throw new Error('CustomInputGroup.setValues: no items found.');
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
     * ### CustomInputGroup.reset
     *
     * Resets all the CustomInput items and textarea
     *
     * @param {object} options Optional. Options specifying how to set
     *   to reset each item
     *
     * @see CustomInput.reset
     * @see CustomInputGroup.shuffle
     */
    CustomInputGroup.prototype.reset = function(opts) {
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
     * ### CustomInputGroup.shuffle
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
    CustomInputGroup.prototype.shuffle = function(opts) {
        var order, i, len, that, cb, newOrder;
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

    /**
     * ### CustomInputGroup.setError
     *
     * Set the error msg inside the errorBox and call highlight
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see CustomInput.highlight
     * @see CustomInput.errorBox
     */
    CustomInputGroup.prototype.setError = function(err) {
        this.errorBox.innerHTML = err;
        this.highlight();
    };
    // ## Helper methods.

    /**
     * ### mixinSettings
     *
     * Mix-ins global settings with local settings for specific choice tables
     *
     * @param {CustomInputGroup} that This instance
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
        else if ('object' !== typeof s) {
            throw new TypeError('CustomInputGroup.buildTable: item must be ' +
                                'string or object. Found: ' + s);
        }
        s.group = that.id;
        s.groupOrder = i+1;
        s.orientation = that.orientation;
        s.title = false;

        if (that.oninput) s.oninput = that.oninput;

        if ('undefined' === typeof s.requiredChoice && that.requiredChoice) {
            s.requiredChoice = that.requiredChoice;
        }

        if ('undefined' === typeof s.timeFrom) s.timeFrom = that.timeFrom;

        s = J.mixout(s, that.sharedOptions);

        // No reference is stored in node.widgets.
        s.storeRef = false;

        return s;
    }

    /**
     * ### addCustomInput
     *
     * Creates a instance i-th of choice table with relative settings
     *
     * Stores a reference of each input in `itemsById`
     *
     * @param {CustomInputGroup} that This instance
     * @param {HTMLElement} tr A TR element where the custom input is appended
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} ct The requested choice table
     *
     * @see CustomInputGroup.itemsSettings
     * @see CustomInputGroup.itemsById
     * @see mixinSettings
     */
    function addCustomInput(that, tr, i) {
        var ci, s, td, idx;
        idx = that.order[i];
        s = mixinSettings(that, that.itemsSettings[idx], i);
        td = document.createElement('td');
        tr.appendChild(td);
        ci = node.widgets.append('CustomInput', td, s);
        if (that.itemsById[ci.id]) {
            throw new Error('CustomInputGroup.buildTable: an input ' +
                            'with the same id already exists: ' + ci.id);
        }
        that.itemsById[ci.id] = ci;
        that.items[idx] = ci;
        that.itemsMap[ci.id] = idx;

        if (s.required || s.requiredChoice || s.correctChoice) {
            // False is set manually, otherwise undefined.
            if (that.required === false) {
                throw new Error('CustomInputGroup.buildTable: required is ' +
                                'false, but item "' + s.id +
                                '" has required truthy');
            }
            that.required = true;
        }

        return ci;
    }

    /**
     * ### addSummaryInput
     *
     * Creates the last summary input
     *
     * Stores a reference in `summaryInput`
     *
     * @param {CustomInputGroup} that This instance
     * @param {HTMLElement} tr A TR element where the custom input is appended
     * @param {number} i The ordinal position of the table in the group
     *
     * @return {object} ct The requested choice table
     *
     * @see CustomInputGroup.itemsSettings
     * @see CustomInputGroup.itemsById
     * @see mixinSettings
     */
    function addSummaryInput(that, tr, i) {
        var ci, s, td;
        s = J.mixout({
            id: that.id + '_summary',
            storeRef: false,
            title: false,
            panel: false,
            className: 'custominputgroup-summary',
            disabled: true
        }, that.sharedOptions);
        s = J.mixin(s, that.summaryInput);
        td = document.createElement('td');
        tr.appendChild(td);
        ci = node.widgets.append('CustomInput', td, s);
        that.summaryInput = ci;
        return ci;
    }

    /**
     * ### createTR
     *
     * Creates and append a new TR element
     *
     * If required by current configuration, the `id` attribute is
     * added to the TR in the form of: 'tr' + separator + widget_id
     *
     * @param {CustomInput} that This instance
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
