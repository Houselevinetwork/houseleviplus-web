// api/src/linear-tv/schemas/mood-tv-block.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MoodTVBlock extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startTime: string; // HH:MM format

  @Prop({ required: true })
  endTime: string; // HH:MM format

  @Prop({ default: '' })
  videoId: string; // legacy — kept for backward compat

  @Prop({ default: '' })
  videoUrl: string; // ← R2 public URL — this is what the player uses

  @Prop({ default: '' })
  videoKey: string; // ← R2 object key — used for deletion

  @Prop({ type: [Number], required: true, default: [0,1,2,3,4,5,6] })
  daysOfWeek: number[]; // 0=Sun … 6=Sat

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  priority: number;

  @Prop({
    type: {
      title:       { type: String, default: '' },
      description: { type: String, default: '' },
      genre:       { type: String, default: '' },
      thumbnail:   { type: String, default: '' },
    },
    default: {},
  })
  metadata: {
    title:        string;
    description:  string;
    genre:        string;
    thumbnail?:   string;
  };
}

export const MoodTVBlockSchema = SchemaFactory.createForClass(MoodTVBlock);

// Index for fast schedule lookups
MoodTVBlockSchema.index({ isActive: 1, daysOfWeek: 1, startTime: 1 });