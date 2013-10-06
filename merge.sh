#!/bin/sh

# Merge changes from dev into min, optimize, commit and publish.

git checkout min

git merge dev

sh optimize.sh

git add . -A
git commit -m "optimized files"

git push origin min

git checkout dev