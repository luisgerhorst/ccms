#!/bin/sh
# Minify and merge files for faster page load.
# dependencies: yuicompressor, cat

yuicompressor -o etc/theme.min.js etc/theme.js
yuicompressor -o etc/notifications.min.js etc/notifications.js
yuicompressor -o etc/error.min.js etc/error.js
yuicompressor -o etc/database.min.js etc/database.js

# index
yuicompressor -o etc/index/start.min.js etc/index/start.js
cat etc/libs/jquery.min.js etc/libs/mustache.min.js etc/error.min.js etc/database.min.js etc/theme.min.js etc/index/start.min.js > etc/index/combined.min.js

# admin
yuicompressor -o etc/admin/start.min.js etc/admin/start.js
cat etc/libs/jquery.min.js etc/libs/mustache.min.js etc/error.min.js etc/database.min.js etc/theme.min.js etc/notifications.min.js etc/admin/start.min.js > etc/admin/combined.min.js