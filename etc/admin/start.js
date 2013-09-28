$(document).ready(function () {
	
	var routes = [
	
		{
			path: ['/login'],
			templates: ['login.html'],
			title: 'Login'
		},
		{
			path: '/logout',
			templates: ['logout.html'],
			title: 'Logging out ...'
		},
		{
			path: '/',
			templates: ['header.html', 'posts.html', 'footer.html'],
			before: function (path) {
				
				if (getParameter('page') == 1) {
					window.open(theme.host+theme.rootPath+theme.sitePath);
					return false;
				}
				
				function getParameter(n) {
					var m = RegExp('[?&]'+n+'=([^&]*)').exec(window.location.search);
					return m && decodeURIComponent(m[1].replace(/\+/g, ' '));
				}
				
			},
			title: '{{header_html.title}}'
		},
		{
			path: '/meta',
			templates: ['header.html', 'meta.html', 'footer.html'],
			title: '{{header_html.title}} - Meta'
		},
		{
			path: /^\/posts\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{header_html.title}} - {{post_html.title}}'
		},
		{
			path: '/create/post',
			templates: ['header.html', 'create-post.html', 'footer.html'],
			title: '{{header_html.title}} - Create Post'
		}
		
	];
	
	function views(database, config) {
	
		var views = {};
	
		views['login.html'] = config;
	
		views['header.html'] = function (callback) {
	
			database.read('meta', function (response, error) {
				
				if (error) callback(null, {
					title: error.message,
					heading: 'HTTP Error',
					message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
				});
				
				else callback(response);
				
			}); // loads the newest posts
	
		};
	
		views['footer.html'] = function (callback) {
			
			database.read('meta', function (response, error) {
				
				if (error) callback(null, {
					title: error.message,
					heading: 'HTTP Error',
					message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
				});
				
				else callback(response);
				
			}); // loads the newest posts
	
		};
	
		views['posts.html'] = function (callback, path) {
	
			var postsPerPage = 10,
				urlPageIndex = parseInt(getParameter('page') || 1),
				pageIndex = urlPageIndex-1;
				skip = postsPerPage * pageIndex;
			
			function getParameter(n) {
				var m = RegExp('[?&]'+n+'=([^&]*)').exec(window.location.search);
				return m && decodeURIComponent(m[1].replace(/\+/g, ' '));
			}
	
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
	
			database.view('posts', 'byDate?descending=true&skip=' + skip + '&limit=' + postsPerPage, function (response, error) {
	
				if (error) callback(null, {
					title: error.message,
					heading: 'HTTP Error',
					message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the posts.'
				});
				
				else {
	
					var posts = [];
					var rows = response.rows;
					for (var i = rows.length; i--;) posts[i] = rows[i].value;
		
					database.view('posts', 'compactByDate?descending=true&skip=' + ( skip + postsPerPage ) + '&limit=1', function (response, error) {
		
						if (error) callback(null, {
							title: error.message,
							heading: 'HTTP Error',
							message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured.'
						});
						
						else callback(new View(pageIndex, {
							posts: posts,
							hasNext: response.rows.length ? true : false
						}));
		
					});
					
				}
	
			});
	
		};
	
		views['post.html'] = function (callback, path) {
	
			var postID = path.replace(/^\/posts\//, '');
	
			database.view('posts', 'byPostID?key="' + postID + '"', function (response, error) {
				
				if (error) callback(null, {
					title: error.message,
					heading: 'HTTP Error',
					message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading the post.'
				});
				else if (!response.rows.length) callback(null, {
					title: 'Not Found',
					heading: 'Post not found',
					message: "The post you were looking for wasn't found."
				});
				else callback(response.rows[0].value);
	
			});
	
		};
	
		views['meta.html'] = function (callback) {
	
			database.read('meta', function (response, error) {
				
				if (error) callback(null, {
					title: error.message,
					heading: 'HTTP Error',
					message: 'The error <code>' + error.code + ' ' + error.message + '</code> occured while loading meta.'
				});
				
				else callback(response);
				
			});
	
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
			
			var database = new (new CouchDB(config.root + '/couchdb')).Database(config.database);
			
			window.theme.setup({
				rootPath: config.root,
				sitePath: '/admin',
				filePath: '/etc/admin/theme',
				routes: routes,
				views: views(database, config),
				log: ['error', 'performance', 'info']
			});
			
		}
	});

});