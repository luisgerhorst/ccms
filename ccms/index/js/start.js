$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (res) {

		config = res;
		couchdb = new CouchDB(config.proxy);
		database = new couchdb.Database(config.database);

		database.read('meta', function (res, err) {

			if (err) console.log('Error while loading document "meta".', err);
			
			else {
				meta = res;
				theme = new Theme('themes/' + meta.theme);
				render();
				routes();
			}

		});

	});

});