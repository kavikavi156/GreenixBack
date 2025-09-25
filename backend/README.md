# Backend - Greenix

This folder contains the Node.js/Express backend server for Greenix.

## Structure
- `server/` - Main server application
  - `index.js` - Main server file
  - `models/` - Database models
  - `routes/` - API routes
  - `services/` - Business logic services
  - `uploads/` - Uploaded images
- `test-*.js` - Test files
- `debug-images.html` - Debug utilities

## Running the Backend
```bash
cd backend/server
npm install  # if dependencies are not installed
npm start    # Start the server
```

The server typically runs on `http://localhost:3001`

## API Endpoints
The backend provides various API endpoints for:
- Authentication (`/auth`)
- Products management (`/products`)
- User management (`/customer`, `/admin`)
- Payment processing (`/razorpay`)
- File uploads (`/upload`)