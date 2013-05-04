var login = function () {
	
	var foundValid = function (newCouchDB, newDatabase) {
		
		couchdb = newCouchDB;
		database = newDatabase;
		
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
				
					var c = couchdb;
					c.authorize({
						username: 'ccms/' + $('#login-username').val(),
						password: $('#login-password').val()
					});
					var d = new c.Database(config.database);
					
					d.save('test', { time: new Date().getTime() }, function (response, error) {
						
						if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
						else if (error && error.code == 403) alert('Please enter username and password.');
						else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.');
						else {
							window.location = '#' + redirectPath;
							c.remember();
							foundValid(c, d);
						}
						
					});
				
					return false; // no reload
				
				};
				
				$('#login').submit(tryUsernamePassword);
				
			}
		});
		
	};
	
	var tryCookie = function () {
		
		var cPath = template.currentPath();
		if (cPath === '/login' || cPath === '/logout') window.location = '#/';
		
		var c = couchdb;
		c.authorize({ cookie: true });
		var d = new c.Database(config.database);
		
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			if (error) askUsernamePassword();
			else foundValid(c, d);
		});
		
	};
	
	tryCookie();
	
};