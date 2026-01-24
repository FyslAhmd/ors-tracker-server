# ORS Tracker - Backend API

A robust RESTful API for the Operational Roadworthiness Score (ORS) Tracker system. Built with Node.js, Express, TypeScript, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [How It Works](#-how-it-works)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Test Credentials](#-test-credentials)
- [Environment Variables](#-environment-variables)

## ✨ Features

### Authentication & Authorization
- **JWT-based Authentication** - Secure token-based auth with 7-day expiry
- **Role-Based Access Control (RBAC)** - Three user roles: Admin, Inspector, Viewer
- **Password Hashing** - Bcrypt encryption for secure password storage
- **Protected Routes** - Middleware-based route protection

### User Management
- Create, read, update, and delete users (Admin only)
- Role assignment and modification
- User profile management
- Pagination and search functionality

### ORS Plan Management
- Complete CRUD operations for ORS inspection plans
- 10-component scoring system (Engine, Brakes, Tires, etc.)
- Automatic overall score calculation
- Status management (Draft, Active, Completed, Archived)
- Text documentation for each component
- Inspector assignment functionality

### Analytics & Statistics
- Total inspections count
- Average fleet score calculation
- Score distribution by level (Excellent, Good, Fair, Poor, Critical)
- Status distribution breakdown
- Recent inspections tracking

### Security Features
- Helmet.js for HTTP headers security
- CORS configuration for frontend integration
- Rate limiting for API protection
- Input validation with express-validator
- Error handling middleware

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web application framework |
| **TypeScript** | Type-safe JavaScript |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB object modeling |
| **JWT** | Authentication tokens |
| **Bcrypt.js** | Password hashing |
| **Express Validator** | Input validation |
| **Helmet** | Security headers |
| **Morgan** | HTTP request logging |

## 🔄 How It Works

### Authentication Flow
1. User sends credentials to `/api/auth/login`
2. Server validates credentials against MongoDB
3. On success, JWT token is generated and returned
4. Client stores token and sends it in `Authorization` header
5. Protected routes verify token via `auth` middleware

### Role-Based Permissions
| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| **Admin** | ✅ All | ✅ All | ✅ All | ✅ All |
| **Inspector** | ✅ All | ✅ ORS Plans | ✅ Own Plans | ❌ |
| **Viewer** | ✅ All | ❌ | ❌ | ❌ |

### ORS Score Calculation
The overall score is automatically calculated as the average of 10 component scores:
- Engine, Brakes, Tires, Transmission, Electrical
- Suspension, Steering, Body/Exterior, Interior, Safety Equipment

### Score Levels
| Level | Score Range | Color |
|-------|-------------|-------|
| Excellent | 90-100 | Green |
| Good | 70-89 | Blue |
| Fair | 50-69 | Yellow |
| Poor | 30-49 | Orange |
| Critical | 0-29 | Red |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   └── index.ts         # App configuration
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── orsController.ts
│   │   └── userController.ts
│   ├── middlewares/
│   │   ├── auth.ts          # JWT verification
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── validate.ts      # Input validation
│   ├── models/
│   │   ├── User.ts          # User schema
│   │   └── ORSPlan.ts       # ORS Plan schema
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── orsRoutes.ts
│   │   └── userRoutes.ts
│   ├── scripts/
│   │   └── seed.ts          # Database seeding
│   ├── services/
│   │   ├── authService.ts
│   │   ├── orsService.ts
│   │   └── userService.ts
│   ├── validators/
│   │   ├── authValidators.ts
│   │   ├── orsValidators.ts
│   │   └── userValidators.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── package.json
├── tsconfig.json
└── .env                     # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see [Environment Variables](#-environment-variables))

5. **Seed the database** (optional but recommended for testing)
   ```bash
   npm run seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **For production build**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run seed` | Seed database with sample data |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### ORS Plans
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/ors` | Get all ORS plans (paginated) | All roles |
| GET | `/api/ors/stats` | Get ORS statistics | All roles |
| GET | `/api/ors/:id` | Get ORS plan by ID | All roles |
| POST | `/api/ors` | Create ORS plan | Admin, Inspector |
| PUT | `/api/ors/:id` | Update ORS plan | Admin, Owner |
| DELETE | `/api/ors/:id` | Delete ORS plan | Admin only |

### Query Parameters (GET /api/ors)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by vehicle ID
- `status` - Filter by status
- `vehicleType` - Filter by vehicle type
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc or desc (default: desc)

## 🔐 Test Credentials

After running `npm run seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@ors.com | admin123 |
| **Inspector** | john@ors.com | inspector123 |
| **Viewer** | jane@ors.com | viewer123 |

### Role Capabilities

**Admin**
- Full access to all features
- Manage users (create, edit, delete)
- Manage all ORS plans
- View analytics and statistics

**Inspector**
- View all ORS plans
- Create new ORS plans
- Edit own ORS plans
- Cannot manage users

**Viewer**
- View all ORS plans
- View analytics and statistics
- Read-only access

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ors-tracker
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ors-tracker

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Environment Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiry time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running locally or Atlas URI is correct
   - Check network connectivity for Atlas

2. **JWT Token Invalid**
   - Ensure JWT_SECRET is set in environment
   - Token may have expired (default: 7 days)

3. **CORS Errors**
   - Ensure FRONTEND_URL matches your frontend origin
   - Check that credentials are included in requests

---

**Built with ❤️ for fleet management**
