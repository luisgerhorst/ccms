function views(database, meta) {
	
	var views = {};
	
	views['header.html'] = meta;
	
	views['footer.html'] = meta;
	
	var cache = {
		index: [],
		post: {}
	};
	
	views['posts.html'] = function (callback, path) {
			
		var View = function (pageIndex, page) {
			
			this.previousPage = function () {
				if (pageIndex === 0) return false;
				else return { number: pageIndex - 1 };
			};
			
			this.nextPage = function () {
				if (page.hasNext) return { number: pageIndex + 1 }; // if there are less posts then possible
				else return false;
			};
			
			this.posts = page.posts;
			
		};
		
		var fromDatabase = function (skip, postsPerPage, pageIndex) {
			
			var func = 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage;
			
			database.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				var loaded = [], rows = response.rows;
					
				var l = rows.length;
				for (var i = 0; i < l; i++) loaded.push(rows[i].value);
				
				func = 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1';
				
				database.view('posts', func, function (response, error) {
					
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					
					var page = {
						posts: loaded,
						hasNext: response.rows.length ? true : false
					};
					
					cache.index[pageIndex] = page;
					
					callback(new View(pageIndex, page));
					
				});
				
			});
			
		};
		
		// Actions
		
		var postsPerPage = meta.postsPerPage,
			pageIndex = path === '/' ? 0 : parseInt(path.replace(/^\/page\//, '')),
			skip = postsPerPage * pageIndex;
		
		var page = cache.index[pageIndex];
		
		if (page) callback(new View(pageIndex, page));
		else fromDatabase(skip, postsPerPage, pageIndex);
		
	};
	
	views['post.html'] = function (callback, path) {
		
		var parseIndexCache = function (postID) {
			
			var index = false, indexCache = cache.index;
			
			for (var i = indexCache.length; i--;) {
				for (var j = indexCache[i].posts.length; j--;) {
					if (indexCache[i].posts[j].postID === postID) {
						index = [i, j];
						i = 0;
						j = 0;
					}
				}
			}
			
			return index;
			
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
		
		var postID = path.replace(/^\/post\//, '');
		
		var post = cache.post[postID];
		
		if (post) callback(post);
		else {
			
			var index = parseIndexCache(postID);
			
			if (index !== false) callback(cache.index[index[0]].posts[index[1]]);
			else fromDatabase(postID);
			
		}
		
	};

	return views;
	
}