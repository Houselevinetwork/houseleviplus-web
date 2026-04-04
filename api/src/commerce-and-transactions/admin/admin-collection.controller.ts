import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CollectionService } from '../collections/collection.service';
import { RolesGuard } from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles } from '../../user-and-monetization/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';

@Controller('admin/commerce/collections')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminCollectionController {
  constructor(private collectionService: CollectionService) {}

  @Get()
  async getAllCollections() {
    return this.collectionService.findAll();
  }

  @Get(':id')
  async getCollection(@Param('id') id: string) {
    return this.collectionService.findById(id);
  }

  @Post()
  async createCollection(@Body() createData: any) {
    return this.collectionService.create(createData);
  }

  @Patch(':id')
  async updateCollection(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.collectionService.update(id, updateData);
  }

  @Delete(':id')
  async deleteCollection(@Param('id') id: string) {
    return this.collectionService.delete(id);
  }

  @Patch(':id/reorder')
  async reorderCollection(
    @Param('id') id: string,
    @Body() dto: { displayOrder: number },
  ) {
    return this.collectionService.update(id, { displayOrder: dto.displayOrder });
  }
}
