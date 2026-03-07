# Backend Setup Script for Windows PowerShell
# This script helps you set up the .env file for the backend

Write-Host "=== Mekness Backend Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    $overwrite = Read-Host ".env file already exists. Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Choose your database option:" -ForegroundColor Yellow
Write-Host "1. Neon (Recommended - Free cloud PostgreSQL)"
Write-Host "2. Local PostgreSQL"
Write-Host "3. Skip database setup for now (use in-memory storage)"
Write-Host ""
$choice = Read-Host "Enter choice (1-3)"

$databaseUrl = ""
$sessionSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "To get a Neon database:" -ForegroundColor Cyan
        Write-Host "1. Go to https://neon.tech"
        Write-Host "2. Sign up (free tier available)"
        Write-Host "3. Create a new project"
        Write-Host "4. Copy the connection string"
        Write-Host ""
        $databaseUrl = Read-Host "Paste your Neon connection string here"
        
        if ($databaseUrl -notmatch "postgresql://") {
            Write-Host "Warning: Connection string does not look valid. Continuing anyway..." -ForegroundColor Yellow
        }
    }
    "2" {
        Write-Host ""
        $dbUser = Read-Host "PostgreSQL username (default: postgres)"
        if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "postgres" }
        
        $dbPassword = Read-Host "PostgreSQL password" -AsSecureString
        $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
        )
        
        $dbName = Read-Host "Database name (default: mekness_db)"
        if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "mekness_db" }
        
        $dbHost = Read-Host "Database host (default: localhost)"
        if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
        
        $dbPort = Read-Host "Database port (default: 5432)"
        if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
        
        $databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}"
    }
    "3" {
        Write-Host ""
        Write-Host "Using in-memory storage. Database features will be limited." -ForegroundColor Yellow
        $databaseUrl = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit
    }
}

# Create .env file
$envContent = "DATABASE_URL=$databaseUrl`nSESSION_SECRET=$sessionSecret`nPORT=5000`nNODE_ENV=development"

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""

if ($choice -ne "3") {
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run db:push    (to create database tables)"
    Write-Host "2. Run: npm run dev         (to start the server)"
} else {
    Write-Host "Note: You are using in-memory storage. Data will be lost on server restart." -ForegroundColor Yellow
    Write-Host "To use a real database later, update the DATABASE_URL in .env and run: npm run db:push" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
