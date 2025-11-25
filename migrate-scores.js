const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quikcort';

async function migrateScores() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to update.`);

        for (const user of users) {
            // Reset to default if no cases, otherwise recalculate
            if (user.totalCases === 0) {
                user.credibilityScore = 50;
            } else {
                user.updateCredibilityScore();
            }

            // Double check cap
            if (user.credibilityScore > 100) {
                user.credibilityScore = 100;
            }

            await user.save();
            console.log(`Updated user ${user.email}: Score = ${user.credibilityScore}`);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

migrateScores();
