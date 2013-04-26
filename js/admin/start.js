$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		var template = new Template();
		
		login(template, config, function (couchdb) {
			
			couchdb.read('meta', function (meta, error) {
			
				if (error) console.log('Error while loading document "meta".', error);
			
				else {
					render(template, couchdb, meta);
					setRoutes(template, couchdb, meta);
					template.load();
				}
			
			});
			
		});

	});

});