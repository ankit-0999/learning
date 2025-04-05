# E-Learning Platform RESTful API

A role-based backend system for a college e-learning platform with authentication, role authorization, CRUD operations, and data validation.

## Features

- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based access (Admin, Faculty, Student)
- **File Upload**: PDF and video uploads using Multer
- **Data Validation**: Input validation with express-validator
- **CRUD Operations**: For courses, assignments, quizzes, users, etc.

## Tech Stack

- **Framework**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Validation**: express-validator

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/elearning
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
   JWT_EXPIRE=1d
   JWT_REFRESH_EXPIRE=7d
   NODE_ENV=development
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## API Routes

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Admin Routes

- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create a user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/courses` - Get all courses
- `POST /api/admin/announcements` - Create an announcement
- `GET /api/admin/reports` - Generate reports

### Faculty Routes

- `GET /api/faculty/courses` - Get faculty courses
- `POST /api/faculty/courses` - Create a course
- `PUT /api/faculty/courses/:id` - Update a course
- `POST /api/faculty/courses/:id/lectures` - Add lecture to course
- `POST /api/faculty/assignments` - Create an assignment
- `GET /api/faculty/assignments/:id/submissions` - Get assignment submissions
- `POST /api/faculty/grade-assignment` - Grade assignment (provide assignmentId and submissionId in request body)
- `POST /api/faculty/quizzes` - Create a quiz
- `GET /api/faculty/quizzes/:id/submissions` - Get quiz submissions
- `POST /api/faculty/notifications` - Send notification to students

### Student Routes

- `GET /api/student/courses` - Get all courses
- `GET /api/student/courses/:id` - Get course details
- `POST /api/student/courses/:id/enroll` - Enroll in a course
- `GET /api/student/courses/:id/lectures` - Get course lectures
- `GET /api/student/assignments` - Get assignments
- `POST /api/student/assignments/:id/submit` - Submit assignment
- `GET /api/student/quizzes` - Get quizzes
- `POST /api/student/quizzes/:id/submit` - Submit quiz
- `GET /api/student/performance` - Get performance data

## Error Handling

The API uses a centralized error handling mechanism with appropriate HTTP status codes and error messages.

## Performance Optimizations

- Database indexes for frequently queried fields
- Response caching capabilities
- Pagination for list endpoints
- Structured error handling
- Detailed request logging 