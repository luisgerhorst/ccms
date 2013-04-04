function render(template, couchdb) {
	
	template.render('header', function (cb) { cb({}); });
	template.render('setup-meta', function (cb) { cb({}); });
	template.render('footer', function (cb) { cb({}); });
	
}