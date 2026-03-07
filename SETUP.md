# Local Development Setup Guide

This guide will help you set up and run the Mekness Dashboard project locally on your machine.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL Database** - You can use:
  - [Neon](https://neon.tech) (Free tier available) - Recommended
  - Local PostgreSQL installation
  - Any PostgreSQL-compatible database

## Step 1: Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd MeknessDashboard
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the `MeknessDashboard` directory with the following variables:

```env
# Database Configuration
# Get your database URL from Neon (https://neon.tech) or your PostgreSQL provider
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Session Secret
# Generate a random string for session encryption
# On Windows PowerShell: -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
# On Linux/Mac: openssl rand -base64 32
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Server Configuration (optional)
PORT=5000
NODE_ENV=development
```

### Getting a Database URL

**Option 1: Using Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Paste it as your `DATABASE_URL`

**Option 2: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database: `createdb mekness_db`
3. Use: `DATABASE_URL=postgresql://localhost:5432/mekness_db`

## Step 3: Set Up the Database Schema

After setting up your database, push the schema to create all necessary tables:

```bash
npm run db:push
```

This will create all the required tables in your database using Drizzle ORM.

## Step 4: Run the Development Server

### On Windows (PowerShell/CMD):
```bash
npm run dev
```

### On Linux/Mac:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Step 5: Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:5000`
- **API**: API endpoints are available at `http://localhost:5000/api/*`

## Project Structure

```
MeknessDashboard/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/  # UI components
│       └── pages/      # Page components
├── server/          # Express backend
│   ├── index.ts     # Server entry point
│   ├── routes.ts    # API routes
│   └── db.ts        # Database connection
├── shared/          # Shared types and schemas
└── package.json     # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run check` - Type check TypeScript
- `npm run db:push` - Push database schema changes

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure your database is accessible (check firewall/network settings)
- For Neon, make sure SSL mode is enabled

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or stop the process using the port:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`
  - Linux/Mac: `lsof -ti:5000 | xargs kill`

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### TypeScript Errors
- Run `npm run check` to see detailed errors
- Ensure all dependencies are installed

## Next Steps

1. **Create an Admin Account**: You'll need to manually create an admin user in the database or through the API
2. **Test Authentication**: Try signing up and signing in
3. **Explore the Dashboard**: Once logged in, explore the trading dashboard features

## Need Help?

- Check the `README.md` for more information
- Review the code in `server/routes.ts` for API endpoints
- Check `shared/schema.ts` for database schema definitions


