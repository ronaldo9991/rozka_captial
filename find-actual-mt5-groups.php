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
    
    echo "✅ Connected to MT5 server!\n\n";
    
    // Get total number of groups
    $total = 0;
    $groupTotalResult = $api->GroupTotal($total);
    
    if ($groupTotalResult != 0) {
        echo "Failed to get group total: " . MTRetCode::GetError($groupTotalResult) . "\n";
        exit(1);
    }
    
    echo "Total groups available: $total\n\n";
    
    if ($total > 0) {
        echo "Fetching group names (this may take a moment)...\n";
        echo str_repeat("=", 60) . "\n";
        
        $foundGroups = [];
        $pos = 0;
        $maxAttempts = min($total, 200); // Limit to prevent infinite loop
        
        while ($pos < $maxAttempts) {
            $group = null;
            $result = $api->GroupNext($pos, $group);
            
            if ($result == 0 && $group && isset($group->Name)) {
                $groupName = $group->Name;
                if (!in_array($groupName, $foundGroups)) {
                    $foundGroups[] = $groupName;
                    echo sprintf("%-40s | Currency: %-5s | Leverage: %s\n", 
                        $groupName, 
                        $group->Currency ?? 'N/A',
                        $group->Leverage ?? 'N/A'
                    );
                }
                $pos++;
            } else {
                // Try to continue or break
                if ($result != 0) {
                    echo "Error at position $pos: " . MTRetCode::GetError($result) . "\n";
                }
                $pos++;
                if ($pos > $maxAttempts) break;
            }
            
            // Safety break
            if (count($foundGroups) >= 50) {
                echo "\n(Stopped after 50 groups to prevent timeout)\n";
                break;
            }
        }
        
        echo str_repeat("=", 60) . "\n";
        echo "\n✅ Found " . count($foundGroups) . " unique groups:\n";
        echo implode(", ", $foundGroups) . "\n";
        
        // Suggest groups for live and demo
        echo "\n💡 Suggested configuration:\n";
        $liveCandidates = array_filter($foundGroups, function($g) {
            $g = strtolower($g);
            return strpos($g, 'live') !== false || 
                   strpos($g, 'real') !== false || 
                   strpos($g, 'standard') !== false ||
                   strpos($g, 'cent') !== false;
        });
        $demoCandidates = array_filter($foundGroups, function($g) {
            $g = strtolower($g);
            return strpos($g, 'demo') !== false || 
                   strpos($g, 'test') !== false;
        });
        
        if (!empty($liveCandidates)) {
            echo "  MT5_GROUP_LIVE: '" . array_values($liveCandidates)[0] . "'\n";
        } else {
            echo "  MT5_GROUP_LIVE: '" . $foundGroups[0] . "' (first available)\n";
        }
        
        if (!empty($demoCandidates)) {
            echo "  MT5_GROUP_DEMO: '" . array_values($demoCandidates)[0] . "'\n";
        } else {
            echo "  MT5_GROUP_DEMO: '" . ($foundGroups[1] ?? $foundGroups[0]) . "' (second or first available)\n";
        }
        
    } else {
        echo "❌ No groups found on MT5 server!\n";
        echo "You need to create at least one group in MT5 Server Manager.\n";
    }
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} finally {
    $api->Disconnect();
}

