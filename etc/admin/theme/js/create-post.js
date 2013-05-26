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

	var Doc = function (title, content, date, postID) {

		this.content = content;
		this.date = moment(date, "YYYY-MM-DD HH:mm").unix();
		this.postID = encodeURI(postID);
		this.title = title;
		this.type = 'post';

	};

	this.create = function (title, content, date, postID) {

		metaDoc.updateCopyrightYears();

		var doc = new Doc(title, content, date, postID);

		if (!doc.postID || !doc.title) alert('Please enter title and URL.');

		else {

			database.view('posts', 'byPostID?key="' + doc.postID + '"', function (res, err) { if (!err) {

				if (res.rows.length) alert('Post with URL /post/' + doc.postID + ' does already exist.');

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

		metaDoc.updateCopyrightYears();

		var doc = new Doc(title, content, date, postID);

		if (doc.postID && doc.title) {

			database.view('posts', 'byPostID?key="' + doc.postID + '"', function (res, err) { if (!err) {

				if (res.rows.length && res.rows[0].value._id !== documentID) alert('Post with URL /post/' + doc.postID + ' does already exist.');

				else {

					database.save(documentID, doc, function (res, err) { if (!err) {

						window.location = '#/';

					}});

				}

			}});

		}

		else alert('Please enter title and URL.');

	};

	this.delete = function (newDocumentID) {

		if (!documentID) documentID = newDocumentID;

		var confirmed = confirm('Do you really want to delete this post?');

		if (confirmed) {

			database.remove(documentID, function (res, err) {
				if (!err) window.location = '#/';
			});

		}

	};

};

var form = $('form.post.create'),
	contentTextarea = $('form.post.create textarea.content'),
	dateInput = $('form.post.create input.date'),
	postIDInput = $('form.post.create input.postID'),
	titleInput = $('form.post.create input.title'),
	autoCreatePostIDCheckbox = $('form.post.create input.autoCreatePostID');
	
var postDoc = new PostDoc();

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
	
	postDoc.create(titleInput.val(), contentTextarea.val(), dateInput.val(), postIDInput.val());
	
	return false;
	
});