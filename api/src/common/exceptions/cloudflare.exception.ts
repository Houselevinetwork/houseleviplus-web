export class CloudflareException extends Error {
  constructor(
    public readonly code: string,
    public readonly statusCode: number,
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'CloudflareException';
  }
}