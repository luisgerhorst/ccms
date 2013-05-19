console.log('logging out.');

couchdb.forget().deauthorize();
window.location = '#/login';