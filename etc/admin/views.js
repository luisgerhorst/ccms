var views = function (database, config) {
	
	var views = {};
	
	views['login.html'] = config;

	views['header.html'] = function (callback) {

		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts

	};

	views['footer.html'] = function (callback) {

		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		}); // loads the newest posts

	};

	views['posts.html'] = function (callback, path) {

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

	};

	views['post.html'] = function (callback, path) {

		var postID = path.replace(/^\/post\//, '');

		database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {

			if (error) console.log('Error.', error);

			callback(response.rows[0].value);

		});

	};

	views['meta.html'] = function (callback) {

		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			callback(response);
		});

	};

	return views;

};