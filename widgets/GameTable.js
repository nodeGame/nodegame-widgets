/**
 * # GameTable
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Creates a table that renders in each cell data captured by fired events
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var GameStage = node.GameStage,
    PlayerList = node.PlayerList;

    node.widgets.register('GameTable', GameTable);

    // ## Defaults

    GameTable.defaults = {};
    GameTable.defaults.id = 'gametable';
    GameTable.defaults.fieldset = {
        legend: 'Game Table',
        id: 'gametable_fieldset'
    };

    // ## Meta-data

    GameTable.version = '0.3';

    // ## Dependencies

    GameTable.dependencies = {
        JSUS: {}
    };

    function GameTable (options) {
        this.options = options;
        this.id = options.id;
        this.name = options.name || GameTable.name;

        this.root = null;
        this.gtbl = null;
        this.plist = null;

        this.init(this.options);
    }

    GameTable.prototype.init = function(options) {

        if (!this.plist) this.plist = new PlayerList();

        this.gtbl = new node.window.Table({
            auto_update: true,
            id: options.id || this.id,
            render: options.render
        }, node.game.memory.db);


        this.gtbl.c('state', GameStage.compare);

        this.gtbl.setLeft([]);

        this.gtbl.parse(true);
    };


    GameTable.prototype.addRenderer = function(func) {
        return this.gtbl.addRenderer(func);
    };

    GameTable.prototype.resetRender = function() {
        return this.gtbl.resetRenderer();
    };

    GameTable.prototype.removeRenderer = function(func) {
        return this.gtbl.removeRenderer(func);
    };

    GameTable.prototype.append = function(root) {
        this.root = root;
        root.appendChild(this.gtbl.table);
        return root;
    };

    GameTable.prototype.listeners = function() {
        var that = this;

        node.on.plist(function(msg) {
            if (!msg.data.length) return;

            //var diff = JSUS.arrayDiff(msg.data,that.plist.db);
            var plist = new PlayerList({}, msg.data);
            var diff = plist.diff(that.plist);
            if (diff) {
                //console.log('New Players found');
                //console.log(diff);
                diff.forEach(function(el){that.addPlayer(el);});
            }

            that.gtbl.parse(true);
        });

        node.on('in.set.DATA', function(msg) {

            that.addLeft(msg.state, msg.from);
            var x = that.player2x(msg.from);
            var y = that.state2y(node.game.state, msg.text);

            that.gtbl.add(msg.data, x, y);
            that.gtbl.parse(true);
        });
    };

    GameTable.prototype.addPlayer = function(player) {
        this.plist.add(player);
        var header = this.plist.map(function(el){return el.name;});
        this.gtbl.setHeader(header);
    };

    GameTable.prototype.addLeft = function(state, player) {
        if (!state) return;
        state = new GameStage(state);
        if (!JSUS.in_array({content:state.toString(), type: 'left'},
                    this.gtbl.left)) {

            this.gtbl.add2Left(state.toString());
        }
        // Is it a new display associated to the same state?
        else {
            var y = this.state2y(state);
            var x = this.player2x(player);
            if (this.gtbl.select('y','=',y).select('x','=',x).count() > 1) {
                this.gtbl.add2Left(state.toString());
            }
        }

    };

    GameTable.prototype.player2x = function(player) {
        if (!player) return false;
        return this.plist.select('id', '=', player).first().count;
    };

    GameTable.prototype.x2Player = function(x) {
        if (!x) return false;
        return this.plist.select('count', '=', x).first().count;
    };

    GameTable.prototype.state2y = function(state) {
        if (!state) return false;
        return node.game.plot.indexOf(state);
    };

    GameTable.prototype.y2State = function(y) {
        if (!y) return false;
        return node.game.plot.jumpTo(new GameStage(),y);
    };

})(node);
