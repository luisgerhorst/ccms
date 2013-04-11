function render(template, couchdb, meta) {
	
	template.render('header', meta);
	
	template.render('footer', meta);
	
	
	var postsCache = [];
	
	template.render('index', function (callback, path) {
		
		var postsPerPage = meta.postsPerPage, page = 0;
		if (path !== '/') page = parseInt(path.replace(/^\/page\//, ''), 10);
		var skip = postsPerPage * page;
		
		var posts = [], loaded = true;
		for (var k = skip; k < skip+postsPerPage; k++) {
			var post = postsCache[k];
			if (typeof post === 'undefined') loaded = false;
			posts.push(post);
		} // check if posts are already loaded and put them into an array
		
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
		
		if (!loaded) {
			
			var func = 'all?descending=true&skip=' + skip + '&limit=' + postsPerPage;
			
			couchdb.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				var posts = [];
				var rows = response.rows;
				for (var i = rows.length; i--;) posts[i] = rows[i].value; // create array with posts
				
				for (var j = posts.length; j--;) postsCache[skip+j] = posts[j]; // cache posts
				
				callback(new View(posts));
				
			}); // loads the newest posts
			
		}
		
		else callback(new View(posts));
		
	});
	
	
	var postCache = {};
	
	template.render('post', function (callback, path) {
		
		var postID = path.replace(/^\/post\//, '');
		
		if (postCache[postID] != null) { // if 
			
			// console.log('Post with ID ' + postID + ' already cached in postCache.');
			callback(postCache[postID]);
			return;
			
		} else {
			
			var postsCacheIndex = null;
			for (var i = postsCache.length; i--;) {
				if (postsCache[i].postID == postID) {
					postsCacheIndex = i;
					i = 0; // stop loop
				}
			}
			
			if (postsCacheIndex !== null) { // if post is in posts cache
				
				// console.log('Post with ID ' + postID + ' already loaded into indexCache at ' + indexCachePlace + '.');
				var post = postsCache[postsCacheIndex];
				postCache[postID] = post;
				callback(post);
				
			} else {
				
				couchdb.read('post-' + postID, function (response, error) {
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					postCache[postID] = response;
					callback(response);
				}); // loads the newest posts
				
			}
			
		}
		
	});
	
}