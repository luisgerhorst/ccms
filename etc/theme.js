var theme = new (function () {
	
	var Theme = {};
	
	var validateObjectKeys = function (object) {
		var validatedObject = {};
		for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
		return validatedObject;
	};
	
	var getCurrentPath = function () {
		var url = document.URL;
		url = /#.+$/.test(url) ? url.replace(/^.*#/, '') : '/';
		url = url === '/' ? url : url.replace(/\/$/, '');
		return url;
	};
	
	var stringifyArray = function (array) {
		var string = '', length = array.length;
		for (var i = 0; i < length; i++) string += array[i] || '';
		return string;
	};
	
	var getView = function (filename, currentPath, callback) {
		
		var view = Theme.views[filename];
		
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
	
	var fileChunkReceived = function (template, view, callback) {
		
		if (typeof template !== 'undefined' && typeof view !== 'undefined') {
			
			if (!view.themePath) view.themePath = Theme.path;
			
			callback({
				rendered: Mustache.render(template, view),
				template: template,
				view: view
			});
		
		}
		
	};
	
	var loadFile = function (filename, currentPath, callback) {
		
		var template, view;
		
		$.ajax({
			url: Theme.path + '/' + filename,
		}).done(function (res) {
			template = res;
			fileChunkReceived(template, view, callback);
		}).fail(function () {
			console.log('Template ' + filename + ' could not be loaded.');
			template = null;
			fileChunkReceived(template, view, callback);
		});
		
		getView(filename, currentPath, function (res) {
			view = res;
			fileChunkReceived(template, view, callback);
		});
		
	};
	
	var routeChunkReceived = function (html, views, templateNames, callback) {
		
		var isDone = true;
		for (var j = templateNames.length; j--;) if (!html[j]) isDone = false;
		
		if (isDone) callback({
			body: stringifyArray(html),
			views: views
		});
		
	};
	
	var loadRoute = function (route, currentPath, callback) {
		
		var html = [],
			views = {};
		
		var templateNames = route.templates;
		
		for (var i = templateNames.length; i--;) (function (i) {
			
			var templateName = templateNames[i];
			
			loadFile(templateName, currentPath, function (res) {
				
				html[i] = res.rendered;
				views[templateName] = res.view;
				routeChunkReceived(html, views, templateNames, callback);
				
			});
			
		})(i);
	
	};
	
	/** Search a route that matches the current path. */
	
	var searchRoute = function (path) {
		
		var routes = Theme.routes;
		
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
	
	var updateTheme = function () {
		
		var currentPath = getCurrentPath();
		
		var route = searchRoute(currentPath);
		
		if (typeof route.before === 'function') route.before(currentPath);
		
		if (route.templates) loadRoute(route, currentPath, function (loaded) {
			
			$('body').html(loaded.body);
			if (route.title) document.title = Mustache.render(route.title, validateObjectKeys(loaded.views));
			if (route.done) route.done(loaded.views, currentPath);
			
		});
		
		else {
			
			if (route.title) document.title = route.title;
			if (route.done) route.done(null, currentPath);
			
		}
		
	};
	
	var Route = function (route) {
		
		this.path = route.path;
		this.templates = route.template;
		this.title = route.title;
		this.before = route.before;
		this.done = route.done;
		
	};
	
	Route.prototype.chunkReceived = function (html, views, templateNames, callback) {
		
		var isDone = true;
		for (var j = templateNames.length; j--;) if (!html[j]) isDone = false;
		
		if (isDone) callback({
			body: stringifyArray(html),
			views: views
		});
		
	};
	
	Route.prototype.load = function () {
		
		var templates = this.templates;
		
		var html = [],
			views = {};
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(currentPath, function (res) {
				
				html[i] = res.rendered;
				views[templateName] = res.view;
				routeChunkReceived(html, views, templateNames, callback);
				
			});
			
		})(i);
		
	};
	
	var Template = function (name) {
		
		this.name = name;
		
	}
	
	Template.prototype.chunkReceived = function (template, view, callback) {
		
		if (typeof template !== 'undefined' && typeof view !== 'undefined') {
			
			if (!view.themePath) view.themePath = Theme.path;
			
			callback({
				rendered: Mustache.render(template, view),
				template: template,
				view: view
			});
		
		}
		
	};
	
	Template.prototype.load = function () {
		
		var Template = this;
		
		$.ajax({
			url: Theme.path + '/' + Template.name,
		}).done(function (template) {
			Template.template = template;
			Template.chunkReceived(callback);
		}).fail(function () {
			console.log('Template ' + Template.name + ' could not be loaded.');
			Template.template = null;
			Template.chunkReceived(callback);
		});
		
		getView(Template.name, currentPath, function (view) {
			Template.view = view;
			Template.chunkReceived(callback);
		});
		
	};
	
	this.currentPath = getCurrentPath;
	
	this.setup = function (path, routes, views) {
		
		Theme.path = typeof path === 'string' ? path : '';
		
		/** @type {Array.<{path, templates, done, before, title}>} */
		Theme.routes = routes instanceof Array ? routes : [];
		
		/** @type {Object.<string, {({Object}|function(string, boolean))}>} */
		Theme.views = (views && typeof views === 'object') ? views : {};
		
		updateTheme();
		
		/**
		 * URL-change detection
		 * via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
		 */
		
		if ('onhashchange' in window) window.onhashchange = updateTheme;
		else {
			var hash = window.location.hash;
			window.setInterval(function () {
				if (window.location.hash !== hash) {
					hash = window.location.hash;
					updateTheme();
				}
			}, 100);
		}
		
		/**
		 * Get the head
		 */
		 
		loadFile('head.html', getCurrentPath(), function (res) {
			$('head').html(res.rendered);
		});
		
	};
	
})();