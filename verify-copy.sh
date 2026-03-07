#!/bin/bash
# Script to verify what files were copied and what's missing

echo "=========================================="
echo "Verifying Copied Files"
echo "=========================================="
echo ""

echo "Landing Pages Status:"
echo "-------------------"
for page in Home.tsx About.tsx Forex.tsx Contact.tsx Complaints.tsx IntroducingBroker.tsx DepositsWithdrawals.tsx TradingContest.tsx ButtonShowcase.tsx WhatIsForex.tsx ForexAdvantages.tsx ForexPedia.tsx DepositBonus.tsx NoDepositBonus.tsx not-found.tsx; do
    if [ -f "client/src/pages/$page" ]; then
        echo "  ✓ $page"
    else
        echo "  ✗ $page (MISSING)"
    fi
done

echo ""
echo "Protected Files (should NOT be overwritten):"
echo "--------------------------------------------"
for protected in SignIn.tsx SignUp.tsx; do
    if [ -f "client/src/pages/$protected" ]; then
        echo "  ✓ $protected (protected)"
    fi
done

if [ -d "client/src/pages/dashboard" ]; then
    echo "  ✓ dashboard/ folder (protected)"
fi

if [ -d "client/src/pages/admin" ]; then
    echo "  ✓ admin/ folder (protected)"
fi

if [ -f "client/src/components/AuthCard.tsx" ]; then
    echo "  ✓ AuthCard.tsx (protected)"
fi

echo ""
echo "Backend Protected Files:"
echo "----------------------"
for backend in server/routes.ts server/db-storage.ts server/storage.ts server/seed.ts; do
    if [ -f "$backend" ]; then
        echo "  ✓ $backend (protected)"
    fi
done

echo ""
echo "Public Assets:"
echo "-------------"
if [ -d "client/public" ]; then
    file_count=$(find client/public -type f | wc -l)
    echo "  ✓ Public folder exists ($file_count files)"
else
    echo "  ✗ Public folder missing"
fi

echo ""
echo "=========================================="

