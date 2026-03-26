# Copy and paste this ENTIRE block into PowerShell
# Run from: D:\Project\Mekness Project

cd "D:\Project\Mekness Project"
$server = "root@67.227.198.100"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copying Everything (Safe Mode)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# STEP 1: Landing Pages
Write-Host "STEP 1: Landing Pages..." -ForegroundColor Green
$pages = @("Home.tsx", "About.tsx", "Forex.tsx", "Contact.tsx", "Complaints.tsx", "IntroducingBroker.tsx", "DepositsWithdrawals.tsx", "TradingContest.tsx", "ButtonShowcase.tsx", "WhatIsForex.tsx", "ForexAdvantages.tsx", "ForexPedia.tsx", "DepositBonus.tsx", "NoDepositBonus.tsx", "not-found.tsx")
foreach ($page in $pages) {
    if (Test-Path "client\src\pages\$page") {
        scp "client\src\pages\$page" "${server}:/root/mekness/client/src/pages/$page"
        Write-Host "  ✓ $page" -ForegroundColor Green
    }
}

# STEP 2: Public Folder (ENTIRE FOLDER - MOST IMPORTANT)
Write-Host ""
Write-Host "STEP 2: Public Folder (this may take a while)..." -ForegroundColor Green
scp -r "client\public" "${server}:/root/mekness/client/"
Write-Host "  ✓ Public folder copied" -ForegroundColor Green

# STEP 3: Components
Write-Host ""
Write-Host "STEP 3: Components..." -ForegroundColor Green
Get-ChildItem "client\src\components" -Filter "*.tsx" -Recurse | Where-Object { 
    $_.Name -ne "AuthCard.tsx" -and 
    $_.FullName -notlike "*dashboard*" -and 
    $_.FullName -notlike "*admin*" -and 
    $_.FullName -notlike "*__tests__*" -and
    $_.FullName -notlike "*examples*"
} | ForEach-Object {
    $currentPath = (Get-Location).Path
    $fullPath = $_.FullName
    $relPath = $fullPath.Replace("$currentPath\client\src\components\", "").Replace("\", "/")
    scp $fullPath "${server}:/root/mekness/client/src/components/$relPath"
    Write-Host "  ✓ $relPath" -ForegroundColor Green
}

# STEP 4: Frontend Config
Write-Host ""
Write-Host "STEP 4: Frontend Config..." -ForegroundColor Green
@("client\vite.config.ts", "client\tsconfig.json", "client\index.html") | ForEach-Object {
    if (Test-Path $_) {
        scp $_ "${server}:/root/mekness/$_"
        Write-Host "  ✓ $_" -ForegroundColor Green
    }
}

# STEP 5: Shared Schema
Write-Host ""
Write-Host "STEP 5: Shared Schema..." -ForegroundColor Green
if (Test-Path "shared") {
    Get-ChildItem "shared" -Recurse -File | ForEach-Object {
        $relPath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
        scp $_.FullName "${server}:/root/mekness/$relPath"
        Write-Host "  ✓ $relPath" -ForegroundColor Green
    }
}

# STEP 6: Safe Backend Files
Write-Host ""
Write-Host "STEP 6: Safe Backend Files..." -ForegroundColor Green
Get-ChildItem "server" -Filter "*.ts" -Recurse | Where-Object {
    $_.Name -ne "routes.ts" -and
    $_.Name -ne "db-storage.ts" -and
    $_.Name -ne "storage.ts" -and
    $_.Name -ne "seed.ts"
} | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/")
    scp $_.FullName "${server}:/root/mekness/$relPath"
    Write-Host "  ✓ $relPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copy Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tell the assistant: 'Copy complete, please rebuild'" -ForegroundColor Yellow

