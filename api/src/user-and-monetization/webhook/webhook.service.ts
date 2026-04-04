import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  handleEvent(payload: any) {
    console.log('Received webhook event:', payload);
    return { status: 'ok', received: payload };
  }
}
