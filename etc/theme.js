(function () { // start
	
/*

Specs:

	URL
	
	theme.host
	actually protocol, host and port
	theme.rootPath
	relative to host
	theme.filePath
	relative to root
	theme.sitePath
	relative to root
	
	theme.open(href, target)
	Open URL with ajax or native js, target not required
	
	theme.update(title, body)
	Update body

*/


/* Template */

function Template(name, view) {
	
	/* test */
	
	var validName = validate(name, 'string'),
		noView = !view,
		validView = validate(view, ['function', 'object']);
	
	/* decide */
	
	if (validName) this.name = name;
	else throw 'Invalid view paramenter of Template, name must be a string.';
	
	if (noView) this.view = {};
	else if (validView) this.view = view;
	else throw 'Invalid view paramenter of Template, view has to be an object, a function or not defined.';
	
	/* tools */
	
	function validate(variable, type) {
		
		var typeOfVariable = typeOf(variable);
		
		if (type instanceof Array) {
			
			for (var i = type.length; i--;) if (typeOfVariable == type[i]) return true;
			return false;
			
		} else if (typeOf(type) == 'string') {
			
			if (typeOfVariable == type) return true;
			return false;
			
		}
		
	}
	
}

Template.prototype = new (function () {

	this.load = function (callback, path) {
		
		var Template = this;
		
		/* unique vars */
		
		var toLoad = 2,
			template = null,
			view = {};
		
		/* template */
		
		$.ajax({
			url: Theme.rootPath+Theme.filePath + '/' + Template.name,
			success: function (response) {
				template = response;
				if (!(toLoad--)) done();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log('Error '+textStatus+' '+errorThrown+' occured while loading '+this.url, jqXHR);
				fatalError('Rendering Error', 'Unable to load template <code>'+Template.name+'</code>.');
			}
		});
		
		/* view */
		
		var viewSource = Template.view;
		
		switch (typeOf(viewSource)) {
			
			case 'function':
				viewSource(function (response, error) {
					
					if (error) {
						console.log('View source returned error.', error);
						fatalError(error.heading || 'Error', error.message || 'Could not load page content.');
					} else {
						view = response;
						if (!(toLoad--)) done();
					}
					
				}, path);
				break;
			
			case 'object':
				view = viewSource;
				if (!(toLoad--)) done();
				break;
			
		}
		
		/* done */
		
		function done() {
			
			view._host = Theme.host;
			view._rootPath = Theme.rootPath;
			view._sitePath = Theme.sitePath;
			view._filePath = Theme.filePath;
			
			view._siteURL = Theme.host+Theme.rootPath+Theme.sitePath;
			view._fileURL = Theme.host+Theme.rootPath+Theme.filePath;
			
			callback(Mustache.render(template, view), view);
			
		}
		
	}; // load

})(); // Template prototype


function Theme(options) {
	
	var Theme = this;
	
}


/* tools */

function typeOf(variable) {
	return variable === null ? 'null' : typeof variable;
}


})(); // end