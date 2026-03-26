# PowerShell script to copy ONLY the public folder from local to server
# Run this from: D:\Project\Mekness Project

$server = "root@67.227.198.100"
$baseServerPath = "/root/mekness"
$baseLocalPath = "D:\Project\Mekness Project"

$localPublicPath = Join-Path $baseLocalPath "client\public"
$serverPublicPath = "$baseServerPath/client/public"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copying Public Folder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $localPublicPath)) {
    Write-Host "ERROR: Public folder not found at: $localPublicPath" -ForegroundColor Red
    exit 1
}

Write-Host "Source: $localPublicPath" -ForegroundColor Yellow
Write-Host "Destination: ${server}:${serverPublicPath}" -ForegroundColor Yellow
Write-Host ""

# Method 1: Copy entire public folder (preserves structure)
Write-Host "Method 1: Copying entire public folder..." -ForegroundColor Green
scp -r "${localPublicPath}" "${server}:${baseServerPath}/client/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Public folder copied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copy complete!" -ForegroundColor Green
    exit 0
}

Write-Host "  Method 1 failed, trying alternative method..." -ForegroundColor Yellow
Write-Host ""

# Method 2: Copy files individually
Write-Host "Method 2: Copying files individually..." -ForegroundColor Green

# Copy root files
$rootFiles = Get-ChildItem -Path $localPublicPath -File
Write-Host "  Copying root files ($($rootFiles.Count) files)..." -ForegroundColor Cyan
foreach ($file in $rootFiles) {
    scp $file.FullName "${server}:${serverPublicPath}/$($file.Name)" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $($file.Name)" -ForegroundColor Red
    }
}

# Copy subdirectories
$subdirs = Get-ChildItem -Path $localPublicPath -Directory
Write-Host "  Copying subdirectories ($($subdirs.Count) folders)..." -ForegroundColor Cyan
foreach ($subdir in $subdirs) {
    Write-Host "    Copying $($subdir.Name)/..." -ForegroundColor Cyan
    $targetPath = "${serverPublicPath}/$($subdir.Name)"
    
    # Create directory on server
    ssh $server "mkdir -p $targetPath" 2>&1 | Out-Null
    
    # Copy all files in subdirectory
    $files = Get-ChildItem -Path $subdir.FullName -Recurse -File
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace($subdir.FullName, "").TrimStart("\")
        $serverFile = "$targetPath/$relativePath"
        $serverDir = Split-Path $serverFile -Parent
        
        # Create subdirectory structure if needed
        if ($relativePath.Contains("\")) {
            ssh $server "mkdir -p $serverDir" 2>&1 | Out-Null
        }
        
        scp $file.FullName "${server}:${serverFile}" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      ✓ $relativePath" -ForegroundColor Green
        } else {
            Write-Host "      ✗ $relativePath" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copy complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps on server:" -ForegroundColor Yellow
Write-Host "  1. cd /root/mekness"
Write-Host "  2. npm run build"
Write-Host "  3. pm2 restart mekness-api"
Write-Host ""

