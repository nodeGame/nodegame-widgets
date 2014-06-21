/**
 * # Widget
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Prototype of a widget class.
 *
 * The methods of the prototype will be injected in every new widget, if missing.
 * Properties: _headingDiv_, _bodyDiv_, and _footer_ might be automatically
 * added as well, depending on widget configuration.
 *
 * ---
 */
(function(node) {

    "use strict";

    node.Widget = Widget;

    function Widget() {}

    Widget.prototype.dependencies = {};

    Widget.prototype.listeners = function() {};

    Widget.prototype.getValues = function() {};

    Widget.prototype.append = function() {};

    Widget.prototype.init = function() {};

    Widget.prototype.getAllValues = function() {};

    Widget.prototype.highlight = function() {};

    Widget.prototype.destroy = function() {};

    Widget.prototype.setTitle = function(title) {
        if (!this.panelDiv) {
            throw new Error('Widget.setTitle: panelDiv is missing.');
        }

        // Remove heading with false-ish argument.
        if (!title) {
            if (this.headingDiv) {
                this.panelDiv.removeChild(this.headingDiv);
                delete this.headingDiv;
            }
        }
        else {
            if (!this.headingDiv) {
                // Add heading.
                this.headingDiv = W.addDiv(this.panelDiv, undefined,
                        {className: 'panel-heading'});
                // Move it to before the body.
                this.panelDiv.insertBefore(this.headingDiv, this.bodyDiv);
            }

            // Set title.
            if (W.isElement(title)) {
                // The given title is an HTML element.
                this.headingDiv.innerHTML = '';
                this.headingDiv.appendChild(title);
            }
            else {
                this.headingDiv.innerHTML = title;
            }
        }
    };

    Widget.prototype.setFooter = function(footer) {
        if (!this.panelDiv) {
            throw new Error('Widget.setFooter: panelDiv is missing.');
        }

        // Remove footer with false-ish argument.
        if (!footer) {
            if (this.footerDiv) {
                this.panelDiv.removeChild(this.footerDiv);
                delete this.footerDiv;
            }
        }
        else {
            if (!this.footerDiv) {
                // Add footer.
                this.footerDiv = W.addDiv(this.panelDiv, undefined,
                        {className: 'panel-footer'});
            }

            // Set footer contents.
            if (W.isElement(footer)) {
                // The given footer is an HTML element.
                this.footerDiv.innerHTML = '';
                this.footerDiv.appendChild(footer);
            }
            else {
                this.footerDiv.innerHTML = footer;
            }
        }
    };

    Widget.prototype.setContext = function(context) {
        // TODO: Check parameter
        W.removeClass(this.panelDiv, 'panel-[a-z]*');
        W.addClass(this.panelDiv, 'panel-' + context);
    };

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof node) ? node : module.parent.exports.node
);

/**
 * # Widgetss
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Helper class to interact with nodeGame widgets.
 * ---
 */
(function(window, node) {

    "use strict";

    var J = node.JSUS;

    function Widgets() {

        /**
         * ## Widgets.widgets
         *
         * Container of currently registered widgets
         *
         * @see Widgets.register
         */
        this.widgets = {};

        /**
         * ## Widgets.widgets
         *
         * Container of appended widget instances
         *
         * @see Widgets.append
         */
        this.instances = [];
    }

    /**
     * ### Widgets.register
     *
     * Registers a new widget in the collection
     *
     * A name and a prototype class must be provided. All properties
     * that are present in `node.Widget`, but missing in the prototype
     * are added.
     *
     * Registered widgets can be loaded with Widgets.get or Widgets.append.
     *
     * @param {string} name The id under which to register the widget
     * @param {function} w The widget to add
     * @return {object|boolean} The registered widget,
     *   or FALSE if an error occurs
     */
    Widgets.prototype.register = function(name, w) {
        var i;
        if ('string' !== typeof name) {
            throw new TypeError('Widgets.register: name must be string.');
        }
        if ('function' !== typeof w) {
            throw new TypeError('Widgets.register: w must be function.');
        }
        // Add default properties to widget prototype
        J.mixout(w.prototype, new node.Widget());
        this.widgets[name] = w;
        return this.widgets[name];
    };

    /**
     * ### Widgets.get
     *
     * Retrieves, instantiates and returns the specified widget
     *
     * It can attach standard javascript listeners to the root element of
     * the widget if specified in the options.
     *
     * The dependencies are checked, and if the conditions are not met,
     * returns FALSE.
     *
     * @param {string} w_str The name of the widget to load
     * @param {options} options Optional. Configuration options
     *   to be passed to the widgets
     * @return {object} widget The requested widget
     *
     * @see Widgets.add
     *
     * @TODO: add supports for any listener. Maybe requires some refactoring.
     * @TODO: add example.
     */
    Widgets.prototype.get = function(w_str, options) {
        var wProto, widget;
        var that;
        if ('string' !== typeof w_str) {
            throw new TypeError('Widgets.get: w_str must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.get: options must be object or ' +
                                'undefined.');
        }

        that = this;
        options = options || {};

        wProto = J.getNestedValue(w_str, this.widgets);

        if (!wProto) {
            throw new Error('Widgets.get: ' + w_str + ' not found.');
        }

        node.info('registering ' + wProto.name + ' v.' +  wProto.version);

        if (!this.checkDependencies(wProto)) {
            throw new Error('Widgets.get: ' + w_str + ' has unmet dependecies.');
        }

        // Add missing properties to the user options
        J.mixout(options, J.clone(wProto.defaults));

        widget = new wProto(options);
        // Re-inject defaults
        widget.defaults = options;

        widget.title = wProto.title;
        widget.footer = wProto.footer;
        widget.className = wProto.className;
        widget.context = wProto.context;

        // Call listeners
        widget.listeners.call(widget);

        // user listeners
        attachListeners(options, widget);

        return widget;
    };

    /**
     * ### Widgets.append
     *
     * Appends a widget to the specified root element. If no root element
     * is specified the widget is append to the global root.
     *
     * The first parameter can be string representing the name of the widget or
     * a valid widget already loaded, for example through Widgets.get.
     * In the latter case, dependencies are checked, and it returns FALSE if
     * conditions are not met.
     *
     * It automatically creates a fieldset element around the widget if
     * requested by the internal widget configuration, or if specified in the
     * options parameter.
     *
     * @param {string} w_str The name of the widget to load
     * @param {object} root. Optional. The HTML element under which the widget
     *   will be appended. Defaults, `GameWindow.getFrameRoot()` or document.body
     * @param {options} options Optional. Configuration options to be passed
     *   to the widgets
     * @return {object|boolean} The requested widget, or FALSE is an error occurs
     *
     * @see Widgets.get
     */
    Widgets.prototype.append = Widgets.prototype.add = function(w, root,
                                                                options) {
        if ('string' !== typeof w && 'object' !== typeof w) {
            throw new TypeError('Widgets.append: w must be string or object.');
        }
        if (root && !J.isElement(root)) {
            throw new TypeError('Widgets.append: root must be HTMLElement ' +
                                'or undefined.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Widgets.append: options must be object or ' +
                                'undefined.');
        }

        // Init default values.
        root = root || W.getFrameRoot() || document.body;
        options = options || {};

        // Check if it is a object (new widget)
        // If it is a string is the name of an existing widget
        // In this case a dependencies check is done
        if ('string' === typeof w) {
            w = this.get(w, options);
        }

        // If fieldset option is null, a div is added instead.
        // If fieldset option is undefined, default options are used.
        //if (options.fieldset !== null) {
        //    root = appendFieldset(root, options.fieldset ||
        //                          w.defaults.fieldset, w);
        //}
        w.panelDiv = appendDiv(root, {
            attributes: {
                className: ['ng_widget', 'panel', 'panel-default', w.className]
            }
        });

        // Optionally add title.
        if (w.title) {
            w.setTitle(w.title);
        }

        // Add body.
        w.bodyDiv = appendDiv(w.panelDiv, {
            attributes: {className: 'panel-body'}
        });

        // Optionally add footer.
        if (w.footer) {
            w.setFooter(w.footer);
        }

        // Optionally set context.
        if (w.context) {
            w.setContext(w.context);
        }

        w.append();

        // Store widget instance for destruction.
        this.instances.push(w);

        return w;
    };

    /**
     * ### Widgets.destroyAll
     *
     * Removes all widgets that have been appended with Widgets.append
     *
     * Exceptions thrown in the widgets' destroy methods are caught.
     *
     * @see Widgets.append
     */
    Widgets.prototype.destroyAll = function() {
        var i, widget;

        for (i in this.instances) {
            if (this.instances.hasOwnProperty(i)) {
                widget = this.instances[i];

                try {
                    widget.destroy();

                    // Remove the widget's div from its parent:
                    widget.panelDiv.parentNode.removeChild(widget.panelDiv);
                }
                catch (e) {
                    node.warn('Widgets.destroyAll: Error caught. ' + e + '.');
                }
            }
        }

        this.instances = [];
    };

    /**
     * ### Widgets.checkDependencies
     *
     * Checks if all the dependencies are already loaded
     *
     * Dependencies are searched for in the following objects:
     *
     * - window
     * - node
     * - this.widgets
     * - node.window
     *
     * TODO: Check for version and other constraints.
     *
     * @param {object} The widget to check
     * @param {boolean} quiet Optional. If TRUE, no warning will be raised.
     *   Defaults FALSE
     * @return {boolean} TRUE, if all dependencies are met
     */
    Widgets.prototype.checkDependencies = function(w, quiet) {
        var parents, d, lib, found, i;
        if (!w.dependencies) return true;

        parents = [window, node, this.widgets, node.window];

        d = w.dependencies;
        for (lib in d) {
            if (d.hasOwnProperty(lib)) {
                found = false;
                for (i = 0; i < parents.length; i++) {
                    if (J.getNestedValue(lib, parents[i])) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (!quiet) checkDepErrMsg(w, lib);
                    return false;
                }
            }
        }
        return true;
    };


    // #### Helper functions.

    //function appendFieldset(root, options, w) {
    //    var idFieldset, legend;
    //    if (!options) return root;
    //    idFieldset = options.id || w.id + '_fieldset';
    //    legend = options.legend || w.legend;
    //    return W.addFieldset(root, idFieldset, legend, options.attributes);
    //}

    function appendDiv(root, options) {
        // TODO: Check every parameter
        return W.addDiv(root, undefined, options.attributes);
    }

    function createListenerFunction(w, e, l) {
        if (!w || !e || !l) return;
        w.panelDiv[e] = function() {
            l.call(w);
        };
    }

    function attachListeners(options, w) {
        var events, isEvent, i;
        if (!options || !w) return;
        isEvent = false;
        events = ['onclick', 'onfocus', 'onblur', 'onchange',
                  'onsubmit', 'onload', 'onunload', 'onmouseover'];
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                isEvent = J.in_array(i, events);
                if (isEvent && 'function' === typeof options[i]) {
                    createListenerFunction(w, i, options[i]);
                }
            }
        }
    }

    function checkDepErrMsg(w, d) {
        var name = w.name || w.id;// || w.toString();
        node.err(d + ' not found. ' + name + ' cannot be loaded.');
    }

    //Expose Widgets to the global object
    node.widgets = new Widgets();

})(
    // Widgets works only in the browser environment.
    ('undefined' !== typeof window) ? window : module.parent.exports.window,
    ('undefined' !== typeof window) ? window.node : module.parent.exports.node
);

