/**
 * # ChoiceManager
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

    node.widgets.register('ChoiceManager', ChoiceManager);

    // ## Meta-data

    ChoiceManager.version = '1.0.0';
    ChoiceManager.description = 'Groups together and manages sets of ' +
        'selectable choices forms (e.g. ChoiceTable).';

    ChoiceManager.title = 'Complete the forms below';
    ChoiceManager.className = 'choicemanager';

    // ## Dependencies

    ChoiceManager.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceManager constructor
     *
     * Creates a new instance of ChoiceManager
     *
     * @param {object} options Optional. Configuration options.
     *   If a `table` option is specified, it sets it as the clickable
     *   table. All other options are passed to the init method.
     *
     * @see ChoiceManager.init
     */
    function ChoiceManager(options) {
        var that;
        that = this;

        // TODO: move them in the Widgets as a check?
        if ('string' !== typeof options.id) {
            throw new TypeError('ChoiceManager constructor: options.id must ' +
                                'be string. Found: ' + options.id);
        }
        if (W.getElementById(options.id)) {
            throw new TypeError('ChoiceManager constructor: options.id is ' +
                                'not unique: ' + options.id);
        }

        /**
         * ### ChoiceManager.id
         *
         * The ID of the instance
         *
         * Will be used as the table id, and as prefix for all choice TDs
         */
        this.id = options.id;

        /**
         * ### ChoiceManager.dl
         *
         * The clickable list containing all the forms
         */
        this.dl = null;

        /**
         * ## ChoiceManager.listener
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
         * ### ChoiceManager.disabled
         *
         * Flag indicating if the event listener onclick is active
         */
        this.disabled = true;

        /**
         * ### ChoiceManager.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceManager.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceManager.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceManager.forms
         *
         * The array available forms
         */
        this.forms = null;

        /**
         * ### ChoiceManager.timeFrom
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
         * ### ChoiceManager.order
         *
         * The order of the forms as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceManager.group
         *
         * The name of the group where the table belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceManager.groupOrder
         *
         * The order of the choice table within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceManager.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceManager.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;

        /**
         * ### ChoiceManager.separator
         *
         * Symbol used to separate tokens in the id attribute of every cell
         *
         * Default ChoiceManager.separator
         */
        this.separator = ChoiceManager.separator;

        // Init.
        this.init(options);
    }

    // ## ChoiceManager methods

    /**
     * ### ChoiceManager.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the table (string, array), or false
     *       to have none.
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the table in the group, if any
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the table
     *   - shuffleForms: if TRUE, forms are shuffled before being added
     *       to the table
     *   - freeText: if TRUE, a textarea will be added under the table,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceManager.prototype.init = function(options) {
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
                throw new TypeError('ChoiceManager.init: options.className ' +
                                    'must be string, array, or undefined. ' +
                                    'Found: ' + options.className);
            }
        }

        // Option shuffleForms, default false.
        if ('undefined' === typeof options.shuffleForms) tmp = false;
        else tmp = !!options.shuffleForms;
        this.shuffleForms = tmp;


        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.groupOrder must ' +
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
            throw new TypeError('ChoiceManager.init: options.onclick must ' +
                                'be function or undefined. Found: ' +
                                options.onclick);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceManager.init: options.mainText must ' +
                                'be string, undefined. Found: ' +
                                options.mainText);
        }

        // Set the timeFrom, if any.
        if (options.timeFrom === false ||
            'string' === typeof options.timeFrom) {

            this.timeFrom = options.timeFrom;
        }
        else if ('undefined' !== typeof options.timeFrom) {
            throw new TypeError('ChoiceManager.init: options.timeFrom must ' +
                                'be string, false, or undefined. Found: ' +
                                options.timeFrom);
        }




        // After all configuration options are evaluated, add forms.


        // Add the forms.
        if ('undefined' !== typeof options.forms) {
            this.setForms(options.forms);
        }

        // Creates a free-text textarea, possibly with an initial text
        if (options.freeText) {

            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            this.textarea.className = ChoiceManager.className + '-freetext';

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
     * ### ChoiceManager.setForms
     *
     * Sets the available forms and optionally builds the table
     *
     * If a table is defined, it will automatically append the forms
     * as TD cells. Otherwise, the forms will be built but not appended.
     *
     * @param {array} forms The array of forms
     *
     * @see ChoiceManager.table
     * @see ChoiceManager.shuffleForms
     * @see ChoiceManager.order
     * @see ChoiceManager.buildForms
     * @see ChoiceManager.buildTableAndForms
     */
    ChoiceManager.prototype.setForms = function(forms) {
        var len;
    };


    /**
     * ### ChoiceManager.buildForms
     *
     * Render every choice and stores cell in `choiceCells` array
     *
     * Follows a shuffled order, if set
     *
     * @see ChoiceManager.order
     * @see ChoiceManager.renderChoice
     */
    ChoiceManager.prototype.buildForms = function() {
        var i, len, td;

    };

    /**
     * ### ChoiceManager.buildTable
     *
     * Builds the table of clickable forms and enables it
     *
     * Must be called after forms have been set already.
     *
     * @see ChoiceManager.setForms
     * @see ChoiceManager.order
     */
    ChoiceManager.prototype.buildTable = function() {
        var i, len, tr, H;

        // Enable onclick listener.
        this.enable();
    };



    ChoiceManager.prototype.append = function() {

        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = ChoiceManager.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            this.bodyDiv.appendChild(this.spanMainText);
        }

        // TODO: append all forms.

        if (this.textarea) this.bodyDiv.appendChild(this.textarea);
    };

    ChoiceManager.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceManager.disable
     *
     * Disables clicking on the table and removes CSS 'clicklable' class
     */
    ChoiceManager.prototype.disable = function() {
        if (this.disabled) return;
        this.disabled = true;
        if (this.table) {
            J.removeClass(this.table, 'clickable');
            this.table.removeEventListener('click', this.listener);
        }
    };

    /**
     * ### ChoiceManager.enable
     *
     * Enables clicking on the table and adds CSS 'clicklable' class
     *
     * @return {function} cb The event listener function
     */
    ChoiceManager.prototype.enable = function() {
        if (!this.disabled) return;
        if (!this.table) {
            throw new Error('ChoiceManager.enable: table not defined.');
        }
        this.disabled = false;
        J.addClass(this.table, 'clickable');
        this.table.addEventListener('click', this.listener);
    };

    /**
     * ### ChoiceManager.verifyChoice
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
     * @see ChoiceManager.attempts
     * @see ChoiceManager.setCorrectChoice
     */
    ChoiceManager.prototype.verifyChoice = function(markAttempt) {

    };

    /**
     * ### ChoiceManager.unsetCurrentChoice
     *
     * Deletes the value for currentChoice
     *
     * If `ChoiceManager.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete from currentChoice
     *   when multiple selections are allowed
     *
     * @see ChoiceManager.currentChoice
     * @see ChoiceManager.selectMultiple
     */
    ChoiceManager.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple || 'undefined' === typeof choice) {
            this.currentChoice = null;
        }
        else {
            if ('string' !== typeof choice && 'number' !== typeof choice) {
                throw new TypeError('ChoiceManager.unsetCurrentChoice: ' +
                                    'choice must be string, number ' +
                                    'or undefined.');
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
     * ### ChoiceManager.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the table's border.
     *   Default '1px solid red'
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.highlight = function(border) {
        if (!this.table) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceManager.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.table.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceManager.unhighlight
     *
     * Removes highlight from the choice table
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.unhighlight = function() {
        if (!this.table) return;
        this.table.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceManager.isHighlighted
     *
     * Returns TRUE if the choice table is highlighted
     *
     * @return {boolean} ChoiceManager.highlighted
     */
    ChoiceManager.prototype.isHighlighted = function() {
        return this.highlighted;
    };

    /**
     * ### ChoiceManager.getAllValues
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
     * @see ChoiceManager.verifyChoice
     */
    ChoiceManager.prototype.getAllValues = function(opts) {
        var obj, i, len;
        obj = {
            id: this.id,
            order: this.order
        };
        opts = opts || {};
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            obj[this.forms[i].id] = this.forms[i].getAllValues(opts);
        }
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    // ## Helper methods.


})(node);
