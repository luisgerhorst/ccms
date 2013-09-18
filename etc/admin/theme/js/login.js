var login = function (redirectPath, config) {
	
	var foundValid = function (c, d) {
		window.location = '#!' + redirectPath;
		couchdb = c;
		database = d;
	};
	
	var tryUsernamePassword = function () { // case: username and password auth
	
		var c = new CouchDB(config.proxy);
		c.authorize({
			username: $('#login-username').val(),
			password: $('#login-password').val()
		});
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			
			var notificationClosed = function () {
				$('#login p.help').show();
			};
	
			if (error && error.code == 401 || error && error.code == 403) notifications.alert('Your username/password seems to be incorrect.', notificationClosed);
			else if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.', notificationClosed);
			else if (!error) {
				c.remember();
				foundValid(c, d);
			}
	
		});
	
		return false; // no reload
	
	};
	
	$('#login').submit(tryUsernamePassword);
	
	var tryCookie = function () {
	
		var c = new CouchDB(config.proxy);
		c.authorize({ cookie: true });
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && error.code != 403) console.log('Error occured while testing cookie authorization.', error);
			
			if (error) $('#login').show();
			else foundValid(c, d);
			
		});
	
	};
	
	tryCookie();
	
};

var urlQuery = function () {
	var p = document.URL; // http://domain.com/path/key=value/key2=value2
	p = p.replace(/.*\/login\//, '').replace(/\/$/, ''); // key=value/key2=value2
	p = p.split('/'); // ['key=value', 'key2=value2']
	var o = {};
	for (var i = p.length; i--;) {
		var s = p[i],
			k = s.replace(/=.*/, ''), // key
			v = decodeURIComponent(s.replace(/.*=/, '')); // value
		o[k] = v;
	}
	return o;
};

var redirectPath = urlQuery().redirect;
	redirectPath = redirectPath ? redirectPath : '/';

$.ajax({
	url: 'etc/config.json',
	dataType: 'json',
	error: function (jqXHR, textStatus, errorThrown) {
		notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
	}
}).done(function (config) {
	login(redirectPath, config);
});

// Events

$('#login p.show-help').click(function () {
	$('#login p.help').toggle();
});