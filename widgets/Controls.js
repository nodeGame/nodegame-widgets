(function (node) {
	

	// TODO: handle different events, beside onchange
	
	var Controls = node.widgets.register('Controls');
	var SliderControls = node.widgets.register('Controls.Slider', Controls);
	var RadioControls = node.widgets.register('Controls.Radio', Controls);
	var jQuerySliderControls = node.widgets.register('Controls.jQuerySlider', Controls);
	
	
	// Meta-data
		
	Controls.id = 'controls';
	Controls.name = 'Controls';
	Controls.version = '0.2';
	Controls.description = 'Wraps a collection of user-inputs controls.';
		
	Controls.constructor = function (options) {
		this.options = options;
		this.id = options.id;
		this.root = null;
		
		this.listRoot = null;
		this.fieldset = null;
		this.submit = null;
		
		this.changeEvent = this.id + '_change';
		
		this.init(options);
	}

	Controls.add = function (root, id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.addTextInput(root, id, attributes);
	};
	
	Controls.getItem = function (id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.getTextInput(id, attributes);
	};
	
	Controls.init = function (options) {

		this.hasChanged = false; // TODO: should this be inherited?
		if ('undefined' !== typeof options.change) {
			if (!options.change){
				this.changeEvent = false;
			}
			else {
				this.changeEvent = options.change;
			}
		}
		this.list = new node.window.List(options);
		this.listRoot = this.list.getRoot();
		
		if (!options.features) return;
		if (!this.root) this.root = this.listRoot;
		this.features = options.features;
		this.populate();
	};
	
	Controls.append = function (root) {
		this.root = root;
		var toReturn = this.listRoot;
		this.list.parse();
		root.appendChild(this.listRoot);
		
		if (this.options.submit) {
			var idButton = 'submit_' + this.id;
			if (this.options.submit.id) {
				idButton = this.options.submit.id;
				delete this.options.submit.id;
			}
			this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);
			
			var that = this;
			this.submit.onclick = function() {
				if (that.options.change) {
					node.emit(that.options.change);
				}
			};
		}		
		
		return toReturn;
	};
	
	Controls.parse = function() {
		return this.list.parse();
	};
	
	Controls.populate = function () {
		var that = this;
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					id = attributes.id;
					delete attributes.id;
				}
							
				var container = document.createElement('div');
				// Add a different element according to the subclass instantiated
				var elem = this.add(container, id, attributes);
								
				// Fire the onChange event, if one defined
				if (this.changeEvent) {
					elem.onchange = function() {
						node.emit(that.changeEvent);
					};
				}
				
				if (attributes.label) {
					node.window.addLabel(container, elem, null, attributes.label);
				}
				
				// Element added to the list
				this.list.addDT(container);
			}
		}
	};
	
	Controls.listeners = function() {	
		var that = this;
		// TODO: should this be inherited?
		node.on(this.changeEvent, function(){
			that.hasChanged = true;
		});
				
	};

	Controls.refresh = function() {
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					el.value = this.features[key].value;
					// TODO: set all the other attributes
					// TODO: remove/add elements
				}
				
			}
		}
		
		return true;
	};
	
	Controls.getAllValues = function() {
		var out = {};
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					out[key] = Number(el.value);
				}
				
			}
		}
		
		return out;
	};
	
	Controls.highlight = function (code) {
		return node.window.highlight(this.listRoot, code);
	};
	
	// Sub-classes
	
	// Slider 
	
	SliderControls.__proto__ = node.widgets.get('Controls');
	//SliderControls.prototype.constructor = SliderControls;
	
	SliderControls.id = 'slidercontrols';
	SliderControls.name = 'Slider Controls';
	SliderControls.version = '0.2';
	
	SliderControls.dependencies = {
		Controls: {}
	};
	
	SliderControls.constructor = function  (options) {
		Controls.call(this, options);
	}
	
	SliderControls.add = function (root, id, attributes) {
		return node.window.addSlider(root, id, attributes);
	};
	
	SliderControls.getItem = function (id, attributes) {
		return node.window.getSlider(id, attributes);
	};
	
	// jQuerySlider
//    
//    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
//    //jQuerySliderControls.prototype.constructor = jQuerySliderControls;
//    
//    jQuerySliderControls.id = 'jqueryslidercontrols';
//    jQuerySliderControls.name = 'Experimental: jQuery Slider Controls';
//    jQuerySliderControls.version = '0.13';
//    
//    jQuerySliderControls.dependencies = {
//        jQuery: {},
//        Controls: {}
//    };
//    
//    
//    jQuerySliderControls.constructor = function  (options) {
//        Controls.call(this, options);
//    }
//    
//    jQuerySliderControls.add = function (root, id, attributes) {
//        var slider = jQuery('<div/>', {
//			id: id
//		}).slider();
//	
//		var s = slider.appendTo(root);
//		return s[0];
//	};
//	
//	jQuerySliderControls.getItem = function (id, attributes) {
//		var slider = jQuery('<div/>', {
//			id: id
//			}).slider();
//		
//		return slider;
//	};
//
//
//    ///////////////////////////
//
//	// Radio
//	
//	RadioControls.prototype.__proto__ = Controls.prototype;
//	RadioControls.prototype.constructor = RadioControls;
//	
//	RadioControls.id = 'radiocontrols';
//	RadioControls.name = 'Radio Controls';
//	RadioControls.version = '0.1.1';
//	
//	RadioControls.dependencies = {
//		Controls: {}
//	};
//	
//	RadioControls.constructor = function  (options) {
//		Controls.call(this,options);
//		this.groupName = ('undefined' !== typeof options.name) ? options.name : 
//																node.window.generateUniqueId(); 
//		//alert(this.groupName);
//	}
//	
//	RadioControls.add = function (root, id, attributes) {
//		//console.log('ADDDING radio');
//		//console.log(attributes);
//		// add the group name if not specified
//		// TODO: is this a javascript bug?
//		if ('undefined' === typeof attributes.name) {
////			console.log(this);
////			console.log(this.name);
////			console.log('MODMOD ' + this.name);
//			attributes.name = this.groupName;
//		}
//		//console.log(attributes);
//		return node.window.addRadioButton(root, id, attributes);	
//	};
//	
//	RadioControls.getItem = function (id, attributes) {
//		//console.log('ADDDING radio');
//		//console.log(attributes);
//		// add the group name if not specified
//		// TODO: is this a javascript bug?
//		if ('undefined' === typeof attributes.name) {
////			console.log(this);
////			console.log(this.name);
////			console.log('MODMOD ' + this.name);
//			attributes.name = this.groupName;
//		}
//		//console.log(attributes);
//		return node.window.getRadioButton(id, attributes);	
//	};
//	
//	// Override getAllValues for Radio Controls
//	RadioControls.getAllValues = function() {
//		
//		for (var key in this.features) {
//			if (this.features.hasOwnProperty(key)) {
//				var el = node.window.getElementById(key);
//				if (el.checked) {
//					return el.value;
//				}
//			}
//		}
//		return false;
//	};
	
})(node);