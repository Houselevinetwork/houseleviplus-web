import { Injectable } from '@nestjs/common';

@Injectable()
export class TravelTestimonialsService {
  async findAll(query: any) {
    return [];
  }

  async submit(dto: any) {
    return { success: true, message: 'Your review is pending approval.' };
  }

  async findAllAdmin(status?: string) {
    return [];
  }

  async updateStatus(id: string, status: string, featured?: boolean) {
    return { id, status, featured };
  }

  async remove(id: string) {
    return { deleted: true };
  }
}