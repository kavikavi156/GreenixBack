# 🍃 MongoDB Atlas Setup Guide

## 🎯 Quick Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a **FREE** account
3. Choose **"Build a database"**

### 2. Create a Free Cluster
1. Select **"FREE"** tier (M0 Sandbox)
2. Choose **AWS** as provider
3. Select closest region to you
4. Name your cluster: `greenix-cluster`
5. Click **"Create Cluster"**

### 3. Create Database User
1. Go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Create user:
   - Username: `greenix`
   - Password: `Greenix2025` (or generate secure password)
   - Database User Privileges: **"Read and write to any database"**
4. Click **"Add User"**

### 4. Configure Network Access
1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 5. Get Connection String
1. Go to **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **Node.js** driver
4. Copy the connection string
5. Replace `<password>` with your actual password

### 6. Update Your .env File
Replace the MONGODB_URI in your `.env` file with your connection string:

```env
MONGODB_URI=mongodb+srv://greenix:<password>@greenix-cluster.xxxxx.mongodb.net/pavithratraders?retryWrites=true&w=majority
```

## 🔧 Current Configuration

Your backend is now configured to use:
- **MongoDB Atlas**: Cloud database (replaces local MongoDB)
- **Database Name**: `pavithratraders`
- **Connection**: Automatic retry with write majority

## ✅ Test Connection

1. **Restart your backend server**:
   ```bash
   cd E:\Greenix\backend\server
   npm start
   ```

2. **Check the logs** for:
   - ✅ "Connected to MongoDB"
   - ✅ "Server running on port 3001"

3. **Test API**:
   - Visit: http://localhost:3001/api/products
   - Should return sample products data

## 🚨 Troubleshooting

### If connection fails:
1. **Check password** in connection string
2. **Verify network access** allows your IP
3. **Wait 2-3 minutes** for cluster to be ready
4. **Check cluster status** in MongoDB Atlas dashboard

### Common errors:
- `ENOTFOUND`: Wrong connection string or cluster not ready
- `Authentication failed`: Wrong username/password
- `Network timeout`: Check network access settings

---

**Your current setup**: Local backend (localhost:3001) → MongoDB Atlas (cloud database) 🚀