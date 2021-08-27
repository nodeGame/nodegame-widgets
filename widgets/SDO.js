/**
 * # SDO
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Displays an interface to measure users' social dominance orientation (S.D.O.)
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('SDO', SDO);

    // ## Meta-data

    SDO.version = '0.3.0';
    SDO.description = 'Displays an interface to measure Social ' +
        'Dominance Orientation (S.D.O.).';

    SDO.title = 'SDO';
    SDO.className = 'SDO';


    var scales = {

        SDO7: [
            // Dominance Sub-Scale.
            'Some groups of people must be kept in their place.',
            'It\'s probably a good thing that certain groups are at the ' +
                'top and other groups are at the bottom.',
            'An ideal society requires some groups to be on top and others ' +
                'to be on the bottom.',
            'Some groups of people are simply inferior to other groups.',
            // Reverse-scored:
            'Groups at the bottom are just as deserving as groups at the top.',
            'No one group should dominate in society.',
            'Groups at the bottom should not have to stay in their place.',
            'Group dominance is a poor principle.',

            // Anti-Egalitarianism Sub-Scale.
            'We should not push for group equality.',
            'We shouldn\'t try to guarantee that every group has the same ' +
                'quality of life.',
            'It is unjust to try to make groups equal.',
            'Group equality should not be our primary goal.',
            // Reverse-scored:
            'We should work to give all groups an equal chance to succeed.',
            'We should do what we can to equalize conditions for ' +
                'different groups.',
            'No matter how much effort it takes, we ought to strive to ' +
                'ensure that all groups have the same chance in life.',
            'Group equality should be our ideal.'
        ],

        SDO16: [
            'Some groups of people are simply inferior to other groups.',
            'In getting what you want, it is sometimes necessary to use ' +
                'force against other groups.',
            'It\'s OK if some groups have more of a chance in life ' +
                'than others.',
            'To get ahead in life, it is sometimes necessary to step on ' +
                'other groups.',
            'If certain groups stayed in their place, we would have ' +
                'fewer problems.',
            'It\'s probably a good thing that certain groups are at the ' +
                'top and other groups are at the bottom.',
            'Inferior groups should stay in their place.',
            'Sometimes other groups must be kept in their place.',

            'It would be good if groups could be equal.',
            'Group equality should be our ideal.',
            'All groups should be given an equal chance in life.',
            'We should do what we can to equalize conditions for different ' +
                'groups.',
            'Increased social equality is beneficial to society.',
            'We would have fewer problems if we treated people more equally.',
            'We should strive to make incomes as equal as possible.',
            'No group should dominate in society.'
        ]
    };

    scales.SDO7s = [
        scales.SDO7[2], scales.SDO7[3], scales.SDO7[5], scales.SDO7[6],
        scales.SDO7[11], scales.SDO7[10], scales.SDO7[13], scales.SDO7[12]
    ];

    // var choices = [
    //     '1 ' + '<hr/>' + 'Strongly Oppose',
    //     '2 ' + '<hr/>' + 'Somewhat Oppose',
    //     '3 ' + '<hr/>' + 'Slightly Oppose',
    //     '4 ' + '<hr/>' + 'Neutral',
    //     '5 ' + '<hr/>' + 'Slightly Favor',
    //     '6 ' + '<hr/>' + 'Somewhat Favor',
    //     '7 ' + '<hr/>' + 'Strongly Favor'
    // ];

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

    SDO.texts = {

        mainText: 'Show how much you favor or oppose each idea below by ' +
        'selecting a number from 1 to 7 on the scale below. <em>You ' +
        'can work quickly, your first feeling is generally best.</em>',
    };

    // ## Dependencies

    SDO.dependencies = {};

    /**
     * ## SDO constructor
     *
     * Creates a new instance of SDO
     *
     * @param {object} options Optional. Configuration options
     * which is forwarded to SDO.init.
     *
     * @see SDO.init
     */
    function SDO() {

        /**
         * ## SDO.sdo
         *
         * The ChoiceTableGroup widget containing the items
         */
        this.sdo = null;

        /**
         * ## SDO.scale
         *
         * The scale used to measure SDO
         *
         * Available methods: SDO16, SDO7, SDO7s (default).
         *
         * References:
         *
         * SDO7
         * Ho et al. (2015). "The nature of social dominance orientation:
         * Theorizing and measuring preferences for intergroup inequality
         * using the new SDO₇ scale".
         * Journal of Personality and Social Psychology. 109 (6): 1003–1028.
         *
         * SDO16
         * Sidanius and Pratto (1999). Social Dominance: An Intergroup
         * Theory of Social Hierarchy and Oppression.
         * Cambridge: Cambridge University Press.
         */
        this.scale = 'SDO7s';

        /**
         * ## SDO.choices
         *
         * The numerical scale used
         */
        this.choices = choices;

        /**
         * ## SDO.header
         *
         * The categorical scale used
         */
        this.header = header;

        /**
         * ### SDO.mainText
         *
         * A text preceeding the SDO scale
         */
        this.mainText = null;
    }

    // ## SDO methods.

    /**
     * ### SDO.init
     *
     * Initializes the widget
     *
     * @param {object} opts Optional. Configuration options.
     */
    SDO.prototype.init = function(opts) {
        opts = opts || {};

        if (opts.scale) {
            if (opts.scale !== 'SDO16' &&
                opts.scale !== 'SDO7' && opts.scale !== 'SDO7s') {

                throw new Error('SDO.init: scale must be SDO16, SDO7, SDO7s ' +
                                'or undefined. Found: ' + opts.scale);
            }

            this.scale = opts.scale;
        }

        if (opts.choices) {
            if (!J.isArray(opts.choices) || opts.choices.length < 2) {
                throw new Error('SDO.init: choices must be an array ' +
                                'of length > 1 or undefined. Found: ' +
                                opts.choices);
            }
            this.choices = opts.choices;
        }

        if (opts.header) {
            if (!J.isArray(opts.header) ||
                opts.header.length !== this.choices.length) {

                throw new Error('SDO.init: header must be an array ' +
                                'of length equal to the number of choices ' +
                                'or undefined. Found: ' + opts.header);
            }
            this.header = opts.header;
        }

        if (opts.mainText) {
            if ('string' !== typeof opts.mainText && opts.mainText !== false) {
                throw new Error('SDO.init: mainText must be string, ' +
                                'false, or undefined. Found: ' + opts.mainText);
            }
            this.mainText = opts.mainText;
        }
    };

    SDO.prototype.append = function() {
        this.sdo = node.widgets.add('ChoiceTableGroup', this.panelDiv, {
            id: this.id || 'SDO_choicetable',
            items: this.getItems(this.scale),
            choices: this.choices,
            mainText: (this.mainText || this.getText('mainText')),
            title: false,
            panel: false,
            requiredChoice: this.required,
            header: this.header
        });
    };

    SDO.prototype.getItems = function() {
        // E.g., ID: SDO7_1.
        var s = this.scale;
        return scales[s].map(function(item, idx) {
            return [ s + '_' + (idx+1), item ];
        });
    };

    SDO.prototype.getValues = function(opts) {
        opts = opts || {};
        return this.sdo.getValues(opts);
    };

    SDO.prototype.setValues = function(opts) {
        opts = opts || {};
        return this.sdo.setValues(opts);
    };

    SDO.prototype.enable = function(opts) {
        return this.sdo.enable(opts);
    };

    SDO.prototype.disable = function(opts) {
        return this.sdo.disable(opts);
    };

    SDO.prototype.highlight = function(opts) {
        return this.sdo.highlight(opts);
    };

    SDO.prototype.unhighlight = function(opts) {
        return this.sdo.unhighlight(opts);
    };

})(node);
