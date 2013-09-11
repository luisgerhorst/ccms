var theme = new (function () {
	
	var Theme = this;
	
	/** attributes */
	
	Theme.templates = {};
	Theme.routes = [];
	Theme.path = '';
	
	/** logging */
	
	var consoleImitation = new (function () {
		var func = function () {};
		for (var method in console) this[method] = func;
	})();
	
	var consol = {
		info: consoleImitation,
		error: console,
		performance: consoleImitation
	};
	
	/** utilities */
	
	var validateObjectKeys = function (object) {
		var validatedObject = {};
		for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
		return validatedObject;
	};
	
	var getCurrentPath = function () {
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
	
	/** Template */
	
	var Template = function (name, viewSource, fallbackTemplate) {
		
		var Template = this;
		
		Template.name = name;
		
		if (viewSource) Template.viewSource = viewSource;
		if (fallbackTemplate) Template.fallbackTemplate = fallbackTemplate;
		
	};
	
	Template.prototype.viewSource = {};
	Template.prototype.fallbackTemplate = '';
	
	Template.prototype.load = function (loaded, path) {
		
		var Template = this;
	
		var toLoad = 2,
			template = null,
			view = {};
			
		var chunkReceived = function () {
			toLoad--;
			if (!toLoad) {
				view.themePath = Theme.path;
				loaded(Mustache.render(template, view), view);
			}
		};
	
		$.ajax({
			url: Theme.path + '/' + Template.name,
		}).done(function (response) {
			template = response;
			chunkReceived();
		}).fail(function () {
			consol.error.log(Template.name + ': Error, unable to load template.');
			template = Template.fallbackTemplate;
			chunkReceived();
		});
	
		var viewSource = Template.viewSource;
	
		switch (viewSource === null ? 'null' : typeof viewSource) {
			
			case 'function':
				viewSource(function (response, error) {
					
					if (error) {
						
						var html = '<style>body{color: rgb(80,80,80);background: #fff;font: normal 16px "Lucida Grande", "Lucida Sans Unicode", Geneva, sans-serif;line-height: 24px;}a{text-decoration: underline;color: rgb(80,80,255);}a:hover{color: rgb(120,120,255);}p{margin: 20px;}h1{font: normal 32px "Helvetica Neue", Arial, Helvetica, sans-serif;line-height: 32px;margin: 20px;}body{padding: 64px;}code{font-family: Menlo, Consolas, Monaco, "Lucida Console", monospace;color: rgb(120,120, 120);}</style>';
						
						if (typeof error === 'string') html += '<h1>Error</h1><p>' + error + '</p>';
						else if (typeof error === 'object') {
							if (error.heading) html += '<h1>' + error.heading + '</h1>';
							if (error.message) html += '<p>' + error.message + '</p>';
						}
						else html += '<h1>Error</h1><p>An error occured.</p>';
						
						var title = error.title || 'Error';
						
						consol.error.log('View source returned error.', 'Error =', error, 'View source =', viewSource);
						
						document.title = title;
						$('body').html(html);
						
					} else {
						view = response;
						chunkReceived();
					}
					
				}, path);
				break;
				
			case 'object':
				view = viewSource;
				chunkReceived();
				break;
				
			default:
				consol.error.log(Template.name + ': Error, unable to prozess view source. View source = ', viewSource);
				view = {};
				chunkReceived();
				
		}
	
	};
	
	/** Route */
	
	var Route = function (options) {
		
		var Route = this;
		
		Route.path = options.path;
		Route.title = options.title;
		
		if (options.before) Route.before = options.before;
		if (options.done) Route.done = options.done;
		if (options.templates) Route.templates = options.templates;
		
	};
	
	Route.prototype.before = function () {};
	Route.prototype.done = function () {};
	Route.prototype.templates = [];
	
	Route.prototype.load = function (loaded, path) {
		
		var Route = this;
		
		var templates = Route.templates;
		
		var toLoad = templates.length,
			body = [],
			views = {};
		
		var templateLoaded = function () {
			toLoad--;
			if (!toLoad) loaded(stringifyArray(body), views);
		};
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(function (output, view) {
				
				body[i] = output;
				views[template.name] = view;
				templateLoaded();
				
			}, path);
			
		})(i);
		
	};
	
	/** Search a route that matches the current path. */
	
	var searchRoute = function (path) {
		
		for (i = Theme.routes.length; i--;) {
			
			var route = Theme.routes[i];
			
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
	
	var updateTheme = function (path) {
		
		consol.info.log('Updating theme ...');
		
		$('body *').addClass('-before-disappear');
		
		var route = searchRoute(path);
		
		if (!route) {
			
			consol.error.log('No route was found.', 'Current path:', path, 'Routes:', routes);
			fatalError('Page not found', 'The page you were looking for doesn\'t exist.');
			
		} else {
			
			route.before(path);
			
			if (route.templates.length) route.load(function (body, views) {
				
				$('body').html(body);
				document.title = Mustache.render(route.title, validateObjectKeys(views));
				
				route.done(views, path);
				
			}, path); else {
				
				document.title = route.title;
				route.done(null, path);
				
			}
			
		}
		
	};
	
	Theme.setup = function (options) {

		if (options.log) {
			
			if (options.log.indexOf('info') > -1) consol.info = console;
			if (options.log.indexOf('error') > -1) consol.error = console;
			if (options.log.indexOf('performance') > -1) consol.performance = console;
			
		}
		
		Theme.path = options.path;
		
		for (var name in options.views) Theme.templates[name] = new Template(name, options.views[name]);
		
		for (var i = options.routes.length; i--;) {
			
			var route = options.routes[i],
				templateNames = route.templates || [];
			
			for (var j = templateNames.length; j--;) {
				
				var name = templateNames[j];
				
				if (Theme.templates[name]) route.templates[j] = Theme.templates[name];
				else route.templates[j] = Theme.templates[name] = new Template(name);
				
			}
			
			Theme.routes[i] = new Route(route);
			
		}
		
		/** Get the head */
		 
		new Template('head.html').load(function (output) {
			
			$('head').html(output);
			
			/** Set up path change detection */
			
			var path = getCurrentPath();
			
			updateTheme(path);
			
			/** URL-change detection via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js */
			
			if ('onhashchange' in window) {
				window.onhashchange = function () {
					var currentPath = getCurrentPath(); // using path, not hash!
					if (currentPath != path) {
						path = currentPath;
						updateTheme(path);
					}
				};
			} else {
				window.setInterval(function () {
					var currentPath = getCurrentPath();
					if (currentPath != path) {
						path = currentPath;
						updateTheme(path);
					}
				}, 100);
			}
			
		});
		
	};
	
})();