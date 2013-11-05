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
        this.stillChecking = 0;
        this.withTimeout = options.withTimeout || true;
        this.timeoutTime = options.timeoutTime || 10000;
        this.timeoutId = null;

        this.summary = null;
        this.summaryUpdate = null;

        this.onComplete = null;
        this.onSuccess = null;
        this.onFail = null;

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

    function resultCb(that, i) {
        var update = function(result) {
            if (result) {
                if (!J.isArray(result)) {
                    throw new Error('Requirements.checkRequirements: ' +
                                    'result must be array or undefined.');
                }
                that.displayResults(result);
             
            }            
            that.updateStillChecking(-1);
        };
        return that.callbacks[i](update);
    }

    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbErrors;
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
                this.updateStillChecking(-1);
                errors.push('An exception occurred in requirement ' + 
                            (this.callbacks[i].name || 'n.' + i) + ': ' + e );
                
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

        if (this.stillChecking <= 0) {
            this.checkingFinished();
        }
    };
    
    Requirements.prototype.checkingFinished = function() {
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.dots.stop();

        if (this.onComplete) {
            this.onComplete();
        }
            
        if (this.list.size()) {
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
            if (!this.list.size() && this.stillChecking <= 0) {
                // All tests passed.
                this.list.addDT({
                    success: true,
                    text:'All tests passed'
                });
            }
        }
        else {
            // Add the errors.
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
        
        this.summary = document.createElement('span');
        this.summary.appendChild(document.createTextNode('Evaluating requirements'));
        
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

    Requirements.prototype.nodeGameRequirements = function() {
        var errors = [];
   
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
                var db = new NDDB();
            }
            catch(e) {
                errors.push('An error occurred manipulating the NDDB object: ' +
                            e.message);
            }
        }
        
        return errors;
    };


    node.widgets.register('Requirements', Requirements);

})(node);