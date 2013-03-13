
var Template = function (meta) {
	
	var currentPath = function () {
		var url = document.URL;
		if (/#.+$/.test(url)) return url.replace(/^.*#/, ''); // path will be everything after "#"
		else return '/';
	};
	
	var pages = [];
	
	var reload = function () { // called when the path changes
		
		var path = currentPath();
		
		for (var i = pages.length; i--;) { // counts down from array.length-1 to 0
			
			var page = pages[i];
			
			if (page.pathRegExp.test(path)) {
				page.render(path);
				i = 0; // stop the loop
			}
			
		}
		
	}
	
	var header = Mustache.render($('script[data-template-name="header"]').html(), meta);
	var footer = Mustache.render($('script[data-template-name="footer"]').html(), meta);
	
	var createPage = function (pathRegExp, templateName, load) {
		
		var render = function (path) {
			
			var template = $('script[data-template-name="' + templateName + '"]').html();
			
			load(function (view) {
				
				var content = Mustache.render(template, view);
				
				var body = header + content + footer;
				
				$('body').html(body);
				
			}, path);
			
		};
		
		pages.push({ pathRegExp: pathRegExp, render: render });
		
	};
	
	// Actions
	
	$(window).hashchange(function(){
		reload();
	});
	
	this.reload = reload;
	this.createPage = createPage;
	
};
