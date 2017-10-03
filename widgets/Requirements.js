/**
 * # Requirements
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Checks a list of requirements and displays the results
 *
 * TODO: see if we need to reset the state between two
 * consecutive calls to checkRequirements (results array).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    node.widgets.register('Requirements', Requirements);

    // ## Meta-data

    Requirements.version = '0.7.0';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    Requirements.title = 'Requirements';
    Requirements.className = 'requirements';

    // ## Dependencies

    Requirements.dependencies = {
        JSUS: {},
        List: {}
    };

    /**
     * ## Requirements constructor
     *
     * Instantiates a new Requirements object
     *
     * @param {object} options
     */
    function Requirements(options) {

        /**
         * ### Requirements.callbacks
         *
         * Array of all test callbacks
         */
        this.requirements = [];

        /**
         * ### Requirements.stillChecking
         *
         * Number of tests still pending
         */
        this.stillChecking = 0;

        /**
         * ### Requirements.withTimeout
         *
         * If TRUE, a maximum timeout to the execution of ALL tests is set
         */
        this.withTimeout = options.withTimeout || true;

        /**
         * ### Requirements.timeoutTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.timeoutTime = options.timeoutTime || 10000;

        /**
         * ### Requirements.timeoutId
         *
         * The id of the timeout, if created
         */
        this.timeoutId = null;

        /**
         * ### Requirements.summary
         *
         * Span summarizing the status of the tests
         */
        this.summary = null;

        /**
         * ### Requirements.summaryUpdate
         *
         * Span counting how many tests have been completed
         */
        this.summaryUpdate = null;

        /**
         * ### Requirements.summaryResults
         *
         * Span displaying the results of the tests
         */
        this.summaryResults = null;

        /**
         * ### Requirements.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### Requirements.hasFailed
         *
         * TRUE if at least one test has failed
         */
        this.hasFailed = false;

        /**
         * ### Requirements.results
         *
         * The outcomes of all tests
         */
        this.results = [];

        /**
         * ### Requirements.completed
         *
         * Maps all tests that have been completed already to avoid duplication
         */
        this.completed = {};

        /**
         * ### Requirements.sayResult
         *
         * If true, the final result of the tests will be sent to the server
         */
        this.sayResults = options.sayResults || false;

        /**
         * ### Requirements.sayResultLabel
         *
         * The label of the SAY message that will be sent to the server
         */
        this.sayResultsLabel = options.sayResultLabel || 'requirements';

        /**
         * ### Requirements.addToResults
         *
         *  Callback to add properties to result object sent to server
         */
        this.addToResults = options.addToResults || null;

        /**
         * ### Requirements.onComplete
         *
         * Callback to be executed at the end of all tests
         */
        this.onComplete = null;

        /**
         * ### Requirements.onSuccess
         *
         * Callback to be executed at the end of all tests
         */
        this.onSuccess = null;

        /**
         * ### Requirements.onFailure
         *
         * Callback to be executed at the end of all tests
         */
        this.onFailure = null;
        
        /**
         * ### Requirements.callbacksExecuted
         *
         * TRUE, the callbacks have been executed
         */
        this.callbacksExecuted = false;

        /**
         * ### Requirements.list
         *
         * `List` to render the results
         *
         * @see nodegame-server/List
         */
        // TODO: simplify render syntax.
        this.list = new W.List({
            render: {
                pipeline: renderResult,
                returnAt: 'first'
            }
        });

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
    }

    // ## Requirements methods

    /**
     * ### Requirements.init
     *
     * Setups the requirements widget
     *
     * Available options:
     *
     *   - requirements: array of callback functions or objects formatted as
     *      { cb: function [, params: object] [, name: string] };
     *   - onComplete: function executed with either failure or success
     *   - onFailure: function executed when at least one test fails
     *   - onSuccess: function executed when all tests succeed
     *   - maxWaitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    Requirements.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('Requirements.init: conf must be object. ' +
                                'Found: ' + conf);
        }
        if (conf.requirements) {
            if (!J.isArray(conf.requirements)) {
                throw new TypeError('Requirements.init: conf.requirements ' +
                                    'must be array or undefined. Found: ' +
                                    conf.requirements);
            }
            this.requirements = conf.requirements;
        }
        if ('undefined' !== typeof conf.onComplete) {
            if (null !== conf.onComplete &&
                'function' !== typeof conf.onComplete) {

                throw new TypeError('Requirements.init: conf.onComplete must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onComplete);
            }
            this.onComplete = conf.onComplete;
        }
        if ('undefined' !== typeof conf.onSuccess) {
            if (null !== conf.onSuccess &&
                'function' !== typeof conf.onSuccess) {

                throw new TypeError('Requirements.init: conf.onSuccess must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onSuccess);
            }
            this.onSuccess = conf.onSuccess;
        }
        if ('undefined' !== typeof conf.onFailure) {
            if (null !== conf.onFailure &&
                'function' !== typeof conf.onFailure) {

                throw new TypeError('Requirements.init: conf.onFailure must ' +
                                    'be function, null or undefined. Found: ' +
                                    conf.onFailure);
            }
            this.onFailure = conf.onFailure;
        }
        if (conf.maxExecTime) {
            if (null !== conf.maxExecTime &&
                'number' !== typeof conf.maxExecTime) {

                throw new TypeError('Requirements.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined. ' +
                                    'Found: ' + conf.maxExecTime);
            }
            this.withTimeout = !!conf.maxExecTime;
            this.timeoutTime = conf.maxExecTime;
        }
    };

    /**
     * ### Requirements.addRequirements
     *
     * Adds any number of requirements to the requirements array
     *
     * Callbacks can be asynchronous or synchronous.
     *
     * An asynchronous callback must call the `results` function
     * passed as input parameter to communicate the outcome of the test.
     *
     * A synchronous callback must return the value immediately.
     *
     * In both cases the return is an array, where every item is an
     * error message. Empty array means test passed.
     *
     * @see this.requirements
     */
    Requirements.prototype.addRequirements = function() {
        var i, len;
        i = -1, len = arguments.length;
        for ( ; ++i < len ; ) {
            if ('function' !== typeof arguments[i] &&
                'object' !== typeof arguments[i] ) {

                throw new TypeError('Requirements.addRequirements: ' +
                                    'requirements must be function or ' +
                                    'object. Found: ' + arguments[i]);
            }
            this.requirements.push(arguments[i]);
        }
    };

    /**
     * ### Requirements.checkRequirements
     *
     * Asynchronously or synchronously checks all registered callbacks
     *
     * Can add a timeout for the max execution time of the callbacks, if the
     * corresponding option is set.
     *
     * Results are displayed conditionally
     *
     * @param {boolean} display If TRUE, results are displayed
     *
     * @return {array} The array containing the errors
     *
     * @see this.withTimeout
     * @see this.requirements
     */
    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbName, errMsg;
        if (!this.requirements.length) {
            throw new Error('Requirements.checkRequirements: no requirements ' +
                            'to check.');
        }

        this.updateStillChecking(this.requirements.length, true);

        errors = [];
        i = -1, len = this.requirements.length;
        for ( ; ++i < len ; ) {
            // Get Test Name.
            if (this.requirements[i] && this.requirements[i].name) {
                cbName = this.requirements[i].name;
            }
            else {
                cbName = i + 1;
            }
            try {
                resultCb(this, cbName, i);
            }
            catch(e) {
                this.hasFailed = true;
                errMsg = extractErrorMsg(e);
                this.updateStillChecking(-1);
                errors.push('An error occurred in requirement n.' +
                            cbName + ': ' + errMsg);
            }
        }

        if (this.withTimeout) this.addTimeout();        

        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }

        if (this.isCheckingFinished()) this.checkingFinished();        

        return errors;
    };

    /**
     * ### Requirements.addTimeout
     *
     * Starts a timeout for the max execution time of the requirements
     *
     * Upon time out results are checked, and eventually displayed.
     *
     * @see this.stillCheckings
     * @see this.withTimeout
     * @see this.requirements
     */
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

    /**
     * ### Requirements.clearTimeout
     *
     * Clears the timeout for the max execution time of the requirements
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ### Requirements.updateStillChecking
     *
     * Updates the number of requirements still running on the display
     *
     * @param {number} update The number of requirements still running, or an
     *   increment as compared to the current value
     * @param {boolean} absolute TRUE, if `update` is to be interpreted as an
     *   absolute value
     *
     * @see this.summaryUpdate
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.updateStillChecking = function(update, absolute) {
        var total, remaining;

        this.stillChecking = absolute ? update : this.stillChecking + update;

        total = this.requirements.length;
        remaining = total - this.stillChecking;
        this.summaryUpdate.innerHTML = ' (' +  remaining + ' / ' + total + ')';
    };

    /**
     * ### Requirements.isCheckingFinished
     *
     * Returns TRUE if all requirements have returned
     *
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.isCheckingFinished = function() {
        return this.stillChecking <= 0;
    };

    /**
     * ### Requirements.checkingFinished
     *
     * Clears up timer and dots, and executes final callbacks accordingly
     *
     * First, executes the `onComplete` callback in any case. Then if no
     * errors have been raised executes the `onSuccess` callback, otherwise
     * the `onFailure` callback.
     *
     * @param {boolean} force If TRUE, the function is executed again,
     *   regardless of whether it was already executed. Default: FALSE
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.checkingFinished = function(force) {
        var results;

        // Sometimes, if all requirements are almost synchronous, it
        // can happen that this function is called twice (from resultCb
        // and at the end of all requirements checkings.
        if (this.callbacksExecuted && !force) return;        
        this.callbacksExecuted = true;
        
        if (this.timeoutId) clearTimeout(this.timeoutId);        

        this.dots.stop();

        if (this.sayResults) {
            results = {
                success: !this.hasFailed,
                results: this.results
            };

            if (this.addToResults) {
                J.mixin(results, this.addToResults());
            }
            node.say(this.sayResultsLabel, 'SERVER', results);
        }

        if (this.onComplete) this.onComplete();
        
        if (this.hasFailed) {
            if (this.onFailure) this.onFailure();
        }
        else if (this.onSuccess) {
            this.onSuccess();
        }
    };

    /**
     * ### Requirements.displayResults
     *
     * Displays the results of the requirements on the screen
     *
     * Creates a new item in the list of results for every error found
     * in the results array.
     *
     * If no error was raised, the results array should be empty.
     *
     * @param {array} results The array containing the return values of all
     *   the requirements
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    Requirements.prototype.displayResults = function(results) {
        var i, len;

        if (!this.list) {
            throw new Error('Requirements.displayResults: list not found. ' +
                            'Have you called .append() first?');
        }

        if (!J.isArray(results)) {
            throw new TypeError('Requirements.displayResults: results must ' +
                                'be array. Found: ' + results);
        }

        // No errors.
        if (!this.hasFailed && this.stillChecking <= 0) {
            // All tests passed.
            this.list.addDT({
                success: true,
                text:'All tests passed.'
            });
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

    Requirements.prototype.append = function() {

        this.summary = document.createElement('span');
        this.summary.appendChild(
            document.createTextNode('Evaluating requirements'));

        this.summaryUpdate = document.createElement('span');
        this.summary.appendChild(this.summaryUpdate);

        this.dots = W.getLoadingDots();
        this.summary.appendChild(this.dots.span);

        this.summaryResults = document.createElement('div');
        this.summary.appendChild(document.createElement('br'));
        this.summary.appendChild(this.summaryResults);


        this.bodyDiv.appendChild(this.summary);
        this.bodyDiv.appendChild(this.list.getRoot());
    };

    Requirements.prototype.listeners = function() {
        var that;
        that = this;
        node.registerSetup('requirements', function(conf) {
            if (!conf) return;
            if ('object' !== typeof conf) {
                node.warn('requirements widget: invalid setup object: ' + conf);
                return;
            }
            // Configure all requirements.
            that.init(conf);
            // Start a checking immediately if requested.
            if (conf.doChecking !== false) that.checkRequirements();

            return conf;
        });
    };

    Requirements.prototype.destroy = function() {
        node.deregisterSetup('requirements');
    };

    // ## Helper methods.

    function resultCb(that, name, i) {
        var req, update, res;

        update = function(success, errors, data) {
            if (that.completed[name]) {
                throw new Error('Requirements.checkRequirements: test ' +
                                'already completed: ' + name);
            }
            that.completed[name] = true;
            that.updateStillChecking(-1);
            if (!success) that.hasFailed = true;

            if ('string' === typeof errors) errors = [ errors ];

            if (errors) {
                if (!J.isArray(errors)) {
                    throw new Error('Requirements.checkRequirements: ' +
                                    'errors must be array or undefined. ' +
                                    'Found: ' + errors);
                }
                that.displayResults(errors);
            }

            that.results.push({
                name: name,
                success: success,
                errors: errors,
                data: data
            });

            if (that.isCheckingFinished()) that.checkingFinished();            
        };

        req = that.requirements[i];
        if ('function' === typeof req) {
            res = req(update);
        }
        else if ('object' === typeof req) {
            res = req.cb(update, req.params || {});
        }
        else {
            throw new TypeError('Requirements.checkRequirements: invalid ' +
                                'requirement: ' + name + '.');
        }
        // Synchronous checking.
        if (res) update(res.success, res.errors, res.data);
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
            errMsg = errMsg.description;
        }
        else {
            errMsg = e.toString();
        }
        return errMsg;
    }

})(node);
