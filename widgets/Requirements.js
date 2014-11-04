/**
 * # Requirements widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
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

    Requirements.version = '0.5.0';
    Requirements.description = 'Checks a set of requirements and display the ' +
        'results';

    // ## Dependencies

    Requirements.dependencies = {
        JSUS: {},
        List: {}
    };

    /**
     * ## Requirements.
     *
     * Instantiates a new Requirements object
     *
     * @param {object} options
     */
    function Requirements(options) {
        // The id of the widget.
        this.id = options.id || Requirements.id;
        // Array of all test callbacks.
        this.callbacks = [];
        // Number of tests still pending.
        this.stillChecking = 0;
        // If TRUE, a maximum timeout to the execution of ALL tests is set.
        this.withTimeout = options.withTimeout || true;
        // The time in milliseconds for the timeout to expire.
        this.timeoutTime = options.timeoutTime || 10000;
        // The id of the timeout, if created.
        this.timeoutId = null;

        // Span summarizing the status of the tests.
        this.summary = null;
        // Span counting how many tests have been completed.
        this.summaryUpdate = null;
        // Looping dots to give the user the feeling of code execution.
        this.dots = null;

        // TRUE if at least one test has failed.
        this.hasFailed = false;

        // The outcomes of all tests.
        this.results = [];

        // If true, the final result of the tests will be sent to the server.
        this.sayResults = options.sayResults || false;
        // The label of the SAY message that will be sent to the server.
        this.sayResultsLabel = options.sayResultLabel || 'requirements';
        // Callback to add properties to the result object to send to the server.
        this.addToResults = options.addToResults || null;

        // Callbacks to be executed at the end of all tests.
        this.onComplete = null;
        this.onSuccess = null;
        this.onFail = null;

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

        // TODO: simplify render syntax.
        this.list = new W.List({
            render: {
                pipeline: renderResult,
                returnAt: 'first'
            }
        });
    }

    /**
     * ## Requirements.addRequirements
     *
     * Adds any number of callbacks checking the requirements
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
     * @see this.callbacks
     */
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

    /**
     * ## Requirements.checkRequirements
     *
     * Asynchrounsly or synchrounsly checks all registered callbacks
     *
     * Can add a timeout for the max execution time of the callbacks, if the
     * corresponding option is set.
     *
     * Results are displayed conditionally
     *
     * @param {boolean} display If TRUE, results are displayed.
     * @return {errors} The array containing the errors
     *
     * @see this.withTimeout
     * @see this.callbacks
     */
    Requirements.prototype.checkRequirements = function(display) {
        var i, len;
        var errors, cbErrors, cbName, errMsg;
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
                errMsg = extractErrorMsg(e);
                this.updateStillChecking(-1);
                if (this.callbacks[i] && this.callbacks[i].name) {
                    cbName = this.callbacks[i].name;
                }
                else {
                    cbName = i + 1;
                }
                errors.push('An exception occurred in requirement n.' +
                            cbName + ': ' + errMsg);
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

        if (this.isCheckingFinished()) {
            this.checkingFinished();
        }

        return errors;
    };

    /**
     * ## Requirements.addTimeout
     *
     * Starts a timeout for the max execution time of the callbacks
     *
     * Upon time out results are checked, and eventually displayed.
     *
     * @see this.stillCheckings
     * @see this.withTimeout
     * @see this.callbacks
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
     * ## Requirements.clearTimeout
     *
     * Clears the timeout for the max execution time of the callbacks
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.callbacks
     */
    Requirements.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ## Requirements.updateStillChecking
     *
     * Updates the number of callbacks still running on the display
     *
     * @param {number} The number of callbacks still running, or an increment
     *   as compared to the current value
     * @param {boolean} absolute TRUE, if `update` is to be interpreted as an
     *   absolute value
     *
     * @see this.summaryUpdate
     * @see this.stillCheckings
     * @see this.callbacks
     */
    Requirements.prototype.updateStillChecking = function(update, absolute) {
        var total, remaining;

        this.stillChecking = absolute ? update : this.stillChecking + update;

        total = this.callbacks.length;
        remaining = total - this.stillChecking;
        this.summaryUpdate.innerHTML = ' (' +  remaining + ' / ' + total + ')';
    };

    /**
     * ## Requirements.isCheckingFinished
     *
     * Returns TRUE, if all callbacks have returned
     *
     * @see this.stillCheckings
     * @see this.callbacks
     */
    Requirements.prototype.isCheckingFinished = function() {
        return this.stillChecking <= 0;
    };

    /**
     * ## Requirements.CheckingFinished
     *
     * Cleans up timer and dots, and executes final callbacks accordingly
     *
     * First, executes the `onComplete` callback in any case. Then if no
     * errors have been raised executes the `onSuccess` callback, otherwise
     * the `onFail` callback.
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFail
     * @see this.stillCheckings
     * @see this.callbacks
     */
    Requirements.prototype.checkingFinished = function() {
        var results;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.dots.stop();

        if (this.sayResults) {
            results = {
                userAgent: navigator.userAgent,
                result: this.results
            };

            if (this.addToResults) {
                J.mixin(results, this.addToResults());
            }
            node.say(this.sayResultsLabel, 'SERVER', results);
        }

        if (this.onComplete) {
            this.onComplete();
        }

        if (this.hasFailed) {
            if (this.onFail) this.onFail();
        }
        else if (this.onSuccess) {
            this.onSuccess();
        }
    };

    /**
     * ## Requirements.displayResults
     *
     * Displays the results of the callbacks on the screen
     *
     * Creates a new item in the list of results for every error found
     * in the results array.
     *
     * If no error was raised, the results array should be empty.
     *
     * @param {array} results The array containing the return values of all
     *   the callbacks
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFail
     * @see this.stillCheckings
     * @see this.callbacks
     */
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
            if (!this.hasFailed && this.stillChecking <= 0) {
                // All tests passed.
                this.list.addDT({
                    success: true,
                    text:'All tests passed.'
                });
                // Add to the array of results.
                this.results.push('All tests passed.');
            }
        }
        else {
            this.hasFailed = true;
            // Add the errors.
            i = -1, len = results.length;
            for ( ; ++i < len ; ) {
                this.list.addDT({
                    success: false,
                    text: results[i]
                });
                // Add to the array of results.
                this.results.push(results[i]);
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

        this.bodyDiv.appendChild(this.summary);

        this.bodyDiv.appendChild(this.list.getRoot());
    };

    Requirements.prototype.listeners = function() {};

    // ## Default Requirement Functions

    /**
     * ## Requirements.nodeGameRequirements
     *
     * Checks whether the basic dependencies of nodeGame are satisfied
     *
     * @param {function} The asynchronous result function
     * @return {array} errors Array of synchronous errors
     */
    Requirements.prototype.nodeGameRequirements = function(result) {
        var errors, db;
        errors = [];

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
                db = new NDDB();
            }
            catch(e) {
                errors.push('An error occurred manipulating the NDDB object: ' +
                            e.message);
            }
        }

        // We need to test node.Stager because it will be used in other tests.
        if ('undefined' === typeof node.Stager) {
            errors.push('node.Stager not found.');
        }

        return errors;
    };

    /**
     * ## Requirements.loadFrameTest
     *
     * Checks whether the iframe can be created and used
     *
     * Requires an active connection.
     *
     * @param {function} The asynchronous result function
     * @return {array} errors Array of synchronous errors
     */
    Requirements.prototype.loadFrameTest = function(result) {
        var errors, that, testIframe, root;
        var oldIframe, oldIframeName, oldIframeRoot;
        errors = [];
        that = this;
        oldIframe = W.getFrame();

        if (oldIframe) {
            oldIframeName = W.getFrameName();
            oldIframeRoot = W.getFrameRoot();
            root = W.getIFrameAnyChild(oldIframe);
        }
        else {
            root = document.body;
        }

        try {
            testIframe = W.addIFrame(root, 'testIFrame', {
                style: { display: 'none' } } );
            W.setFrame(testIframe, 'testIframe', root);
            W.loadFrame('/pages/testpage.htm', function() {
                var found;
                found = W.getElementById('root');
                if (oldIframe) {
                    W.setFrame(oldIframe, oldIframeName, oldIframeRoot);
                }
                if (!found) {
                    errors.push('W.loadFrame failed to load a test frame ' +
                                'correctly.');
                }
                root.removeChild(testIframe);
                result(errors);
            });
        }
        catch(e) {
            errors.push('W.loadFrame raised an error: ' + extractErrorMsg(e));
            return errors;
        }
    };

    // ## Helper methods

    function resultCb(that, i) {
        var update = function(result) {
            that.updateStillChecking(-1);
            if (result) {
                if (!J.isArray(result)) {
                    throw new Error('Requirements.checkRequirements: ' +
                                    'result must be array or undefined.');
                }
                that.displayResults(result);
            }
            if (that.isCheckingFinished()) {
                that.checkingFinished();
            }
        };
        return that.callbacks[i](update);
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
            errMsg.description;
        }
        else {
            errMsg = e.toString();
        }
        return errMsg;
    }

    node.widgets.register('Requirements', Requirements);

})(node);
