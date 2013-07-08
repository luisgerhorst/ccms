function saveDocuments(database) {
	
	$.ajax({
		url: theme.path + '/documents.json',
		dataType: 'json',
		success: function (docs, textStatus, jqXHR) {
			
			$.ajax({
				url: 'etc/system.json',
				dataType: 'json',
				success: function (system, textStatus, jqXHR) {
					
					var blogTitle = $('input[name="title"]').val();
					
					docs.meta.system = system;
					docs.meta.title = blogTitle;
					docs.meta.copyright = blogTitle;
					
					var toSave = 4,
						errorThrown = false;
					
					for (var id in docs) (function (id) {
					
						var doc = docs[id];
						
						var errorThrown = false; // no multiple alerts
					
						database.save(id, doc, function (response, error) {
					
							if (!errorThrown && error) {
								notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while saving a document.');
								errorThrown = true;
							} else if (!error) {
								console.log('Successfully saved document.', doc.id);
							}
					
							toSave--;
							if (!toSave) window.location = '#/finished';
					
						});
					
					})(id);
					
				}
			});
			
		}
	});
	
}