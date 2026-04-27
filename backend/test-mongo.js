require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing connection to MongoDB...');
console.log('URI:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ SUCCESS! MongoDB Connected!');
    process.exit(0);
})
.catch((err) => {
    console.error('❌ FAILED to connect!');
    console.error(err);
    process.exit(1);
});
