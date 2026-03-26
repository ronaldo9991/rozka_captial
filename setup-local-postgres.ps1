# Local PostgreSQL Setup Helper
# Run this after you have PostgreSQL installed and the database created

Write-Host "=== Local PostgreSQL Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    $overwrite = Read-Host ".env file already exists. Overwrite? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host "Please provide your PostgreSQL connection details:" -ForegroundColor Yellow
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

# Generate session secret
$sessionSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

# Create connection string
$databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}"

# Create .env file
$envContent = "DATABASE_URL=$databaseUrl`nSESSION_SECRET=$sessionSecret`nPORT=5000`nNODE_ENV=development"

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline

Write-Host ""
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure PostgreSQL is running"
Write-Host "2. Make sure the database '$dbName' exists"
Write-Host "3. Run: npm run db:push    (to create database tables)"
Write-Host "4. Run: npm run dev         (to start the server)"
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green

