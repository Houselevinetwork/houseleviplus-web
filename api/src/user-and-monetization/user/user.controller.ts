// src/user-and-monetization/user/user.controller.ts - FIXED (Only existing fields)
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// DTO for updating profile
class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: any) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.userService.findAll();
  }

  // ✅ GET /users/profile - Must come BEFORE :id route
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.userService.findById(req.user.userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // ✅ Only includes fields that EXIST in your User schema
    return {
      success: true,
      profile: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        isPremium: user.isPremium,
        subscriptionStatus: user.subscriptionStatus,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      }
    };
  }

  // ✅ PATCH /users/profile - Update user profile
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req, @Body() updateDto: UpdateProfileDto) {
    const userId = req.user.userId;
    
    try {
      // Update user profile
      const updatedUser = await this.userService.update(userId, updateDto);
      
      if (!updatedUser) {
        return {
          success: false,
          message: 'User not found'
        };
      }
      
      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser._id.toString(),
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          isPremium: updatedUser.isPremium,
          subscriptionStatus: updatedUser.subscriptionStatus,
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return { success: true, message: 'User deleted successfully' };
  }
}