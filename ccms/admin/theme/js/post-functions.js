var createPostID = function (string) {
	return string.replace(/[\s\W]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
};

var autoCreatedPostID = function (title, postIDElement, autoCreatePostIDElement) {
	
	if (createPostID(title) != postIDElement.val()) {
		
		autoCreatePostIDElement.attr('checked', false);
		postIDElement.removeAttr('readonly');
		
	}
	
};

var updateCopyrightYears = function () {
	
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

var PostDocument = function (content, date, postID, title) {
	
	this.content = content;
	this.date = moment(date, "YYYY-MM-DD HH:mm").unix();
	this.postID = encodeURI(postID);
	this.title = title;
	this.type = 'post';
	
};

var createPost = function (options) {
	
	updateCopyrightYears();
	
	var content = options.content,
		date = options.date,
		postID = options.postID,
		title = options.title;

	var post = new PostDocument(content, date, postID, title);
	
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

var updatePost = function (options) {
	
	updateCopyrightYears();
	
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

var deletePost = function (documentID) {
	
	var confirmed = confirm('Do you really want to delete this post?');
	
	if (confirmed) {
		
		database.remove(documentID, function (response, error) {
			if (!error) window.location = '#/';
		});
		
	}
	
};