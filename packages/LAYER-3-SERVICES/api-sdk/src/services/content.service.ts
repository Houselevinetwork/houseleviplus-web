import { http } from '../utils/http-client';

export type ContentType = 'movie' | 'series' | 'tv_episode' | 'stageplay' | 'podcast' | 'music' | 'short';

export interface ContentItem {
  id:           string;
  title:        string;
  type:         ContentType;
  description?: string;
  thumbnailUrl?: string;
  duration?:    number;
  isPremium:    boolean;
  publishedAt:  string;
  tags?:        string[];
}

export const contentService = {
  search: (query: string, limit = 8) =>
    http.get<ContentItem[]>(`/content/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  getByType: (type: ContentType, page = 1, pageSize = 20) =>
    http.get<{ data: ContentItem[]; total: number; hasMore: boolean }>(
      `/content?type=${type}&page=${page}&pageSize=${pageSize}`
    ),

  getById: (id: string) =>
    http.get<ContentItem>(`/content/${id}`),

  getFeatured: () =>
    http.get<ContentItem[]>('/content/featured'),
};
