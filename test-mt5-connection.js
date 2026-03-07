// Simple MT5 Connection Test
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔌 Testing MT5 Connection...\n');

// Get credentials from environment (PM2 should have loaded them)
const host = process.env.MT5_SERVER_IP || process.env.MT5_HOST || '192.109.17.202';
const port = process.env.MT5_SERVER_PORT || process.env.MT5_PORT || '443';
const login = process.env.MT5_SERVER_WEB_LOGIN || process.env.MT5_MANAGER_LOGIN || '10010';
const password = process.env.MT5_SERVER_WEB_PASSWORD || process.env.MT5_MANAGER_PASSWORD || '';

console.log('📋 Configuration:');
console.log('  Host:', host);
console.log('  Port:', port);
console.log('  Login:', login);
console.log('  Password:', password ? '***SET***' : 'NOT SET');
console.log('');

// Create PHP test script
const apiPath = path.join(__dirname, 'mt5_api', 'mt5_api.php');
const escapePhpString = (str) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escapedHost = escapePhpString(host);
const escapedLogin = escapePhpString(login);
const escapedPassword = escapePhpString(password);
const escapedApiPath = apiPath.replace(/\\/g, '/').replace(/'/g, "\\'");

const phpCode = `<?php
$apiPath = '${escapedApiPath}';
if (!file_exists($apiPath)) {
    echo json_encode(array('success' => false, 'error' => 'MT5 API file not found: ' . $apiPath));
    exit;
}
require_once($apiPath);

// Initialize MT5 API
$api = new MTWebAPI('WebAPI', '/tmp/', true);

try {
    // Connect and authorize to MT5 server
    echo "Connecting to MT5 server...\n";
    $connectResult = $api->Connect('${escapedHost}', ${port}, 30000, '${escapedLogin}', '${escapedPassword}');
    
    if ($connectResult != 0) {
        throw new Exception('Failed to connect/authorize to MT5 server. Error code: ' . $connectResult);
    }
    
    echo "✅ Connection successful!\n";
    echo "✅ Authentication successful!\n";
    
    // Test getting server time
    $time = new MTConTime();
    $timeResult = $api->TimeGet($time);
    if ($timeResult == 0) {
        echo "✅ Server time retrieved: " . date('Y-m-d H:i:s', $time->Time) . "\n";
    }
    
    echo json_encode(array('success' => true, 'message' => 'MT5 connection test successful'));
} catch (Exception $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
} finally {
    $api->Disconnect();
}
?>`;

// Execute PHP script
const php = spawn('php', ['-r', phpCode]);
let output = '';
let errorOutput = '';

php.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text); // Show real-time output
});

php.stderr.on('data', (data) => {
  errorOutput += data.toString();
  process.stderr.write(data.toString());
});

php.on('close', (code) => {
  console.log('\n' + '='.repeat(50));
  
  if (code !== 0) {
    console.error('❌ PHP process exited with code:', code);
    console.error('Error output:', errorOutput);
    process.exit(1);
  }
  
  try {
    // Try to parse JSON from output
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      if (result.success) {
        console.log('✅ MT5 Connection Test: SUCCESS');
        console.log('✅ Ready to create accounts!');
        process.exit(0);
      } else {
        console.error('❌ MT5 Connection Test: FAILED');
        console.error('Error:', result.error);
        process.exit(1);
      }
    } else {
      // If no JSON, check if we see success messages
      if (output.includes('Connection successful') || output.includes('Authentication successful')) {
        console.log('✅ MT5 Connection Test: SUCCESS');
        process.exit(0);
      } else {
        console.error('❌ Could not parse output');
        console.error('Output:', output);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Failed to parse output:', error.message);
    console.error('Output:', output);
    process.exit(1);
  }
});


