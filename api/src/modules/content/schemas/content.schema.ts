// backend/src/modules/content/schemas/content.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ============================================================================
// ENUMS
// ============================================================================
export enum ContentType {
  MINISODE = 'minisode',
  REELFILM = 'reelfilm',
  TV_EPISODE = 'tv_episode',
  MOVIE = 'movie',
  STAGE_PLAY = 'stage_play',
  PODCAST = 'podcast',
  MUSIC = 'music',
}

export enum ContentStatus {
  DRAFT = 'draft',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export enum StorageProvider {
  R2 = 'r2',
  STREAM = 'stream',
}

export enum ContentRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC17 = 'NC-17',
  TV_Y = 'TV-Y',
  TV_Y7 = 'TV-Y7',
  TV_G = 'TV-G',
  TV_PG = 'TV-PG',
  TV_14 = 'TV-14',
  TV_MA = 'TV-MA',
  NR = 'NR',
}

// ============================================================================
// GENRE SYSTEM (Per Reel Afrika Content Architecture)
// ============================================================================

// Film/Video Genres (15 genres from Framework)
export const FILM_GENRES = [
  'Drama',
  'Comedy',
  'Romance',
  'Thriller',
  'Crime',
  'Action',
  'Documentary',
  'Animation',
  'Historical',
  'Coming-of-Age',
  'Family',
  'Short Film',
] as const;

// Music Genres (11 genres from Audio Framework)
export const MUSIC_GENRES = [
  'Afrobeats',
  'Afro Pop',
  'Hip-Hop / Rap',
  'R&B / Soul',
  'Jazz & Blues',
  'Traditional / Folk',
  'Gospel / Spiritual',
  'Reggae / Dancehall',
  'Electronic / House',
  'Instrumental / Soundscape',
  'Film Soundtrack / Score',
] as const;

// Podcast Genres (12 genres from Audio Framework)
export const PODCAST_GENRES = [
  'Documentary',
  'Interview',
  'Talk Show',
  'Investigative Journalism',
  'Storytelling / Narrative',
  'Business & Technology',
  'Culture & Society',
  'History',
  'Wellness & Mental Health',
  'Faith & Spirituality',
  'Education',
  'Comedy Podcast',
] as const;

// Spoken Audio Genres (Crossover)
export const SPOKEN_AUDIO_GENRES = [
  'Spoken Word',
  'Poetry',
  'Monologue',
  'Audio Essay',
] as const;

// Combined types
export type FilmGenre = typeof FILM_GENRES[number];
export type MusicGenre = typeof MUSIC_GENRES[number];
export type PodcastGenre = typeof PODCAST_GENRES[number];
export type SpokenAudioGenre = typeof SPOKEN_AUDIO_GENRES[number];
export type Genre = FilmGenre | MusicGenre | PodcastGenre | SpokenAudioGenre;

export const ALL_GENRES = [
  ...FILM_GENRES,
  ...MUSIC_GENRES,
  ...PODCAST_GENRES,
  ...SPOKEN_AUDIO_GENRES,
] as const;

// ============================================================================
// REGIONAL ENUMS (For Geographic Categories)
// ============================================================================
export enum Region {
  EAST_AFRICA = 'East Africa',
  WEST_AFRICA = 'West Africa',
  SOUTHERN_AFRICA = 'Southern Africa',
  NORTH_AFRICA = 'North Africa',
  CENTRAL_AFRICA = 'Central Africa',
  PAN_AFRICAN = 'Pan-African',
}

// ============================================================================
// EMBEDDED SERIES STRUCTURE
// ============================================================================
@Schema({ _id: false })
export class SeriesInfo {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Object })
  images?: {
    poster?: string;
    backdrop?: string;
    logo?: string;
  };

  @Prop({ default: 0 })
  totalSeasons: number;

  @Prop({ default: 0 })
  totalEpisodes: number;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ type: String, enum: Object.values(ContentRating) })
  rating?: ContentRating;

  @Prop()
  releaseYear?: number;

  @Prop({ default: false })
  isOriginal: boolean;

  @Prop({ default: false })
  isExclusive: boolean;
}

