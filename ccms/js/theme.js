var Theme = function (themePath) {
	
	/**
	 * @type {Array.<{path, filenames, done, before, title}>}
	 */
	
	var routes = [];
	
	/**
	 * @type {Object.<string, {({Object}|function(string, boolean))}>}
	 */
	
	var views = {};
	
	var getCurrentPath = function () {
		var url = document.URL;
		url = /#.+$/.test(url) ? url.replace(/^.*#/, '') : '/';
		url = url === '/' ? url : url.replace(/\/$/, '');
		return url;
	};
	
	var load = function (route, loaded) {
		
		var stringify = function (array) {
			var string = '', length = array.length;
			for (var i = 0; i < length; i++) string += array[i] || '';
			return string;
		};
		
		var html = [],
			loadedViews = {};
		
		var filenames = route.filenames;
		
		var update = function () {
			
			var isDone = true;
			for (var j = filenames.length; j--;) if (!html[j]) isDone = false;
			
			if (isDone) loaded({
				html: stringify(html),
				views: loadedViews
			});
			
		};
		
		var getView = function (filename, got) {
			
			var view = views[filename];
			
			switch (view === null ? type = 'null' : typeof view) {
				case 'function':
					view(got, currentPath);
					break;
				case 'object':
					got(view);
					break;
				default:
					got({});
			}
			
		};
		
		var prozessFile = function (i) {
			
			var filename = filenames[i];
			
			$.ajax({
				url: themePath + '/' + filename,
				dataType: 'text'
			}).done(function (file) {
				
				if (/.html$/.test(filename)) {
					
					getView(filename, function (view) {
						html[i] = Mustache.render(file, view);
						update();
					});
					
				} else if (/.js$/.test(filename)) {
					
					html[i] = '<script type="text/javascript">' + file + '</script>';
					update();
					
				}
				
			});
			
		};
		
		for (var i = filenames.length; i--;) prozessFile(i);
	
	};
	
	/**
	 * Search a route that matches the current path.
	 */
	
	var searchRoute = function (path) {
		
		var i = routes.length;
		
		for (i; i--;) { // new routes overwrite old routes
			
			var route = routes[i];
			
			switch (route.path instanceof RegExp ? 'regexp' : route.path instanceof Array ? 'array' : typeof route.path) {
				
				case 'string':
					if (route.path === path) return route;
					break;
					
				case 'regexp':
					if (route.path.test(path)) return route;
					break;
					
				case 'array':
					var a = route.path;
					for (var j = a.length; j--;) {
						var p = a[j];
						if (typeof p === 'string' && p === path) return route;
						else if (p instanceof RegExp && p.test(path)) return route;
					}
					break;
					
				case 'function':
					if (route.path(path)) return route;
					break;
					
			}
			
		}
		
	};
	
	var update = function () {
		
		var currentPath = getCurrentPath();
		
		var route = searchRoute(currentPath);
		
		if (route.before) route.before(currentPath);
		
		if (route.filenames) load(route, function (loaded) {
			
			$('body').html(loaded.html);
			if (route.title) document.title = Mustache.render(route.title, loaded.views);
			if (route.done) route.done(loaded.views, currentPath);
			
		});
		
		else {
			
			if (route.title) document.title = route.title;
			if (route.done) route.done(null, currentPath);
			
		}
		
	};
	
	this.route = function (param) {
		
		var Route = function (route) {
		
			this.path = route.path;
			this.filenames = route.files;
			this.done = route.done;
			this.before = route.before;
			this.title = route.title;
		
		};
	
		var addRoute = function (route) {
			
			routes.push(new Route(route));
			
		};
		
		var addArray = function (array) {
			
			var l = array.length;
			for (var i = 0; i < l; i++) addRoute(array[i]);
			
		}
		
		// Actions
	
		if (param instanceof Array) addArray(param);
		
		else if (typeof param === 'object') addRoute(param);
	
		update();
	
	};
	
	this.render = function (object_filename, view) {
	
		if (typeof object_filename === 'object' && typeof view === 'undefined') for (var filename in object_filename) views[filename] = parameter[filename];
		else views[object_filename] = view;
	
	};
	
	this.currentPath = getCurrentPath;
	
	/**
	 * URL-change detection
	 * via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
	 */
	 
	if ('onhashchange' in window) window.onhashchange = update;
	else {
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash !== hash) {
				hash = window.location.hash;
				update();
			}
		}, 100);
	}
	
};