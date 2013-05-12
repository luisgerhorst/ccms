function render() {
	
	var views = {
		
		header: function (callback) {
			
			database.read('meta', function (response, error) {
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				else meta = response;
				callback(response);
			}); // loads the newest posts
			
		},
		
		footer: function (callback) {
			
			database.read('meta', function (response, error) {
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				else meta = response;
				callback(response);
			}); // loads the newest posts
			
		},
		
		posts: function (callback, path) {
			
			var postsPerPage = 10,
				pageIndex = path === '/' ? 0 : parseInt(path.replace(/^\/page\//, '')),
				skip = postsPerPage * pageIndex;
			
			function View(pageIndex, page) {
				
				this.previousPage = function () {
					if (pageIndex === 0) return false;
					else return { number: pageIndex - 1 };
				};
				
				this.nextPage = function () {
					if (page.hasNext) return { number: pageIndex + 1 }; // if there are less posts then possible
					else return false;
				};
				
				this.posts = page.posts;
				
			}
		
			var func = 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage;
			
			database.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				var posts = [];
				var rows = response.rows;
				for (var i = rows.length; i--;) posts[i] = rows[i].value;
				
				func = 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1';
				
				database.view('posts', func, function (response, error) {
					
					if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
					
					callback(new View(pageIndex, {
						posts: posts,
						hasNext: response.rows.length ? true : false
					}));
					
				});
				
			});
			
		},
		
		post: function (callback, path) {
			
			var postID = path.replace(/^\/post\//, '');
			
			database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {
				
				if (error) console.log('Error.', error);
				
				callback(response.rows[0].value);
				
			});
			
		},
		
		meta: function (callback) {
			
			database.read('meta', function (response, error) {
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				callback(response);
			});
			
		}
		
	};
	
	template.render(views);
	
}