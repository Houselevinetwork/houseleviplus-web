// api/src/modules/content/content.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Logger,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
  Post,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { UpdateContentDto } from './dtos/update-content.dto';
import { JwtAuthGuard } from '../../user-and-monetization/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../user-and-monetization/auth/guards/optional-jwt-auth.guard';
import { SubscriptionGuard } from '../../user-and-monetization/auth/guards/subscription.guard';
import { RolesGuard } from '../../user-and-monetization/auth/guards/roles.guard';
import { Roles } from '../../user-and-monetization/auth/decorators/roles.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Content, Region } from './schemas/content.schema';
import { Host } from './schemas/host.schema';

function slugToContentType(slug: string): string {
  const map: Record<string, string> = {
    'stage-play':  'stage_play',
    'stage_play':  'stage_play',
    'tv-episode':  'tv_episode',
    'tv_episode':  'tv_episode',
    'reelfilm':    'reelfilm',
    'minisode':    'minisode',
    'podcast':     'podcast',
    'music':       'music',
    'movie':       'movie',
    'short':       'short',
    'sport':       'sport',
    'documentary': 'documentary',
    'series':      'series',
    'kids':        'kids',
  };
  return map[slug.toLowerCase()] ?? slug;
}

@Controller('api/content')
export class ContentController {
  private readonly logger = new Logger(ContentController.name);

  constructor(
    private contentService: ContentService,
    @InjectModel(Content.name) private contentModel: Model<Content>,
    @InjectModel(Host.name)    private hostModel:    Model<Host>,
  ) {}

  // ============================================================================
  // DEBUG (ADMIN — TEMP)
  // ============================================================================

  @Get('debug/:id')
  async debugContent(@Param('id') id: string) {
    try {
      const content = await this.contentModel.findById(id).lean();
      return { found: !!content, content, collection: this.contentModel.collection.name };
    } catch (error) { return { found: false, error: error.message }; }
  }

  @Get('debug/list/all')
  async debugListAll(@Query('limit') limit?: string, @Query('type') type?: string) {
    try {
      const limitNum = parseInt(limit || '20', 10);
      const filter: any = {};
      if (type) filter.type = type;
      const contents = await this.contentModel.find(filter).limit(limitNum).sort({ createdAt: -1 }).lean();
      return { count: contents.length, collection: this.contentModel.collection.name, filter, contents };
    } catch (error) { return { error: error.message }; }
  }

