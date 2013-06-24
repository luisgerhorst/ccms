$(document).ready(function () {
	
	var routes = [
	
		{
			path: '/',
			before: function () {
				window.location = '#/setup-db'
			}
		},
		{
			path: '/setup-db',
			templates: ['header.html', 'setupdb.html', 'footer.html'],
			title: 'Install'
		}
		
	];
	
	var views = function (config) {
	
		var views = {};
	
		views['setupdb.html'] = config;
	
		return views;
	
	}
	
	$.ajax({
		url: 'config.json'
	}).done(function (config) {
		
		theme.setup('etc/install/theme', routes, views(config));
		
	});

});