// ============================================================================
// MAIN CONTENT SCHEMA
// ============================================================================
@Schema({ timestamps: true })
export class Content extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: Object.values(ContentType), required: true, index: true })
  type: ContentType;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  uploaderId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(ContentStatus), default: ContentStatus.DRAFT, index: true })
  status: ContentStatus;

  // ============================================================================
  // STORAGE & PLAYBACK
  // ============================================================================
  @Prop({ type: Object, default: {} })
  storage: {
    originalUrl?: string;
    cloudflareStreamId?: string;
    cloudflareKey?: string;
    size?: number;
    mimeType?: string;
    provider?: StorageProvider;
    duration?: number;
    thumbnail?: string;
  };

  // ============================================================================
  // IMAGES (Multiple Variants)
  // ============================================================================
  @Prop({ type: Object, default: {} })
  images: {
    poster?: string;      // Portrait (2:3) - PRIMARY for display
    backdrop?: string;    // Landscape (16:9) - Hero banners
    logo?: string;        // Transparent PNG - Title overlay
  };

  // ============================================================================
  // TRAILER
  // ============================================================================
  @Prop({ type: Object })
  trailer?: {
    cloudflareStreamId?: string;
    url?: string;
    duration?: number;
  };

  // ============================================================================
  // SERIES/EPISODE STRUCTURE
  // ============================================================================
  @Prop({ type: SeriesInfo })
  series?: SeriesInfo;

  @Prop({ type: Number })
  season?: number;

  @Prop({ type: Number })
  episode?: number;

  @Prop({ type: String, index: true })
  seriesId?: string;

  @Prop({ type: String, default: '' })
  slug: string;               // clean URL e.g. "act-of-valor-2012"

  @Prop({ type: Boolean, default: false })
  isNewContent: boolean;      // shows gold "NEW" badge on card

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;        // marks this as the hero item on watch page

  @Prop({ type: String, default: '' })
  displayDuration: string;    // human-readable e.g. "1h 42m", "45 min"

  @Prop({ type: String, default: '' })
  hostName: string;           // denormalized from Host for fast display

  // ============================================================================
  // HOST ASSIGNMENT — NEW
  // Set via admin host detail page: PATCH /api/content/admin/content/:id/host
  // ============================================================================
  @Prop({ type: String, default: null })
  hostSlug: string | null;    // matches Host.slug — fast lookup key

  @Prop({ type: Types.ObjectId, ref: 'Host', default: null })
  hostId: Types.ObjectId | null;  // foreign key → Host collection

  // ============================================================================
  // RICH METADATA (Netflix-style)
  // ============================================================================
  @Prop({ type: Object, default: {} })
  metadata: {
    // ========================================
    // Cast & Crew
    // ========================================
    cast?: string[];
    director?: string;
    writer?: string;
    producer?: string;
    
    // ========================================
    // GENRES (Content-Type Specific)
    // ========================================
    genre?: string[];           // General/Film genres
    musicGenre?: string[];      // Music-specific genres (Afrobeats, etc.)
    podcastGenre?: string[];    // Podcast-specific genres (Interview, etc.)
    
    // ========================================
    // Release Info
    // ========================================
    releaseYear?: number;
    releaseDate?: Date;
    
    // ========================================
    // Rating
    // ========================================
    rating?: ContentRating;
    ratingReasons?: string[];
    
    // ========================================
    // Language & Subtitles
    // ========================================
    language?: string;
    audioTracks?: string[];
    subtitles?: string[];
    subtitleUrls?: {
      language: string;
      url: string;
    }[];
    
    // ========================================
    // REGIONAL METADATA (For Geographic Categories)
    // ========================================
    region?: Region[];          // NEW: East Africa, West Africa, etc.
    country?: string;           // NEW: Kenya, Nigeria, South Africa, etc.
    
    // ========================================
    // CATEGORY ENABLERS (Flags for Dynamic Categories)
    // ========================================
    featured?: boolean;         // Featured in hero carousel
    isOriginal?: boolean;       // Reel Afrika Original
    isExclusive?: boolean;      // Exclusive to platform
    isTrending?: boolean;       // Currently trending (can be manually set)
    
    // NEW: Award & Festival Flags
    hasWonAwards?: boolean;     // NEW: Enables "Award-Winning" category
    awardsList?: string[];      // NEW: ['AMVCA 2024', 'Cannes Selection']
    isFestivalSelection?: boolean;  // NEW: Enables "Festival Favorites"
    festivalsList?: string[];   // NEW: ['TIFF', 'Zanzibar Film Festival']
    
    // NEW: Thematic Flags
    voiceOfWomen?: boolean;     // NEW: Led by/about African women
    isDiaspora?: boolean;       // NEW: Diaspora stories
    
    // ========================================
    // Content Classification
    // ========================================
    tags?: string[];            // Freeform tags
    keywords?: string[];        // SEO keywords
    themes?: string[];          // NEW: ['urban', 'rural', 'heritage', 'youth', 'street']
    
    // ========================================
    // Episode-specific (TV/Miniseries/Podcast)
    // ========================================
    episodeTitle?: string;
    episodeDescription?: string;
    
    // ========================================
    // Music-specific
    // ========================================
    artist?: string;
    album?: string;
    
    // ========================================
    // Podcast-specific
    // ========================================
    host?: string;
    guests?: string[];
    topics?: string[];
    timestamps?: { time: number; label: string }[];
    
    [key: string]: any;
  };

  // ============================================================================
  // ANALYTICS & ACCESS
  // ============================================================================
  @Prop({ type: Number, default: 0, index: true })
  viewCount: number;

  @Prop({ type: Boolean, default: false })
  isPremium: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

