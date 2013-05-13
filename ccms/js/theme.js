var Theme = function (themePath) {
	
	/**
	 * @type {Array.<{path, filenames, done, before, title}>}
	 */
	
	var routes = [];
	
	/**
	 * @type {Object.<string, {({Object}|function(string, boolean))}>}
	 */
	
	var templates = {};
	
	var getCurrentPath = function () {
		var url = document.URL;
		url = /#.+$/.test(url) ? url.replace(/^.*#/, '') : '/';
		url = url === '/' ? url : url.replace(/\/$/, '');
		return url;
	};
	
	var getFile = function (filename, callback) {
		
		$.ajax({
			url: themePath + '/' + filename
		}).done(callback);
		
	};
	
	var getView = function (view, currentPath, callback) {
		
		switch (view === null ? type = 'null' : typeof view) {
			
			case 'function':
				view(callback, currentPath);
				break;
				
			case 'object':
				callback(view);
				break;
				
			default:
				callback({});
				
		}
		
	};
	
	var render = function (route, currentPath) {
		
		route.before(currentPath);
		
		var files = [],
			loadedViews = {};
		
		var filenames = route.filenames,
			body = $('body');
			
		var readyCheck = function () {
			
			var isReady = true;
			for (var j = templateFiles.length; j--;) if (!renderedTemplates[j]) isReady = false;
			
			if (isReady) {
				document.title = Mustache.render(route.title, loadedViews);
				route.done(loadedViews, currentPath);
			}
			
		};
		
		var renderFile = function (i) {
			
			var filename = filenames[i];
			var view = templates[templateFile].view;
			
			getFile(filename, function (file) {
				
				getView(view, currentPath, function (view) {
					
					var stringify = function (array) {
						var string = '';
						var l = array.length;
						for (var i = 0; i < l; i++) string += array[i] || '';
						return string;
					};
					
					renderedTemplates[i] = Mustache.render(template, view);
					readyCheck();
					body.html(stringify(renderedTemplates));
					
				});
				
			});
			
		};
		
		for (var i = templateFiles.length; i--;) {
			
			renderTemplate(i);
			
		}
	
	};
	
	/**
	 * Search a route that matches the current path.
	 */
	
	var searchRoute = function () {
		
		var currentPath = getCurrentPath();
		
		var match = function (route) {
			render(route, currentPath);
			i = 0;
		};
		
		var i = routes.length;
		
		for (i; i--;) { // new routes overwrite old routes
			
			var route = routes[i];
			var path = route.path;
			
			switch (path instanceof RegExp ? 'regexp' : path instanceof Array ? 'array' : typeof path) {
				
				case 'string':
					if (path === currentPath) match(route);
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
	
	
	
	this.currentPath = getCurrentPath;
	
	/**
	 * URL-change detection
	 * via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
	 */
	 
	if ('onhashchange' in window) window.onhashchange = searchRoute;
	else {
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash !== hash) {
				hash = window.location.hash;
				searchRoute();
			}
		}, 100);
	}
	
};





