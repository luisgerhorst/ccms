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
			title: '{{header_html.title}}'
		},
		{
			path: /^\/posts\/.+$/,
			templates: ['header.html', 'post.html', 'footer.html'],
			title: '{{header_html.title}} - {{post_html.title}}'
		}
	];
	
	function views(database, meta) {
	
		var views = {};
	
		views['header.html'] = meta;
	
		views['footer.html'] = meta;
	
		views['head.html'] = meta;
	
		views['posts.html'] = function (callback, path, parameters) {
			
			// Actions
			
			var postsPerPage = meta.postsPerPage,
				urlPageIndex = parseInt(parameters.page || 1),
				pageIndex = urlPageIndex-1;
				skip = postsPerPage * pageIndex;
			
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
							
							callback(new View(pageIndex, page));
							
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
			
		};
		
		views['post.html'] = function (callback, path) {
			
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
					var post = response.rows[0].value;
					callback(post);
				}
			
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