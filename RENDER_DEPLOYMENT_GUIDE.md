# 🚀 Render.com Deployment Guide for Greenix Backend

## 📋 Pre-Deployment Checklist

### 1. MongoDB Atlas Setup
- Create a MongoDB Atlas account (if not already done)
- Create a new cluster
- Create a database user with read/write permissions
- Get your connection string from the "Connect" button
- Add your IP address or use 0.0.0.0/0 for allow all IPs

### 2. Razorpay Setup
- Login to your Razorpay Dashboard
- Go to Settings → API Keys
- Generate/Copy your Key ID and Key Secret
- For testing: Use test keys (starts with rzp_test_)
- For production: Use live keys (starts with rzp_live_)

## 🔧 Render.com Deployment Steps

### Step 1: Create Web Service
1. Login to Render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `kavikavi156/Greenix`
4. Configure the service:
   - **Name**: `greenix-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (our launcher handles this)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Environment Variables
In Render dashboard, go to Environment tab and add these variables:

#### 🔐 Required Variables (Replace with your actual values)
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/greenix?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

#### 🔧 Optional Variables (Recommended)
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword123!
ALLOWED_ORIGINS=https://your-frontend-domain.com
MAX_FILE_SIZE=5242880
BCRYPT_ROUNDS=12
DEBUG=false
ENABLE_LOGGING=true
```

### Step 3: Deploy
1. Click "Create Web Service"
2. Wait for the deployment to complete
3. Your backend will be available at: `https://greenix-backend.onrender.com`

## 📝 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/greenix` |
| `JWT_SECRET` | Token encryption | Use a random 32+ character string |
| `RAZORPAY_KEY_ID` | Payment gateway ID | `rzp_live_1234567890` |
| `RAZORPAY_KEY_SECRET` | Payment gateway secret | Keep this secret! |
| `PORT` | Server port (Render uses 10000) | `10000` |
| `ADMIN_EMAIL` | Default admin login | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Default admin password | Use a strong password |

## 🔗 MongoDB Atlas Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-name>.<random-id>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

**Example**: `mongodb+srv://greenix_user:MySecurePass123@cluster0.abc123.mongodb.net/greenix_production?retryWrites=true&w=majority`

## 🔑 How to Get Your MongoDB Connection String
1. Login to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `greenix`)

## 🛡️ Security Best Practices
- Use strong, unique passwords
- Never commit real credentials to GitHub
- Use different credentials for test and production
- Regularly rotate your secrets
- Enable MongoDB IP whitelisting when possible

## 🎯 Frontend Integration
Once your backend is deployed, update your frontend to use the new API URL:
```javascript
const API_BASE_URL = 'https://greenix-backend.onrender.com';
```

## 🐛 Troubleshooting Common Issues

### Build Fails
- Check if all dependencies are in package.json
- Verify Node.js version compatibility
- Check deployment logs for specific errors

### Connection Errors
- Verify MongoDB connection string format
- Check if IP addresses are whitelisted in MongoDB Atlas
- Ensure environment variables are set correctly

### Authentication Issues
- Verify JWT_SECRET is set and consistent
- Check admin credentials
- Ensure CORS origins are configured properly

### Payment Issues
- Verify Razorpay credentials are correct
- Check if using correct environment (test vs live)
- Ensure webhook URLs are configured in Razorpay dashboard

## 📞 Testing Your Deployment
After deployment, test these endpoints:
- Health check: `GET https://greenix-backend.onrender.com/health`
- API status: `GET https://greenix-backend.onrender.com/api/health`
- Admin login: `POST https://greenix-backend.onrender.com/api/admin/login`

## 🔄 Updating Your Deployment
1. Push changes to your GitHub repository
2. Render will automatically redeploy
3. Check deployment logs if issues occur
4. Test functionality after each deployment

---
**Need help?** Check the Render.com documentation or contact support if deployment issues persist.