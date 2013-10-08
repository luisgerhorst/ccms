$(document).ready(function () {
	
	var routes = [
	
		{
			path: 'login',
			templates: ['login.html'],
			title: 'Login'
		},
		{
			path: 'logout',
			templates: ['logout.html'],
			title: 'Logging out ...'
		},
		{
			path: 'meta',
			templates: ['header.html', 'meta.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - Meta'
		},
		{
			path: '',
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path, parameters) {
				
				if (parameters.page == 1) {
					window.open(theme.host+theme.rootPath+theme.sitePath);
					return false;
				}
				
			},
			title: '{{{header_html.title}}} / Admin - Posts'
		},
		{
			path: /^post\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - {{{post_html.title}}}'
		},
		{
			path: 'create/post',
			templates: ['header.html', 'create-post.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - Create Post'
		},
		{
			path: 'pages',
			templates: ['header.html', 'pages.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - Pages'
		},
		{
			path: /^page\/.+$/,
			templates: ['header.html', 'page.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - {{{page_html.title}}}'
		},
		{
			path: 'create/page',
			templates: ['header.html', 'create-page.html', 'footer.html'],
			title: '{{{header_html.title}}} / Admin - Create Page'
		}
		
	];
	
	function views(database, config) {
	
		var views = {};
	
		views['login.html'] = {
			data: config
		};
	
		views['header.html'] = {
			
			load: function (callback) {
		
				database.read('meta', function (response, error) {
					
					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
					});
					
					else callback(response);
					
				}); // loads the newest posts
		
			}
			
		};
	
		views['footer.html'] = {
			
			load: function (callback) {
				
				database.read('meta', function (response, error) {
					
					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
					});
					
					else callback(response);
					
				}); // loads the newest posts
		
			}
			
		};
	
		views['posts.html'] = {
			
			load: function (callback, path, parameters) {
		
				var postsPerPage = 10,
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
		
			}
			
		};
	
		views['post.html'] = {
			
			load: function (callback, path) {
				
				var postID = path.replace(/^post\//, '');
		
				database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {
					
					if (error) {
						
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the post.'
						});
						
					} else if (!response.rows.length) {
						
						callback(null, {
							title: 'Not Found',
							heading: 'Post not found',
							message: "The post you were looking for wasn't found."
						});
						
					} else
						callback(response.rows[0].value);
		
				});
		
			}
			
		};
		
		views['pages.html'] = {
			
			load: function (callback, path) {
				
				database.view('pages', 'byPriority', function (response, error) {
				
					if (error) {
						
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
						
					} else {
						
						var pages = [];
						for (var i = 0; i < response.rows.length; i++) pages.push(response.rows[i].value);
						
						callback(new PagesView(pages));
						
					}
				
				});
				
				function PagesView(pages) {
					this.pages = pages;
				}
		
			}
			
		};
		
		views['page.html'] = {
			
			load: function (callback, path) {
				
				var pageID = path.replace(/^page\//, '');
				
				database.view('pages', 'byPageID?key="' + pageID + '"', function (response, error) {
					
					if (error) {
						
						callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
						
					} else
						callback(response.rows[0].value);
				
				});
		
			}
			
		};
	
		views['meta.html'] = {
			
			load: function (callback) {
		
				database.read('meta', function (response, error) {
					
					if (error) callback(null, {
						title: error.message,
						heading: 'HTTP Error',
						message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading meta.'
					});
					
					else callback(response);
					
				});
		
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
			
			var database = new (new CouchDB(config.root + 'couchdb/')).Database(config.database);
			
			window.createTheme({
				root: config.root,
				site: 'admin/',
				theme: 'etc/admin/theme/',
				routes: routes,
				views: views(database, config)
			});
			
		}
	});

});