var Template = function (themePath) {
	
	var routes = [], views = {}, onRender = {};
	
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
		
		var bodyArray = [],
			loadedViews = {},
			templateIDs = route.templateIDs,
			done = route.done,
			title = route.title;
		
		var print = function () {
			
			$('body').html(stringifyArray(bodyArray));
			
			var isDone = true;
			for (var j = templateIDs.length; j--;) if (!bodyArray[j]) isDone = false;
			
			if (isDone) {
				document.title = Mustache.render(title, loadedViews);
				done(loadedViews, currentPath);
			}
			
		};
		
		for (var i = templateIDs.length; i--;) (function (i) {
			
			var templateID = templateIDs[i];
			var view = views[templateID];
			
			$.ajax({
				url: themePath + '/' + templateID + '.html'
			}).done(function (template) {
				
				switch (view === null ? type = 'null' : typeof view) {
					case 'function':
						var loadView = view;
						loadView(function (view) {
							bodyArray[i] = Mustache.render(template, view);
							loadedViews[templateID] = view;
							print();
							if (onRender[templateID]) onRender[templateID]();
						}, currentPath);
						break;
					case 'object':
						bodyArray[i] = Mustache.render(template, view);
						loadedViews[templateID] = view;
						print();
						if (onRender[templateID]) onRender[templateID]();
						break;
					default:
						bodyArray[i] = template;
						print();
						if (onRender[templateID]) onRender[templateID]();
				}
			
			});
			
		})(i);
		
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
	
	this.currentPath = getCurrentPath;
	
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
				this.title = obj.title || '';
				
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

	this.ready = function (parameter, func) {
		
		if (typeof parameter === 'function' && !func) {
			func = parameter;
			func();
		}
		
		else {
			var templateID = parameter;
			onRender[templateID] = func;
			console.log(onRender);
		}
		
	};
	
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
	
};





