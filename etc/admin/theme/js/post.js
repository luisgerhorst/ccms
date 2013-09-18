var createPostID = function (string) {
	return string.replace(/[\s\W]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
};

var autoCreatedPostID = function (title, postIDElement, autoCreatePostIDElement) {
	
	if (createPostID(title) != postIDElement.val()) {
		
		autoCreatePostIDElement.attr('checked', false);
		postIDElement.removeAttr('readonly');
		
	}
	
};

var PostDoc = function (documentID) {
	
	var dateFormat = 'YYYY-MM-DD HH:mm';
	
	var Doc = function (title, content, date, postID) {
	
		this.content = content;
		this.date = moment(date, dateFormat).unix();
		this.postID = encodeURI(postID);
		this.title = title;
		this.type = 'post';
	
	};
	
	this.create = function (title, content, date, postID) {
		
		if (!date || !moment(date, dateFormat).isValid()) notifications.alert('Please enter a valid date.');
		else if (!encodeURI(postID)) notifications.alert('Please enter an URL.');
		else if (!title) notifications.alert('Please enter a title.');
		else {
			
			var doc = new Doc(title, content, date, postID);
	
			database.view('posts', 'byPostID?key="' + doc.postID + '"', function (res, err) { if (!err) {
	
				if (res.rows.length) notifications.alert('Post with URL /post/' + doc.postID + ' does already exist.');
				else {
	
					database.save(doc, function (res, err) { if (!err) {
						documentID = res.id;
						window.location = '#/';
					}});
					
				}
				
			}});
	
		}
	
	};
	
	this.update = function (title, content, date, postID) {
	
		if (!date || !moment(date, dateFormat).isValid()) notifications.alert('Please enter a valid date.');
		else if (!encodeURI(postID)) notifications.alert('Please enter an URL.');
		else if (!title) notifications.alert('Please enter a title.');
		else {
	
			var doc = new Doc(title, content, date, postID);
	
			database.view('posts', 'byPostID?key="' + doc.postID + '"', function (res, err) { if (!err) {
	
				if (res.rows.length && res.rows[0].value._id !== documentID) notifications.alert('Post with URL /post/' + doc.postID + ' does already exist.');
				else {
	
					database.save(documentID, doc, function (res, err) { if (!err) {
						window.location = '#/';
					}});
	
				}
	
			}});
	
		}
	
	};
	
	this.delete = function (newDocumentID) {
		
		if (!documentID) documentID = newDocumentID;
	
		notifications.confirm('Do you really want to delete this post?', 'Cancel', 'Delete', function (confirmed) { if (confirmed) {
			
			database.remove(documentID, function (res, err) {
				if (!err) window.location = '#/';
			});
			
		}});
	
	};
	
}