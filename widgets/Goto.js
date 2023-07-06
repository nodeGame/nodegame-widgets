/**
 * # Goto
 * Copyright(c) 2022 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Creates a simple interface to go to a step in the sequence.
 *
 * www.nodegame.org
 *
 *
 * TODO: Update Style:

 <style>
.goto {
    padding: 0 !important;
    font-size: 12px;
}

.goto select {
    margin-left: 0 !important;
    margin-top: 0 !important;
}
</style>


 */
 (function(node) {

    "use strict";

    node.widgets.register('Goto', Goto);

    // ## Meta-data

    Goto.version = '0.0.1';
    Goto.description = 'Creates a simple interface to move across ' +
                       'steps in the sequence.';

    Goto.title = false;
    Goto.panel = false;
    Goto.className = 'goto';

    /**
     * ## Goto constructor
     *
     * Creates a new instance of Goto
     *
     * @param {object} options Optional. Configuration options.
     *
     * @see Goto.init
     */
    function Goto(options) {
        /**
         * ### Goto.dropdown
         *
         * A callback executed after the button is clicked
         *
         * If it return FALSE, node.done() is not called.
         */
        this.dropdown;
    }

    Goto.prototype.append = function() {
        this.dropdown = node.widgets.append('Dropdown', this.bodyDiv, {
            tag: 'select',
            choices: getSequence(),
            id: 'ng_goto',
            placeholder: 'Go to Step',
            width: '15rem',
            onchange: function(choice, datalist, that) {
                node.game.gotoStep(choice);
            }
        });
    };

    /**
     * ### Goto.disable
     *
     * Disables the widget
     */
    Goto.prototype.disable = function(opts) {
        if (this.disabled) return;
        this.disabled = true;
        this.dropdown.enable();
        this.emit('disabled', opts);
    };

    /**
     * ### Goto.enable
     *
     * Enables the widget
     */
    Goto.prototype.enable = function(opts) {
        if (!this.disabled) return;
        this.disabled = false;
        this.dropdown.disable();
        this.emit('enabled', opts);
    };


    // ## Helper functions.

    function getSequence(seq) {
        var i, j, out, value, vvalue, name, ss;
        out = [];
        seq = seq || node.game.plot.stager.sequence;
        for ( i = 0 ; i < seq.length ; i++) {
            value = (i+1);
            name = seq[i].id;
            for ( j = 0 ; j < seq[i].steps.length ; j++) {
                ss = seq[i].steps.length === 1;
                vvalue = ss ? value : value + '.' + (j+1);
                out.push({
                    value: vvalue,
                    name: vvalue + ' ' +
                         (ss ? name : name + '.' + seq[i].steps[j])
                });
            }
        }
        return out;
    }

})(node);
