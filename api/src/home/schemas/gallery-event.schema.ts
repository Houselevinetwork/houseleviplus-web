import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GalleryEventDocument = GalleryEvent & Document;

@Schema({ timestamps: true, collection: 'gallery_events' })
export class GalleryEvent {
  /** Human-readable name shown on tabs, e.g. "The Daffodil" */
  @Prop({ required: true, trim: true })
  name: string;

  /** URL-safe slug used for filtering, e.g. "the-daffodil" */
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  /** Optional cover thumbnail shown on the event selector card */
  @Prop({ default: '' })
  coverImageUrl: string;

  @Prop({ default: '' })
  coverImageKey: string;

  /** Total images extracted from ZIP — updated after upload completes */
  @Prop({ default: 0 })
  imageCount: number;

  /** Whether this event's images appear in the hero slideshow */
  @Prop({ default: true })
  isActive: boolean;

  /** Controls hero display order — lower = shown first */
  @Prop({ default: 0 })
  displayOrder: number;

  /** Upload status so admin can see if a ZIP is still being processed */
  @Prop({ enum: ['pending', 'processing', 'complete', 'failed'], default: 'pending' })
  uploadStatus: string;

  @Prop({ default: '' })
  description: string;
}

export const GalleryEventSchema = SchemaFactory.createForClass(GalleryEvent);

GalleryEventSchema.index({ slug: 1 });
GalleryEventSchema.index({ isActive: 1, displayOrder: 1 });
GalleryEventSchema.index({ uploadStatus: 1 });
