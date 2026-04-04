// admin-frontend/src/lib/api.ts (FIXED - Proper Token Handling)
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'admin_token';

// ============================================================================
// DEVICE FINGERPRINTING (Netflix-Grade Auth)
// ============================================================================
const getDeviceFingerprint = (): string => {
  // Generate consistent device ID based on browser fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  const fingerprint = canvas.toDataURL();
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
};

const getBrowserName = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return `Chrome ${navigator.appVersion.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'}`;
  if (ua.includes('Firefox')) return `Firefox ${navigator.appVersion.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'}`;
  if (ua.includes('Safari')) return `Safari ${navigator.appVersion.match(/Version\/(\d+)/)?.[1] || 'Unknown'}`;
  if (ua.includes('Edge')) return `Edge ${navigator.appVersion.match(/Edg\/(\d+)/)?.[1] || 'Unknown'}`;
  return 'Unknown Browser';
};

const getOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows 10/11';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown OS';
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ============================================================================
// AUTH API (FIXED)
// ============================================================================
const authApi = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('admin_refresh_token');
  },

  login: async (email: string, password: string) => {
    try {
      // CORRECT: Auth routes are at /auth/login (NO /api prefix)
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        deviceInfo: {
          deviceId: getDeviceFingerprint(),
          deviceType: 'laptop',  // ✅ FIXED: Changed from 'desktop' to 'laptop'
          deviceName: getBrowserName(),
          os: getOS(),
          browser: getBrowserName(),
          appVersion: '1.0.0',
        },
      });

      console.log('🔍 Backend login response:', response.data);

      // ✅ FIXED: Backend sends accessToken, not token
      if (response.data.accessToken) {
        authApi.setToken(response.data.accessToken);
        
        // Also store refresh token if needed
        if (response.data.refreshToken) {
          localStorage.setItem('admin_refresh_token', response.data.refreshToken);
        }
        
        return {
          success: true,
          data: {
            user: response.data.user,
            token: response.data.accessToken,
          },
        };
      }

      return {
        success: false,
        error: response.data.message || 'Login failed',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Network error',
      };
    }
  },

  verifyToken: async () => {
    const token = authApi.getToken();
    
    if (!token) {
      return {
        success: false,
        error: 'No token found',
      };
    }

    try {
      // CORRECT: Auth routes are at /auth/me (NO /api prefix)
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        data: {
          user: response.data.user || response.data,
        },
      };
    } catch (error: any) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Network error',
      };
    }
  },
};

