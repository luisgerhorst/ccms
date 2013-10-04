$(document).ready(function () {

	var routes = [
		{
			path: '/',
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path, parameters) {

				if (parameters.page == 1) {
					window.open(theme.host+theme.rootPath+theme.sitePath);
					return false;
				}

			},
			title: '{{{header_html.title}}}'
		},
		{
			path: /^\/posts\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{{header_html.title}}} - {{{post_html.title}}}'
		}
	];

	function views(database, meta) {

		var views = {};

		views['header.html'] = {
			data: meta
		};

		views['footer.html'] = {
			data: meta
		};

		views['head.html'] = {
			data: meta
		};

		views['posts.html'] = {
			load: function (callback, path, parameters) {

				var postsPerPage = meta.postsPerPage,
					urlPageIndex = parseInt(parameters.page || 1),
					pageIndex = urlPageIndex-1;
					skip = postsPerPage * pageIndex;

				database.view('posts', 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage, function (response, error) {

					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the posts.'
					}); else {

						var posts = [];
						for (var i = 0; i < response.rows.length; i++) posts.push(response.rows[i].value);

						database.view('posts', 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1', function (response, error) {

							if (error) callback(null, {
								title: error.message,
								heading: 'HTTP Error',
								message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
							}); else {

								var page = {
									posts: posts,
									hasNext: response.rows.length ? true : false
								};
								var view = new View(pageIndex, page);
								callback(view);

							}

						});

					}

				});

				function View(pageIndex, page) {

					this.previousPage = function () {
						if (pageIndex == 0) return false;
						else return { number: urlPageIndex - 1 };
					};

					this.nextPage = function () {
						if (page.hasNext) return { number: urlPageIndex + 1 }; // if there are less posts then possible
						else return false;
					};

					this.posts = page.posts;

				}

			},
			cache: {
				initial: [], // views by page index in array
				read: function (globalCache, path, parameters) {
					var pageIndex = parseInt(parameters.page || 1) - 1;
					var page = globalCache['posts.html'][pageIndex];
					if (page) return page;
					return null;
				},
				save: function (view, cache, path, parameters) {
					var pageIndex = parseInt(parameters.page || 1) - 1;
					cache[pageIndex] = view;
					return cache;
				}
			}
		};

		views['post.html'] = {
			load: function (callback, path, parameters) {

				var postID = path.replace(/^\/posts\//, '');

				database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {

					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
					});
					else if (!response.rows.length) callback(null, {
						title: 'Not Found',
						heading: 'Post not found',
						message: 'The post you were looking for wasn\'t found. Go back <a href="' + theme.rootPath+theme.sitePath + '">home</a>.'
					});
					else {
						callback(response.rows[0].value);
					}

				});

			},
			cache: {
				initial: {}, // posts by post id in object
				read: function (globalCache, path, parameters) {

					var postID = path.replace(/^\/posts\//, '');

					if (globalCache['post.html'][postID]) return globalCache['post.html'][postID];

					var postsCache = globalCache['posts.html'];
					for (var i = postsCache.length; i--;) {
						var posts = postsCache[i].posts;
						for (var j = posts.length; j--;) {
							if (posts[j].postID == postID) return posts[j];
						}
					}

					return null;

				},
				save: function (view, cache, path, parameters) {
					var postID = path.replace(/^\/posts\//, '');
					cache[postID] = view;
					return cache;
				}
			}

		};

		return views;

	}



	$.ajax({
		url: '_root/config.json',
		dataType: 'json',
		error: function (jqXHR, textStatus, errorThrown) {

			fatalError('Ajax Error', 'Error <code>' + textStatus + ' ' + errorThrown + '</code> occured while loading <code>' + this.url + '</code>.');

		},
		success: function (config) {

			couchdb = new CouchDB(config.root + '/couchdb');
			database = new couchdb.Database(config.database);

			database.read('meta', function (meta, error) {

				if (error) {

					fatalError('CouchDB Error', 'Error <code>' + error.code + ' ' + error.message + '</code> occured while loading loading document <code>meta</code>.');

				} else {

					window.createTheme({
						rootPath: config.root,
						sitePath: '',
						filePath: '/themes/' + meta.theme,
						routes: routes,
						views: views(database, meta),
						cache: {
							views: true,
							templates: true
						}
					});

				}

			});

		}
	});


});