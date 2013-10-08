var form = $('form.page.create'),
	contentTextarea = $('form.page.create textarea.content'),
	pageIDInput = $('form.page.create input.pageID'),
	priorityInput = $('form.page.create input.priority'),
	titleInput = $('form.page.create input.title'),
	autoCreatePageIDCheckbox = $('form.page.create input.autoCreatePageID');
	
var pageDoc = new PageDoc();

// Actions

autoCreatedPageID(titleInput.val(), pageIDInput, autoCreatePageIDCheckbox);

// Events

autoCreatePageIDCheckbox.mousedown(function() {
	if (!autoCreatePageIDCheckbox.is(':checked')) pageIDInput.attr('readonly', 'true').val(createPageID(titleInput.val()));
	else pageIDInput.removeAttr('readonly');
});

titleInput.keyup(function () {
	if (autoCreatePageIDCheckbox.is(':checked')) pageIDInput.val(createPageID(titleInput.val()));
});

form.submit(function () {
	pageDoc.create(titleInput.val(), contentTextarea.val(), pageIDInput.val(), parseInt(priorityInput.val()));
});