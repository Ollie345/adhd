# ADHD Assessment App - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (accessible remotely or locally)

## Setup Steps

### 1. Clone/Transfer Project
```bash
# Copy the entire project folder to your new laptop
```

### 2. Install Dependencies
```bash
npm install
```
This installs Prisma CLI and Prisma Client automatically.

### 3. Set Up Environment Variables
Update the `.env` file with your actual database connection:
```bash
DATABASE_URL="postgresql://your_username:your_password@your_host:your_port/your_database?schema=public"
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```
This creates the TypeScript types and database client.

### 5. Verify Database Connection
```bash
npx prisma db pull  # Test connection and introspect schema
```

### 6. Start Development Server
```bash
npm run dev
```

## What Gets Transferred Automatically

✅ **Prisma Schema** (`prisma/schema.prisma`) - Already defined with ADHDAssessment model
✅ **Database Models** - ADHDAssessment model configured for developmental screening
✅ **API Routes** - Assessment submission with database saving
✅ **UI Components** - Complete assessment flow for ADHD screening
✅ **Dependencies** - Listed in package.json (including Prisma)

## What You Need to Configure

🔧 **Environment Variables** - DATABASE_URL in .env with your actual database credentials
🔧 **Database Access** - Ensure PostgreSQL server is running and accessible
🔧 **Network/Firewall** - If using remote database, ensure port 5432 is open

## Testing Setup

After setup, test with:
```bash
# Visit http://localhost:3000
# Complete an assessment
# Check database for new records in adhd_assessment table
```

## Database Schema

The ADHD assessment stores:
- Personal information (name, email, age, marital status)
- Assessment responses (all 24 developmental screening questions)
- Domain scores (Behavioral, Cognitive/Attention, Motor Skills, Language/Academic)
- Risk assessment results (Low/Moderate/High risk levels)
- Flagged domains requiring attention

## Troubleshooting

**If "Can't reach database server":**
- Check DATABASE_URL in .env matches your actual database
- Verify PostgreSQL is running
- Test connection: `psql "your-connection-string"`

**If Prisma commands fail:**
- Run `npm install` again
- Check Node.js version: `node --version`

**If assessment submissions don't save:**
- Check database connection in application logs
- Verify the adhd_assessment table exists in your database
- Ensure DATABASE_URL is correctly configured
