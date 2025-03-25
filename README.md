# Income and Expense Management System

A full-stack Next.js application for tracking and managing financial transactions with role-based access control.

## Features

- **Authentication** via Auth0
- **Role-based access** with Admin and User roles
- **Transaction management** for income and expenses
- **Financial dashboard** with summary statistics and charts
- **User management** for administrators
- **Reporting functionality** with CSV export

## Tech Stack

- **Frontend**: Next.js 14 with App Router, React, Tailwind CSS
- **API**: GraphQL with Apollo Server & Client
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth) with Auth0 provider

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Auth0 account

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/income-expense-management.git
cd income-expense-management
```

### 2. Install dependencies and set up the project

```bash
# Install all dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data (optional)
npx prisma db seed
```

The project requires the following prerequisites:

1. **Node.js and npm**
   - Install Node.js version 18 or higher from [nodejs.org](https://nodejs.org/)
   - npm comes bundled with Node.js

2. **PostgreSQL Database**
   - Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Or use a free Supabase account at [supabase.com](https://supabase.com)

3. **Auth0 Account**
   - Create a free account at [auth0.com](https://auth0.com)

After installing the prerequisites and running the commands above, your project will be ready to run with:
```bash
npm run dev
```

### 3. Set up environment variables

Create a `.env` file in the project root with the following variables:

```
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:[PORT]/postgres"

# Auth0
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"
AUTH0_ISSUER="https://your-auth0-domain.auth0.com"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Configure Auth0

1. Create a new application in Auth0 dashboard
2. Configure the following URLs:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback/auth0`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
3. Copy your Auth0 credentials to the `.env` file

### 5. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 6. Start the development server

```bash
npm run dev
```

Your application should now be running at [http://localhost:3000](http://localhost:3000).

## Database Schema

The application uses the following core models:

- **User**: Stores user information and roles (USER, ADMIN)
- **Transaction**: Records income and expense entries with amount, concept, date, and type

## User Roles and Permissions

### Admin Users

- Can view all financial data and transactions
- Can create, edit, and delete transactions
- Can manage user roles
- Can access reporting features
- Can see financial summaries and charts

### Regular Users

- Can view all transactions (read-only)
- Can see financial summaries and charts
- Cannot modify any data

## Deployment to Vercel

### 1. Push your code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 2. Import your project in Vercel

1. Create an account on [Vercel](https://vercel.com) if you don't have one
2. Click "New Project" and import your GitHub repository
3. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: Leave default
   - Install Command: `npm install`

### 3. Configure environment variables

Add the same environment variables from your local `.env` file to Vercel's environment variables section, with these adjustments:

- Update `NEXTAUTH_URL` to your Vercel deployment URL
- Update Auth0 callback URLs in your Auth0 dashboard to include your Vercel deployment URL

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Update Auth0 Configuration

After deployment, go back to your Auth0 Dashboard and add your Vercel deployment URLs:
- **Allowed Callback URLs**: `https://your-vercel-app.vercel.app/api/auth/callback/auth0`
- **Allowed Logout URLs**: `https://your-vercel-app.vercel.app`
- **Allowed Web Origins**: `https://your-vercel-app.vercel.app`

## Troubleshooting

### Database connection issues

If you encounter database connection errors, check:
- Your database credentials in the `.env` file
- Network access to your database (including firewall settings)
- Proper formatting of the DATABASE_URL

### Authentication issues

If authentication isn't working:
- Verify your Auth0 credentials
- Check the callback URLs in your Auth0 dashboard
- Ensure NEXTAUTH_URL is set correctly

## License

This project is licensed under the MIT License - see the LICENSE file for details.