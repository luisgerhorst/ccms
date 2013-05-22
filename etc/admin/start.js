$(document).ready(function () {
	
	$.ajax({
		url: 'config.json'
	}).done(function (config) {
		
		var database = new (new CouchDB(config.proxy)).Database(config.database);
		
		theme.setup('etc/admin/theme', routes, views(database));
		
	});

});