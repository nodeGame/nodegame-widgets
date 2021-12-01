(function(node) {

    node.widgets.register('Dropdown', Dropdown);

    // Meta-data.

    Dropdown.version = '0.3.0';
    Dropdown.description = 'Creates a configurable dropdown menu.';

    Dropdown.texts = {
        // Texts here (more info on this later).
        error: function (w, value) {
            if (value !== null && w.fixedChoice &&
                w.choices.indexOf(value) < 0) {
                return 'No custom values allowed.'
            }
            if (value !== null && w.correctChoice !== null) {
                return 'Not correct, try again.';
            }
            if (value !== null && w.verifyChoice().err) {
                return w.verifyChoice().err;
            }

            return 'Answer required.';
        }
    };

    // Title is displayed in the header.
    Dropdown.title = false;
    // Classname is added to the widgets.
    Dropdown.className = 'dropdown';

    // Constructor taking a configuration parameter.
    // The options object is always existing.
    function Dropdown() {
        var that;
        that = this;

        // You can define widget properties here,
        // but they should get assigned a value in init.

        this.id = null;

        /**
         * ### Dropdown.mainText
         *
         * Main text above the dropdown
         */
        this.mainText = null;

        /**
         * ### Dropdown.labelText
         *
         * A label text for the input
         */
        this.labelText = null;

        /**
         * ### Dropdown.placeholder
         *
         * A placeholder text for the input
         */
        this.placeholder = null;

        /**
         * ### Dropdown.choices
         *
         * The array available choices
         */
        this.choices = null;

        /**
         * ### Dropdown.tag
         *
         * The HTML tag: "datalist" or "select"
         */
        this.tag = null;

        /**
         * ### Dropdown.menu
         *
         * Holder of the selected value (input or select)
         */
        this.menu = null;

        /**
         * ### Dropdown.datalist
         *
         * Holder of the options for the datalist element
         */
        this.datalist = null;

        /**
         * ### Dropdown.listener
         *
         * The main listener
         *
         * @see Dropdown.onchange
         */
        this.listener = function (e) {
            var menu, timeout;

            e = e || window.event;
            menu = e.target || e.srcElement;

            that.currentChoice = menu.value;
            if (that.currentChoice.length === 0) that.currentChoice = null;

            // Relative time.
            if ('string' === typeof that.timeFrom) {
                that.timeCurrentChoice = node.timer.getTimeSince(that.timeFrom);
            }
            // Absolute time.
            else {
                that.timeCurrentChoice = Date.now ?
                    Date.now() : new Date().getTime();
            }

            // One more change.
            that.numberOfChanges++;

            // Remove any warning/errors on change.
            if (that.isHighlighted()) that.unhighlight();

            if (timeout) clearTimeout(timeout);

            timeout = setTimeout(function () {
                that.verifyChoice();
                if (that.verifyChoice().err) {
                    that.setError(that.verifyChoice().err)
                }

            }, that.validationSpeed);

            // Call onchange, if any.
            if (that.onchange) {
                that.onchange(that.currentChoice, that);
            }

        };

        /*
         * ### Dropdown.onchange
         *
         * User defined onchange function
         */
        this.onchange = null;

        /**
         * ### Dropdown.timeCurrentChoice
         *
         * Time when the last choice was made
         */
        this.timeCurrentChoice = null;

        /**
         * ### Dropdown.timeFrom
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
         * ### Dropdown.numberOfChanges
         *
         * Total number of changes between different choices
         */
        this.numberOfChanges = 0;

        /**
         * ### Dropdown.currentChoice
         *
         * Choice associated with currently selected cell/s
         *
         * The field is a  number.
         */
        this.currentChoice = null;

        /**
         * ###  Dropdown.shuffleChoices
         *
         * If TRUE, choices are shuffled.
         */
        this.shuffleChoices = null;

        /**
         * ### Dropdown.order
         *
         * The current order of display of choices
         *
         */
        this.order = null;

        /**
         * ### Dropdown.errorBox
         *
         * An HTML element displayed when a validation error occurs
         */
        this.errorBox = null;

        /**
         * ### Dropdown.correctChoice
         *
         * The correct choice/s
         *
         * The field is an array or number|string.
         *
         */
        this.correctChoice = null;

        /**
         * ### Dropdown.requiredChoice
         *
         * If True, a choice is required.
         */
        this.requiredChoice = null;

        /**
         * ### Dropdown.fixedChoice
         *
         * If True, custom values in menu do not validated.
         */
        this.fixedChoice = null;

        /**
        * ### Dropdown.inputWidth
        *
        * The width of the input form as string (css attribute)
        *
        * Some types preset it automatically
        */
        this.inputWidth = null;

        /**
          * ### CustomInput.userValidation
          *
          * An additional validation executed after the main validation function
          *
          * The function returns an object like:
          *
          * ```javascript
          *  {
          *    value: 'validvalue',
          *    err:   'This error occurred' // If invalid.
          *  }
          * ```
          */
        this.validation = null;

        /**
         * ### Dropdown.validationSpeed
         *
         * How often (in milliseconds) the validation function is called
         *
         * Default: 500
         */
        this.validationSpeed = 500;

    }


    Dropdown.prototype.init = function (options) {
        // Init widget variables, but do not create
        // HTML elements, they should be created in append.

        var tmp;

        if (!this.id) {
            throw new TypeError('Dropdown.init: options.id is missing');
        }

        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('Dropdown.init: options.mainText must ' +
                'be string or undefined. Found: ' +
                options.mainText);
        }

        // Set the labelText, if any.
        if ('string' === typeof options.labelText) {
            this.labelText = options.labelText;
        }
        else if ('undefined' !== typeof options.labelText) {
            throw new TypeError('Dropdown.init: options.labelText must ' +
                'be string or undefined. Found: ' +
                options.labelText);
        }

        // Set the placeholder text, if any.
        if ('string' === typeof options.placeholder) {
            this.placeholder = options.placeholder;
        }
        else if ('undefined' !== typeof options.placeholder) {
            throw new TypeError('Dropdown.init: options.placeholder must ' +
                'be string or undefined. Found: ' +
                options.placeholder);
        }

        // Add the choices.
        if ('undefined' !== typeof options.choices) {
            this.choices = options.choices;
        }

        // Option requiredChoice, if any.
        if ('boolean' === typeof options.requiredChoice) {
            this.requiredChoice = options.requiredChoice;
        }
        else if ('undefined' !== typeof options.requiredChoice) {
            throw new TypeError('Dropdown.init: options.requiredChoice ' +
                'be boolean or undefined. Found: ' +
                options.requiredChoice);
        }

        // Add the correct choices.
        if ('undefined' !== typeof options.correctChoice) {
            if (this.requiredChoice) {
                throw new Error('Dropdown.init: cannot specify both ' +
                    'options requiredChoice and correctChoice');
            }
            if (J.isArray(options.correctChoice) &&
                options.correctChoice.length > options.choices.length) {
                throw new Error('Dropdown.init: options.correctChoice ' +
                    'length cannot exceed options.choices length');
            }
            else {
                this.correctChoice = options.correctChoice;
            }

        }

        // Option fixedChoice, if any.
        if ('boolean' === typeof options.fixedChoice) {
            this.fixedChoice = options.fixedChoice;
        }
        else if ('undefined' !== typeof options.fixedChoice) {
            throw new TypeError('Dropdown.init: options.fixedChoice ' +
                'be boolean or undefined. Found: ' +
                options.fixedChoice);
        }

        if ("undefined" === typeof options.tag) {
            this.tag = "datalist";
        }
        else if ("datalist" === options.tag || "select" === options.tag) {
            this.tag = options.tag;
        }
        else {
            throw new TypeError('Dropdown.init: options.tag must ' +
                'be "datalist", "select" or undefined. Found: ' + options.tag);
        }

        // Set the main onchange listener, if any.
        if ('function' === typeof options.listener) {
            this.listener = function (e) {
                options.listener.call(this, e);
            };
        }
        else if ('undefined' !== typeof options.listener) {
            throw new TypeError('Dropdown.init: opts.listener must ' +
                'be function or undefined. Found: ' +
                options.listener);
        }

        // Set an additional onchange, if any.
        if ('function' === typeof options.onchange) {
            this.onchange = options.onchange;
        }
        else if ('undefined' !== typeof options.onchange) {
            throw new TypeError('Dropdownn.init: opts.onchange must ' +
                'be function or undefined. Found: ' +
                options.onchange);
        }

        // Set an additional validation, if any.
        if ('function' === typeof options.validation) {
            this.validation = options.validation;
        }
        else if ('undefined' !== typeof options.validation) {
            throw new TypeError('Dropdownn.init: opts.validation must ' +
                'be function or undefined. Found: ' +
                options.validation);
        }


        // Option shuffleChoices, default false.
        if ('undefined' === typeof options.shuffleChoices) tmp = false;
        else tmp = !!options.shuffleChoices;
        this.shuffleChoices = tmp;

        if (options.width) {
            if ('string' !== typeof options.width) {
                throw new TypeError('Dropdownn.init:width must be string or ' +
                    'undefined. Found: ' + options.width);
            }
            this.inputWidth = options.width;
        }

        // Validation Speed
        if ('undefined' !== typeof options.validationSpeed) {

            tmp = J.isInt(options.valiadtionSpeed, 0, undefined, true);
            if (tmp === false) {
                throw new TypeError('Dropdownn.init: validationSpeed must ' +
                    ' a non-negative number or undefined. Found: ' +
                    options.validationSpeed);
            }
            this.validationSpeed = tmp;
        }

    }

    // Implements the Widget.append method.
    Dropdown.prototype.append = function () {
        if (W.gid(this.id)) {
            throw new Error('Dropdown.append: id is not unique: ' + this.id);
        }
        var text = this.text;
        var label = this.label;

        text = W.get('p');
        text.innerHTML = this.mainText;
        text.id = 'p';
        this.bodyDiv.appendChild(text);

        label = W.get('label');
        label.innerHTML = this.labelText
        this.bodyDiv.appendChild(label);

        this.setChoices(this.choices, true);

        this.errorBox = W.append('div', this.bodyDiv, {
            className: 'errbox', id: 'errbox'
        });
    };


    Dropdown.prototype.setChoices = function (choices, append) {
        var isDatalist, order;
        var select;
        var i, len, value, name;

        // TODO validate choices.
        this.choices = choices;

        if (!append) return;

        isDatalist = this.tag === 'datalist';

        // Create the structure from scratch or just clear all options.
        if (this.menu) {
            select = isDatalist ? this.datalist : this.menu;
            select.innerHTML = '';
        }
        else {
            if (isDatalist) {

                this.menu = W.add('input', this.bodyDiv, {
                    id: this.id,
                    autocomplete: 'off'
                });

                this.datalist = select = W.add('datalist', this.bodyDiv, {
                    id: this.id + "_datalist"
                });

                this.menu.setAttribute('list', this.datalist.id);
            }
            else {

                select = W.get('select');
                select.id = this.id;

                this.bodyDiv.appendChild(select);
                this.menu = select;
            }
        }

        // Set width.
        if (this.inputWidth) this.menu.style.width = this.inputWidth;

        // Adding placeholder.
        if (this.placeholder) {
            if (isDatalist) {
                this.menu.placeholder = this.placeholder;
            }
            else {

                W.add('option', this.menu, {
                    value: '',
                    innerHTML: this.placeholder,
                    // Makes the placeholder unselectable after first click.
                    disabled: '',
                    selected: '',
                    hidden: ''
                });
            }
        }

        // Adding all options.
        len = choices.length;
        order = J.seq(0, len - 1);
        if (this.shuffleChoices) order = J.shuffle(order);
        for (i = 0; i < len; i++) {

            // Determining value and name of choice.
            value = name = choices[order[i]];
            if ('object' === typeof value) {
                if ('undefined' !== typeof value.value) {
                    name = value.name;
                    value = value.value;
                }
                else if (J.isArray(value)) {
                    name = value[1];
                    value = value[0];
                }
            }

            // select is a datalist element if tag is "datalist".
            W.add('option', select, {
                value: value,
                innerHTML: name
            });
        }

        this.enable();
    };

    /**
     * ### Dropdown.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * Depending on current settings, there are three modes of verifying
     * choices:
     *
     *    - requiredChoice: either true or false.
     *    - correctChoice:  the choices are compared against correct ones.
     *    - fixedChoice: compares the choice with given choices.
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     */
    Dropdown.prototype.verifyChoice = function () {

        var that = this;
        var correct = this.correctChoice;
        var current = this.currentChoice;
        var correctOptions;
        var res = { value: '' };


        if (this.tag === "select" && this.numberOfChanges === 0) {
            current = this.currentChoice = this.menu.value;
        }

        if (this.requiredChoice) {
            res.value = current !== null && current !== this.placeholder;
        }

        // If no correct choice is set return null.
        if ('undefined' === typeof correct) res.value = null;
        if ('string' === typeof correct) {
            res.value = current === correct;
        }
        if ('number' === typeof correct) {
            res.value = current === this.choices[correct];
        }
        if (J.isArray(correct)) {
            correctOptions = correct.map(function (x) {
                return that.choices[x];
            });
            res.value = correctOptions.indexOf(current) >= 0;
        }

        if (this.fixedChoice) {
            if (this.choices.indexOf(current) < 0) res.value = false;
        }

        if (this.validation) this.validation(this.currentChoice, res);

        return res;
    };

    /**
     * ### Dropdown.setError
     *
     * Set the error msg inside the errorBox
     *
     * @param {string} The error msg (can contain HTML)
     *
     * @see Dropdown.errorBox
     */
    Dropdown.prototype.setError = function (err) {
        // TODO: the errorBox is added only if .append() is called.
        // However, DropdownGroup use the table without calling .append().
        if (this.errorBox) this.errorBox.innerHTML = err || '';
        if (err) this.highlight();
        else this.unhighlight();
    };

    /**
     * ### Dropdown.highlight
     *
     * Highlights the input
     *
     * @param {string} The style for the table's border.
     *   Default '3px solid red'
     *
     * @see Dropdown.highlighted
     */
    Dropdown.prototype.highlight = function (border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('Dropdown.highlight: border must be ' +
                'string or undefined. Found: ' + border);
        }
        if (this.highlighted) return;
        this.menu.style.border = border || '3px solid red';
        this.highlighted = true;
        this.emit('highlighted', border);
    };

    /**
     * ### Dropdown.unhighlight
     *
     * Removes highlight
     *
     * @see Dropdown.highlighted
     */
    Dropdown.prototype.unhighlight = function () {
        if (this.highlighted !== true) return;
        this.menu.style.border = '';
        this.highlighted = false;
        this.setError();
        this.emit('unhighlighted');
    };

    /**
     * ### Dropdown.selectChoice
     *
     * Select a given choice in the datalist or select tag.
     *
     * @param {string|number} choice. Its value depends on the tag.
     *
     *   - "datalist": a string, if number it is resolved to the name of
     *     the choice at idx === choice.
     *   - "select": a number, if string it is resolved to the idx of
     *     the choice name === choice. Value -1 will unselect all choices.
     *
     * @return {string|number} idx The resolved name or index
     */
    Dropdown.prototype.selectChoice = function (choice) {
        // idx is a number if tag is select and a string if tag is datalist.
        var idx;

        if (!this.choices || !this.choices.length) return;
        if ('undefined' === typeof choice) return;

        idx = choice;

        if (this.tag === 'select') {
            if ('string' === typeof choice) {
                idx = getIdxOfChoice(this, choice);
                if (idx === -1) {
                    node.warn('Dropdown.selectChoice: choice not found: ' +
                               choice);
                    return;
                }
            }
            else if ('number' !== typeof choice) {
                throw new TypeError('Dropdown.selectChoice: invalid choice: ' +
                                    choice);
            }

            // Set the choice.
            this.menu.selectedIndex = idx;
        }
        else {

            if ('number' === typeof choice) {
                idx = getChoiceOfIdx(this, choice);
                if ('undefined' === typeof idx) {
                    node.warn('Dropdown.selectChoice: choice not found: ' +
                               choice);
                    return;
                }
            }
            else if ('string' !== typeof choice) {
                throw new TypeError('Dropdown.selectChoice: invalid choice: ' +
                                    choice);
            }

            this.menu.value = idx;
        }

        // Simulate event.
        this.listener({ target: this.menu });

        return idx;
    };

    /**
     * ### Dropdown.setValues
     *
     * Set the values on the dropdown menu
     *
     * @param {object} opts Optional. Configuration options.
     *
     * @see Dropdown.verifyChoice
     */
    Dropdown.prototype.setValues = function(opts) {
        var choice, correctChoice;
        var i, len, j, lenJ;

        if (!this.choices || !this.choices.length) {
            throw new Error('Dropdown.setValues: no choices found.');
        }
        opts = opts || {};

        // TODO: this code is duplicated from ChoiceTable.
        if (opts.correct && this.correctChoice !== null) {

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

                this.selectChoice(choice);
            }
            return;
        }

        // Set values, random or pre-set.
        if ('number' === typeof opts || 'string' === typeof opts) {
            opts = { values: opts };
        }
        else if (opts && 'undefined' === typeof opts.values) {
            opts.values = J.randomInt(this.choices.length) -1;
        }

        this.selectChoice(opts.values);

    };

    /**
     * ### Dropdown.getValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see Dropdown.verifyChoice
     */
    Dropdown.prototype.getValues = function (opts) {
        var obj;
        opts = opts || {};
        var verif = this.verifyChoice().value;

        obj = {
            id: this.id,
            choice: this.fixedChoice ?
                this.choices.indexOf(this.currentChoice) : this.currentChoice,
            time: this.timeCurrentChoice,
            nChanges: this.numberOfChanges
        };
        if ('undefined' === typeof opts.highlight) opts.highlight = true;
        if (this.shuffleChoices) obj.order = this.order;

        // Option getValue backward compatible.
        if (opts.addValue !== false && opts.getValue !== false) {
            obj.value = this.currentChoice;
        }

        if (null !== this.correctChoice || null !== this.requiredChoice ||
            null !== this.fixedChoice) {
            obj.isCorrect = verif;
            if (!obj.isCorrect && opts.highlight) this.highlight();
        }
        if (obj.isCorrect === false) {
            this.setError(this.getText('error', obj.value));
        }
        return obj;
    };

    /**
     * ### Dropdown.listeners
     *
     * Implements Widget.listeners
     *
     * Adds two listeners two disable/enable the widget on events:
     * INPUT_DISABLE, INPUT_ENABLE
     *
     * @see Widget.listeners
     */
    Dropdown.prototype.listeners = function () {
        var that = this;
        node.on('INPUT_DISABLE', function () {
            that.disable();
        });
        node.on('INPUT_ENABLE', function () {
            that.enable();
        });
    };

    /**
     * ### Dropdown.disable
     *
     * Enables the dropdown menu
     */
    Dropdown.prototype.disable = function () {
        if (this.disabled === true) return;
        this.disabled = true;
        if (this.menu) this.menu.removeEventListener('change', this.listener);
        this.emit('disabled');
    };

    /**
     * ### Dropdown.enable
     *
     * Enables the dropdown menu
     */
    Dropdown.prototype.enable = function () {
        if (this.disabled === false) return;
        if (!this.menu) {
            throw new Error('Dropdown.enable: dropdown menu not found.');
        }
        this.disabled = false;
        this.menu.addEventListener('change', this.listener);
        this.emit('enabled');
    };

    // ## Helper methods.


    function getChoiceOfIdx(that, idx) {
        return extractChoice(that.choices[idx]);

    }

    function extractChoice(c) {
        if ('object' === typeof c) {
            if ('undefined' !== typeof c.name) c = c.name;
            else c = c[1];
        }
        return c;
    }

    function getIdxOfChoice(that, choice) {
        var i, len, c;
        len = this.choices.length;
        for (i = 0; i < len; i++) {
            c = that.choices[i];
            // c can be string, object, or array.
            if ('object' === typeof c) {
                if ('undefined' !== typeof c.name) c = c.name;
                else c = c[1];
            }
            if (c === choice) return i;
        }
        return -1;
    }


})(node);
