
var Template = function () {
	
	var currentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) {
			url = url.replace(/^.*#/, '').replace(/\/$/, '');
			if (url === '') url = '/';
		} else url = '/';
		return url;
	};
	
	var routes = [];
	var views = {};
	
	var render = function (templateIDs, done, before) {
		
		var cPath = currentPath();
		
		if (before) before(cPath);
		
		if (templateIDs) {
		
			var html = [];
			var loadedViews = {};
			
			var stringifyArray = function (array) {
				var string = '';
				var l = array.length;
				for (var i = 0; i < l; i++) string += array[i] || '';
				return string;
			};
			
			var print = function () {
				
				$('body').html(stringifyArray(html));
				
				var isDone = true;
				if (html.length !== templateIDs.length) isDone = false;
				else for (var j = html.length; j--;) if (typeof html[j] !== 'string') isDone = false;
				
				if (isDone) done(loadedViews, cPath);
				
			};
			
			$.each(templateIDs, function(i, templateID) {
				
				var view = views[templateID];
				var	template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
				var type = view === null ? type = 'null' : typeof view;
				
				switch (type) {
					case 'function':
						view(function (response) {
							html[i] = Mustache.render(template, response);
							loadedViews[templateID] = response;
							print();
						}, cPath);
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
				
			});
			
		}
		
		else if (done) done(null, cPath);
	
	};
	
	var load = function () { // called when the path changes
		
		var cPath = currentPath();
		
		var i = routes.length
		
		var match = function (route) {
			render(route.templateIDs, route.done, route.before); // render the templates into the body
			i = 0; // stop the loop
		};
		
		for (i; i--;) { // counts down from array.length-1 to 0, this is IMPORTANT to make shure new routes overwrite old routes
			
			var route = routes[i];
			var path = route.path;
			var type = path instanceof RegExp ? 'regexp' : path instanceof Array ? 'array' : typeof path;
			
			switch (type) {
				case 'string':
					if (path == cPath) match(route);
					break;
				case 'regexp':
					var regexp = path;
					if (regexp.test(cPath)) match(route);
					break;
				case 'array':
					var array = path;
					for (var j = array.length; j--;) {
						var p = array[j];
						if (typeof p === 'string' && p === cPath) match(route);
						else if (p instanceof RegExp && p.test(cPath)) match(route);
					}
					break;
				case 'function':
					var func = path;
					if (func(cPath)) match(route);
					break;
			}
			
		}
		
	};
	
	var addRoute = function (parameter) {
		
		var add = function (obj) {
			
			var Route = function (obj) {
				
				this.path = obj.path;
				this.templateIDs = obj.templates;
				this.done = obj.done;
				this.before = obj.before;
				
			};
			
			routes.push(new Route(obj));
			
		};
		
		// Actions
		
		if (parameter instanceof Array) {
			var l = parameter.length;
			for (var i = 0; i < l; i++) add(parameter[i]);
		}
		
		else add(parameter);
		
		load();
		
	};
	
	var addView = function (parameter, view) {
		if (typeof parameter === 'object' && typeof view === 'undefined') for (var i in parameter) views[i] = parameter[i];
		else views[parameter] = view;
	}
	
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
	
	this.load = load;
	this.route = addRoute;
	this.render = addView;
	this.currentPath = currentPath;
	
};
