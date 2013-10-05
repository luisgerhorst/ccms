#!/bin/sh
# dependencies: yuicompressor, cat

# index
yuicompressor -o etc/database.min.js etc/database.js
yuicompressor -o etc/theme.min.js etc/theme.js
yuicompressor -o etc/error.min.js etc/error.js
yuicompressor -o etc/index/start.min.js etc/index/start.js
cat etc/libs/jquery.min.js etc/libs/mustache.min.js etc/database.min.js etc/theme.min.js etc/error.min.js etc/index/start.min.js > etc/index/all.js