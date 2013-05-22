var theme = new (function () {
	
	var themePath, themeRoutes, themeViews;
	
	var validateObjectKeys = function (object) {
		
		var validatedObject = {};
		
		for (var key in object) {
			var validatedKey = key.replace('.', '_');
			validatedObject[validatedKey] = object[key];
		}
		
		return validatedObject;
		
	};
	
	var getCurrentPath = function () {
		var url = document.URL;
		url = /#.+$/.test(url) ? url.replace(/^.*#/, '') : '/';
		url = url === '/' ? url : url.replace(/\/$/, '');
		return url;
	};
	
	var getView = function (filename, currentPath, got) {
		
		var view = themeViews[filename];
		
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
	
	var load = function (route, currentPath, loaded) {
		
		var stringify = function (array) {
			var string = '', length = array.length;
			for (var i = 0; i < length; i++) string += array[i] || '';
			return string;
		};
		
		var html = [],
			views = {};
		
		var filenames = route.templates;
		
		var onHTMLUpdate = function () {
			
			var isDone = true;
			for (var j = filenames.length; j--;) if (!html[j]) isDone = false;
			
			if (isDone) loaded({
				html: stringify(html),
				views: views
			});
			
		};
		
		var renderFile = function (i) {
			
			var filename = filenames[i];
			
			var template, view;
			
			var onResponse = function () { if (template && view) {
					
				if (!view.themePath) view.themePath = themePath;
				
				html[i] = Mustache.render(template, view);
				views[filename] = view;
				onHTMLUpdate();
				
			}};
			
			$.ajax({
				url: themePath + '/' + filename,
			}).done(function (res) {
				template = res;
				onResponse();
			}).fail(function () {
				console.log('Template ' + filename + ' could not be loaded.');
				template = '<code>404 Not Found</code>';
				onResponse();
			});
			
			getView(filename, currentPath, function (res) {
				view = res;
				onResponse();
			});
			
		};
		
		for (var i = filenames.length; i--;) renderFile(i);
	
	};
	
	/**
	 * Search a route that matches the current path.
	 */
	
	var searchRoute = function (path) {
		
		var routes = themeRoutes;
		
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
		
		console.log('No route was found. ', routes);
		return {
			templates: ['error/404.html'],
			title: '404 Not Found'
		};
		
	};
	
	var update = function () {
		
		var currentPath = getCurrentPath();
		
		var route = searchRoute(currentPath);
		
		if (typeof route.before === 'function') route.before(currentPath);
		
		if (route.templates) load(route, currentPath, function (loaded) {
			
			$('body').html(loaded.html);
			if (route.title) document.title = Mustache.render(route.title, validateObjectKeys(loaded.views));
			if (route.done) route.done(loaded.views, currentPath);
			
		});
		
		else {
			
			if (route.title) document.title = route.title;
			if (route.done) route.done(null, currentPath);
			
		}
		
	};
	
	this.currentPath = getCurrentPath;
	
	this.setup = function (path, routes, views) {
		
		themePath = typeof path === 'string' ? path : '';
		
		/** @type {Array.<{path, templates, done, before, title}>} */
		themeRoutes = routes instanceof Array ? routes : [];
		
		/** @type {Object.<string, {({Object}|function(string, boolean))}>} */
		themeViews = (views && typeof views === 'object') ? views : {};
		
		update();
		
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
		
		/**
		 * Get the head
		 */
		 
		(function (filename) {
			
			var template, view;
			
			var onResponse = function () { if (template && view) {
				if (!view.themePath) view.themePath = themePath;
				var head = Mustache.render(template, view);
				$('head').html(head);
			}};
			
			$.ajax({
				url: themePath + '/' + filename,
			}).done(function (res) {
				template = res;
				onResponse();
			}).fail(function () {
				console.log('No head.html found.');
			});
			
			getView(filename, null, function (res) {
				view = res;
				onResponse();
			});
			
		})('head.html');
		
	};
	
})();