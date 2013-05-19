$(document).ready(function () {

var routes = [
	{
		path: '/logout',
		templates: ['logout.html'],
	},
	{
		path: ['/', /^\/page\/\d+$/],
		templates: ['header.html', 'posts.html', 'footer.html'],
		before: function (path) {
			if (path === '/page/0') window.location = '#/';
		},
		title: '{{header_html.title}}'
	},
	{
		path: '/meta',
		templates: ['header.html', 'meta.html', 'footer.html'],
		title: '{{header_html.title}} - Meta'
	},
	{
		path: /^\/post\/.+$/,
		templates: ['header.html', 'post.html', 'footer.html'],
		title: '{{header_html.title}} - {{post_html.title}}'
	},
	{
		path: '/create/post',
		templates: ['header.html', 'create-post.html', 'footer.html'],
		title: '{{header_html.title}} - Create Post'
	}
];

var views = {
	
	"header.html": function (callback) {
	
		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			else meta = response;
			callback(response);
		}); // loads the newest posts
	
	},
	
	"footer.html": function (callback) {
	
		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			else meta = response;
			callback(response);
		}); // loads the newest posts
	
	}
	
};

var render = function (theme, database, meta) {

	var views = {};

	views['header.html'] = function (callback) {

		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			else meta = response;
			callback(response);
		}); // loads the newest posts

	};

	views['footer.html'] = function (callback) {

		database.read('meta', function (response, error) {
			if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
			else meta = response;
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

	theme.render(views);

};
	
var theme = new Theme('ccms/admin/theme');

$.ajax({
	url: 'config.json'
}).done(function (config) {
	
	var couchdb = new CouchDB(config.proxy);
	var database = new couchdb.Database(config.database);
	
	database.read('meta', function (meta, err) {
		if (err) console.log('Error while loading document "meta".', err);
		else {
			render(theme, database, meta);
			route(theme);
		}
	});
	
});

});