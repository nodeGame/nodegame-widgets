(function (node) {
	
	node.widgets.register('VisualTimer', VisualTimer);
	
	var JSUS = node.JSUS;
	
// ## Meta-data
	
	VisualTimer.id = 'visualtimer';
	VisualTimer.name = 'Visual Timer';
	VisualTimer.version = '0.3.3';
	VisualTimer.description = 'Display a timer for the game. Timer can trigger events. Only for countdown smaller than 1h.';
	
// ## Dependencies
	
	VisualTimer.dependencies = {
		GameTimer : {},
		JSUS: {}
	};
	
	function VisualTimer (options) {
		this.options = options;
		this.id = options.id;

		this.gameTimer = null;
		
		this.timerDiv = null;	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = {
						legend: 'Time left',
						id: this.id + '_fieldset'
		};
		
		this.init(this.options);
	}
	
	VisualTimer.prototype.init = function (options) {
		options = options || this.options;
		var that = this;
		(function initHooks() {
			if (options.hooks) {
				if (!options.hooks instanceof Array) {
					options.hooks = [options.hooks];
				}
			}
			else {
				options.hooks = [];
			}
			
			options.hooks.push({hook: that.updateDisplay,
								ctx: that
			});
		})();
		
		
		this.gameTimer = (options.gameTimer) || new node.GameTimer();
		
		if (this.gameTimer) {
			this.gameTimer.init(options);
		}
		else {
			node.log('GameTimer object could not be initialized. VisualTimer will not work properly.', 'ERR');
		}
		
		if (this.timerDiv) {
			this.timerDiv.className = options.className || '';
		}
		
	};
	
	VisualTimer.prototype.getRoot = function () {
		return this.root;
	};
	
	VisualTimer.prototype.append = function (root) {
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
		this.updateDisplay();
		return root;	
	};
	
	VisualTimer.prototype.updateDisplay = function () {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
			this.timerDiv.innerHTML = '00:00';
			return;
		}
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		var minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
		var seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
		this.timerDiv.innerHTML = minutes + ':' + seconds;
	};
	
	VisualTimer.prototype.start = function() {
		this.updateDisplay();
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.restart = function (options) {
		this.init(options);
		this.start();
	};
	
	VisualTimer.prototype.stop = function (options) {
		this.gameTimer.stop();
	};
	
	VisualTimer.prototype.resume = function (options) {
		this.gameTimer.resume();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		node.on('LOADED', function() {
			var timer = node.game.gameLoop.getAllParams(node.game.gameState).timer;
			if (timer) {
				timer = JSUS.clone(timer);
				that.timerDiv.className = '';
				var options = {},
					typeoftimer = typeof timer; 
				switch (typeoftimer) {
				
					case 'number':
						options.milliseconds = timer;
						break;
					case 'object':
						options = timer;
						break;
					case 'function':
						options.milliseconds = timer
						break;
					case 'string':
						options.milliseconds = Number(timer);
						break;
				};
			
				if (!options.milliseconds) return;
			
				if ('function' === typeof options.milliseconds) {
					options.milliseconds = options.milliseconds.call(node.game);
				}
				
				if (!options.timeup) {
					options.timeup = 'DONE';
				}
				
				that.gameTimer.init(options);
				that.start();
			}
		});
		
		node.on('DONE', function() {
			// TODO: This should be enabled again
			that.gameTimer.stop();
			that.timerDiv.className = 'strike';
		});
	};
	
})(node);