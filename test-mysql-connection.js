#!/usr/bin/env node
/**
 * Test MySQL Connection
 * Tests connection to the MySQL database with provided credentials
 */

import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n');
  
  // Production connection details - use production IP
  const config = {
    host: '67.227.198.100', // Production IP - no localhost
    port: 3306,
    user: 'cabinet',
    password: '(9:!eg#-7Nd1',
    database: 'cabinet',
  };
  
  console.log('📊 Connection Details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}\n`);
  
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(config);
    console.log('✅ Connection established!\n');
    
    // Test query
    const [rows] = await connection.execute('SELECT NOW() as current_time, VERSION() as db_version, DATABASE() as db_name');
    const result = rows[0];
    
    console.log('📊 Database Information:');
    console.log(`   Server Time: ${result.current_time}`);
    console.log(`   MySQL Version: ${result.db_version}`);
    console.log(`   Database Name: ${result.db_name}\n`);
    
    // Check existing tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Existing Tables: ${tables.length}`);
    if (tables.length > 0) {
      const tableNames = tables.map(t => Object.values(t)[0]).join(', ');
      console.log(`   ${tableNames}\n`);
    } else {
      console.log('   No tables found (tables will be created automatically)\n');
    }
    
    // Connection string for DATABASE_URL
    const encodedPassword = encodeURIComponent(config.password);
    const connectionString = `mysql://${config.user}:${encodedPassword}@${config.host}:${config.port}/${config.database}`;
    
    console.log('✅ Connection String for DATABASE_URL:');
    console.log(`   ${connectionString}\n`);
    
    console.log('✅ MySQL connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Connection refused. Check if:');
      console.error('   - MySQL server is running');
      console.error('   - Host and port are correct');
      console.error('   - Firewall allows connections');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Access denied. Check if:');
      console.error('   - Username and password are correct');
      console.error('   - User has access to the database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database not found. Check if:');
      console.error('   - Database name is correct');
      console.error('   - Database exists');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection().catch(console.error);

