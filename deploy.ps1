# Simple Deployment Script
cd "d:\Project\Mekness Project"

Write-Host "Uploading dist folder..." -ForegroundColor Yellow
scp -r dist root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "Uploading package.json..." -ForegroundColor Yellow
scp package.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "Uploading package-lock.json..." -ForegroundColor Yellow
scp package-lock.json root@67.227.198.100:/var/www/html/new.mekness.com/

Write-Host "Deploying on server..." -ForegroundColor Yellow
ssh root@67.227.198.100 'cd /var/www/html/new.mekness.com/ && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20'

Write-Host "Deployment complete!" -ForegroundColor Green

