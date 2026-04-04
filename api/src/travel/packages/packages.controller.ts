import {
  Controller, Get, Post, Put, Delete, Patch,
  Param, Body, Query, BadRequestException,
} from '@nestjs/common';
import { TravelPackagesService } from './packages.service';

@Controller('travel/packages')
export class TravelPackagesController {
  constructor(private readonly packagesService: TravelPackagesService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.packagesService.findAll(status);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }

  @Post()
  create(@Body() dto: any) {
    return this.packagesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.packagesService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    if (!status) throw new BadRequestException('Status is required');
    return this.packagesService.updateStatus(id, status);
  }

  @Patch('reorder')
  reorder(@Body() body: { order: { id: string; displayOrder: number }[] }) {
    if (!body.order || !Array.isArray(body.order)) {
      throw new BadRequestException('Order array is required');
    }
    return this.packagesService.reorder(body.order);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}