// ============================================================================
// INDEXES (Performance Optimization)
// ============================================================================
ContentSchema.index({ uploaderId: 1, createdAt: -1 });
ContentSchema.index({ type: 1, status: 1 });
ContentSchema.index({ type: 1, isPremium: 1 });
ContentSchema.index({ status: 1, createdAt: -1 });
ContentSchema.index({ viewCount: -1, status: 1 });

// Featured & Special Content
ContentSchema.index({ 'metadata.featured': 1, status: 1 });
ContentSchema.index({ 'metadata.isOriginal': 1, status: 1 });
ContentSchema.index({ 'metadata.isExclusive': 1, status: 1 });
ContentSchema.index({ 'metadata.isTrending': 1, status: 1 });

// NEW: Category Enablers
ContentSchema.index({ 'metadata.hasWonAwards': 1, status: 1 });
ContentSchema.index({ 'metadata.isFestivalSelection': 1, status: 1 });
ContentSchema.index({ 'metadata.voiceOfWomen': 1, status: 1 });
ContentSchema.index({ 'metadata.isDiaspora': 1, status: 1 });

// Regional
ContentSchema.index({ 'metadata.region': 1, status: 1 });
ContentSchema.index({ 'metadata.country': 1, status: 1 });

// Genres
ContentSchema.index({ 'metadata.genre': 1, status: 1 });
ContentSchema.index({ 'metadata.musicGenre': 1, status: 1 });
ContentSchema.index({ 'metadata.podcastGenre': 1, status: 1 });

// Series
ContentSchema.index({ seriesId: 1, season: 1, episode: 1 });
ContentSchema.index({ 'series.title': 1, season: 1, episode: 1 });

// Full-text search
ContentSchema.index({ title: 'text', description: 'text' });

// Host assignment — NEW
ContentSchema.index({ hostSlug: 1, type: 1 });
ContentSchema.index({ hostId: 1, type: 1 });

// ============================================================================
// MIDDLEWARE: Auto-generate thumbnails & images
// ============================================================================
ContentSchema.pre('save', function(next) {
  const ACCOUNT_ID = '7a488e9b77e6c8630472a07003c7d8e4';
  
  // Auto-generate Stream thumbnail
  if (this.storage?.cloudflareStreamId && !this.storage.thumbnail) {
    this.storage.thumbnail = `https://customer-${ACCOUNT_ID}.cloudflarestream.com/${this.storage.cloudflareStreamId}/thumbnails/thumbnail.jpg`;
  }
  
  // Auto-populate images.poster from thumbnail if not set (FALLBACK ONLY)
  if (!this.images) this.images = {};
  if (this.storage?.thumbnail && !this.images.poster) {
    this.images.poster = this.storage.thumbnail;
  }
  
  next();
});

ContentSchema.pre('findOneAndUpdate', function(next) {
  const ACCOUNT_ID = '7a488e9b77e6c8630472a07003c7d8e4';
  const update = this.getUpdate() as any;
  
  if (update.$set?.['storage.cloudflareStreamId']) {
    const streamId = update.$set['storage.cloudflareStreamId'];
    update.$set['storage.thumbnail'] = `https://customer-${ACCOUNT_ID}.cloudflarestream.com/${streamId}/thumbnails/thumbnail.jpg`;
  }
  
  next();
});

// ============================================================================
// STATIC METHODS
// ============================================================================
ContentSchema.statics.findBySeries = async function(seriesTitle: string) {
  return this.find({
    'series.title': seriesTitle,
    status: 'ready'
  }).sort({ season: 1, episode: 1 });
};

ContentSchema.statics.getFeatured = async function(limit = 10) {
  return this.find({
    'metadata.featured': true,
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};

ContentSchema.statics.getOriginals = async function(limit = 20) {
  return this.find({
    'metadata.isOriginal': true,
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};

ContentSchema.statics.getByGenre = async function(genre: string, limit = 20) {
  return this.find({
    $or: [
      { 'metadata.genre': genre },
      { 'metadata.musicGenre': genre },
      { 'metadata.podcastGenre': genre },
    ],
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};

// NEW: Get Trending Content
ContentSchema.statics.getTrending = async function(limit = 20) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    status: 'ready',
    createdAt: { $gte: thirtyDaysAgo }
  })
  .sort({ viewCount: -1, createdAt: -1 })
  .limit(limit);
};

// NEW: Get by Region
ContentSchema.statics.getByRegion = async function(region: Region, limit = 20) {
  return this.find({
    'metadata.region': region,
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};

// NEW: Get Award-Winning Content
ContentSchema.statics.getAwardWinning = async function(limit = 20) {
  return this.find({
    'metadata.hasWonAwards': true,
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};

// NEW: Get Festival Favorites
ContentSchema.statics.getFestivalFavorites = async function(limit = 20) {
  return this.find({
    'metadata.isFestivalSelection': true,
    status: 'ready'
  }).limit(limit).sort({ createdAt: -1 });
};