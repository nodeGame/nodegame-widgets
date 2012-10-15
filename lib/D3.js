(function (exports) {
	
	exports.D3	= D3;
	exports.D3ts = D3ts;
	
	D3.id = 'D3';
	D3.name = 'D3';
	D3.version = '0.1';
	D3.description = 'Real time plots for nodeGame with d3.js';
	
	D3.dependencies = {
		D3: {},	
	};
	
	function D3 (options) {
		
		this.id = options.id || D3.id;
		
		this.root = null;
		
		this.event = options.event || 'D3';
		
		this.svg = null;
		
		this.fieldset = {
			legend: 'D3 plot'
		};
	}
	
	D3.prototype.init = function (options) {};
	
	D3.prototype.append = function (root) {
		this.svg = d3.select(root).append("svg");
		return root;
	};
	
	D3.prototype.listeners = function () {
		node.on(this.event, tick); 
	};
	
	// D3ts
	
	D3ts.id = 'D3ts';
	D3ts.name = 'D3ts';
	D3ts.version = '0.1';
	D3ts.description = 'Time series plot for nodeGame with d3.js';
	
	D3ts.dependencies = {
		D3: {},	
	};
	
	D3ts.prototype.__proto__ = D3.prototype;
	D3ts.prototype.constructor = D3ts;
	
	function D3ts (options) {
		
		this.n = options.n || 40;
		
	    var random = d3.random.normal(0, .2);
	    
	    this.data = d3.range(n).map(random);
	    this.data.splice(0,41);
	
		    
		var margin = {top: 10, right: 10, bottom: 20, left: 40};
		this.margin = margin;
		
		this.width = 960 - margin.left - margin.right,
		this.height = 500 - margin.top - margin.bottom;

		this.x = d3.scale.linear()
		    .domain([0, this.n - 1])
		    .range([0, width]);

		this.y = d3.scale.linear()
		    .domain([0, 1])
		    .range([height, 0]);

		this.line = d3.svg.line()
		    .x(function(d, i) { return this.x(i); })
		    .y(function(d, i) { return this.y(d); });
	}
	
	D3ts.prototype.init = function (options) {
		D3.init.call(this, options);

		// Create the SVG and place it in the middle
		this.svg.attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


		// Line does not go out the axis
		svg.append("defs").append("clipPath")
		    .attr("id", "clip")
		  .append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height);

		// X axis
		svg.append("g")
		    .attr("class", "x axis")
		    .attr("transform", "translate(0," + this.height + ")")
		    .call(d3.svg.axis().scale(x).orient("bottom"));

		// Y axis
		svg.append("g")
		    .attr("class", "y axis")
		    .call(d3.svg.axis().scale(y).orient("left"));

		this.path = svg.append("g")
		    .attr("clip-path", "url(#clip)")
		  .append("path")
		    .data([this.data])
		    .attr("class", "line")
		    .attr("d", line);		
	};
	
	D3ts.prototype.tick = function (value) {

		console.log('tick!');
		// push a new data point onto the back
		data.push([[value]]);

		// redraw the line, and slide it to the left
		this.path
	    	.attr("d", this.line)
	    	.attr("transform", null);

		// pop the old data point off the front
		if (this.data.length > this.n) {
			this.data.shift();
	  
	  		this.path
	  			.transition()
	  			.duration(500)
	  			.ease("linear")
	  			.attr("transform", "translate(" + this.x(-1) + ")");
		}
	};
	
})(node.window.widgets);