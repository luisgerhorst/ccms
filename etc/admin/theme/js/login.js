// Events

$('#login p.show-help').click(function () {
	$('#login p.help').toggle();
});

$.ajax({
	url: '_root/config.json',
	dataType: 'json',
	error: function (jqXHR, textStatus, errorThrown) {
		notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
	}
}).done(function (config) {
	login(redirectPath(), config.database);
});

function redirectPath() {

	var redirectPath = getParameter('redirect');
	return (!redirectPath || redirectPath == '' || redirectPath == 'login' || redirectPath == 'logout') ? '' : redirectPath;

	function getParameter(n) {
		var m = RegExp('[?&]'+n+'=([^&]*)').exec(window.location.search);
		return m && decodeURIComponent(m[1].replace(/\+/g, ' '));
	}

}

function login(redirectPath, databaseName) {
	
	$('#login').submit(tryUsernamePassword);
	
	function tryUsernamePassword() { // case: username and password auth
	
		var couchdb = new CouchDB(window.theme.ccmsBasePath + 'couchdb/').authorize({
			username: $('#login-username').val(),
			password: $('#login-password').val()
		});
		var database = new couchdb.Database(databaseName);
	
		database.save('test', { time: new Date().getTime() }, function (response, error) {
			
			if (error && (error.code == 401 || error.code == 403)) notifications.alert('Your username/password seems to be incorrect.', function () {
				$('#login p.help').show();
			});
			else if (error) notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while logging in.', notificationClosed);
			else foundValid(couchdb.remember(), database);
	
		});
	
		return false; // no reload
	
	}
	
	function foundValid(couchdb, database) {

		window.couchdb = couchdb;
		window.database = database;
		
		window.open(window.theme.siteBasePath+redirectPath);

	}
	
}