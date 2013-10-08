// Elements

var contentTextarea = $('form.page.edit textarea.content'),
	pageIDInput = $('form.page.edit input.pageID'),
	titleInput = $('form.page.edit input.title'),
	priorityInput = $('form.page.edit input.priority'),
	autoCreatePageIDCheckbox = $('form.page.edit input.autoCreatePageID'),
	form = $('form.page.edit'),
	deleteButton = $('form.page.edit input.delete');
	
var documentID = form.data('document-id'),
	pageDoc = new PageDoc(documentID);
	
// Actions

autoCreatedPageID(titleInput.val(), pageIDInput, autoCreatePageIDCheckbox);

// Events

autoCreatePageIDCheckbox.mousedown(function() {
	if (!autoCreatePageIDCheckbox.is(':checked')) { // on check
		pageIDInput.attr('readonly', 'true'); // add readonly
		pageIDInput.val(createPageID(titleInput.val()));
	}
	else pageIDInput.removeAttr('readonly'); // on uncheck remove readonly
});

titleInput.blur(function () {
	autoCreatedPageID(titleInput, pageIDInput, autoCreatePageIDCheckbox);
});

form.submit(function () { // on save
	pageDoc.update(titleInput.val(), contentTextarea.val(), pageIDInput.val(), parseInt(priorityInput.val()));
});

deleteButton.click(function () {
	pageDoc.delete();
});