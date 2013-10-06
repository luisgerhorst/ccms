#!/bin/sh

# Commit and publish changes.

git checkout dev

read -p "Files: " filesToCommit
git add $filesToCommit -A

read -p "Description: " commitMessage
git commit -m "$commitMessage"

git push origin dev