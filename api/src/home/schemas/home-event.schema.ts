import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomeEventDocument = HomeEvent & Document;

@Schema({ timestamps: true, collection: 'home_events' })
export class HomeEvent {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ default: '' })
  imageKey: string;

  @Prop({ required: true })
  eventDate: string;

  @Prop({ default: '' })
  location: string;

  /** Ticket price string e.g. "KES 2,500" */
  @Prop({ default: '' })
  ticketPrice: string;

  /** External booking link */
  @Prop({ default: '' })
  bookingUrl: string;

  /** Ticket payment link */
  @Prop({ default: '' })
  ticketUrl: string;

  @Prop({ default: 0 })
  totalSeats: number;

  @Prop({ default: 0 })
  seatsRemaining: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const HomeEventSchema = SchemaFactory.createForClass(HomeEvent);

HomeEventSchema.index({ isActive: 1, eventDate: 1 });
HomeEventSchema.index({ displayOrder: 1 });
