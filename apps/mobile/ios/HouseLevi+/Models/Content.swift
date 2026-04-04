import Foundation

//  ContentType  exact enum from content.schema.ts 
enum ContentType: String, Codable {
    case minisode   = "minisode"
    case reelfilm   = "reelfilm"
    case tvEpisode  = "tv_episode"
    case movie      = "movie"
    case stagePlay  = "stage_play"
    case podcast    = "podcast"
    case music      = "music"
}

//  Nested Storage 
struct ContentStorage: Codable, Equatable {
    var originalUrl: String?
    var cloudflareStreamId: String?
    var cloudflareKey: String?
    var size: Int?
    var mimeType: String?
    var provider: String?
    var duration: Int?       // seconds
    var thumbnail: String?   // auto-generated from middleware

    private static let cfAccount = "7a488e9b77e6c8630472a07003c7d8e4"

    var hlsUrl: String? {
        guard let id = cloudflareStreamId else { return nil }
        return "https://customer-\(Self.cfAccount).cloudflarestream.com/\(id)/manifest/video.m3u8"
    }
    var dashUrl: String? {
        guard let id = cloudflareStreamId else { return nil }
        return "https://customer-\(Self.cfAccount).cloudflarestream.com/\(id)/manifest/video.mpd"
    }
    var thumbnailUrl: String? {
        if let t = thumbnail, !t.isEmpty { return t }
        guard let id = cloudflareStreamId else { return nil }
        return "https://customer-\(Self.cfAccount).cloudflarestream.com/\(id)/thumbnails/thumbnail.jpg"
    }

    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        originalUrl        = try? c.decodeIfPresent(String.self, forKey: .originalUrl)
        cloudflareStreamId = try? c.decodeIfPresent(String.self, forKey: .cloudflareStreamId)
        cloudflareKey      = try? c.decodeIfPresent(String.self, forKey: .cloudflareKey)
        size               = try? c.decodeIfPresent(Int.self,    forKey: .size)
        mimeType           = try? c.decodeIfPresent(String.self, forKey: .mimeType)
        provider           = try? c.decodeIfPresent(String.self, forKey: .provider)
        duration           = try? c.decodeIfPresent(Int.self,    forKey: .duration)
        thumbnail          = try? c.decodeIfPresent(String.self, forKey: .thumbnail)
    }
}

//  Nested Images 
struct ContentImages: Codable, Equatable {
    var poster: String?   // Portrait 2:3  PRIMARY for display
    var backdrop: String? // Landscape 16:9  hero banners
    var logo: String?     // Transparent PNG  title overlay

    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        poster   = try? c.decodeIfPresent(String.self, forKey: .poster)
        backdrop = try? c.decodeIfPresent(String.self, forKey: .backdrop)
        logo     = try? c.decodeIfPresent(String.self, forKey: .logo)
    }
}

//  SeriesInfo 
struct SeriesInfo: Codable, Equatable {
    var title: String        = ""
    var description: String  = ""
    var totalSeasons: Int    = 0
    var totalEpisodes: Int   = 0
    var genres: [String]     = []
    var rating: String?
    var releaseYear: Int?
    var isOriginal: Bool     = false
    var isExclusive: Bool    = false
    var images: ContentImages?

    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        title        = (try? c.decodeIfPresent(String.self,        forKey: .title))        ?? ""
        description  = (try? c.decodeIfPresent(String.self,        forKey: .description))  ?? ""
        totalSeasons = (try? c.decodeIfPresent(Int.self,           forKey: .totalSeasons))  ?? 0
        totalEpisodes = (try? c.decodeIfPresent(Int.self,          forKey: .totalEpisodes)) ?? 0
        genres       = (try? c.decodeIfPresent([String].self,      forKey: .genres))       ?? []
        rating       = try? c.decodeIfPresent(String.self,         forKey: .rating)
        releaseYear  = try? c.decodeIfPresent(Int.self,            forKey: .releaseYear)
        isOriginal   = (try? c.decodeIfPresent(Bool.self,          forKey: .isOriginal))   ?? false
        isExclusive  = (try? c.decodeIfPresent(Bool.self,          forKey: .isExclusive))  ?? false
        images       = try? c.decodeIfPresent(ContentImages.self,  forKey: .images)
    }
}

//  ContentMeta  exact metadata object 
struct ContentMeta: Codable, Equatable {
    // Cast & crew
    var cast: [String]?;       var director: String?
    var writer: String?;       var producer: String?

    // Genres  ALL ARRAYS
    var genre: [String]?       // Film genres
    var musicGenre: [String]?  // Music genres
    var podcastGenre: [String]?

    // Release
    var releaseYear: Int?;     var rating: String?
    var ratingReasons: [String]?

