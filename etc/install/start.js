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