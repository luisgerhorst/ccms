var theme = new (function () {
	
	var Theme = this;
	
	var log = false,
		templates = {},
		routes = [],
		themePath = '';
	
	var validateObjectKeys = function (object) {
		var validatedObject = {};
		for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
		return validatedObject;
	};
	
	var currentPath = function () {
		var path = document.URL;
		path = /#.+$/.test(path) ? path.replace(/^.*#/, '') : '/';
		path = path === '/' ? path : path.replace(/\/$/, '');
		return path;
	};
	
	var stringifyArray = function (array) {
		var string = '', length = array.length;
		for (var i = 0; i < length; i++) string += array[i] || '';
		return string;
	};
	
	var Template = function (name, viewSource) {
		
		var Template = this;
		
		Template.name = name;
		
		Template.loaded = undefined;
		Template.template = undefined;
		Template.view = undefined;
		
		if (viewSource) Template.viewSource = viewSource;
		
	};
	
	Template.prototype.viewSource = {};
	
	Template.prototype.reset = function () {
		
		var Template = this;
		
		Template.loaded = undefined;
		Template.template = undefined;
		Template.view = undefined;
		
	};
	
	Template.prototype.chunkReceived = function () {
		
		var Template = this;
		
		var done = Template.template !== null && Template.view !== null;
		
		if (done) {
			
			if (!Template.view.themePath) Template.view.themePath = themePath;
			
			var output = Mustache.render(Template.template, Template.view);
			
			Template.loaded(output, Template.view);
			Template.reset();
			
		}
		
	};
	
	Template.prototype.load = function (callback) {
		
		var Template = this;
		
		Template.loaded = callback;
		Template.template = null;
		Template.view = null;
		
		$.ajax({
			url: themePath + '/' + Template.name,
		}).done(function (template) {
			Template.template = template;
			Template.chunkReceived();
		}).fail(function () {
			console.log(Template.name + ': Error, unable to load template.');
			Template.template = '';
			Template.chunkReceived();
		});
		
		var viewSource = Template.viewSource;
		
		switch (viewSource === null ? 'null' : typeof viewSource) {
			case 'function':
				viewSource(function (view) {
					Template.view = view;
					Template.chunkReceived();
				}, Theme.currentPath);
				break;
			case 'object':
				Template.view = viewSource;
				Template.chunkReceived();
				break;
			default:
				console.log(Template.name + ': Error, unable to prozess view source. View source:', Template.viewSource);
				Template.view = {};
				Template.chunkReceived();
		}
		
	};
	
	var Route = function (source) {
		
		var Route = this;
		
		Route.path = source.path;
		Route.title = source.title;
		
		Route.loaded = undefined;
		Route.body = undefined;
		Route.views = undefined;
		
		if (source.before) Route.before = source.before;
		if (source.done) Route.done = source.done;
		if (source.templates) Route.templates = source.templates;
		
	};
	
	Route.prototype.before = function () {};
	Route.prototype.done = function () {};
	Route.prototype.templates = [];
	
	Route.prototype.body = [];
	Route.prototype.views = {};
	
	Route.prototype.reset = function () {
		
		var Route = this;
		
		Route.loaded = undefined;
		Route.body = undefined;
		Route.views = undefined;
		
	};
	
	Route.prototype.chunkReceived = function () {
		
		var Route = this;
		
		var done = true;
		for (var i = Route.templates.length; i--;) if (!Route.body[i]) done = false;
		
		if (done) {
			var body = stringifyArray(Route.body),
				views = Route.views;
			Route.loaded(body, views);
			Route.reset();
		}
		
	};
	
	Route.prototype.load = function (callback) {
		
		var Route = this;
		
		Route.loaded = callback;
		Route.body = [];
		Route.views = {};
		
		var templates = Route.templates;
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(function (output, view) {
				
				Route.body[i] = output;
				Route.views[template.name] = view;
				Route.chunkReceived();
				
			});
			
		})(i);
		
		if (!templates.length) Route.chunkReceived();
		
	};
	
	/** Search a route that matches the current path. */
	
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
		
		return null;
		
	};
	
	var updateTheme = function () {
		
		Theme.currentPath = currentPath();
		
		var route = searchRoute(Theme.currentPath);
		
		if (!route) {
			
			console.log('No route was found.', 'Current path:', Theme.currentPath, 'Routes:', routes);
			document.title = 'Page not found';
			$('body').html('404 Not Found');
			
		} else {
			
			route.before(currentPath);
			
			if (route.templates.length) route.load(function (body, views) {
				
				$('body').html(body);
				document.title = Mustache.render(route.title, validateObjectKeys(views));
				route.done(views, currentPath);
				
			});
			
			else {
				
				document.title = route.title;
				route.done(null, currentPath);
				
			}
			
		}
		
	};
	
	Theme.setup = function (themePathParam, routeSources, viewSources, options) {

		var valid = {
			path: typeof themePathParam === 'string',
			routes: routeSources instanceof Array,
			views: viewSources !== null && typeof viewSources === 'object' || viewSources === undefined,
			options: options !== null && typeof options === 'object' || options === undefined
		};
		
		if (valid.path && valid.routes && valid.views && valid.options) {
			
			if (options && options.log) log = options.log;
			
			themePath = themePathParam;
		
			/** @type {Object.<string, {({Object}|function(string, boolean))}>} */
			
			for (var name in viewSources) templates[name] = new Template(name, viewSources[name]);
			
			/** @type {Array.<{path, templates, done, before, title}>} */
			
			for (var i = routeSources.length; i--;) {
				
				var routeSource = routeSources[i],
					routeTemplates = routeSource.templates;
				
				for (var j = routeTemplates.length; j--;) {
					
					var n = routeTemplates[j];
					
					if (templates[n]) routeTemplates[j] = templates[n];
					
					else routeTemplates[j] = templates[n] = new Template(n);
					
				}
				
				var route = routes[i] = new Route(routeSource);
				
			}
			
			/**
			 * Get the head
			 */
			 
			var head = templates['head.html'] = new Template('head.html');
			
			head.load(function (headOutput) {
				
				$('head').html(headOutput);
				
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
				
			});
			
		}
		
		else {
			
			console.log('Invalid setup parameters.', valid, themePathParam, routeSources, viewSources, options);
			return false;
			
		}
		
	};
	
})();