  @Get('debug/types/stats')
  async debugTypeStats() {
    try {
      const stats = await this.contentModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 }, statuses: { $addToSet: '$status' } } },
      ]);
      return {
        collection: this.contentModel.collection.name,
        typeStats: stats,
        totalDocuments: await this.contentModel.countDocuments(),
      };
    } catch (error) { return { error: error.message }; }
  }

  // ============================================================================
  // WATCH PAGE — PUBLIC ENDPOINTS
  // ============================================================================

  @Get('hero')
  @UseGuards(OptionalJwtAuthGuard)
  async getHero() {
    try {
      let hero = await this.contentModel
        .findOne({ isFeatured: true, status: 'ready', isPremium: { $ne: true } }).lean().exec();
      if (!hero)
        hero = await this.contentModel
          .findOne({ status: 'ready', isPremium: { $ne: true }, 'images.backdrop': { $exists: true, $ne: '' } })
          .sort({ createdAt: -1 }).lean().exec();
      if (!hero)
        hero = await this.contentModel
          .findOne({ status: 'ready', isPremium: { $ne: true } }).sort({ createdAt: -1 }).lean().exec();
      return { success: true, item: hero ? this.formatForWatch(hero) : null };
    } catch (error) {
      this.logger.error(`getHero failed: ${error.message}`);
      return { success: false, item: null };
    }
  }

  @Get('hosts')
  async getHosts() {
    try {
      const hosts = await this.hostModel
        .find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean().exec();
      return { success: true, hosts };
    } catch (error) {
      this.logger.error(`getHosts failed: ${error.message}`);
      return { success: false, hosts: [] };
    }
  }

  @Get('hosts/:slug')
  async getHostDetail(@Param('slug') slug: string) {
    const host = await this.hostModel.findOne({ slug, isActive: true }).lean();
    if (!host) throw new NotFoundException(`Host "${slug}" not found`);

    const allContent = await this.contentModel
      .find({ hostSlug: slug, status: 'ready' })
      .select('_id title type duration displayDuration isPremium isNewContent isFeatured slug images storage')
      .sort({ createdAt: -1 })
      .lean();

    const CATEGORIES: Record<string, string> = {
      tv_episode: 'Episodes',
      movie:      'Movies',
      stage_play: 'Stage Plays',
      minisode:   'Minisodes',
      reelfilm:   'Shorts',
      podcast:    'Podcasts',
      music:      'Music',
    };

    const contentByCategory: Record<string, any[]> = {};
    for (const type of Object.keys(CATEGORIES)) {
      const items = allContent.filter(c => c.type === type).map(i => this.formatForWatch(i));
      if (items.length) contentByCategory[type] = items;
    }

    return { host, contentByCategory, totalCount: allContent.length, categoryLabels: CATEGORIES };
  }

  @Get('watch-categories')
  async getWatchCategories() {
    const categories = [
      { _id: 'all',        label: 'All',        slug: 'all' },
      { _id: 'podcast',    label: 'Podcasts',    slug: 'podcast' },
      { _id: 'stage_play', label: 'Stage Plays', slug: 'stage_play' },
      { _id: 'movie',      label: 'Movies',      slug: 'movie' },
      { _id: 'tv_episode', label: 'TV Shows',    slug: 'tv_episode' },
      { _id: 'reelfilm',   label: 'Shorts',      slug: 'reelfilm' },
      { _id: 'music',      label: 'Music',       slug: 'music' },
      { _id: 'minisode',   label: 'Minisodes',   slug: 'minisode' },
    ];
    return { success: true, categories };
  }

  @Get('latest-episodes')
  @UseGuards(OptionalJwtAuthGuard)
  async getLatestEpisodes(
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('type') type?: string,
  ) {
    try {
      const filter: any = { status: 'ready', isPremium: { $ne: true } };
      if (type) filter.type = slugToContentType(type);
      const items = await this.contentModel
        .find(filter).sort({ createdAt: -1 }).limit(limit).lean().exec();
      return { success: true, items: items.map(i => this.formatForWatch(i)) };
    } catch (error) {
      this.logger.error(`getLatestEpisodes failed: ${error.message}`);
      return { success: false, items: [] };
    }
  }

  @Get('continue-watching')
  @UseGuards(OptionalJwtAuthGuard)
  async getContinueWatching(
    @Request() req,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
  ) {
    try {
      if (!req.user) return { success: true, items: [] };
      return { success: true, items: [] };
    } catch { return { success: false, items: [] }; }
  }

  // ============================================================================
  // NETFLIX-STYLE CATEGORY ENDPOINTS
  // ============================================================================

  @Get('home')
  @UseGuards(OptionalJwtAuthGuard)
  async getHomeScreen(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    try {
      const base = { status: 'ready', isPremium: { $ne: true } };
      const [
        originals, trending, newContent, shortFilms, awardWinning,
        eastAfrica, urbanAfrica, voicesOfWomen, soundsOfAfrika, trueStories,
      ] = await Promise.all([
        this.contentService.findAll({ ...base, 'metadata.isOriginal': true }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, { limit, sort: { viewCount: -1 } }),
        this.contentService.findAll({ ...base, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, type: 'reelfilm' }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, 'metadata.hasWonAwards': true }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, 'metadata.region': Region.EAST_AFRICA }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, 'metadata.themes': 'urban' }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, 'metadata.voiceOfWomen': true }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, type: 'music' }, { limit, sort: { createdAt: -1 } }),
        this.contentService.findAll({ ...base, $or: [{ 'metadata.genre': 'Documentary' }, { 'metadata.podcastGenre': 'Documentary' }] }, { limit, sort: { createdAt: -1 } }),
      ]);
      return {
        success: true,
        data: {
          categories: [
            { name: 'Reel Afrika Originals',        slug: 'originals',          content: originals },
            { name: 'Trending Across Afrika',        slug: 'trending',           content: trending },
            { name: 'New on Reel Afrika',            slug: 'new',                content: newContent },
            { name: 'Short Films & Shorts',          slug: 'short-films',        content: shortFilms },
            { name: 'Award-Winning African Stories', slug: 'award-winning',      content: awardWinning },
            { name: 'Stories from East Africa',      slug: 'region/East Africa', content: eastAfrica },
            { name: 'Urban Africa',                  slug: 'urban-africa',       content: urbanAfrica },
            { name: 'Voices of Women',               slug: 'voices-of-women',    content: voicesOfWomen },
            { name: 'Sounds of Afrika',              slug: 'sounds-of-afrika',   content: soundsOfAfrika },
            { name: 'True African Stories',          slug: 'true-stories',       content: trueStories },
          ],
        },
      };
    } catch (error) {
      this.logger.error(`getHomeScreen failed: ${error.message}`, error.stack);
      return { success: false, error: 'Failed to load home screen' };
    }
  }

  @Get('categories/originals')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryOriginals(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip = (page - 1) * limit;
    const filter = { 'metadata.isOriginal': true, status: 'ready', isPremium: { $ne: true } };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Reel Afrika Originals', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/trending')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryTrending(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, createdAt: { $gte: thirtyDaysAgo } };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { viewCount: -1, createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Trending Across Afrika', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/new')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryNew(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, createdAt: { $gte: thirtyDaysAgo } };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'New on Reel Afrika', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/short-films')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryShortFilms(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, type: 'reelfilm' };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Short Films & Shorts', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/award-winning')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryAwardWinning(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.hasWonAwards': true };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Award-Winning African Stories', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/region/:region')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryByRegion(@Param('region') region: string, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.region': region };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: `Stories from ${region}`, content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/voices-of-women')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryVoicesOfWomen(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.voiceOfWomen': true };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Voices of Women', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/urban-africa')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryUrbanAfrica(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.themes': 'urban' };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Urban Africa', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/diaspora')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryDiaspora(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.isDiaspora': true };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Diaspora Stories', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/festival-favorites')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategoryFestivalFavorites(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, 'metadata.isFestivalSelection': true };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Festival Favorites', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  @Get('categories/sounds-of-afrika')
  @UseGuards(OptionalJwtAuthGuard)
  async getCategorySoundsOfAfrika(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number) {
    const skip    = (page - 1) * limit;
    const filter  = { status: 'ready', isPremium: { $ne: true }, type: 'music' };
    const content = await this.contentService.findAll(filter, { limit, skip, sort: { createdAt: -1 } });
    const total   = await this.contentService.count(filter);
    return { success: true, data: { category: 'Sounds of Afrika', content, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
  }

  // ============================================================================
  // PUBLIC — LIST / SEARCH / FEATURED
  // ============================================================================

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async listContent(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('genre') genre?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('original') original?: string,
    @Query('exclusive') exclusive?: string,
  ) {
    try {
      const pageNum  = parseInt(page  || '1',  10);
      const limitNum = parseInt(limit || '50', 10);
      this.logger.log(`Public content listing: type=${type || 'all'}, genre=${genre || 'all'}`);

      const filters: any = { status: 'ready', isPremium: { $ne: true } };
      if (type)                 filters.type                      = slugToContentType(type);
      if (genre)                filters['metadata.genre']         = genre;
      if (featured  === 'true') filters['metadata.featured']      = true;
      if (original  === 'true') filters['metadata.isOriginal']    = true;
      if (exclusive === 'true') filters['metadata.isExclusive']   = true;
      if (search)               filters.$text                     = { $search: search };

      const result = await this.contentService.list({ page: pageNum, limit: limitNum, filters });
      return {
        success: true,
        data:  { data: result.data, total: result.total, page: pageNum, limit: limitNum },
        items: result.data.map(i => this.formatForWatch(i)),
      };
    } catch (error) {
      this.logger.error(`Failed to list content: ${error.message}`, error.stack);
      return { success: false, error: 'Failed to retrieve content', items: [] };
    }
  }

  @Get('featured')
  async getFeaturedContent(@Query('limit') limit?: string) {
    try {
      const limitNum = parseInt(limit || '10', 10);
      const featured = await this.contentService.findAll(
        { 'metadata.featured': true, status: 'ready', isPremium: { $ne: true } },
        { limit: limitNum, sort: { createdAt: -1 } },
      );
      return { success: true, data: featured, items: featured.map(i => this.formatForWatch(i)) };
    } catch (error) {
      this.logger.error(`Failed to get featured: ${error.message}`, error.stack);
      return { success: false, error: 'Failed to retrieve featured content', items: [] };
    }
  }

  @Get('originals')
  async getOriginals(@Query('limit') limit?: string) {
    try {
      const limitNum  = parseInt(limit || '20', 10);
      const originals = await this.contentService.findAll(
        { 'metadata.isOriginal': true, status: 'ready', isPremium: { $ne: true } },
        { limit: limitNum, sort: { createdAt: -1 } },
      );
      return { success: true, data: originals };
    } catch (error) { return { success: false, error: 'Failed to retrieve originals' }; }
  }

  @Get('exclusive')
  async getExclusive(@Query('limit') limit?: string) {
    try {
      const limitNum  = parseInt(limit || '20', 10);
      const exclusive = await this.contentService.findAll(
        { 'metadata.isExclusive': true, status: 'ready', isPremium: { $ne: true } },
        { limit: limitNum, sort: { createdAt: -1 } },
      );
      return { success: true, data: exclusive };
    } catch (error) { return { success: false, error: 'Failed to retrieve exclusive content' }; }
  }

  @Get('trending')
  async getTrending(@Query('limit') limit?: string) {
    try {
      const limitNum = parseInt(limit || '20', 10);
      const trending = await this.contentService.findAll(
        { 'metadata.isTrending': true, status: 'ready', isPremium: { $ne: true } },
        { limit: limitNum, sort: { viewCount: -1 } },
      );
      return { success: true, data: trending };
    } catch (error) { return { success: false, error: 'Failed to retrieve trending' }; }
  }

  @Get('genre/:genre')
  async getByGenre(@Param('genre') genre: string, @Query('limit') limit?: string) {
    try {
      const limitNum = parseInt(limit || '20', 10);
      const content  = await this.contentService.findAll(
        { status: 'ready', isPremium: { $ne: true }, $or: [{ 'metadata.genre': genre }, { 'metadata.musicGenre': genre }, { 'metadata.podcastGenre': genre }] },
        { limit: limitNum, sort: { createdAt: -1 } },
      );
      return { success: true, data: content, genre };
    } catch (error) { return { success: false, error: 'Failed to retrieve by genre' }; }
  }

  @Get('series/:seriesTitle')
  async getSeriesEpisodes(@Param('seriesTitle') seriesTitle: string, @Query('season') season?: string) {
    try {
      const filters: any = { 'series.title': seriesTitle, status: 'ready', isPremium: { $ne: true } };
      if (season) filters.season = parseInt(season, 10);
      const episodes = await this.contentService.findAll(filters, { sort: { season: 1, episode: 1 } });
      const seasons: any = {};
      episodes.forEach(ep => {
        const s = ep.season || 1;
        if (!seasons[s]) seasons[s] = [];
        seasons[s].push(ep);
      });
      return { success: true, data: { seriesTitle, seriesInfo: episodes[0]?.series || null, totalEpisodes: episodes.length, seasons } };
    } catch (error) { return { success: false, error: 'Failed to retrieve series' }; }
  }

  // ============================================================================
  // ADMIN — HOST CRUD & CONTENT ASSIGNMENT
  // ============================================================================

  @Get('admin/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async adminSearchContent(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('unassigned') unassigned?: string,
    @Query('limit') limit = '24',
  ) {
    const filter: any = {};
    if (q) filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { slug:  { $regex: q, $options: 'i' } },
    ];
    if (type)                  filter.type     = slugToContentType(type);
    if (unassigned === 'true') filter.hostSlug = null;

    const items = await this.contentModel
      .find(filter)
      .select('_id title type status hostSlug hostName slug images storage')
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    return {
      items: items.map(i => ({
        _id:         String((i as any)._id),
        title:       (i as any).title,
        type:        (i as any).type,
        status:      (i as any).status,
        hostSlug:    (i as any).hostSlug ?? null,
        hostName:    (i as any).hostName ?? null,
        slug:        (i as any).slug ?? '',
        thumbnailUrl:(i as any).images?.backdrop || (i as any).storage?.thumbnail || (i as any).images?.poster || '',
      })),
    };
  }

  @Get('admin/series')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async adminListSeries() {
    const results = await this.contentModel.aggregate([
      { $match: { type: 'tv_episode', 'series.title': { $exists: true, $ne: '' } } },
      { $group: {
          _id:           '$seriesId',
          title:         { $first: '$series.title' },
          totalEpisodes: { $sum: 1 },
          latestEp:      { $max: '$createdAt' },
      }},
      { $sort: { latestEp: -1 } },
    ]);
    return {
      series: results.map(r => ({
        seriesId:      r._id,
        title:         r.title,
        totalEpisodes: r.totalEpisodes,
      })),
    };
  }

  @Get('admin/hosts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async adminListHosts() {
    const hosts = await this.hostModel
      .find({}).sort({ sortOrder: 1, name: 1 }).lean().exec();
    return { success: true, hosts };
  }

  @Get('admin/hosts/:slug/detail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async getAdminHostDetail(@Param('slug') slug: string) {
    const host = await this.hostModel.findOne({ slug }).lean();
    if (!host) throw new NotFoundException(`Host "${slug}" not found`);

    const allContent = await this.contentModel
      .find({ hostSlug: slug })
      .select('_id title type status duration displayDuration isPremium isNewContent isFeatured slug createdAt images storage')
      .sort({ type: 1, createdAt: -1 })
      .lean();

    const byCategory: Record<string, any[]> = {};
    for (const item of allContent) {
      if (!byCategory[(item as any).type]) byCategory[(item as any).type] = [];
      byCategory[(item as any).type].push({
        _id:         String((item as any)._id),
        title:       (item as any).title,
        type:        (item as any).type,
        status:      (item as any).status,
        isPremium:   (item as any).isPremium ?? false,
        isNew:       (item as any).isNewContent ?? false,
        isFeatured:  (item as any).isFeatured ?? false,
        slug:        (item as any).slug ?? '',
        thumbnailUrl:(item as any).images?.backdrop || (item as any).storage?.thumbnail || (item as any).images?.poster || '',
        posterUrl:   (item as any).images?.poster   || (item as any).storage?.thumbnail || '',
      });
    }

    return { host, contentByCategory: byCategory, totalCount: allContent.length };
  }

  @Post('admin/hosts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async createHost(
    @Body() body: { name: string; slug: string; bio?: string; avatarUrl?: string; bannerUrl?: string; sortOrder?: number },
  ) {
    const host = await this.hostModel.create(body);
    return { success: true, host };
  }

  @Patch('admin/hosts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async updateHost(@Param('id') id: string, @Body() body: Partial<Host>) {
    const host = await this.hostModel.findByIdAndUpdate(id, { $set: body }, { new: true });
    return { success: true, data: host };
  }

  @Patch('admin/hosts/:hostSlug/assign-bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async bulkAssignToHost(
    @Param('hostSlug') hostSlug: string,
    @Body() body: { contentIds: string[] },
  ) {
    const host = await this.hostModel.findOne({ slug: hostSlug }).lean();
    if (!host) throw new NotFoundException(`Host "${hostSlug}" not found`);
    await this.contentModel.updateMany(
      { _id: { $in: body.contentIds.map(id => new Types.ObjectId(id)) } },
      { $set: { hostSlug, hostId: (host as any)._id, hostName: host.name } },
    );
    return { success: true, assigned: body.contentIds.length };
  }

  @Delete('admin/hosts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async deleteHost(@Param('id') id: string) {
    await this.hostModel.findByIdAndDelete(id);
    return { success: true };
  }

  @Patch('admin/content/:contentId/host')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async assignContentToHost(
    @Param('contentId') contentId: string,
    @Body() body: { hostSlug: string | null; hostId: string | null },
  ) {
    const update: any = {
      hostSlug: body.hostSlug ?? null,
      hostId:   body.hostId ? new Types.ObjectId(body.hostId) : null,
    };
    if (body.hostSlug) {
      const host = await this.hostModel.findOne({ slug: body.hostSlug }).lean();
      update.hostName = host ? host.name : null;
    } else {
      update.hostName = null;
    }
    const updated = await this.contentModel
      .findByIdAndUpdate(contentId, { $set: update }, { new: true }).lean();
    if (!updated) throw new NotFoundException('Content not found');
    return { success: true, data: updated };
  }

  @Patch('admin/content/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async updateContentStatus(
    @Param('id') id: string,
    @Body() body: { status: 'draft' | 'processing' | 'ready' | 'error' },
  ) {
    const VALID = ['draft', 'processing', 'ready', 'error'];
    if (!VALID.includes(body.status))
      throw new BadRequestException(`status must be one of: ${VALID.join(', ')}`);
    const updated = await this.contentModel
      .findByIdAndUpdate(id, { $set: { status: body.status } }, { new: true }).lean();
    if (!updated) throw new NotFoundException('Content not found');
    return { success: true, data: { _id: id, status: (updated as any).status } };
  }

  @Patch('admin/content/:id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async updateContentImages(
    @Param('id') id: string,
    @Body() body: { poster?: string; backdrop?: string },
  ) {
    const setFields: Record<string, string> = {};
    if (body.poster   !== undefined) setFields['images.poster']   = body.poster;
    if (body.backdrop !== undefined) setFields['images.backdrop'] = body.backdrop;
    if (!Object.keys(setFields).length)
      throw new BadRequestException('Provide at least one of: poster, backdrop');
    const updated = await this.contentModel
      .findByIdAndUpdate(id, { $set: setFields }, { new: true }).lean();
    if (!updated) throw new NotFoundException('Content not found');
    return {
      success: true,
      data: {
        _id:         id,
        posterUrl:   (updated as any).images?.poster   || '',
        backdropUrl: (updated as any).images?.backdrop || '',
      },
    };
  }

  @Patch('admin/:id/feature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async setFeaturedHero(@Param('id') id: string) {
    await this.contentModel.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    const content = await this.contentModel.findByIdAndUpdate(id, { $set: { isFeatured: true } }, { new: true });
    return { success: true, data: content };
  }

  @Patch('admin/:id/premium')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async togglePremium(@Param('id') id: string, @Body() body: { isPremium: boolean }) {
    const content = await this.contentModel.findByIdAndUpdate(
      id, { $set: { isPremium: body.isPremium } }, { new: true },
    );
    return { success: true, data: content };
  }

  // ============================================================================
  // WATCH DETAIL — public endpoint, resolves by slug or ObjectId
  // ============================================================================

  @Get('watch/:slugOrId')
  @UseGuards(OptionalJwtAuthGuard)
  async getWatchDetail(@Param('slugOrId') slugOrId: string, @Request() req) {
    try {
      let content = await this.contentModel
        .findOne({ slug: slugOrId, status: 'ready' }).lean();
      if (!content) {
        content = await this.contentModel.findById(slugOrId).lean().catch(() => null);
      }
      if (!content) return { success: false, error: 'Content not found' };
      await this.contentService.incrementViewCount(String((content as any)._id));
      return { success: true, data: this.formatForWatch(content as any) };
    } catch (error) {
      this.logger.error(`Watch detail failed: ${error.message}`);
      return { success: false, error: 'Content not found' };
    }
  }

  // ============================================================================
  // GENERIC CRUD — :id routes MUST stay last
  // ============================================================================

  @Get(':id')
  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  async getContent(@Param('id') contentId: string, @Request() req) {
    try {
      const content = await this.contentService.findById(contentId);
      if (content.status !== 'ready') throw new ForbiddenException('Content not available yet');
      await this.contentService.incrementViewCount(contentId);
      this.logger.log(`Content accessed: ${contentId} by user ${req.user.userId}`);
      return { success: true, data: this.formatForWatch(content as any) };
    } catch (error) {
      this.logger.error(`Failed to get content: ${error.message}`, error.stack);
      return { success: false, error: 'Content not found' };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async updateContent(@Param('id') contentId: string, @Body() updateContentDto: UpdateContentDto, @Request() req) {
    try {
      const content = await this.contentService.update(contentId, updateContentDto);
      return { success: true, data: content, message: 'Content updated' };
    } catch (error) {
      this.logger.error(`Failed to update: ${error.message}`, error.stack);
      return { success: false, error: 'Failed to update content' };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  async deleteContent(@Param('id') contentId: string) {
    try {
      await this.contentService.delete(contentId);
      return { success: true, message: 'Content deleted' };
    } catch (error) { return { success: false, error: 'Failed to delete content' }; }
  }

  @Post(':id/increment-view')
  @UseGuards(OptionalJwtAuthGuard)
  async incrementView(@Param('id') id: string) {
    await this.contentService.incrementViewCount(id);
    return { success: true };
  }

  // ============================================================================
  // PRIVATE HELPER
  // ============================================================================
  private formatForWatch(doc: any) {
    return {
      _id:             String(doc._id),
      title:           doc.title,
      type:            doc.type,
      status:          doc.status,
      slug:            doc.slug || String(doc._id),
      thumbnailUrl:    doc.images?.backdrop || doc.storage?.thumbnail || doc.images?.poster || '',
      posterUrl:       doc.images?.poster   || doc.storage?.thumbnail || '',
      isPremium:       doc.isPremium    ?? false,
      isNew:           doc.isNewContent ?? false,
      isNewContent:    doc.isNewContent ?? false,
      isFeatured:      doc.isFeatured   ?? false,
      displayDuration: doc.displayDuration || '',
      year:            doc.metadata?.releaseYear ?? null,
      duration:        doc.displayDuration || (doc.storage?.duration ? `${Math.floor(doc.storage.duration / 60)}m` : ''),
      genre:           Array.isArray(doc.metadata?.genre) ? doc.metadata.genre[0] : (doc.metadata?.genre ?? ''),
      showName:        doc.series?.title  || doc.metadata?.host || '',
      hostName:        doc.hostName       || doc.metadata?.host || '',
      hostSlug:        doc.hostSlug       ?? null,
      description:     doc.description    || '',
      images:          doc.images         ?? {},
      // Full storage object — originalUrl included for public R2 content.
      // For premium content, gate this behind GET /api/content/:id/play instead.
      storage: {
        originalUrl:        doc.storage?.originalUrl        ?? '',
        thumbnail:          doc.storage?.thumbnail          ?? '',
        duration:           doc.storage?.duration           ?? 0,
        mimeType:           doc.storage?.mimeType           ?? '',
        cloudflareStreamId: doc.storage?.cloudflareStreamId ?? '',
        cloudflareKey:      doc.storage?.cloudflareKey      ?? '',
        provider:           doc.storage?.provider           ?? '',
        size:               doc.storage?.size               ?? 0,
      },
      metadata:  doc.metadata ?? {},
      series:    doc.series   ?? null,
      season:    doc.season   ?? null,
      episode:   doc.episode  ?? null,
      viewCount: doc.viewCount ?? 0,
    };
  }
}