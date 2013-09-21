$(document).ready(function () {
	
	var routes = [
	
		{
			path: '/',
			templates: ['header.html', 'start.html', 'footer.html'],
			title: 'Install'
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
		url: '_root/config.json',
		dataType: 'json',
		success: function (config) {
			
			window.theme.setup({
				rootPath: config.root,
				sitePath: '/install',
				filePath: '/etc/install/theme',
				routes: routes,
				views: views(config),
				log: ['error', 'info']
			});
			
		},
		error: function (jqXHR, textStatus, errorThrown) {
			fatalError('Ajax Error', 'Error <code>' + textStatus + ' ' + errorThrown + '</code> occured while loading <code>' + this.url + '</code>.');
		}
	});

});