    // Language
    var language: String?;     var subtitles: [String]?

    // Regional  ARRAY of region strings
    var region: [String]?      // ["East Africa", "West Africa", ...]
    var country: String?

    // Category flags
    var featured: Bool?;           var isOriginal: Bool?
    var isExclusive: Bool?;        var isTrending: Bool?
    var hasWonAwards: Bool?;       var awardsList: [String]?
    var isFestivalSelection: Bool?; var festivalsList: [String]?
    var voiceOfWomen: Bool?;       var isDiaspora: Bool?

    // Tags
    var tags: [String]?;       var keywords: [String]?;  var themes: [String]?

    // Music
    var artist: String?;       var album: String?

    // Podcast
    var host: String?;         var guests: [String]?;    var topics: [String]?

    // Episode
    var episodeTitle: String?; var episodeDescription: String?

    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        cast             = try? c.decodeIfPresent([String].self, forKey: .cast)
        director         = try? c.decodeIfPresent(String.self,   forKey: .director)
        writer           = try? c.decodeIfPresent(String.self,   forKey: .writer)
        producer         = try? c.decodeIfPresent(String.self,   forKey: .producer)
        genre            = try? c.decodeIfPresent([String].self, forKey: .genre)
        musicGenre       = try? c.decodeIfPresent([String].self, forKey: .musicGenre)
        podcastGenre     = try? c.decodeIfPresent([String].self, forKey: .podcastGenre)
        releaseYear      = try? c.decodeIfPresent(Int.self,      forKey: .releaseYear)
        rating           = try? c.decodeIfPresent(String.self,   forKey: .rating)
        ratingReasons    = try? c.decodeIfPresent([String].self, forKey: .ratingReasons)
        language         = try? c.decodeIfPresent(String.self,   forKey: .language)
        subtitles        = try? c.decodeIfPresent([String].self, forKey: .subtitles)
        region           = try? c.decodeIfPresent([String].self, forKey: .region)
        country          = try? c.decodeIfPresent(String.self,   forKey: .country)
        featured         = try? c.decodeIfPresent(Bool.self,     forKey: .featured)
        isOriginal       = try? c.decodeIfPresent(Bool.self,     forKey: .isOriginal)
        isExclusive      = try? c.decodeIfPresent(Bool.self,     forKey: .isExclusive)
        isTrending       = try? c.decodeIfPresent(Bool.self,     forKey: .isTrending)
        hasWonAwards     = try? c.decodeIfPresent(Bool.self,     forKey: .hasWonAwards)
        awardsList       = try? c.decodeIfPresent([String].self, forKey: .awardsList)
        isFestivalSelection = try? c.decodeIfPresent(Bool.self,  forKey: .isFestivalSelection)
        festivalsList    = try? c.decodeIfPresent([String].self, forKey: .festivalsList)
        voiceOfWomen     = try? c.decodeIfPresent(Bool.self,     forKey: .voiceOfWomen)
        isDiaspora       = try? c.decodeIfPresent(Bool.self,     forKey: .isDiaspora)
        tags             = try? c.decodeIfPresent([String].self, forKey: .tags)
        keywords         = try? c.decodeIfPresent([String].self, forKey: .keywords)
        themes           = try? c.decodeIfPresent([String].self, forKey: .themes)
        artist           = try? c.decodeIfPresent(String.self,   forKey: .artist)
        album            = try? c.decodeIfPresent(String.self,   forKey: .album)
        host             = try? c.decodeIfPresent(String.self,   forKey: .host)
        guests           = try? c.decodeIfPresent([String].self, forKey: .guests)
        topics           = try? c.decodeIfPresent([String].self, forKey: .topics)
        episodeTitle     = try? c.decodeIfPresent(String.self,   forKey: .episodeTitle)
        episodeDescription = try? c.decodeIfPresent(String.self, forKey: .episodeDescription)
    }
}

