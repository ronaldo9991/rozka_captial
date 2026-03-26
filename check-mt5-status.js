// MT5 Integration Status Check
import { mt5Service } from './server/mt5-service.ts';

console.log('🔌 MT5 Integration Status Check\n');
console.log('='.repeat(50));

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('  MT5_ENABLED:', process.env.MT5_ENABLED || 'NOT SET (default: disabled)');
console.log('  MT5_HOST:', process.env.MT5_HOST || process.env.MT5_SERVER_IP || 'NOT SET (default: 192.109.17.202)');
console.log('  MT5_PORT:', process.env.MT5_PORT || process.env.MT5_SERVER_PORT || 'NOT SET (default: 443)');
console.log('  MT5_MANAGER_LOGIN:', process.env.MT5_MANAGER_LOGIN || process.env.MT5_SERVER_WEB_LOGIN || 'NOT SET (default: 10010)');
console.log('  MT5_MANAGER_PASSWORD:', (process.env.MT5_MANAGER_PASSWORD || process.env.MT5_SERVER_WEB_PASSWORD) ? '***SET***' : 'NOT SET');

// Check PHP
console.log('\n🐘 PHP Check:');
try {
  const { spawn } = await import('child_process');
  const php = spawn('php', ['--version']);
  let output = '';
  php.stdout.on('data', (data) => output += data.toString());
  await new Promise((resolve, reject) => {
    php.on('close', (code) => {
      if (code === 0) {
        const version = output.match(/PHP (\d+\.\d+)/)?.[1] || 'unknown';
        console.log('  ✅ PHP installed:', version);
        resolve();
      } else {
        console.log('  ❌ PHP not working');
        reject();
      }
    });
  });
} catch (error) {
  console.log('  ❌ PHP check failed:', error.message);
}

// Check MT5 API files
console.log('\n📁 MT5 API Files:');
try {
  const { existsSync } = await import('fs');
  const { join } = await import('path');
  const files = [
    'mt5_api.php',
    'mt5_user.php',
    'mt5_connect.php',
    'mt5_ping.php'
  ];
  let allExist = true;
  for (const file of files) {
    const exists = existsSync(join(process.cwd(), 'mt5_api', file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allExist = false;
  }
  if (allExist) {
    console.log('  ✅ All required MT5 API files present');
  }
} catch (error) {
  console.log('  ❌ Error checking files:', error.message);
}

// Test MT5 connection
console.log('\n🔗 MT5 Connection Test:');
if (process.env.MT5_ENABLED !== 'true') {
  console.log('  ⚠️  MT5 is DISABLED (set MT5_ENABLED=true to enable)');
  console.log('\n💡 To enable MT5, add to ecosystem.config.cjs:');
  console.log('     MT5_ENABLED: "true"');
  console.log('     MT5_HOST: "your-mt5-server.com"');
  console.log('     MT5_PORT: "443"');
  console.log('     MT5_MANAGER_LOGIN: "your_manager_login"');
  console.log('     MT5_MANAGER_PASSWORD: "your_manager_password"');
} else {
  try {
    console.log('  Testing connection...');
    const isConnected = await mt5Service.ping();
    if (isConnected) {
      console.log('  ✅ MT5 Connection: SUCCESS');
      console.log('  ✅ MT5 Integration is WORKING');
    } else {
      console.log('  ❌ MT5 Connection: FAILED');
      console.log('  ⚠️  Check your MT5 server credentials and network connectivity');
    }
  } catch (error) {
    console.log('  ❌ MT5 Connection: ERROR');
    console.log('  Error:', error.message);
    console.log('\n  Possible issues:');
    console.log('    - MT5 server is not accessible');
    console.log('    - Incorrect credentials');
    console.log('    - Network/firewall blocking connection');
    console.log('    - PHP MT5 API files missing or corrupted');
  }
}

console.log('\n' + '='.repeat(50));
console.log('✅ Status check complete\n');






