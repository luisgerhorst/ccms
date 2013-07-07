$.ajax({
	url: 'etc/config.json'
}).done(function (config) {

	$('#signup').submit(function () {
		
		var username = $('#signup input[name="username"]').val(),
			password = [$('#signup input[name="password-0"]').val(), $('#signup input[name="password-1"]').val()];
		
		if (password[0] !== password[1]) notifications.alert("Passwords do not match.");
		else {
			
			password = password[0];
			
			var couchdb = new CouchDB(config.proxy);
			
			couchdb.createAdmin(username, password, function (error) {
				if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while creating admin account.');
				else {
					couchdb.authorize({ username: username, password: password });
					createDatabase(couchdb, config.database);
				}
			});
			
		}
		
	});
	
	$('#login').submit(function () {
		
		var username = $('#login input[name="username"]').val(),
			password = $('#login input[name="password"]').val();
			
		var couchdb = new CouchDB(config.proxy);
		
		couchdb.authorize({ username: username, password: password }).getAdmins(function (admins, error) {
			
			if (!error) createDatabase(couchdb, config.database);
			else if (error.code == 401 || error.code == 403) notifications.alert('Your username/password seems to be incorrect.');
			else notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.');
			
		});
		
	});
	
	// instantly
	
	var couchdb = new CouchDB(config.proxy);
	
	couchdb.getAdmins(function (admins, error) {
		
		if (JSON.stringify(JSON.parse(admins)) != '{}') { // no admin yet
			$('#login').show();
		} else {
			$('#signup').show();
		}
		
	});
	
});