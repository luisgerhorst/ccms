$(document).ready(function () {
	
	var routes = [
	
		{
			path: '/',
			templates: ['header.html', 'start.html', 'footer.html'],
			title: 'Install'
		},
		{
			path: '/proxy',
			templates: ['header.html', 'proxy.html', 'footer.html'],
			title: 'Install - Proxy'
		},
		{
			path: '/couchdb',
			templates: ['header.html', 'couchdb.html', 'footer.html'],
			title: 'Install - CouchDB'
		},
		{
			path: '/finished',
			templates: ['header.html', 'finished.html', 'footer.html'],
			title: 'Install - Finished'
		}
		
	];
	
	function views(config) {
	
		var views = {};
	
		views['proxy.html'] = config;
	
		return views;
	
	}
	
	$.ajax({
		url: 'etc/config.json',
		dataType: 'json',
		success: function (config) {
			
			theme.setup({
				path: 'etc/install/theme',
				routes: routes,
				views: views(config)
			});
			
		},
		error: function (jqXHR, textStatus, errorThrown) {
			fatalError('Ajax Error', 'Error <code>' + textStatus + ' ' + errorThrown + '</code> occured while loading <code>' + this.url + '</code>.');
		}
	});

});