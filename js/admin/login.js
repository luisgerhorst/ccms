var login = function () {
	
	var adminTheme = function () {
		
		database.read('meta', function (response, error) {
		
			if (error) console.log('Error while loading document "meta".', error);
		
			else {
				meta = response;
				render();
				setRoutes();
			}
		
		});
		
	};
	
	var cookie = new (function () {
	
		this.save = function (key, value) {
			document.cookie = key + '=' + encodeURIComponent(value) + '; expires=' + new Date(moment() + 1000*60*60*24).toGMTString() + ';';
		}
	
		this.read = function (key) {
			var value = '';
			if(document.cookie) {
				var array = document.cookie.split((escape(key) + '=')); 
				if(2 <= array.length) {
					var array2 = array[1].split(';');
					value = unescape(array2[0]);
				}
			}
			return decodeURIComponent(value);
		}
	
	})();
	
	var loggedin = function (couchdbTest, databaseTest) {
		
		couchdb = couchdbTest;
		database = databaseTest;
		
		logout();
		adminTheme();
		
	};
	
	var askUsernamePassword = function () {
		
		var redirectPath = template.currentPath();
		if (redirectPath === '/login' || redirectPath === '/logout') redirectPath = '/';
		
		window.location = '#/login';
		
		template.route('/login', ['login'], function () {
			
			$('#login').submit(function () { // case: username and password auth
			
				var auth = {
					username: $('#login-username').val(),
					password: $('#login-password').val()
				};
			
				var couchdbTest = new CouchDB(config.couchdbProxy, auth);
				var databaseTest = couchdbTest.database(config.database);
				
				databaseTest.save('test', { time: new Date().getTime() }, function (response, error) {
					
					if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
					else if (error && error.code == 403) alert('Please enter username and password.');
					else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
					else {
						
						couchdbTest.createSession();
						
						window.location = '#' + redirectPath;
						
						loggedin(couchdbTest, databaseTest);
						
					}
					
				});
			
				return false; // so the page doesn't reload
			
			});
			
		});
		
	};
	
	var tryCookie = function () {
		
		var couchdbTest = new CouchDB(config.couchdbProxy, { cookie: true });
		var databaseTest = couchdbTest.database(config.database);
		
		databaseTest.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error) {
				console.log('Error ' + error.code + ' ' + error.message + ' occured while trying cookie auth.');
				askUsernamePassword();
			}
			
			else loggedin(couchdbTest, databaseTest);
			
		});
		
	};
	
	tryCookie();
	
};