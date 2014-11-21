/**
 * # NextPreviousState
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Simple widget to step through the stages of the game
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    // TODO: Introduce rules for update: other vs self

    node.widgets.register('NextPreviousState', NextPreviousState);

    // ## Defaults

    NextPreviousState.defaults = {};
    NextPreviousState.defaults.id = 'nextprevious';
    NextPreviousState.defaults.fieldset = { legend: 'Rew-Fwd' };

    // ## Meta-data

    NextPreviousState.version = '0.3.2';
    NextPreviousState.description = 'Adds two buttons to push forward or rewind the state of the game by one step.';

    function NextPreviousState(options) {
        this.id = options.id;
    }

    NextPreviousState.prototype.getRoot = function() {
        return this.root;
    };

    NextPreviousState.prototype.append = function(root) {
        var idRew = this.id + '_button';
        var idFwd = this.id + '_button';

        var rew = node.window.addButton(root, idRew, '<<');
        var fwd = node.window.addButton(root, idFwd, '>>');


        var that = this;

        var updateState = function(state) {
            if (state) {
                var stateEvent = node.IN + node.action.SAY + '.STATE';
                var stateMsg = node.msg.createSTATE(stateEvent, state);
                // Self Update
                node.emit(stateEvent, stateMsg);

                // Update Others
                stateEvent = node.OUT + node.action.SAY + '.STATE';
                node.emit(stateEvent, state, 'ROOM');
            }
            else {
                node.err('No next/previous state. Not sent');
            }
        };

        fwd.onclick = function() {
            updateState(node.game.next());
        };

        rew.onclick = function() {
            updateState(node.game.previous());
        };

        this.root = root;
        return root;
    };

})(node);
