// scripts/cleanup-devices.ts - FIXED WITH PROPER TYPE CHECKING
// Run with: npx ts-node scripts/cleanup-devices.ts

import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reel-afrika';

// Optional: Specify a user ID to clean only their devices
const USER_ID = '691f80858af34ef4a1c65b69'; // Replace with your user ID from logs, or set to null to clean all

async function cleanupDevices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGO_URI}`);
    
    await connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ✅ Check if db exists before using it
    if (!connection.db) {
      throw new Error('❌ Database connection not established');
    }

    const db = connection.db;

    // Choose your cleanup strategy:
    
    // OPTION 1: Delete all devices for a specific user
    if (USER_ID) {
      console.log(`🗑️  Deleting devices for user: ${USER_ID}...`);
      const deleteResult = await db.collection('devices').deleteMany({
        userId: USER_ID,
      });
      console.log(`✅ Deleted ${deleteResult.deletedCount} devices for user ${USER_ID}`);
    } 
    // OPTION 2: Delete ALL devices (clean slate for everyone)
    else {
      console.log('🗑️  Deleting ALL devices...');
      const deleteResult = await db.collection('devices').deleteMany({});
      console.log(`✅ Deleted ${deleteResult.deletedCount} total devices`);
    }

    // OPTION 3: Just deactivate instead of deleting (commented out)
    // Uncomment if you prefer to keep device records but mark them inactive
    /*
    console.log('🔄 Deactivating all devices...');
    const updateResult = await db.collection('devices').updateMany(
      USER_ID ? { userId: USER_ID } : {},
      { $set: { active: false } }
    );
    console.log(`✅ Deactivated ${updateResult.modifiedCount} devices`);
    */

    console.log('');
    console.log('✅ Cleanup complete! You can now login again.');
    console.log('');

  } catch (error) {
    console.error('❌ Error during cleanup:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupDevices();