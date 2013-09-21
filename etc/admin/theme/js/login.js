console.log('login');

// Events

$('#login p.show-help').click(function () {
	$('#login p.help').toggle();
});

var redirectPath = getParameter('redirect');

function getParameter(n) {
	var m = RegExp('[?&]'+n+'=([^&]*)').exec(window.location.search);
	return m && decodeURIComponent(m[1].replace(/\+/g, ' '));
}
	
redirectPath = redirectPath && redirectPath != '/login' ? redirectPath : '/';

$.ajax({
	url: '_root/config.json',
	dataType: 'json',
	error: function (jqXHR, textStatus, errorThrown) {
		notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
	}
}).done(function (config) {
	login(redirectPath, config);
});

function login(redirectPath, config) {
	
	tryCookie();
	
	$('#login').submit(tryUsernamePassword);
	
	function foundValid(c, d) {
		window.theme.open(window.theme.urlRoot + redirectPath);
		couchdb = c;
		database = d;
	}
	
	function tryUsernamePassword() { // case: username and password auth
	
		var c = new CouchDB(config.root + '/couchdb');
		c.authorize({
			username: $('#login-username').val(),
			password: $('#login-password').val()
		});
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && (error.code == 401 || error.code == 403)) notifications.alert('Your username/password seems to be incorrect.', function () {
				$('#login p.help').show();
			});
			else if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.', notificationClosed);
			else if (!error) {
				c.remember();
				foundValid(c, d);
			}
	
		});
	
		return false; // no reload
	
	}
	
	function tryCookie() {
	
		var c = new CouchDB(config.root + '/couchdb');
		c.authorize({ cookie: true });
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && error.code != 403 && error.code != 409) console.log('Error occured while testing cookie authorization.', error);
			
			if (error) $('#login').show();
			else foundValid(c, d);
			
		});
	
	}
	
}