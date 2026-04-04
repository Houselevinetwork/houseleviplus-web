import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user-and-monetization/user/user.service';
import { RoleService } from '../user-and-monetization/role/role.service';
import * as readline from 'readline';
import { Types } from 'mongoose';

interface AdminDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

async function createAdmin() {
  console.log('\n🚀 Reel Afrika - Admin User Creation\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const roleService = app.get(RoleService);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => rl.question(query, resolve));
  };

  try {
    console.log('📝 Enter admin user details:\n');

    const firstName = await question('First Name: ');
    const lastName = await question('Last Name: ');
    const email = (await question('Email: ')).toLowerCase().trim();
    const phoneNumber = await question('Phone Number (e.g., 0712345678): ');
    const password = await question('Password (min 8 characters): ');
    const confirmPassword = await question('Confirm Password: ');

    // Validate inputs
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      throw new Error('All fields are required');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check existing user
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      console.log('\n⚠️  User with this email already exists!');
      const overwrite = await question(
        'Do you want to delete and recreate? (yes/no): ',
      );

      if (overwrite.toLowerCase() === 'yes') {
        await userService.delete(existingUser._id.toString());
        console.log('✅ Existing user deleted');
      } else {
        console.log('❌ Admin creation cancelled');
        rl.close();
        await app.close();
        return;
      }
    }

    // Fetch admin role
    let adminRole = await roleService.findByName('admin');

    // Create role if missing
    if (!adminRole) {
      console.log('\n📋 Admin role not found. Creating admin role...');

      adminRole = await roleService.create({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'read:all',
          'write:all',
          'delete:all',
          'manage:users',
          'manage:content',
          'manage:subscriptions',
          'manage:billing',
          'upload:content',
        ],
      });

      console.log('✅ Admin role created');
    }

    // Runtime safety
    if (!adminRole) {
      throw new Error('Admin role creation failed unexpectedly.');
    }

    // Correct type: Types.ObjectId (matches schema)
    const roleId: Types.ObjectId = adminRole._id as Types.ObjectId;

    // Normalize phone number
    let normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '254' + normalizedPhone.substring(1);
    } else if (
      normalizedPhone.startsWith('7') ||
      normalizedPhone.startsWith('1')
    ) {
      normalizedPhone = '254' + normalizedPhone;
    }

    // Create admin user
    console.log('\n⏳ Creating admin user...');

    const adminUser = await userService.create({
      firstName,
      lastName,
      email,
      phoneNumber: normalizedPhone,
      password,
      roleId,
      emailVerified: true,
      isPremium: true,
      subscriptionStatus: 'active',
      isActive: true,
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Name:         ${firstName} ${lastName}`);
    console.log(`📧 Email:        ${email}`);
    console.log(`📱 Phone:        ${normalizedPhone}`);
    console.log(`🔑 Role:         ${adminRole!.name}`);
    console.log(`✨ Status:       Active & Email Verified`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 You can now login at: http://localhost:8080\n');

  } catch (error: any) {
    console.error('\n❌ Error creating admin:', error.message);
  } finally {
    rl.close();
    await app.close();
  }
}

createAdmin();
