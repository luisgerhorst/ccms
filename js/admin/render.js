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
	
	template.render('index', function (callback, path) {
		
		var postsPerPage = 3, page;
		if (path === '/') page = 0;
		else page = parseInt(path.replace(/^\/page\//, ''), 10);
		var skip = postsPerPage * page;
		
		function View(posts) {
			this.previousPage = function () {
				if (page === 0) return false;
				else return { number: page-1 };
			};
			this.nextPage = function () {
				if (posts.length !== postsPerPage) return false; // if there are less posts then possible
				else return { number: page+1 };
			};
			this.posts = posts;
		}
	
		var func = 'all?descending=true&skip=' + skip + '&limit=' + postsPerPage;
		
		couchdb.view('posts', func, function (response, error) {
			
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			
			var posts = [];
			var rows = response.rows;
			for (var i = rows.length; i--;) posts[i] = rows[i].value;
			
			callback(new View(posts));
			
		}); // loads the newest posts
		
	});
	
	template.render('post', function (callback, path) {
		
		var postID = path.replace(/^\/post\//, '');
		
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