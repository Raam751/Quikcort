# MongoDB Atlas Setup Guide for QuikCort

## Step-by-Step MongoDB Atlas Configuration

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and sign up for an account
3. Verify your email address

### 2. Create a New Project
1. Click "New Project"
2. Name your project (e.g., "QuikCort")
3. Click "Create Project"

### 3. Build Your Cluster
1. Click "Build a cluster"
2. Choose "FREE" tier (M0 Sandbox) - 512 MB storage
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to your users
5. Name your cluster (e.g., "quikcort-cluster")
6. Click "Create Cluster"

### 4. Configure Database Access
1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username (e.g., "quikcort-user")
5. Generate a secure password (save this!)
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

### 5. Configure Network Access
**Option 1: Left Sidebar**
1. In the left sidebar, look for "Network Access" or "Security" section
2. Click "Network Access" or "IP Access List"

**Option 2: If not in sidebar**
1. Click on your cluster name in the main dashboard
2. Look for "Network Access" tab or section
3. Or go to the "Security" section in the top navigation

**Option 3: Direct URL**
1. Go directly to: `https://cloud.mongodb.com/v2/[your-project-id]#/security/network/whitelist`

**Once you find Network Access:**
1. Click "Add IP Address" or "Add Entry"
2. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
3. For production: Add specific IP addresses of your servers
4. Click "Confirm" or "Save"

### 6. Get Your Connection String
1. In the left sidebar, click "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string

### 7. Update Your Environment Variables
1. Open your `.env` file
2. Replace the `MONGO_URI` value with your connection string
3. Replace `<password>` with your database user password
4. Replace `<dbname>` with `quikcort`

Example connection string:
```
MONGO_URI=mongodb+srv://quikcort-user:your-password@quikcort-cluster.xxxxx.mongodb.net/quikcort?retryWrites=true&w=majority
```

### 8. Test Your Connection
1. Start your application: `npm run dev`
2. Check the console for: "MongoDB Atlas Connected: [cluster-name]"
3. If you see connection errors, verify your credentials and network access

## Security Best Practices

### For Development:
- Use "Allow Access from Anywhere" (0.0.0.0/0) for easy testing
- Use strong passwords for database users
- Keep your `.env` file secure and never commit it to version control

### For Production:
- Restrict network access to specific IP addresses
- Use environment variables for all sensitive data
- Regularly rotate database passwords
- Enable MongoDB Atlas monitoring and alerts

## Troubleshooting

### Finding Network Access Settings:

**If you can't find "Network Access" in the left sidebar:**

1. **Look for these alternative names:**
   - "Security" → "Network Access"
   - "IP Access List"
   - "Whitelist"
   - "Access List"

2. **Check the top navigation:**
   - Look for a "Security" tab in the main navigation
   - Click on it to find Network Access

3. **Try the cluster view:**
   - Click on your cluster name
   - Look for tabs like "Overview", "Security", "Network Access"

4. **Use the search:**
   - Look for a search box in the Atlas interface
   - Search for "network" or "access"

5. **Direct navigation:**
   - Go to your project URL and add `#/security/network/whitelist` at the end

### Common Issues:

1. **Connection Timeout**
   - Check your network access settings
   - Verify your IP address is whitelisted

2. **Authentication Failed**
   - Double-check your username and password
   - Ensure the user has proper database privileges

3. **Database Not Found**
   - The database will be created automatically when you first connect
   - Make sure the database name in your connection string is correct

4. **SSL/TLS Issues**
   - MongoDB Atlas requires SSL connections
   - Make sure your connection string includes `?retryWrites=true&w=majority`

5. **Can't find Network Access**
   - Try refreshing the page
   - Make sure you're in the correct project
   - Check if you have the right permissions on the project

## Free Tier Limitations

The MongoDB Atlas free tier (M0) includes:
- 512 MB storage
- Shared RAM and vCPU
- No backup retention
- Basic monitoring

This is perfect for development and small applications. For production with higher traffic, consider upgrading to a paid tier.

## Next Steps

Once your MongoDB Atlas is configured:
1. Test your connection
2. Create your first user account
3. Create your first case
4. Test the AI verdict generation

Your QuikCort backend is now ready to use MongoDB Atlas for data storage!