//  ContentItem  the main model 
struct ContentItem: Codable, Identifiable, Equatable {
    var id: String
    var title: String
    var description: String
    var type: String            // matches ContentType.rawValue
    var status: String
    var storage: ContentStorage
    var images: ContentImages
    var series: SeriesInfo?
    var season: Int?
    var episode: Int?
    var seriesId: String?
    var metadata: ContentMeta
    var viewCount: Int
    var isPremium: Bool         // TOP-LEVEL field in schema
    var createdAt: String
    var updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, type, status
        case storage, images, series, season, episode, seriesId
        case metadata, viewCount, isPremium, createdAt, updatedAt
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id          = (try? c.decodeIfPresent(String.self,         forKey: .id))          ?? ""
        title       = (try? c.decodeIfPresent(String.self,         forKey: .title))       ?? ""
        description = (try? c.decodeIfPresent(String.self,         forKey: .description)) ?? ""
        type        = (try? c.decodeIfPresent(String.self,         forKey: .type))        ?? ""
        status      = (try? c.decodeIfPresent(String.self,         forKey: .status))      ?? "ready"
        storage     = (try? c.decodeIfPresent(ContentStorage.self, forKey: .storage))     ?? ContentStorage()
        images      = (try? c.decodeIfPresent(ContentImages.self,  forKey: .images))      ?? ContentImages()
        series      = try? c.decodeIfPresent(SeriesInfo.self,      forKey: .series)
        season      = try? c.decodeIfPresent(Int.self,             forKey: .season)
        episode     = try? c.decodeIfPresent(Int.self,             forKey: .episode)
        seriesId    = try? c.decodeIfPresent(String.self,          forKey: .seriesId)
        metadata    = (try? c.decodeIfPresent(ContentMeta.self,    forKey: .metadata))    ?? ContentMeta()
        viewCount   = (try? c.decodeIfPresent(Int.self,            forKey: .viewCount))   ?? 0
        isPremium   = (try? c.decodeIfPresent(Bool.self,           forKey: .isPremium))   ?? false
        createdAt   = (try? c.decodeIfPresent(String.self,         forKey: .createdAt))   ?? ""
        updatedAt   = (try? c.decodeIfPresent(String.self,         forKey: .updatedAt))   ?? ""
    }

    //  Computed display helpers 

    // Thumbnail: images.poster  storage auto-thumbnail
    var thumbnail: String {
        images.poster ?? storage.thumbnailUrl ?? ""
    }

    // Hero backdrop: images.backdrop  poster fallback
    var backdropUrl: String {
        images.backdrop ?? images.poster ?? storage.thumbnailUrl ?? ""
    }

    // HLS stream URL (Cloudflare Stream)
    var hlsUrl: String? { storage.hlsUrl }

    // Duration from storage
    var durationSeconds: Int { storage.duration ?? 0 }

    var displayDuration: String {
        let m = durationSeconds / 60; let s = durationSeconds % 60
        if durationSeconds == 0 { return "" }
        if m >= 60 { return "\(m / 60)h \(m % 60)m" }
        return "\(m)m \(s)s"
    }

    // Primary genre for display
    var primaryGenre: String {
        metadata.genre?.first ?? metadata.musicGenre?.first ?? metadata.podcastGenre?.first ?? ""
    }

    // Primary region
    var primaryRegion: String { metadata.region?.first ?? "" }

    // Content type helpers
    var isVideo: Bool  { ["reelfilm", "tv_episode", "movie", "stage_play", "minisode"].contains(type) }
    var isAudio: Bool  { ["podcast", "music"].contains(type) }
    var isSeries: Bool { type == "tv_episode" && series != nil }
}

//  API response wrappers (unchanged from Session 2) 
struct ContentCategory: Codable, Identifiable {
    var id: String { slug }
    var name: String = ""; var slug: String = ""; var content: [ContentItem] = []
}
struct HomeScreenResponse: Codable { var success: Bool = false; var data: HomeScreenData? }
struct HomeScreenData: Codable { var categories: [ContentCategory] = [] }
struct ContentListResponse: Codable { var success: Bool = false; var data: [ContentItem] = [] }
struct ContentItemResponse: Codable { var success: Bool = false; var data: ContentItem? }
struct PlaybackResponse: Codable { var success: Bool = false; var message: String?; var activeStreams: Int? }
struct LinearTvBlock: Codable, Equatable {
    var title: String = ""; var description: String = ""; var thumbnailUrl: String = ""
    var streamUrl: String = ""; var startTime: String = ""; var endTime: String = ""; var category: String = ""
    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        title        = (try? c.decodeIfPresent(String.self, forKey: .title))        ?? ""
        description  = (try? c.decodeIfPresent(String.self, forKey: .description))  ?? ""
        thumbnailUrl = (try? c.decodeIfPresent(String.self, forKey: .thumbnailUrl)) ?? ""
        streamUrl    = (try? c.decodeIfPresent(String.self, forKey: .streamUrl))    ?? ""
        startTime    = (try? c.decodeIfPresent(String.self, forKey: .startTime))    ?? ""
        endTime      = (try? c.decodeIfPresent(String.self, forKey: .endTime))      ?? ""
        category     = (try? c.decodeIfPresent(String.self, forKey: .category))     ?? ""
    }
}
struct LinearTvResponse: Codable {
    var success: Bool = false; var nowPlaying: LinearTvBlock?; var data: LinearTvBlock?
    var block: LinearTvBlock? { nowPlaying ?? data }
}
