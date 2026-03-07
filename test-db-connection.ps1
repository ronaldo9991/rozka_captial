# Test PostgreSQL Database Connection
# This script tests if your database connection is working

param(
    [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
    if (Test-Path ".env") {
        Write-Host "Reading DATABASE_URL from .env file..." -ForegroundColor Cyan
        $envContent = Get-Content ".env" -Raw
        if ($envContent -match "DATABASE_URL=(.+)") {
            $DatabaseUrl = $matches[1].Trim()
        }
    }
    
    if (-not $DatabaseUrl) {
        Write-Host "Error: DATABASE_URL not found. Please set it in .env file or pass as parameter." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Testing database connection..." -ForegroundColor Cyan
Write-Host "Connection string: $($DatabaseUrl -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray
Write-Host ""

# Try to connect using Node.js (since we have it installed)
$testScript = @"
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || '$DatabaseUrl' });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('Connection successful!');
    console.log('Server time:', res.rows[0].now);
    pool.end();
    process.exit(0);
  }
});
"@

$testScript | Out-File -FilePath "test-connection.js" -Encoding utf8

try {
    node test-connection.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Database connection successful!" -ForegroundColor Green
        Remove-Item "test-connection.js" -ErrorAction SilentlyContinue
    } else {
        Write-Host "`n✗ Database connection failed!" -ForegroundColor Red
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  - PostgreSQL is running"
        Write-Host "  - Database exists"
        Write-Host "  - Username and password are correct"
        Write-Host "  - Connection string in .env is correct"
    }
} catch {
    Write-Host "Error running test: $_" -ForegroundColor Red
} finally {
    Remove-Item "test-connection.js" -ErrorAction SilentlyContinue
}

