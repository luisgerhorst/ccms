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
			for (var j = filenames.length; j--;) if (!files[j]) isDone = false;
			
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
				url: themePath + '/' + filename
			}).done(function (file) {
				
				if (/.html$/.test(filename)) {
					
					getView(filename, function (view) {
						html[i] = Mustache.render(template, view);
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
	
	this.currentPath = getCurrentPath;
	
	var pathChange = function () {
		
		var currentPath = getCurrentPath();
		
		var route = searchRoute(currentPath);
		
		route.before(currentPath);
		
		load(route, function (loaded) {
			
			document.title = Mustache.render(route.title, loaded.views);
			$('body').html(loaded.html);
			
			route.done(loaded.views, currentPath);
			
		});
		
	};
	
	/**
	 * URL-change detection
	 * via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
	 */
	 
	if ('onhashchange' in window) window.onhashchange = pathChange;
	else {
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash !== hash) {
				hash = window.location.hash;
				pathChange();
			}
		}, 100);
	}
	
};