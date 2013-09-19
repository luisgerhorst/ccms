var theme = new (function () {
	
	var Theme = this;
	
	/* attributes */
	
	Theme.templates = {};
	Theme.routes = [];
	Theme.path = '';
	
	/* logging */
	
	var consoleImitation = new (function () {
		var nothing = function () {};
		for (var method in console) this[method] = nothing;
	})();
	
	var consol = {
		info: consoleImitation,
		error: console,
		performance: consoleImitation
	};
	
	/* utils */
	
	/* replace dots in object keys by _ */
	var validateObjectKeys = function (object) {
		var validatedObject = {};
		for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
		return validatedObject;
	};
	
	/* get CCMS path from an URL */
	var getCurrentPath = function (string) {
		string = /ccms\/.+$/.test(string) ? string.replace(/^.*ccms\//, '') : '/';
		string = string.replace(/\/$/, '');
		consol.info.log('Path:', '"' + string + '"');
		return string;
	};
	
	/* create string from array */
	var stringifyArray = function (array) {
		var string = '', length = array.length;
		for (var i = 0; i < length; i++) string += array[i] || '';
		return string;
	};
	
	/* Template */
	
	var Template = function (name, viewSource, fallbackTemplate) {
		
		var Template = this;
		
		Template.name = name;
		
		if (viewSource) Template.viewSource = viewSource;
		if (fallbackTemplate) Template.fallbackTemplate = fallbackTemplate;
		
	};
	
	/* fallback */
	
	Template.prototype.viewSource = {};
	Template.prototype.fallbackTemplate = '';
	
	/* methods */
	
	Template.prototype.load = function (loaded, path) {
		
		var Template = this;
	
		var toLoad = 2,
			template = null,
			view = {};
			
		function chunkReceived() {
			toLoad--;
			if (!toLoad) { // done
				view.documentRoot = Theme.documentRoot;
				view.themePath = Theme.path;
				loaded(Mustache.render(template, view), view);
			}
		}
		
		/* template */
	
		$.ajax({
			url: Theme.documentRoot + Theme.path + '/' + Template.name,
			success: function (response) {
				template = response;
				chunkReceived();
			},
			error: function () {
				consol.error.log(Template.name + ': Error, unable to load template.');
				template = Template.fallbackTemplate;
				chunkReceived();
			}
		});
		
		/* view */
	
		var viewSource = Template.viewSource;
	
		switch (viewSource === null ? 'null' : typeof viewSource) {
			
			case 'function':
				viewSource(function (response, error) {
					
					if (error) {
						consol.error.log('View source returned error.', 'Error:', error, 'View source:', viewSource);
						fatalError('Error', 'Unable to get the content of this page.');
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
		
		function templateLoaded() {
			toLoad--;
			if (!toLoad) loaded(stringifyArray(body), views);
		}
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(function (output, view) {
				
				body[i] = output;
				views[template.name] = view;
				templateLoaded();
				
			}, path);
			
		})(i);
		
	};
	
	/* search route that matches the path. */
	
	function searchRoute(path) {
		
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
		
	}
	
	/* update the body */
	
	function updateTheme(path) {
		
		consol.info.log('Updating theme ...', path);
		
		$('body').addClass('changing');
		
		var route = searchRoute(path);
		
		consol.info.log('Found route');
		
		if (!route) {
			
			consol.error.log('No route was found.', 'Current path:', path, 'Routes:', Theme.routes);
			fatalError('Page not found', 'The page you were looking for doesn\'t exist.');
			
		} else {
			
			route.before(path);
			
			if (route.templates.length) route.load(function (bodyContent, views) {
				
				var body = '<body>' + bodyContent + '</body>';
				
				$('body').html(bodyContent);
				$('body').removeClass('changing');
				document.title = Mustache.render(route.title, validateObjectKeys(views));
				
				route.done(views, path);
				
			}, path); else {
				
				document.title = route.title;
				route.done(null, path);
				
			}
			
		}
		
	}
	
	/* setup */
	
	Theme.setup = function (options) {
		
		/* logging */

		if (options.log) {
			
			if (options.log.indexOf('info') > -1) consol.info = console;
			if (options.log.indexOf('error') > -1) consol.error = console;
			if (options.log.indexOf('performance') > -1) consol.performance = console;
			
		}
		
		/* path */
		
		Theme.path = options.path;
		Theme.documentRoot = options.documentRoot;
		
		/* templates from views */
		
		for (var name in options.views) Theme.templates[name] = new Template(name, options.views[name]);
		
		/* routes & templates from routes */
		
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
		
		/* get head */
		 
		new Template('head.html').load(function (output) {
			
			$('head').append(output);
			
			/* path change detection */
			
			var path = getCurrentPath(document.URL);
			
			updateTheme(path);
			
			function supportsHistoryAPI() {
				return !!(window.history && history.pushState);
			}
			
			if (!supportsHistoryAPI()) return;
			
			$('a').click(function() {
				consol.info.log('Click handler called', this.href);
				history.pushState(null, null, this.href);
				var currentPath = getCurrentPath(document.URL); // compare using path, not hash!
				if (currentPath != path) {
					path = currentPath;
					updateTheme(path);
				}
			});
			
			/*setTimeout(function() {
				
				window.onpopstate = function (event) {
					var currentPath = getCurrentPath(document.URL); // compare using path, not hash!
					if (currentPath != path) {
						path = currentPath;
						updateTheme(path);
					}
				}
				
			}, 1);*/
			
			/*if ('onhashchange' in window) {
				window.onhashchange = function () {
					var currentPath = getCurrentPath(document.URL); // compare using path, not hash!
					if (currentPath != path) {
						path = currentPath;
						updateTheme(path);
					}
				};
			} else {
				window.setInterval(function () {
					var currentPath = getCurrentPath(document.URL);
					if (currentPath != path) {
						path = currentPath;
						updateTheme(path);
					}
				}, 100);
			}*/
			
		});
		
	};
	
})();