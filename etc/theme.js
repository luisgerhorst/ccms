(function () { // start


/* Template */

function Template(name, viewSource) {
	
	this.name = name;
	this.viewSource = viewSource || {};
	
}

Template.prototype = new (function () {

	this.load = function (callback, path) {
		
		console.log('load template', this);
		
		var Template = this;
		
		/* unique vars */
		
		var toLoad = 2,
			template = null,
			view = {};
		
		/* template */
		
		$.ajax({
			url: window.theme.rootPath+window.theme.filePath + '/' + Template.name,
			error: function (jqXHR, textStatus, errorThrown) {
				fatalError('Rendering Error', 'Unable to load template <code>'+Template.name+'</code>.');
				throw 'Ajax error';
			},
			success: function (response) {
				template = response;
				toLoad--;
				if (!toLoad) done();
			}
		});
		
		/* view */
		
		var viewSource = Template.viewSource;
		
		switch (typeOf(viewSource)) {
			
			case 'function':
				viewSource(function (response, error) {
					
					if (error) {
						fatalError(error.heading || 'Error', error.message || 'Could not load page content.');
						throw 'View source function returned error.';
					} else {
						view = response;
						toLoad--;
						if (!toLoad) done();
					}
					
				}, path);
				break;
			
			case 'object':
				view = viewSource;
				toLoad--;
				if (!toLoad) done();
				break;
			
			default:
				throw 'No valid view source.';
			
		}
		
		function typeOf(v) {
			return v === null ? 'null' : typeof v;
		}
		
		/* done */
		
		function done() {
			
			console.log('template done');
			
			view._host = window.theme.host;
			view._rootPath = window.theme.rootPath;
			view._sitePath = window.theme.sitePath;
			view._filePath = window.theme.filePath;
			
			view._siteURL = window.theme.host+window.theme.rootPath+window.theme.sitePath;
			view._fileURL = window.theme.host+window.theme.rootPath+window.theme.filePath;
			
			var output = Mustache.render(template, view);
			
			callback(output, view);
			
		}
		
	};

})();


/* Route */

function Route(options) {

	this.path = options.path;
	this.title = options.title;

	this.before = options.before || function () {};
	this.done = options.done || function () {};
	this.templates = options.templates || [];

}

Route.prototype = new (function () {
	
	this.load = function (loaded, path) {
		
		var Route = this;
		
		var templates = Route.templates;
		
		var toLoad = templates.length,
			body = [],
			views = {};
		
		function templateLoaded() {
			
			console.log('temaplet loaded (in route)');
			
			toLoad--;
			if (!toLoad) loaded(stringifyArray(body), views);
			
			/* create string from array */
			function stringifyArray(array) {
				var string = '', length = array.length;
				for (var i = 0; i < length; i++) string += array[i] || '';
				return string;
			}
			
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
	
})();


/* Theme */

function Theme(options) {
	
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
			
			if (isEmpty) Theme.load(extractPath(location.href));
			
			if (historyAPISupport()) window.addEventListener('popstate', function (event) { // back
				Theme.load(extractPath(location.href));
			});
			
		});
		
	};
	
	/* Open an URL, use Ajax if possible */
	
	this.open = function (href, target) {
		
		var Theme = this;
	
		console.log('Open', href, target);
	
		if ((!target || target == '_self') && historyAPISupport() && isIntern(href)) {
	
			history.pushState(null, null, href);
			Theme.load(extractPath(href));
	
		} else {
	
			target = target || '_self';
			window.open(href, target);
	
		}
	
		function isIntern(n) {
			var r = Theme.rootPath+Theme.sitePath,
				fr = Theme.host+Theme.rootPath+Theme.sitePath;
			return fr == n || new RegExp('^'+fr+'/.*$').test(n) || new RegExp('^'+fr+'\?.*$').test(n) || r == n || new RegExp('^'+r+'/.*$').test(n) || new RegExp('^'+r+'\?.*$').test(n); // prot://host/root, prot://host/root/, prot://host/root/..., root root/ root/...
		}
	
	};
	
	/* Load the body & title for a path, call update */
	
	this.load = function (path) {
		
		var Theme = this;
		
		console.log('Load', path);
		
		$('body').addClass('changing');
		$('body').attr('data-status', 'changing');
		
		var route = Theme.searchRoute(path);
		
		if (!route) {
			
			fatalError('Page not found', "The page you were looking for doesn't exist.");
			throw 'No route found';
			
		} else {
			
			console.log('... Route Found');
			var stop = route.before(path) === false;
			
			if (!stop && route.templates.length) route.load(function (body, views) {
				
				console.log('route loaded', body, views);
				
				var title = Mustache.render(route.title, validateObjectKeys(views));
				Theme.update(title, body);
				route.done(views, path);
				
				/* replace dots in object keys by _ */
				function validateObjectKeys(object) {
					var validatedObject = {};
					for (var key in object) validatedObject[key.replace('.', '_')] = object[key];
					return validatedObject;
				}
				
			}, path); else if (!stop) {
				
				Theme.update(route.title);
				route.done(null, path);
				
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
	
	/* Update body & title and set link event handlers for Ajax */
	
	this.update = function (title, body) {
		
		var Theme = this;
		
		document.title = title;
		
		if (body) {
			
			$('body').html(body);
			$('body').removeClass('changing');
			$('body').attr('data-status', 'filled');
			
			console.log('Updated to "' + title + '"');
			
			if (historyAPISupport()) $('a').click(function () {
				Theme.open(this.href, this.target);
				return false;
			});
			
		}
		
	};
	
})();


/* tools */

/* check if HTML5 History API is supported */
function historyAPISupport() {
	return !!(window.history && history.pushState);
}

/* get CCMS path from an URL */
function extractPath(s) {

	var e = document.createElement('a');
	e.href = s;
	s = e.pathname; // path

	s = s.replace(new RegExp('^'+window.theme.rootPath+window.theme.sitePath), ''); // extract content after url root
	s = s.replace(/\/$/, ''); // remove / from end

	if (!s) s = '/';

	return s;

}


/* api */

window.theme = {
	setup: function (options) {
		window.theme = new Theme(options);
		window.theme.setup();
	}
};


})(); // end