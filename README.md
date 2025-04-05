# E-Learning Platform

A comprehensive platform for online education with features for students, faculty, and administrators.

## Project Overview

This project is a full-stack e-learning platform built with:
- **Frontend**: Next.js 14 with App Router
- **Backend**: Express.js RESTful API
- **Database**: MongoDB
- **Authentication**: JWT with refresh tokens

### Key Features
- Role-based access (Admin, Faculty, Student)
- Course management and enrollment
- Assignment submission and grading
- Quiz creation and assessment
- File uploads (PDF, video)
- User management
- Performance tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher)

## Quick Start

Use the provided PowerShell scripts to start the application:

```powershell
# Start the server
.\start-server.ps1

# Start the client (in a new terminal)
.\start-client.ps1

# To stop the server
.\kill-server.ps1
```

## Default User Accounts

The system comes with pre-configured user accounts for testing:

### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: Full administrative access to all platform features

### Faculty User
- **Email**: ankit@example.com
- **Password**: ankit123 (or password123 depending on which seed script runs)
- **Access**: Course creation, assignment management, grading

### Student User
- **Email**: ravi@gmail.com
- **Password**: ravi123
- **Access**: Course enrollment, assignment submission, quiz taking

## Accessing the Admin Dashboard

1. Start both the server and client applications
2. Navigate to http://localhost:3000/admin in your browser
3. Log in with the admin credentials listed above
4. The admin dashboard provides access to:
   - User management
   - Course oversight
   - System reports
   - Platform settings

## Running Seed Scripts

To populate your database with sample users and courses:

```bash
# Seed admin user
cd server
node scripts/seed-admin.js

# Seed student user
node scripts/seed-student.js

# Seed courses and faculty user
node scripts/seed-courses.js

# Or use the root script to run all seed operations
cd ..
npm run seed
```

## Manual Setup Instructions

### 1. MongoDB Setup

Make sure MongoDB is installed and running:

```bash
# Create data directory if it doesn't exist
mkdir -p C:\data\db

# Start MongoDB server
mongod --dbpath C:\data\db
```

### 2. Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with the following content:
# PORT=5000
# pls connect your own mongoDb sever
# MONGO_URI=mongodb://127.0.0.1:27017/elearning
# JWT_SECRET=elearningplatformsecretkey2023
# JWT_REFRESH_SECRET=elearning_refresh_secret_key_2023
# JWT_EXPIRE=30d
# JWT_REFRESH_EXPIRE=7d
# JWT_COOKIE_EXPIRE=30
# NODE_ENV=development

# Start server
npm run dev
```

### 3. Client Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env.local file with the following content:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=123456789

# Start client
npm run dev
```

### 4. Seed Data (Optional)

To populate the database with sample courses:

```bash
# Using the project root script
npm run seed

# Or from the server directory
cd server
node scripts/seed-courses.js
```

## Project Structure

```
/
├── client/                  # Next.js frontend
│   ├── app/                 # Next.js App Router
│   ├── lib/                 # Utility functions
│   ├── public/              # Static assets
│   └── ...
├── server/                  # Express.js backend
│   ├── controllers/         # Request handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── uploads/             # Uploaded files
│   └── scripts/             # Database scripts
├── start-server.ps1         # Server startup script
├── start-client.ps1         # Client startup script
└── kill-server.ps1          # Server termination script
```

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. Ensure MongoDB service is running
2. Check that the connection string in `.env` is correct (use `127.0.0.1` instead of `localhost`)
3. Make sure the data directory exists and is accessible

### Port Already in Use (EADDRINUSE)

The application has multiple strategies to handle port conflicts:

1. **Automatic port switching**: If port 5000 is busy, the server will automatically try ports 5001, 5002, and 5003.

2. **Automatic process termination**: The `npm run dev` command now automatically kills processes using these ports before starting.

3. **Manual process termination**: You can manually kill processes using:
   ```bash
   # Using the root script
   .\kill-server.ps1
   
   # Or from the server directory
   npm run kill-server
   ```

4. **Alternative ports**: You can manually specify a different port:
   ```bash
   # Set a custom port in .env
   PORT=5005
   
   # Or use an environment variable when starting
   PORT=5005 npm run dev
   ```

### Courses Not Displaying

If courses are not displaying:

1. Check browser console for errors
2. Verify that the server is running and connected to MongoDB
3. Ensure the seed script has been run to create sample courses: `npm run seed`
4. Confirm authentication is working correctly
5. Try using the public course endpoints which don't require authentication 
