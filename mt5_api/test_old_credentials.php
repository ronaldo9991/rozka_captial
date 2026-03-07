<?php
require_once(__DIR__ . '/mt5_api.php');

echo "=== Testing Multiple MT5 Configurations ===\n\n";

$configs = [
    [
        'name' => 'Old Config (209.58.143.130:443, login 2000)',
        'host' => '209.58.143.130',
        'port' => 443,
        'login' => '2000',
        'password' => '*l5dMzXz'  // Try same password
    ],
    [
        'name' => 'Current Config (192.109.17.202:443, login 10010)',
        'host' => '192.109.17.202',
        'port' => 443,
        'login' => '10010',
        'password' => '*l5dMzXz'
    ],
    [
        'name' => 'Alt Config 1 (209.58.143.130:443, login 10010)',
        'host' => '209.58.143.130',
        'port' => 443,
        'login' => '10010',
        'password' => '*l5dMzXz'
    ]
];

foreach ($configs as $config) {
    echo "Testing: " . $config['name'] . "\n";
    
    $api = new MTWebAPI('WebAPI', '/tmp/', true);
    
    try {
        $connectResult = $api->Connect($config['host'], $config['port'], 30000, $config['login'], $config['password']);
        
        if ($connectResult == MTRetCode::MT_RET_OK) {
            echo "   ✅ CONNECTION SUCCESSFUL!\n";
            
            // Test getting groups
            $total = 0;
            if ($api->GroupTotal($total) == MTRetCode::MT_RET_OK) {
                echo "   Groups available: $total\n";
                
                // List first 10 groups
                for ($i = 0; $i < min($total, 15); $i++) {
                    $group = new MTConGroup();
                    if ($api->GroupNext($i, $group) == MTRetCode::MT_RET_OK) {
                        echo "     - " . $group->Group . "\n";
                    }
                }
            }
            
            echo "\n   === THIS CONFIG WORKS! ===\n";
            echo "   Use these environment variables:\n";
            echo "   MT5_SERVER_IP: '" . $config['host'] . "'\n";
            echo "   MT5_SERVER_PORT: '" . $config['port'] . "'\n";
            echo "   MT5_SERVER_WEB_LOGIN: '" . $config['login'] . "'\n";
            echo "   MT5_SERVER_WEB_PASSWORD: '" . $config['password'] . "'\n\n";
            
            $api->Disconnect();
            break;
        } else {
            echo "   ❌ Failed (Error: $connectResult - " . MTRetCode::GetError($connectResult) . ")\n\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Exception: " . $e->getMessage() . "\n\n";
    }
    
    if ($api->IsConnected()) {
        $api->Disconnect();
    }
}
?>
