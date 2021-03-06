$.ajax({
	url: '_root/config.json',
	dataType: 'json',
	cache: false, // because people may change database or proxy
	error: function (jqXHR, textStatus, errorThrown) {
		notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
	},
	success: function (config) {
	
		$('#signup').submit(function () {
	
			var username = $('#signup input[name="username"]').val(),
				password = [$('#signup input[name="password-0"]').val(), $('#signup input[name="password-1"]').val()];
	
			if (password[0] !== password[1]) notifications.alert("Passwords do not match.");
			else {
	
				password = password[0];
	
				var couchdb = new CouchDB(config.root + 'couchdb/');
	
				couchdb.createAdmin(username, password, function (error) {
	
					if (!error) {
						couchdb.authorize({ username: username, password: password });
						createDatabase(couchdb, config.database);
					}
					else if (error.code == 401) {
						notifications.alert('There already seems to exist an admin account, trying to login with credentials you entered for sign up.');
						couchdb.authorize({ username: username, password: password });
						couchdb.getAdmins(function (admins, error) {
							if (error.code == 401) notifications.alert("The username you entered for sign up doesn't match with any existing CouchDB admin account.");
							else if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while trying to log in with sign up credentials.');
							else createDatabase(couchdb, config.database);
						});
					}
					else notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while creating admin account.');
	
				});
	
			}
	
		});
	
		$('#login').submit(function () {
	
			var username = $('#login input[name="username"]').val(),
				password = $('#login input[name="password"]').val();
	
			var couchdb = new CouchDB(config.root + 'couchdb/');
	
			couchdb.authorize({ username: username, password: password }).getAdmins(function (admins, error) {
	
				if (!error) createDatabase(couchdb, config.database);
				else if (error.code == 401 || error.code == 403) notifications.alert('Your username/password seems to be incorrect.');
				else notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.');
	
			});
	
		});
	
		// instantly
	
		var couchdb = new CouchDB(config.root + 'couchdb/');
	
		couchdb.getAdmins(function (admins, error) {
	
			if (JSON.stringify(JSON.parse(admins)) == '{}') { // no admin yet
				$('#signup').show();
			} else {
				$('#login').show();
			}
	
		});
	
	}
});