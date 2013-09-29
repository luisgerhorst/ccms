(function () { // start


/* Template */

function Template(name, viewSource) {
	
	this.name = name;
	this.viewSource = viewSource || {};
	
	this.template = null;
	this.viewCache = {};
	
}

Template.prototype = new (function () {

	this.load = function (callback, path, parameters) {
		
		var Template = this;
		
		/* unique vars */
		
		var reqHash = JSON.stringify({
			path: path,
			parameters: parameters
		});
		
		var toLoad = 2;
		
		/* template */
		
		if (Template.template && window.theme.cache.templates) {
			
			/* cached */
			
			if (nothingToLoad()) done();
			
		} else {
			
			/* not cached */
			
			$.ajax({
				url: window.theme.rootPath+window.theme.filePath + '/' + Template.name,
				error: function (jqXHR, textStatus, errorThrown) {
					fatalError('Rendering Error', 'Unable to load template <code>'+Template.name+'</code>.');
					throw 'Ajax error';
				},
				success: function (response) {
					
					Template.template = response;
					if (nothingToLoad()) done();
					
				}
			});
			
		}
		
		/* view */
		
		if (Template.viewCache[reqHash] && window.theme.cache.views) {
			
			/* cached */
			
			if (nothingToLoad()) done();
			
		} else {
			
			/* not cached */
		
			var viewSource = Template.viewSource;
			
			switch (typeOf(viewSource)) {
				
				case 'function':
					viewSource(function (response, error) {
						if (error) {
							fatalError(error.heading || 'Error', error.message || 'Unable to load content of page.');
							throw 'View source function returned error.';
						} else {
							
							Template.viewCache[reqHash] = response;
							if (nothingToLoad()) done();
							
						}
						
					}, path, parameters);
					break;
				
				case 'object':
					
					Template.viewCache[reqHash] = viewSource;
					if (nothingToLoad()) done();
					
					break;
				
				default:
					throw 'No valid view source.';
				
			}
			
			function typeOf(v) {
				return v === null ? 'null' : typeof v;
			}
			
		}
		
		/* done */
		
		function done() {
			
			var view = Template.viewCache[reqHash],
				template = Template.template;
			
			view._host = window.theme.host;
			view._rootPath = window.theme.rootPath;
			view._sitePath = window.theme.sitePath;
			view._filePath = window.theme.filePath;
			
			view._siteURL = window.theme.host+window.theme.rootPath+window.theme.sitePath;
			view._fileURL = window.theme.host+window.theme.rootPath+window.theme.filePath;
			
			var output = Mustache.render(template, view);
			
			callback(output, view);
			
		}
		
		/* tools */
		
		function nothingToLoad() {
			toLoad--;
			return !toLoad;
		}
		
	};

})();


/* Route */

function Route(options) {

	this.path = options.path;
	this.title = options.title;

	this.before = options.before || function () {};
	this.templates = options.templates || [];

}

Route.prototype = new (function () {
	
	this.load = function (loaded, path, parameters) {
		
		var Route = this;
		
		var templates = Route.templates;
		
		var toLoad = templates.length,
			body = [],
			views = {};
		
		for (var i = templates.length; i--;) (function (i) {
			
			var template = templates[i];
			
			template.load(function (output, view) {
				
				body[i] = output;
				views[template.name] = view;
				if (nothingToLoad()) loaded(stringifyArray(body), views);
				
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


/* Theme */

function Theme(options) {
	
	this.cache = options.cache || {
		views: false,
		templates: true
	};
	
	/* urls */
	
	this.host = location.protocol + '//' + location.host;
	this.rootPath = options.rootPath;
	this.filePath = options.filePath;
	this.sitePath = options.sitePath;
	
	/* data */
	
	this.templates = {};
	this.routes = [];
	
	/* templates from views */
	
	for (var name in options.views) this.templates[name] = new Template(name, options.views[name]);
	
	/* routes & templates from routes */
	
	for (var i = options.routes.length; i--;) {
		
		var route = options.routes[i],
			templateNames = route.templates || [];
		
		for (var j = templateNames.length; j--;) {
			
			var name = templateNames[j];
			
			if (this.templates[name]) route.templates[j] = this.templates[name];
			else route.templates[j] = this.templates[name] = new Template(name);
			
		}
		
		this.routes[i] = new Route(route);
		
	}
	
}

Theme.prototype = new (function () {
	
	this.currentPath = function () {
		return extractPath(location.href);
	};
	
	this.setup = function () {
		
		var Theme = this;
		
		/* get head */
		
		new Template('head.html').load(function (output) {
			
			$('head').append(output);
			
			var isEmpty = $('body').attr('data-status') == 'empty';
			
			if (isEmpty) Theme.load(extractPath(location.href), parseParameters(location.href));
			
			if (historyAPISupport()) window.addEventListener('popstate', function (event) { // back
				Theme.load(extractPath(location.href), parseParameters(location.href));
			});
			
		});
		
	};
	
	/* Load the body & title for a path, call update */
	
	this.load = function (path, parameters) {
		
		var Theme = this;
		
		var body = $('body');
		body.addClass('changing');
		body.attr('data-status', 'changing');
		
		console.time('Search route');
		var route = Theme.searchRoute(path);
		console.timeEnd('Serach route');
		
		if (!route) {
			
			fatalError('Page not found', "The page you were looking for doesn't exist.");
			throw 'No route found';
			
		} else {
			
			var stop = route.before(path, parameters) === false;
			
			if (!stop && route.templates.length) route.load(function (body, views) {
				
				var title = Mustache.render(route.title, validateObjectKeys(views));
				Theme.update(title, body);
				
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

/* api */

window.createTheme = function (options) {
	
	window.theme = new Theme(options);
	window.theme.setup();
	
	/* Open an URL, use Ajax if possible */
	
	window._open = window.open;
	window.open = function (href, target, options) {
		
		target = window.open.arguments[1] = target || '_self';
	
		var ajaxPossible = target == '_self' && 1 <= window.open.arguments.length <= 2;
		
		if (ajaxPossible && historyAPISupport() && isIntern(href)) {
			history.pushState(null, null, href);
			window.theme.load(extractPath(href), parseParameters(href));
		} else window._open.apply(this, window.open.arguments);
	
		function isIntern(n) {
			var r = window.theme.rootPath+window.theme.sitePath,
				fr = window.theme.host+window.theme.rootPath+window.theme.sitePath;
			return fr == n || new RegExp('^'+fr+'/.*$').test(n) || new RegExp('^'+fr+'?.*$').test(n) || r == n || new RegExp('^'+r+'/.*$').test(n) || new RegExp('^'+r+'?.*$').test(n);
		}
	
	};
	
}


})(); // end