# nodegame-widgets

Collections of useful and reusable javascript / HTML code snippets for nodegame-window.

---

## Usage: node.widgets.append

Loading a widget from a nodeGame game is very easy:

```js

	var options = {};
	var root = W.getElementById('myRoot');

	var wall = node.widgets.append('Wall', root, options);
	
	// or
	
	var wall = node.widgets.get('Wall', options);
	
	// some operations
	
	wall.append(root);
	
	// or
	
	var myCustomWidget = new myCustomWidgets(options);
	node.widgets.append(myCustomWidget, root);
	
```

### First parameter: Widget object or string

This can be either a string representation of one the widgets objects already inside the node.widgets.widgets collections or a new object. In the latter case, the widget is added to the collection (if valid).

### Second parameter: Root element

This parameter is later passed to the ```append``` method of the widget. If no root element was specified, a root is automatically determined through ```node.window.getScreen```. This parameter is obviously absent in ```node.widgets.getWidget```.

### Third parameter: Options

This parameter is optional and its properties vary from widget to widget. Some are widget-independent.

The same fieldset object in the example above can also be passed as one of the properties of the ```options``` object in the ```node.widgets.append``` method. In this case, the latter has highest priority, and can override the fieldset settings of the constructor.

```js
	var wall = node.widgets.append('Wall', root_element, {fieldset: false});
```

#### On event property

A standard javascript event listener ('onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', and 'onmouseover') can be passed as parameter and it is added to the root element of the widget.

```js
		var options = {
			onclick: function () { 
				// do something
			}
		};
	}
```


## Anatomy of node.widgets.append

Each time ```node.widgets.append``` is executed the following operations are performed:

1. Detect whether it is a string or an object
2. Load it from the collection if it is a string
3. Add it to the collection if it is an object
4. Call the ```init``` method
5. Call the ```append``` method
6. Call the ```listeners``` method (if any)
7. Return a reference to the widget object

## How to write a nodeGame widget

In order to preserve encapsulation, a widget should always be wrapped in a self-executing function.

```js
	(function (exports) {
	
	  // register a widget to the global collection
		node.widgets.register('myWidget', myWidget);
	
		function myWidget (options) {
	  		// init
		}
	
		// More code here
	
	})();
```

Widgets must define a number of constants describing their expected behavior, version, dependencies and so on.


```js

	// Encapsulated
	
	myWidget.defaults = {};
	myWidget.defaults.id = 'myWidget';
	
	myWidget.defaults.fieldset = { 
    legend: 'Foo',
    id: 'foo_fieldset',
  };
  
	myWidget.name = 'my cool Widget';
	myWidget.version = '0.3';
	myWidget.description = 'This widget does cool stuff';
	
	myWidget.dependencies = {
		JSUS: {}
	};

	function myWidget (options) {
		// init
	}
	
	// More code here
```

There is a set of methods that a widget *must* implement:

|  **Method**  | **Meaning**                                                                                                                           |
| -------------| --------------------------------------------------------------------------------------------------------------------------------------|
| init         | Initialize the widget object, after the constructor has been called. This method is called everytime a widget needs to be restarted.  |
| append       | Append the widget to a root element and returns it.                                                                                   |
| getRoot      | Returns a pointer to the HTML root element. This is generally the element which gets highlighted if an error occurs.                  |


Some others are *optional*, and nodeGame adds them, if they are missing.

|  **Method**  | **Meaning**                                                                       |
| -------------| ----------------------------------------------------------------------------------|
| listeners    | Define a battery of nodeGame event listeners. This method is called only once.    |
| getAllValues | If the widgets is storing values, this method is suppose to return them all.      |
| highlight    | Highlight the widget in response to particular events.                            |


## Build

You can create a custom nodegame-window build using the make.js file in the bin directory.

```javascript
node make.js build -a // Full build, about 43Kb minified
node make.js build -w msgbar,visualstate -o mywidgets.js // about 4Kb minified
```

## Make help

  Usage: make.js [options] [command]

  Commands:

    clean 
    Removes all files from build folder
    
    build [options] [options]
    Creates a custom build of nodegame-widgets.js

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

  Usage: build [options] [options]

  Options:

    -h, --help           output usage information
    -l, --lib <items>    choose libraries to include
    -A, --analyse        analyse build
    -a, --all            full build of JSUS
    -o, --output <file>  

## License

Copyright (C) 2014 Stefano Balietti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

