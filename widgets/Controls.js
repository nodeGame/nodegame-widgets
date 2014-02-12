/**
 * # Controls widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manipulates a set of forms.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    // TODO: handle different events, beside onchange

    node.widgets.register('Controls', Controls);

    // ## Defaults

    var defaults = { id: 'controls' };

    Controls.defaults = defaults;

    Controls.Slider = SliderControls;
    Controls.jQuerySlider = jQuerySliderControls;
    Controls.Radio = RadioControls;

    // Meta-data

    Controls.version = '0.3';
    Controls.description = 'Wraps a collection of user-inputs controls.';

    function Controls(options) {
        this.options = options;
        this.id = 'undefined' !== typeof options.id ? options.id : 'controls';
        this.root = null;

        this.listRoot = null;
        this.fieldset = null;
        this.submit = null;

        this.changeEvent = this.id + '_change';

        this.init(options);
    }

    Controls.prototype.add = function(root, id, attributes) {
        // TODO: node.window.addTextInput
        //return node.window.addTextInput(root, id, attributes);
    };

    Controls.prototype.getItem = function(id, attributes) {
        // TODO: node.window.addTextInput
        //return node.window.getTextInput(id, attributes);
    };

    Controls.prototype.init = function(options) {

        this.hasChanged = false; // TODO: should this be inherited?
        if ('undefined' !== typeof options.change) {
            if (!options.change){
                this.changeEvent = false;
            }
            else {
                this.changeEvent = options.change;
            }
        }
        this.list = new node.window.List(options);
        this.listRoot = this.list.getRoot();

        if (!options.features) return;
        if (!this.root) this.root = this.listRoot;
        this.features = options.features;
        this.populate();
    };

    Controls.prototype.append = function(root) {
        this.root = root;
        var toReturn = this.listRoot;
        this.list.parse();
        root.appendChild(this.listRoot);

        if (this.options.submit) {
            var idButton = 'submit_' + this.id;
            if (this.options.submit.id) {
                idButton = this.options.submit.id;
                delete this.options.submit.id;
            }
            this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);

            var that = this;
            this.submit.onclick = function() {
                if (that.options.change) {
                    node.emit(that.options.change);
                }
            };
        }

        return toReturn;
    };

    Controls.prototype.parse = function() {
        return this.list.parse();
    };

    Controls.prototype.populate = function() {
        var key, id, attributes, container, elem, that;
        that = this;

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
                    W.addLabel(container, elem, null, attributes.label);
                }

                // Element added to the list.
                this.list.addDT(container);
            }
        }
    };

    Controls.prototype.listeners = function() {
        var that = this;
        // TODO: should this be inherited?
        node.on(this.changeEvent, function(){
            that.hasChanged = true;
        });

    };

    Controls.prototype.refresh = function() {
        var key, el;
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = node.window.getElementById(key);
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

    Controls.prototype.getAllValues = function() {
        var out, el, key;
        out = {};
        for (key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                el = node.window.getElementById(key);
                if (el) out[key] = Number(el.value);
            }
        }
        return out;
    };

    Controls.prototype.highlight = function(code) {
        return node.window.highlight(this.listRoot, code);
    };

    // Sub-classes

    // Slider

    SliderControls.prototype.__proto__ = Controls.prototype;
    SliderControls.prototype.constructor = SliderControls;

    SliderControls.id = 'slidercontrols';
    SliderControls.version = '0.2';

    SliderControls.dependencies = {
        Controls: {}
    };


    function SliderControls (options) {
        Controls.call(this, options);
    }

    SliderControls.prototype.add = function(root, id, attributes) {
        return node.window.addSlider(root, id, attributes);
    };

    SliderControls.prototype.getItem = function(id, attributes) {
        return node.window.getSlider(id, attributes);
    };

    // jQuerySlider

    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
    jQuerySliderControls.prototype.constructor = jQuerySliderControls;

    jQuerySliderControls.id = 'jqueryslidercontrols';
    jQuerySliderControls.version = '0.13';

    jQuerySliderControls.dependencies = {
        jQuery: {},
        Controls: {}
    };


    function jQuerySliderControls (options) {
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


    ///////////////////////////


    // Radio

    RadioControls.prototype.__proto__ = Controls.prototype;
    RadioControls.prototype.constructor = RadioControls;

    RadioControls.id = 'radiocontrols';
    RadioControls.version = '0.1.1';

    RadioControls.dependencies = {
        Controls: {}
    };

    function RadioControls (options) {
        Controls.call(this,options);
        this.groupName = ('undefined' !== typeof options.name) ? options.name :
            node.window.generateUniqueId();
        this.radioElem = null;
    }

    // overriding populare also. There is an error with the Label
    RadioControls.prototype.populate = function() {
        var key, id, attributes, container, elem, that;
        that = this;

        if (!this.radioElem) {
            this.radioElem = document.createElement('radio');
            this.radioElem.group = this.name || "radioGroup";
            this.radioElem.group = this.id || "radioGroup";
            root.appendChild(this.radioElem);
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

        elem = node.window.addRadioButton(root, id, attributes);
        // Adding the text for the radio button
        elem.appendChild(document.createTextNode(attributes.label));
        return elem;
    };

    RadioControls.prototype.getItem = function(id, attributes) {
        //console.log('ADDDING radio');
        //console.log(attributes);
        // add the group name if not specified
        // TODO: is this a javascript bug?
        if ('undefined' === typeof attributes.name) {
            //                  console.log(this);
            //                  console.log(this.name);
            //                  console.log('MODMOD ' + this.name);
            attributes.name = this.groupName;
        }
        //console.log(attributes);
        return node.window.getRadioButton(id, attributes);
    };

    // Override getAllValues for Radio Controls
    RadioControls.prototype.getAllValues = function() {

        for (var key in this.features) {
            if (this.features.hasOwnProperty(key)) {
                var el = node.window.getElementById(key);
                if (el.checked) {
                    return el.value;
                }
            }
        }
        return false;
    };

})(node);