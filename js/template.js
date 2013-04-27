
var Template = function () {
	
	var currentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) {
			url = url.replace(/^.*#/, '').replace(/\/$/, '');
			if (url === '') url = '/';
		} else url = '/';
		return url;
	};
	
	var routes = [];
	/*
		{
			path, // String, Function or RegExp
			[templateIDs], // array of template IDs that should be rendered when the RegExp matches the current URL
			done(views), // executed when everything is loaded
			before()
		}
	*/
	
	var templates = {};
	/*
		key: "templateID" // id of the template
		value: load() // function to load the required data for this template
	*/
	
	var render = function (templateIDs, doneFunc, beforeFunc) {
		
		var stringify = function (array) {
			var string = '';
			var length = array.length;
			for (var i = 0; i < length; i++) string += array[i] || '';
			return string;
		};
		
		beforeFunc(currentPath());
		
		var views = {}; // contains the views of all loaded templates, using the templateID as key
		
		if (templateIDs.length >= 1) { // if templateIDs isn't empty
		
			var html = [];
			var jQueryBody = $('body');
			
			var ready = function () {
				
				jQueryBody.html(stringify(html));
				
				var done = true;
				if (html.length !== templateIDs.length) done = false;
				else for (var j = html.length; j--;) if (typeof html[j] !== 'string') done = false;
				if (done) doneFunc(views, currentPath()); // if every template is rendered
				
			};
			
			$.each(templateIDs, function(i, templateID) {
				
				var view = templates[templateID];
				
				var template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
				
				var type = typeof view;
				if (view === null) type = 'null'; // typeof null === 'object'
				
				switch (type) {
					case 'function':
						view(function (response) {
							html[i] = Mustache.render(template, response);
							views[templateID] = response;
							ready();
						}, currentPath());
						break;
					case 'object':
						html[i] = Mustache.render(template, view);
						views[templateID] = view;
						ready();
						break;
					default:
						html[i] = template;
						views[templateID] = {};
						ready();
						break;
				}
				
			});
			
		} else doneFunc(views, currentPath()) // if no template should be rendered -> execute done function
	
	};
	
	var reload = function () { // called when the path changes
		
		var cPath = currentPath();
		
		for (var i = routes.length; i--;) { // counts down from array.length-1 to 0, this is IMPORTANT to make shure new routes overwrite older routes
			
			var route = routes[i];
			var path = route.path;
			
			var type = typeof path;
			if (path instanceof RegExp) type = 'regexp';
			else if (path instanceof Array) type = 'array';
			else if (path === null) type = 'null';
			
			var match = function () {
				render(route.templateIDs, route.done, route.before); // render the templates into the body
				i = 0; // stop the loop
			};
			
			switch (type) {
				case 'string':
					if (path == cPath) match();
					break;
				case 'regexp':
					if (path.test(cPath)) match();
					break;
				case 'array':
					var l = path.length; // length
					for (var j = 0; j < l; j++) {
						var p = path[j]; // path
						if (typeof p === 'string' && p === cPath) match();
						else if (p instanceof RegExp && p.test(cPath)) match();
					}
					break;
				case 'function':
					if (path(cPath)) match();
					break;
			}
			
		}
		
	}
	
	var addRoute = function (path, templateIDs, done, before) {
		
		var addParams = function (path, templateIDs, done, before) {
			
			if (!(templateIDs instanceof Array)) templateIDs = [];
			if (typeof done !== 'function') done = function () {};
			if (typeof before !== 'function') before = function () {};
			
			routes.push({
				path: path,
				templateIDs: templateIDs,
				done: done,
				before: before
			});
			
		};
		
		var addObj = function (obj) {
			
			var route = {
				path: false,
				templates: [],
				done: function () {},
				before: function () {}
			};
			
			for (var i in obj) route[i] = obj[i];
			
			routes.push({
				path: route.path,
				templateIDs: route.templates,
				done: route.done,
				before: route.before
			});
			
		};
		
		if (path instanceof Array && typeof path[0] !== 'string' && !(path[0] instanceof RegExp)) { // array, contains no string/regexp
			
			console.log('array', path);
			
			var array = path;
			var l = array.length;
			for (var i = 0; i < l; i++) addObj(array[i]);
			
		}
		
		else if (typeof path === 'object' && !(path instanceof RegExp) && !(path instanceof Array)) addObj(path); // object, no array/regexp
		
		else addParams(path, templateIDs, done, before);
		
		reload();
		
	};
	
	var addTemplateView = function (id, view) {
		
		if (typeof id === 'object' && typeof view === 'undefined') {
			var views = id;
			for (var i in views) templates[i] = views[i];
		}
		
		else templates[id] = view;
		
	}
	
	// Actions
	
	/* url change detection via http://stackoverflow.com/questions/2161906/handle-url-anchor-change-event-in-js */
	if ('onhashchange' in window) { // event supported?
		window.onhashchange = function () {
			reload();
		}
	} else { // event not supported:
		var hash = window.location.hash;
		window.setInterval(function () {
			if (window.location.hash != hash) {
				hash = window.location.hash;
				reload();
			}
		}, 100);
	} 
	
	this.load = reload;
	this.route = addRoute;
	this.render = addTemplateView;
	this.currentPath = currentPath;
	
};
