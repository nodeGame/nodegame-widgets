/**
 * # ChoiceManager
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manages a set of selectable choices forms (e.g., ChoiceTable).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ChoiceManager', ChoiceManager);

    // ## Meta-data

    ChoiceManager.version = '1.6.0';
    ChoiceManager.description = 'Groups together and manages a set of ' +
        'survey forms (e.g., ChoiceTable).';

    ChoiceManager.title = false;
    ChoiceManager.className = 'choicemanager';

    // ## Dependencies

    ChoiceManager.dependencies = {};

    /**
     * ## ChoiceManager constructor
     *
     * Creates a new instance of ChoiceManager
     */
    function ChoiceManager() {
        /**
         * ### ChoiceManager.dl
         *
         * The clickable list containing all the forms
         */
        this.dl = null;

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
         *
         * @see ChoiceManager.formsById
         */
        this.forms = null;

        /**
         * ### ChoiceManager.forms
         *
         * A map form id to form
         *
         * Note: if a form does not have an id, it will not be added here.
         *
         * @see ChoiceManager.forms
         */
        this.formsById = null;

        /**
         * ### ChoiceManager.order
         *
         * The order of the forms as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceManager.shuffleForms
         *
         * TRUE, if forms have been shuffled
         */
        this.shuffleForms = null;

        /**
         * ### ChoiceManager.group
         *
         * The name of the group where the list belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceManager.groupOrder
         *
         * The order of the list within the group
         */
        this.groupOrder = null;

        // TODO: rename in sharedOptions.
        /**
         * ### ChoiceManager.formsOptions
         *
         * An object containing options to be added to every form
         *
         * Options are added only if forms are specified as object literals,
         * and can be overriden by each individual form.
         */
        this.formsOptions =  {
            title: false,
            frame: false,
            storeRef: false
        };


        /**
         * ### ChoiceManager.simplify
         *
         * If TRUE, it returns getValues() returns forms.values
         *
         * @see ChoiceManager.getValue
         */
        this.simplify = null;

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
         * ### ChoiceManager.required
         *
         * If TRUE, the widget is checked upon node.done.
         */
        this.required = null;

        /**
         * ### ChoiceManager.oneByOne
         *
         * If, TRUE the widget displays only one form at the time
         *
         * Calling node.done will display the next form.
         */
        this.oneByOne = null;

        /**
         * ### ChoiceManager.oneByOneCounter
         *
         * Index the currently displayed form if oneByOne is TRUE
         */
        this.oneByOneCounter = 0;

        /**
         * ### ChoiceManager.oneByOneResults
         *
         * Contains partial results from forms if OneByOne is true
         */
        this.oneByOneResults = {};
    }

    // ## ChoiceManager methods

    /**
     * ### ChoiceManager.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the list (string, array), or false
     *       to have none.
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the list in the group, if any
     *   - mainText: a text to be displayed above the list
     *   - shuffleForms: if TRUE, forms are shuffled before being added
     *       to the list
     *   - freeText: if TRUE, a textarea will be added under the list,
     *       if 'string', the text will be added inside the the textarea
     *   - forms: the forms to displayed, formatted as explained in
     *       `ChoiceManager.setForms`
     *   - formsOptions: a set of default options to add to every form
     *
     * @param {object} options Configuration options
     *
     * @see ChoiceManager.setForms
     */
    ChoiceManager.prototype.init = function(options) {
        var tmp;

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

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceManager.init: options.mainText must ' +
                                'be string or undefined. Found: ' +
                                options.mainText);
        }

        // formsOptions.
        if ('undefined' !== typeof options.formsOptions) {
            if ('object' !== typeof options.formsOptions) {
                throw new TypeError('ChoiceManager.init: options.formsOptions' +
                                    ' must be object or undefined. Found: ' +
                                    options.formsOptions);
            }
            if (options.formsOptions.hasOwnProperty('name')) {
                throw new Error('ChoiceManager.init: options.formsOptions ' +
                                'cannot contain property name. Found: ' +
                                options.formsOptions);
            }
            this.formsOptions = J.mixin(this.formsOptions,
                                        options.formsOptions);
        }

        this.freeText = 'string' === typeof options.freeText ?
            options.freeText : !!options.freeText;

        if ('undefined' !== typeof options.required) {
            this.required = !!options.required;
        }

        // If TRUE, it returns getValues returns forms.values.
        this.simplify = !!options.simplify;

        // If TRUE, forms are displayed one by one.
        this.oneByOne = !!options.oneByOne;

        // After all configuration options are evaluated, add forms.

        if ('undefined' !== typeof options.forms) this.setForms(options.forms);
    };

    /**
     * ### ChoiceManager.setForms
     *
     * Sets the available forms
     *
     * Each form element can be:
     *
     *   - an instantiated widget
     *   - a "widget-like" element (`append` and `getValues` methods must exist)
     *   - an object with the `name` of the widget and optional settings, e.g.:
     *
     *  ```
     *     {
     *        name: 'ChoiceTable',
     *        mainText: 'Did you commit the crime?',
     *        choices: [ 'Yes', 'No' ],
     *     }
     *  ```
     *
     * @param {array|function} forms The array of forms or a function
     *   returning an array of forms
     *
     * @see ChoiceManager.order
     * @see ChoiceManager.isWidget
     * @see ChoiceManager.shuffleForms
     * @see ChoiceManager.buildForms
     * @see ChoiceManager.buildTableAndForms
     */
    ChoiceManager.prototype.setForms = function(forms) {
        var form, formsById, i, len, parsedForms, name;
        if ('function' === typeof forms) {
            parsedForms = forms.call(node.game);
            if (!J.isArray(parsedForms)) {
                throw new TypeError('ChoiceManager.setForms: forms is a ' +
                                    'callback, but did not returned an ' +
                                    'array. Found: ' + parsedForms);
            }
        }
        else if (J.isArray(forms)) {
            parsedForms = forms;
        }
        else {
            throw new TypeError('ChoiceManager.setForms: forms must be array ' +
                                'or function. Found: ' + forms);
        }

        len = parsedForms.length;
        if (!len) {
            throw new Error('ChoiceManager.setForms: forms is an empty array.');
        }

        // Manual clone forms.
        formsById = {};
        forms = new Array(len);
        i = -1;
        for ( ; ++i < len ; ) {
            form = parsedForms[i];
            if (!node.widgets.isWidget(form)) {
                // TODO: smart checking form name. Maybe in Stager already?
                name = form.name || 'ChoiceTable';
                // Add defaults.
                J.mixout(form, this.formsOptions);

                // Display forms one by one.
                if (this.oneByOne && this.oneByOneCounter !== i) {
                    form.hidden = true;
                }

                form = node.widgets.get(name, form);
            }

            if (form.id) {
                if (formsById[form.id]) {
                    throw new Error('ChoiceManager.setForms: duplicated ' +
                                    'form id: ' + form.id);
                }

            }
            else {
                form.id = form.className + '_' + i;
            }
            forms[i] = form;
            formsById[form.id] = forms[i];

            if (form.required || form.requiredChoice || form.correctChoice) {
                // False is set manually, otherwise undefined.
                if (this.required === false) {
                    throw new Error('ChoiceManager.setForms: required is ' +
                                    'false, but form "' + form.id +
                                    '" has required truthy');
                }
                this.required = true;
            }
        }
        // Assigned verified forms.
        this.forms = forms;
        this.formsById = formsById;

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleForms) this.order = J.shuffle(this.order);
    };

    /**
     * ### ChoiceManager.buildDl
     *
     * Builds the list of all forms
     *
     * Must be called after forms have been set already.
     *
     * @see ChoiceManager.setForms
     * @see ChoiceManager.order
     */
    ChoiceManager.prototype.buildDl = function() {
        var i, len, dt;
        var form;

        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            dt = document.createElement('dt');
            dt.className = 'question';
            form = this.forms[this.order[i]];
            node.widgets.append(form, dt);
            this.dl.appendChild(dt);
        }
    };

    ChoiceManager.prototype.append = function() {
        // Id must be unique.
        if (W.getElementById(this.id)) {
            throw new Error('ChoiceManager.append: id is not ' +
                            'unique: ' + this.id);
        }

        // MainText.
        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = ChoiceManager.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            // Append mainText.
            this.bodyDiv.appendChild(this.spanMainText);
        }

        // Dl.
        this.dl = document.createElement('dl');
        this.buildDl();
        // Append Dl.
        this.bodyDiv.appendChild(this.dl);

        // Creates a free-text textarea, possibly with placeholder text.
        if (this.freeText) {
            this.textarea = document.createElement('textarea');
            if (this.id) this.textarea.id = this.id + '_text';
            if ('string' === typeof this.freeText) {
                this.textarea.placeholder = this.freeText;
            }
            this.textarea.className = ChoiceManager.className + '-freetext';
            // Append textarea.
            this.bodyDiv.appendChild(this.textarea);
        }
    };

    /**
     * ### ChoiceManager.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * @see Widget.listeners
     */
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
     * Disables all forms
     */
    ChoiceManager.prototype.disable = function() {
        var i, len;
        if (this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].disable();
        }
        this.disabled = true;
        this.emit('disabled');
    };

    /**
     * ### ChoiceManager.enable
     *
     * Enables all forms
     */
    ChoiceManager.prototype.enable = function() {
        var i, len;
        if (!this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].enable();
        }
        this.disabled = false;
        this.emit('enabled')
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
        var i, len, obj, form;
        obj = {
            id: this.id,
            order: this.order,
            forms: {}
        };
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            form = this.forms[i];
            obj.forms[form.id] = form.verifyChoice(markAttempt);
            if (!obj.form[form.id]) obj.fail = true;
        }
        return obj;
    };

    /**
     * ### ChoiceManager.setCurrentChoice
     *
     * Marks a choice as current in each form
     *
     * If the item allows it, multiple choices can be set as current.
     *
     * @param {number|string} The choice to mark as current
     */
    ChoiceManager.prototype.setCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.forms[i].length;
        for ( ; ++i < len ; ) {
            this.forms[i].setCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceManager.unsetCurrentChoice
     *
     * Deletes the value for currentChoice in each form
     *
     * If `ChoiceManager.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete
     *   when multiple selections are allowed
     */
    ChoiceManager.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        i = -1, len = this.forms[i].length;
        for ( ; ++i < len ; ) {
            this.forms[i].unsetCurrentChoice(choice);
        }
    };

    /**
     * ### ChoiceManager.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the dl's border.
     *   Default '1px solid red'
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceManager.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (!this.dl || this.highlighted === true) return;
        this.dl.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted');
    };

    /**
     * ### ChoiceManager.unhighlight
     *
     * Removes highlight from the choice dl
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.unhighlight = function() {
        if (!this.dl || this.highlighted !== true) return;
        this.dl.style.border = '';
        this.highlighted = false;
        this.emit('unhighlighted');
    };

    /**
     * ### ChoiceManager.reset
     *
     * Resets all forms
     *
     * @param {object} opts Optional. Reset options to pass each form
     */
    ChoiceManager.prototype.reset = function(opts) {
        var i, len;
        i = -1;
        len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].reset(opts);
        }
    };

    /**
     * ### ChoiceManager.getValues
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
     *   - highlight:   If TRUE, forms that do not have a correct value
     *      will be highlighted. Default: TRUE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceManager.verifyChoice
     */
    ChoiceManager.prototype.getValues = function(opts) {
        var obj, i, len, form, lastErrored, res;
        obj = {
            order: this.order,
            forms: {},
            missValues: []
        };
        if ('undefined' !== typeof this.id) obj.id = this.id;
        opts = opts || {};
        if ('undefined' === typeof opts.markAttempt) opts.markAttempt = true;
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (opts.markAttempt) obj.isCorrect = true;

        len = this.forms.length;

        // Only one form displayed.
        if (this.oneByOne) {

            // Evaluate one-by-one and store partial results.
            if (this.oneByOneCounter < (len-1)) {
                form = this.forms[this.oneByOneCounter];
                res = form.getValues(opts);
                if (res) {
                    this.oneByOneResults[form.id] = res;
                    lastErrored = checkFormResult(res, form, opts);

                    if (!lastErrored) {
                        this.forms[this.oneByOneCounter].hide();
                        this.oneByOneCounter++;
                        this.forms[this.oneByOneCounter].show();
                        W.adjustFrameHeight();
                        // Prevent stepping.
                        obj.isCorrect = false;
                    }
                }
            }
            // All one-by-one pages executed.
            else {
                // Copy all partial results in the obj returning the
                obj.forms = this.oneByOneResults;
            }

        }
        // All forms on the page.
        else {
            i = -1;
            for ( ; ++i < len ; ) {
                form = this.forms[i];
                // If it is hidden or disabled we do not do validation.
                if (form.isHidden() || form.isDisabled()) {
                    res = form.getValues({
                        markAttempt: false,
                        highlight: false
                    });
                    if (res) obj.forms[form.id] = res;
                }
                else {
                    // ContentBox does not return a value.
                    res = form.getValues(opts);
                    if (!res) continue;
                    obj.forms[form.id] = res;

                    res = checkFormResult(res, form, opts, obj);
                    if (res) lastErrored = res;
                }
            }
        }

        if (lastErrored) {
            if (opts.highlight &&
                'function' === typeof lastErrored.bodyDiv.scrollIntoView) {

                lastErrored.bodyDiv.scrollIntoView({ behavior: 'smooth' });
            }
            obj._scrolledIntoView = true;
            obj.isCorrect = false;
            // Adjust frame heights because of error msgs.
            // TODO: error msgs should not change the height.
            W.adjustFrameHeight();
        }
        // if (obj.missValues.length) obj.isCorrect = false;
        if (this.textarea) obj.freetext = this.textarea.value;

        // Simplify everything, if requested.
        if (opts.simplify || this.simplify) {
            res = obj;
            obj = obj.forms;
            if (res.isCorrect === false) obj.isCorrect = false;
            if (res.freetext) obj.freetext = res.freetext;
        }
        return obj;
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
    ChoiceManager.prototype.setValues = function(opts) {
        var i, len;
        if (!this.forms || !this.forms.length) {
            throw new Error('ChoiceManager.setValues: no forms found.');
        }
        opts = opts || {};
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].setValues(opts);
        }

        // Make a random comment.
        if (this.textarea) this.textarea.value = J.randomString(100, '!Aa0');
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
    ChoiceManager.prototype.next = function() {
        var form;
        if (!this.oneByOne) return false;
        if (!this.forms || !this.forms.length) {
            throw new Error('ChoiceManager.next: no forms found.');
        }
        form = this.forms[this.oneByOneCounter];
        if (form.next()) return false;
        if (this.oneByOneCounter >= (this.forms.length-1)) return false;
        form.hide();
        this.oneByOneCounter++;
        this.forms[this.oneByOneCounter].show();
        W.adjustFrameHeight();

        node.emit('WIDGET_NEXT', this);
    };

    ChoiceManager.prototype.prev = function() {
        var form;
        if (!this.oneByOne) return false;
        if (!this.forms || !this.forms.length) {
            throw new Error('ChoiceManager.prev: no forms found.');
        }
        form = this.forms[this.oneByOneCounter];
        if (form.prev()) return true;
        if (this.oneByOneCounter <= 1) return false;
        form.hide();
        this.oneByOneCounter--;
        this.forms[this.oneByOneCounter].show();
        W.adjustFrameHeight();
        node.emit('WIDGET_PREV', this);
    };

    // ## Helper methods.

    function checkFormResult(res, form, opts, out) {
        var err;
        // Backward compatible (requiredChoice).
        if ((form.required || form.requiredChoice) &&
            (res.choice === null ||
            (form.selectMultiple && !res.choice.length))) {

            if (out) out.missValues.push(form.id);
            err = form;
        }
        if (opts.markAttempt && res.isCorrect === false) {
            // out.isCorrect = false;
            err = form;
        }

        return err;
    }

// In progress.
//     const createOnClick = (choice, question) => {
//     return function(value, removed, td) {
//         var w, hide;
//         w = node.widgets.lastAppended.formsById[question];
//         if (J.isArray(choice)) {
//             hide = !J.inArray(this.currentChoice, choice);
//         }
//         else {
//             hide = this.currentChoice !== choice;
//         }
//         if (hide) w.hide();
//         else w.show();
//         W.adjustFrameHeight();
//     };
// };
// onclick: createOnClick([0, 1], 'crypto_occupation')

})(node);
