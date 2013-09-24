window.couchdb.forget().deauthorize();
window.couchdb = null;
window.database = null;
window.theme.open(window.theme.rootPath+window.theme.sitePath + '/login');