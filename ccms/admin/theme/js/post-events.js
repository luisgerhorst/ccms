// Elements

var contentTextarea = $('form.post.edit textarea.content'),
	dateInput = $('form.post.edit input.date'),
	postIDInput = $('form.post.edit input.postID'),
	titleInput = $('form.post.edit input.title'),
	autoCreatePostIDCheckbox = $('form.post.edit input.autoCreatePostID'),
	form = $('form.post.edit'),
	deleteButton = $('form.post.edit input.delete');
	
var documentID = form.data('document-id'),
	postDoc = new PostDoc(documentID);
	
// Actions

autoCreatedPostID(titleInput.val(), postIDInput, autoCreatePostIDCheckbox);
dateInput.val(moment.unix(dateInput.data('unix-timestamp')).format("YYYY-MM-DD HH:mm")); // fill date with post's date using unix timestamp

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
	postDoc.update(titleInput.val(), contentTextarea.val(), dateInput.val(), postIDInput.val());
});

deleteButton.click(function () {
	postDoc.delete();
});