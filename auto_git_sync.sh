#!/bin/bash

# Script to automatically commit and push changes to GitHub
# Created for UrbanMind application

# Navigate to the project directory
cd "$(dirname "$0")"

# Get current date for commit message
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit on $DATE"
    exit 0
else
    # Commit changes with date in message
    git commit -m "Auto-commit: $DATE"
    
    # Push changes to GitHub
    git push origin main
    
    echo "Changes committed and pushed successfully on $DATE"
fi
