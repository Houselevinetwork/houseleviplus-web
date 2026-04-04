export class UploadSessionResponseDto {
  contentId: string;
  uploadUrl: string;
  method: 'PUT' | 'POST';
  headers?: Record<string, string>;
  expiresIn?: number;
  storageMethod: 'r2' | 'stream';
}