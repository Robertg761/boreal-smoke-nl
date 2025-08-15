# PowerShell script to set up GitHub repository for Boreal Smoke NL
# Run this script after you've created the repository on GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Setup for Boreal Smoke NL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$gitPath = "E:\Program Files\Git\bin\git.exe"

Write-Host "This script will help you push your code to GitHub." -ForegroundColor Yellow
Write-Host ""
Write-Host "OPTION 1: Create repository via GitHub website" -ForegroundColor Green
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: boreal-smoke-nl" -ForegroundColor White
Write-Host "3. Description: Hyperlocal air quality forecasting app for Newfoundland and Labrador" -ForegroundColor White
Write-Host "4. Make it PUBLIC" -ForegroundColor White
Write-Host "5. Do NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "6. Click 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "OPTION 2: Install GitHub CLI and run:" -ForegroundColor Green
Write-Host "gh repo create boreal-smoke-nl --public --source=. --remote=origin --push" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($continue -eq 'y') {
    Write-Host ""
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    & $gitPath remote add origin https://github.com/robertg761/boreal-smoke-nl.git
    
    Write-Host "Setting up main branch..." -ForegroundColor Yellow
    & $gitPath branch -M main
    
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    & $gitPath push -u origin main
    
    Write-Host ""
    Write-Host "✅ Success! Your repository is now live at:" -ForegroundColor Green
    Write-Host "https://github.com/robertg761/boreal-smoke-nl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set up Firebase project and download credentials" -ForegroundColor White
    Write-Host "2. Configure environment variables in backend/.env" -ForegroundColor White
    Write-Host "3. Install Python dependencies: cd backend && pip install -r requirements.txt" -ForegroundColor White
    Write-Host "4. Initialize React Native app in mobile-app directory" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick link to create repo: https://github.com/new" -ForegroundColor Cyan
}
