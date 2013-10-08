function createPageID(string) {
	return string.replace(/[\s\W]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

function autoCreatedPageID(title, pageIDElement, autoCreatePageIDElement) {

	if (createPageID(title) != pageIDElement.val()) {

		autoCreatePageIDElement.attr('checked', false);
		pageIDElement.removeAttr('readonly');

	}

}

function PageDoc(documentID) {

	var Doc = function (title, content, pageID, priority) {

		this.content = content;
		this.pageID = encodeURI(pageID);
		this.title = title;
		this.type = 'page';
		this.priority = priority;

	};

	this.create = function (title, content, pageID, priority) {

		if (!encodeURI(pageID)) notifications.alert('Please enter an URL.');
		else if (!title) notifications.alert('Please enter a title.');
		else {

			var doc = new Doc(title, content, pageID, priority);
			
			console.info(doc);

			window.database.view('pages', 'byPageID?key="' + doc.pageID + '"', function (res, err) { if (!err) {

				if (res.rows.length) notifications.alert('Page with URL /' + doc.pageID + ' does already exist.');
				else {

					database.save(doc, function (res, err) { if (!err) {
						documentID = res.id;
						window.open(theme.siteBasePath + 'pages');
					}});

				}

			}});

		}

	};

	this.update = function (title, content, pageID, priority) {

		if (!encodeURI(pageID)) notifications.alert('Please enter an URL.');
		else if (!title) notifications.alert('Please enter a title.');
		else {

			var doc = new Doc(title, content, pageID, priority);

			window.database.view('pages', 'byPageID?key="' + doc.pageID + '"', function (res, err) { if (!err) {

				if (res.rows.length && res.rows[0].value._id !== documentID) notifications.alert('Page with URL /' + doc.pageID + ' does already exist.');
				else {

					database.save(documentID, doc, function (res, err) { if (!err) {
						window.open(window.theme.siteBasePath + 'pages');
					}});

				}

			}});

		}

	};

	this.delete = function (newDocumentID) {

		if (!documentID) documentID = newDocumentID;

		notifications.confirm('Do you really want to delete this post?', 'Cancel', 'Delete', function (confirmed) { if (confirmed) {

			window.database.remove(documentID, function (res, err) {
				if (!err) window.open(window.theme.siteBasePath + 'pages');
			});

		}});

	};

}