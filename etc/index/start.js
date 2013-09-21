$(document).ready(function () {
	
	var routes = [
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path) {
				if (path === '/page/0') {
					theme.open(theme.host+theme.rootPath+theme.sitePath);
					return false;
				}
			},
			title: '{{header_html.title}}'
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{header_html.title}} - {{post_html.title}}'
		}
	];
	
	function views(database, meta) {
	
		var views = {};
	
		views['header.html'] = meta;
	
		views['footer.html'] = meta;
	
		views['head.html'] = meta;
	
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
	
				database.view('posts', 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage, function (response, error) {
	
					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the posts.'
					});
					
					else {
						
						var loaded = [], rows = response.rows;
						
						var l = rows.length;
						for (var i = 0; i < l; i++) loaded.push(rows[i].value);
						
						database.view('posts', 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1', function (response, error) {
						
							if (error) callback(null, {
								title: error.message,
								heading: 'HTTP Error',
								message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
							});
							
							else {
								
								var page = {
									posts: loaded,
									hasNext: response.rows.length ? true : false
								};
								
								cache.index[pageIndex] = page;
								
								callback(new View(pageIndex, page));
								
							}
						
						});
						
					}
	
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
						var post = response.rows[0].value;
						cache.post[postID] = post;
						callback(post);
					}
	
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
					
					window.theme.setup({
						rootPath: config.root,
						sitePath: '',
						filePath: '/themes/' + meta.theme,
						routes: routes,
						views: views(database, meta),
						log: ['error', 'info']
					});
					
				}
				
			});
		
		}
	});

});