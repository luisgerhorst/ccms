- add default theme
- style install.html
- add install instructions to install.html
- add update.html
- html notifications for admin theme
- change theme without having to replace index.html

# CouchDB

- prefix for CouchDB accounts used by CCMS
- /ccms-couchdb-proxy directly proxies request to the database for CCMS, means you can only access this database over the proxy
- Don't set CouchDB bind_address to "0.0.0.0" when Apache Proxy is running on the same computer