// ============================================================================
// ADMIN CONTENT API (For Admin Dashboard)
// ============================================================================
const adminContentApi = {
  // Get all content (admin view with pagination)
  getContent: async (page = 1, limit = 100) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/content?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error: any) {
      console.error('Get content error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to fetch content'
      };
    }
  },

  // Delete content
  deleteContent: async (contentId: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/content/${contentId}`,
        { headers: getAuthHeaders() }
      );
      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error: any) {
      console.error('Delete content error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to delete content'
      };
    }
  },

  // Update content
  updateContent: async (contentId: string, updates: any) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/content/${contentId}`,
        updates,
        { headers: getAuthHeaders() }
      );
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error: any) {
      console.error('Update content error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to update content'
      };
    }
  },

  // Get content by ID
  getContentById: async (contentId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/content/${contentId}`,
        { headers: getAuthHeaders() }
      );
      return {
        success: true,
        data: response.data.data,
        error: null
      };
    } catch (error: any) {
      console.error('Get content by ID error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || error.message || 'Failed to fetch content'
      };
    }
  },
};

// ============================================================================
// UPLOAD API
// ============================================================================
export interface CreateDraftPayload {
  mediaType: 'miniseries' | 'reelfilm' | 'stageplay' | 'tvshow' | 'movie' | 'podcast' | 'music';
  title: string;
  type: 'video' | 'audio';
  fileName: string;
  fileSize: number;
  storageMethod: 'r2' | 'stream';
  description?: string;
  series?: {
    title: string;
    description?: string;
    genres?: string[];
    rating?: string;
    releaseYear?: number;
    isOriginal?: boolean;
    isExclusive?: boolean;
  };
  season?: number;
  episode?: number;
  cast?: string[];
  director?: string;
  genre?: string[];
  rating?: string;
  language?: string;
  featured?: boolean;
  isOriginal?: boolean;
  isExclusive?: boolean;
  isPremium?: boolean;
}

export interface CompleteUploadPayload {
  title: string;
  description?: string;
  storageMethod: 'r2' | 'stream';
  cloudflareKey?: string;
  cloudflareStreamId?: string;
  fileSize: number;
  duration?: number;
  images?: {
    poster?: string;
    backdrop?: string;
    logo?: string;
  };
  thumbnail?: string;
  trailer?: {
    cloudflareStreamId?: string;
    url?: string;
    duration?: number;
  };
  series?: any;
  season?: number;
  episode?: number;
  cast?: string[];
  director?: string;
  writer?: string;
  producer?: string;
  genre?: string[];
  releaseYear?: number;
  rating?: string;
  language?: string;
  subtitles?: string[];
  subtitleUrls?: { language: string; url: string }[];
  featured?: boolean;
  isOriginal?: boolean;
  isExclusive?: boolean;
  isPremium?: boolean;
}

export const apiClient = {
  // ========== AUTH METHODS ==========
  getToken: authApi.getToken,
  setToken: authApi.setToken,
  clearToken: authApi.clearToken,
  login: authApi.login,
  verifyToken: authApi.verifyToken,

  // ========== ADMIN CONTENT METHODS ==========
  getContent: adminContentApi.getContent,
  deleteContent: adminContentApi.deleteContent,
  updateContent: adminContentApi.updateContent,
  getContentById: adminContentApi.getContentById,

  // ========== UPLOAD METHODS ==========
  // Create draft
  createDraft: async (payload: CreateDraftPayload) => {
    try {
      const response = await axios.post(`${API_URL}/api/uploads/draft`, payload, {
        headers: getAuthHeaders()
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || 'Draft creation failed' };
    }
  },

  // Get presigned URL (R2)
  getPresignedUrl: async (uploadId: string, fileName: string, fileType: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/uploads/${uploadId}/presigned-url`,
        { fileName, fileType },
        { headers: getAuthHeaders() }
      );
      return { data: response.data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || 'Failed to get presigned URL' };
    }
  },

  // Upload to Cloudflare (R2 or Stream)
  uploadToCloudflare: async (url: string, file: File, onProgress: (progress: number) => void) => {
    try {
      await axios.put(url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (e) => {
          if (e.total) onProgress((e.loaded / e.total) * 100);
        }
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Upload failed' };
    }
  },

  // Upload to Stream (via backend)
  uploadToStream: async (uploadId: string, file: File, onProgress: (progress: number) => void) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/api/uploads/${uploadId}/stream-direct`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e) => {
            if (e.total) onProgress((e.loaded / e.total) * 100);
          }
        }
      );
      return { data: response.data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || 'Stream upload failed' };
    }
  },

  // Get Stream status
  getStreamStatus: async (uploadId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/uploads/${uploadId}/stream-status`, {
        headers: getAuthHeaders()
      });
      return { data: response.data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || 'Failed to get status' };
    }
  },

  // Complete upload
  completeUpload: async (uploadId: string, payload: CompleteUploadPayload) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/uploads/${uploadId}/complete`,
        payload,
        { headers: getAuthHeaders() }
      );
      return { data: response.data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data?.message || 'Upload completion failed' };
    }
  },

  // Cancel upload
  cancelUpload: async (uploadId: string) => {
    try {
      await axios.delete(`${API_URL}/api/uploads/${uploadId}`, {
        headers: getAuthHeaders()
      });
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to cancel upload' };
    }
  },
};

// ============================================================================
// CONTENT API (For Client Frontend - kept for backward compatibility)
// ============================================================================
export interface Content {
  _id: string;
  title: string;
  type: string;
  description: string;
  status: string;
  storage: {
    originalUrl?: string;
    cloudflareStreamId?: string;
    thumbnail?: string;
    duration?: number;
  };
  images?: {
    poster?: string;
    backdrop?: string;
    logo?: string;
  };
  trailer?: {
    cloudflareStreamId?: string;
    url?: string;
    duration?: number;
  };
  series?: {
    title: string;
    description?: string;
    totalSeasons?: number;
    totalEpisodes?: number;
    genres?: string[];
    rating?: string;
    isOriginal?: boolean;
  };
  season?: number;
  episode?: number;
  metadata: {
    cast?: string[];
    director?: string;
    genre?: string[];
    releaseYear?: number;
    rating?: string;
    language?: string;
    featured?: boolean;
    isOriginal?: boolean;
    isExclusive?: boolean;
    isTrending?: boolean;
    episodeTitle?: string;
    [key: string]: any;
  };
  isPremium: boolean;
  viewCount: number;
  createdAt: string;
}

export const contentApi = {
  // Get all content with filters
  getContent: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    genre?: string;
    search?: string;
    featured?: boolean;
    original?: boolean;
    exclusive?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.genre) query.append('genre', params.genre);
    if (params?.search) query.append('search', params.search);
    if (params?.featured) query.append('featured', 'true');
    if (params?.original) query.append('original', 'true');
    if (params?.exclusive) query.append('exclusive', 'true');

    const response = await axios.get(`${API_URL}/api/content?${query.toString()}`);
    return response.data.data.data as Content[];
  },

  // Get featured content
  getFeatured: async (limit = 10): Promise<Content[]> => {
    const response = await axios.get(`${API_URL}/api/content/featured?limit=${limit}`);
    return response.data.data;
  },

  // Get Reel Afrika Originals
  getOriginals: async (limit = 20): Promise<Content[]> => {
    const response = await axios.get(`${API_URL}/api/content/originals?limit=${limit}`);
    return response.data.data;
  },

  // Get exclusive content
  getExclusive: async (limit = 20): Promise<Content[]> => {
    const response = await axios.get(`${API_URL}/api/content/exclusive?limit=${limit}`);
    return response.data.data;
  },

  // Get trending content
  getTrending: async (limit = 20): Promise<Content[]> => {
    const response = await axios.get(`${API_URL}/api/content/trending?limit=${limit}`);
    return response.data.data;
  },

  // Get content by genre
  getByGenre: async (genre: string, limit = 20): Promise<Content[]> => {
    const response = await axios.get(`${API_URL}/api/content/genre/${encodeURIComponent(genre)}?limit=${limit}`);
    return response.data.data;
  },

  // Get series episodes
  getSeries: async (seriesTitle: string, season?: number) => {
    const url = season
      ? `${API_URL}/api/content/series/${encodeURIComponent(seriesTitle)}?season=${season}`
      : `${API_URL}/api/content/series/${encodeURIComponent(seriesTitle)}`;
    
    const response = await axios.get(url);
    return response.data.data;
  },

  // Get content by ID
  getContentById: async (id: string): Promise<Content> => {
    const response = await axios.get(`${API_URL}/api/content/${id}`);
    return response.data.data;
  },

  // Get content by type (legacy method)
  getContentByType: async (type: string, page = 1, limit = 50): Promise<Content[]> => {
    return contentApi.getContent({ type, page, limit });
  },
};

export default { apiClient, contentApi };