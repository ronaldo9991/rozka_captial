# Simple Deployment Script - Run this in Cursor terminal
# Usage: .\deploy-simple.ps1

Write-Host "🚀 Starting Deployment..." -ForegroundColor Green

# Navigate to project
cd "d:\Project\Mekness Project"

# Step 1: Build (if needed)
if (-not (Test-Path "dist")) {
    Write-Host "Building project..." -ForegroundColor Yellow
    npm run build
}

# Step 2: Upload files
Write-Host "`nUploading files to server..." -ForegroundColor Yellow
Write-Host "You'll be prompted for the server password" -ForegroundColor Cyan

# Upload dist folder
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

# Upload package files
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "✅ Files uploaded!" -ForegroundColor Green

# Step 3: Deploy on server
Write-Host "`nDeploying on server..." -ForegroundColor Yellow
Write-Host "You'll be prompted for the server password again" -ForegroundColor Cyan

ssh root@67.227.198.100 "cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20"

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "Test: https://new.mekness.com/" -ForegroundColor Cyan
