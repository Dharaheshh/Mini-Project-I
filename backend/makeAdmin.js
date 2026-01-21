const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node makeAdmin.js your-email@example.com');
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/damage-reporting', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find and update user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }
    
    if (user.role === 'admin') {
      console.log(`ℹ️  User "${email}" is already an admin`);
      process.exit(0);
    }
    
    // Update role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Successfully updated "${email}" to admin role!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Logout from the application (if logged in)`);
    console.log(`   2. Login again with email: ${email}`);
    console.log(`   3. You'll be redirected to the admin dashboard!`);
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });

