$(document).ready(function () {
	
	var template = new Template();
	var couchdb;

	$.ajax({
		url: 'config.json'
	}).done(function (config) {

		couchdb = new CouchDB(config.couchdbProxy, config.database, true, true);
		
		couchdb.read('meta', function (meta, error) {
			
			if (error) console.log('Error while loading document "meta".', error);
			
			defineTemplates(meta);
			
		});
		
		forms();

	});

	function defineTemplates(meta) {
		
		document.title = meta.title;
		
		template.createTemplate('header', function (callback) {
			
			callback(meta);
			
		});
		
		template.createTemplate('footer', function (callback) {
			
			callback(meta);
			
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
		
		template.createTemplate('post', function (callback, path) {
			
			var postID = path.replace(/^\/posts\//, '');
			
			couchdb.read('post-' + postID, function (response, error) {
				if (error) console.log('Error while getting view "' + func + '" of design document "posts".', error);
				callback(response);
			}); // loads the newest posts
			
		});

		template.createRoute(/^\/$/, ['header', 'index', 'footer']);
		
		template.createRoute(/^(\/posts\/).+$/, ['header', 'post', 'footer'], function () {
			
			var date = $('input#post-date');
			var time = moment.unix(date.data('unix-timestamp')).format("YYYY-MM-DD, HH:mm");
			date.val(time);
			
			$('button#post-save').click(function () {
				
			});
			
		});
		
		template.load();

	}
	
	function forms() {
	
	}

});