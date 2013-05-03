function routes() {
	
	var metaEdit = function () {
		
		var updateMeta = function () { // on save
		
			database.read('meta', function (meta, error) {
		
				if (error) console.log('Error.', error);
		
				else {
		
					meta.title = $('#meta-edit-title').val();
					meta.description = $('#meta-edit-description').val();
					meta.postsPerPage = parseInt($('#meta-edit-posts-per-page').val());
					meta.copyright = $('#meta-edit-copyright').val();
		
					database.save('meta', meta, function (response, error) {
		
						if (error) console.log('Error.', error);
		
						else window.location = '#/';
		
					});
		
				}
		
			});
		
			return false; // so the page doesn't reload
		
		};
	
		$('#meta-edit').submit(updateMeta);
	
	};
	
	var postCreate, postEdit;
	
	(function () {
		
		var copyrightYearsString = function (start, end) {
			if (start === end) return start + '';
			else if (start < end) return start + ' - ' + end;
			else if (start > end) {
				console.log('Copyright years start > end, I\'ll fix that.', start, end);
				return end + ' - ' + start;
			}
			else console.log('Copyright years are invalid.', start, end);
		};
		
		var updateCopyrightYears = function () {
		
			var year = parseInt(moment().format('YYYY'));
		
			database.read('meta', function (meta, error) {
		
				if (error) console.log('Error while reading document "meta".', error);
				else {
		
					if (year > meta.copyrightYearsEnd) {
		
						meta.copyrightYearsEnd = year;
						meta.copyrightYears = copyrightYearsString(meta.copyrightYearsStart, meta.copyrightYearsEnd);
		
						database.save('meta', meta, function (response, error) {
							if (error) console.log('Error.', error);
						});
		
					}
		
				}
		
			});
		
		};

		var Post = function (content, date, postID, title) {
			this.content = content.val();
			this.date = moment(date.val(), "YYYY-MM-DD HH:mm").unix();
			this.postID = encodeURI(postID.val());
			this.title = title.val();
			this.type = 'post';
		};

		var createPostID = function (string) {
			return string.replace(/[\s\W]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
		};

		var autoCreatedPostID = function (title, postID, autoCreatePostID) {
			if (createPostID(title.val()) != postID.val()) {
				autoCreatePostID.attr('checked', false);
				postID.removeAttr('readonly');
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
			autoCreatedPostID(title, postID, autoCreatePostID);
			date.val(moment().format("YYYY-MM-DD HH:mm")); // fill date with the current time

			// Events

			autoCreatePostID.mousedown(function() {
				if (!autoCreatePostID.is(':checked')) {
					postID.attr('readonly', 'true');
					postID.val(createPostID(title.val()));
				}
				else postID.removeAttr('readonly');
			});

			title.keyup(function () {
				if (autoCreatePostID.is(':checked')) postID.val(createPostID(title.val()));
			});

			$('#post-create').submit(function () {

				var post = new Post(content, date, postID, title);
				
				updateCopyrightYears(database);
				
				if (!post.postID || !post.title) alert('Please enter title and URL.');

				else {
					
					database.view('posts', 'byPostID?key="' + post.postID + '"', function (response, error) { if (!error) {
						
						if (response.rows.length) alert('Post with URL /post/' + post.postID + ' does already exist.');
						
						else {
							
							database.save(post, function (response, error) { if (!error)
						
								window.location = '#/';
						
							});
						
						}
							
					}});

				}

				return false; // so the page doesn't reload

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
			autoCreatedPostID(title, postID, autoCreatePostID);
			date.val(moment.unix(views.post.date).format("YYYY-MM-DD HH:mm")); // fill date with post's date using unix timestamp

			// Events

			autoCreatePostID.mousedown(function() {
				if (!autoCreatePostID.is(':checked')) { // on check
					postID.attr('readonly', 'true'); // add readonly
					postID.val(createPostID(title.val()));
				}
				else postID.removeAttr('readonly'); // on uncheck remove readonly
			});

			title.blur(function () {
				autoCreatedPostID(title, postID, autoCreatePostID);
			});
			
			var documentID = views.post._id, oldPostID = postID.data('old-post-id');

			$('#post-edit').submit(function () { // on save

				var post = new Post(content, date, postID, title);
				
				updateCopyrightYears(database);

				if (post.postID && post.title) {
					
					database.view('posts', 'byPostID?key="' + post.postID + '"', function (response, error) { if (!error) {
						
						console.log(response);
						
						if (response.rows.length && response.rows[0].value._id !== documentID) alert('Post with URL /post/' + post.postID + ' does already exist.');
						
						else {
							
							database.save(documentID, post, function (response, error) { if (!error) {
						
								window.location = '#/';
						
							}});
						
						}
							
					}});

				}
				
				else alert('Please enter title and URL.');

				return false; // so the page doesn't reload

			});

			$('#post-edit-delete').click(function () {
				
				if (confirm('Do you really want to delete this post?')) {
					
					database.remove(documentID, function (response, error) {
						if (!error) window.location = '#/';
					});
					
				}
				
			});

		}

	})();
	
	template.route([
		{
			path: '/logout',
			before: function () {
				couchdb.forget().deauthorize();
				login();
			}
		},
		{
			path: ['/', /^\/page\/\d+$/],
			templates: ['header', 'index', 'footer'],
			before: function (cPath) {
				if (cPath === '/page/0') window.location = '#/';
				else document.title = meta.title;
			},
			done: function () {
				$('#posts ol li time').each(function (index) {
					var element = $(this);
					var unix = parseInt(element.attr('datetime'));
					var date = moment.unix(unix).format('MMM D, YYYY'); // .fromNow();
					element.html(date);
				});
			}
		},
		{
			path: '/meta',
			templates: ['header', 'meta', 'footer'],
			before: function () {
				document.title = meta.title + ' - Meta';
			},
			done: metaEdit
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header', 'post', 'footer'],
			done: postEdit
		},
		{
			path: '/create/post',
			templates: ['header', 'postCreate', 'footer'],
			done: postCreate
		}
	]);
	
}