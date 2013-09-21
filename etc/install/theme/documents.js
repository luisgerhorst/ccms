function saveDocuments(database) {
	
	$.ajax({
		url: theme.rootPath+theme.filePath + '/documents.json',
		dataType: 'json',
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR);
			notifications.alert('Error <code>' + textStatus + ' ' + errorThrown + '</code> occured while loading <code>' + this.url + '</code>');
		},
		success: function (docs, textStatus, jqXHR) {
			
			$.ajax({
				url: theme.rootPath + '/etc/system.json',
				dataType: 'json',
				error: function (jqXHR, textStatus, errorThrown) {
					notifications.alert('Error ' + textStatus + ' ' + errorThrown + ' occured while loading ' + this.url);
				},
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
								notifications.alert('Error ' + error.code + ' ' + error.message + ' occured while saving a document (' + id + ').');
								errorThrown = true;
							} else if (!error) {
								console.log('Successfully saved document.', doc.id);
							}
					
							toSave--;
							
							if (!toSave) window.theme.open(theme.rootPath+theme.sitePath + '/finished');
					
						});
					
					})(id);
					
				}
			});
			
		}
	});
	
}