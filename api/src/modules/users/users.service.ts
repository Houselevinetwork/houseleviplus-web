import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { ContentException } from '../../common/exceptions/content.exception';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    name: string;
    role?: string;
  }): Promise<User> {
    try {
      const user = await this.userModel.create({
        email: userData.email,
        name: userData.name,
        role: userData.role || 'creator',
      });

      this.logger.debug(`Created user: ${user._id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new ContentException(
        'USER_CREATION_FAILED',
        500,
        'Failed to create user',
        { originalError: error.message },
      );
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User> {
    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new ContentException(
          'USER_NOT_FOUND',
          404,
          `User not found: ${userId}`,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof ContentException) {
        throw error;
      }
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new ContentException(
        'USER_RETRIEVAL_FAILED',
        500,
        'Failed to retrieve user',
        { originalError: error.message },
      );
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new ContentException(
          'USER_NOT_FOUND',
          404,
          `User not found with email: ${email}`,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof ContentException) {
        throw error;
      }
      this.logger.error(`Failed to find user: ${error.message}`, error.stack);
      throw new ContentException(
        'USER_RETRIEVAL_FAILED',
        500,
        'Failed to retrieve user',
        { originalError: error.message },
      );
    }
  }
}