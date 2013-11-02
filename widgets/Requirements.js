/**
 * # Requirements widget for nodeGame
 * Copyright(c) 2013 Stefano Balietti
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

    Requirements.version = '0.1';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    // ## Dependencies

    Requirements.dependencies = {
        JSUS: {},
        List: {}
    };

    function Requirements(options) {
        this.id = options.id || Requirements.id;
        this.root = null;
        this.callbacks = [];

        function renderResult(o) {
            var imgPath, img, span, text;
            imgPath = '/images/' + (o.content.success ? 
                                    'success-icon.png' : 'delete-icon.png');
            img = document.createElement('img');
            img.src = imgPath;
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

    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbErrors;
        if (!this.callbacks.length) {
            throw new Error('Requirements.checkRequirements: no callback ' +
                            'found.');
        }
        errors = [];
        i = -1, len = this.callbacks.length;
        for ( ; ++i < len ; ) {
            try {
                cbErrors = this.callbacks[i]();
            }
            catch(e) {
                errors.push('An exception occurred in requirement ' + 
                            (this.callbacks[i].name || 'n.' + i) + '.');
            }
            errors = errors.concat(cbErrors);
        }
        
        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }
        return errors;
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
        if (!results.length) {
            // All tests passed.
            this.list.addDT({
                success: true,
                text:'All tests passed'
            });
        }
        else {
            
            i = -1, len = results.length;
            for ( ; ++i < len ; ) {
                this.list.addDT({
                    success: false,
                    text: results[i]
                });
            }
        }
        // Parse deletes previously existing nodes in the list.
        this.list.parse();
    };

    Requirements.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.list.getRoot());
        return root;
    };

    Requirements.prototype.getRoot = function() {
        return this.root;
    };

    Requirements.prototype.listeners = function() {
        var that = this;
    };

    node.widgets.register('Requirements', Requirements);

})(node);