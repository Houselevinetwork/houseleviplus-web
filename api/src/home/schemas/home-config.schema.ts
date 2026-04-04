import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HomeConfigDocument = HomeConfig & Document;

@Schema({ timestamps: true, collection: 'home_config' })
export class HomeConfig {
  // ── QUOTE ──────────────────────────────────────────────────────
  @Prop({ default: '' })
  quote: string;

  @Prop({ default: '' })
  quoteAuthor: string;

  // ── HERO SLIDESHOW ─────────────────────────────────────────────
  /** 'all' = shuffle all active events | 'specific' = one event only */
  @Prop({ enum: ['all', 'specific'], default: 'all' })
  heroMode: string;

  @Prop({ type: Types.ObjectId, ref: 'GalleryEvent', default: null })
  heroEventId: Types.ObjectId | null;

  // ── HERO TEXT OVERLAY ──────────────────────────────────────────
  @Prop({ default: 'HL+ FACES' })
  heroCaption: string;

  @Prop({ default: 'THE PEOPLES GALLERY' })
  heroTitle: string;

  // ── SLIDESHOW SETTINGS ─────────────────────────────────────────
  @Prop({ default: 4000 })
  slideshowInterval: number;

  @Prop({ default: true })
  kenBurnsEffect: boolean;
}

export const HomeConfigSchema = SchemaFactory.createForClass(HomeConfig);
