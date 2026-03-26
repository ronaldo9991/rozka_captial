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
        echo "Connection failed: " . MTRetCode::GetError($connectResult) . "\n";
        exit(1);
    }
    
    echo "✅ Connected successfully!\n\n";
    
    // Get all groups
    echo "Fetching available groups...\n";
    $total = 0;
    $groupTotalResult = $api->GroupTotal($total);
    
    if ($groupTotalResult != 0) {
        echo "Failed to get group total: " . MTRetCode::GetError($groupTotalResult) . "\n";
        exit(1);
    }
    
    echo "Total groups: $total\n\n";
    
    if ($total > 0) {
        echo "Available groups:\n";
        echo str_repeat("-", 50) . "\n";
        $pos = 0;
        while ($pos < $total) {
            $group = null;
            $result = $api->GroupNext($pos, $group);
            if ($result == 0 && $group) {
                echo sprintf("%-30s | Currency: %s | Leverage: %d\n", 
                    $group->Name, 
                    $group->Currency ?? 'N/A',
                    $group->Leverage ?? 0
                );
                $pos++;
            } else {
                break;
            }
        }
    } else {
        echo "No groups found. You may need to create a group first.\n";
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
} finally {
    $api->Disconnect();
}

