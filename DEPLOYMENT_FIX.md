# Deployment Fix Guide for Render

## Issues Fixed

1. CORS configuration for production
2. Socket.IO configuration for production environments
3. Added proper transports and reconnection settings

## Environment Variables to Add on Render

Go to your Render dashboard and add these environment variables:

### Backend Service Environment Variables:

```
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.onrender.com
MONGODB_URI=your_mongodb_connection_string
PORT=5001
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
EMAIL=your_email
```

**IMPORTANT**: Replace `https://your-frontend-url.onrender.com` with your actual Render frontend URL.

## Additional Render Configuration

### For Backend Service:

1. **Build Command**: `npm install`
2. **Start Command**: `npm start` (or `node backend/src/index.js`)
3. **Environment**: Node
4. **Plan**: Free (or your preferred plan)

### For Frontend (if separate):

1. **Build Command**: `npm install && npm run build`
2. **Publish Directory**: `dist`
3. **Environment**: Static Site

## Socket.IO Configuration Changes Made

### Backend (`socket.js`):

- Added `transports: ['websocket', 'polling']` for better compatibility
- Added `allowEIO3: true` for backward compatibility
- Increased `pingTimeout` and `pingInterval` for unstable connections
- Dynamic CORS origin based on environment

### Frontend (`useAuthStore.js`):

- Added `transports: ['websocket', 'polling']`
- Added reconnection settings
- Increased timeout for slower connections

## Common Render Issues and Solutions

### 502 Bad Gateway:

- Usually caused by incorrect CORS configuration
- Make sure `CLIENT_URL` environment variable is set correctly
- Ensure your backend service is running (check logs)

### WebSocket Connection Failed:

- Render's free tier may have some limitations
- The polling fallback should handle this
- Check if firewall/proxy is blocking WebSocket connections

### Deployment Steps:

1. Push your code changes to GitHub
2. Add all environment variables in Render dashboard
3. Trigger a manual deploy or wait for auto-deploy
4. Check the logs for any errors
5. Test the application

## Testing After Deployment:

1. Open browser console (F12)
2. Check for any CORS errors
3. Check if Socket.IO connects successfully
4. Test sending messages
5. Test real-time features

## If Issues Persist:

1. Check Render logs: Dashboard → Your Service → Logs
2. Look for connection errors or crashes
3. Verify all environment variables are set correctly
4. Make sure MongoDB connection string is correct
5. Check if the PORT is correctly set (Render assigns this automatically)
