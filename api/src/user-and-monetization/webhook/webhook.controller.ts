import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  handleWebhook(@Body() body: any) {
    return this.webhookService.handleEvent(body);
  }
}
