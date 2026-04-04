import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';

@Injectable()
export class RoleService {
  create(arg0: { name: string; description: string; permissions: string[]; }): RoleDocument | PromiseLike<RoleDocument | null> | null {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async findByName(name: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name: name.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<RoleDocument | null> {
    return this.roleModel.findById(id).exec();
  }

  async findOrCreateDefaultRole(): Promise<RoleDocument> {
    let role = await this.findByName('user');
    
    if (!role) {
      role = await this.roleModel.create({
        name: 'user',
        description: 'Default user role',
        permissions: ['read:content'],
      });
    }

    return role;
  }

  async createRole(name: string, description: string, permissions: string[] = []): Promise<RoleDocument> {
    return this.roleModel.create({
      name: name.toLowerCase(),
      description,
      permissions,
    });
  }

  async findAll(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }
}