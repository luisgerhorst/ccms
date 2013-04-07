
var Template = function () {
	
	var currentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) return url.replace(/^.*#/, ''); // path will be everything after "#"
		else return '/';
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
			for (var i = 0; i < length; i++) string += array[i];
			return string;
		};
		
		beforeFunc();
		
		var html = [];
		var views = {}; // contains the views of all loaded templates, using the templateID as key
		
		if (templateIDs.length > 0) { // if templateIDs isn't empty
			
			$.each(templateIDs, function(i, templateID) {
				
				var view = templates[templateID];
				
				var template = $('script[type="text/ccms-template"][data-template-id="' + templateID + '"]').html();
				
				var ready = function () {
					
					$('body').html(stringify(html));
					
					var done = true;
					if (html.length != templateIDs.length) done = false;
					else for (var j = html.length; j--;) if (typeof html[j] !== 'string') done = false;
					if (done) doneFunc(views); // if every template is rendered
					
				};
				
				var type = typeof view;
				if (view == null) type = 'null'; // because typeof null returns object
				
				console.log(type, view);
				
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
			
		} else doneFunc(views) // if no template should be rendered -> execute done function
	
	};
	
	var reload = function () { // called when the path changes
		
		var cPath = currentPath();
		
		for (var i = routes.length; i--;) { // counts down from array.length-1 to 0, this is IMPORTANT to make shure new routes overwrite older routes
			
			var route = routes[i];
			var path = route.path;
			
			var type = typeof path;
			if (path instanceof RegExp) type = 'regexp';
			
			var found = function () {
				render(route.templateIDs, route.done, route.before); // render the templates into the body
				i = 0; // stop the loop
			};
			
			switch (type) {
				case 'string':
					if (path == cPath) found();
					break;
				case 'regexp':
					if (path.test(cPath)) found();
					break;
				case 'function':
					if (path(cPath)) found();
					break;
			}
			
		}
		
	}
	
	var addRoute = function (path, templateIDs, done, before) {
		
		if (templateIDs == null) templateIDs = [];
		if (typeof done === 'undefined' || done == null) done = function () {};
		if (typeof before === 'undefined') before = function () {};
		
		routes.push({ path: path, templateIDs: templateIDs, done: done, before: before });
		
	};
	
	var addTemplateView = function (id, view) {
		
		templates[id] = view;
		
	}
	
	// Actions
	
	$(window).hashchange(reload);
	
	$('script[type="text/ccms-template"]').each(function() {
		
		var id = $(this).data('template-id');
		templates[id] = null;
		
	});
	
	this.load = reload;
	this.route = addRoute;
	this.render = addTemplateView;
	this.currentPath = currentPath;
	
};
