/**
 * # InputBox
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a button that if pressed emits node.done()
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('InputBox', InputBox);

    // ## Meta-data

    InputBox.version = '0.0.1';
    InputBox.description = 'Prompt/Validate/Check/Display input from user';

    InputBox.title = 'Enter the Information';
    InputBox.className = 'inputbox';

    InputBox.texts.validationFail = function(w, input) {
        var str;
        str = 'Invalid input';
        if (w.isFloat) str += ': should be a floating point number';
        else if (w.isInt) str += ': should be an integer';
        if (w.min) str += ' &lgt;' + w.min;
        if (w.max) str += ' <' + w.max;
        return str;
    };

    // ## Dependencies

    InputBox.dependencies = {
        JSUS: {}
    };

    /**
     * ## InputBox constructor
     *
     * Creates a new instance of InputBox
     *
     * @param {object} options Optional. Configuration options.
     *   If a `button` option is specified, it sets it as the clickable
     *   button. All other options are passed to the init method.
     *
     * @see InputBox.init
     */
    function InputBox(options) {
        var that;
        that = this;

        this.type = 'number';

        this.action = 'prompt';

        this.input = null;

        this.infoSpan = null;

        this.validateCb = null;

        this.status = '';

        this.failedAttempts = [];
    }

    // ## InputBox methods

    /**
     * ### InputBox.init
     *
     * Initializes the instance
     *
     * @param {object} options Optional. Configuration options
     */
    InputBox.prototype.init = function(options) {
        var tmp;
        options = options || {};

        if (options.validateCb && 'function' !== typeof options.validateCb) {
            throw new TypeError('InputBox.init: validateCb must be function ' +
                                'or undefined. Found: ' + options.validateCb);
        }

        if ('undefined' !== typeof options.min) {
            tmp = J.isNumber(options.min);
            if (tmp === false) {
                throw new TypeError('InputBox.init: min must be number or ' +
                                    'undefined. Found: ' + options.min);
            }
            this.min = tmp;
        }

        if ('undefined' !== typeof options.max) {
            tmp = J.isNumber(options.max);
            if (tmp === false) {
                throw new TypeError('InputBox.init: max must be number or ' +
                                    'undefined. Found: ' + options.max);
            }
            this.max = tmp;
        }

        if ('undefined' !== typeof options.numberType) {
            if (options.numberType === 'float') {
                this.isFloat = true;
       za     }
            else if (options.numberType === 'int') {
                this.isInt = true;
            }
            else {
                throw new TypeError('InputBox.init: numberType must be equal ' +
                                    'to "float" or "int" or undefined. ' +
                                    'Found: ' + options.numberType);
            }
        }


    };

    InputBox.prototype.append = function() {
        var that, input, span;
        that = this;
        span = document.createElement('span');
        input = document.createElement('input');
        input.type = 'text';

        input.onclick = function() {
            var res, v;
            v = input.value;
            if (that.isFloat) res = J.isFloat(v, that.min, that.max);
            else if (that.isFloat) res = J.isInt(v, that.min, that.max);
            else res = J.isNumber(v, that.min, that.max);
            if (!res) {
                res = that.getText('ValidationFail');
                span.innerHTML = res;
                that.status = 'failed';
                that.failedAttempts.push(v);
            }
        };

        this.input = input;
        this.bodyDiv.appendChild(this.input);

    };

    InputBox.prototype.listeners = function() {
        var that = this;

        node.on.data('INPUTBOX_IN', function(msg) {
            // TODO: show it. (if enabled).
            console.log('incoming', msg);
        });
    };

    /**
     * ### InputBox.disable
     *
     * Disables the done button
     */
    InputBox.prototype.disable = function() {
        if (this.input) this.input.disabled = 'disabled';
    };

    /**
     * ### InputBox.enable
     *
     * Enables the done button
     */
    InputBox.prototype.enable = function() {
        if (this.input) this.input.disabled = false;
    };

})(node);
