/**
 * # ContentBox
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Displays some content.
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('ContentBox', ContentBox);

    // ## Meta-data

    ContentBox.version = '0.1.0';
    ContentBox.description = 'Simply displays some content';

    ContentBox.title = false;
    ContentBox.panel = false;
    ContentBox.className = 'contentbox';


    // ## Dependencies

    ContentBox.dependencies = {};

    /**
     * ## ContentBox constructor
     *
     */
    function ContentBox() {

        // ### ContentBox.mainText
        // The main text above the content.
        this.mainText = null;

        // ### ContentBox.content
        // Some Content to be displayed.
        this.content = null;
    }

    // ## ContentBox methods
    ContentBox.prototype.init = function(opts) {
        // Set the mainText, if any.
        if ('string' === typeof opts.mainText) {
            this.mainText = opts.mainText;
        }
        else if ('undefined' !== typeof opts.mainText) {
            throw new TypeError('ContentBox.init: mainText must ' +
                                'be string or undefined. Found: ' +
                                opts.mainText);
        }
        // Set the content, if any.
        if ('string' === typeof opts.content) {
            this.content = opts.content;
        }
        else if ('undefined' !== typeof opts.content) {
            throw new TypeError('ContentBox.init: content must ' +
                                'be string or undefined. Found: ' +
                                opts.content);
        }

    };

    ContentBox.prototype.append = function() {
        // MainText.
        if (this.mainText) {
            W.append('span', this.bodyDiv, {
                className: 'contentbox-maintext',
                innerHTML: this.mainText
            });
        }
        // Content.
        if (this.content) {
            W.append('div', this.bodyDiv, {
                className: 'contentbox-content',
                innerHTML: this.content
            });
        }
    };

})(node);
