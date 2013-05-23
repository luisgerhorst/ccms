var theme = new (function () {
	
	var Theme = this;
	
	var log = false;
	
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
	
	var Template = function (name, viewResource) {
		
		var Template = this;
		
		Template.name = name;
		
		if (viewResource) Template.viewResource = viewResource;
		
	};
	
	Template.prototype.reset = function () {
		
		var Template = this;
		
		Template.loaded = undefined;
		Template.template = undefined;
		Template.view = undefined;
		
	};
	
	Template.prototype.chunkReceived = function () {
		
		var Template = this;
		
		if (log) console.log('Template chunk of ' + Template.name + ' received ...');
		
		var done = Template.template !== null && Template.view !== null;
		
		if (done) {
			
			if (log) console.log('Template ' + Template.name + ' loaded!');
			
			if (!Template.view.themePath) Template.view.themePath = Theme.path;
			
			var output = Mustache.render(Template.template, Template.view);
			
			Template.loaded(output, Template.view);
			Template.reset();
			
		}
		
	};
	
	Template.prototype.load = function (callback) {
		
		var Template = this;
		
		if (log) console.log('Started loading template ' + Template.name);
		
		Template.loaded = callback;
		Template.template = null;
		Template.view = null;
		
		$.ajax({
			url: Theme.path + '/' + Template.name,
		}).done(function (template) {
			Template.template = template;
			Template.chunkReceived();
		}).fail(function () {
			if (log) console.log('Template ' + Template.name + ' could not be loaded.');
			Template.template = '';
			Template.chunkReceived();
		});
		
		var viewResource = Template.viewResource;
		
		switch (viewResource === null ? 'null' : typeof viewResource) {
			case 'function':
				viewResource(function (view) {
					Template.view = view;
					Template.chunkReceived();
				}, Theme.currentPath);
				break;
			case 'object':
				Template.view = viewResource;
				Template.chunkReceived();
				break;
			default:
				if (log) console.log('No view resource for ' + Template.name + ' found.');
				Template.view = {};
				Template.chunkReceived();
		}
		
	};
	
	var Route = function (resource) {
		
		var Route = this;
		
		Route.path = resource.path;
		Route.title = resource.title;
		
		if (resource.before) Route.before = resource.before;
		if (resource.done) Route.done = resource.done;
		if (resource.templates) {
			
			Route.templates = [];
			
			for (var i = resource.templates.length; i--;) {
				
				var name = resource.templates[i];
				
				if (Theme.templates[name]) Route.templates[i] = Theme.templates[name];
				
				else {
					Theme.templates[name] = new Template(name);
					Route.templates[i] = Theme.templates[name];
				}
				
			}
			
		}
		
	};
	
	Route.prototype.before = function () {};
	Route.prototype.done = function () {};
	Route.prototype.templates = [];
	
	Route.prototype.chunkReceived = function () {
		
		var Route = this;
		
		var done = true;
		for (var j = Route.templates.length; j--;) if (!Route.body[j]) done = false;
		if (done) {
			var body = stringifyArray(Route.body),
				views = Route.views;
			Route.loaded(body, views);
		}
		
	};
	
	Route.prototype.load = function (callback) {
		
		var Route = this;
		
		if (log) console.log('Loading route.', Route);
		
		Route.loaded = callback;
		
		var templates = Route.templates;
		
		Route.body = [];
		Route.views = {};
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(function (output, view) {
				
				Route.body[i] = output;
				Route.views[template.name] = view;
				Route.chunkReceived();
				
			});
			
		})(i);
		
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
		
		if (log) console.log('Found route.', route);
		
		route.before(Theme.currentPath);
		
		if (log) console.time('Loaded route');
		
		if (route.templates.length) route.load(function (body, views) {
			
			if (log) console.timeEnd('Loaded route');
			
			$('body').html(body);
			if (route.title) document.title = Mustache.render(route.title, validateObjectKeys(views));
			route.done(views, currentPath);
			
		});
		
		else {
			
			if (route.title) document.title = route.title;
			route.done(null, currentPath);
			
		}
		
	};
	
	Theme.currentPath = currentPath;
	
	Theme.setup = function (path, routeResources, viewResources, options) {

		var valid = {
			path: typeof path === 'string',
			routes: routeResources instanceof Array,
			views: viewResources !== null && typeof viewResources === 'object' || viewResources === undefined,
			options: options !== null && typeof options === 'object' || options === undefined
		};
		
		if (valid.path && valid.routes && valid.views) {
			
			if (options && options.log) log = options.log;
			
			Theme.path = path;
		
			/** @type {Object.<string, {({Object}|function(string, boolean))}>} */
			Theme.templates = {};
			for (var name in viewResources) Theme.templates[name] = new Template(name, viewResources[name]);
			
			/** @type {Array.<{path, templates, done, before, title}>} */
			
			Theme.routes = [];
			for (var i = routeResources.length; i--;) Theme.routes[i] = new Route(routeResources[i]);
			
			Theme.update();
			
			/**
			 * URL-change detection
			 * via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js
			 */
			
			if ('onhashchange' in window) window.onhashchange = Theme.update;
			else {
				var hash = window.location.hash;
				window.setInterval(function () {
					if (window.location.hash !== hash) {
						hash = window.location.hash;
						Theme.update();
					}
				}, 100);
			}
			
			/**
			 * Get the head
			 */
			 
			var template = new Template('head.html');
			
			if (log) console.log('Head', template);
			
			template.load(function (output) {
				$('head').html(output);
			});
			
			return true;
			
		}
		
		else {
			
			console.log('Invalid setup parameters.', valid, path, routeResources, viewResources, options);
			return false;
			
		}
		
	};
	
})();