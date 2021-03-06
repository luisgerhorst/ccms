(function () {

function Theme(options) { var Theme = this;

	/* child classes */

	Theme.Template = function (name) { var Template = this;

		Template.name = name;
		Template.cached = null;

	}

	Theme.Template.prototype = new (function () { var Template = this;

		Template.get = function (callback) { var Template = this;

			if (Template.cached) callback(Template.cached);
			else {

				$.ajax({
					url: Theme.themeDirectoryPath + Template.name,
					error: function (jqXHR, textStatus, errorThrown) {
						fatalError('Rendering Error', 'Unable to load template <code>' + Template.name + '</code>.');
						throw 'Ajax error';
					},
					success: function (response) {
						Template.cached = response;
						callback(response);
					}
				});

			}

		}

	})();

	Theme.ViewCache = function (initial, read, save, name) { var ViewCache = this;

		Theme.viewCaches[name] = initial;

		ViewCache.read = read;
		ViewCache.add = save;

	}

	Theme.View = function (options, name) { var View = this;

		if (!options.load) {

			View.data = options.data;
			View.get = function (callback) {
				callback(View.data);
			};

		} else {

			View.load = options.load;
			View.cache = options.cache ? new Theme.ViewCache(options.cache.initial, options.cache.read, options.cache.save, name) : false;
			View.get = function (callback, path, parameters) {

				var cached = View.cache ? View.cache.read(Theme.viewCaches, path, parameters) : false;

				if (cached) callback(cached);
				else {

					View.load(function (response, error) {
						if (error) {
							fatalError(error.heading || 'Error', error.message || 'Unable to load content of page.');
							throw 'View load function returned error.';
						} else {
							if (View.cache) {
								var oldCache = Theme.viewCaches[name];
								var newCache = View.cache.add(response, oldCache, path, parameters);
								Theme.viewCaches[name] = newCache;
								// note: take care, it also has to work with native data types
							}
							callback(response);
						}
					}, path, parameters);

				}

			}

		}

	}


	/* Segment */

	Theme.Segment = function (name, view) { var Segment = this;

		Segment.template = new Theme.Template(name);
		Segment.view = new Theme.View(view, name);

	}

	Theme.Segment.prototype = new (function () { var Segment = this;

		Segment.load = function (callback, path, parameters) { var Segment = this;

			var toLoad = 2,
				template = null,
				view = null;

			Segment.template.get(function (response) {
				template = response;
				if (nothingToLoad()) done();
			});

			Segment.view.get(function (response) {
				view = response;
				if (nothingToLoad()) done();
			}, path, parameters);

			function nothingToLoad() {
				toLoad--;
				return !toLoad;
			}

			function done() {
				
				view._ccmsRoot = Theme.ccmsBasePath;
				view._siteRoot = Theme.siteBasePath;
				view._themeDirectory = Theme.themeDirectoryPath;

				var output = Mustache.render(template, view);

				callback(output, view);

			}

		};

	})();


	/* Route */

	Theme.Route = function (options) { var Route = this;

		Route.path = options.path;
		Route.title = options.title;

		Route.before = options.before || function () {};
		Route.segments = options.templates || [];

	}

	Theme.Route.prototype = new (function () { var Route = this;

		Route.load = function (callback, path, parameters) { var Route = this;

			var segments = Route.segments;

			var toLoad = segments.length,
				body = [],
				views = {};

			for (var i = segments.length; i--;) (function (i) {

				var segment = segments[i];

				segment.load(function (output, view) {

					body[i] = output;
					views[segment.template.name] = view;
					
					toLoad--;
					if (!toLoad) callback(body.join(''), views);

				}, path, parameters);

			})(i);

		};

	})();

	Theme.viewCaches = {};
	
	/* paths */
	
	Theme.ccmsBasePath = options.root;
	Theme.siteBasePath = options.root + options.site;
	Theme.themeDirectoryPath = options.root + options.theme;
	
	/* segments & routes */

	Theme.segments = {};
	Theme.routes = [];

	/* segments from views */

	for (var name in options.views) Theme.segments[name] = new Theme.Segment(name, options.views[name]);

	/* routes & templates from routes */

	for (var i = options.routes.length; i--;) {

		var route = options.routes[i],
		    templateNames = route.templates || [];

		for (var j = templateNames.length; j--;) {

			var name = templateNames[j];

			if (Theme.segments[name]) route.templates[j] = Theme.segments[name];
			else route.templates[j] = Theme.segments[name] = new Theme.Segment(name, { data: {} });

		}

		Theme.routes[i] = new Theme.Route(route);

	}

}

Theme.prototype = new (function () { var Theme = this;
	
	/** @return {string} The relative path to base, staring with a slash, no slash at the end. Examples: "/", "/path/to" */
	Theme.extractPath = function (href) { var Theme = this;
		var path = new URL(href).pathname; // "/path/to", "/path/to/", "/path/to/something", "/path/to/something/"
		path = /\/$/.test(path) ? path : path + '/'; // "/path/to/", "/path/to/something/"
		var sub = path.replace(new RegExp('^' + Theme.siteBasePath), '').replace(/\/$/, ''); // "", "something/"
		return sub;
	};

	Theme.currentPath = function () { var Theme = this;
		return Theme.extractPath(location.href);
	};

	Theme.setup = function () { var Theme = this;

		/* get head */

		new Theme.Segment('head.html', { data: {} }).load(function (output) {

			$('head').append(output);

			var isEmpty = $('body').attr('data-status') == 'empty';
			if (isEmpty) {

				var href = location.href;

				Theme.load(function (title, body) {

					window.history.replaceState({
						title: title,
						body: body
					}, title, href);

					Theme.update(title, body);

				}, Theme.extractPath(href), new URL(href).query);

			}

			if (historyAPISupport()) window.addEventListener('popstate', function (event) { // back

				if (event.state) {

					var title = event.state.title,
						body = event.state.body;

					Theme.update(title, body);

				} else {

					var href = location.href;

					Theme.load(function (title, body) {

						window.history.replaceState({
							title: title,
							body: body
						}, title, href);

						Theme.update(title, body);

					}, Theme.extractPath(href), new URL(href).query);

				}

			});

		});

	};

	/* Load the body & title for a path, call update */

	Theme.load = function (callback, path, parameters) { var Theme = this;

		var body = $('body');
		body.addClass('changing');
		body.attr('data-status', 'changing');

		var route = Theme.searchRoute(path);

		if (!route) {

			fatalError('Page not found', "The page you were looking for doesn't exist.");
			console.error('No route found', Theme.routes, path);

		} else {
			
			var stop = route.before(path, parameters) === false;

			if (!stop && route.segments.length) route.load(function (body, views) {

				var title = Mustache.render(route.title, validateObjectKeys(views));

				callback(title, body);

				function validateObjectKeys(object) {
					var validatedObject = {};
					for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
					return validatedObject;
				}

			}, path, parameters); else if (!stop) {

				Theme.update(route.title);

			}

		}

	};

	/* Search route that matches path. */

	Theme.searchRoute = function (path) { var Theme = this;

		for (i = Theme.routes.length; i--;) {

			var route = Theme.routes[i];

			switch (route.path instanceof RegExp ? 'regexp' : route.path instanceof Array ? 'array' : typeof route.path) {

				case 'string':
					if (route.path === path || new RegExp('^route.path\?').test(path)) return route;
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

	/* Update body & title and set link event handlers for Ajax */

	Theme.update = function (title, bodyString) { var Theme = this;

		document.title = title;

		if (bodyString) {

			document.body.innerHTML = bodyString; // quick change

			var body = $('body');
			body.html(bodyString); // real dom update
			body.removeClass('changing');
			body.attr('data-status', 'filled');

			if (historyAPISupport()) $('a').click(function (event) {
				event.preventDefault();
				$(this).addClass('changer');
				window.open(this.href, this.target);
			});

		}

	};

})();

/**
 * @constructor
 * @param {string} href
 * @param {string} basePath
 */

function URL(href, basePath) {

	var element = document.createElement('a');
		element.href = href;

	this.protocol = element.protocol; // "http:"
	this.hostname = element.hostname; // "example.com"
	this.port = element.port; // "3000"
	this.pathname = element.pathname; // "/pathname/"
	this.search = element.search; // "?search=test"
	this.hash = element.hash; // "#hash"

	this.href = href;
	this.host = element.host; // "example.com:3000"

	this.query = this.getQuery(); // { search: "test" }
	this.resulting = this.protocol + '//' + this.host + this.pathname + this.search + this.hash;

}

URL.prototype = new (function () {

	this.getQuery = function () {

		var queryString = this.search.substring(1), // remove ? from start
			queries = queryString.split("&"), // split by &
			parameters = {};

		for (var i = queries.length; i--;) {

			var query = queries[i].split('='); // spilt by =

			if (query[0] && query[1]) parameters[query[0]] = decodeURIComponent(query[1]);
			else if (query[0] && !query[1]) parameters[query[0]] = '';
			else if (!query[0] && query[1]) parameters[''] = query[1];

		}

		return parameters;

	};

})();

/* tools */

function historyAPISupport() {
	return !!(window.history && window.history.pushState && window.history.replaceState);
}

/* global */

String.prototype.startsWith = function(string) {
	return this.indexOf(string) === 0;
};

/* api */

window.createTheme = function (options) {

	window.theme = new Theme(options);
	window.theme.setup();

	/* Open an URL, use Ajax if possible */

	window._open = window.open;
	window.open = function (href, target, options) {
		
		var theme = window.theme;
		
		target = window.open.arguments[1] = target || '_self';

		var url = new URL(href),
		    ajaxPossible = target == '_self' && 1 <= window.open.arguments.length <= 2;

		if (ajaxPossible && historyAPISupport() && isIntern(url)) {

			history.pushState(null, null, url.href);

			theme.load(function (title, body) {

				if (url.resulting == new URL(location.href).resulting)
					window.history.replaceState({
						title: title,
						body: body
					}, title, url.href);

				theme.update(title, body);

			}, theme.extractPath(href), url.query);

		} else window._open.apply(this, window.open.arguments);

		/** @param {URL} url */
		function isIntern(url) {
			var base = new URL(theme.siteBasePath).resulting;
			return url.resulting.startsWith(base);
		}

	};

}

})();