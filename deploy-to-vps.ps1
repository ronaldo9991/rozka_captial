# VPS Deployment Script for Mekness Project (PowerShell)
# Usage: .\deploy-to-vps.ps1

Write-Host "🚀 Starting Mekness VPS Deployment..." -ForegroundColor Cyan

# Configuration
$SERVER_IP = "67.227.198.100"
$SERVER_USER = "root"
$SERVER_PATH = "/var/www/html/new.mekness.com/"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found project files" -ForegroundColor Green

# Step 1: Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: npm ci failed" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Build failed" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: Build failed. dist/ directory not found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green

# Step 2: Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$DEPLOY_DIR = "deploy-package"
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Recurse -Force $DEPLOY_DIR
}
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

# Copy necessary files
Copy-Item -Recurse -Force "dist" "$DEPLOY_DIR\dist"
Copy-Item -Force "package.json" "$DEPLOY_DIR\package.json"
Copy-Item -Force "package-lock.json" "$DEPLOY_DIR\package-lock.json"

# Copy optional files if they exist
if (Test-Path "server") { Copy-Item -Recurse -Force "server" "$DEPLOY_DIR\server" }
if (Test-Path "shared") { Copy-Item -Recurse -Force "shared" "$DEPLOY_DIR\shared" }
if (Test-Path "drizzle.config.ts") { Copy-Item -Force "drizzle.config.ts" "$DEPLOY_DIR\drizzle.config.ts" }
if (Test-Path "tsconfig.json") { Copy-Item -Force "tsconfig.json" "$DEPLOY_DIR\tsconfig.json" }

# Create deployment instructions
$instructions = @"
DEPLOYMENT INSTRUCTIONS
=======================

1. Extract this package on the server:
   tar -xzf deploy-package.tar.gz -C /var/www/html/new.mekness.com/

2. Navigate to the directory:
   cd /var/www/html/new.mekness.com/

3. Install dependencies:
   npm ci --production

4. Create .env file with your environment variables (see VPS_DEPLOYMENT_GUIDE.md)

5. Start with PM2:
   pm2 start dist/index.js --name mekness-app
   pm2 save
   pm2 startup

6. Configure Nginx reverse proxy (see VPS_DEPLOYMENT_GUIDE.md)

"@

Set-Content -Path "$DEPLOY_DIR\DEPLOY_INSTRUCTIONS.txt" -Value $instructions

# Create tarball using tar (Windows 10+)
Write-Host "📦 Creating tarball..." -ForegroundColor Yellow
$tarFile = "deploy-package.tar.gz"

# Use tar command (available in Windows 10+)
Push-Location $DEPLOY_DIR
Get-ChildItem | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "Adding: $relativePath"
}
Pop-Location

# Create tar.gz using tar command
tar -czf $tarFile -C $DEPLOY_DIR .

if (Test-Path $tarFile) {
    Write-Host "✅ Deployment package created: $tarFile" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Could not create tarball. You may need to manually zip the deploy-package folder." -ForegroundColor Yellow
}

# Display upload instructions
Write-Host ""
Write-Host "📤 Upload Instructions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Using SCP (if you have SSH client installed):"
Write-Host "  scp $tarFile ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 2: Using SFTP client (FileZilla, WinSCP, etc.)"
Write-Host "  Upload $tarFile to: ${SERVER_PATH}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 3: Using Git (if repository is set up)"
Write-Host "  Push to repository and pull on server" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Deployment package ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Upload $tarFile to the server" -ForegroundColor White
Write-Host "2. SSH into the server: ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor White
Write-Host "3. Extract: cd ${SERVER_PATH} && tar -xzf $tarFile" -ForegroundColor White
Write-Host "4. Follow the instructions in VPS_DEPLOYMENT_GUIDE.md" -ForegroundColor White
Write-Host ""

# Ask about cleanup
$cleanup = Read-Host "Do you want to keep the deploy-package directory? (y/n)"
if ($cleanup -ne "y" -and $cleanup -ne "Y") {
    Remove-Item -Recurse -Force $DEPLOY_DIR
    Write-Host "✅ Cleaned up temporary files" -ForegroundColor Green
}

Write-Host "🎉 Deployment package created successfully!" -ForegroundColor Green
