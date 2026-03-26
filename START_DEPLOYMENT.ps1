# START DEPLOYMENT - Run this script in Cursor
# This will guide you through the entire deployment process

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 MEKNESS DEPLOYMENT FROM CURSOR" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check SSH availability
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$hasSSH = Get-Command ssh -ErrorAction SilentlyContinue
$hasSCP = Get-Command scp -ErrorAction SilentlyContinue

if (-not $hasSSH -or -not $hasSCP) {
    Write-Host "`n❌ SSH/SCP not found!" -ForegroundColor Red
    Write-Host "`nTo install OpenSSH Client:" -ForegroundColor Yellow
    Write-Host "1. Open PowerShell as Administrator" -ForegroundColor White
    Write-Host "2. Run this command:" -ForegroundColor White
    Write-Host "   Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0" -ForegroundColor Cyan
    Write-Host "`nOr install via Settings:" -ForegroundColor Yellow
    Write-Host "   Settings > Apps > Optional Features > Add a feature > OpenSSH Client`n" -ForegroundColor White
    
    $install = Read-Host "Do you want to try installing OpenSSH now? (requires admin) (y/n)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "`nAttempting to install OpenSSH Client..." -ForegroundColor Yellow
        try {
            Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
            Write-Host "✅ OpenSSH Client installed! Please restart Cursor and run this script again." -ForegroundColor Green
            exit
        } catch {
            Write-Host "❌ Installation failed. Please install manually (see instructions above)." -ForegroundColor Red
            exit
        }
    } else {
        Write-Host "`nPlease install OpenSSH Client first, then run this script again." -ForegroundColor Yellow
        exit
    }
}

Write-Host "✅ SSH and SCP are available!" -ForegroundColor Green

# Navigate to project
Set-Location "d:\Project\Mekness Project"

# Verify build
Write-Host "`nVerifying build..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Build verified" -ForegroundColor Green

# Upload files
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📤 UPLOADING FILES TO SERVER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server: root@67.227.198.100" -ForegroundColor White
Write-Host "Path: /var/www/html/new.mekness.com/" -ForegroundColor White
Write-Host "`nYou'll be prompted for your server password" -ForegroundColor Yellow
Write-Host "`nUploading dist/ folder..." -ForegroundColor Cyan
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "`nUploading package.json..." -ForegroundColor Cyan
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "`nUploading package-lock.json..." -ForegroundColor Cyan
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Deploy on server
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔧 DEPLOYING ON SERVER" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "You'll be prompted for your server password again" -ForegroundColor Yellow
Write-Host "`nRunning deployment commands..." -ForegroundColor Cyan

# Use single quotes to prevent PowerShell from parsing && operators
ssh root@67.227.198.100 'cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20'

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nTest your deployment:" -ForegroundColor Yellow
Write-Host "  Client: https://new.mekness.com/" -ForegroundColor Cyan
Write-Host "  Admin:  https://new.mekness.com/huwnymfphhrq/" -ForegroundColor Cyan
Write-Host "`nTo check server status:" -ForegroundColor Yellow
Write-Host "  ssh root@67.227.198.100" -ForegroundColor White
Write-Host "  pm2 status" -ForegroundColor White
Write-Host "  pm2 logs mekness-app" -ForegroundColor White
Write-Host ""
