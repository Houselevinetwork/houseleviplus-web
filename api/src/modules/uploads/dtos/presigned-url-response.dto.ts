export class PresignedUrlResponseDto {
  uploadUrl: string;
  publicUrl?: string;
  uploadId?: string;
  cloudflareKey?: string;
  uploadToken?: string;
  method: 'PUT' | 'POST';
  expiresIn: number;
}