<?php
require_once('mt5_api/mt5_api.php');

$host = '192.109.17.202';
$port = 443;
$login = '10010';
$password = '*l5dMzXz';

$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    $connectResult = $api->Connect($host, $port, 30030, $login, $password);
    if ($connectResult != 0) {
        echo "Connection failed: " . MTRetCode::GetError($connectResult) . "\n";
        exit(1);
    }
    
    echo "✅ Connected!\n\n";
    
    // Try to get a specific group
    $testGroups = ['Mekness-Standard', 'Standard', 'demo', 'Demo', 'real', 'Real', 'default', 'Default'];
    
    foreach ($testGroups as $groupName) {
        $group = null;
        $result = $api->GroupGet($groupName, $group);
        if ($result == 0 && $group) {
            echo "✅ Found group: $groupName\n";
            echo "   Currency: " . ($group->Currency ?? 'N/A') . "\n";
            echo "   Leverage: " . ($group->Leverage ?? 'N/A') . "\n";
            echo "\n";
        } else {
            echo "❌ Group '$groupName' not found (Error: " . MTRetCode::GetError($result) . ")\n";
        }
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
} finally {
    $api->Disconnect();
}

