<?php
require_once('mt5_api/mt5_api.php');

$host = '192.109.17.202';
$port = 443;
$login = '10010';
$password = '*l5dMzXz';

$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    $connectResult = $api->Connect($host, $port, 30000, $login, $password);
    if ($connectResult != 0) {
        echo "Connection failed\n";
        exit(1);
    }
    
    // Try common group names
    $testGroups = [
        'real', 'Real', 'REAL',
        'demo', 'Demo', 'DEMO', 
        'standard', 'Standard', 'STANDARD',
        'default', 'Default', 'DEFAULT',
        'live', 'Live', 'LIVE',
        'test', 'Test', 'TEST',
        'trading', 'Trading', 'TRADING'
    ];
    
    echo "Testing group names...\n\n";
    $foundGroups = [];
    
    foreach ($testGroups as $groupName) {
        $group = null;
        $result = $api->GroupGet($groupName, $group);
        if ($result == 0 && $group) {
            $foundGroups[] = $groupName;
            echo "✅ FOUND: $groupName\n";
            echo "   Currency: " . ($group->Currency ?? 'N/A') . "\n";
            echo "   Leverage: " . ($group->Leverage ?? 'N/A') . "\n\n";
        }
    }
    
    if (empty($foundGroups)) {
        echo "❌ No common groups found. You need to check your MT5 server configuration.\n";
        echo "Please contact your MT5 server administrator to find the correct group name.\n";
    } else {
        echo "\n✅ Available groups: " . implode(', ', $foundGroups) . "\n";
        echo "\nUpdate your ecosystem.config.cjs with:\n";
        echo "  MT5_GROUP_LIVE: '" . $foundGroups[0] . "'\n";
        if (count($foundGroups) > 1) {
            echo "  MT5_GROUP_DEMO: '" . $foundGroups[1] . "'\n";
        }
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
} finally {
    $api->Disconnect();
}