/**
 * # Chat widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a simple configurable chat.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    // ## Defaults

    Chat.defaults = {};
    Chat.defaults.id = 'chat';
    Chat.defaults.fieldset = { legend: 'Chat' };
    Chat.defaults.mode = 'MANY_TO_MANY';
    Chat.defaults.textarea_id = 'chat_textarea';
    Chat.defaults.chat_id = 'chat_chat';
    Chat.defaults.chat_event = 'CHAT';
    Chat.defaults.submit_id = 'chat_submit';
    Chat.defaults.submit_text = 'chat';


    // ## Meta-data

    // ### Chat.modes
    //
    // - MANY_TO_MANY: everybody can see all the messages, and it possible
    //   to send private messages.
    //
    // - MANY_TO_ONE: everybody can see all the messages, private messages can
    //   be received, but not sent.
    //
    // ONE_TO_ONE: everybody sees only personal messages, private messages can
    //   be received, but not sent. All messages are sent to the SERVER.
    //
    // RECEIVER_ONLY: messages can only be received, but not sent.
    //
    Chat.modes = {
        MANY_TO_MANY: 'MANY_TO_MANY',
        MANY_TO_ONE: 'MANY_TO_ONE',
        ONE_TO_ONE: 'ONE_TO_ONE',
        RECEIVER_ONLY: 'RECEIVER_ONLY'
    };

    Chat.version = '0.4';
    Chat.description = 'Offers a uni / bi-directional communication interface ' +
        'between players, or between players and the experimenter.';

    // ## Dependencies

    Chat.dependencies = {
        JSUS: {}
    };

    function Chat (options) {
        this.id = options.id || Chat.id;
        this.mode = options.mode || Chat.defaults.mode;

        this.root = null;

        this.textarea_id = options.textarea_id || Chat.defaults.textarea_id;
        this.chat_id = options.chat_id || Chat.defaults.chat_id;
        this.submit_id = options.submit_id || Chat.defaults.submit_id;

        this.chat_event = options.chat_event || Chat.defaults.chat_event;
        this.submit_text = options.submit_text || Chat.defaults.submit_text;

        this.submit = W.getEventButton(this.chat_event, this.submit_text, this.submit_id);
        this.textarea = W.getElement('textarea', this.textarea_id);
        this.chat = W.getElement('div', this.chat_id);

        if ('undefined' !== typeof options.displayName) {
            this.displayName = options.displayName;
        }

        switch(this.mode) {

        case Chat.modes.RECEIVER_ONLY:
            this.recipient = {value: 'SERVER'};
            break;
        case Chat.modes.MANY_TO_ONE:
            this.recipient = {value: 'ROOM'};
            break;
        case Chat.modes.ONE_TO_ONE:
            this.recipient = {value: 'SERVER'};
            break;
        default:
            this.recipient = W.getRecipientSelector();
        }
    }


    Chat.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.chat);

        if (this.mode !== Chat.modes.RECEIVER_ONLY) {
            W.writeln('', root);
            root.appendChild(this.textarea);
            W.writeln('', root);
            root.appendChild(this.submit);
            if (this.mode === Chat.modes.MANY_TO_MANY) {
                root.appendChild(this.recipient);
            }
        }
        return root;
    };

    Chat.prototype.getRoot = function() {
        return this.root;
    };

    Chat.prototype.displayName = function(from) {
        return from;
    };

    Chat.prototype.readTA = function() {
        var txt = this.textarea.value;
        this.textarea.value = '';
        return txt;
    };

    Chat.prototype.writeTA = function(string, args) {
        J.sprintf(string, args, this.chat);
        W.writeln('', this.chat);
        this.chat.scrollTop = this.chat.scrollHeight;
    };

    Chat.prototype.listeners = function() {
        var that = this;

        node.on(this.chat_event, function() {
            var msg, to, args;
            msg = that.readTA();
            if (!msg) return;

            to = that.recipient.value;
            args = {
                '%s': {
                    'class': 'chat_me'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg
            };
            that.writeTA('%sMe%s: %msg!txt%msg', args);
            node.say(that.chat_event, to, msg.trim());
        });

        if (this.mode === Chat.modes.MANY_TO_MANY) {
            node.on('UPDATED_PLIST', function() {
                W.populateRecipientSelector(that.recipient, node.game.pl.fetch());
            });
        }

        node.on.data(this.chat_event, function(msg) {
            var from, args;
            if (msg.from === node.player.id || msg.from === node.player.sid) {
                return;
            }

            if (this.mode === Chat.modes.ONE_TO_ONE) {
                if (msg.from === this.recipient.value) {
                    return;
                }
            }

            from = that.displayName(msg.from);
            args = {
                '%s': {
                    'class': 'chat_others'
                },
                '%msg': {
                    'class': 'chat_msg'
                },
                '!txt': msg.data,
                '!from': from
            };

            that.writeTA('%s!from%s: %msg!txt%msg', args);
        });
    };

    node.widgets.register('Chat', Chat);

})(node);

/**
 * # ChernoffFaces widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS,
    Table = node.window.Table;

    node.widgets.register('ChernoffFaces', ChernoffFaces);

    // ## Defaults

    ChernoffFaces.defaults = {};
    ChernoffFaces.defaults.id = 'ChernoffFaces';
    ChernoffFaces.defaults.canvas = {};
    ChernoffFaces.defaults.canvas.width = 100;
    ChernoffFaces.defaults.canvas.heigth = 100;

    // ## Meta-data

    ChernoffFaces.version = '0.3';
    ChernoffFaces.description = 'Display parametric data in the form of a Chernoff Face.';

    // ## Dependencies
    ChernoffFaces.dependencies = {
        JSUS: {},
        Table: {},
        Canvas: {},
        'Controls.Slider': {}
    };

    ChernoffFaces.FaceVector = FaceVector;
    ChernoffFaces.FacePainter = FacePainter;

    function ChernoffFaces (options) {
        this.options = options;
        this.id = options.id;
        this.table = new Table({id: 'cf_table'});
        this.root = options.root || document.createElement('div');
        this.root.id = this.id;

        this.sc = node.widgets.get('Controls.Slider');  // Slider Controls
        this.fp = null; // Face Painter
        this.canvas = null;

        this.change = 'CF_CHANGE';
        var that = this;
        this.changeFunc = function() {
            that.draw(that.sc.getAllValues());
        };

        this.features = null;
        this.controls = null;

        this.init(this.options);
    }

    ChernoffFaces.prototype.init = function(options) {
        var that = this;
        this.id = options.id || this.id;
        var PREF = this.id + '_';

        this.features = options.features || this.features || FaceVector.random();

        this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;

        var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';
        var idButton = (options.idButton) ? options.idButton : PREF + 'button';

        this.canvas = node.window.getCanvas(idCanvas, options.canvas);
        this.fp = new FacePainter(this.canvas);
        this.fp.draw(new FaceVector(this.features));

        var sc_options = {
            id: 'cf_controls',
            features: JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
            change: this.change,
            fieldset: {id: this.id + '_controls_fieldest',
                       legend: this.controls.legend || 'Controls'
                      },
            submit: 'Send'
        };

        this.sc = node.widgets.get('Controls.Slider', sc_options);

        // Controls are always there, but may not be visible
        if (this.controls) {
            this.table.add(this.sc);
        }

        // Dealing with the onchange event
        if ('undefined' === typeof options.change) {
            node.on(this.change, this.changeFunc);
        } else {
            if (options.change) {
                node.on(options.change, this.changeFunc);
            }
            else {
                node.removeListener(this.change, this.changeFunc);
            }
            this.change = options.change;
        }


        this.table.add(this.canvas);
        this.table.parse();
        this.root.appendChild(this.table.table);
    };

    ChernoffFaces.prototype.getCanvas = function() {
        return this.canvas;
    };

    ChernoffFaces.prototype.append = function(root) {
        root.appendChild(this.root);
        this.table.parse();
        return this.root;
    };

    ChernoffFaces.prototype.draw = function(features) {
        if (!features) return;
        var fv = new FaceVector(features);
        this.fp.redraw(fv);
        // Without merging wrong values are passed as attributes
        this.sc.init({features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')});
        this.sc.refresh();
    };

    ChernoffFaces.prototype.getAllValues = function() {
        //if (this.sc) return this.sc.getAllValues();
        return this.fp.face;
    };

    ChernoffFaces.prototype.randomize = function() {
        var fv = FaceVector.random();
        this.fp.redraw(fv);

        var sc_options = {
            features: JSUS.mergeOnValue(FaceVector.defaults, fv),
            change: this.change
        };
        this.sc.init(sc_options);
        this.sc.refresh();

        return true;
    };


    // FacePainter
    // The class that actually draws the faces on the Canvas
    function FacePainter (canvas, settings) {

        this.canvas = new node.window.Canvas(canvas);

        this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
        this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
    }

    //Draws a Chernoff face.
    FacePainter.prototype.draw = function(face, x, y) {
        if (!face) return;
        this.face = face;
        this.fit2Canvas(face);
        this.canvas.scale(face.scaleX, face.scaleY);

        //console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );

        x = x || this.canvas.centerX;
        y = y || this.canvas.centerY;

        this.drawHead(face, x, y);

        this.drawEyes(face, x, y);

        this.drawPupils(face, x, y);

        this.drawEyebrow(face, x, y);

        this.drawNose(face, x, y);

        this.drawMouth(face, x, y);

    };

    FacePainter.prototype.redraw = function(face, x, y) {
        this.canvas.clear();
        this.draw(face,x,y);
    };

    FacePainter.prototype.scale = function(x, y) {
        this.canvas.scale(this.scaleX, this.scaleY);
    };

    // TODO: Improve. It eats a bit of the margins
    FacePainter.prototype.fit2Canvas = function(face) {
        if (!this.canvas) {
            console.log('No canvas found');
            return;
        }

        var ration;
        if (this.canvas.width > this.canvas.height) {
            ratio = this.canvas.width / face.head_radius * face.head_scale_x;
        }
        else {
            ratio = this.canvas.height / face.head_radius * face.head_scale_y;
        }

        face.scaleX = ratio / 2;
        face.scaleY = ratio / 2;
    };

    FacePainter.prototype.drawHead = function(face, x, y) {

        var radius = face.head_radius;

        this.canvas.drawOval({
            x: x,
            y: y,
            radius: radius,
            scale_x: face.head_scale_x,
            scale_y: face.head_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawEyes = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
        var spacing = face.eye_spacing;

        var radius = face.eye_radius;
        //console.log(face);
        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth

        });
        //console.log(face);
        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawPupils = function(face, x, y) {

        var radius = face.pupil_radius;
        var spacing = face.eye_spacing;
        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);

        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawEyebrow = function(face, x, y) {

        var height = FacePainter.computeEyebrowOffset(face,y);
        var spacing = face.eyebrow_spacing;
        var length = face.eyebrow_length;
        var angle = face.eyebrow_angle;

        this.canvas.drawLine({
            x: x - spacing,
            y: height,
            length: length,
            angle: angle,
            color: face.color,
            lineWidth: face.lineWidth


        });

        this.canvas.drawLine({
            x: x + spacing,
            y: height,
            length: 0-length,
            angle: -angle,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawNose = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
        var nastril_r_x = x + face.nose_width / 2;
        var nastril_r_y = height + face.nose_length;
        var nastril_l_x = nastril_r_x - face.nose_width;
        var nastril_l_y = nastril_r_y;

        this.canvas.ctx.lineWidth = face.lineWidth;
        this.canvas.ctx.strokeStyle = face.color;

        this.canvas.ctx.save();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x,height);
        this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
        this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
        //this.canvas.ctx.closePath();
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

    };

    FacePainter.prototype.drawMouth = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
        var startX = x - face.mouth_width / 2;
        var endX = x + face.mouth_width / 2;

        var top_y = height - face.mouth_top_y;
        var bottom_y = height + face.mouth_bottom_y;

        // Upper Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
        this.canvas.ctx.stroke();

        //Lower Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
        this.canvas.ctx.stroke();

    };


    //TODO Scaling ?
    FacePainter.computeFaceOffset = function(face, offset, y) {
        y = y || 0;
        //var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
        var pos = y - face.head_radius + face.head_radius * 2 * offset;
        //console.log('POS: ' + pos);
        return pos;
    };

    FacePainter.computeEyebrowOffset = function(face, y) {
        y = y || 0;
        var eyemindistance = 2;
        return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
    };


    /*!
     *
     * A description of a Chernoff Face.
     *
     * This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
     * describe a Chernoff face.
     *
     */


    FaceVector.defaults = {
        // Head
        head_radius: {
            // id can be specified otherwise is taken head_radius
            min: 10,
            max: 100,
            step: 0.01,
            value: 30,
            label: 'Face radius'
        },
        head_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.5,
            label: 'Scale head horizontally'
        },
        head_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale head vertically'
        },
        // Eye
        eye_height: {
            min: 0.1,
            max: 0.9,
            step: 0.01,
            value: 0.4,
            label: 'Eye height'
        },
        eye_radius: {
            min: 2,
            max: 30,
            step: 0.01,
            value: 5,
            label: 'Eye radius'
        },
        eye_spacing: {
            min: 0,
            max: 50,
            step: 0.01,
            value: 10,
            label: 'Eye spacing'
        },
        eye_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes horizontally'
        },
        eye_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes vertically'
        },
        // Pupil
        pupil_radius: {
            min: 1,
            max: 9,
            step: 0.01,
            value: 1,  //this.eye_radius;
            label: 'Pupil radius'
        },
        pupil_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils horizontally'
        },
        pupil_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils vertically'
        },
        // Eyebrow
        eyebrow_length: {
            min: 1,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Eyebrow length'
        },
        eyebrow_eyedistance: {
            min: 0.3,
            max: 10,
            step: 0.01,
            value: 3, // From the top of the eye
            label: 'Eyebrow from eye'
        },
        eyebrow_angle: {
            min: -2,
            max: 2,
            step: 0.01,
            value: -0.5,
            label: 'Eyebrow angle'
        },
        eyebrow_spacing: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 5,
            label: 'Eyebrow spacing'
        },
        // Nose
        nose_height: {
            min: 0.4,
            max: 1,
            step: 0.01,
            value: 0.4,
            label: 'Nose height'
        },
        nose_length: {
            min: 0.2,
            max: 30,
            step: 0.01,
            value: 15,
            label: 'Nose length'
        },
        nose_width: {
            min: 0,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Nose width'
        },
        // Mouth
        mouth_height: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.75,
            label: 'Mouth height'
        },
        mouth_width: {
            min: 2,
            max: 100,
            step: 0.01,
            value: 20,
            label: 'Mouth width'
        },
        mouth_top_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: -2,
            label: 'Upper lip'
        },
        mouth_bottom_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: 20,
            label: 'Lower lip'
        }
    };

    //Constructs a random face vector.
    FaceVector.random = function() {
        var out = {};
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)) {
                if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
                    out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
                }
            }
        }

        out.scaleX = 1;
        out.scaleY = 1;

        out.color = 'green';
        out.lineWidth = 1;

        return new FaceVector(out);
    };

    function FaceVector (faceVector) {
        faceVector = faceVector || {};

        this.scaleX = faceVector.scaleX || 1;
        this.scaleY = faceVector.scaleY || 1;


        this.color = faceVector.color || 'green';
        this.lineWidth = faceVector.lineWidth || 1;

        // Merge on key
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)){
                if (faceVector.hasOwnProperty(key)){
                    this[key] = faceVector[key];
                }
                else {
                    this[key] = FaceVector.defaults[key].value;
                }
            }
        }

    }

    //Constructs a random face vector.
    FaceVector.prototype.shuffle = function() {
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                if (FaceVector.defaults.hasOwnProperty(key)) {
                    if (key !== 'color') {
                        this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;

                    }
                }
            }
        }
    };

    //Computes the Euclidean distance between two FaceVectors.
    FaceVector.prototype.distance = function(face) {
        return FaceVector.distance(this,face);
    };


    FaceVector.distance = function(face1, face2) {
        var sum = 0.0;
        var diff;

        for (var key in face1) {
            if (face1.hasOwnProperty(key)) {
                diff = face1[key] - face2[key];
                sum = sum + diff * diff;
            }
        }

        return Math.sqrt(sum);
    };

    FaceVector.prototype.toString = function() {
        var out = 'Face: ';
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                out += key + ' ' + this[key];
            }
        }
        return out;
    };

})(node);
/**
 * # ChernoffFaces (Simplified version) widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays multidimensional data in the shape of a Chernoff Face.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var Table = node.window.Table;

    node.widgets.register('ChernoffFacesSimple', ChernoffFaces);

    // # Defaults

    ChernoffFaces.defaults = {};
    ChernoffFaces.defaults.id = 'ChernoffFaces';
    ChernoffFaces.defaults.canvas = {};
    ChernoffFaces.defaults.canvas.width = 100;
    ChernoffFaces.defaults.canvas.heigth = 100;

    // ## Meta-data

    ChernoffFaces.version = '0.3';
    ChernoffFaces.description = 'Display parametric data in the form of a Chernoff Face.'

    // ## Dependencies
    ChernoffFaces.dependencies = {
        JSUS: {},
        Table: {},
        Canvas: {},
        'Controls.Slider': {}
    };

    ChernoffFaces.FaceVector = FaceVector;
    ChernoffFaces.FacePainter = FacePainter;

    function ChernoffFaces (options) {
        this.options = options;
        this.id = options.id;
        this.table = new Table({id: 'cf_table'});
        this.root = options.root || document.createElement('div');
        this.root.id = this.id;

        this.sc = node.widgets.get('Controls.Slider');  // Slider Controls
        this.fp = null;         // Face Painter
        this.canvas = null;
        this.dims = null;       // width and height of the canvas

        this.change = 'CF_CHANGE';
        var that = this;
        this.changeFunc = function() {
            that.draw(that.sc.getAllValues());
        };

        this.features = null;
        this.controls = null;

        this.init(this.options);
    }

    ChernoffFaces.prototype.init = function(options) {
        var that = this;
        this.id = options.id || this.id;
        var PREF = this.id + '_';

        this.features = options.features || this.features || FaceVector.random();

        this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;

        var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';
        var idButton = (options.idButton) ? options.idButton : PREF + 'button';

        this.dims = {
            width: (options.width) ? options.width : ChernoffFaces.defaults.canvas.width,
            height:(options.height) ? options.height : ChernoffFaces.defaults.canvas.heigth
        };

        this.canvas = node.window.getCanvas(idCanvas, this.dims);
        this.fp = new FacePainter(this.canvas);
        this.fp.draw(new FaceVector(this.features));

        var sc_options = {
            id: 'cf_controls',
            features: JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
            change: this.change,
            fieldset: {id: this.id + '_controls_fieldest',
                       legend: this.controls.legend || 'Controls'
                      },
            submit: 'Send'
        };

        this.sc = node.widgets.get('Controls.Slider', sc_options);

        // Controls are always there, but may not be visible
        if (this.controls) {
            this.table.add(this.sc);
        }

        // Dealing with the onchange event
        if ('undefined' === typeof options.change) {
            node.on(this.change, this.changeFunc);
        } else {
            if (options.change) {
                node.on(options.change, this.changeFunc);
            }
            else {
                node.removeListener(this.change, this.changeFunc);
            }
            this.change = options.change;
        }


        this.table.add(this.canvas);
        this.table.parse();
        this.root.appendChild(this.table.table);
    };

    ChernoffFaces.prototype.getRoot = function() {
        return this.root;
    };

    ChernoffFaces.prototype.getCanvas = function() {
        return this.canvas;
    };

    ChernoffFaces.prototype.append = function(root) {
        root.appendChild(this.root);
        this.table.parse();
        return this.root;
    };

    ChernoffFaces.prototype.listeners = function() {};

    ChernoffFaces.prototype.draw = function(features) {
        if (!features) return;
        var fv = new FaceVector(features);
        this.fp.redraw(fv);
        // Without merging wrong values are passed as attributes
        this.sc.init({features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')});
        this.sc.refresh();
    };

    ChernoffFaces.prototype.getAllValues = function() {
        //if (this.sc) return this.sc.getAllValues();
        return this.fp.face;
    };

    ChernoffFaces.prototype.randomize = function() {
        var fv = FaceVector.random();
        this.fp.redraw(fv);

        var sc_options = {
            features: JSUS.mergeOnKey(FaceVector.defaults, fv, 'value'),
            change: this.change
        };
        this.sc.init(sc_options);
        this.sc.refresh();

        return true;
    };

    // FacePainter
    // The class that actually draws the faces on the Canvas
    function FacePainter (canvas, settings) {

        this.canvas = new node.window.Canvas(canvas);

        this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
        this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
    };

    //Draws a Chernoff face.
    FacePainter.prototype.draw = function(face, x, y) {
        if (!face) return;
        this.face = face;
        this.fit2Canvas(face);
        this.canvas.scale(face.scaleX, face.scaleY);

        //console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );

        var x = x || this.canvas.centerX;
        var y = y || this.canvas.centerY;

        this.drawHead(face, x, y);

        this.drawEyes(face, x, y);

        this.drawPupils(face, x, y);

        this.drawEyebrow(face, x, y);

        this.drawNose(face, x, y);

        this.drawMouth(face, x, y);

    };

    FacePainter.prototype.redraw = function(face, x, y) {
        this.canvas.clear();
        this.draw(face,x,y);
    }

    FacePainter.prototype.scale = function(x, y) {
        this.canvas.scale(this.scaleX, this.scaleY);
    }

    // TODO: Improve. It eats a bit of the margins
    FacePainter.prototype.fit2Canvas = function(face) {
        if (!this.canvas) {
            console.log('No canvas found');
            return;
        }

        if (this.canvas.width > this.canvas.height) {
            var ratio = this.canvas.width / face.head_radius * face.head_scale_x;
        }
        else {
            var ratio = this.canvas.height / face.head_radius * face.head_scale_y;
        }

        face.scaleX = ratio / 2;
        face.scaleY = ratio / 2;
    }

    FacePainter.prototype.drawHead = function(face, x, y) {

        var radius = face.head_radius;

        this.canvas.drawOval({
            x: x,
            y: y,
            radius: radius,
            scale_x: face.head_scale_x,
            scale_y: face.head_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    };

    FacePainter.prototype.drawEyes = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
        var spacing = face.eye_spacing;

        var radius = face.eye_radius;
        //console.log(face);
        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth

        });
        //console.log(face);
        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.eye_scale_x,
            scale_y: face.eye_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });
    }

    FacePainter.prototype.drawPupils = function(face, x, y) {

        var radius = face.pupil_radius;
        var spacing = face.eye_spacing;
        var height = FacePainter.computeFaceOffset(face, face.eye_height, y);

        this.canvas.drawOval({
            x: x - spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

        this.canvas.drawOval({
            x: x + spacing,
            y: height,
            radius: radius,
            scale_x: face.pupil_scale_x,
            scale_y: face.pupil_scale_y,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawEyebrow = function(face, x, y) {

        var height = FacePainter.computeEyebrowOffset(face,y);
        var spacing = face.eyebrow_spacing;
        var length = face.eyebrow_length;
        var angle = face.eyebrow_angle;

        this.canvas.drawLine({
            x: x - spacing,
            y: height,
            length: length,
            angle: angle,
            color: face.color,
            lineWidth: face.lineWidth


        });

        this.canvas.drawLine({
            x: x + spacing,
            y: height,
            length: 0-length,
            angle: -angle,
            color: face.color,
            lineWidth: face.lineWidth
        });

    };

    FacePainter.prototype.drawNose = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
        var nastril_r_x = x + face.nose_width / 2;
        var nastril_r_y = height + face.nose_length;
        var nastril_l_x = nastril_r_x - face.nose_width;
        var nastril_l_y = nastril_r_y;

        this.canvas.ctx.lineWidth = face.lineWidth;
        this.canvas.ctx.strokeStyle = face.color;

        this.canvas.ctx.save();
        this.canvas.ctx.beginPath();
        this.canvas.ctx.moveTo(x,height);
        this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
        this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
        //this.canvas.ctx.closePath();
        this.canvas.ctx.stroke();
        this.canvas.ctx.restore();

    };

    FacePainter.prototype.drawMouth = function(face, x, y) {

        var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
        var startX = x - face.mouth_width / 2;
        var endX = x + face.mouth_width / 2;

        var top_y = height - face.mouth_top_y;
        var bottom_y = height + face.mouth_bottom_y;

        // Upper Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
        this.canvas.ctx.stroke();

        //Lower Lip
        this.canvas.ctx.moveTo(startX,height);
        this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
        this.canvas.ctx.stroke();

    };


    //TODO Scaling ?
    FacePainter.computeFaceOffset = function(face, offset, y) {
        var y = y || 0;
        //var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
        var pos = y - face.head_radius + face.head_radius * 2 * offset;
        //console.log('POS: ' + pos);
        return pos;
    };

    FacePainter.computeEyebrowOffset = function(face, y) {
        var y = y || 0;
        var eyemindistance = 2;
        return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
    };


    /*!
     *
     * A description of a Chernoff Face.
     *
     * This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
     * describe a Chernoff face.
     *
     */


    FaceVector.defaults = {
        // Head
        head_radius: {
            // id can be specified otherwise is taken head_radius
            min: 10,
            max: 100,
            step: 0.01,
            value: 30,
            label: 'Face radius'
        },
        head_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.5,
            label: 'Scale head horizontally'
        },
        head_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale head vertically'
        },
        // Eye
        eye_height: {
            min: 0.1,
            max: 0.9,
            step: 0.01,
            value: 0.4,
            label: 'Eye height'
        },
        eye_radius: {
            min: 2,
            max: 30,
            step: 0.01,
            value: 5,
            label: 'Eye radius'
        },
        eye_spacing: {
            min: 0,
            max: 50,
            step: 0.01,
            value: 10,
            label: 'Eye spacing'
        },
        eye_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes horizontally'
        },
        eye_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale eyes vertically'
        },
        // Pupil
        pupil_radius: {
            min: 1,
            max: 9,
            step: 0.01,
            value: 1,  //this.eye_radius;
            label: 'Pupil radius'
        },
        pupil_scale_x: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils horizontally'
        },
        pupil_scale_y: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 1,
            label: 'Scale pupils vertically'
        },
        // Eyebrow
        eyebrow_length: {
            min: 1,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Eyebrow length'
        },
        eyebrow_eyedistance: {
            min: 0.3,
            max: 10,
            step: 0.01,
            value: 3, // From the top of the eye
            label: 'Eyebrow from eye'
        },
        eyebrow_angle: {
            min: -2,
            max: 2,
            step: 0.01,
            value: -0.5,
            label: 'Eyebrow angle'
        },
        eyebrow_spacing: {
            min: 0,
            max: 20,
            step: 0.01,
            value: 5,
            label: 'Eyebrow spacing'
        },
        // Nose
        nose_height: {
            min: 0.4,
            max: 1,
            step: 0.01,
            value: 0.4,
            label: 'Nose height'
        },
        nose_length: {
            min: 0.2,
            max: 30,
            step: 0.01,
            value: 15,
            label: 'Nose length'
        },
        nose_width: {
            min: 0,
            max: 30,
            step: 0.01,
            value: 10,
            label: 'Nose width'
        },
        // Mouth
        mouth_height: {
            min: 0.2,
            max: 2,
            step: 0.01,
            value: 0.75,
            label: 'Mouth height'
        },
        mouth_width: {
            min: 2,
            max: 100,
            step: 0.01,
            value: 20,
            label: 'Mouth width'
        },
        mouth_top_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: -2,
            label: 'Upper lip'
        },
        mouth_bottom_y: {
            min: -10,
            max: 30,
            step: 0.01,
            value: 20,
            label: 'Lower lip'
        }
    };

    //Constructs a random face vector.
    FaceVector.random = function() {
        var out = {};
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)) {
                if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
                    out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
                }
            }
        }

        out.scaleX = 1;
        out.scaleY = 1;

        out.color = 'green';
        out.lineWidth = 1;

        return new FaceVector(out);
    };

    function FaceVector (faceVector) {
        var faceVector = faceVector || {};

        this.scaleX = faceVector.scaleX || 1;
        this.scaleY = faceVector.scaleY || 1;


        this.color = faceVector.color || 'green';
        this.lineWidth = faceVector.lineWidth || 1;

        // Merge on key
        for (var key in FaceVector.defaults) {
            if (FaceVector.defaults.hasOwnProperty(key)){
                if (faceVector.hasOwnProperty(key)){
                    this[key] = faceVector[key];
                }
                else {
                    this[key] = FaceVector.defaults[key].value;
                }
            }
        }

    };

    //Constructs a random face vector.
    FaceVector.prototype.shuffle = function() {
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                if (FaceVector.defaults.hasOwnProperty(key)) {
                    if (key !== 'color') {
                        this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;

                    }
                }
            }
        }
    };

    //Computes the Euclidean distance between two FaceVectors.
    FaceVector.prototype.distance = function(face) {
        return FaceVector.distance(this,face);
    };


    FaceVector.distance = function(face1, face2) {
        var sum = 0.0;
        var diff;

        for (var key in face1) {
            if (face1.hasOwnProperty(key)) {
                diff = face1[key] - face2[key];
                sum = sum + diff * diff;
            }
        }

        return Math.sqrt(sum);
    };

    FaceVector.prototype.toString = function() {
        var out = 'Face: ';
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                out += key + ' ' + this[key];
            }
        };
        return out;
    };

})(node);
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
/**
 * # D3 widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Integrates nodeGame with the D3 library to plot a real-time chart. 
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";
        
    node.widgets.register('D3', D3);
    node.widgets.register('D3ts', D3ts);
    
    D3.prototype.__proto__ = node.Widget.prototype;
    D3.prototype.constructor = D3;

    // ## Defaults
    
    D3.defaults = {};
    D3.defaults.id = 'D3';
    D3.defaults.fieldset = {
	legend: 'D3 plot'
    };

    
    // ## Meta-data
    
    D3.version = '0.1';
    D3.description = 'Real time plots for nodeGame with d3.js';
    
    // ## Dependencies
    
    D3.dependencies = {
	d3: {},	
	JSUS: {}
    };
    
    function D3 (options) {
	this.id = options.id || D3.id;
	this.event = options.event || 'D3';
	this.svg = null;
	
	var that = this;
	node.on(this.event, function(value) {
	    that.tick.call(that, value); 
	});
    }
    
    D3.prototype.append = function(root) {
	this.root = root;
	this.svg = d3.select(root).append("svg");
	return root;
    };
    
    D3.prototype.tick = function() {};
    
    // # D3ts
    
    
    // ## Meta-data
    
    D3ts.id = 'D3ts';
    D3ts.version = '0.1';
    D3ts.description = 'Time series plot for nodeGame with d3.js';
    
    // ## Dependencies	
    D3ts.dependencies = {
	D3: {},	
	JSUS: {}
    };
    
    D3ts.prototype.__proto__ = D3.prototype;
    D3ts.prototype.constructor = D3ts;
    
    D3ts.defaults = {};
    
    D3ts.defaults.width = 400;
    D3ts.defaults.height = 200;
    
    D3ts.defaults.margin = {
    	top: 10, 
    	right: 10, 
    	bottom: 20, 
    	left: 40 
    };
    
    D3ts.defaults.domain = {
	x: [0, 10],
	y: [0, 1]
    };
    
    D3ts.defaults.range = {
    	x: [0, D3ts.defaults.width],
    	y: [D3ts.defaults.height, 0]
    };
    
    function D3ts (options) {
	D3.call(this, options);
	
	
	var o = this.options = JSUS.merge(D3ts.defaults, options);
	
	var n = this.n = o.n;
	
	this.data = [0];
	
	this.margin = o.margin;
	
	var width = this.width = o.width - this.margin.left - this.margin.right;
	var height = this.height = o.height - this.margin.top - this.margin.bottom;

	// identity function
	var x = this.x = d3.scale.linear()
	    .domain(o.domain.x)
	    .range(o.range.x);

	var y = this.y = d3.scale.linear()
	    .domain(o.domain.y)
	    .range(o.range.y);

	// line generator
	this.line = d3.svg.line()
	    .x(function(d, i) { return x(i); })
	    .y(function(d, i) { return y(d); });
    }
    
    D3ts.prototype.init = function(options) {
	//D3.init.call(this, options);
	
	console.log('init!');
	var x = this.x,
	y = this.y,
	height = this.height,
	width = this.width,
	margin = this.margin;
	
	
	// Create the SVG and place it in the middle
	this.svg.attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	// Line does not go out the axis
	this.svg.append("defs").append("clipPath")
	    .attr("id", "clip")
	    .append("rect")
	    .attr("width", width)
	    .attr("height", height);

	// X axis
	this.svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.svg.axis().scale(x).orient("bottom"));

	// Y axis
	this.svg.append("g")
	    .attr("class", "y axis")
	    .call(d3.svg.axis().scale(y).orient("left"));

	this.path = this.svg.append("g")
	    .attr("clip-path", "url(#clip)")
	    .append("path")
	    .data([this.data])
	    .attr("class", "line")
	    .attr("d", this.line);		
    };
    
    D3ts.prototype.tick = function(value) {
	this.alreadyInit = this.alreadyInit || false;
	if (!this.alreadyInit) {
	    this.init();
	    this.alreadyInit = true;
	}
	
	var x = this.x;
	
	console.log('tick!');
	
	// push a new data point onto the back
	this.data.push(value);

	// redraw the line, and slide it to the left
	this.path
	    .attr("d", this.line)
	    .attr("transform", null);

	// pop the old data point off the front
	if (this.data.length > this.n) {
	    
	    this.path
	  	.transition()
	  	.duration(500)
	  	.ease("linear")
	  	.attr("transform", "translate(" + x(-1) + ")");
	    
	    this.data.shift();
	    
	}
    };
    
})(node);
/**
 * # DataBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a form to send DATA packages to other clients / SERVER.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('DataBar', DataBar);

    // ## Defaults
    DataBar.defaults = {};
    DataBar.defaults.id = 'databar';
    DataBar.defaults.fieldset = {
	legend: 'Send DATA to players'
    };

    // ## Meta-data
    DataBar.version = '0.4';
    DataBar.description = 'Adds a input field to send DATA messages to the players';

    function DataBar(options) {
	this.bar = null;
	this.root = null;
	this.recipient = null;
    }

    DataBar.prototype.append = function(root) {

	var sendButton, textInput, dataInput;

	sendButton = W.addButton(root);
	//W.writeln('Text');
	textInput = W.addTextInput(root, 'data-bar-text');
	W.addLabel(root, textInput, undefined, 'Text');
	W.writeln('Data');
	dataInput = W.addTextInput(root, 'data-bar-data');

	this.recipient = W.addRecipientSelector(root);

	var that = this;

	sendButton.onclick = function() {

	    var to, data, text;

	    to = that.recipient.value;
	    text = textInput.value;
	    data = dataInput.value;

	    node.log('Parsed Data: ' + JSON.stringify(data));

	    node.say(text, to, data);
	};

	node.on('UPDATED_PLIST', function() {
	    node.window.populateRecipientSelector(that.recipient, node.game.pl);
	});

	return root;

    };

})(node);

/**
 * # Dynamic Table widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Extends the GameTable widgets by allowing dynamic reshaping.
 *
 * TODO: this widget needs refactoring.
 *
 * @experimental
 * @see GameTable widget
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var GameStage = node.GameStage,
    PlayerList = node.PlayerList,
    Table = node.window.Table,
    HTMLRenderer = node.window.HTMLRenderer;

    node.widgets.register('DynamicTable', DynamicTable);


    DynamicTable.prototype = new Table();
    DynamicTable.prototype.constructor = Table;


    DynamicTable.id = 'dynamictable';
    DynamicTable.version = '0.3.1';

    DynamicTable.dependencies = {
	Table: {},
	JSUS: {},
	HTMLRenderer: {}
    };

    function DynamicTable (options, data) {
	//JSUS.extend(node.window.Table,this);
	Table.call(this, options, data);
	this.options = options;
	this.id = options.id;
	this.name = options.name || 'Dynamic Table';
	this.fieldset = { legend: this.name,
			  id: this.id + '_fieldset'
		        };

	this.root = null;
	this.bindings = {};
	this.init(this.options);
    }

    DynamicTable.prototype.init = function(options) {
	this.options = options;
	this.name = options.name || this.name;
	this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : true;
	this.replace = options.replace || false;
	this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
	this.c('state', GameStage.compare);
	this.setLeft([]);
	this.parse(true);
    };

    DynamicTable.prototype.bind = function(event, bindings) {
	if (!event || !bindings) return;
	var that = this;

	node.on(event, function(msg) {

	    if (bindings.x || bindings.y) {
		// Cell
		var func;
		if (that.replace) {
		    func = function(x, y) {
			var found = that.get(x,y);
			if (found.length !== 0) {
			    for (var ci=0; ci < found.length; ci++) {
				bindings.cell.call(that, msg, found[ci]);
			    }
			}
			else {
			    var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
			    that.add(cell);
			}
		    };
		}
		else {
		    func = function(x, y) {
			var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
			that.add(cell, x, y);
		    };
		}

		var x = bindings.x.call(that, msg);
		var y = bindings.y.call(that, msg);

		if (x && y) {

		    x = (x instanceof Array) ? x : [x];
		    y = (y instanceof Array) ? y : [y];

                    //					console.log('Bindings found:');
                    //					console.log(x);
                    //					console.log(y);

		    for (var xi=0; xi < x.length; xi++) {
			for (var yi=0; yi < y.length; yi++) {
			    // Replace or Add
			    func.call(that, x[xi], y[yi]);
			}
		    }
		}
		// End Cell
	    }

	    // Header
	    if (bindings.header) {
		var h = bindings.header.call(that, msg);
		h = (h instanceof Array) ? h : [h];
		that.setHeader(h);
	    }

	    // Left
	    if (bindings.left) {
		var l = bindings.left.call(that, msg);
		if (!JSUS.in_array(l, that.left)) {
		    that.header.push(l);
		}
	    }

	    // Auto Update?
	    if (that.auto_update) {
		that.parse();
	    }
	});

    };

    DynamicTable.prototype.append = function(root) {
	this.root = root;
	root.appendChild(this.table);
	return root;
    };

    DynamicTable.prototype.listeners = function() {};

})(node);
/**
 * # EventButton widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a clickable button that fires an event.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var JSUS = node.JSUS;

    node.widgets.register('EventButton', EventButton);

    // ## Defaults

    EventButton.defaults = {};
    EventButton.defaults.id = 'eventbutton';
    EventButton.defaults.fieldset = false;

    // ## Meta-data

    EventButton.version = '0.2';

    // ## Dependencies

    EventButton.dependencies = {
        JSUS: {}
    };

    function EventButton(options) {
        this.options = options;
        this.id = options.id;

        this.root = null;
        this.text = 'Send';
        this.button = document.createElement('button');
        this.callback = null;
        this.init(this.options);
    }

    EventButton.prototype.init = function(options) {
        options = options || this.options;
        this.button.id = options.id || this.id;
        var text = options.text || this.text;
        while (this.button.hasChildNodes()) {
            this.button.removeChild(this.button.firstChild);
        }
        this.button.appendChild(document.createTextNode(text));
        this.event = options.event || this.event;
        this.callback = options.callback || this.callback;
        var that = this;
        if (this.event) {
            // Emit Event only if callback is successful
            this.button.onclick = function() {
                var ok = true;
                if (this.callback){
                    ok = options.callback.call(node.game);
                }
                if (ok) node.emit(that.event);
            };
        }

        //              // Emit DONE only if callback is successful
        //              this.button.onclick = function() {
        //                      var ok = true;
        //                      if (options.exec) ok = options.exec.call(node.game);
        //                      if (ok) node.emit(that.event);
        //              }
    };

    EventButton.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.button);
        return root;
    };

    EventButton.prototype.listeners = function() {};

    // # Done Button

    node.widgets.register('DoneButton', DoneButton);

    DoneButton.prototype.__proto__ = EventButton.prototype;
    DoneButton.prototype.constructor = DoneButton;

    // ## Meta-data

    DoneButton.id = 'donebutton';
    DoneButton.version = '0.1';

    // ## Dependencies

    DoneButton.dependencies = {
        EventButton: {}
    };

    function DoneButton (options) {
        options.event = 'DONE';
        options.text = options.text || 'Done!';
        EventButton.call(this, options);
    }

})(node);
/**
 * # Feedback widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Sends a feedback message to the server.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    // ## Defaults

    Feedback.defaults = {};
    Feedback.defaults.id = 'feedback';
    Feedback.defaults.fieldset = { 
        legend: 'Feedback'
    };
    
    // ## Meta-data

    Feedback.version = '0.1';
    Feedback.description = 'Displays a simple feedback form';

    // ## Dependencies

    Feedback.dependencies = {
        JSUS: {}
    };

    function Feedback(options) {
        this.id = options.id || Feedback.id;
        this.root = null;
        this.textarea = null;
        this.submit = null;
        this.label = options.label || 'FEEDBACK';
    }

    Feedback.prototype.append = function(root) {
        var that = this;
        this.root = root;
        this.textarea = document.createElement('textarea');
        this.submit = document.createElement('button');
        this.submit.appendChild(document.createTextNode('Submit'));
        this.submit.onclick = function() {
            var feedback, sent;
            feedback = that.textarea.value;
            if (!feedback.length) {
                J.highlight(that.textarea, 'ERR');
                alert('Feedback is empty, not sent.');
                return false;
            }
            sent = node.say('FEEDBACK', 'SERVER', {
                feedback: feedback,
                userAgent: navigator.userAgent
            });

            if (sent) {
                J.highlight(that.textarea, 'OK');
                alert('Feedback sent. Thank you.');
                that.textarea.disabled = true;
                that.submit.disabled = true;
            }
            else {
                J.highlight(that.textarea, 'ERR');
                alert('An error has occurred, feedback not sent.');
            }
        };
        root.appendChild(this.textarea);
        root.appendChild(this.submit);
        return root;
    };

    Feedback.prototype.getRoot = function() {
        return this.root;
    };

    Feedback.prototype.listeners = function() {
        var that = this;
    };

    node.widgets.register('Feedback', Feedback);

})(node);
/**
 * # GameBoard widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays a table of currently connected players.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {
   
    "use strict";
 
    node.widgets.register('GameBoard', GameBoard);
    
    var PlayerList = node.PlayerList;

    // ## Defaults	
    
    GameBoard.defaults = {};
    GameBoard.defaults.id = 'gboard';
    GameBoard.defaults.fieldset = {
	legend: 'Game Board'
    };
    
    // ## Meta-data
    
    GameBoard.version = '0.4.0';
    GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
    
    function GameBoard(options) {
	
	this.id = options.id || GameBoard.defaults.id;
	this.status_id = this.id + '_statusbar';
	
	this.board = null;
	this.status = null;
	this.root = null;
	
    }
    
    GameBoard.prototype.append = function(root) {
	this.root = root;
	this.status = node.window.addDiv(root, this.status_id);
	this.board = node.window.addDiv(root, this.id);
	
	this.updateBoard(node.game.pl);
		
	return root;
    };
    
    GameBoard.prototype.listeners = function() {
	var that = this;		
	node.on('UPDATED_PLIST', function() {
	    that.updateBoard(node.game.pl);
	});
	
    };
    
    GameBoard.prototype.printLine = function(p) {

	var line, levels, level;
        levels = node.constants.stageLevels;

        line = '[' + (p.name || p.id) + "]> \t"; 
	line += '(' +  p.stage.round + ') ' + p.stage.stage + '.' + p.stage.step; 
	line += ' ';
	
	switch (p.stageLevel) {

	case levels.UNINITIALIZED:
	    level = 'uninit.';
	    break;
	    
	case levels.INITIALIZING:
	    level = 'init...';
	    break;

	case levels.INITIALIZING:
	    level = 'init!';
	    break;

	case levels.LOADING:
	    level = 'loading';
	    break;	    

	case levels.LOADED:
	    level = 'loaded';
	    break;
	    
	case levels.PLAYING:
	    level = 'playing';
	    break;
	case levels.DONE:
	    level = 'done';
	    break;
		
	default:
	    level = p.stageLevel;
	    break;		
	}

	return line + '(' + level + ')';
    };
    
    GameBoard.prototype.printSeparator = function(p) {
	return W.getElement('hr', null, {style: 'color: #CCC;'});
    };
    
    
    GameBoard.prototype.updateBoard = function(pl) {
	var player, separator;
        var that = this;
	
	this.status.innerHTML = 'Updating...';
	
	if (pl.size()) {
	    that.board.innerHTML = '';
	    pl.forEach( function(p) {
		player = that.printLine(p);
		
		W.write(player, that.board);
		
		separator = that.printSeparator(p);
		W.write(separator, that.board);
	    });
	}
	
	
	this.status.innerHTML = 'Connected players: ' + node.game.pl.length;
    };
    
})(node);

/**
 * # GameSummary widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows the configuration options of a game in a box.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('GameSummary', GameSummary);

    // ## Defaults
    
    GameSummary.defaults = {};
    GameSummary.defaults.id = 'gamesummary';
    GameSummary.defaults.fieldset = { legend: 'Game Summary' };
    
    // ## Meta-data
    
    GameSummary.version = '0.3';
    GameSummary.description = 'Show the general configuration options of the game.';
    
    function GameSummary(options) {
	this.summaryDiv = null;
    }
    
    GameSummary.prototype.append = function(root) {
	this.root = root;
	this.summaryDiv = node.window.addDiv(root);
	this.writeSummary();
	return root;
    };
    
    GameSummary.prototype.writeSummary = function(idState, idSummary) {
	var gName = document.createTextNode('Name: ' + node.game.metadata.name),
	gDescr = document.createTextNode('Descr: ' + node.game.metadata.description),
	gMinP = document.createTextNode('Min Pl.: ' + node.game.minPlayers),
	gMaxP = document.createTextNode('Max Pl.: ' + node.game.maxPlayers);
	
	this.summaryDiv.appendChild(gName);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gDescr);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMinP);
	this.summaryDiv.appendChild(document.createElement('br'));
	this.summaryDiv.appendChild(gMaxP);
	
	node.window.addDiv(this.root, this.summaryDiv, idSummary);
    };

})(node);

/**
 * # GameTable widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that renders in each cell data captured by fired events.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var GameStage = node.GameStage,
    PlayerList = node.PlayerList;

    node.widgets.register('GameTable', GameTable);

    // ## Defaults

    GameTable.defaults = {};
    GameTable.defaults.id = 'gametable';
    GameTable.defaults.fieldset = {
        legend: 'Game Table',
        id: 'gametable_fieldset'
    };

    // ## Meta-data

    GameTable.version = '0.3';

    // ## Dependencies

    GameTable.dependencies = {
        JSUS: {}
    };

    function GameTable (options) {
        this.options = options;
        this.id = options.id;
        this.name = options.name || GameTable.name;

        this.root = null;
        this.gtbl = null;
        this.plist = null;

        this.init(this.options);
    }

    GameTable.prototype.init = function(options) {

        if (!this.plist) this.plist = new PlayerList();

        this.gtbl = new node.window.Table({
            auto_update: true,
            id: options.id || this.id,
            render: options.render
        }, node.game.memory.db);


        this.gtbl.c('state', GameStage.compare);

        this.gtbl.setLeft([]);

        this.gtbl.parse(true);
    };


    GameTable.prototype.addRenderer = function(func) {
        return this.gtbl.addRenderer(func);
    };

    GameTable.prototype.resetRender = function() {
        return this.gtbl.resetRenderer();
    };

    GameTable.prototype.removeRenderer = function(func) {
        return this.gtbl.removeRenderer(func);
    };

    GameTable.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.gtbl.table);
        return root;
    };

    GameTable.prototype.listeners = function() {
        var that = this;

        node.on.plist(function(msg) {
            if (!msg.data.length) return;

            //var diff = JSUS.arrayDiff(msg.data,that.plist.db);
            var plist = new PlayerList({}, msg.data);
            var diff = plist.diff(that.plist);
            if (diff) {
                //                              console.log('New Players found');
                //                              console.log(diff);
                diff.forEach(function(el){that.addPlayer(el);});
            }

            that.gtbl.parse(true);
        });

        node.on('in.set.DATA', function(msg) {

            that.addLeft(msg.state, msg.from);
            var x = that.player2x(msg.from);
            var y = that.state2y(node.game.state, msg.text);

            that.gtbl.add(msg.data, x, y);
            that.gtbl.parse(true);
        });
    };

    GameTable.prototype.addPlayer = function(player) {
        this.plist.add(player);
        var header = this.plist.map(function(el){return el.name;});
        this.gtbl.setHeader(header);
    };

    GameTable.prototype.addLeft = function(state, player) {
        if (!state) return;
        state = new GameStage(state);
        if (!JSUS.in_array({content:state.toString(), type: 'left'}, this.gtbl.left)){
            this.gtbl.add2Left(state.toString());
        }
        // Is it a new display associated to the same state?
        else {
            var y = this.state2y(state);
            var x = this.player2x(player);
            if (this.gtbl.select('y','=',y).select('x','=',x).count() > 1) {
                this.gtbl.add2Left(state.toString());
            }
        }

    };

    GameTable.prototype.player2x = function(player) {
        if (!player) return false;
        return this.plist.select('id', '=', player).first().count;
    };

    GameTable.prototype.x2Player = function(x) {
        if (!x) return false;
        return this.plist.select('count', '=', x).first().count;
    };

    GameTable.prototype.state2y = function(state) {
        if (!state) return false;
        return node.game.plot.indexOf(state);
    };

    GameTable.prototype.y2State = function(y) {
        if (!y) return false;
        return node.game.plot.jumpTo(new GameStage(),y);
    };

})(node);

/**
 * # MoneyTalks widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays a box for formatting currency.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('MoneyTalks', MoneyTalks);

    var JSUS = node.JSUS;

    // ## Defaults

    MoneyTalks.defaults = {};
    MoneyTalks.defaults.id = 'moneytalks';
    MoneyTalks.defaults.fieldset = {
        legend: 'Earnings'
    };

    // ## Meta-data

    MoneyTalks.version = '0.1.0';
    MoneyTalks.description = 'Display the earnings of a player.';

    // ## Dependencies

    MoneyTalks.dependencies = {
        JSUS: {}
    };

    function MoneyTalks(options) {
        this.id = options.id || MoneyTalks.defaults.id;

        this.root = null;               // the parent element

        this.spanCurrency = document.createElement('span');
        this.spanMoney = document.createElement('span');

        this.currency = 'EUR';
        this.money = 0;
        this.precision = 2;
        this.init(options);
    }


    MoneyTalks.prototype.init = function(options) {
        this.currency = options.currency || this.currency;
        this.money = options.money || this.money;
        this.precision = options.precision || this.precision;

        this.spanCurrency.id = options.idCurrency || this.spanCurrency.id || 'moneytalks_currency';
        this.spanMoney.id = options.idMoney || this.spanMoney.id || 'moneytalks_money';

        this.spanCurrency.innerHTML = this.currency;
        this.spanMoney.innerHTML = this.money;
    };

    MoneyTalks.prototype.getRoot = function() {
        return this.root;
    };

    MoneyTalks.prototype.append = function(root, ids) {
        var PREF = this.id + '_';
        root.appendChild(this.spanMoney);
        root.appendChild(this.spanCurrency);
        return root;
    };

    MoneyTalks.prototype.listeners = function() {
        var that = this;
        node.on('MONEYTALKS', function(amount) {
            that.update(amount);
        });
    };

    MoneyTalks.prototype.update = function(amount) {
        if ('number' !== typeof amount) {
            // Try to parse strings
            amount = parseInt(amount);
            if (isNaN(n) || !isFinite(n)) {
                return;
            }
        }
        this.money += amount;
        this.spanMoney.innerHTML = this.money.toFixed(this.precision);
    };

})(node);
/**
 * # MsgBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a tool for sending messages to other connected clients.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var GameMsg = node.GameMsg,
        GameStage = node.GameStage,
        JSUS = node.JSUS,
        Table = W.Table;

    node.widgets.register('MsgBar', MsgBar);

    // ## Meta-data

    MsgBar.version = '0.5';
    MsgBar.description = 'Send a nodeGame message to players';

    MsgBar.title = 'Send MSG';
    MsgBar.className = 'msgbar';

    function MsgBar(options) {

        this.id = options.id || MsgBar.className;

        this.recipient = null;
        this.actionSel = null;
        this.targetSel = null;

        this.table = new Table();

        this.init();
    }

    // TODO: Write a proper INIT method
    MsgBar.prototype.init = function() {
        var that;
        that = this;

        // Create fields.

        // To:
        this.table.add('to', 0, 0);
        this.table.add(W.getTextInput(this.id + '_to'), 0, 1);
        this.recipient =
            W.getRecipientSelector(this.id + '_recipients');
        this.table.add(this.recipient, 0, 2);
        this.recipient.onchange = function() {
            W.getElementById(that.id + '_to').value =
                that.recipient.value;
        };

        // Action:
        this.table.add('action', 1, 0);
        this.table.add(W.getTextInput(this.id + '_action'), 1, 1);
        this.actionSel = W.getActionSelector(this.id + '_actions');
        this.table.add(this.actionSel, 1, 2);
        this.actionSel.onchange = function() {
            W.getElementById(that.id + '_action').value =
                that.actionSel.value;
        };

        // Target:
        this.table.add('target', 2, 0);
        this.table.add(W.getTextInput(this.id + '_target'), 2, 1);
        this.targetSel = W.getTargetSelector(this.id + '_targets');
        this.table.add(this.targetSel, 2, 2);
        this.targetSel.onchange = function() {
            W.getElementById(that.id + '_target').value =
                that.targetSel.value;
        };

        // Text:
        this.table.add('text', 3, 0);
        this.table.add(W.getTextInput(this.id + '_text'), 3, 1);

        // Data:
        this.table.add('data', 4, 0);
        this.table.add(W.getTextInput(this.id + '_data'), 4, 1);


        // TODO: Hide the following fields.
        // From:
        this.table.add('from', 5, 0);
        this.table.add(W.getTextInput(this.id + '_from'), 5, 1);

        // Priority:
        this.table.add('priority', 6, 0);
        this.table.add(W.getTextInput(this.id + '_priority'), 6, 1);

        // Reliable:
        this.table.add('reliable', 7, 0);
        this.table.add(W.getTextInput(this.id + '_reliable'), 7, 1);

        // Forward:
        this.table.add('forward', 8, 0);
        this.table.add(W.getTextInput(this.id + '_forward'), 8, 1);

        // Session:
        this.table.add('session', 9, 0);
        this.table.add(W.getTextInput(this.id + '_session'), 9, 1);

        // Stage:
        this.table.add('stage', 10, 0);
        this.table.add(W.getTextInput(this.id + '_stage'), 10, 1);

        // Created:
        this.table.add('created', 11, 0);
        this.table.add(W.getTextInput(this.id + '_created'), 11, 1);

        // Id:
        this.table.add('id', 12, 0);
        this.table.add(W.getTextInput(this.id + '_id'), 12, 1);


        this.table.parse();
    };

    MsgBar.prototype.append = function() {
        var sendButton;
        var that;

        that = this;

        this.bodyDiv.appendChild(this.table.table);

        sendButton = W.addButton(this.bodyDiv);
        sendButton.onclick = function() {
            var msg = that.parse();

            if (msg) {
                node.socket.send(msg);
                //console.log(msg.stringify());
            }
        };
    };

    MsgBar.prototype.listeners = function() {
    };

    MsgBar.prototype.parse = function() {
        var msg, that, key, value, gameMsg, invalid;

        msg = {};
        that = this;
        key = null;
        value = null;
        invalid = false;

        this.table.forEach( function(e) {
            if (invalid) return;

            if (e.x === 0) {
                key = e.content;
                msg[key] = '';
            }
            else if (e.x === 1) {

                value = e.content.value;
                if (key === 'stage' || key === 'to' || key === 'data') {
                    try {
                        value = JSUS.parse(e.content.value);
                    }
                    catch (ex) {
                        value = e.content.value;
                    }
                }

                if (key === 'to' && 'number' === typeof value) {
                    value = '' + value;
                }

                // Validate input.
                if (key === 'to' &&
                    ((!JSUS.isArray(value) && 'string' !== typeof value) ||
                      value.trim() === '')) {

                    alert('Invalid "to" field');
                    invalid = true;
                }

                if (key === 'action' && value.trim() === '') {
                    alert('Missing "action" field');
                    invalid = true;
                }

                if (key === 'target' && value.trim() === '') {
                    alert('Missing "target" field');
                    invalid = true;
                }

                msg[key] = value;
            }
        });

        if (invalid) return null;
        gameMsg = node.msg.create(msg);
        node.info(gameMsg, 'MsgBar sent: ');
        return gameMsg;
    };

})(node);

/**
 * # NDDBBrowser widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates an interface to interact with an NDDB database.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('NDDBBrowser', NDDBBrowser);

    var JSUS = node.JSUS,
    NDDB = node.NDDB,
    TriggerManager = node.TriggerManager;

    // ## Defaults

    NDDBBrowser.defaults = {};
    NDDBBrowser.defaults.id = 'nddbbrowser';
    NDDBBrowser.defaults.fieldset = false;

    // ## Meta-data

    NDDBBrowser.version = '0.1.2';
    NDDBBrowser.description = 'Provides a very simple interface to control a NDDB istance.';

    // ## Dependencies

    NDDBBrowser.dependencies = {
        JSUS: {},
        NDDB: {},
        TriggerManager: {}
    };

    function NDDBBrowser(options) {
        this.options = options;
        this.nddb = null;

        this.commandsDiv = document.createElement('div');
        this.id = options.id;
        if ('undefined' !== typeof this.id) {
            this.commandsDiv.id = this.id;
        }

        this.info = null;
        this.init(this.options);
    }

    NDDBBrowser.prototype.init = function(options) {

        function addButtons() {
            var id = this.id;
            node.window.addEventButton(id + '_GO_TO_FIRST', '<<', this.commandsDiv, 'go_to_first');
            node.window.addEventButton(id + '_GO_TO_PREVIOUS', '<', this.commandsDiv, 'go_to_previous');
            node.window.addEventButton(id + '_GO_TO_NEXT', '>', this.commandsDiv, 'go_to_next');
            node.window.addEventButton(id + '_GO_TO_LAST', '>>', this.commandsDiv, 'go_to_last');
            node.window.addBreak(this.commandsDiv);
        }
        function addInfoBar() {
            var span = this.commandsDiv.appendChild(document.createElement('span'));
            return span;
        }


        addButtons.call(this);
        this.info = addInfoBar.call(this);

        this.tm = new TriggerManager();
        this.tm.init(options.triggers);
        this.nddb = options.nddb || new NDDB({auto_update_pointer: true});
    };

    NDDBBrowser.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.commandsDiv);
        return root;
    };

    NDDBBrowser.prototype.getRoot = function(root) {
        return this.commandsDiv;
    };

    NDDBBrowser.prototype.add = function(o) {
        return this.nddb.insert(o);
    };

    NDDBBrowser.prototype.sort = function(key) {
        return this.nddb.sort(key);
    };

    NDDBBrowser.prototype.addTrigger = function(trigger) {
        return this.tm.addTrigger(trigger);
    };

    NDDBBrowser.prototype.removeTrigger = function(trigger) {
        return this.tm.removeTrigger(trigger);
    };

    NDDBBrowser.prototype.resetTriggers = function() {
        return this.tm.resetTriggers();
    };

    NDDBBrowser.prototype.listeners = function() {
        var that = this;
        var id = this.id;

        function notification(el, text) {
            if (el) {
                node.emit(id + '_GOT', el);
                this.writeInfo((this.nddb.nddb_pointer + 1) + '/' + this.nddb.size());
            }
            else {
                this.writeInfo('No element found');
            }
        }

        node.on(id + '_GO_TO_FIRST', function() {
            var el = that.tm.pullTriggers(that.nddb.first());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_PREVIOUS', function() {
            var el = that.tm.pullTriggers(that.nddb.previous());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_NEXT', function() {
            var el = that.tm.pullTriggers(that.nddb.next());
            notification.call(that, el);
        });

        node.on(id + '_GO_TO_LAST', function() {
            var el = that.tm.pullTriggers(that.nddb.last());
            notification.call(that, el);

        });
    };

    NDDBBrowser.prototype.writeInfo = function(text) {
        if (this.infoTimeout) clearTimeout(this.infoTimeout);
        this.info.innerHTML = text;
        var that = this;
        this.infoTimeout = setTimeout(function(){
            that.info.innerHTML = '';
        }, 2000);
    };

})(node);
/**
 * # NextPreviousState widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Simple widget to step through the stages of the game.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    // TODO: Introduce rules for update: other vs self

    node.widgets.register('NextPreviousState', NextPreviousState);

    // ## Defaults

    NextPreviousState.defaults = {};
    NextPreviousState.defaults.id = 'nextprevious';
    NextPreviousState.defaults.fieldset = { legend: 'Rew-Fwd' };

    // ## Meta-data

    NextPreviousState.version = '0.3.2';
    NextPreviousState.description = 'Adds two buttons to push forward or rewind the state of the game by one step.';

    function NextPreviousState(options) {
        this.id = options.id;
    }

    NextPreviousState.prototype.getRoot = function() {
        return this.root;
    };

    NextPreviousState.prototype.append = function(root) {
        var idRew = this.id + '_button';
        var idFwd = this.id + '_button';

        var rew = node.window.addButton(root, idRew, '<<');
        var fwd = node.window.addButton(root, idFwd, '>>');


        var that = this;

        var updateState = function(state) {
            if (state) {
                var stateEvent = node.IN + node.action.SAY + '.STATE';
                var stateMsg = node.msg.createSTATE(stateEvent, state);
                // Self Update
                node.emit(stateEvent, stateMsg);

                // Update Others
                stateEvent = node.OUT + node.action.SAY + '.STATE';
                node.emit(stateEvent, state, 'ROOM');
            }
            else {
                node.log('No next/previous state. Not sent', 'ERR');
            }
        };

        fwd.onclick = function() {
            updateState(node.game.next());
        };

        rew.onclick = function() {
            updateState(node.game.previous());
        };

        this.root = root;
        return root;
    };

})(node);

/**
 * # Requirements widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Checks a list of requirements and displays the results.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    // ## Defaults

    Requirements.defaults = {};
    Requirements.defaults.id = 'requirements';
    Requirements.defaults.fieldset = { 
        legend: 'Requirements'
    };
    
    // ## Meta-data

    Requirements.version = '0.2.0';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    // ## Dependencies

    Requirements.dependencies = {
        JSUS: {},
        List: {}
    };

    function Requirements(options) {
        // The id of the widget.
        this.id = options.id || Requirements.id;
        // The root element under which the widget will appended.
        this.root = null;
        // Array of all test callbacks.
        this.callbacks = [];
        // Number of tests still pending.
        this.stillChecking = 0;
        // If TRUE, a maximum timeout to the execution of ALL tests is set.
        this.withTimeout = options.withTimeout || true;
        // The time in milliseconds for the timeout to expire.
        this.timeoutTime = options.timeoutTime || 10000;
        // The id of the timeout, if created.
        this.timeoutId = null;

        // Span summarizing the status of the tests.
        this.summary = null;
        // Span counting how many tests have been completed.
        this.summaryUpdate = null;
        // Looping dots to give the user the feeling of code execution.
        this.dots = null;

        // TRUE if at least one test has failed.
        this.hasFailed = false;

        // The outcomes of all tests.
        this.results = [];

        // If true, the final result of the tests will be sent to the server.
        this.sayResults = options.sayResults || false;
        // The label of the SAY message that will be sent to the server.
        this.sayResultsLabel = options.sayResultLabel || 'requirements';
        // Callback to add properties to the result object to send to the server. 
        this.addToResults = options.addToResults || null;

        // Callbacks to be executed at the end of all tests.
        this.onComplete = null;
        this.onSuccess = null;
        this.onFail = null;

        function renderResult(o) {
            var imgPath, img, span, text;
            imgPath = '/images/' + (o.content.success ? 
                                    'success-icon.png' : 'delete-icon.png');
            img = document.createElement('img');
            img.src = imgPath;

            // Might be the full exception object.
            if ('object' === typeof o.content.text) {
                o.content.text = extractErrorMsg(o.content.text);
            }

            text = document.createTextNode(o.content.text);
            span = document.createElement('span');
            span.className = 'requirement';
            span.appendChild(img);
            
            span.appendChild(text);
            return span;
        }
        
        // TODO: simplify render syntax.
        this.list = new W.List({
            render: {
                pipeline: renderResult,
                returnAt: 'first'
            }
        });
    }

    Requirements.prototype.addRequirements = function() {
        var i, len;
        i = -1, len = arguments.length;
        for ( ; ++i < len ; ) {
            if ('function' !== typeof arguments[i]) {
                throw new TypeError('Requirements.addRequirements: ' +
                                    'all requirements must be function.');
            }
            this.callbacks.push(arguments[i]);
        }
    };

    function resultCb(that, i) {
        var update = function(result) {
            that.updateStillChecking(-1);
            if (result) {
                if (!J.isArray(result)) {
                    throw new Error('Requirements.checkRequirements: ' +
                                    'result must be array or undefined.');
                }
                that.displayResults(result);
            }
            if (that.isCheckingFinished()) {
                that.checkingFinished();
            }
        };
        return that.callbacks[i](update);
    }

    function extractErrorMsg(e) {
        var errMsg;
        if (e.msg) {
            errMsg = e.msg;
        }
        else if (e.message) {
            errMsg = e.message;
        }
        else if (e.description) {
            errMsg.description;
        }
        else {
            errMsg = e.toString();
        }
        return errMsg;
    }

    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbErrors, cbName, errMsg;
        if (!this.callbacks.length) {
            throw new Error('Requirements.checkRequirements: no callback ' +
                            'found.');
        }

        this.updateStillChecking(this.callbacks.length, true);

        errors = [];
        i = -1, len = this.callbacks.length;
        for ( ; ++i < len ; ) {
            try {
                cbErrors = resultCb(this, i);
            }
            catch(e) {
                errMsg = extractErrorMsg(e);
                this.updateStillChecking(-1);
                if (this.callbacks[i] && this.callbacks[i].name) { 
                    cbName = this.callbacks[i].name;
                }
                else {
                    cbName = i + 1;
                }
                errors.push('An exception occurred in requirement n.' +
                            cbName + ': ' + errMsg);                            
            }
            if (cbErrors) {
                this.updateStillChecking(-1);
                errors = errors.concat(cbErrors);
            }
        }
        
        if (this.withTimeout) {
            this.addTimeout();
        }

        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }
        
        if (this.isCheckingFinished()) {
            this.checkingFinished();
        }
        
        return errors;
    };
       
    Requirements.prototype.addTimeout = function() {
        var that = this;
        var errStr = 'One or more function is taking too long. This is ' +
            'likely to be due to a compatibility issue with your browser ' +
            'or to bad network connectivity.';

        this.timeoutId = setTimeout(function() {
            if (that.stillChecking > 0) {
                that.displayResults([errStr]);
            }
            that.timeoutId = null;
            that.hasFailed = true;
            that.checkingFinished();
        }, this.timeoutTime);
    };

    Requirements.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    Requirements.prototype.updateStillChecking = function(update, absolute) {
        var total, remaining;

        this.stillChecking = absolute ? update : this.stillChecking + update;

        total = this.callbacks.length;
        remaining = total - this.stillChecking;
        this.summaryUpdate.innerHTML = ' (' +  remaining + ' / ' + total + ')';
    };

            
    Requirements.prototype.isCheckingFinished = function() {  
        return this.stillChecking <= 0;
    };

    Requirements.prototype.checkingFinished = function() {
        var results;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.dots.stop();

        if (this.sayResults) {
            results = {
                userAgent: navigator.userAgent,
                result: this.results
            };

            if (this.addToResults) {
                J.mixin(results, this.addToResults()); 
            }
            node.say(this.sayResultsLabel, 'SERVER', results);
        }

        if (this.onComplete) {
            this.onComplete();
        }
        
        if (this.hasFailed) {
            if (this.onFail) {
                this.onFail();
            }
        }
        else if (this.onSuccess) {
            this.onSuccess();
        }
    };

    Requirements.prototype.displayResults = function(results) {
        var i, len;
        
        if (!this.list) {
            throw new Error('Requirements.displayResults: list not found. ' +
                            'Have you called .append() first?');
        }
        
        if (!J.isArray(results)) {
            throw new TypeError('Requirements.displayResults: results must ' +
                                'be array.');
        }

        // No errors.
        if (!results.length) {
            // Last check and no previous errors.
            if (!this.hasFailed && this.stillChecking <= 0) {
                // All tests passed.
                this.list.addDT({
                    success: true,
                    text:'All tests passed.'
                });
                // Add to the array of results.
                this.results.push('All tests passed.');
            }
        }
        else {
            this.hasFailed = true;
            // Add the errors.
            i = -1, len = results.length;
            for ( ; ++i < len ; ) {
                this.list.addDT({
                    success: false,
                    text: results[i]
                });
                // Add to the array of results.
                this.results.push(results[i]);
            }
        }
        // Parse deletes previously existing nodes in the list.
        this.list.parse();
    };

    Requirements.prototype.append = function(root) {
        this.root = root;
        
        this.summary = document.createElement('span');
        this.summary.appendChild(
            document.createTextNode('Evaluating requirements'));
        
        this.summaryUpdate = document.createElement('span');
        this.summary.appendChild(this.summaryUpdate);
        
        this.dots = W.getLoadingDots();

        this.summary.appendChild(this.dots.span);
        
        root.appendChild(this.summary);
        
        root.appendChild(this.list.getRoot());
        return root;
    };

    Requirements.prototype.getRoot = function() {
        return this.root;
    };

    Requirements.prototype.listeners = function() {
        var that = this;
    };

    Requirements.prototype.nodeGameRequirements = function(result) {
        var errors, db;
        errors = [];
   
        if ('undefined' === typeof NDDB) {
            errors.push('NDDB not found.');
        }
        
        if ('undefined' === typeof JSUS) {
            errors.push('JSUS not found.');
        }
        
        if ('undefined' === typeof node.window) {
            errors.push('node.window not found.');
        }
        
        if ('undefined' === typeof W) {
            errors.push('W not found.');
        }
        
        if ('undefined' === typeof node.widgets) {
            errors.push('node.widgets not found.');
        }
        
        if ('undefined' !== typeof NDDB) {
            try {
                db = new NDDB();
            }
            catch(e) {
                errors.push('An error occurred manipulating the NDDB object: ' +
                            e.message);
            }
        }
        
        // We need to test node.Stager because it will be used in other tests.
        if ('undefined' === typeof node.Stager) {
            errors.push('node.Stager not found.');
        }

        return errors;
    };

    Requirements.prototype.loadFrameTest = function(result) {
        var errors, that, testIframe, root;
        var oldIframe, oldIframeName, oldIframeRoot;
        errors = [];
        that = this;
        oldIframe = W.getFrame();

        if (oldIframe) {
            oldIframeName = W.getFrameName();
            oldIframeRoot = W.getFrameRoot();
            root = W.getIFrameAnyChild(oldIframe);
        }
        else {
            root = document.body;
        }

        try {
            testIframe = W.addIFrame(root, 'testIFrame', {
                style: { display: 'none' } } );
            W.setFrame(testIframe, 'testIframe', root);
            W.loadFrame('/pages/testpage.htm', function() {
                var found;
                found = W.getElementById('root');
                if (oldIframe) {
                    W.setFrame(oldIframe, oldIframeName, oldIframeRoot);
                }
                if (!found) {
                    errors.push('W.loadFrame failed to load a test frame ' +
                                'correctly.');
                }
                root.removeChild(testIframe);
                result(errors);
            });
        }
        catch(e) {
            errors.push('W.loadFrame raised an error: ' + extractErrorMsg(e));
            return errors;
        }        
    };

    

    node.widgets.register('Requirements', Requirements);

})(node);
/**
 * # ServerInfoDisplay widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Displays information about the server.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('ServerInfoDisplay', ServerInfoDisplay);

    // ## Defaults

    ServerInfoDisplay.defaults = {};
    ServerInfoDisplay.defaults.id = 'serverinfodisplay';
    ServerInfoDisplay.defaults.fieldset = {
        legend: 'Server Info',
        id: 'serverinfo_fieldset'
    };

    // ## Meta-data

    ServerInfoDisplay.version = '0.4';

    function ServerInfoDisplay(options) {
        this.id = options.id;

        this.root = null;
        this.div = document.createElement('div');
        this.table = null; //new node.window.Table();
        this.button = null;
    }

    ServerInfoDisplay.prototype.init = function(options) {
        var that = this;
        if (!this.div) {
            this.div = document.createElement('div');
        }
        this.div.innerHTML = 'Waiting for the reply from Server...';
        if (!this.table) {
            this.table = new node.window.Table(options);
        }
        this.table.clear(true);
        this.button = document.createElement('button');
        this.button.value = 'Refresh';
        this.button.appendChild(document.createTextNode('Refresh'));
        this.button.onclick = function(){
            that.getInfo();
        };
        this.root.appendChild(this.button);
        this.getInfo();
    };

    ServerInfoDisplay.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.div);
        return root;
    };

    ServerInfoDisplay.prototype.getInfo = function() {
        var that = this;
        node.get('INFO', function(info) {
            node.window.removeChildrenFromNode(that.div);
            that.div.appendChild(that.processInfo(info));
        });
    };

    ServerInfoDisplay.prototype.processInfo = function(info) {
        this.table.clear(true);
        for (var key in info) {
            if (info.hasOwnProperty(key)){
                this.table.addRow([key,info[key]]);
            }
        }
        return this.table.parse();
    };

    ServerInfoDisplay.prototype.listeners = function() {
        var that = this;
        node.on('PLAYER_CREATED', function(){
            that.init();
        });
    };

})(node);
/**
 * # StateBar widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple interface to change the game stages.
 *
 * TODO: needs refactoring
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    // TODO: Introduce rules for update: other vs self

    node.widgets.register('StateBar', StateBar);

    // ## Defaults

    StateBar.defaults = {};
    StateBar.defaults.id = 'statebar';
    StateBar.defaults.fieldset = { legend: 'Change Game State' };

    // ## Meta-data

    StateBar.version = '0.3.2';
    StateBar.description = 'Provides a simple interface to change the stage of a game.';

    function StateBar(options) {
        this.id = options.id;
        this.recipient = null;
    }

    StateBar.prototype.getRoot = function () {
        return this.root;
    };

    StateBar.prototype.append = function (root) {

        var PREF = this.id + '_';

        var idButton = PREF + 'sendButton',
        idStateSel = PREF + 'stateSel',
        idRecipient = PREF + 'recipient';

        var sendButton = node.window.addButton(root, idButton);
        var stateSel = node.window.addStateSelector(root, idStateSel);
        this.recipient = node.window.addRecipientSelector(root, idRecipient);

        var that = this;

        node.on('UPDATED_PLIST', function() {
            node.window.populateRecipientSelector(that.recipient, node.game.pl);
        });

        sendButton.onclick = function() {

            // Should be within the range of valid values
            // but we should add a check
            var to = that.recipient.value;

            // STATE.STEP:ROUND
            var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;

            var result = parseState.exec(stateSel.value);
            var state, step, round, stateEvent, stateMsg;
            if (result !== null) {
                // Note: not result[0]!
                state = result[1];
                step = result[2] || 1;
                round = result[3] || 1;

                node.log('Parsed State: ' + result.join("|"));

                state = new node.GameStage({
                    state: state,
                    step: step,
                    round: round
                });

                // Self Update
                if (to === 'ROOM') {
                    stateEvent = node.IN + node.action.SAY + '.STATE';
                    stateMsg = node.msg.createSTATE(stateEvent, state);
                    node.emit(stateEvent, stateMsg);
                }

                // Update Others
                stateEvent = node.OUT + node.action.SAY + '.STATE';
                node.emit(stateEvent, state, to);
            }
            else {
                node.err('Not valid state. Not sent.');
                node.socket.sendTXT('E: not valid state. Not sent');
            }
        };

        this.root = root;
        return root;
    };

})(node);

/**
 * # StateDisplay widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display information about the state of a player.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    var Table = node.window.Table,
    GameStage = node.GameStage;

    node.widgets.register('StateDisplay', StateDisplay);

    // ## Meta-data

    StateDisplay.version = '0.5.0';
    StateDisplay.description = 'Display basic info about player\'s status.';

    StateDisplay.title = 'State Display';
    StateDisplay.className = 'statedisplay';

    // ## Dependencies

    StateDisplay.dependencies = {
        Table: {}
    };

    function StateDisplay(options) {
	this.id = options.id;
	this.table = new Table();
    }

    StateDisplay.prototype.append = function() {
	var that, checkPlayerName;
        that = this;
	checkPlayerName = setInterval(function() {
	    if (node.player && node.player.id) {
		clearInterval(checkPlayerName);
		that.updateAll();
	    }
	}, 100);
	this.bodyDiv.appendChild(this.table.table);
    };

    StateDisplay.prototype.updateAll = function() {
	var stage, stageNo, stageId, playerId, tmp, miss;
        miss = '-';

        stageId = miss;
        stageNo = miss;
        playerId = miss;

	if (node.player.id) {
            playerId = node.player.id;
        }

	stage = node.game.getCurrentGameStage();
	if (stage) {
            tmp = node.game.plot.getStep(stage);
            stageId = tmp ? tmp.id : '-';
            stageNo = stage.toString();
        }

	this.table.clear(true);
	this.table.addRow(['Stage  No: ', stageNo]);
	this.table.addRow(['Stage  Id: ', stageId]);
	this.table.addRow(['Player Id: ', playerId]);
	this.table.parse();

    };

    StateDisplay.prototype.listeners = function() {
	var that = this;
	node.on('STEP_CALLBACK_EXECUTED', function() {
	    that.updateAll();
        });
    };

    StateDisplay.prototype.destroy = function() {
        node.off('STEP_CALLBACK_EXECUTED', StateDisplay.prototype.updateAll);
    };
})(node);
/**
 * # VisualState widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next state.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualState', VisualState);

    var JSUS = node.JSUS,
    Table = node.window.Table;

    // ## Meta-data

    VisualState.version = '0.2.1';
    VisualState.description = 'Visually display current, previous and next state of the game.';

    VisualState.title = 'State';
    VisualState.className = 'visualstate';

    // ## Dependencies

    VisualState.dependencies = {
        JSUS: {},
        Table: {}
    };

    function VisualState(options) {
        this.id = options.id;
        this.table = new Table();
    }

    VisualState.prototype.append = function() {
        var that = this;
        var PREF = this.id + '_';
        this.bodyDiv.appendChild(this.table.table);
        this.writeState();
    };

    VisualState.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.writeState();
        });

        // Game over and init?
    };

    VisualState.prototype.writeState = function() {
        var miss, state, pr, nx, tmp;
        var curStep, nextStep, prevStep;
        var t;

        miss = '-';
        state = 'Uninitialized';
        pr = miss;
        nx = miss;

        curStep = node.game.getCurrentGameStage();

        if (curStep) {
            tmp = node.game.plot.getStep(curStep);
            state = tmp ? tmp.id : miss;

            prevStep = node.game.plot.previous(curStep);
            if (prevStep) {
                tmp = node.game.plot.getStep(prevStep);
                pr = tmp ? tmp.id : miss;
            }

            nextStep = node.game.plot.next(curStep);
            if (nextStep) {
                tmp = node.game.plot.getStep(nextStep);
                nx = tmp ? tmp.id : miss;
            }
        }

        this.table.clear(true);

        this.table.addRow(['Previous: ', pr]);
        this.table.addRow(['Current: ', state]);
        this.table.addRow(['Next: ', nx]);

        t = this.table.select('y', '=', 2);
        t.addClass('strong');
        t.select('x','=',0).addClass('underline');
        this.table.parse();
    };

})(node);

/**
 * # VisualTimer widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Display a timer for the game. Timer can trigger events. 
 * Only for countdown smaller than 1h.
 * 
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualTimer', VisualTimer);

    var J = node.JSUS;

    // ## Meta-data

    VisualTimer.version = '0.4.0';
    VisualTimer.description = 'Display a timer for the game. Timer can ' +
        'trigger events. Only for countdown smaller than 1h.';

    VisualTimer.title = 'Time left';
    VisualTimer.className = 'visualtimer';

    // ## Dependencies

    VisualTimer.dependencies = {
        GameTimer : {},
        JSUS: {}
    };

    function VisualTimer(options) {
        this.options = options;
        this.options.update = ('undefined' === typeof this.options.update) ?
            1000 : this.options.update;

        this.id = options.id;

        this.gameTimer = null;
        
        // The DIV in which to display the timer.
        this.timerDiv = null;   

        this.init(this.options);
    }

    VisualTimer.prototype.init = function(options) {
        var t;
        
        J.mixout(options, this.options);

        if (options.hooks) {
            if (!options.hooks instanceof Array) {
                options.hooks = [options.hooks];
            }
        }
        else {
            options.hooks = [];
        }

        options.hooks.push({
            hook: this.updateDisplay,
            ctx: this
        });

        if (!this.gameTimer) {
            this.gameTimer = node.timer.createTimer();
        }
        
        this.gameTimer.init(options);

        if (this.timerDiv) {
            this.timerDiv.className = options.className || '';
        }

        t = this.gameTimer;
        node.session.register('visualtimer', {
            set: function(p) {
                // TODO.
            },
            get: function() {
                return {
                    startPaused: t.startPaused,
	            status: t.status,
                    timeLeft: t.timeLeft,
                    timePassed: t.timePassed,
                    update: t.update,
                    updateRemaining: t.updateRemaining,
                    updateStart: t. updateStart
                };
            }
        });
        
        this.options = options;
    };

    VisualTimer.prototype.append = function() {
        this.timerDiv = node.window.addDiv(this.bodyDiv, this.id + '_div');
        this.updateDisplay();
    };

    VisualTimer.prototype.updateDisplay = function() {
        var time, minutes, seconds;
        if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
            this.timerDiv.innerHTML = '00:00';
            return;
        }
        time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
        time = J.parseMilliseconds(time);
        minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
        seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
        this.timerDiv.innerHTML = minutes + ':' + seconds;
    };

    VisualTimer.prototype.start = function() {
        this.updateDisplay();
        this.gameTimer.start();
    };

    VisualTimer.prototype.restart = function(options) {
        this.init(options);
        this.start();
    };

    VisualTimer.prototype.stop = function(options) {
        if (!this.gameTimer.isStopped()) {
            this.gameTimer.stop();
        }
    };

    VisualTimer.prototype.resume = function(options) {
        this.gameTimer.resume();
    };

    VisualTimer.prototype.setToZero = function() {
        this.stop();
        this.timerDiv.innerHTML = '0:0';
    };
    
    /**
     * ## VisualTimer.doTimeUp
     *
     * Stops the timer and calls the timeup
     *
     * It will call timeup even if the game is paused.
     *
     * @see VisualTimer.stop
     * @see GameTimer.fire
     */
    VisualTimer.prototype.doTimeUp = function() {
        this.stop();
        this.gameTimer.timeLeft = 0;
        this.gameTimer.fire(this.gameTimer.timeup);
    };

    VisualTimer.prototype.listeners = function() {
        var that = this;
        node.on('PLAYING', function() {
            var stepObj, timer, options;
            stepObj = node.game.getCurrentStep();
            if (!stepObj) return;
            timer = stepObj.timer;
            if (timer) {
                options = processOptions(timer, this.options);
                that.gameTimer.init(options);
                that.timerDiv.className = '';
                that.start();
            }
        });

        node.on('REALLY_DONE', function() {
            that.stop();
            that.timerDiv.className = 'strike';
        });

    };

    VisualTimer.prototype.destroy = function() {
        node.timer.destroyTimer(this.gameTimer);
        this.bodyDiv.removeChild(this.timerDiv);
    };

    /**
     * ## processOptions
     *
     * Clones and mixes in user options with current options
     *
     * Return object is transformed accordingly.
     *
     * @param {object} options Configuration options
     * @param {object} curOptions Current configuration of VisualTimer
     * @return {object} Clean, valid configuration object.
     */
    function processOptions(inOptions, curOptions) {
        var options, typeofOptions;
        options = {};
        inOptions = J.clone(inOptions);
        typeofOptions = typeof inOptions;
        switch (typeofOptions) {

        case 'number':
            options.milliseconds = inOptions;
            break;
        case 'object':
            options = inOptions;
            if ('function' === typeof options.milliseconds) {
	        options.milliseconds = options.milliseconds.call(node.game);
	    }
            break;
        case 'function':
            options.milliseconds = inOptions.call(node.game);
            break;
        case 'string':
            options.milliseconds = Number(inOptions);
            break;
        }

        J.mixout(options, curOptions || {});

        if (!options.milliseconds) {
            throw new Error('VisualTimer processOptions: milliseconds cannot ' +
                            'be 0 or undefined.');
        }

        if ('undefined' === typeof options.timeup) {
            options.timeup = 'DONE';
        }
        return options;
    }

})(node);

