window.theme = new (function () {
	
	var Theme = this;
	
	/* attributes */
	
	Theme.templates = {};
	Theme.routes = [];
	
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
	
	/* check if HTML5 History API is supported */
	function historyAPISupport() {
		return !!(window.history && history.pushState);
	}
	
	/* get CCMS path from an URL */
	var extractPath = function (s) {
		
		var e = document.createElement('a');
		e.href = s;
		s = e.pathname; // path
		
		console.log('fuul path', s);
		
		s = s.replace(new RegExp('^'+Theme.rootPath+Theme.sitePath), ''); // extract content after url root
		s = s.replace(/\/$/, ''); // remove / from end
		s = s.replace(/\?.*$/, ''); // remove query
		
		if (!s) s = '/';
		
		consol.info.log('Extracted path', s);
		
		return s;
		
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
				
				view._host = Theme.host;
				view._rootPath = Theme.rootPath;
				view._sitePath = Theme.sitePath;
				view._filePath = Theme.filePath;
				
				view._siteURL = Theme.host+Theme.rootPath+Theme.sitePath;
				view._fileURL = Theme.host+Theme.rootPath+Theme.filePath;
				
				loaded(Mustache.render(template, view), view);
			}
		}
		
		/* template */
	
		$.ajax({
			url: Theme.rootPath+Theme.filePath + '/' + Template.name,
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
						consol.error.log('View source returned error.', 'Error:', error);
						fatalError(error.heading || 'Error', error.message || 'Could not load page content.');
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
	
	Theme.currentPath = function () {
		return extractPath(location.href);
	}
	
	/* search route that matches the path. */
	
	Theme.searchRoute = function (path) {
		
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
	
	/* Open an URL, use Ajax if possible */
	
	Theme.open = function (href, target) {
		
		consol.info.log('Open', href, target);
		
		if ((!target || target == '_self') && historyAPISupport() && isIntern(href)) {
			
			//href = href.replace(/\/$/, '').replace(/\/\?/, '?'); // remove / from pathname end
			
			history.pushState(null, null, href);
			Theme.load(extractPath(href));
			
		} else {
			
			target = target || '_self';
			window.open(href, target);
			
		}
		
		function isIntern(n) {
			var r = Theme.rootPath+Theme.sitePath,
				fr = window.location.href.replace(new RegExp(location.pathname + '$'), '') + Theme.rootPath+Theme.sitePath; // full CCMS root URL = url - path + urlRoot
			return fr == n || new RegExp('^'+fr+'/.*$').test(n) || r == n || new RegExp('^'+r+'/.*$').test(n); // prot://host/root, prot://host/root/, prot://host/root/..., root root/ root/...
		}
		
	}
	
	/* Update body & title and set link event handlers for Ajax */
	
	Theme.update = function (title, body) {
		
		consol.info.log('Update to "' + title + '"');
		
		document.title = title;
		
		if (body) {
			
			$('body').html(body);
			$('body').removeClass('changing');
			$('body').attr('status', 'filled');
			
			if (historyAPISupport()) $('a').click(function () {
				Theme.open(this.href, this.target);
				return false;
			});
			
		}
		
	}
	
	/* Load the body for a path */
	
	Theme.load = function (path, loaded) {
		
		consol.info.log('Load', path);
		
		$('body').addClass('changing');
		$('body').attr('status', 'changing');
		
		var route = Theme.searchRoute(path);
		
		if (!route) {
			
			consol.error.log('No route was found.', 'Current path:', path, 'Routes:', Theme.routes);
			fatalError('Page not found', "The page you were looking for doesn't exist.");
			
		} else {
			
			consol.info.log('... Route Found');
			var stop = route.before(path) === false;
				
			if (!stop && route.templates.length) route.load(function (body, views) {
				
				var title = Mustache.render(route.title, validateObjectKeys(views));
				Theme.update(title, body);
				route.done(views, path);
				if (loaded) loaded();
				
			}, path); else if (!stop) {
				
				Theme.update(route.title);
				route.done(null, path);
				
			}
			
		}
		
	};
	
	/* setup */
	
	Theme.setup = function (options) {
		
		/* logging */

		if (options.log) {
			
			if (options.log.indexOf('info') > -1) consol.info = console;
			if (options.log.indexOf('error') > -1) consol.error = console;
			if (options.log.indexOf('performance') > -1) consol.performance = console;
			
		}
		
		/* roots */
		
		console.log(options);
		
		Theme.host = location.protocol + '//' + location.host;
		consol.info.log('host', Theme.host);
		Theme.rootPath = options.rootPath;
		Theme.filePath = options.filePath;
		Theme.sitePath = options.sitePath;
		
		console.log(Theme);
		
		/*
		Theme.root = options.rootPath;
		Theme.docRoot = Theme.root+options.filePath;
		Theme.urlRoot = Theme.root+options.sitePath;*/
		
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
			
			$('body').attr('status', 'empty');
			$('head').append(output);
			
			var isEmpty = $('body').attr('status') == 'empty';
			
			consol.info.log('Head ready, load body?', isEmpty);
			
			if (isEmpty) Theme.load(extractPath(location.href));
			
			if (historyAPISupport()) window.addEventListener('popstate', function (event) { // back
				Theme.load(extractPath(location.href));
			});
			
		});
		
	};
	
})();