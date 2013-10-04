<<<<<<< HEAD
(function(){function b(l){var k=this;k.Template=function(j){var n=this;n.name=j;n.cached=null};k.Template.prototype=new (function(){this.get=function(n){var j=this;if(this.cached){n(this.cached)}else{$.ajax({url:k.rootPath+k.filePath+"/"+j.name,error:function(o,q,p){fatalError("Rendering Error","Unable to load template <code>"+j.name+"</code>.");throw"Ajax error"},success:function(o){j.cached=o;n(o)}})}}})();k.ViewCache=function(o,q,p,n){var j=this;k.viewCaches[n]=o;j.read=q;j.add=p};k.View=function(n,j){var o=this;if(!n.load){o.data=n.data;o.get=function(p){p(o.data)}}else{o.load=n.load;o.cache=n.cache?new k.ViewCache(n.cache.initial,n.cache.read,n.cache.save,j):false;o.get=function(s,r,q){var p=o.cache?o.cache.read(k.viewCaches,r,q):false;if(p){s(p)}else{o.load(function(u,v){if(v){fatalError(v.heading||"Error",v.message||"Unable to load content of page.");throw"View load function returned error."}else{if(o.cache){var t=k.viewCaches[j];t=o.cache.add(u,t,r,q)}s(u)}},r,q)}}}};k.Segment=function(n,j){var o=this;o.template=new k.Template(n);o.view=new k.View(j,n)};k.Segment.prototype=new (function(){var j=this;j.load=function(t,v,u){var p=this;var n=2,s=null,r=null;p.template.get(function(w){s=w;if(o()){q()}});p.view.get(function(w){r=w;if(o()){q()}},v,u);function o(){n--;return !n}function q(){r._host=k.host;r._rootPath=k.rootPath;r._sitePath=k.sitePath;r._filePath=k.filePath;r._siteURL=k.host+k.rootPath+k.sitePath;r._fileURL=k.host+k.rootPath+k.filePath;var w=Mustache.render(s,r);t(w,r)}}})();k.Route=function(j){var n=this;n.path=j.path;n.title=j.title;n.before=j.before||function(){};n.segments=j.templates||[]};k.Route.prototype=new (function(){var j=this;j.load=function(u,x,v){var t=this;var q=t.segments;var o=q.length,s=[],w={};for(var p=q.length;p--;){(function(y){var z=q[y];z.load(function(B,A){s[y]=B;w[z.template.name]=A;if(n()){u(r(s),w)}},x,v)})(p)}function n(){o--;return !o}function r(B){var y="",A=B.length;for(var z=0;z<A;z++){y+=B[z]||""}return y}}})();k.viewCaches={};k.host=location.protocol+"//"+location.host;k.rootPath=l.rootPath;k.filePath=l.filePath;k.sitePath=l.sitePath;k.segments={};k.routes=[];for(var h in l.views){k.segments[h]=new k.Segment(h,l.views[h])}for(var m=l.routes.length;m--;){var f=l.routes[m],e=f.templates||[];for(var g=e.length;g--;){var h=e[g];if(k.segments[h]){f.templates[g]=k.segments[h]}else{f.templates[g]=k.segments[h]=new k.Segment(h,{data:{}})}}k.routes[m]=new k.Route(f)}}b.prototype=new (function(){var e=this;e.currentPath=function(){return a(location.href)};e.setup=function(){var f=this;new f.Segment("head.html",{data:{}}).load(function(h){$("head").append(h);var j=$("body").attr("data-status")=="empty";if(j){var g=location.href;f.load(function(l,k){window.history.replaceState({title:l,body:k},l,g);f.update(l,k)},a(g),c(g))}if(d()){window.addEventListener("popstate",function(m){if(m.state){var n=m.state.title,k=m.state.body;f.update(n,k)}else{var l=location.href;f.load(function(p,o){window.history.replaceState({title:p,body:o},p,l);f.update(p,o)},a(l),c(l))}})}})};e.load=function(m,l,k){var h=this;var f=$("body");f.addClass("changing");f.attr("data-status","changing");var g=h.searchRoute(l);if(!g){fatalError("Page not found","The page you were looking for doesn't exist.");console.error("No route found",h.routes,l)}else{var j=g.before(l,k)===false;if(!j&&g.segments.length){g.load(function(n,o){var q=Mustache.render(g.title,p(o));m(q,n);function p(s){var r={};for(var t in s){r[t.replace(".","_")]=s[t]}return r}},l,k)}else{if(!j){h.update(g.title)}}}};e.searchRoute=function(m){var k=this;for(i=k.routes.length;i--;){var g=k.routes[i];switch(g.path instanceof RegExp?"regexp":g.path instanceof Array?"array":typeof g.path){case"string":if(g.path===m||new RegExp("^route.path?").test(m)){return g}break;case"regexp":if(g.path.test(m)){return g}break;case"array":var f=g.path;for(var h=f.length;h--;){var l=f[h];if(typeof l==="string"&&l===m){return g}else{if(l instanceof RegExp&&l.test(m)){return g}}}break;case"function":if(g.path(m)){return g}break}}return null};e.update=function(j,g){var h=this;document.title=j;if(g){document.body.innerHTML=g;var f=$("body");f.html(g);f.removeClass("changing");f.attr("data-status","filled");if(d()){$("a").click(function(k){k.preventDefault();$(this).addClass("changer");window.open(this.href,this.target)})}}console.timeEnd("open page")}})();function d(){return !!(window.history&&history.pushState)}function a(e){var f=document.createElement("a");f.href=e;e=f.pathname;e=e.replace(new RegExp("^"+window.theme.rootPath+window.theme.sitePath),"");e=e.replace(/\/$/,"");if(!e){e="/"}return e}function c(h){var l=h.split("?")[1],j=/([^&=]+)=?([^&]*)/g,o={},n;while(n=j.exec(l)){var g=m(n[1]),f=m(n[2]);if(g.substring(g.length-2)==="[]"){g=g.substring(0,g.length-2);(o[g]||(o[g]=[])).push(f)}else{o[g]=f}}return o;function m(e){return decodeURIComponent(e.replace(/\+/g," "))}}String.prototype.startsWith=function(e){return(this.indexOf(e)===0)};window.createTheme=function(e){window.theme=new b(e);window.theme.setup();window._open=window.open;window.open=function(f,l,g){console.time("open page");var k=window.theme;l=window.open.arguments[1]=l||"_self";var h=l=="_self"&&1<=window.open.arguments.length<=2;if(h&&d()&&j(f)){history.pushState(null,null,f);k.load(function(n,m){k.update(n,m);window.history.replaceState({title:n,body:m},n,f)},a(f),c(f))}else{window._open.apply(this,window.open.arguments)}function j(n){var m=k.rootPath+k.sitePath,o=k.host+k.rootPath+k.sitePath;return o==n||n.startsWith(o+"/")||n.startsWith(o+"?")||m==n||n.startsWith(m+"/")||n.startsWith(m+"?")}}}})();
=======
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
>>>>>>> dev
