import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HomeArtistDocument = HomeArtist & Document;

@Schema({ timestamps: true, collection: 'home_artists' })
export class HomeArtist {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({ default: '' })
  imageKey: string;

  @Prop({ default: '' })
  role: string;

  @Prop({
    type: {
      instagram: { type: String, default: '' },
      twitter:   { type: String, default: '' },
      website:   { type: String, default: '' },
    },
    default: {},
  })
  socialLinks: { instagram: string; twitter: string; website: string };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  displayOrder: number;
}

export const HomeArtistSchema = SchemaFactory.createForClass(HomeArtist);

HomeArtistSchema.index({ isActive: 1, displayOrder: 1 });
