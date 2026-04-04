import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Location: api/src/travel/travel-config.schema.ts
 *
 * Single-document config store for hero image/headline and note from Levi.
 * Uses findOneAndUpdate({}, {...}, { upsert: true }) so there is always
 * exactly one document — no ID management needed.
 */

@Schema({ timestamps: true, collection: 'travelconfig' })
export class TravelConfig extends Document {
  @Prop({ default: '' })
  heroImageUrl: string;

  @Prop({ default: '' })
  heroHeadline: string;

  @Prop({ default: 'View Upcoming Journeys' })
  heroCtaLabel: string;

  @Prop({ default: '' })
  noteBody: string;

  @Prop({ default: '' })
  noteImageUrl: string;
}

export const TravelConfigSchema = SchemaFactory.createForClass(TravelConfig);