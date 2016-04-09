/**
 * # DoneButton
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates a button that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('DoneButton', DoneButton);

    // ## Meta-data

    DoneButton.version = '0.1.0';
    DoneButton.description = 'Creates a button that if ' +
        'pressed emits node.done().';

    DoneButton.title = 'Done Button';
    DoneButton.className = 'donebutton';

    DoneButton.text = 'I am done';

    // ## Dependencies

    DoneButton.dependencies = {
        JSUS: {}
    };

    /**
     * ## DoneButton constructor
     *
     * `DoneButton` displays and manages a `GameTimer`
     *
     * @param {object} options Optional. Configuration options
     * The options it can take are:
     *
     *   - `button`
     *
     */
    function DoneButton(options) {
        var that;
        that = this;

        /**
         * ### DoneButton.button
         *
         * The HTML element triggering node.done() when pressed
         */
        if ('object' === typeof options.button) {
            this.button = options.button;
        }
        else if ('undefined' === typeof options.button) {
            this.button = document.createElement('input');
            this.button.type = 'button';
        }
        else {
            throw new TypeError('DoneButton constructor: options.button must ' +
                                'be object or undefined. Found: ' +
                                options.button);
        }

        this.button.onclick = function() {
            var res;
            res = node.done();
            if (res) that.disable();
        };

        this.init(options);
    }

    // ## DoneButton methods

    /**
     * ### DoneButton.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     * - id: id of the HTML button, or false to have none. Default:
     *     DoneButton.className
     * - className: the className of the button (string, array), or false
     *     to have none. Default bootstrap classes: 'btn btn-lg btn-primary'
     * - text: the text on the button. Default: DoneButton.text
     *
     * @param {object} options Optional. Configuration options
     */
    DoneButton.prototype.init = function(options) {
        var tmp;
        options = options || {};

        //Button
        if ('undefined' === typeof options.id) {
            tmp = DoneButton.className;
        }
        else if ('string' === typeof options.id) {
            tmp = options.id;
        }
        else if (false === options.id) {
            tmp = '';
        }
        else {
            throw new TypeError('DoneButton.init: options.id must ' +
                                'be string, false, or undefined. Found: ' +
                                options.id);
        }
        this.button.id = tmp;

        // Button className.
        if ('undefined' === typeof options.className) {
            tmp  = 'btn btn-lg btn-primary';
        }
        else if (options.className === false) {
            tmp = '';
        }
        else if ('string' === typeof options.className) {
            tmp = options.className;
        }
        else if (J.isArray(options.className)) {
            tmp = options.className.join(' ');
        }
        else  {
            throw new TypeError('DoneButton.init: options.className must ' +
                                'be string, array, or undefined. Found: ' +
                                options.className);
        }
        this.button.className = tmp;


        // Button text.
        if ('undefined' === typeof options.text) {
            tmp = DoneButton.text;
        }
        else if ('string' === typeof options.text) {
            tmp = text;
        }
        else  {
            throw new TypeError('DoneButton.init: options.text must ' +
                                'be string or undefined. Found: ' +
                                options.text);
        }
        this.button.value = tmp;

    };

    DoneButton.prototype.append = function() {
        this.bodyDiv.appendChild(this.button);
    };

    DoneButton.prototype.listeners = function() {
        var that = this;

        node.on('PLAYING', function() {
            var prop, step;
            step = node.game.getCurrentGameStage();
            prop = node.game.plot.getProperty(step, 'donebutton');
            if (prop === false || prop && prop.enableOnPlaying === false) {
                return;
            }
            that.enable();
        });
    };

    /**
     * ### DoneButton.disable
     *
     * Disables the done button
     */
    DoneButton.prototype.disable = function() {
        this.button.disabled = 'disabled';
    };

    /**
     * ### DoneButton.enable
     *
     * Enables the done button
     */
    DoneButton.prototype.enable = function() {
        this.button.disabled = false;
    };

})(node);
