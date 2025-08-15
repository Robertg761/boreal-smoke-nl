# PowerShell script to run data updates
# Can be scheduled with Windows Task Scheduler to run every 30 minutes

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Boreal Smoke NL - Data Update" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "G:\Projects\NL Wildfire & Air Quality Tracker\backend"

# Activate virtual environment if it exists
$venvPath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & $venvPath
} else {
    Write-Host "Virtual environment not found. Please set up Python environment first." -ForegroundColor Red
    Write-Host "Run: python -m venv venv" -ForegroundColor Yellow
    Write-Host "Then: .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "Then: pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Run the update script
Write-Host "Running data update..." -ForegroundColor Green
python update_data.py

# Check if successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Update completed successfully!" -ForegroundColor Green
    Write-Host "View live data at: https://robertg761.github.io/boreal-smoke-nl/" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Update failed. Check data_update.log for details." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
