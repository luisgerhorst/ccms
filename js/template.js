
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
		
		before(cPath);
		
		if (templateIDs.length >= 1) {
		
			var html = [];
			var loadedViews = {};
			
			var body = $('body');
			var stringifyArray = function (array) {
				var string = '';
				var l = array.length;
				for (var i = 0; i < l; i++) string += array[i] || '';
				return string;
			};
			
			var ready = function () {
				
				body.html(stringifyArray(html));
				
				var isDone = true;
				if (html.length !== templateIDs.length) isDone = false;
				else for (var j = html.length; j--;) if (typeof html[j] !== 'string') isDone = false;
				
				if (isDone) done(loadedViews, cPath);
				
			};
			
			$.each(templateIDs, function(i, templateID) {
				
				var view = views[templateID],
					template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
				
				var type = typeof view;
				if (view === null) type = 'null';
				
				switch (type) {
					case 'function':
						view(function (response) {
							html[i] = Mustache.render(template, response);
							loadedViews[templateID] = response;
							ready();
						}, cPath);
						break;
					case 'object':
						html[i] = Mustache.render(template, view);
						loadedViews[templateID] = view;
						ready();
						break;
					default:
						html[i] = template;
						ready();
						break;
				}
				
			});
			
		}
		
		else done(null, cPath);
	
	};
	
	var load = function () { // called when the path changes
		
		var cPath = currentPath();
		
		for (var i = routes.length; i--;) { // counts down from array.length-1 to 0, this is IMPORTANT to make shure new routes overwrite old routes
			
			var route = routes[i];
			var path = route.path;
			
			var match = function () {
				render(route.templateIDs, route.done, route.before); // render the templates into the body
				i = 0; // stop the loop
			};
			
			var type = typeof path;
			if (path instanceof RegExp) type = 'regexp';
			else if (path instanceof Array) type = 'array';
			else if (path === null) type = 'null';
			
			switch (type) {
				case 'string':
					if (path == cPath) match();
					break;
				case 'regexp':
					if (path.test(cPath)) match();
					break;
				case 'array':
					var l = path.length; // length
					for (var j = 0; j < l; j++) {
						var p = path[j]; // path
						if (typeof p === 'string' && p === cPath) match();
						else if (p instanceof RegExp && p.test(cPath)) match();
					}
					break;
				case 'function':
					if (path(cPath)) match();
					break;
			}
			
		}
		
	};
	
	var addRoute = function (parameter) {
		
		var add = function (obj) {
			
			var Route = function (obj) {
				
				this.path = obj.path || false;
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
		}
		
		else add(parameter);
		
		load();
		
	};
	
	var addView = function (parameter, view) {
		if (typeof parameter === 'object' && typeof view === 'undefined') for (var i in parameter) views[i] = parameter[i];
		else views[parameter] = view;
	}
	
	// Actions
	
	/* url change detection via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js */
	if ('onhashchange' in window) { // event supported?
		window.onhashchange = load;
	}
	else { // event not supported:
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash != hash) {
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
