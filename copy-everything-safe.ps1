# PowerShell script to copy everything from local to server
# EXCLUDES: dashboard, signin, signup pages, and problematic backend files
# Run this from: D:\Project\Mekness Project

$server = "root@67.227.198.100"
$baseServerPath = "/root/mekness"
$baseLocalPath = "D:\Project\Mekness Project"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive Copy - Safe Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will copy:" -ForegroundColor Green
Write-Host "  ✓ All landing pages" -ForegroundColor Green
Write-Host "  ✓ All components (except AuthCard)" -ForegroundColor Green
Write-Host "  ✓ All public assets" -ForegroundColor Green
Write-Host "  ✓ Frontend configuration files" -ForegroundColor Green
Write-Host "  ✓ Some safe backend files" -ForegroundColor Green
Write-Host ""
Write-Host "This will NOT copy:" -ForegroundColor Red
Write-Host "  ✗ SignIn.tsx, SignUp.tsx" -ForegroundColor Red
Write-Host "  ✗ dashboard/ folder" -ForegroundColor Red
Write-Host "  ✗ admin/ folder (pages)" -ForegroundColor Red
Write-Host "  ✗ AuthCard.tsx (used by signin/signup)" -ForegroundColor Red
Write-Host "  ✗ routes.ts (authentication logic)" -ForegroundColor Red
Write-Host "  ✗ db-storage.ts (database operations)" -ForegroundColor Red
Write-Host ""
Write-Host "Press Ctrl+C to cancel, or press Enter to continue..." -ForegroundColor Yellow
Read-Host

# ============================================
# STEP 1: Copy landing page files
# ============================================
Write-Host ""
Write-Host "STEP 1: Copying landing page files..." -ForegroundColor Green

$pagesToCopy = @(
    "Home.tsx",
    "About.tsx",
    "Forex.tsx",
    "Contact.tsx",
    "Complaints.tsx",
    "IntroducingBroker.tsx",
    "DepositsWithdrawals.tsx",
    "TradingContest.tsx",
    "ButtonShowcase.tsx",
    "WhatIsForex.tsx",
    "ForexAdvantages.tsx",
    "ForexPedia.tsx",
    "DepositBonus.tsx",
    "NoDepositBonus.tsx",
    "not-found.tsx"
)

$localPagesPath = Join-Path $baseLocalPath "client\src\pages"
$serverPagesPath = "$baseServerPath/client/src/pages"

foreach ($file in $pagesToCopy) {
    $localFile = Join-Path $localPagesPath $file
    if (Test-Path $localFile) {
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        scp $localFile "${server}:${serverPagesPath}/$file" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ $file" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Failed: $file" -ForegroundColor Red
        }
    }
}

# ============================================
# STEP 2: Copy components (excluding AuthCard)
# ============================================
Write-Host ""
Write-Host "STEP 2: Copying components (excluding AuthCard)..." -ForegroundColor Green

$localComponentsPath = Join-Path $baseLocalPath "client\src\components"
$serverComponentsPath = "$baseServerPath/client/src/components"

# Get all component files except AuthCard
$componentFiles = Get-ChildItem -Path $localComponentsPath -Filter "*.tsx" -Recurse | 
    Where-Object { 
        $_.Name -ne "AuthCard.tsx" -and 
        $_.FullName -notlike "*dashboard*" -and
        $_.FullName -notlike "*admin*" -and
        $_.FullName -notlike "*__tests__*" -and
        $_.FullName -notlike "*examples*"
    }

foreach ($file in $componentFiles) {
    $relativePath = $file.FullName.Replace($localComponentsPath, "").TrimStart("\")
    $serverPath = "$serverComponentsPath/$relativePath"
    Write-Host "  Copying component: $relativePath..." -ForegroundColor Cyan
    scp $file.FullName "${server}:${serverPath}" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $relativePath" -ForegroundColor Green
    } else {
        Write-Host "    ✗ Failed: $relativePath" -ForegroundColor Red
    }
}

# ============================================
# STEP 3: Copy public assets (IMPORTANT - all files and folders)
# ============================================
Write-Host ""
Write-Host "STEP 3: Copying public assets (this may take a while)..." -ForegroundColor Green

$localPublicPath = Join-Path $baseLocalPath "client\public"
$serverPublicPath = "$baseServerPath/client/public"

