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
		
		template.createTemplate('post-create', function (callback) {
			
			callback({});
			
		});
		
		template.createTemplate('meta', function (callback) {
			
			callback(meta);
			
		});

		template.createRoute(/^\/$/, ['header', 'index', 'footer'], function () {
			document.title = meta.title;
		});
		
		template.createRoute(/^(\/posts\/).+$/, ['header', 'post', 'footer'], function () {
			
			// Vars
			
			var content = $('#post-edit-content'),
				date = $('#post-edit-date'),
				postID = $('#post-edit-postID'),
				title = $('#post-edit-title'),
				autoCreatePostID = $('#post-edit-auto-create-post-id'),
				createPostID = function () {
					return title.val().replace(/[^\w\s]/gi, '').replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/[ ]+/g, '-').toLowerCase(); // remove special characters, trim spaces, replace spaces by "-", transform to lowercase
				},
				autoCreatedPostID = function () {
					if (createPostID() != postID.val()) { // if postID wasn't created using the title
						autoCreatePostID.attr('checked', false); // uncheck autoCreatePostID
						postID.removeAttr('readonly'); // remove postID readonly
					}
				};
			
			// Actions
			
			document.title = meta.title + ' - ' + title.val();
			autoCreatedPostID();
			date.val(moment.unix(date.data('unix-timestamp')).format("YYYY-MM-DD HH:mm"));
			
			// Events
			
			autoCreatePostID.mousedown(function() {
				if (!autoCreatePostID.is(':checked')) { // on check
					postID.attr('readonly', 'true'); // add readonly
					postID.val(createPostID());
				}
				else postID.removeAttr('readonly'); // on uncheck remove readonly
			});
			
			title.blur(autoCreatedPostID);
			
			$('#post-edit').submit(function () { // on save
				
				var post = {
					content: content.val(),
					date: moment(date.val(), "YYYY-MM-DD HH:mm").unix(),
					postID: postID.val().replace(/\s/g,''), // remove all spaces
					title: title.val().replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/^\s$/,''), // remove 'bad' spaces
					type: 'post'
				};
				
				if (post.postID && post.title) {
				
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
					
				}
				
				else alert('Please enter title and URL.');
				
				return false; // so the page doesn't reload
				
			});
			
			$('#post-edit-cancel').click(function () {
					
				var remove = confirm('Do you really want to delete your changes?');
				
				if (remove) window.location = '#/';
					
			});
			
			$('#post-edit-delete').click(function () {
					
				var remove = confirm('Do you really want to delete this post?');
				
				if (remove) {
					
					couchdb.remove('post-' + postID.data('old-post-id'), function (response, error) {
						if (error) console.log('Error.', error);
						else window.location = '#/';
					});
					
				}
					
			});
			
		});
		
		template.createRoute(/^\/create-post$/, ['header', 'post-create', 'footer'], function () {
			
			// Vars
			
			var content = $('#post-create-content'),
				date = $('#post-create-date'),
				postID = $('#post-create-postID'),
				title = $('#post-create-title'),
				autoCreatePostID = $('#post-create-auto-create-post-id'),
				createPostID = function () {
					return title.val().replace(/[^\w\s]/gi, '').replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/[ ]+/g, '-').toLowerCase(); // remove special characters, trim spaces, replace spaces by "-", transform to lowercase
				},
				autoCreatedPostID = function () {
					if (createPostID() != postID.val()) { // if postID wasn't created using the title
						autoCreatePostID.attr('checked', false); // uncheck autoCreatePostID
						postID.removeAttr('readonly'); // remove postID readonly
					}
				};
			
			// Actions
			
			document.title = meta.title + ' - Create Post';
			autoCreatedPostID();
			date.val(moment().format("YYYY-MM-DD HH:mm")); // fill date with the current time
			
			// Events
			
			autoCreatePostID.mousedown(function() {
				if (!autoCreatePostID.is(':checked')) { // on check
					postID.attr('readonly', 'true'); // add readonly
					postID.val(createPostID()); // create postID
				}
				else postID.removeAttr('readonly'); // on uncheck remove readonly
			});
			
			title.keyup(function () { // on focus-loss
				if (autoCreatePostID.is(':checked')) postID.val(createPostID()); // if autoCreatePostID is checked create postID
			});
			
			$('#post-create').submit(function () { // on save
				
				var post = {
					content: content.val(),
					date: moment(date.val(), "YYYY-MM-DD HH:mm").unix(),
					postID: postID.val().replace(/\s/g,''),
					title: title.val().replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/^\s$/,''),
					type: 'post'
				};
				
				if (post.postID && post.title) {
				
					couchdb.exists('post-' + post.postID, function (exists) {
						
						if (exists === false) {
							
							couchdb.save('post-' + post.postID, post, function (response, error) {
								
								if (error) console.log('Error.', error);
								
								else window.location = '#/';
								
							});
							
						}
						
						else alert('Post with URL /posts/' + post.postID + ' does already exist.');
						
					});
				
				}
				
				else alert('Please enter title and URL.');
				
				return false; // so the page doesn't reload
				
			});
			
			$('#post-create-cancel').click(function () {
					
				var remove = confirm('Do you really want to delete this post?');
				
				if (remove) {
					
					window.location = '#/';
					
				}
					
			});
			
		});
		
		template.createRoute(/^\/meta$/, ['header', 'meta', 'footer'], function () {
			
			document.title = meta.title + ' - Meta';
			
			$('#meta-edit').submit(function () { // on save
				
				couchdb.read('meta', function (meta, error) {
					
					if (error) console.log('Error.', error);
					
					else {
						
						meta.title = $('#meta-edit-title').val();
						meta.description = $('#meta-edit-description').val();
						meta.postsPerPage = parseInt($('#meta-edit-posts-per-page').val());
						meta.copyright = $('#meta-edit-copyright').val();
						
						couchdb.save('meta', meta, function (response, error) {
							
							if (error) console.log('Error.', error);
							
							else window.location = '#/';
							
						});
						
					}
					
				});
				
				return false; // so the page doesn't reload
				
			});
			
		});
		
		template.load();

	}

});