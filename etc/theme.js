var theme = new (function () {
	
	var Theme = {}, Templates = {};
	
	var validateObjectKeys = function (object) {
		var validatedObject = {};
		for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
		return validatedObject;
	};
	
	var currentPath = function () {
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
	
	var Route = function (route) {
		
		this.path = route.path;
		this.templates = route.templates; // every template will be linked to Templates
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
			
			template.load(function (template) {
				
				html[i] = res.output;
				views[templateName] = res.view;
				routeChunkReceived(html, views, templateNames, callback);
				
			});
			
		})(i);
		
	};
	
	var Template = function (name, viewResource) {
		
		this.name = name;
		this.viewResource = viewResource;
		
	};
	
	Template.prototype.loaded = function (callback) {
		
		var template = this.template, view = this.view;
		
		if (!view.themePath) view.themePath = Theme.path;
		
		callback({
			output: Mustache.render(template, view),
			template: template,
			view: view
		});
		
		// console.log(this);
		
	};
	
	Template.prototype.chunkReceived = function (callback) {
		if (typeof template !== 'undefined' && typeof view !== 'undefined') this.loaded(callback);
	};
	
	Template.prototype.processViewResource = function (callback) {
		
		var view = this.view;
		
		switch (view === null ? type = 'null' : typeof view) {
			case 'function':
				view(callback, Theme.currentPath);
				break;
			case 'object':
				callback(view);
				break;
			default:
				callback({});
		}
		
	};
	
	Template.prototype.load = function (callback) {
		
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
		
		Template.processViewResource(function (view) {
			Template.view = view;
			Template.chunkReceived(callback);
		});
		
	};
	
	/** Search a route that matches the current path. */
	
	Theme.searchRoute = function (path) {
		
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
		
		console.log('No route was found.', Theme.currentPath, routes);
		
	};
	
	Theme.update = function () {
		
		Theme.currentPath = currentPath();
		
		var route = Theme.searchRoute(Theme.currentPath);
		
		if (typeof route.before === 'function') route.before(Theme.currentPath);
		
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
	
	this.currentPath = getCurrentPath;
	
	this.setup = function (path, routes, views) {
		
		Theme.path = typeof path === 'string' ? path : '';
		
		/** @type {Array.<{path, templates, done, before, title}>} */
		Theme.routes = routes instanceof Array ? routes : [];
		
		/** @type {Object.<string, {({Object}|function(string, boolean))}>} */
		Theme.views = (views && typeof views === 'object') ? views : {};
		
		Theme.update();
		
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