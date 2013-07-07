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
			path: '/create-user',
			templates: ['header.html', 'create-user.html', 'footer.html'],
			title: 'Install - Create User'
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