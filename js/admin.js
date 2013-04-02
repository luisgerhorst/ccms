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
		
			var func = 'all?limit=10&descending=true';
			
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
			
			var content = $('#post-edit-content'), date = $('#post-edit-date'), postID = $('#post-edit-postID'), title = $('#post-edit-title'), autoCreateURL = $('#post-edit-auto-create-url');
			
			var postIDByTitle = function () {
				return title.val().replace(/[^\w\s]/gi, '').replace(/[ ]+/g, '-').toLowerCase(); // removed all special characters and replace spaces by "-"
			}, checkPostIDIsByTitle = function () {
				
				if (postIDByTitle() != postID.val()) { // if postID wasn't created using the title
					autoCreateURL.attr('checked', false); // uncheck autoCreateURL
					postID.removeAttr('readonly'); // remove postID readonly
				}
				
			};
			
			checkPostIDIsByTitle();
			date.val(moment.unix(date.data('unix-timestamp')).format("YYYY-MM-DD HH:mm"));
			
			autoCreateURL.mousedown(function() {
				if (!autoCreateURL.is(':checked')) { // on check
					postID.attr('readonly', 'true'); // add readonly
					postID.val(postIDByTitle());
				}
				else postID.removeAttr('readonly'); // on uncheck remove readonly
			});
			
			title.blur(checkPostIDIsByTitle);
			
			$('#post-edit').submit(function () { // on save
				
				checkPostIDIsByTitle();
				
				var post = {
					content: content.val(),
					date: moment(date.val(), "YYYY-MM-DD HH:mm").unix(),
					postID: postID.val(),
					title: title.val(),
					type: 'post'
				};
				
				console.log(post);
				
				couchdb.save('post-' + post.postID, post, function (response, error) {
					
					if (error) console.log('Error.', error);
					
					else {
						
						var oldPostID = postID.data('old-post-id');
						
						if (post.postID != oldPostID) { // if postID has changed
							
							couchdb.remove('post-' + oldPostID, function (response, error) {
								if (error) console.log('Error.', error);
								else window.location = '#/';
							});
							
						}
						
						else window.location = '#/';
						
					}
					
				});
				
				return false; // so the page doesn't reload
				
			});
			
		});
		
		template.load();

	}

});