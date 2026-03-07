# PowerShell script to copy landing page files, components, and public assets from local to server
# Run this from: D:\Project\Mekness Project

$server = "root@67.227.198.100"
$serverPagesPath = "/root/mekness/client/src/pages"
$serverComponentsPath = "/root/mekness/client/src/components"
$serverPublicPath = "/root/mekness/client/public"
$localPagesPath = "D:\Project\Mekness Project\client\src\pages"
$localComponentsPath = "D:\Project\Mekness Project\client\src\components"
$localPublicPath = "D:\Project\Mekness Project\client\public"

# List of landing page files to copy (excluding signin, signup, dashboard)
$filesToCopy = @(
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

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Copying Landing Pages & Public Assets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Copy landing page files
Write-Host "STEP 1: Copying landing page files..." -ForegroundColor Green
Write-Host "Files to copy: $($filesToCopy.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $filesToCopy) {
    $localFile = Join-Path $localPagesPath $file
    if (Test-Path $localFile) {
        Write-Host "Copying $file..." -ForegroundColor Cyan
        scp $localFile "${server}:${serverPagesPath}/$file"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $file copied successfully" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to copy $file" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ File not found: $localFile" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "STEP 2: Copying landing page components..." -ForegroundColor Green
Write-Host ""

# List of landing page components to copy
$componentsToCopy = @(
    "PublicHeader.tsx",
    "HeroSection.tsx",
    "FeatureCards.tsx",
    "LiveTicker.tsx",
    "CTASection.tsx",
    "Footer.tsx",
    "AnimatedGrid.tsx",
    "ParticleField.tsx",
    "ProductsShowcase.tsx",
    "CorporateServices.tsx",
    "PromoCards.tsx",
    "PartnershipCards.tsx",
    "MobilePlatformsMockup.tsx",
    "AccountTypesWithSpreads.tsx",
    "DownloadsSection.tsx",
    "HeroBackground.tsx",
    "Hero3D.tsx",
    "AnimatedTradingBackground.tsx",
    "LiveForexTicker.tsx",
    "TradingPlatformsMockup.tsx",
    "StatCard.tsx",
    "ThemedImage.tsx",
    "ScrollToTop.tsx",
    "WhatsAppFloat.tsx"
)

foreach ($component in $componentsToCopy) {
    $localComponent = Join-Path $localComponentsPath $component
    if (Test-Path $localComponent) {
        Write-Host "Copying component $component..." -ForegroundColor Cyan
        scp $localComponent "${server}:${serverComponentsPath}/$component"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $component copied successfully" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to copy $component" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Component not found: $localComponent" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "STEP 3: Copying public assets folder..." -ForegroundColor Green
Write-Host ""

# Step 2: Copy entire public folder (recursively)
if (Test-Path $localPublicPath) {
    Write-Host "Copying public folder (this may take a while for large files)..." -ForegroundColor Cyan
    scp -r "${localPublicPath}\*" "${server}:${serverPublicPath}/"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Public assets copied successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to copy public assets" -ForegroundColor Red
        Write-Host "  Try copying individual files if recursive copy fails" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠ Public folder not found: $localPublicPath" -ForegroundColor Yellow
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

