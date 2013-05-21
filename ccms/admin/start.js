$(document).ready(function () {
	
	var theme = new Theme('ccms/admin/theme');
	
	$.ajax({
		url: 'config.json'
	}).done(function (config) {
		
		var database = new ((new CouchDB(config.proxy)).Database)(config.database);
		
		theme.views = views(database);
		theme.routes = routes;
		theme.update();
		
	});

});