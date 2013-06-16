$(document).ready(function () {
	
	$.ajax({
		url: 'config.json'
	}).done(function (config) {
		
		theme.setup('etc/install/theme', routes, views(config));
		
	});

});