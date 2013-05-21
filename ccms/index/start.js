$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		couchdb = new CouchDB(config.proxy);
		database = new couchdb.Database(config.database);

		database.read('meta', function (meta, err) {
			if (err) console.log('Error while loading document "meta".', err);
			else {
				theme = new Theme('themes/' + meta.theme);
				theme.views = views(database, meta);
				theme.routes = routes;
				theme.update();
			}
		});

	});

});