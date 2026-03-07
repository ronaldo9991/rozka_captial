# Copy Instructions - Run These Commands

## Quick Copy - Run These Commands in PowerShell

Open PowerShell and run these commands one by one:

```powershell
# Navigate to your project
cd "D:\Project\Mekness Project"

# Set server info
$server = "root@67.227.198.100"

# STEP 1: Copy landing pages
Write-Host "Copying landing pages..." -ForegroundColor Green
$pages = @("Home.tsx", "About.tsx", "Forex.tsx", "Contact.tsx", "Complaints.tsx", "IntroducingBroker.tsx", "DepositsWithdrawals.tsx", "TradingContest.tsx", "ButtonShowcase.tsx", "WhatIsForex.tsx", "ForexAdvantages.tsx", "ForexPedia.tsx", "DepositBonus.tsx", "NoDepositBonus.tsx", "not-found.tsx")
foreach ($page in $pages) {
    scp "client\src\pages\$page" "${server}:/root/mekness/client/src/pages/$page"
}

# STEP 2: Copy public folder (ENTIRE FOLDER)
Write-Host "Copying public folder..." -ForegroundColor Green
scp -r "client\public" "${server}:/root/mekness/client/"

# STEP 3: Copy components (excluding AuthCard and dashboard/admin)
Write-Host "Copying components..." -ForegroundColor Green
Get-ChildItem "client\src\components" -Filter "*.tsx" -Recurse | Where-Object { $_.Name -ne "AuthCard.tsx" -and $_.FullName -notlike "*dashboard*" -and $_.FullName -notlike "*admin*" -and $_.FullName -notlike "*__tests__*" } | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\client\src\components\", "").Replace("\", "/")
    scp $_.FullName "${server}:/root/mekness/client/src/components/$relPath"
}

Write-Host "Copy complete! Let me know when done." -ForegroundColor Green
```

## After Copying

Once you've run the commands above, let me know and I'll:
1. Verify what was copied
2. Rebuild the application
3. Restart the server

