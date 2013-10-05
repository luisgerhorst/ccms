#!/bin/sh

# Merge changes in dev, optimize.

git checkout dev

read -p "Files: " filesToCommit
git add $filesToCommit -A

read -p "Description: " commitMessage
git commit -m $commitMessage

git push origin dev