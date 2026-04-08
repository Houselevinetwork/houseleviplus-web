const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const uri = 'mongodb+srv://reelsafrika_db_user:8w4qhdMQIy8zQc3L@reelafrikadb.rhg0fc1.mongodb.net/houselevi_library?retryWrites=true&w=majority&appName=reelafrikadb';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db('houselevi_library');

    // Step 1: Create admin role
    const rolesCollection = db.collection('roles');
    let adminRole = await rolesCollection.findOne({ name: 'admin' });

    if (!adminRole) {
      const result = await rolesCollection.insertOne({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'read:content',
          'write:content',
          'delete:content',
          'manage:users',
          'manage:roles',
          'manage:billing',
          'manage:settings',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      adminRole = { _id: result.insertedId };
      console.log('Admin role created:', result.insertedId);
    } else {
      console.log('Admin role already exists:', adminRole._id);
    }

    // Step 2: Hash password
    const hashedPassword = await bcrypt.hash('YourChosenPassword123!', 12);
    console.log('Password hashed successfully');

    // Step 3: Check if admin user already exists
    const usersCollection = db.collection('users');
    const existingAdmin = await usersCollection.findOne({ email: 'houselevi.network@gmail.com' });

    if (existingAdmin) {
      // Update existing user to admin role
      await usersCollection.updateOne(
        { email: 'houselevi.network@gmail.com' },
        {
          $set: {
            roleId: adminRole._id,
            password: hashedPassword,
            emailVerified: true,
            isActive: true,
            updatedAt: new Date(),
          },
        }
      );
      console.log('Existing user updated to admin');
    } else {
      // Create fresh admin user
      const result = await usersCollection.insertOne({
        firstName: 'House',
        lastName: 'Levi',
        email: 'houselevi.network@gmail.com',
        phoneNumber: '',
        password: hashedPassword,
        roleId: adminRole._id,
        emailVerified: true,
        isPremium: true,
        subscriptionStatus: 'premium',
        autoRenew: false,
        isActive: true,
        profileComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0,
      });
      console.log('Admin user created:', result.insertedId);
    }

    console.log('');
    console.log('============================');
    console.log('Admin setup complete!');
    console.log('Email   : houselevi.network@gmail.com');
    console.log('Password: YourChosenPassword123!');
    console.log('Role    : admin');
    console.log('============================');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

createAdmin();
