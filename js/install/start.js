$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		var template = new Template();
		var couchdb = new CouchDB(config.couchdbProxy, config.database, true, true);

		render(template, couchdb);
		setRoutes(template, couchdb);
		template.load();

	});

});