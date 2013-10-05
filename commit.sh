#!/bin/sh

# Merge changes in dev, optimize.

git checkout dev

read -p "Files:" filesToCommit
git add $filesToCommit -A

read -p "Description:" commitMessage
git commit -m $commitMessage

git push origin dev

git checkout min
git merge dev

sh optimize.sh

git add . -A
git commit -m "optimized files"

git push origin min

git checkout dev