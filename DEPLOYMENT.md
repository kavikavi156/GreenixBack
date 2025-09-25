# Deployment Guide for Render.com

## Prerequisites
1. MongoDB Atlas account (for database)
2. Razorpay account (for payments)
3. Render.com account

## Step 1: Database Setup (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist Render.com IP addresses (or use 0.0.0.0/0 for all IPs)
4. Get your connection string

## Step 2: Render.com Deployment

### Method 1: Using render.yaml with Root Setup (Recommended)
1. Push your code to GitHub (already done)
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` file
4. The root `server.js` will handle starting the backend from correct directory
5. Set the following environment variables in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pavithratraders
JWT_SECRET=your_super_secure_jwt_secret_for_production
ADMIN_EMAIL=admin@pavithratraders.com
ADMIN_PASSWORD=SecureAdminPassword123!
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
ALLOWED_ORIGINS=https://your-frontend-domain.com
API_BASE_URL=https://greenix-backend.onrender.com
CLIENT_BASE_URL=https://your-frontend-domain.com
```

### Method 2: Manual Configuration
If render.yaml doesn't work, use these manual settings in Render:

**Option A - Root Directory (Recommended):**
- **Root Directory:** `` (leave empty - use root)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18 or higher

**Option B - Backend Directory:**
- **Root Directory:** `backend/server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18 or higher

**Option C - Manual Commands:**
- **Root Directory:** `` (leave empty)
- **Build Command:** `cd backend/server && npm install`
- **Start Command:** `cd backend/server && node index.js`

## Step 3: Environment Variables
Set these in Render dashboard > Environment tab:

### Required Variables:
- `NODE_ENV`: production
- `PORT`: (auto-set by Render)
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key (generate new one)
- `ADMIN_EMAIL`: Your admin email
- `ADMIN_PASSWORD`: Secure admin password

### Payment & Security:
- `RAZORPAY_KEY_ID`: Your Razorpay live key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay secret key
- `ALLOWED_ORIGINS`: Your frontend domain
- `BCRYPT_ROUNDS`: 12

### Optional:
- `DEBUG`: false
- `ENABLE_LOGGING`: true

## Step 4: Test Deployment
1. Check health endpoint: `https://your-app.onrender.com/api/test`
2. Verify API: `https://your-app.onrender.com/`
3. Test admin login
4. Test product operations

## Troubleshooting

### Common Issues:
1. **Build fails**: Check if `backend/server/package.json` exists
2. **Database connection fails**: Verify MongoDB Atlas connection string
3. **CORS errors**: Add frontend domain to ALLOWED_ORIGINS
4. **File upload issues**: Render has ephemeral storage, consider cloud storage

### Logs:
Check Render logs for detailed error messages:
- Go to Render dashboard
- Select your service
- Click on "Logs" tab

## Security Notes:
1. Use strong JWT_SECRET in production
2. Use Razorpay LIVE keys (not test keys)
3. Set secure admin password
4. Enable MongoDB Atlas IP whitelist
5. Use HTTPS for all communications

## File Storage:
Render uses ephemeral storage. For production, consider:
1. Cloudinary for images
2. AWS S3
3. Google Cloud Storage

Update the multer configuration accordingly.