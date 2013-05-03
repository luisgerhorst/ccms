function render() {
	
	var cache = {
		index: [],
		post: {}
	};
	
	template.render({
		header: meta,
		footer: meta,
		index: function (callback, path) {
				
			var View = function (posts, page) {
				
				this.previousPage = function () {
					if (page === 0) return false; // no previous page
					else return { number: page - 1 };
				};
				
				this.nextPage = function () {
					if (posts.length !== postsPerPage) return false; // if there are less posts than possible
					else return { number: page + 1 };
				};
				
				this.posts = posts;
				
			};
			
			var fromDatabase = function (skip, postsPerPage) {
				
				var func = 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage;
				
				database.view('posts', func, function (response, error) {
					
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					
					var loaded = [], rows = response.rows;
						
					var l = rows.length;
					for (var i = 0; i < l; i++) {
						var post = rows[i].value;
						loaded.push(post);
						cache.index[skip+i] = post;
					}
					
					callback(new View(loaded, page));
					
				});
				
			};
			
			var fromCache = function (skip, postsPerPage) {
				
				var posts = [], cached = true;
				
				for (var k = skip; k < skip + postsPerPage; k++) {
					
					var post = cache.index[k];
					
					if (post) {
						posts.push(post);
					} else {
						cached = false;
						k = skip + postsPerPage; // end loop
					}
					
				}
				
				return cached ? posts : false;
				
			};
			
			// Actions
			
			var postsPerPage = meta.postsPerPage,
				page = path === '/' ? 0 : parseInt(path.replace(/^\/page\//, '')),
				skip = postsPerPage * page;
			
			var cached = fromCache(skip, postsPerPage);
			
			if (cached) callback(new View(cached, page));
			else fromDatabase(skip, postsPerPage, page);
			
		},
		post: function (callback, path) {
			
			var postID = path.replace(/^\/post\//, '');
			
			var parseIndexCache = function (postID) {
				
				var index = false;
				
				for (var i = cache.index.length; i--;) {
					if (cache.index[i].postID == postID) {
						index = i;
						i = 0;
					}
				}
				
				return index;
				
			};
			
			var fromIndexCache = function (index, postID) {
				
				var post = cache.index[index];
				cache.post[postID] = post;
				callback(post);
				
			};
			
			var fromDatabase = function (postID) {
				
				database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {
					
					if (error) console.log('Error.', error);
					
					var post = response.rows[0].value;
					
					cache.post[postID] = post;
					callback(post);
					
				});
				
			};
			
			// Actions
			
			var cached = cache.post[postID];
			
			if (cached) callback(cached);
			else {
				
				var index = parseIndexCache(postID);
				
				if (index !== false) fromIndexCache(index, postID);
				else fromDatabase(postID);
				
			}
			
		}
	});
	
}