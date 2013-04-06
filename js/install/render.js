function render(template, couchdb) {
	
	template.render('header', function (cb) { cb({}); });
	template.render('setup-db-docs', function (cb) { cb({}); });
	template.render('footer', function (cb) { cb({}); });
	
}