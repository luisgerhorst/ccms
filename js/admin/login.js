var login = function (template, config, renderAdminTemplate) {
	
	var redirectPath = template.currentPath();
	if (redirectPath === '/login') redirectPath = '/';
	
	window.location = '#/login';
	
	template.route('/login', ['login'], function () {
		
		/*var readCookie = function (key) {
			var value = '';
			if (document.cookie) {
				var array = document.cookie.split((escape(key) + '=')); 
				if (2 <= array.length) {
					var array2 = array[1].split(';');
					value = unescape(array2[0]);
				}
			}
			return value;
		};
		
		var cookie = readCookie('AuthSession');
		console.log('Cookie:', cookie, document.cookie); // fail!!, both undefined*/
		
		$('#login').submit(function () {
		
			var username = $('#login-username').val();
			var password = $('#login-password').val();
			
			var couchdb = new CouchDB(config.couchdbProxy, config.database, username, password);
			
			couchdb.save('test', { time: new Date().getTime() }, function (response, error) {
				
				if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
				else if (error && error.code == 403) alert('Please enter username and password.');
				else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while testing credentials.');
				else {
					window.location = '#' + redirectPath;
					renderAdminTemplate(couchdb);
				}
				
			});
		
			return false; // so the page doesn't reload
		
		});
		
	});
	
	template.load();
	
};