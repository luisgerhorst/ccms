$(document).ready(function () {
	
	var routes = [
	
		{
			path: '/',
			before: function () {
				window.location = '#/server';
			}
		},
		{
			path: '/database',
			templates: ['header.html', 'database.html', 'footer.html'],
			title: 'Install - Database'
		},
		{
			path: '/server',
			templates: ['header.html', 'server.html', 'footer.html'],
			title: 'Install - Server'
		}
		
	];
	
	var views = function (config) {
	
		var views = {};
	
		views['database.html'] = config;
	
		return views;
	
	}
	
	$.ajax({
		url: 'etc/config.json'
	}).done(function (config) {
		
		theme.setup('etc/install/theme', routes, views(config));
		
	});

});