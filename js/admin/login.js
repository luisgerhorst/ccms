var login = function () {
	
	var valid = function (couchdbTest, databaseTest) {
		
		couchdb = couchdbTest;
		database = databaseTest;
		
		database.read('meta', function (response, error) {
			if (error) console.log('Error while loading document "meta".', error);
			else {
				meta = response;
				render();
				routes();
			}
		});
		
	};
	
	var askUsernamePassword = function () {
		
		var redirectPath = template.currentPath();
		if (redirectPath === '/login' || redirectPath === '/logout') redirectPath = '/';
		
		window.location = '#/login';
		
		template.route({
			path: '/login',
			templates: ['login'],
			done: function () {
				
				var tryUsernamePassword = function () { // case: username and password auth
				
					var couchdbTest = new CouchDB(config.couchdbProxy, {
						username: $('#login-username').val(),
						password: $('#login-password').val()
					});
					var databaseTest = couchdbTest.database(config.database);
					
					databaseTest.save('test', { time: new Date().getTime() }, function (response, error) {
						
						if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
						else if (error && error.code == 403) alert('Please enter username and password.');
						else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
						else {
							couchdbTest.createSession();
							window.location = '#' + redirectPath;
							valid(couchdbTest, databaseTest);
						}
						
					});
				
					return false; // so the page doesn't reload
				
				};
				
				$('#login').submit(tryUsernamePassword);
				
			}
		});
		
	};
	
	var tryCookie = function () {
		
		var cPath = template.currentPath();
		if (cPath === '/login' || cPath === '/logout') window.location = '#/';
		
		var couchdbTest = new CouchDB(config.couchdbProxy, { cookie: true });
		var databaseTest = couchdbTest.database(config.database);
		
		databaseTest.save('test', { time: new Date().getTime() }, function (response, error) {
			if (error) askUsernamePassword();
			else valid(couchdbTest, databaseTest);
		});
		
	};
	
	tryCookie();
	
};