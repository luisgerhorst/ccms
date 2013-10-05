#!/bin/sh
# Minify and merge files for faster page load.
# dependencies: yuicompressor, cat

# index
yuicompressor -o etc/database.min.js etc/database.js
yuicompressor -o etc/theme.min.js etc/theme.js
yuicompressor -o etc/error.min.js etc/error.js
yuicompressor -o etc/index/start.min.js etc/index/start.js
cat etc/libs/jquery.min.js minify-seperator.txt etc/libs/mustache.min.js minify-seperator.txt etc/database.min.js minify-seperator.txt etc/theme.min.js minify-seperator.txt etc/error.min.js minify-seperator.txt etc/index/start.min.js > etc/index/all.js