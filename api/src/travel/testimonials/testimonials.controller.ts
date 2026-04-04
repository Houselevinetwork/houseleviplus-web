import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TravelTestimonialsService } from './testimonials.service';

@Controller('travel/testimonials')
export class TravelTestimonialsController {
  constructor(private readonly testimonialsService: TravelTestimonialsService) {}

  @Get()
  findAll(@Query() query: { status?: string; featured?: string; packageSlug?: string }) {
    return this.testimonialsService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: any) {
    return this.testimonialsService.submit(dto);
  }

  @Get('admin')
  adminFindAll(@Query('status') status?: string) {
    return this.testimonialsService.findAllAdmin(status);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; featured?: boolean },
  ) {
    return this.testimonialsService.updateStatus(id, body.status, body.featured);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
