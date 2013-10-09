$(document).ready(function () {
	
	function routes(pageIDs) { var data = [];
		
		for (var i = pageIDs.length; i--;) {
			
			data.push({
				path: pageIDs[i],
				templates: ['header.html', 'page.html', 'footer.html'],
				title: '{{{header_html.title}}} - {{{page_html.title}}}'
			});
			
		}
		
		data.push(
			{
				path: '',
				templates: ['header.html', 'posts.html', 'footer.html'],
				before: function (path, parameters) {
		
					if (parameters.page == 1) {
						window.open(window.theme.siteBasePath);
						return false;
					}
		
				},
				title: '{{{header_html.title}}}'
			},
			{
				path: /^post\/.+$/,
				templates: ['header.html', 'post.html', 'footer.html'],
				title: '{{{header_html.title}}} - {{{post_html.title}}}'
			}
		);
		
	return data; }

	function Views(database, meta) {

		this['header.html'] = {
			load: function (callback) {
				
				database.view('pages', 'indexByPriority', function (response, error) {
				
					if (error) {
						
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
						
					} else {
						
						var titles = [];
						for (var i = 0; i < response.rows.length; i++) titles.push(response.rows[i].value);
						
						var view = meta;
						view.pages = titles;
						callback(view);
						
					}
				
				});
				
			},
			cache: {
				initial: null,
				read: function (globalCache) {
					var cache = globalCache['header.html'];
					if (cache) return cache;
					return null;
				},
				save: function (view, cache) {
					cache = view;
					return cache;
				}
			}
		};

		this['footer.html'] = {
			data: meta
		};

		this['head.html'] = {
			data: meta
		};

		this['posts.html'] = {
			load: function (callback, path, parameters) {

				var postsPerPage = meta.postsPerPage,
					urlPageIndex = parseInt(parameters.page || 1),
					pageIndex = urlPageIndex-1;
					skip = postsPerPage * pageIndex;
					
				var toLoad = 2,
					posts = [],
					hasNext;

				database.view('posts', 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage, function (response, error) {
					if (error)
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the posts.'
						});
					else {
						for (var i = 0; i < response.rows.length; i++) posts.push(response.rows[i].value);
						chunkReceived();
					}
				});
				
				database.view('posts', 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1', function (response, error) {
					if (error)
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
					else {
						hasNext = response.rows.length ? true : false;
						chunkReceived();
					}
				});
				
				function chunkReceived() {
					toLoad--;
					if (!toLoad) {
						var view = new View(pageIndex, urlPageIndex, posts, hasNext);
						callback(view);
					}
				}

				function View(pageIndex, urlPageIndex, posts, hasNext) {

					this.previousPage = function () {
						if (pageIndex == 0) return false;
						else return { number: urlPageIndex - 1 };
					};

					this.nextPage = function () {
						if (hasNext) return { number: urlPageIndex + 1 };
						else return false;
					};

					this.posts = posts;

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

		this['post.html'] = {
			load: function (callback, path, parameters) {

				var postID = path.replace(/^post\//, '');

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

					var postID = path.replace(/^post\//, '');

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
					var postID = path.replace(/^post\//, '');
					cache[postID] = view;
					return cache;
				}
			}

		};
		
		this['page.html'] = {
			load: function (callback, path) {
				
				var pageID = path;
				
				database.view('pages', 'byPageID?key="' + pageID + '"', function (response, error) {
				
					if (error) {
						
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
						
					} else {
						
						callback(response.rows[0].value);
						
					}
				
				});
				
			},
			cache: {
				initial: {}, // posts by post id in object
				read: function (globalCache, path) {
					var pageID = path, pageCache = globalCache['page.html'][pageID];
					if (pageCache) return pageCache;
					return null;
				},
				save: function (view, cache, path) {
					var pageID = path;
					cache[pageID] = view;
					return cache;
				}
			}
		};

	}



	$.ajax({
		url: '_root/config.json',
		dataType: 'json',
		error: function (jqXHR, textStatus, errorThrown) {

			fatalError('Ajax Error', 'Error <code>' + textStatus + ' ' + errorThrown + '</code> occured while loading <code>' + this.url + '</code>.');

		},
		success: function (config) {

			var couchdb = new CouchDB(config.root + 'couchdb/');
			var database = new couchdb.Database(config.database);
			
			loadDocs(config, database);

		}
	});
	
	
	function loadDocs(config, database) {
		
		var toLoad = 2,
		    meta,
		    pageIDs;
		
		database.read('meta', function (response, error) {
		
			if (error) {
		
				fatalError('CouchDB Error', 'Error <code>' + error.code + ' ' + error.message + '</code> occured while loading loading document <code>meta</code>.');
				throw 'Ajax error';
		
			} else {
		
				meta = response;
				
				chunkReceived();
		
			}
		
		});
		
		database.view('pages', 'pageIDs', function (response, error) {
		
			if (error) {
				
				fatalError('CouchDB Error', 'Error <code>' + error.code + ' ' + error.message + '</code> occured while loading loading pageIDs.');
				throw 'Ajax error';
				
			} else {
				
				pageIDs = [];
				for (var i = response.rows.length; i--;) pageIDs.push(response.rows[i].value);
				
				chunkReceived();
				
			}
		
		});
		
		function chunkReceived() {
			
			toLoad--;
			if (!toLoad) {
				
				window.createTheme({
					root: config.root,
					site: '',
					theme: 'themes/' + meta.theme + '/',
					routes: routes(pageIDs),
					views: new Views(database, meta)
				});
				
			}
			
		}
		
	}


});