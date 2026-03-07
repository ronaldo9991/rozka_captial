<?php
/**
 * MT5 Connection Validator
 * Returns JSON with connection status and available groups
 */

require_once(__DIR__ . '/mt5_api.php');

header('Content-Type: application/json');

// Get credentials from command line args or environment
$host = isset($argv[1]) ? $argv[1] : getenv('MT5_SERVER_IP');
$port = isset($argv[2]) ? (int)$argv[2] : (int)getenv('MT5_SERVER_PORT');
$login = isset($argv[3]) ? $argv[3] : getenv('MT5_SERVER_WEB_LOGIN');
$password = isset($argv[4]) ? $argv[4] : getenv('MT5_SERVER_WEB_PASSWORD');
$timeout = 30000;

$result = [
    'success' => false,
    'connected' => false,
    'error' => null,
    'errorCode' => null,
    'errorDescription' => null,
    'serverTime' => null,
    'groups' => [],
    'suggestedGroups' => [
        'live' => null,
        'demo' => null
    ]
];

if (empty($host) || empty($login) || empty($password)) {
    $result['error'] = 'Missing MT5 credentials';
    $result['errorDescription'] = 'Host, login, or password not provided';
    echo json_encode($result);
    exit;
}

$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    $connectResult = $api->Connect($host, $port, $timeout, $login, $password);
    
    if ($connectResult != MTRetCode::MT_RET_OK) {
        $result['errorCode'] = $connectResult;
        $result['error'] = MTRetCode::GetError($connectResult);
        
        // Provide specific guidance based on error code
        switch ($connectResult) {
            case 7: // Network error
                $result['errorDescription'] = 'Network error - cannot establish connection to MT5 server. Check if the server IP and port are correct.';
                break;
            case 10: // No connection
                $result['errorDescription'] = 'No connection - MT5 server is not responding. The server may be offline or the port is blocked.';
                break;
            case 1001: // Invalid account
                $result['errorDescription'] = 'Invalid account - The manager login does not exist on the MT5 server. Please verify the manager account number with your MT5 provider.';
                break;
            case 1002: // Account disabled
                $result['errorDescription'] = 'Account disabled - The manager account has been disabled on the MT5 server.';
                break;
            case 1005: // Invalid certificate
                $result['errorDescription'] = 'Invalid certificate - Certificate authentication failed.';
                break;
            case 1006: // Invalid password
                $result['errorDescription'] = 'Invalid password - The password for the manager account is incorrect.';
                break;
            case 1011: // Manager no config
                $result['errorDescription'] = 'Manager account does not have manager configuration on MT5 server.';
                break;
            case 1012: // IP blocked
                $result['errorDescription'] = 'IP address blocked - Your server IP is not allowed to connect to this MT5 server.';
                break;
            default:
                $result['errorDescription'] = 'Connection failed with error code ' . $connectResult;
        }
        
        echo json_encode($result);
        exit;
    }
    
    $result['connected'] = true;
    $result['success'] = true;
    
    // Get server time
    $serverTime = null;
    if ($api->TimeServer($serverTime) == MTRetCode::MT_RET_OK) {
        $result['serverTime'] = date('Y-m-d H:i:s', $serverTime);
    }
    
    // Try to list groups
    $total = 0;
    $groupListResult = $api->GroupTotal($total);
    
    if ($groupListResult == MTRetCode::MT_RET_OK && $total > 0) {
        $demoGroups = [];
        $liveGroups = [];
        
        for ($i = 0; $i < $total; $i++) {
            $group = new MTConGroup();
            if ($api->GroupNext($i, $group) == MTRetCode::MT_RET_OK) {
                $groupName = $group->Group;
                $result['groups'][] = $groupName;
                
                $lowerName = strtolower($groupName);
                if (strpos($lowerName, 'demo') !== false) {
                    $demoGroups[] = $groupName;
                } else if (strpos($lowerName, 'real') !== false || 
                           strpos($lowerName, 'live') !== false ||
                           strpos($lowerName, 'standard') !== false ||
                           strpos($lowerName, 'default') !== false) {
                    $liveGroups[] = $groupName;
                }
            }
        }
        
        // Suggest best groups
        if (!empty($liveGroups)) {
            $result['suggestedGroups']['live'] = $liveGroups[0];
        } else if (!empty($result['groups'])) {
            $result['suggestedGroups']['live'] = $result['groups'][0];
        }
        
        if (!empty($demoGroups)) {
            $result['suggestedGroups']['demo'] = $demoGroups[0];
        } else if (!empty($result['groups'])) {
            $result['suggestedGroups']['demo'] = $result['groups'][0];
        }
    } else {
        // Manager doesn't have permission to list groups - try common names
        $commonGroups = ['real', 'demo', 'default', 'Default', 'Standard', 'standard', 'live', 'Live', 'Demo'];
        foreach ($commonGroups as $groupName) {
            $group = new MTConGroup();
            if ($api->GroupGet($groupName, $group) == MTRetCode::MT_RET_OK) {
                $result['groups'][] = $groupName;
                
                $lowerName = strtolower($groupName);
                if ($result['suggestedGroups']['demo'] === null && strpos($lowerName, 'demo') !== false) {
                    $result['suggestedGroups']['demo'] = $groupName;
                }
                if ($result['suggestedGroups']['live'] === null && strpos($lowerName, 'demo') === false) {
                    $result['suggestedGroups']['live'] = $groupName;
                }
            }
        }
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    $result['error'] = $e->getMessage();
    $result['errorDescription'] = 'Exception occurred: ' . $e->getMessage();
    echo json_encode($result);
} finally {
    if ($api->IsConnected()) {
        $api->Disconnect();
    }
}
?>


