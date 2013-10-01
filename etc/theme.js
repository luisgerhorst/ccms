(function () { // start
	
function Theme(options) {
	
	var Theme = this;
	
	/* child classes */
	
	Theme.Template = function (name) {
	
		this.name = name;
		this.cached = null;
	
	}
	
	Theme.Template.prototype = new (function () {
	
		this.get = function (callback) {
			
			if (this.cached) callback(this.cached);
			else {
	
				var Template = this;
				$.ajax({
					url: Theme.rootPath+Theme.filePath + '/' + Template.name,
					error: function (jqXHR, textStatus, errorThrown) {
						fatalError('Rendering Error', 'Unable to load template <code>'+Template.name+'</code>.');
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
	
	Theme.ViewCache = function (initial, read, save, name) {
	
		Theme.viewCaches[name] = initial;
	
		this.read = read;
		this.add = save;
	
	}
	
	Theme.View = function (options, name) {
		
		if (!options.load) {
			
			this.data = options.data;
			this.get = function (callback) {
				callback(this.data);
			};
	
		} else {
			
			this.load = options.load;
			this.cache = options.cache ? new Theme.ViewCache(options.cache.initial, options.cache.read, options.cache.save, name) : false;
			this.get = function (callback, path, parameters) {
	
				var cached = this.cache ? this.cache.read(Theme.viewCaches, path, parameters) : false;
				
				if (cached) callback(cached);
				else {
				
					var View = this;
					this.load(function (response, error) {
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
	
	Theme.Segment = function (name, view) {
		
		this.template = new Theme.Template(name);
		this.view = new Theme.View(view, name);
	
	}
	
	Theme.Segment.prototype = new (function () {
	
		this.load = function (callback, path, parameters) {
	
			var Segment = this;
	
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
	
				view._siteURL = Theme.host+Theme.rootPath+Theme.sitePath;
				view._fileURL = Theme.host+Theme.rootPath+Theme.filePath;
	
				var output = Mustache.render(template, view);
	
				callback(output, view);
	
			}
	
		};
	
	})();
	
	
	/* Route */
	
	Theme.Route = function (options) {
	
		this.path = options.path;
		this.title = options.title;
	
		this.before = options.before || function () {};
		this.templates = options.templates || [];
	
	}
	
	Theme.Route.prototype = new (function () {
	
		this.load = function (callback, path, parameters) {
	
			var Route = this;
	
			var templates = Route.templates;
	
			var toLoad = templates.length,
				body = [],
				views = {};
	
			for (var i = templates.length; i--;) (function (i) {
	
				var template = templates[i];
	
				template.load(function (output, view) {
	
					body[i] = output;
					views[template.template.name] = view;
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
	
	
	this.cacheEnabled = options.cache || {
		views: false,
		templates: true
	};
	
	this.viewCaches = {};
	
	/* urls */
	
	this.host = location.protocol + '//' + location.host;
	this.rootPath = options.rootPath;
	this.filePath = options.filePath;
	this.sitePath = options.sitePath;
	
	/* data */
	
	this.templates = {};
	this.routes = [];
	
	/* templates from views */
	
	for (var name in options.views) this.templates[name] = new Theme.Segment(name, options.views[name]);
	
	/* routes & templates from routes */
	
	for (var i = options.routes.length; i--;) {
		
		var route = options.routes[i],
			templateNames = route.templates || [];
		
		for (var j = templateNames.length; j--;) {
			
			var name = templateNames[j];
			
			if (this.templates[name]) route.templates[j] = this.templates[name];
			else route.templates[j] = this.templates[name] = new Theme.Segment(name, { data: {} });
			
		}
		
		this.routes[i] = new Theme.Route(route);
		
	}
	
	
}

Theme.prototype = new (function () {
	
	this.currentPath = function () {
		return extractPath(location.href);
	};
	
	this.setup = function () {
		
		var Theme = this;
		
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
	
	this.load = function (callback, path, parameters) {
		
		var Theme = this;
		
		var body = $('body');
		body.addClass('changing');
		body.attr('data-status', 'changing');
		
		var route = Theme.searchRoute(path);
		
		if (!route) {
			
			fatalError('Page not found', "The page you were looking for doesn't exist.");
			console.error('No route found', Theme.routes, path);
			
		} else {
			
			var stop = route.before(path, parameters) === false;
			
			if (!stop && route.templates.length) route.load(function (body, views) {
				
				console.log(body, views, route.title);
				
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
	
	this.searchRoute = function (path) {
		
		var Theme = this;
	
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
	
	this.update = function (title, bodyHTML) {
		
		var Theme = this;
		
		document.title = title;
		
		if (bodyHTML) {
			
			var body = $('body');
			body.html(bodyHTML);
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



/* tools */

function historyAPISupport() {
	return !!(window.history && history.pushState);
}

function extractPath(string) {

	var element = document.createElement('a');
	element.href = string;
	string = element.pathname; // path

	string = string.replace(new RegExp('^'+window.theme.rootPath+window.theme.sitePath), ''); // extract content after url root
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
		
		var theme = window.theme;
		
		target = window.open.arguments[1] = target || '_self';
	
		var ajaxPossible = target == '_self' && 1 <= window.open.arguments.length <= 2;
		
		if (ajaxPossible && historyAPISupport() && isIntern(href)) {
			
			history.pushState(null, null, href);
			
			theme.load(function (title, body) {
				
				window.history.replaceState({
					title: title,
					body: body
				}, title, href);
				
				theme.update(title, body);
				
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