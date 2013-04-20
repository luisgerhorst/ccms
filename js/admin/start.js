$(document).ready(function () {

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		var template = new Template();
		
		var redirectPath = template.currentPath();
		if (redirectPath === '/login') redirectPath = '/';
		window.location = '#/login';
		
		template.route('/login', ['login'], function () {
			
			$('#login').submit(function () { // on save
			
				var username = $('#login-username').val();
				var password = $('#login-password').val();
				
				var couchdbTest = new CouchDB(config.couchdbProxy, config.database, username, password);
				
				couchdbTest.save('test', { time: new Date().getTime() }, function (response, error) {
					if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
					else if (error && error.code == 403) alert('Please enter username and password.');
					else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
					else {
						
						var couchdb = couchdbTest;
						
						couchdb.read('meta', function (meta, error) {
						
							if (error) console.log('Error while loading document "meta".', error);
						
							else {
								window.location = '#' + redirectPath;
								render(template, couchdb, meta);
								setRoutes(template, couchdb, meta);
								template.load();
							}
						
						});
						
					}
				});
			
				return false; // so the page doesn't reload
			
			});
			
		});
		
		template.load();

	});

});