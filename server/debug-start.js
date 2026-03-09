#!/usr/bin/env node

console.log('🔍 Debug App Runner Startup');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Working directory:', process.cwd());

// Try to load modules
try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
} catch (error) {
  console.log('❌ Express failed to load:', error.message);
}

// Create simple HTTP server
const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request:', req.method, req.url);
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  
  if (req.url === '/api/health') {
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: 'AWS App Runner',
      debug: {
        nodeVersion: process.version,
        port: process.env.PORT,
        workingDirectory: process.cwd()
      }
    }));
  } else {
    res.end(JSON.stringify({
      message: 'Binofox Debug Server',
      status: 'running',
      url: req.url
    }));
  }
});

const PORT = parseInt(process.env.PORT || '8080', 10);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Debug server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