if (Test-Path $localPublicPath) {
    Write-Host "  Copying public folder recursively (all files and subfolders)..." -ForegroundColor Cyan
    
    # Method 1: Try copying entire folder structure
    Write-Host "  Attempting to copy entire public folder..." -ForegroundColor Cyan
    scp -r "${localPublicPath}" "${server}:${baseServerPath}/client/" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Method 1 failed, trying individual files and folders..." -ForegroundColor Yellow
        
        # Method 2: Copy root files first
        $rootFiles = Get-ChildItem -Path $localPublicPath -File
        foreach ($file in $rootFiles) {
            Write-Host "    Copying file: $($file.Name)..." -ForegroundColor Cyan
            scp $file.FullName "${server}:${serverPublicPath}/$($file.Name)" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "      ✓ $($file.Name)" -ForegroundColor Green
            } else {
                Write-Host "      ✗ Failed: $($file.Name)" -ForegroundColor Red
            }
        }
        
        # Method 3: Copy subdirectories
        $subdirs = Get-ChildItem -Path $localPublicPath -Directory
        foreach ($subdir in $subdirs) {
            Write-Host "    Copying folder: $($subdir.Name)..." -ForegroundColor Cyan
            $targetPath = "${serverPublicPath}/$($subdir.Name)"
            # Create directory first
            ssh $server "mkdir -p $targetPath" 2>&1 | Out-Null
            # Copy all files in subdirectory
            scp -r "${subdir.FullName}\*" "${server}:${targetPath}/" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "      ✓ $($subdir.Name)/" -ForegroundColor Green
            } else {
                Write-Host "      ✗ Failed: $($subdir.Name)/" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "    ✓ Public folder copied successfully" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠ Public folder not found: $localPublicPath" -ForegroundColor Yellow
}

# ============================================
# STEP 4: Copy frontend config files
# ============================================
Write-Host ""
Write-Host "STEP 4: Copying frontend configuration..." -ForegroundColor Green

$frontendConfigFiles = @(
    "client\vite.config.ts",
    "client\tsconfig.json",
    "client\index.html",
    "client\tailwind.config.js",
    "client\postcss.config.js"
)

foreach ($file in $frontendConfigFiles) {
    $localFile = Join-Path $baseLocalPath $file
    if (Test-Path $localFile) {
        $serverFile = "$baseServerPath/$file"
        Write-Host "  Copying $file..." -ForegroundColor Cyan
        scp $localFile "${server}:${serverFile}" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ $file" -ForegroundColor Green
        }
    }
}

# ============================================
# STEP 5: Copy safe backend files (excluding problematic ones)
# ============================================
Write-Host ""
Write-Host "STEP 5: Copying safe backend files..." -ForegroundColor Green

$localServerPath = Join-Path $baseLocalPath "server"
$serverServerPath = "$baseServerPath/server"

# Files to EXCLUDE from backend
$excludedBackendFiles = @(
    "routes.ts",           # Has authentication logic we modified
    "db-storage.ts",       # Database operations
    "storage.ts",          # Storage interface (might have changes)
    "seed.ts"              # Database seeding (might have changes)
)

# Get all backend files except excluded ones
$backendFiles = Get-ChildItem -Path $localServerPath -Filter "*.ts" -Recurse |
    Where-Object {
        $excluded = $false
        foreach ($excludedFile in $excludedBackendFiles) {
            if ($_.Name -eq $excludedFile) {
                $excluded = $true
                break
            }
        }
        -not $excluded
    }

foreach ($file in $backendFiles) {
    $relativePath = $file.FullName.Replace($localServerPath, "").TrimStart("\")
    $serverPath = "$serverServerPath/$relativePath"
    Write-Host "  Copying backend: $relativePath..." -ForegroundColor Cyan
    scp $file.FullName "${server}:${serverPath}" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $relativePath" -ForegroundColor Green
    }
}

# ============================================
# STEP 6: Copy shared schema/types
# ============================================
Write-Host ""
Write-Host "STEP 6: Copying shared schema and types..." -ForegroundColor Green

$localSharedPath = Join-Path $baseLocalPath "shared"
$serverSharedPath = "$baseServerPath/shared"

if (Test-Path $localSharedPath) {
    $sharedFiles = Get-ChildItem -Path $localSharedPath -Recurse -File
    foreach ($file in $sharedFiles) {
        $relativePath = $file.FullName.Replace($localSharedPath, "").TrimStart("\")
        $serverPath = "$serverSharedPath/$relativePath"
        Write-Host "  Copying shared: $relativePath..." -ForegroundColor Cyan
        scp $file.FullName "${server}:${serverPath}" 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ $relativePath" -ForegroundColor Green
        }
    }
}

# ============================================
# STEP 7: Copy package.json (to sync dependencies)
# ============================================
Write-Host ""
Write-Host "STEP 7: Copying package.json..." -ForegroundColor Green

$packageJson = Join-Path $baseLocalPath "package.json"
if (Test-Path $packageJson) {
    Write-Host "  Copying package.json..." -ForegroundColor Cyan
    scp $packageJson "${server}:${baseServerPath}/package.json" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ package.json copied" -ForegroundColor Green
        Write-Host "    ⚠ You may need to run 'npm install' on server" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copy Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps on server:" -ForegroundColor Yellow
Write-Host "  1. cd /root/mekness"
Write-Host "  2. npm install (if package.json changed)"
Write-Host "  3. npm run build"
Write-Host "  4. pm2 restart mekness-api"
Write-Host ""

