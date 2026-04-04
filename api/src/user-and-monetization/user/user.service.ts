// src/user-and-monetization/user/user.service.ts - COMPLETE WITH UPDATE
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    try {
      const user = new this.userModel(userData);
      return await user.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} already exists`);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const user = await this.userModel.findById(id).populate('roleId').exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() },
      })
      .exec();
  }

  async findByResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetTokenExpiry: { $gt: new Date() },
      })
      .select('+password')
      .exec();
  }

  // ✅ ADD THIS METHOD - Used by PATCH /users/profile
  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    // Validate user ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('roleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    updateData: Partial<User>,
  ): Promise<UserDocument> {
    // Validate user ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('roleId')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    // Validate user ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    await this.userModel.findByIdAndUpdate(userId, {
      lastLoginAt: new Date(),
    });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('roleId').exec();
  }

  async deleteUser(id: string): Promise<void> {
    // Validate user ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async delete(id: string): Promise<void> {
    return this.deleteUser(id);
  }
}