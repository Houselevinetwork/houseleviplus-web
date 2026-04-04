import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AuthorizationCode extends Document {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  redirectUri: string;

  @Prop({ required: true })
  scope: string;

  @Prop({ required: true })
  state: string;

  @Prop()
  nonce?: string;

  @Prop()
  codeChallenge?: string;

  @Prop()
  codeChallengeMethod?: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Date })
  expiresAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AuthorizationCodeSchema = SchemaFactory.createForClass(AuthorizationCode);
