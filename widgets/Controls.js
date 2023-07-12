/**
 * # Controls
 * Copyright(c) 2023 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates and manipulates a set of forms
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    // TODO: handle different events, beside onchange

    node.widgets.register('Controls', Controls);

    // ## Meta-data

    Controls.version = '0.5.1';
    Controls.description = 'Wraps a collection of user-inputs controls.';

    Controls.className = 'controls';

    /**
     * ## Controls constructor
     *
     * `Control` wraps a collection of user-input controls
     *
     * @param {object} options Optional. Configuration options
     * which is stored and forwarded to Controls.init.
     *
     *  The  options object can have the following attributes:
     *   - Any option that can be passed to `W.List` constructor.
     *   - `change`: Event to fire when contents change.
     *   - `features`: Collection of collection attributes for individual
     *                 controls.
     *   - `submit`: Description of the submit button.
     *               If submit.id is defined, the button will get that id and
     *               the text on the button will be the text in submit.name.
     *               If submit is a string, it will be the text on the button.
     *   - `attributes`: Attributes of the submit button.
     *
     * @see Controls.init
     */
    function Controls(options) {
        this.options = options;

        /**
         * ### Controls.listRoot
         *
         * The list which holds the controls
         */
        this.listRoot = null;

        /**
         * ### Controls.submit
         *
         * The submit button
         */
        this.submit = null;

        /**
         * ### Controls.changeEvent
         *
         * The event to be fired when the list changes
         */
        this.changeEvent = 'Controls_change';

        /**
         * ### Controls.hasChanged
         *
         * Flag to indicate whether the list has changed
         */
        this.hasChanged = false;
    }

    Controls.prototype.add = function(root, id, attributes) {
        // TODO: replace W.addTextInput
        //return W.addTextInput(root, id, attributes);
    };

    Controls.prototype.getItem = function(id, attributes) {
        // TODO: replace W.addTextInput
        //return W.getTextInput(id, attributes);
    };

    // ## Controls methods

    /**
     * ### Controls.init
     *
     * Initializes the widget
     *
     * @param {object} options Optional. Configuration options.
     *
     * The  options object can have the following attributes:
     *   - Any option that can be passed to `W.List` constructor.
     *   - `change`: Event to fire when contents change.
     *   - `features`: Collection of collection attributes for individual
     *                 controls.
     *
     * @see nodegame-window/List
     */
    Controls.prototype.init = function(options) {
        this.hasChanged = false; // TODO: should this be inherited?
        if ('undefined' !== typeof options.change) {
            if (!options.change) {
                this.changeEvent = false;
            }
            else {
                this.changeEvent = options.change;
            }
        }
        this.list = new W.List(options);
        this.listRoot = this.list.getRoot();

        if (options.features) {
            this.features = options.features;
            this.populate();
        }
    };

    /**
     * ### Controls.append
     *
     * Appends the widget to `this.bodyDiv`
     *
     * @see Controls.init
     */
    Controls.prototype.append = function() {
        var that = this;
        var idButton = 'submit_Controls';


        this.list.parse();
        this.bodyDiv.appendChild(this.listRoot);

        if (this.options.submit) {
            if (this.options.submit.id) {
                idButton = this.options.submit.id;
                this.option.submit = this.option.submit.name;
            }
            this.submit = W.add('button', this.bodyDiv,
                                J.merge(this.options.attributes, {
                                    id: idButton,
                                    innerHTML: this.options.submit
                                }));

            this.submit.onclick = function() {
                if (that.options.change) {
                    node.emit(that.options.change);
                }
            };
        }
    };

    Controls.prototype.parse = function() {
        return this.list.parse();
    };

    /**
     * ### Controls.populate
     *
     * Adds features to the list.
     *
     * @see Controls.init
     */
    Controls.prototype.populate = function() {
        var key, id, attributes, container, elem;
        var that = this;

        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                // Prepare the attributes vector.
                attributes = this.features[key];
                id = key;
                if (attributes.id) {
                    id = attributes.id;
                    delete attributes.id;
                }

                container = document.createElement('div');
                // Add a different element according
                // to the subclass instantiated.
                elem = this.add(container, id, attributes);

                // Fire the onChange event, if one defined
                if (this.changeEvent) {
                    elem.onchange = function() {
                        node.emit(that.changeEvent);
                    };
                }

                if (attributes.label) {
                    W.add('label', container, {
                        'for': elem.id,
                        innerHTML: attributes.label
                    });
                }

                // Element added to the list.
                this.list.addDT(container);
            }
        }
    };

    Controls.prototype.listeners = function() {
        var that = this;
        // TODO: should this be inherited?
        node.on(this.changeEvent, function() {
            that.hasChanged = true;
        });

    };

    Controls.prototype.refresh = function() {
        var key, el;
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = W.getElementById(key);
                if (el) {
                    // node.log('KEY: ' + key, 'DEBUG');
                    // node.log('VALUE: ' + el.value, 'DEBUG');
                    el.value = this.features[key].value;
                    // TODO: set all the other attributes
                    // TODO: remove/add elements
                }

            }
        }

        return true;
    };

    Controls.prototype.getValues = function() {
        var out, el, key;
        out = {};
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = W.getElementById(key);
                if (el) out[key] = Number(el.value);
            }
        }
        return out;
    };

    Controls.prototype.highlight = function(code) {
        return W.highlight(this.listRoot, code);
    };

    // ## Sub-classes

    /**
     * ### Slider
     */


    SliderControls.prototype.__proto__ = Controls.prototype;
    SliderControls.prototype.constructor = SliderControls;

    SliderControls.version = '0.2.2';
    SliderControls.description = 'Collection of Sliders.';

    SliderControls.title = 'Slider Controls';
    SliderControls.className = 'slidercontrols';

    SliderControls.dependencies = {
        Controls: {}
    };

    // Need to be after the prototype is inherited.
    node.widgets.register('SliderControls', SliderControls);

    function SliderControls(options) {
        Controls.call(this, options);
    }

    SliderControls.prototype.add = function(root, id, attributes) {
        attributes = attributes || {};
        attributes.id = id;
        attributes.type = 'range';
        return W.add('input', root, attributes);
    };

    SliderControls.prototype.getItem = function(id, attributes) {
        attributes = attributes || {};
        attributes.id = id;
        return W.get('input', attributes);
    };

    /**
     * ### jQuerySlider
     */


    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
    jQuerySliderControls.prototype.constructor = jQuerySliderControls;

    jQuerySliderControls.version = '0.14';
    jQuerySliderControls.description = 'Collection of jQuery Sliders.';

    jQuerySliderControls.title = 'jQuery Slider Controls';
    jQuerySliderControls.className = 'jqueryslidercontrols';

    jQuerySliderControls.dependencies = {
        jQuery: {},
        Controls: {}
    };

    node.widgets.register('jQuerySliderControls', jQuerySliderControls);

    function jQuerySliderControls(options) {
        Controls.call(this, options);
    }

    jQuerySliderControls.prototype.add = function(root, id, attributes) {
        var slider = jQuery('<div/>', {
            id: id
        }).slider();

        var s = slider.appendTo(root);
        return s[0];
    };

    jQuerySliderControls.prototype.getItem = function(id, attributes) {
        var slider = jQuery('<div/>', {
            id: id
        }).slider();

        return slider;
    };

    /**
     * ### RadioControls
     */

    RadioControls.prototype.__proto__ = Controls.prototype;
    RadioControls.prototype.constructor = RadioControls;

    RadioControls.version = '0.1.2';
    RadioControls.description = 'Collection of Radio Controls.';

    RadioControls.title = 'Radio Controls';
    RadioControls.className = 'radiocontrols';

    RadioControls.dependencies = {
        Controls: {}
    };

    node.widgets.register('RadioControls', RadioControls);

    function RadioControls(options) {
        Controls.call(this,options);
        this.groupName = ('undefined' !== typeof options.name) ? options.name :
            W.generateUniqueId();
        this.radioElem = null;
    }

    // overriding populate also. There is an error with the Label
    RadioControls.prototype.populate = function() {
        var key, id, attributes, elem, that;
        that = this;

        if (!this.radioElem) {
            this.radioElem = document.createElement('radio');
            this.radioElem.group = this.name || "radioGroup";
            this.radioElem.group = this.className || "radioGroup";
            this.bodyDiv.appendChild(this.radioElem);
        }

        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                // Prepare the attributes vector.
                attributes = this.features[key];
                id = key;
                if (attributes.id) {
                    id = attributes.id;
                    delete attributes.id;
                }

                // Add a different element according
                // to the subclass instantiated.
                elem = this.add(this.radioElem, id, attributes);

                // Fire the onChange event, if one defined
                if (this.changeEvent) {
                    elem.onchange = function() {
                        node.emit(that.changeEvent);
                    };
                }

                // Element added to the list.
                this.list.addDT(elem);
            }
        }
    };

    RadioControls.prototype.add = function(root, id, attributes) {
        var elem;
        if ('undefined' === typeof attributes.name) {
            attributes.name = this.groupName;
        }
        attributes.id = id;
        attributes.type = 'radio';
        elem = W.add('input', root, attributes);
        // Adding the text for the radio button
        elem.appendChild(document.createTextNode(attributes.label));
        return elem;
    };

    RadioControls.prototype.getItem = function(id, attributes) {
        attributes = attributes || {};
        // add the group name if not specified
        // TODO: is this a javascript bug?
        if ('undefined' === typeof attributes.name) {
            attributes.name = this.groupName;
        }
        attributes.id = id;
        attributes.type = 'radio';
        return W.get('input', attributes);
    };

    // Override getAllValues for Radio Controls
    RadioControls.prototype.getValues = function() {
        var key, el;
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = W.getElementById(key);
                if (el.checked) return el.value;
            }
        }
        return false;
    };

})(node);
