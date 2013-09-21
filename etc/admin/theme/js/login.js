// Events

$('#login p.show-help').click(function () {
	$('#login p.help').toggle();
});

var redirectPath = getParameter('redirect');

function getParameter(n) {
	var m = RegExp('[?&]'+n+'=([^&]*)').exec(window.location.search);
	return m && decodeURIComponent(m[1].replace(/\+/g, ' '));
}
	
redirectPath = !redirectPath || redirectPath == '/login' || redirectPath == '/' ? '' : redirectPath;

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
	
	function tryCookie() {
	
		var couchdb = new CouchDB(window.theme.rootPath + '/couchdb');
		couchdb.authorize({ cookie: true });
		var database = new couchdb.Database(config.database);
	
		database.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && error.code != 401 && error.code != 403) console.log('Error occured while testing cookie authorization.', error);
			if (error) $('#login').show();
			
			else foundValid(couchdb, database);
			
		});
	
	}
	
	$('#login').submit(tryUsernamePassword);
	
	function tryUsernamePassword() { // case: username and password auth
	
		var couchdb = new CouchDB(window.theme.rootPath + '/couchdb');
		couchdb.authorize({
			username: $('#login-username').val(),
			password: $('#login-password').val()
		});
		var database = new couchdb.Database(config.database);
	
		database.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && (error.code == 401 || error.code == 403)) notifications.alert('Your username/password seems to be incorrect.', function () {
				$('#login p.help').show();
			});
			else if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.', notificationClosed);
			else {
				couchdb.remember();
				foundValid(couchdb, database);
			}
	
		});
	
		return false; // no reload
	
	}
	
	function foundValid(couchdb, database) {
		window.couchdb = couchdb;
		window.database = database;
		window.theme.open(window.theme.rootPath+window.theme.sitePath + redirectPath);
	}
	
}