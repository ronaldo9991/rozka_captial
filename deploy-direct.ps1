# Direct Deployment - Bypasses execution policy
# Run: powershell -ExecutionPolicy Bypass -File .\deploy-direct.ps1

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

# Upload files
Write-Host "`n📤 Uploading files to server..." -ForegroundColor Yellow
Write-Host "You'll be prompted for server password" -ForegroundColor Cyan

Write-Host "`nUploading dist/ folder..." -ForegroundColor Cyan
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "`nUploading package.json..." -ForegroundColor Cyan
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "`nUploading package-lock.json..." -ForegroundColor Cyan
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Deploy
Write-Host "`n🔧 Deploying on server..." -ForegroundColor Yellow
Write-Host "You'll be prompted for server password again" -ForegroundColor Cyan

ssh root@67.227.198.100 'cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20'

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Test: https://new.mekness.com/" -ForegroundColor Cyan
