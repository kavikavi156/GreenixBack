# 🚀 **Render Backend Deployment - Fix Root Directory Error**

## 🚨 **Problem:**
```
==> Service Root Directory "/opt/render/project/src/backend" is missing.
```

**Cause:** Render is looking for backend in wrong directory path.

## ✅ **Solutions:**

### **Option 1: Update Render Service Settings (Recommended)**

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com
   - Find your backend service

2. **Update Service Settings:**
   - Click on your backend service
   - Go to "Settings" tab
   - Update these fields:
     ```
     Root Directory: backend/server
     Build Command: npm install
     Start Command: npm start
     ```

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### **Option 2: Use render.yaml (Auto-deployment)**

Create/update `render.yaml` in your root directory:

```yaml
services:
  - type: web
    name: greenix-backend
    env: node
    rootDir: backend/server
    buildCommand: npm install
    startCommand: npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    healthCheckPath: /api/products
```

### **Option 3: Restructure Project (If needed)**

If Render requires `/src/backend`, create symbolic structure:

```bash
mkdir -p src
cp -r backend src/backend
```

## 🔧 **Quick Fix Steps:**

### **Step 1: Render Dashboard Fix**
1. Login to Render
2. Select your backend service
3. Settings → Root Directory: `backend/server`
4. Redeploy

### **Step 2: Verify Package.json**
Ensure `backend/server/package.json` exists:
```json
{
  "name": "greenix-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### **Step 3: Check Files**
Required files in `backend/server/`:
- ✅ `index.js` (main server file)
- ✅ `package.json`
- ✅ `.env` (for local, use Render env vars)
- ✅ `models/` directory
- ✅ `routes/` directory

## 📁 **Correct Directory Structure:**
```
Greenix/
├── backend/
│   └── server/           ← This is your root directory
│       ├── index.js      ← Main server file
│       ├── package.json  ← Dependencies
│       ├── models/
│       └── routes/
├── frontend/
└── render.yaml           ← Deployment config
```

## 🌐 **Expected Render Configuration:**
```
Service Type: Web Service
Repository: your-github-repo
Root Directory: backend/server
Build Command: npm install
Start Command: npm start
```

## 🚀 **Deploy Commands:**

If using Git-based deployment:
```bash
git add .
git commit -m "Fix Render root directory configuration"
git push origin main
```

---

**The fix is to update your Render service root directory from `/src/backend` to `backend/server`!** 🎯