
var Template = function () {
	
	var routes = [], views = {};
	
	// Functions
	
	var getCurrentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) {
			url = url.replace(/^.*#/, '').replace(/\/$/, '');
			if (url === '') url = '/';
		} else url = '/';
		return url;
	};
	
	var render = function (templateIDs, done, before, currentPath) {
		
		// Utils
		
		var stringifyArray = function (array) {
			var string = '';
			var l = array.length;
			for (var i = 0; i < l; i++) string += array[i] || '';
			return string;
		};
		
		// Actions
		
		before(currentPath);
		
		var html = {
			order: templateIDs,
			chunks: {}
		};
		var loadedViews = {};
		
		var print = function () {
			
			$('body').html(stringifyArray(html));
			
			var isDone = true;
			for (var j = templateIDs.length; j--;) if (!html[j]) isDone = false;
			if (isDone) done(loadedViews, currentPath);
			
			console.log(html, isDone);
			
		};
		
		for (var i = templateIDs.length; i--;) {
			
			var templateID = templateIDs[i];
			
			console.log(i, templateID);
			
			var view = views[templateID];
			var	template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
			
			var type = view === null ? type = 'null' : typeof view;
			
			switch (type) {
				case 'function':
					view(function (response) {
						html[i] = Mustache.render(template, response);
						loadedViews[templateID] = response;
						print();
					}, currentPath);
					break;
				case 'object':
					html[i] = Mustache.render(template, view);
					loadedViews[templateID] = view;
					print();
					break;
				default:
					html[i] = template;
					print();
			}
			
		}
		
		if (i === 0) done(null, currentPath);
	
	};
	
	var load = function () { // called when the path changes
		
		var currentPath = getCurrentPath();
		
		var i = routes.length;
		
		var match = function (route) {
			render(route.templateIDs, route.done, route.before, currentPath); // render the templates into the body
			i = 0; // stop the loop
		};
		
		for (i; i--;) { // counts down from array.length-1 to 0, this is IMPORTANT to make shure new routes overwrite old routes
			
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
	
	/** url change detection via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js */
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
	
	this.route = function (parameter) {
		
		var add = function (obj) {
			
			var Route = function (obj) {
				
				this.path = obj.path || null;
				this.templateIDs = obj.templates || [];
				this.done = obj.done || function () {};
				this.before = obj.before || function () {};
				
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
	
	this.render = function (parameter, view) {
		
		if (typeof parameter === 'object' && typeof view === 'undefined') for (var i in parameter) views[i] = parameter[i];
		else views[parameter] = view;
		
	};
	
	this.load = load;
	
	this.currentPath = getCurrentPath;
	
};
