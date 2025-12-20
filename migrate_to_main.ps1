# Rename local branch from master to main
Write-Host "Renaming local branch 'master' to 'main'..."
git branch -m master main

# Push the new main branch to origin and set upstream
Write-Host "Pushing 'main' branch to origin..."
git push -u origin main

# Use GitHub CLI to set the default branch to main
Write-Host "Setting default branch to 'main' on GitHub..."
gh repo edit bonny2long/SyncUp --default-branch main

# Delete the old master branch from remote
Write-Host "Deleting remote 'master' branch..."
git push origin --delete master

Write-Host "Migration complete! You are now on branch 'main'."
