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
    git fetch origin "$branch"  # 깃허브의 브랜치 상태 가져오기
    git merge dev --no-edit
    if [ $? -eq 0 ]; then
        echo "Successfully merged dev into $branch"
    else
        echo "Conflict detected in $branch. Attempting to resolve..."
        git merge --abort
        # 깃허브 상태와 동기화 후 재시도
        git reset --hard "origin/$branch"
        git merge dev --no-edit
        if [ $? -eq 0 ]; then
            echo "Resolved by resetting to origin and merging dev into $branch"
        else
            echo "Still failed. Please resolve conflicts manually in $branch"
        fi
    fi
done

# 3. 모든 브랜치를 깃허브에 푸시
echo "Pushing all updated branches to origin..."
git push origin --all --force  # 강제로 푸시해서 동기화 보장

echo "Done!"