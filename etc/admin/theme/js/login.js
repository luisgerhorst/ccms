
var login = function (redirectPath, config) {
	
	var foundValid = function (c, d) {
		window.location = '#' + redirectPath;
		couchdb = c;
		database = d;
	};
	
	var tryUsernamePassword = function () { // case: username and password auth
	
		var c = new CouchDB(config.proxy);
		c.authorize({
			username: config.accountPrefix + $('#login-username').val(),
			password: $('#login-password').val()
		});
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
	
			if (error && error.code == 401) alert('Your username/password seems to be incorrect.');
			else if (error && error.code == 403) alert('Please enter username and password.');
			else if (error) alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.');
			else {
				c.remember();
				foundValid(c, d);
			}
			
			if (error) $('#login p.help').show();
	
		});
	
		return false; // no reload
	
	};
	
	$('#login').submit(tryUsernamePassword);
	
	var tryCookie = function () {
	
		var c = new CouchDB(config.proxy);
		c.authorize({ cookie: true });
		var d = new c.Database(config.database);
	
		d.save('test', { time: new Date().getTime() }, function (response, error) {
			if (!error) foundValid(c, d);
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
		var s = p[i];
		var k = s.replace(/=.*/, ''); // key
		var v = decodeURIComponent(s.replace(/.*=/, '')); // value
		o[k] = v;
	}
	return o;
};

var redirectPath = urlQuery().redirect;
	redirectPath = redirectPath ? redirectPath : '/';

$.ajax({
	url: 'config.json'
}).done(function (config) {

	login(redirectPath, config);

});

// Events

$('#login p.show-help').click(function () {
	$('#login p.help').toggle();
});