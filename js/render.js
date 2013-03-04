
var render = function (couchdb) { // is called after config.json was loaded
	
	var Theme = Ember.Application.create();
	
	Theme.Router.map(function() {
		
		var routerMapThis = this;
	
		couchdb.view('posts', 'paths', function (response, error) {
			
			if (error) console.log('Error while getting view "paths" of design document "posts".', error);
			
			var paths = response.rows;
			var length = paths.length;
			for (var i = 0; i < length; i++) {
				routerMapThis.route(paths[i].id);
			}
			
		});
	
	});
	
};
