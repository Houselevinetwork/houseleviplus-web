import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CloudflareException } from '../../common/exceptions/cloudflare.exception';

interface StreamConfig {
  apiUrl: string;
  apiToken: string;
  uploadUrl: string;
}

@Injectable()
export class CloudflareStreamService {
  private readonly logger = new Logger(CloudflareStreamService.name);
  private axiosInstance: AxiosInstance;
  private config: StreamConfig;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
    this.initializeAxios();
  }

  private initializeConfig(): void {
    const apiUrl = this.configService.get<string>('CLOUDFLARE_STREAM_API_URL') ?? '';
    const apiToken = this.configService.get<string>('CLOUDFLARE_STREAM_API_TOKEN') ?? '';
    const uploadUrl = this.configService.get<string>('CLOUDFLARE_STREAM_UPLOAD_URL') ?? '';

    if (!apiUrl || !apiToken || !uploadUrl) {
      throw new Error(
        'Missing required Stream configuration: CLOUDFLARE_STREAM_API_URL, CLOUDFLARE_STREAM_API_TOKEN, CLOUDFLARE_STREAM_UPLOAD_URL',
      );
    }

    this.config = {
      apiUrl,
      apiToken,
      uploadUrl,
    };
  }

  private initializeAxios(): void {
    this.axiosInstance = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create an upload token for direct video uploads
   * Token is valid for 30 minutes
   */
  async createUploadToken(metadata?: {
    name?: string;
    description?: string;
  }): Promise<{
    uploadToken: string;
    uploadUrl: string;
    expiresIn: number;
  }> {
    try {
      const response = await this.axiosInstance.post('/upload', {
        ...(metadata && { metadata }),
      });

      if (!response.data.success) {
        throw new CloudflareException(
          'STREAM_TOKEN_CREATION_FAILED',
          400,
          response.data.errors?.[0]?.message || 'Failed to create upload token',
          { details: response.data.errors },
        );
      }

      const uploadToken = response.data.result.uploadToken;

      this.logger.debug(`Created Stream upload token: ${uploadToken}`);

      return {
        uploadToken,
        uploadUrl: this.config.uploadUrl,
        expiresIn: 1800, // 30 minutes
      };
    } catch (error) {
      if (error instanceof CloudflareException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create upload token: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new CloudflareException(
        'STREAM_TOKEN_CREATION_FAILED',
        500,
        'Failed to create Cloudflare Stream upload token',
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Get video information by stream ID
   */
  async getVideoInfo(videoId: string): Promise<{
    id: string;
    status: string;
    duration: number;
    size: number;
    preview: string;
    playbackUrl: string;
  }> {
    try {
      const response = await this.axiosInstance.get(`/${videoId}`);

      if (!response.data.success) {
        throw new CloudflareException(
          'VIDEO_INFO_RETRIEVAL_FAILED',
          400,
          response.data.errors?.[0]?.message || 'Failed to get video info',
          { details: response.data.errors },
        );
      }

      const video = response.data.result;

      return {
        id: video.uid,
        status: video.status.state,
        duration: video.duration || 0,
        size: video.maxDurationSeconds || 0,
        preview: video.thumbnail,
        playbackUrl: `https://customer-${this.config.apiUrl.split('/')[4]}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
      };
    } catch (error) {
      if (error instanceof CloudflareException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get video info: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new CloudflareException(
        'VIDEO_INFO_RETRIEVAL_FAILED',
        500,
        'Failed to retrieve video information from Stream',
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Delete video from Stream
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      const response = await this.axiosInstance.delete(`/${videoId}`);

      if (!response.data.success) {
        throw new CloudflareException(
          'VIDEO_DELETE_FAILED',
          400,
          response.data.errors?.[0]?.message || 'Failed to delete video',
          { details: response.data.errors },
        );
      }

      this.logger.debug(`Deleted video from Stream: ${videoId}`);
    } catch (error) {
      if (error instanceof CloudflareException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to delete video: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new CloudflareException(
        'VIDEO_DELETE_FAILED',
        500,
        'Failed to delete video from Stream',
        { originalError: errorMessage },
      );
    }
  }

  /**
   * Check video processing status
   */
  async getVideoStatus(
    videoId: string,
  ): Promise<{
    state: 'queued' | 'inprogress' | 'ready' | 'error';
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const response = await this.axiosInstance.get(`/${videoId}`);

      if (!response.data.success) {
        throw new CloudflareException(
          'VIDEO_STATUS_CHECK_FAILED',
          400,
          response.data.errors?.[0]?.message || 'Failed to check video status',
          { details: response.data.errors },
        );
      }

      const video = response.data.result;

      return {
        state: video.status.state,
        errorCode: video.status.errorCode,
        errorMessage: video.status.errorReasonText,
      };
    } catch (error) {
      if (error instanceof CloudflareException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to check video status: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new CloudflareException(
        'VIDEO_STATUS_CHECK_FAILED',
        500,
        'Failed to check video processing status',
        { originalError: errorMessage },
      );
    }
  }
}