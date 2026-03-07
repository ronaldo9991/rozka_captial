# Deploy Mekness Project to VPS from Cursor
# This script handles the entire deployment process

param(
    [string]$ServerIP = "67.227.198.100",
    [string]$ServerUser = "root",
    [string]$ServerPath = "/var/www/html/new.mekness.com/",
    [string]$ProjectPath = "d:\Project\Mekness Project"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🚀 MEKNESS VPS DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Verify build
Write-Host "📦 Step 1: Verifying build..." -ForegroundColor Yellow
Set-Location $ProjectPath

if (-not (Test-Path "dist")) {
    Write-Host "❌ dist folder not found. Building project..." -ForegroundColor Red
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Build verified" -ForegroundColor Green

# Step 2: Check if SCP is available
Write-Host "`n📤 Step 2: Checking SSH/SCP availability..." -ForegroundColor Yellow

$scpAvailable = $false
try {
    $scpTest = Get-Command scp -ErrorAction SilentlyContinue
    if ($scpTest) {
        $scpAvailable = $true
        Write-Host "✅ SCP command found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  SCP not found. Will use manual instructions." -ForegroundColor Yellow
}

# Step 3: Upload files
if ($scpAvailable) {
    Write-Host "`n📤 Step 3: Uploading files to server..." -ForegroundColor Yellow
    Write-Host "   Server: ${ServerUser}@${ServerIP}" -ForegroundColor Cyan
    Write-Host "   Path: ${ServerPath}" -ForegroundColor Cyan
    Write-Host "`n   This will prompt for your server password..." -ForegroundColor Yellow
    
    # Upload dist folder
    Write-Host "`n   Uploading dist/ folder..." -ForegroundColor Yellow
    scp -r dist "${ServerUser}@${ServerIP}:${ServerPath}"
    
    # Upload package files
    Write-Host "   Uploading package.json..." -ForegroundColor Yellow
    scp package.json "${ServerUser}@${ServerIP}:${ServerPath}"
    
    Write-Host "   Uploading package-lock.json..." -ForegroundColor Yellow
    scp package-lock.json "${ServerUser}@${ServerIP}:${ServerPath}"
    
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "`n📤 Step 3: Manual upload required" -ForegroundColor Yellow
    Write-Host "   SCP not available. Please use one of these methods:" -ForegroundColor Yellow
    Write-Host "`n   Option 1: Install OpenSSH Client (Windows)" -ForegroundColor Cyan
    Write-Host "      Settings > Apps > Optional Features > OpenSSH Client" -ForegroundColor White
    Write-Host "`n   Option 2: Use PowerShell SSH (if available)" -ForegroundColor Cyan
    Write-Host "`n   Option 3: Manual upload via SFTP client" -ForegroundColor Cyan
    Write-Host "      Files to upload:" -ForegroundColor White
    Write-Host "        - dist/ folder" -ForegroundColor White
    Write-Host "        - package.json" -ForegroundColor White
    Write-Host "        - package-lock.json" -ForegroundColor White
}

# Step 4: Deploy on server
Write-Host "`n🔧 Step 4: Deploying on server..." -ForegroundColor Yellow
Write-Host "   Connecting to server via SSH..." -ForegroundColor Cyan
Write-Host "   You will be prompted for your server password" -ForegroundColor Yellow
Write-Host "`n   Once connected, run these commands:" -ForegroundColor Yellow
Write-Host "`n   ========================================" -ForegroundColor Cyan
Write-Host "   cd ${ServerPath}" -ForegroundColor White
Write-Host "   npm ci --production" -ForegroundColor White
Write-Host "   pm2 restart mekness-app" -ForegroundColor White
Write-Host "   pm2 logs mekness-app --lines 30" -ForegroundColor White
Write-Host "   ========================================`n" -ForegroundColor Cyan

# Try to connect via SSH
Write-Host "   Attempting SSH connection..." -ForegroundColor Yellow
Write-Host "   (If connection fails, manually run: ssh ${ServerUser}@${ServerIP})" -ForegroundColor Yellow

$sshCommand = "ssh ${ServerUser}@${ServerIP} 'cd ${ServerPath} && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20'"

Write-Host "`n   Run this command manually:" -ForegroundColor Cyan
Write-Host "   $sshCommand" -ForegroundColor White
Write-Host "`n   Or connect interactively:" -ForegroundColor Cyan
Write-Host "   ssh ${ServerUser}@${ServerIP}" -ForegroundColor White

# Ask if user wants to run SSH command
$runSSH = Read-Host "`n   Do you want to run the deployment commands now? (y/n)"
if ($runSSH -eq "y" -or $runSSH -eq "Y") {
    Write-Host "`n   Connecting and deploying..." -ForegroundColor Yellow
    ssh "${ServerUser}@${ServerIP}" "cd ${ServerPath} && npm ci --production && pm2 restart mekness-app && pm2 logs mekness-app --lines 20"
} else {
    Write-Host "`n   Skipping automatic deployment." -ForegroundColor Yellow
    Write-Host "   Please run the commands manually when ready." -ForegroundColor Yellow
}

# Step 5: Verification
Write-Host "`n✅ Step 5: Deployment Summary" -ForegroundColor Green
Write-Host "`n   Test your deployment:" -ForegroundColor Yellow
Write-Host "   - Client: https://new.mekness.com/" -ForegroundColor Cyan
Write-Host "   - Admin: https://new.mekness.com/huwnymfphhrq/" -ForegroundColor Cyan

Write-Host "`n   Check server status:" -ForegroundColor Yellow
Write-Host "   ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   pm2 logs mekness-app" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
