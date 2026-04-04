import { Injectable, OnModuleInit } from '@nestjs/common';
import { RoleService } from './role.service';

@Injectable()
export class SeedRoles implements OnModuleInit {
  constructor(private readonly roleService: RoleService) {}

  async onModuleInit() {
    const defaultRoles = [
      {
        name: 'user',
        description: 'Default user role with basic permissions',
        permissions: ['read:content', 'manage:profile'],
      },
      {
        name: 'premium',
        description: 'Premium user with access to exclusive content',
        permissions: ['read:content', 'read:premium-content', 'manage:profile'],
      },
      {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          'read:content',
          'write:content',
          'delete:content',
          'manage:users',
          'manage:roles',
          'manage:billing',
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        const existing = await this.roleService.findByName(roleData.name);
        if (!existing) {
          await this.roleService.createRole(
            roleData.name,
            roleData.description,
            roleData.permissions,
          );
          console.log(`✅ Role '${roleData.name}' created successfully`);
        }
      } catch (error) {
        console.log(`ℹ️  Role '${roleData.name}' already exists`);
      }
    }
  }
}