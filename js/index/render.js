function render(template, couchdb, meta) {
	
	template.render('header', function (callback) {
		
		callback(meta);
		
	});
	
	template.render('footer', function (callback) {
		
		callback(meta);
		
	});
	
	
	var indexCache = null;
	
	template.render('index', function (callback) {
	
		var func = 'all?limit=' + meta.postsPerPage + '&descending=true'; // 2 will be meta.postsPerPage later
		
		if (indexCache == null) {
			
			couchdb.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				var posts = [];
				var rows = response.rows;
				for (var i = rows.length; i--;) posts[i] = rows[i].value;
				
				indexCache = { posts: posts };
				
				callback(indexCache);
				
			}); // loads the newest posts
			
		}
		
		else callback(indexCache);
		
	});
	
	
	var postCache = {};
	
	template.render('post', function (callback, path) {
		
		var postID = path.replace(/^\/posts\//, '');
		
		if (postCache[postID] != null) { // if 
			
			// console.log('Post with ID ' + postID + ' already cached in postCache.');
			callback(postCache[postID]);
			return;
			
		}
		
		else {
			
			var loadFromDB = function () {
				
				// console.log('Post with ID ' + postID + ' will be loaded from the DB.');
				
				couchdb.read('post-' + postID, function (response, error) {
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					postCache[postID] = response;
					callback(response);
				}); // loads the newest posts
				
			}
			
			if (indexCache != null) {
				
				// console.log("indexCache isn't null.");
				
				var indexCachePlace = null;
				for (var i = indexCache.posts.length; i--;) {
					if (indexCache.posts[i].postID == postID) {
						indexCachePlace = i;
						i = 0; // stop loop
					}
				}
				
				if (indexCachePlace != null) { // if post is in indexCache
					
					// console.log('Post with ID ' + postID + ' already loaded into indexCache at ' + indexCachePlace + '.');
					var post = indexCache.posts[indexCachePlace];
					postCache[postID] = post;
					callback(post);
					
				}
				
				else loadFromDB();
				
			}
			
			else loadFromDB();
			
		}
		
	});
	
}