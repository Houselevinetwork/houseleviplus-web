import Foundation

extension HLAPIClient {
    func getHome(limit: Int = 10) async throws -> HomeScreenResponse {
        try await request(method: "GET", path: "api/content/home?limit=\(limit)")
    }
    func getFeatured(limit: Int = 10) async throws -> ContentListResponse {
        try await request(method: "GET", path: "api/content/featured?limit=\(limit)")
    }
    func getTrending(limit: Int = 20) async throws -> ContentListResponse {
        try await request(method: "GET", path: "api/content/trending?limit=\(limit)")
    }
    func getOriginals(limit: Int = 20) async throws -> ContentListResponse {
        try await request(method: "GET", path: "api/content/originals?limit=\(limit)")
    }
    func getContentById(id: String) async throws -> ContentItemResponse {
        try await request(method: "GET", path: "api/content/\(id)", requiresAuth: true)
    }
    func getByGenre(genre: String, limit: Int = 20) async throws -> ContentListResponse {
        let enc = genre.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? genre
        return try await request(method: "GET", path: "api/content/genre/\(enc)?limit=\(limit)")
    }
    func getNowPlaying() async throws -> LinearTvResponse {
        try await request(method: "GET", path: "linear-tv/now-playing")
    }
    func startPlayback(contentId: String) async throws -> PlaybackResponse {
        struct B: Encodable { let contentId: String }
        return try await request(method: "POST", path: "api/playback/start", body: B(contentId: contentId), requiresAuth: true)
    }
    func stopPlayback() async throws -> PlaybackResponse {
        struct E: Encodable {}
        return try await request(method: "POST", path: "api/playback/stop", body: E(), requiresAuth: true)
    }
    func heartbeat(contentId: String, position: Double) async throws -> PlaybackResponse {
        struct H: Encodable { let contentId: String; let position: Double }
        return try await request(method: "POST", path: "api/playback/heartbeat", body: H(contentId: contentId, position: position), requiresAuth: true)
    }
}
