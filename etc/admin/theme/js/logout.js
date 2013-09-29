try {
	window.couchdb.forget().deauthorize();
} catch (error) {
	console.log('Error while calling forget and deauthorize on couchdb.');
}

window.couchdb = null;
window.database = null;
window.open(window.theme.rootPath+window.theme.sitePath + '/login');