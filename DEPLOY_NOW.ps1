# Complete Deployment Script
# Run this to deploy everything to the server

$server = "root@67.227.198.100"
$serverPath = "/var/www/html/new.mekness.com/"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 MEKNESS DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to project
Set-Location "d:\Project\Mekness Project"

# Verify build
Write-Host "Verifying build..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
}
Write-Host "✅ Build ready" -ForegroundColor Green

# Step 1: Upload files
Write-Host "`n📤 STEP 1: Uploading files..." -ForegroundColor Yellow
Write-Host "Password: hY>pWH|11~7E4E`n" -ForegroundColor Cyan

Write-Host "Uploading dist/ folder..." -ForegroundColor White
scp -r dist ${server}:${serverPath}

Write-Host "`nUploading package.json..." -ForegroundColor White
scp package.json ${server}:${serverPath}

Write-Host "`nUploading package-lock.json..." -ForegroundColor White
scp package-lock.json ${server}:${serverPath}

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Step 2: Deploy on server
Write-Host "`n🔧 STEP 2: Deploying on server..." -ForegroundColor Yellow
Write-Host "Password: hY>pWH|11~7E4E`n" -ForegroundColor Cyan

$deployCommands = @"
cd ${serverPath}
npm ci --production
pm2 restart mekness-app
pm2 logs mekness-app --lines 20
"@

ssh ${server} $deployCommands

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "`nTest your site:" -ForegroundColor Yellow
Write-Host "  https://new.mekness.com/" -ForegroundColor Cyan
Write-Host "  https://new.mekness.com/huwnymfphhrq/`n" -ForegroundColor Cyan
