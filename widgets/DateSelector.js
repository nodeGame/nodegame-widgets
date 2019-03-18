// /**
//  * # DateSelector
//  * Copyright(c) 2019 Stefano Balietti
//  * MIT Licensed
//  *
//  * Creates a configurable table where each cell is a selectable choice
//  *
//  * // TODO: register time for each current choice if selectMultiple is on?
//  *
//  * www.nodegame.org
//  */
// (function(node) {
//
//     "use strict";
//
//     node.widgets.register('DateSelector', DateSelector);
//
//     // ## Meta-data
//
//     DateSelector.version = '0.0.1';
//     DateSelector.description = 'Creates a date selector.';
//
//     DateSelector.title = 'false';
//     DateSelector.className = 'dateselector';
//
//     DateSelector.text.months = function() {
//         return [
//             'January',
//             'February',
//             'March',
//             'April',
//             'May',
//             'June',
//             'July',
//             'August',
//             'September',
//             'October',
//             'November',
//             'December'
//         ];
//     };
//
//     // ## Dependencies
//
//     DateSelector.dependencies = {
//         JSUS: {}
//     };
//
//     /**
//      * ## DateSelector constructor
//      *
//      * Creates a new instance of DateSelector
//      *
//      * @param {object} options Optional. Configuration options.
//      *   If a `table` option is specified, it sets it as the clickable
//      *   table. All other options are passed to the init method.
//      */
//     function DateSelector(options) {
//
//         /**
//          * ### DateSelector.months
//          *
//          * The HTML element triggering the listener function when clicked
//          */
//         this.months = null;
//
//         /**
//          * ### DateSelector.days
//          *
//          * The HTML element triggering the listener function when clicked
//          */
//         this.days = null;
//
//         /**
//          * ### DateSelector.years
//          *
//          * The s
//          */
//         this.years = null;
//
//
//         /**
//          * ### DateSelector.mainText
//          *
//          * A text preceeding the date selector
//          */
//         this.mainText = null;
//     }
//
//     // ## DateSelector methods
//
//     /**
//      * ### DateSelector.init
//      *
//      * Initializes the instance
//      *
//      * Available options are:
//      *
//      *
//      * @param {object} options Configuration options
//      */
//     DateSelector.prototype.init = function(options) {
//         var tmp, that;
//         that = this;
//
//     };
//
//
//     /**
//      * ### DateSelector.append
//      *
//      * Implements Widget.append
//      *
//      * Checks that id is unique.
//      *
//      * Appends (all optional):
//      *
//      *   - mainText: a question or statement introducing the choices
//      *   - table: the table containing the choices
//      *   - freeText: a textarea for comments
//      *
//      * @see Widget.append
//      */
//     DateSelector.prototype.append = function() {
//
//         // MainText.
//         if (this.mainText) {
//             this.spanMainText = document.createElement('span');
//             this.spanMainText.className = this.className ?
//                 DateSelector.className + '-maintext' : 'maintext';
//             this.spanMainText.innerHTML = this.mainText;
//             // Append mainText.
//             this.bodyDiv.appendChild(this.spanMainText);
//         }
//
//     };
//
//
//     /**
//      * ### DateSelector.highlight
//      *
//      * Highlights the choice table
//      *
//      * @param {string} The style for the table's border.
//      *   Default '3px solid red'
//      *
//      * @see DateSelector.highlighted
//      */
//     DateSelector.prototype.highlight = function(border) {
//         if (border && 'string' !== typeof border) {
//             throw new TypeError('DateSelector.highlight: border must be ' +
//                                 'string or undefined. Found: ' + border);
//         }
//         if (!this.table || this.highlighted) return;
//         this.table.style.border = border || '3px solid red';
//         this.highlighted = true;
//         this.emit('highlighted', border);
//     };
//
//     /**
//      * ### DateSelector.unhighlight
//      *
//      * Removes highlight from the choice table
//      *
//      * @see DateSelector.highlighted
//      */
//     DateSelector.prototype.unhighlight = function() {
//         if (!this.table || this.highlighted !== true) return;
//         this.table.style.border = '';
//         this.highlighted = false;
//         this.emit('unhighlighted');
//     };
//
//     /**
//      * ### DateSelector.getValues
//      *
//      * Returns the values for current selection and other paradata
//      *
//      * Paradata that is not set or recorded will be omitted
//      *
//      * @param {object} opts Optional. Configures the return value.
//      *   Available optionts:
//      *
//      *   - markAttempt: If TRUE, getting the value counts as an attempt
//      *       to find the correct answer. Default: TRUE.
//      *   - highlight:   If TRUE, if current value is not the correct
//      *       value, widget will be highlighted. Default: FALSE.
//      *   - reset:       If TRUTHY and a correct choice is selected (or not
//      *       specified), then it resets the state of the widgets before
//      *       returning it. Default: FALSE.
//      *
//      * @return {object} Object containing the choice and paradata
//      *
//      * @see DateSelector.verifyChoice
//      * @see DateSelector.reset
//      */
//     DateSelector.prototype.getValues = function(opts) {
//         var obj, resetOpts;
//         opts = opts || {};
//
//         return obj;
//     };
//
//
// })(node);
