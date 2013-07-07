$(document).ready(function () {
	
	var routes = [
	
		{
			path: '/',
			templates: ['header.html', 'start.html', 'footer.html'],
			title: 'Install'
		},
		{
			path: '/configure-proxy',
			templates: ['header.html', 'configure-proxy.html', 'footer.html'],
			title: 'Install - Configure Proxy'
		},
		{
			path: '/create-admin',
			templates: ['header.html', 'create-admin.html', 'footer.html'],
			title: 'Install - Create Admin'
		},
		{
			path: '/set-up-database',
			templates: ['header.html', 'set-up-database.html', 'footer.html'],
			title: 'Install - Set Up Database'
		}
		
	];
	
	var views = function (config) {
	
		var views = {};
	
		views['configure-proxy.html'] = config;
	
		return views;
	
	}
	
	$.ajax({
		url: 'etc/config.json'
	}).done(function (config) {
		
		theme.setup('etc/install/theme', routes, views(config));
		
	});

});