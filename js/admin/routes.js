function setRoutes(template, couchdb, meta) {
	
	template.route('/', ['header', 'index', 'footer'], null, function () {
		document.title = meta.title;
	});
	
	var metaEdit, postCreate, postEdit;
	
	(function () {
	
		metaEdit = function () {
	
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
			
			$('#meta-edit-cancel').click(function () {
			
				var remove = confirm('Do you really want to delete your changes?');
				if (remove) window.location = '#/';
			
			});
	
		};
	
		(function () {
	
			function Post(content, date, postID, title) {
				this.content = content.val();
				this.date = moment(date.val(), "YYYY-MM-DD HH:mm").unix();
				this.postID = postID.val().replace(/\s/g,'');
				this.title = title.val().replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/^\s$/,'');
				this.type = 'post';
			}
	
			var createPostID = function (title) {
				return title.val().replace(/[^\w\s]/gi, '').replace(/(^\s*)|(\s*$)/gi,"").replace(/[ ]{2,}/gi," ").replace(/\n /,"\n").replace(/[ ]+/g, '-').toLowerCase(); // remove special characters, trim spaces, replace spaces by "-", transform to lowercase
			};
	
			var autoCreatedPostIDCheck = function (title, postID, autoCreatePostID) {
				if (createPostID(title) != postID.val()) { // if postID wasn't created using the title
					autoCreatePostID.attr('checked', false); // uncheck autoCreatePostID
					postID.removeAttr('readonly'); // remove postID readonly
				}
			};
	
			postCreate = function () {
	
				// Vars
	
				var content = $('#post-create-content'),
					date = $('#post-create-date'),
					postID = $('#post-create-postID'),
					title = $('#post-create-title'),
					autoCreatePostID = $('#post-create-auto-create-post-id');
	
				// Actions
	
				document.title = meta.title + ' - Create Post';
				autoCreatedPostIDCheck(title, postID, autoCreatePostID);
				date.val(moment().format("YYYY-MM-DD HH:mm")); // fill date with the current time
	
				// Events
	
				autoCreatePostID.mousedown(function() {
					if (!autoCreatePostID.is(':checked')) { // on check
						postID.attr('readonly', 'true'); // add readonly
						postID.val(createPostID(title)); // create postID
					}
					else postID.removeAttr('readonly'); // on uncheck remove readonly
				});
	
				title.keyup(function () { // on keyup
					if (autoCreatePostID.is(':checked')) postID.val(createPostID(title)); // if autoCreatePostID is checked create postID
				});
	
				$('#post-create').submit(function () { // on save
	
					var post = new Post(content, date, postID, title);
	
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
					if (remove) window.location = '#/';
	
				});
	
			};
	
			postEdit = function (views) {
	
				// Vars
	
				var content = $('#post-edit-content'),
					date = $('#post-edit-date'),
					postID = $('#post-edit-postID'),
					title = $('#post-edit-title'),
					autoCreatePostID = $('#post-edit-auto-create-post-id');
	
				// Actions
	
				document.title = meta.title + ' - ' + views.post.title;
				autoCreatedPostIDCheck(title, postID, autoCreatePostID);
				date.val(moment.unix(views.post.date).format("YYYY-MM-DD HH:mm")); // fill date with post's date using unix timestamp
	
				// Events
	
				autoCreatePostID.mousedown(function() {
					if (!autoCreatePostID.is(':checked')) { // on check
						postID.attr('readonly', 'true'); // add readonly
						postID.val(createPostID(title));
					}
					else postID.removeAttr('readonly'); // on uncheck remove readonly
				});
	
				title.blur(function () {
					autoCreatedPostIDCheck(title, postID, autoCreatePostID);
				});
	
				$('#post-edit').submit(function () { // on save
	
					var post = new Post(content, date, postID, title);
	
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
	
			}
	
		})();
	
	})();
	
	template.route('/meta', ['header', 'meta', 'footer'], metaEdit);
	template.route(/^(\/posts\/).+$/, ['header', 'post', 'footer'], postEdit);
	template.route('/create-post', ['header', 'post-create', 'footer'], postCreate);
	
}