# How to Login as Admin

To access the admin dashboard, you need to update a user's role to "admin" in the database. Here are **3 easy methods**:

## Method 1: Using MongoDB Atlas Web Interface (Easiest) ⭐

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com
2. **Login** to your account
3. **Click on "Browse Collections"** (or go to your cluster → Collections)
4. **Select your database**: `damage-reporting`
5. **Click on the `users` collection**
6. **Find your user** (search by email if needed)
7. **Click on the document** to edit it
8. **Find the `role` field** and change it from `"user"` to `"admin"`
9. **Click "Update"** to save

Now logout and login again with that user's credentials - you'll be redirected to the admin dashboard!

---

## Method 2: Using the Helper Script (Quick & Easy) 🚀

I've created a script for you! Just run:

```bash
cd backend
node makeAdmin.js your-email@example.com
```

Replace `your-email@example.com` with the email you used to register.

**Note**: Make sure your `backend/.env` file has the correct `MONGODB_URI`.

---

## Method 3: Using MongoDB Shell (Advanced)

If you have MongoDB shell installed:

```bash
mongosh "mongodb+srv://dharaheshh:06370123@cluster0.flcka9l.mongodb.net/damage-reporting"
```

Then run:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## After Making Yourself Admin:

1. **Logout** from the current session (if logged in)
2. **Login again** with the same email/password
3. You should be **automatically redirected to `/admin`** dashboard
4. You'll see:
   - All complaints from all users
   - Statistics dashboard
   - Filters (Category, Priority, Status)
   - Ability to change complaint statuses

---

## Quick Test:

1. Make a user admin (using any method above)
2. Logout and login
3. You should see "Admin Dashboard" in the navbar
4. You should see stats cards and all complaints

---

## Troubleshooting:

**Q: I updated the role but still see user dashboard?**
- Make sure you **logout and login again**
- Clear browser cache/localStorage
- Check the role was actually updated in MongoDB

**Q: How do I check if I'm admin?**
- After login, check the URL - should be `/admin` not `/dashboard`
- Check navbar - should say "Admin Dashboard" link

**Q: Can I have multiple admins?**
- Yes! Just update multiple users' roles to "admin"

