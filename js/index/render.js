function render() {
	
	var postsCache = [], postCache = {};
	
	template.render({
		header: meta,
		footer: meta,
		index: function (callback, path) {
			
			var postsPerPage = meta.postsPerPage,
				page = path === '/' ? 0 : parseInt(path.replace(/^\/page\//, '')),
				skip = postsPerPage * page;
				
			var View = function (posts) {
				
				this.previousPage = function () {
					if (page === 0) return false;
					else return { number: page - 1 };
				};
				
				this.nextPage = function () {
					if (posts.length !== postsPerPage) return false; // if there are less posts as possible
					else return { number: page + 1 };
				};
				
				this.posts = posts;
				
			};
			
			var fromDatabase = function () {
				
				var func = 'all?descending=true&skip=' + skip + '&limit=' + postsPerPage;
				
				database.view('posts', func, function (response, error) {
					
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					
					var posts = [], rows = response.rows, l = rows.length;
						
					for (var i = 0; i < l; i++) {
						
						var post = rows[i].value;
						
						posts.push(post);
						postsCache[skip+i] = post;
						
					}
					
					callback(new View(posts));
					
				});
				
			};
			
			var fromCache = function () {
				
				var posts = [], inCache = true;
				
				for (var k = skip; k < skip + postsPerPage; k++) {
					
					var post = postsCache[k];
					
					if (post) {
						posts.push(post);
					}
					
					else {
						inCache = false;
						k = skip + postsPerPage; // end loop
					}
					
				}
				
				if (inCache) callback(new View(posts));
				else fromDatabase();
				
			};
			
			fromCache();
			
		},
		post: function (callback, path) {
			
			var postID = path.replace(/^\/post\//, '');
			
			if (postCache[postID] != null) callback(postCache[postID]); // post cache
			else {
				
				var postsCacheIndex = false;
				for (var i = postsCache.length; i--;) {
					if (postsCache[i].postID == postID) {
						postsCacheIndex = i;
						i = 0; // stop loop
					}
				}
				
				if (postsCacheIndex !== false) { // posts cache
					
					var post = postsCache[postsCacheIndex];
					postCache[postID] = post;
					callback(post);
					
				} else database.read('posts', function (response, error) {
						
					if (error) console.log('Error.', error, 'posts');
					
					var documentID = response.ids[postID] || false;
					
					if (documentID) database.read(documentID, function (response, error) {
							
						if (error) console.log('Error.', error, 'posts');
						
						postCache[postID] = response;
						callback(response);
						
					});
						
				});
				
			}
			
		}
	});
	
}