import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GalleryImageDocument = GalleryImage & Document;

@Schema({ timestamps: true, collection: 'gallery_images' })
export class GalleryImage {
  /** Reference to the parent GalleryEvent */
  @Prop({ type: Types.ObjectId, ref: 'GalleryEvent', required: true, index: true })
  eventId: Types.ObjectId;

  /** R2 object key — e.g. "home/the-daffodil/photo-1710000000-abc.jpg" */
  @Prop({ required: true })
  r2Key: string;

  /** Full public CDN URL — stored so frontend never has to reconstruct it */
  @Prop({ required: true })
  publicUrl: string;

  @Prop({ default: '' })
  originalName: string;

  @Prop({ default: 'image/jpeg' })
  mimeType: string;

  @Prop({ default: 0 })
  sizeBytes: number;

  /** Display order within the event — assigned sequentially during ZIP extraction */
  @Prop({ default: 0 })
  order: number;

  /** Set to false to hide from gallery without deleting from R2 */
  @Prop({ default: true })
  isVisible: boolean;
}

export const GalleryImageSchema = SchemaFactory.createForClass(GalleryImage);

GalleryImageSchema.index({ eventId: 1, isVisible: 1, order: 1 });
GalleryImageSchema.index({ eventId: 1, isVisible: 1 });
