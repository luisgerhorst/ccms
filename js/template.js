
var Template = function () {
	
	var routes = [], views = {};
	
	// Functions
	
	var getCurrentPath = function () {
		var url = document.URL;
		url = /#.+$/.test(url) ? url.replace(/^.*#/, '') : '/';
		url = url === '/' ? url : url.replace(/\/$/, '');
		return url;
	};
	
	/**
	 * Receives a route and render's the templates specified in the route.
	 */
	
	var render = function (route, currentPath) {
		
		// Utilities
		
		var stringifyArray = function (array) {
			var string = '';
			var l = array.length;
			for (var i = 0; i < l; i++) string += array[i] || '';
			return string;
		};
		
		// Actions
		
		route.before(currentPath);
		
		var head = function (views) {
			
			var head = route.head,
				render = Mustache.render;
				
			for (var k in head) document[k] = render(head[k], views);
			
		};
		
		var bodyArray = [], loadedViews = {}, templateIDs = route.templateIDs, done = route.done;
		
		var print = function () {
			
			$('body').html(stringifyArray(bodyArray));
			
			var isDone = true;
			for (var j = templateIDs.length; j--;) if (!bodyArray[j]) isDone = false;
			if (isDone) {
				head(loadedViews);
				done(loadedViews, currentPath);
			}
			
		};
		
		for (var i = templateIDs.length; i--;) {
			
			var templateID = templateIDs[i];
			var view = views[templateID];
			var	template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
			
			var type = view === null ? type = 'null' : typeof view;
			
			switch (type) {
				case 'function':
					/**
					 * You have to use an extra function for this.
					 * Otherwise all vars that are used in the callback will already have changed when it's executed.
					 */
					(function (i, templateID, view, template) {
						
						view(function (response) {
							bodyArray[i] = Mustache.render(template, response);
							loadedViews[templateID] = response;
							print();
						}, currentPath);
						
					})(i, templateID, view, template);
					break;
				case 'object':
					bodyArray[i] = Mustache.render(template, view);
					loadedViews[templateID] = view;
					print();
					break;
				default:
					bodyArray[i] = template;
					print();
			}
			
		}
		
		if (!templateIDs.length) done(loadedViews, currentPath);
	
	};
	
	/**
	 * Search a route that matches the current path.
	 */
	
	var load = function () {
		
		var currentPath = getCurrentPath();
		
		var i = routes.length;
		
		var match = function (route) {
			render(route, currentPath);
			i = 0;
		};
		
		for (i; i--;) { // new routes overwrite old routes
			
			var route = routes[i];
			var path = route.path;
			var type = path instanceof RegExp ? 'regexp' : path instanceof Array ? 'array' : typeof path;
			
			switch (type) {
				case 'string':
					if (path == currentPath) match(route);
					break;
				case 'regexp':
					var regexp = path;
					if (regexp.test(currentPath)) match(route);
					break;
				case 'array':
					var array = path;
					for (var j = array.length; j--;) {
						var p = array[j];
						if (typeof p === 'string' && p === currentPath) match(route);
						else if (p instanceof RegExp && p.test(currentPath)) match(route);
					}
					break;
				case 'function':
					var func = path;
					if (func(currentPath)) match(route);
					break;
			}
			
		}
		
	};
	
	// Actions
	
	/**
	 * URL-change detection via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
	 */
	 
	if ('onhashchange' in window) window.onhashchange = load;
	else {
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash !== hash) {
				hash = window.location.hash;
				load();
			}
		}, 100);
	}
	
	// Methods
	
	/**
	 * Add routes.
	 */
	
	this.route = function (parameter) {
		
		var add = function (obj) {
			
			var Route = function (obj) {
				
				this.path = obj.path || null;
				this.templateIDs = obj.templates || [];
				this.done = obj.done || function () {};
				this.before = obj.before || function () {};
				
				this.head = obj.head || [];
				
			};
			
			routes.push(new Route(obj));
			
		};
		
		// Actions
		
		if (parameter instanceof Array) {
			var l = parameter.length;
			for (var i = 0; i < l; i++) add(parameter[i]);
		} else add(parameter);
		
		load();
		
	};
	
	/**
	 * Used to specify a view for a template.
	 */
	
	this.render = function (parameter, view) {
		
		if (typeof parameter === 'object' && typeof view === 'undefined') for (var i in parameter) views[i] = parameter[i];
		else views[parameter] = view;
		
	};
	
	this.load = load();
	
	this.currentPath = getCurrentPath;
	
};
