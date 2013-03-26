$(document).ready(function () {
	
	$.ajax({
		url: 'config.json'
	}).done(function (data) {
		// console.log('Received configuration.', data);
		var couchdb = new CouchDB(data.couchdbProxy, data.database);
		couchdb.read('meta', function (meta, error) {
			
			if (error) console.log('Error while loading document "meta".', error);
			var template = new Template(meta);
			
			defineTemplates(couchdb, template, meta);
			return;
			
		});
	});
	
	function defineTemplates(couchdb, template, meta) {
		
		template.createTemplate('header', function (callback, path) {
			callback(meta);
		});
		
		template.createTemplate('footer', function (callback, path) {
			callback(meta);
		});
		
		template.createTemplate('post', function (callback, path) {
			
			var postID = path.replace(/^\/posts\//, '');
			
			couchdb.read('post-' + postID, function (response, error) {
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				callback(response);
			}); // loads the newest posts
			
		});
		
		template.createTemplate('index', function (callback) {
	
			var func = 'all?limit=' + meta.postsPerPage + '&descending=true'; // 2 will be meta.postsPerPage later
		
			couchdb.view('posts', func, function (response, error) {
				
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				
				var posts = [];
				var rows = response.rows;
				for (var i = rows.length; i--;) posts[i] = rows[i].value;
				
				callback({ posts: posts });
				
			}); // loads the newest posts
			
		});
		
		template.createRoute(/^\/$/, ['header', 'index', 'footer']);
		
		template.createRoute(/^\/posts\/.+$/, ['header', 'post', 'footer']);
		
		template.reload();
		
	}
	
});