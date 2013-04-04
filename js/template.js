
var Template = function () {
	
	var currentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) return url.replace(/^.*#/, ''); // path will be everything after "#"
		else return '/';
	};
	
	var routes = [];
	/*
		{
			/pathRegExp/, // RegExp for the path
			[templateIDs] // array of template IDs that should be rendered when the RegExp matches the current URL
		}
	*/
	
	var templates = {};
	/*
		key: "templateID" // id of the template
		value: load() // function to load the required data for this template
	*/
	
	var render = function (templateIDs, doneFunc) {
		
		var stringify = function (array) {
			
			var string = '';
			var length = array.length;
			for (var i = 0; i < length; i++) string += array[i];
			return string;
			
		}; // stringify an array
		
		var html = [];
		var views = {}; // contains the views of all loaded templates, using the templateID as key
		
		if (templateIDs.length > 0) {
			
			$.each(templateIDs, function(i, templateID) {
				
				var load = templates[templateID];
				
				var template = $('script[data-template-id="' + templateID + '"]').html();
				
				load(function (view) {
					
					html[i] = Mustache.render(template, view);
					views[templateID] = view;
					
					$('body').html(stringify(html));
					
					var done = true;
					if (html.length != templateIDs.length) done = false;
					else for (var j = html.length; j--;) if (html[j] == null) done = false;
					if (done) doneFunc(views); // if every template is rendered
					
				}, currentPath());
				
			});
			
		}
		
		else doneFunc(views) // if no template should be rendered -> execute done function
	
	};
	
	var reload = function () { // called when the path changes
		
		var path = currentPath();
		
		for (var i = routes.length; i--;) { // counts down from array.length-1 to 0
			
			var route = routes[i];
			
			if (route.pathRegExp.test(path)) {
				render(route.templateIDs, route.func); // render the templates into the body
				i = 0; // stop the loop
			}
			
		}
		
	}
	
	var addRoute = function (pathRegExp, templateIDs, func) {
		
		if (typeof func === "undefined") func = function () {};
		
		routes.push({ pathRegExp: pathRegExp, templateIDs: templateIDs, func: func });
		
	};
	
	var addTemplateView = function (templateID, load) {
		
		templates[templateID] = load;
		
	}
	
	// Actions
	
	$(window).hashchange(reload);
	
	this.load = reload;
	this.route = addRoute;
	this.render = addTemplateView;
	this.currentPath = currentPath;
	
};
