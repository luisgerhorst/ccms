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
	
	var views = function (config) {
	
		var views = {};
	
		views['proxy.html'] = config;
	
		return views;
	
	}
	
	$.ajax({
		url: 'etc/config.json',
		dataType: 'json',
		error: function (jqXHR, textStatus, errorThrown) {
			notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
		},
	}).done(function (config) {
		
		theme.setup({
			path: 'etc/install/theme',
			routes: routes,
			views: views(config)
		});
		
	});

});