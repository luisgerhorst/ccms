function routes() {
	
	var createPostID = function (string) {
		return string.replace(/[\s\W]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
	};
	
	var meta = new (function () {
		
		this.update = function (options) {
			
			database.read('meta', function (meta, error) { if (!error) {
			
				for (var i in options) meta[i] = options[i];
				
				database.save('meta', meta, function (response, error) {
					if (!error) window.location = '#/';
				});
			
			}});
			
		};
		
		this.updateCopyrightYears = function () {
			
			var copyrightYearsString = function (start, end) {
				if (start === end) return start + '';
				else if (start < end) return start + ' - ' + end;
				else if (start > end) return end + ' - ' + start;
			};
		
			var year = parseInt(moment().format('YYYY'));
		
			database.read('meta', function (meta, error) { if (!error) {
				
				var options = {
					
					copyrightYearsEnd: year,
					copyrightYears: copyrightYearsString(meta.copyrightYearsStart, year)
					
				};
				
				this.update(options);
		
			}});
		
		};
		
	})();
	
	var posts = new (function () {
		
		
		var PostDocument = function (content, date, postID, title) {
			
			this.content = content;
			this.date = moment(date, "YYYY-MM-DD HH:mm").unix();
			this.postID = encodeURI(postID);
			this.title = title;
			this.type = 'post';
			
		};
		
		this.createPost = function (options) {
			
			var content = options.content,
				date = options.date,
				postID = options.postID,
				title = options.title;
		
			var post = new PostDocument(content, date, postID, title);
			
			meta.updateCopyrightYears();
			
			if (!post.postID || !post.title) alert('Please enter title and URL.');
		
			else {
				
				database.view('posts', 'byPostID?key="' + post.postID + '"', function (response, error) { if (!error) {
					
					if (response.rows.length) alert('Post with URL /post/' + post.postID + ' does already exist.');
					
					else {
						
						database.save(post, function (response, error) { if (!error) {
					
							window.location = '#/';
					
						}});
					
					}
						
				}});
		
			}
		
		};
		
		this.updatePost = function (options) {
			
			meta.updateCopyrightYears();
			
			var content = options.content,
				date = options.date,
				postID = options.postID,
				title = options.title,
				documentID = options.documentID;
			
			var post = new PostDocument(content, date, postID, title);
			
			if (post.postID && post.title) {
				
				database.view('posts', 'byPostID?key="' + post.postID + '"', function (response, error) { if (!error) {
					
					if (response.rows.length && response.rows[0].value._id !== documentID) alert('Post with URL /post/' + post.postID + ' does already exist.');
					
					else {
						
						database.save(documentID, post, function (response, error) { if (!error) {
					
							window.location = '#/';
					
						}});
					
					}
						
				}});
			
			}
			
			else alert('Please enter title and URL.');
			
		};
		
		this.deletePost = function (documentID) {
			
			var confirmed = confirm('Do you really want to delete this post?');
			
			if (confirmed) {
				
				database.remove(documentID, function (response, error) {
					if (!error) window.location = '#/';
				});
				
			}
			
		};
		
	})();
	
	var routeDone = new (function () {
		
		this.meta = function (views) {
			
			$('.meta form').submit(function () { // on save
				
				meta.update({
					title: $('.meta form .title').val(),
					description: $('.meta form .description').val(),
					postsPerPage: parseInt($('.meta form .postsPerPage').val()),
					copyright: $('.meta form .copyright').val()
				});
				
				return false; // no reload
				
			});
		
		};
		
		var autoCreatedPostID = function (title, postIDElement, autoCreatePostIDElement) {
			
			if (createPostID(title) != postIDElement.val()) {
				
				autoCreatePostIDElement.attr('checked', false);
				postIDElement.removeAttr('readonly');
				
			}
			
		};
	
		this.createPost = function (views) {
			
			var form = $('form.post.create'),
				contentTextarea = $('form.post.create textarea.content'),
				dateInput = $('form.post.create input.date'),
				postIDInput = $('form.post.create input.postID'),
				titleInput = $('form.post.create input.title'),
				autoCreatePostIDCheckbox = $('form.post.create input.autoCreatePostID');
			
			// Actions
			
			autoCreatedPostID(titleInput.val(), postIDInput, autoCreatePostIDCheckbox);
			
			dateInput.val(moment().format("YYYY-MM-DD HH:mm")); // fill date with the current time
			
			// Events
			
			autoCreatePostIDCheckbox.mousedown(function() {
				if (!autoCreatePostIDCheckbox.is(':checked')) postIDInput.attr('readonly', 'true').val(createPostID(titleInput.val()));
				else postIDInput.removeAttr('readonly');
			});
			
			titleInput.keyup(function () {
				if (autoCreatePostIDCheckbox.is(':checked')) postIDInput.val(createPostID(titleInput.val()));
			});
			
			form.submit(function () {
				
				posts.createPost({
					content: contentTextarea.val(),
					date: dateInput.val(),
					postID: postIDInput.val(),
					title: titleInput.val()
				});
				
				return false;
				
			});
			
		};
		
		this.post = function (views) {
			
			// Title
			
			document.title = meta.title + ' - ' + views.post.title;
			
			// Elements
		
			var contentTextarea = $('form.post.edit textarea.content'),
				dateInput = $('form.post.edit input.date'),
				postIDInput = $('form.post.edit input.postID'),
				titleInput = $('form.post.edit input.title'),
				autoCreatePostIDCheckbox = $('form.post.edit input.autoCreatePostID'),
				form = $('form.post.edit'),
				deleteButton = $('form.post.edit input.delete');
				
			
			// Actions
			
			autoCreatedPostID(titleInput.val(), postIDInput, autoCreatePostIDCheckbox);
			dateInput.val(moment.unix(views.post.date).format("YYYY-MM-DD HH:mm")); // fill date with post's date using unix timestamp
			
			// Events
			
			autoCreatePostIDCheckbox.mousedown(function() {
				if (!autoCreatePostIDCheckbox.is(':checked')) { // on check
					postIDInput.attr('readonly', 'true'); // add readonly
					postIDInput.val(createPostID(titleInput.val()));
				}
				else postIDInput.removeAttr('readonly'); // on uncheck remove readonly
			});
			
			titleInput.blur(function () {
				autoCreatedPostID(titleInput, postIDInput, autoCreatePostIDCheckbox);
			});
			
			form.submit(function () { // on save
			
				posts.updatePost({
					documentID: views.post._id,
					title: titleInput.val(),
					content: contentTextarea.val(),
					postID: postIDInput.val(),
					date: dateInput.val()
				});
			
				return false;
			
			});
			
			deleteButton.click(function () {
				posts.deletePost(views.post._id);
			});
			
		};
		
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
			templates: ['header', 'posts', 'footer'],
			before: function (cPath) {
				if (cPath === '/page/0') window.location = '#/';
				else document.title = meta.title;
			},
			done: function () {
				
				$('.posts ol li time').each(function (index) {
					var timeElement = $(this);
					var unix = parseInt(timeElement.attr('datetime'));
					var date = moment.unix(unix).format('MMM D, YYYY'); // .fromNow();
					timeElement.html(date);
				});
				
			}
		},
		{
			path: '/meta',
			templates: ['header', 'meta', 'footer'],
			before: function () {
				document.title = meta.title + ' - Meta';
			},
			done: routeDone.meta,
			head: {
				title: "Luis Gerhorst"
			}
		},
		{
			path: /^\/post\/.+$/,
			templates: ['header', 'post', 'footer'],
			done: routeDone.post
		},
		{
			path: '/create/post',
			templates: ['header', 'createPost', 'footer'],
			before: function () {
				document.title = meta.title + ' - Create Post';
			},
			done: routeDone.createPost
		}
	]);
	
}