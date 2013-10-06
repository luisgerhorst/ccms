#!/bin/sh

# Minify and merge files for faster page load.
# Do not run on branch dev! Only on min.

s="\r\n"

theme=`yuicompressor etc/theme.js`
notifications=`yuicompressor etc/notifications.js`
error=`yuicompressor etc/error.js`
database=`yuicompressor etc/database.js`
indexStart=`yuicompressor etc/index/start.js`
adminStart=`yuicompressor etc/admin/start.js`

# index
index=etc/index/combined.min.js
cat etc/libs/jquery.min.js > $index
echo $s >> $index
cat etc/libs/mustache.min.js >> $index
echo $s$error$s$database$s$theme$s$indexStart >> $index

# admin
admin=etc/admin/combined.min.js
cat etc/libs/jquery.min.js > $admin
echo $s >> $admin
cat etc/libs/mustache.min.js >> $admin
echo $s$error$s$database$s$theme$s$notifications$s$adminStart >> $admin