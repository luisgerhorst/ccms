var logout = function (template, config) {
	
	var deleteSession = function () {
		
		$.ajax({
			url: config.couchdbProxy + '/_session',
			type: 'DELETE'
		}).done(function (data, textStatus, jqXHR) {
			console.log('Logged out.');
		}).fail(function (jqXHR, textStatus) {
			console.log(textStatus, jqXHR);
		}); // make CouchDB set a cookie
		
	};
	
	template.route('/logout', [], null, function () {
		deleteSession();
		window.location = '#/login';
	});
	
};