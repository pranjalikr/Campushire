# Script to push frontend to GitHub
# Usage: .\push-to-github.ps1

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "PUSH FRONTEND TO GITHUB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Prompt for GitHub repository URL
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo-name.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Error: Repository URL is required!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAdding remote origin..." -ForegroundColor Yellow
git remote add origin $repoUrl 2>$null
if ($LASTEXITCODE -ne 0) {
    # Remote might already exist, try to set URL
    git remote set-url origin $repoUrl
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to set remote URL" -ForegroundColor Red
        exit 1
    }
    Write-Host "Remote URL updated" -ForegroundColor Green
} else {
    Write-Host "Remote added successfully" -ForegroundColor Green
}

Write-Host "`nChecking current branch..." -ForegroundColor Yellow
$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = "master"
    git branch -M master
}

Write-Host "Current branch: $branch" -ForegroundColor Cyan

Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
git push -u origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Frontend pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nRepository URL: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "ERROR: Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "`nPossible issues:" -ForegroundColor Yellow
    Write-Host "  - Repository doesn't exist or URL is incorrect" -ForegroundColor White
    Write-Host "  - Authentication required (check GitHub credentials)" -ForegroundColor White
    Write-Host "  - Network connection issue" -ForegroundColor White
    Write-Host "`nTry running: git push -u origin $branch" -ForegroundColor Cyan
}
