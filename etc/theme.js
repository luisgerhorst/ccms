(function () { // start
	
function Theme(options) {
	
	var Theme = this;
	
	/* child classes */
	
	Theme.Template = function (name) { var Template = this;
	
		Template.name = name;
		Template.cached = null;
	
	}
	
	Theme.Template.prototype = new (function () { var Template = this;
		
		Template.get = function (callback) { var Template = this;
			
			if (this.cached) callback(this.cached);
			else {
	
				$.ajax({
					url: Theme.rootPath + Theme.filePath + '/' + Template.name,
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
								var cache = Theme.viewCaches[name];
								cache = View.cache.add(response, cache, path, parameters);
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
				
				view._host = Theme.host;
				view._rootPath = Theme.rootPath;
				view._sitePath = Theme.sitePath;
				view._filePath = Theme.filePath;
	
				view._siteURL = Theme.host + Theme.rootPath + Theme.sitePath;
				view._fileURL = Theme.host + Theme.rootPath + Theme.filePath;
	
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
					if (nothingToLoad()) callback(stringifyArray(body), views);
	
				}, path, parameters);
	
			})(i);
	
			/* tools */
	
			function nothingToLoad() {
				toLoad--;
				return !toLoad;
			}
	
			function stringifyArray(array) {
				var string = '', length = array.length;
				for (var i = 0; i < length; i++) string += array[i] || '';
				return string;
			}
	
		};
	
	})();
	
	Theme.viewCaches = {};
	
	/* urls */
	
	Theme.host = location.protocol + '//' + location.host;
	Theme.rootPath = options.rootPath;
	Theme.filePath = options.filePath;
	Theme.sitePath = options.sitePath;
	
	/* data */
	
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
	
	Theme.currentPath = function () {
		return extractPath(location.href);
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
					
				}, extractPath(href), parseParameters(href));
				
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
						
					}, extractPath(href), parseParameters(href));
					
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
		
		console.timeEnd('open page');
		
	};
	
})();



/* tools */

function historyAPISupport() {
	return !!(window.history && history.pushState);
}

function extractPath(string) {

	var element = document.createElement('a');
	element.href = string;
	string = element.pathname; // path

	string = string.replace(new RegExp('^' + window.theme.rootPath + window.theme.sitePath), ''); // extract content after url root
	string = string.replace(/\/$/, ''); // remove / from end

	if (!string) string = '/';

	return string;

}

function parseParameters(string) {
	
	var query = string.split('?')[1],
		re = /([^&=]+)=?([^&]*)/g,
		params = {},
		e;
	
	while (e = re.exec(query)) {
		var k = decode(e[1]),
			v = decode(e[2]);
		if (k.substring(k.length - 2) === '[]') {
			k = k.substring(0, k.length - 2);
			(params[k] || (params[k] = [])).push(v);
		} else params[k] = v;
	}
	
	return params;
	
	function decode(string) {
		return decodeURIComponent(string.replace(/\+/g, " "));
	}
	
}

/* enhancements */

String.prototype.startsWith = function(needle) {
	return(this.indexOf(needle) === 0);
};

/* api */

window.createTheme = function (options) {
	
	window.theme = new Theme(options);
	window.theme.setup();
	
	/* Open an URL, use Ajax if possible */
	
	window._open = window.open;
	window.open = function (href, target, options) {
		
		console.time('open page');
		
		var theme = window.theme;
		target = window.open.arguments[1] = target || '_self';
		var ajaxPossible = target == '_self' && 1 <= window.open.arguments.length <= 2;
		
		if (ajaxPossible && historyAPISupport() && isIntern(href)) {
			
			history.pushState(null, null, href);
			
			theme.load(function (title, body) {
				
				theme.update(title, body);
				
				window.history.replaceState({
					title: title,
					body: body
				}, title, href);
				
			}, extractPath(href), parseParameters(href));
			
		} else window._open.apply(this, window.open.arguments);
	
		function isIntern(url) {
			var root = theme.rootPath + theme.sitePath,
				fullRoot = theme.host + theme.rootPath + theme.sitePath;
			return fullRoot == url || url.startsWith(fullRoot + '/') || url.startsWith(fullRoot + '?') || root == url || url.startsWith(root + '/') || url.startsWith(root + '?');
		}
	
	};
	
}


})(); // end