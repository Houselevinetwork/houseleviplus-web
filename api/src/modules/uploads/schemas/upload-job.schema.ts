// api/src/modules/uploads/schemas/upload-job.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UploadJobStatus {
  INITIATED  = 'initiated',   // multipart session created with R2
  UPLOADING  = 'uploading',   // parts are being transferred
  COMPLETING = 'completing',  // CompleteMultipartUpload sent to R2
  COMPLETE   = 'complete',    // R2 assembled the file, publicUrl is set
  FAILED     = 'failed',      // unrecoverable error
  ABORTED    = 'aborted',     // explicitly cancelled by the client
}

@Schema({ timestamps: true })
export class UploadJob extends Document {
  // ── R2 multipart identifiers ──────────────────────────────────────────────
  @Prop({ required: true, index: true })
  r2UploadId: string;          // the UploadId R2 returns from CreateMultipartUpload

  @Prop({ required: true, index: true })
  r2Key: string;               // object key inside the bucket e.g. "my-movie-1714000000.mp4"

  @Prop({ required: true })
  bucket: string;              // R2 bucket name e.g. "reelafrika-movies"

  @Prop({ required: true })
  bucketKey: string;           // ContentTypeBucket enum value e.g. "movie"

  // ── File metadata ─────────────────────────────────────────────────────────
  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;            // bytes

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  totalParts: number;          // Math.ceil(fileSize / CHUNK_SIZE)

  // ── Progress tracking ─────────────────────────────────────────────────────
  // Each entry is { partNumber: number, etag: string } — populated as parts complete
  @Prop({ type: [Object], default: [] })
  completedParts: { partNumber: number; etag: string }[];

  // ── Status ────────────────────────────────────────────────────────────────
  @Prop({
    type: String,
    enum: Object.values(UploadJobStatus),
    default: UploadJobStatus.INITIATED,
    index: true,
  })
  status: UploadJobStatus;

  @Prop({ default: '' })
  failureReason: string;

  // ── Result ────────────────────────────────────────────────────────────────
  @Prop({ default: '' })
  publicUrl: string;           // set once status = complete

  // ── Ownership ─────────────────────────────────────────────────────────────
  @Prop({ required: true, index: true })
  createdBy: string;           // userId — for permission checks

  // ── TTL — stale jobs auto-deleted after 48 hours ──────────────────────────
  // MongoDB TTL index on expiresAt ensures automatic cleanup of:
  //   - abandoned uploads where the browser was closed mid-transfer
  //   - failed jobs that were never retried
  @Prop({ type: Date, default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) })
  expiresAt: Date;

  // Timestamps added automatically by { timestamps: true }
  createdAt: Date;
  updatedAt: Date;
}

export const UploadJobSchema = SchemaFactory.createForClass(UploadJob);

// TTL index — MongoDB deletes the document when expiresAt is reached
UploadJobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Useful for the resume flow — find an in-progress job by file identity
UploadJobSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
