function render(template, couchdb, meta) {
	
	template.render('header', function (callback) {
		
		couchdb.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts
		
	});
	
	template.render('footer', function (callback) {
		
		couchdb.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts
		
	});
	
	template.render('index', function (callback) {
	
		var func = 'all?limit=10&descending=true';
		
		couchdb.view('posts', func, function (response, error) {
			
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			
			var posts = [];
			var rows = response.rows;
			for (var i = rows.length; i--;) posts[i] = rows[i].value;
			
			callback({ posts: posts });
			
		}); // loads the newest posts
		
	});
	
	template.render('post', function (callback, path) {
		
		var postID = path.replace(/^\/posts\//, '');
		
		couchdb.read('post-' + postID, function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts
		
	});
	
	template.render('post-create', function (callback) {
		
		callback({});
		
	});
	
	template.render('meta', function (callback) {
		
		couchdb.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts
		
	});
	
}