/**
 * # GroupMalleability
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' perception of group malleability.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('GroupMalleability', GroupMalleability);

    // ## Meta-data

    GroupMalleability.version = '0.1.0';
    GroupMalleability.description = 'Displays an interface to measure ' +
        'perception for group malleability.';

    GroupMalleability.title = 'Group Malleability';
    GroupMalleability.className = 'group-malleability';


    var items = [
        'As hard as it is to admit, it is impossible to change the ' +
            'central characteristics of nationalities and groups.',
        'Groups that are characterized by extreme and violent traits ' +
            'will never change as these traits are inherently ingrained ' +
            'in their nature.',
        'Groups can sometimes change their outward behavior, but can ' +
            'never change who they really are.',
        'Every nationality or group has a fixed set of beliefs and ' +
            'values that cannot be changed.',
        'Social and political processes can lead to changes in a ' +
            'group\'s values and morality.'
    ];

    var choices = [ 1,2,3,4,5,6,7 ];

    var header = [
        'Strongly Oppose',
        'Somewhat Oppose',
        'Slightly Oppose',
        'Neutral',
        'Slightly Favor',
        'Somewhat Favor',
        'Strongly Favor'
    ];

    GroupMalleability.texts = {

        mainText:
            'Show how much you favor or oppose each idea below by ' +
            'selecting a number from 1 to 7 on the scale below. <em>You ' +
            'can work quickly, your first feeling is generally best.</em>'
    };

    // ## Dependencies

    GroupMalleability.dependencies = {};

    /**
     * ## GroupMalleability constructor
     *
     * Creates a new instance of GroupMalleability
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to GroupMalleability.init.
     *
     * @see GroupMalleability.init
     */
    function GroupMalleability() {

        /**
         * ## GroupMalleability.ct
         *
         * The ChoiceTableGroup widget containing the items
         */
        this.ctg = null;

        /**
         * ## GroupMalleability.choices
         *
         * The numerical scale used
         */
        this.choices = choices;

        /**
         * ## GroupMalleability.header
         *
         * The categorical scale used
         */
        this.header = header;

        /**
         * ### GroupMalleability.mainText
         *
         * A text preceeding the GroupMalleability scale
         */
        this.mainText = null;
    }

    // ## GroupMalleability methods.

    /**
     * ### GroupMalleability.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    GroupMalleability.prototype.init = function(opts) {
        opts = opts || {};

        if (opts.choices) {
            if (!J.isArray(opts.choices) || opts.choices.length < 2) {
                throw new Error('GroupMalleability.init: choices must be an ' +
                                'array of length > 1 or undefined. Found: ' +
                                opts.choices);
            }
            this.choices = opts.choices;
        }

        if (opts.header) {
            if (!J.isArray(opts.header) ||
                opts.header.length !== this.choices.length) {

                throw new Error('GroupMalleability.init: header must be an ' +
                                'array of length equal to the number of ' +
                                'choices or undefined. Found: ' + opts.header);
            }
            this.header = opts.header;
        }

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText && opts.mainText !== false) {
                throw new Error('GroupMalleability.init: mainText must be ' +
                                'string, false, or undefined. Found: ' +
                                opts.mainText);
            }
            this.mainText = opts.mainText;
        }
        else if (opts.mainText !== false) {
             this.mainText = this.getText('mainText');
        }
    };

    GroupMalleability.prototype.append = function() {
        this.ctg = node.widgets.add('ChoiceTableGroup', this.panelDiv, {
            id: this.id || 'groupmalleability_choicetable',
            items: items.map(function(item, i) {
                return [('GM_' + (i+1)), item ];
            }),
            choices: this.choices,
            mainText: this.mainText,
            title: false,
            panel: false,
            requiredChoice: this.required,
            header: this.header
        });
    };

    GroupMalleability.prototype.getValues = function(opts) {
        opts = opts || {};
        return this.ctg.getValues(opts);
    };

    GroupMalleability.prototype.setValues = function(opts) {
        opts = opts || {};
        return this.ctg.setValues(opts);
    };

    GroupMalleability.prototype.enable = function(opts) {
        return this.ctg.enable(opts);
    };

    GroupMalleability.prototype.disable = function(opts) {
        return this.ctg.disable(opts);
    };

    GroupMalleability.prototype.highlight = function(opts) {
        return this.ctg.highlight(opts);
    };

    GroupMalleability.prototype.unhighlight = function(opts) {
        return this.ctg.unhighlight(opts);
    };

})(node);
