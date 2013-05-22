$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		couchdb = new CouchDB(config.proxy);
		database = new couchdb.Database(config.database);

		database.read('meta', function (meta, err) {
			if (err) console.log('Error while loading document "meta".', err);
			else {
				
				theme.setup('themes/' + meta.theme, routes, views(database, meta));
				
			}
		});

	});

});