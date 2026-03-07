# PostgreSQL Local Setup Guide

## Step 1: Install PostgreSQL

### Windows Installation

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Or use the installer: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
   - Download PostgreSQL 15 or 16 (latest stable version)

2. **Run the Installer**:
   - Run the downloaded `.exe` file
   - **Important**: Remember the password you set for the `postgres` superuser account
   - Default port is `5432` (keep this unless you have a conflict)
   - Default installation location is usually `C:\Program Files\PostgreSQL\15` (or 16)

3. **Verify Installation**:
   - PostgreSQL should start automatically as a Windows service
   - You can verify in Services (services.msc) - look for "postgresql-x64-15" or similar

## Step 2: Add PostgreSQL to PATH (Optional but Recommended)

1. Find your PostgreSQL installation (usually `C:\Program Files\PostgreSQL\15\bin`)
2. Add it to your system PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - Under "System Variables", find "Path" → Edit
   - Add: `C:\Program Files\PostgreSQL\15\bin` (adjust version number)
   - Click OK on all dialogs

## Step 3: Create Database

After installation, open PowerShell and run:

```powershell
# Connect to PostgreSQL (you'll be prompted for the postgres user password)
psql -U postgres

# Once connected, create the database:
CREATE DATABASE mekness_db;

# Exit psql:
\q
```

**Alternative**: If `psql` is not in PATH, use pgAdmin (GUI tool that comes with PostgreSQL):
1. Open pgAdmin (should be in Start Menu)
2. Connect to your local server (password is what you set during installation)
3. Right-click "Databases" → Create → Database
4. Name it: `mekness_db`
5. Click Save

## Step 4: Configure .env File

Create a `.env` file in the `MeknessDashboard` directory:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/mekness_db
SESSION_SECRET=your-random-32-character-secret-key-here
PORT=5000
NODE_ENV=development
```

Replace:
- `YOUR_PASSWORD` with the password you set for the `postgres` user
- `your-random-32-character-secret-key-here` with a random string (you can generate one)

## Step 5: Run Database Migrations

```bash
npm run db:push
```

This will create all the necessary tables in your database.

## Step 6: Start the Server

```bash
npm run dev
```

## Troubleshooting

### Can't connect to database
- Make sure PostgreSQL service is running: `Get-Service postgresql*`
- Check if port 5432 is in use: `netstat -ano | findstr :5432`
- Verify your password is correct
- Try connecting with: `psql -U postgres -d mekness_db`

### psql command not found
- PostgreSQL bin directory is not in PATH
- Use full path: `"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres`
- Or use pgAdmin GUI instead

### Permission denied
- Make sure you're using the correct username (usually `postgres`)
- Verify the database exists: `psql -U postgres -l` (lists all databases)

