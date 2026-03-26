<?php
require_once('mt5_api/mt5_api.php');

$host = '192.109.17.202';
$port = 443;
$login = '10010';
$password = '*l5dMzXz';

// Common group names to test
$testGroups = [
    'default', 'Default', 'DEFAULT',
    'standard', 'Standard', 'STANDARD',
    'cent', 'Cent', 'CENT',
    'micro', 'Micro', 'MICRO',
    'mini', 'Mini', 'MINI',
    'classic', 'Classic', 'CLASSIC',
    'pro', 'Pro', 'PRO',
    'vip', 'VIP', 'Vip',
    'demo\\demo', 'demo\\Demo', 'Demo\\Demo',
    'real\\real', 'real\\Real', 'Real\\Real',
    'default\\default', 'default\\Default',
];

$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    $connectResult = $api->Connect($host, $port, 30000, $login, $password);
    if ($connectResult != 0) {
        echo "Connection failed: " . MTRetCode::GetError($connectResult) . "\n";
        exit(1);
    }
    
    echo "✅ Connected!\n\n";
    echo "Testing group names...\n";
    echo str_repeat("=", 60) . "\n";
    
    $foundGroups = [];
    
    foreach ($testGroups as $groupName) {
        $group = null;
        $result = $api->GroupGet($groupName, $group);
        if ($result == 0 && $group && isset($group->Name)) {
            if (!in_array($group->Name, $foundGroups)) {
                $foundGroups[] = $group->Name;
                echo "✅ FOUND: {$group->Name}\n";
                echo "   Currency: " . ($group->Currency ?? 'N/A') . "\n";
                echo "   Leverage: " . ($group->Leverage ?? 'N/A') . "\n\n";
            }
        }
    }
    
    if (empty($foundGroups)) {
        echo "❌ None of the common group names were found.\n";
        echo "\nYou need to:\n";
        echo "1. Check your MT5 Server Manager for available group names\n";
        echo "2. Update ecosystem.config.cjs with the correct group names:\n";
        echo "   MT5_GROUP_LIVE: 'your-live-group-name'\n";
        echo "   MT5_GROUP_DEMO: 'your-demo-group-name'\n";
    } else {
        echo "\n✅ Found " . count($foundGroups) . " groups:\n";
        echo implode(", ", $foundGroups) . "\n";
        echo "\n💡 Update ecosystem.config.cjs:\n";
        echo "   MT5_GROUP_LIVE: '" . $foundGroups[0] . "'\n";
        if (count($foundGroups) > 1) {
            echo "   MT5_GROUP_DEMO: '" . $foundGroups[1] . "'\n";
        } else {
            echo "   MT5_GROUP_DEMO: '" . $foundGroups[0] . "'\n";
        }
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
} finally {
    $api->Disconnect();
}

