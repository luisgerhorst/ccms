#!/bin/sh

# Minify and merge files for faster page load.
# Do not run on branch dev! Only on min.

closure-compiler --js etc/libs/jquery.js etc/libs/mustache.js etc/error.js etc/database.js etc/theme.js etc/index/start.js --js_output_file etc/index/combined.min.js
closure-compiler --js etc/libs/jquery.js etc/libs/mustache.js etc/error.js etc/database.js etc/theme.js etc/notifications.js etc/admin/start.js --js_output_file etc/admin/combined.min.js