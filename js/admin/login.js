var login = function (template, config, renderAdminTemplate) {
	
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
	
	var tryCookie = function () {
		
		var couchdb = new CouchDB(config.couchdbProxy, config.database, null, null, true);
		
		couchdb.save('test', { time: new Date().getTime() }, function (response, error) {
			if (error) {
				console.log('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
				askUsernamePassword();
			}
			else renderAdminTemplate(couchdb);
		});
		
	};
	
	var askUsernamePassword = function () {
		
		var redirectPath = template.currentPath();
		if (redirectPath === '/login') redirectPath = '/';
		
		window.location = '#/login';
		
		template.route('/login', ['login'], function () {
			
			$('#login').submit(function () { // case: username and password auth
			
				var username = $('#login-username').val();
				var password = $('#login-password').val();
				
				var couchdb = new CouchDB(config.couchdbProxy, config.database, username, password);
				
				couchdb.save('test', { time: new Date().getTime() }, function (response, error) {
					
					if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
					else if (error && error.code == 403) alert('Please enter username and password.');
					else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
					else {
						
						$.ajax({
							url: config.couchdbProxy + '/_session',
							type: 'POST',
							data: 'name=' + username + '&password=' + password,
							contentType: 'application/x-www-form-urlencoded'
						}).done(function (data, textStatus, jqXHR) {
							cookie.save('AuthSessionStart', new Date().getTime());
						}).fail(function (jqXHR, textStatus) {
							console.log(textStatus, jqXHR);
						}); // make CouchDB set a cookie
						
						window.location = '#' + redirectPath;
						renderAdminTemplate(couchdb);
						
					}
					
				});
			
				return false; // so the page doesn't reload
			
			});
			
		});
		
		template.load();
		
	};
	
	if (new Date().getTime() - parseInt(cookie.read('AuthSessionStart')) < 1000*60*9) tryCookie();
	else askUsernamePassword();
	
	logout(template, config);
	
};