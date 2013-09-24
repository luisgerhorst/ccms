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

function Template(name, viewSource) {
	
	this.name = name;
	this.viewSource = viewSource || {};
	
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
		
		var viewSource = Template.viewSource;
		
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


/* Theme */

function Theme(options) {
	
	var Theme = this;
	
}


/* tools */

function typeOf(variable) {
	return variable === null ? 'null' : typeof variable;
}


})(); // end