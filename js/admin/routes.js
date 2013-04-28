function routes() {
	
	var metaEdit, postCreate, postEdit;
	
	(function () {
	
		metaEdit = function () {
	
			document.title = meta.title + ' - Meta';
	
			$('#meta-edit').submit(function () { // on save
	
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
	
			});
	
		};
	
		(function () {
			
			function copyrightYearsString(start, end) {
				if (start === end) return start + '';
				else if (start < end) return start + ' - ' + end;
				else if (start > end) {
					console.log('Copyright years start > end, I\'ll fix that.', start, end);
					return end + ' - ' + start;
				}
				else console.log('Copyright years are invalid.', start, end);
			}
			
			function updateCopyrightYears(database) {
			
				var year = parseInt(moment().format('YYYY'));
			
				database.read('meta', function (meta, error) {
			
					if (error) console.log('Error while reading document "meta".', error);
					else {
			
						var older = year < meta.copyrightYearsStart, newer = year > meta.copyrightYearsEnd;
			
						if (older || newer) {
			
							if (older) meta.copyrightYearsStart = year;
							else meta.copyrightYearsEnd = year;
							meta.copyrightYears = copyrightYearsString(meta.copyrightYearsStart, meta.copyrightYearsEnd);
			
							database.save('meta', meta, function (response, error) {
								if (error) console.log('Error.', error);
							});
			
						}
			
					}
			
				});
			
			}
	
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
					
					updateCopyrightYears(database);
	
					if (post.postID && post.title) {
	
						database.exists('post-' + post.postID, function (exists) {
	
							if (exists === false) {
	
								database.save('post-' + post.postID, post, function (response, error) {
	
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
					
					updateCopyrightYears(database);
	
					if (post.postID && post.title) {
	
						database.save('post-' + post.postID, post, function (response, error) {
							if (error) console.log('Error.', error);
							else {
								var oldPostID = postID.data('old-post-id');
								if (post.postID != oldPostID) { // if postID has changed
									database.remove('post-' + oldPostID, function (response, error) {
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
	
				$('#post-edit-delete').click(function () {
					var remove = confirm('Do you really want to delete this post?');
					if (remove) {
						
						database.remove('post-' + postID.data('old-post-id'), function (response, error) {
							if (error) console.log('Error.', error);
							else window.location = '#/';
						});
						
					}
				});
	
			}
	
		})();
	
	})();
	
	template.route([
		{
			path: '/logout',
			before: function () {
				couchdb.session.delete();
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