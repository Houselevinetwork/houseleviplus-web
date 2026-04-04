import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OAuthClient extends Document {
  @Prop({ required: true, unique: true })
  clientId: string;

  @Prop({ required: true })
  clientSecret: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ type: [String], required: true })
  redirectUris: string[];

  @Prop({ type: [String], default: ['openid', 'profile', 'email'] })
  allowedScopes: string[];

  @Prop({ type: [String], default: ['web', 'admin'] })
  type: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OAuthClientSchema = SchemaFactory.createForClass(OAuthClient);
