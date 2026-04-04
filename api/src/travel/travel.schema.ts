// api/src/travel/travel.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Continent = 'Africa' | 'Europe' | 'Asia' | 'Australia' | 'Americas';
export type PackageStatus = 'active' | 'draft' | 'full' | 'archived';

@Schema({ timestamps: true, collection: 'travelpackages' })
export class TravelPackage extends Document {
  @Prop({ required: true, index: true }) destination: string;
  @Prop({ enum: ['Africa', 'Europe', 'Asia', 'Australia', 'Americas'], default: 'Africa' }) continent: Continent;
  @Prop({ required: true }) description: string;
  @Prop() imageUrl: string;
  @Prop() departureDate: Date;
  @Prop() returnDate: Date;
  @Prop({ default: 0 }) totalSpots: number;
  @Prop({ default: 0 }) spotsRemaining: number;
  @Prop({ default: 0 }) priceUSD: number;
  @Prop({ enum: ['active', 'draft', 'full', 'archived'], default: 'active', index: true }) status: PackageStatus;
  @Prop({ required: true, unique: true, lowercase: true }) slug: string;
  @Prop({ default: 0 }) displayOrder: number;
  @Prop({ type: Date, default: () => new Date() }) createdAt: Date;
  @Prop({ type: Date, default: () => new Date() }) updatedAt: Date;
}

export const TravelPackageSchema = SchemaFactory.createForClass(TravelPackage);
TravelPackageSchema.index({ status: 1, createdAt: -1 });
TravelPackageSchema.index({ continent: 1, status: 1 });