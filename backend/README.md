# Attendance Record Backend

A comprehensive Node.js backend application for attendance management with Express.js, MongoDB, and robust security features.

## 🚀 Features

- **User Management**: Complete user registration, authentication, and profile management
- **Rate Limiting**: Comprehensive rate limiting for API protection
- **CORS Configuration**: Flexible CORS settings for frontend integration
- **MongoDB Integration**: Robust database connection with health monitoring
- **Input Validation**: Joi-based validation for all endpoints
- **Security**: Password hashing, JWT tokens, and secure headers
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendace-record/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```bash
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/attendance-record
   MONGO_URI=mongodb://localhost:27017/attendance-record
   MONGODB_AUTH_SOURCE=admin

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_REFRESH_EXPIRE=30d

   # Security Configuration
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-change-this-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📊 API Endpoints

### Health & Status
- `GET /` - Basic server information
- `GET /health` - Health check with database status
- `GET /rate-limit-status` - Rate limiting configuration

### User Management (Future Implementation)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Configuration

### Rate Limiting
The application includes multiple rate limiters:
- **General**: 100 requests per 15 minutes (production)
- **Auth**: 5 login attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **Upload**: 20 uploads per hour
- **Admin**: 50 operations per 5 minutes

### CORS
Configured for development and production environments:
- **Development**: Allows all localhost origins
- **Production**: Restricts to specified domains

### MongoDB
- Connection pooling with up to 10 connections
- Automatic reconnection on failures
- Health monitoring and graceful shutdown

## 🛡️ Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Cross-origin request protection
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error responses

## 📁 Project Structure

```
backend/
├── config/
│   ├── mongo.config.js      # MongoDB configuration
│   └── redis.config.js      # Redis configuration (future)
├── controllers/             # Route controllers
├── middlewares/
│   ├── cors.middleware.js   # CORS configuration
│   └── rateLimits.middleware.js # Rate limiting
├── models/
│   └── user.model.js        # User data model
├── services/                # Business logic
├── utils/                   # Utility functions
├── validations/
│   └── user.validation.js   # Joi validation schemas
├── app.js                   # Main application file
└── package.json
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running
2. Check connection string in `.env`
3. Verify MongoDB authentication settings

### Port Already in Use
1. Change the PORT in `.env` file
2. Kill existing processes on the port
3. Use `npm run dev` for development with auto-restart

### Rate Limiting Issues
- Check rate limit status at `/rate-limit-status`
- Adjust limits in `rateLimits.middleware.js`
- Clear rate limit cache if needed

## 🔄 Development

### Adding New Features
1. Create models in `models/`
2. Add validation schemas in `validations/`
3. Implement controllers in `controllers/`
4. Add routes in `app.js`

### Testing
```bash
# Test configuration
node -e "require('./config/mongo.config'); console.log('Config OK')"

# Test server startup
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/attendance-record |
| `JWT_SECRET` | JWT signing secret | Required |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