/**
 * # Wall widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Creates a wall where log and other information is added
 * with a number and timestamp.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('Wall', Wall);

    var JSUS = node.JSUS;

    // ## Defaults

    Wall.defaults = {};
    Wall.defaults.id = 'wall';
    Wall.defaults.fieldset = { legend: 'Game Log' };

    // ## Meta-data

    Wall.version = '0.3';
    Wall.description = 'Intercepts all LOG events and prints them ';
    Wall.description += 'into a DIV element with an ordinal number and a timestamp.';

    // ## Dependencies

    Wall.dependencies = {
        JSUS: {}
    };

    function Wall (options) {
        this.id = options.id || Wall.id;
        this.name = options.name || this.name;
        this.buffer = [];
        this.counter = 0;

        this.wall = node.window.getElement('pre', this.id);
    }

    Wall.prototype.init = function(options) {
        options = options || {};
        this.counter = options.counter || this.counter;
    };

    Wall.prototype.append = function(root) {
        return root.appendChild(this.wall);
    };

    Wall.prototype.getRoot = function() {
        return this.wall;
    };

    Wall.prototype.listeners = function() {
        var that = this;
        node.on('LOG', function(msg) {
            that.debuffer();
            that.write(msg);
        });
    };

    Wall.prototype.write = function(text) {
        if (document.readyState !== 'complete') {
            this.buffer.push(s);
        } else {
            var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
            this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
        }
    };

    Wall.prototype.debuffer = function() {
        if (document.readyState === 'complete' && this.buffer.length > 0) {
            for (var i=0; i < this.buffer.length; i++) {
                this.write(this.buffer[i]);
            }
            this.buffer = [];
        }
    };

})(node);