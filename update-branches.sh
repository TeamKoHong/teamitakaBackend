#!/bin/bash

# 1. dev 브랜치 최신화
echo "Updating local dev branch from origin/dev..."
git checkout dev
git pull origin dev

# 2. 모든 브랜치에 dev를 merge
echo "Merging dev into all branches (except dev and main)..."
for branch in $(git branch | grep -v "dev\|main" | sed 's/^\*//g' | sed 's/^[[:space:]]*//g'); do
    echo "--------------------------------"
    echo "Processing branch: $branch"
    git checkout "$branch"
    git merge dev --no-edit
    if [ $? -eq 0 ]; then
        echo "Successfully merged dev into $branch"
    else
        echo "Conflict detected in $branch. Aborting merge..."
        git merge --abort
        echo "Please resolve conflicts manually in $branch"
    fi
done

# 3. 모든 브랜치를 깃허브에 푸시 (선택 사항)
echo "Pushing all updated branches to origin..."
git push origin --all

echo "Done!"