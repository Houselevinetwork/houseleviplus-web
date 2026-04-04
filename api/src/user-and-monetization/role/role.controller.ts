import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRole(
    @Body() dto: { name: string; description?: string; permissions?: string[] }
  ) {
    return this.roleService.createRole(
      dto.name,
      dto.description || '',
      dto.permissions || [],
    );
  }

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }
}