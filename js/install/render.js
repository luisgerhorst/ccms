function render(template, couchdb) {
	
	template.render('header', function (cb) { cb({}); });
	
	template.render('setup-db', function (callback) {
		
		$.ajax({
			url: 'config.json'
		}).done(function (config) {
		
			callback(config);
		
		});
		
	});
	
	template.render('setup-meta', function (cb) { cb({}); });
	template.render('footer', function (cb) { cb({}); });
	
}