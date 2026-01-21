# Cloudinary Setup Guide

## Your Current Credentials
- ✅ **API Key**: `298795463774392`

## What You Still Need

### 1. Cloud Name
- Go to https://cloudinary.com/console
- Login to your account
- Look at the top of the dashboard
- You'll see something like: **"Cloud name: dxxxxx"**
- Copy that value (usually starts with a letter, like `dxxxxx` or `yourname`)

### 2. API Secret
- In the same Cloudinary dashboard
- Look for **"API Secret"** section
- Click **"Reveal"** or **"Show"** button
- Copy the secret key (it's a long string)

## How to Find These in Cloudinary Dashboard

1. **Login to Cloudinary**: https://cloudinary.com/users/login
2. **Go to Dashboard**: Click on your account name → Dashboard
3. **Find Credentials**: Look for a section showing:
   - Cloud name: `xxxxx`
   - API Key: `298795463774392` (you already have this)
   - API Secret: `xxxxx-xxxxx-xxxxx` (click "Reveal" to see it)

## Update Your `backend/.env` File

Once you have all three values, your `backend/.env` should look like:

```env
PORT=5000
MONGODB_URI=mongodb+srv://dharaheshh:06370123@cluster0.flcka9l.mongodb.net/damage-reporting?retryWrites=true&w=majority
JWT_SECRET=damage_reporting_system_secret_key_2024_secure_random_xyz123
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=298795463774392
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace:
- `your_cloud_name_here` with your Cloudinary Cloud Name
- `your_api_secret_here` with your Cloudinary API Secret

## Quick Test

After updating `.env`, you can test if Cloudinary is working by:
1. Starting the backend server
2. Submitting a complaint with an image
3. Check if the image uploads successfully

If you get an error, double-check:
- No extra spaces in the `.env` file
- All three Cloudinary values are correct
- No quotes around the values

