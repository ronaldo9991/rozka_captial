<?php
/**
 * MT5 Connection & Groups Diagnostic Script
 * Run this to test connection and list available groups
 */

// Include the MT5 API
require_once(__DIR__ . '/mt5_api.php');

echo "=== MT5 Connection Diagnostic ===\n\n";

// Configuration
$host = '192.109.17.202';
$port = 443;
$timeout = 30000;
$login = '10010';
$password = '*l5dMzXz';

echo "Server: $host:$port\n";
echo "Manager Login: $login\n";
echo "Password: " . str_repeat('*', strlen($password)) . "\n\n";

// Initialize API
$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    echo "1. Testing connection...\n";
    $connectResult = $api->Connect($host, $port, $timeout, $login, $password);
    
    if ($connectResult != MTRetCode::MT_RET_OK) {
        $errorName = MTRetCode::GetError($connectResult);
        echo "   ❌ Connection FAILED!\n";
        echo "   Error Code: $connectResult\n";
        echo "   Error Name: $errorName\n";
        
        // Provide specific error guidance
        switch ($connectResult) {
            case 7: // Network error
                echo "   Cause: Network connectivity issue - cannot reach MT5 server\n";
                break;
            case 10: // No connection
                echo "   Cause: Server not responding or port blocked\n";
                break;
            case 1001: // Invalid account
                echo "   Cause: Manager login (10010) does not exist on MT5 server\n";
                break;
            case 1002: // Account disabled
                echo "   Cause: Manager account is disabled\n";
                break;
            case 1006: // Invalid password
                echo "   Cause: Wrong password for manager account\n";
                break;
            default:
                echo "   Cause: Unknown error - check MT5 server logs\n";
        }
        exit(1);
    }
    
    echo "   ✅ Connection SUCCESSFUL!\n\n";
    
    // Get server time to verify connection is active
    echo "2. Testing API functionality...\n";
    $server_time = null;
    $timeResult = $api->TimeServer($server_time);
    if ($timeResult == MTRetCode::MT_RET_OK) {
        echo "   ✅ Server time: " . date('Y-m-d H:i:s', $server_time) . "\n\n";
    } else {
        echo "   ⚠️ Could not get server time (Error: $timeResult)\n\n";
    }
    
    // Try to list groups
    echo "3. Listing available groups...\n";
    $total = 0;
    $groupResult = $api->GroupTotal($total);
    
    if ($groupResult == MTRetCode::MT_RET_OK) {
        echo "   Total groups found: $total\n\n";
        
        $liveGroups = [];
        $demoGroups = [];
        $allGroups = [];
        
        for ($i = 0; $i < $total; $i++) {
            $group = new MTConGroup();
            $result = $api->GroupNext($i, $group);
            if ($result == MTRetCode::MT_RET_OK) {
                $groupName = $group->Group;
                $allGroups[] = $groupName;
                
                // Categorize groups
                $lowerName = strtolower($groupName);
                if (strpos($lowerName, 'demo') !== false) {
                    $demoGroups[] = $groupName;
                } else if (strpos($lowerName, 'real') !== false || 
                           strpos($lowerName, 'live') !== false || 
                           strpos($lowerName, 'standard') !== false ||
                           strpos($lowerName, 'cent') !== false ||
                           strpos($lowerName, 'micro') !== false) {
                    $liveGroups[] = $groupName;
                }
                
                echo "   - $groupName\n";
            }
        }
        
        echo "\n=== RECOMMENDED CONFIGURATION ===\n\n";
        
        if (!empty($demoGroups)) {
            echo "Demo Group (MT5_GROUP_DEMO): " . $demoGroups[0] . "\n";
        } else {
            echo "Demo Group: No obvious demo group found. Try one of: " . implode(', ', array_slice($allGroups, 0, 3)) . "\n";
        }
        
        if (!empty($liveGroups)) {
            echo "Live Group (MT5_GROUP_LIVE): " . $liveGroups[0] . "\n";
        } else if (!empty($allGroups)) {
            echo "Live Group: No obvious live group found. Try: " . $allGroups[0] . "\n";
        }
        
        echo "\nAll available groups:\n";
        foreach ($allGroups as $g) {
            echo "  '$g'\n";
        }
        
    } else {
        echo "   ⚠️ Could not list groups (Error: $groupResult - " . MTRetCode::GetError($groupResult) . ")\n";
        echo "   This might be a permissions issue - manager may not have GroupGet permission.\n\n";
        
        // Try common group names
        echo "4. Testing common group names...\n";
        $commonGroups = [
            'real', 'demo', 'default', 'Default', 'Standard', 'standard',
            'Rozka-Standard', 'live', 'Live', 'Demo', 'retail', 'Retail',
            'real\\USD', 'demo\\USD', 'live\\USD', 'clients', 'users'
        ];
        
        $workingGroups = [];
        
        foreach ($commonGroups as $groupName) {
            $group = new MTConGroup();
            $result = $api->GroupGet($groupName, $group);
            if ($result == MTRetCode::MT_RET_OK) {
                echo "   ✅ Group '$groupName' EXISTS\n";
                $workingGroups[] = $groupName;
            }
        }
        
        if (empty($workingGroups)) {
            echo "   ❌ None of the common group names work.\n";
            echo "   Please contact your MT5 administrator for the correct group names.\n";
        } else {
            echo "\n=== RECOMMENDED CONFIGURATION ===\n";
            $demoFound = false;
            $liveFound = false;
            foreach ($workingGroups as $g) {
                if (!$demoFound && stripos($g, 'demo') !== false) {
                    echo "MT5_GROUP_DEMO: '$g'\n";
                    $demoFound = true;
                }
                if (!$liveFound && stripos($g, 'demo') === false) {
                    echo "MT5_GROUP_LIVE: '$g'\n";
                    $liveFound = true;
                }
            }
            if (!$demoFound && !empty($workingGroups)) {
                echo "MT5_GROUP_DEMO: '" . $workingGroups[0] . "' (using first available)\n";
            }
            if (!$liveFound && !empty($workingGroups)) {
                echo "MT5_GROUP_LIVE: '" . $workingGroups[0] . "' (using first available)\n";
            }
        }
    }
    
    // Test account creation capability
    echo "\n5. Testing account creation permission...\n";
    $testUser = new MTUser();
    $testUser->Login = 0; // MT5 assigns login
    $testUser->Group = !empty($workingGroups) ? $workingGroups[0] : (!empty($allGroups) ? $allGroups[0] : 'default');
    $testUser->Name = 'Test User';
    $testUser->Email = 'test@test.com';
    $testUser->Leverage = 100;
    $testUser->Country = 'US';
    $testUser->Currency = 'USD';
    
    // Note: We won't actually create the account, just check if we can
    // This is a read-only check of permissions
    echo "   Group to test: " . $testUser->Group . "\n";
    echo "   (Account creation will be tested when user creates account)\n";
    
    echo "\n=== DIAGNOSTIC COMPLETE ===\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
} finally {
    if ($api->IsConnected()) {
        $api->Disconnect();
        echo "\nDisconnected from MT5 server.\n";
    }
}
?>


