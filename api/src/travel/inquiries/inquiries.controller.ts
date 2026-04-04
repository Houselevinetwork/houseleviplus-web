import {
  Controller, Get, Post, Patch,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { TravelInquiriesService } from './inquiries.service';

@Controller('travel/inquiries')
export class TravelInquiriesController {
  constructor(private readonly inquiriesService: TravelInquiriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: any) {
    return this.inquiriesService.create(dto);
  }

  @Post('custom')
  @HttpCode(HttpStatus.CREATED)
  createCustom(@Body() dto: any) {
    return this.inquiriesService.createCustom(dto);
  }

  @Get()
  findAll(@Query() query: { packageId?: string; status?: string }) {
    return this.inquiriesService.findAll(query);
  }

  @Get('custom')
  findAllCustom() {
    return this.inquiriesService.findAllCustom();
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; adminNotes?: string },
  ) {
    return this.inquiriesService.updateStatus(id, body.status, body.adminNotes);
  }
}