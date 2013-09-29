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
	
});