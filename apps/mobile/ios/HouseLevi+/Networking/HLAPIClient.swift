import Foundation

class HLAPIClient {
    static let shared = HLAPIClient()
    private let baseURL = "https://api.houselevi.com/"
    // Local dev: "http://localhost:3000/"

    private init() {}

    func request<T: Decodable>(
        method: String,
        path: String,
        body: (any Encodable)? = nil,
        authToken: String? = nil,
    ) async throws -> T {
        guard let url = URL(string: baseURL + path) else {
            throw URLError(.badURL)
        }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let auth = authToken {
            req.setValue("Bearer \(auth)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            req.httpBody = try JSONEncoder().encode(body)
        }
        let (data, _) = try await URLSession.shared.data(for: req)
        return try JSONDecoder().decode(T.self, from: data)
    }
}
