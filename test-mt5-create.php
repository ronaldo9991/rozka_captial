<?php
require_once('mt5_api/mt5_api.php');

$host = '192.109.17.202';
$port = 443;
$login = '10010';
$password = '*l5dMzXz';

echo "Testing MT5 Connection...\n";
echo "Host: $host\n";
echo "Port: $port\n";
echo "Login: $login\n";
echo "Password: " . str_repeat('*', strlen($password)) . "\n\n";

$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    echo "Connecting to MT5 server...\n";
    $connectResult = $api->Connect($host, $port, 30000, $login, $password);
    
    if ($connectResult != 0) {
        echo "❌ Connection failed with error code: $connectResult\n";
        echo "Error: " . MTRetCode::GetError($connectResult) . "\n";
        exit(1);
    }
    
    echo "✅ Connection successful!\n\n";
    
    // Test creating a user
    echo "Testing account creation...\n";
    $user = new MTUser();
    $user->Login = 0; // Auto-assign login
    $user->Rights = 0x1E3;
    $user->Group = 'Mekness-Standard';
    $user->Name = 'Test User';
    $user->Email = 'test@example.com';
    $user->Leverage = 100;
    $user->Balance = 0;
    $user->Credit = 0;
    $user->Company = 'Mekness';
    $user->Language = 1033;
    $user->Color = 0xFF000000;
    $user->Status = 'Enabled';
    $user->Comment = 'Test account';
    $user->Currency = 'USD';
    $user->Country = 'US';
    $user->City = '';
    $user->State = '';
    $user->ZipCode = '';
    $user->Address = '';
    $user->Phone = '';
    
    $new_user = new MTUser();
    echo "Calling UserAdd...\n";
    $result = $api->UserAdd($user, $new_user);
    
    if ($result != 0) {
        echo "❌ UserAdd failed with error code: $result\n";
        echo "Error: " . MTRetCode::GetError($result) . "\n";
        echo "User details:\n";
        echo "  Group: " . $user->Group . "\n";
        echo "  Country: " . $user->Country . "\n";
        echo "  Currency: " . $user->Currency . "\n";
        exit(1);
    }
    
    echo "✅ Account created successfully!\n";
    echo "Login: " . $new_user->Login . "\n";
    echo "Name: " . $new_user->Name . "\n";
    echo "Group: " . $new_user->Group . "\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    exit(1);
} finally {
    $api->Disconnect();
}

