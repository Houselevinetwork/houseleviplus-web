// api/src/user-and-monetization/legal/legal.controller.ts
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('billing-terms')
  @HttpCode(HttpStatus.OK)
  getBillingTerms() {
    return {
      success: true,
      data: this.legalService.getBillingTerms(),
    };
  }

  @Get('privacy-policy')
  @HttpCode(HttpStatus.OK)
  getPrivacyPolicy() {
    return {
      success: true,
      data: this.legalService.getPrivacyPolicy(),
    };
  }

  @Get('dpa')
  @HttpCode(HttpStatus.OK)
  getDataProcessingAgreement() {
    return {
      success: true,
      data: this.legalService.getDataProcessingAgreement(),
    };
  }

  @Get('summaries')
  @HttpCode(HttpStatus.OK)
  getLegalSummaries() {
    return {
      success: true,
      data: this.legalService.getLegalSummaries(),
    };
  }
}