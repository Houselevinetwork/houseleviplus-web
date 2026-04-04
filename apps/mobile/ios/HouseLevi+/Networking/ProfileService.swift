import Foundation

extension HLAPIClient {
    func getMe(auth: String) async throws -> ProfileResponse {
        try await request(method: "GET", path: "auth/me", authToken: auth)
    }
    func getDevices(auth: String) async throws -> DevicesResponse {
        try await request(method: "GET", path: "auth/devices", authToken: auth)
    }
    func removeDevice(auth: String, deviceId: String) async throws {
        let _: [String: String] = try await request(method: "DELETE", path: "auth/devices/\(deviceId)", authToken: auth)
    }
    func getSessions(auth: String) async throws -> SessionsResponse {
        try await request(method: "GET", path: "auth/sessions", authToken: auth)
    }
    func revokeSession(auth: String, sessionId: String) async throws {
        let _: [String: String] = try await request(method: "POST", path: "auth/sessions/\(sessionId)/revoke", authToken: auth)
    }
    func logout(auth: String) async throws {
        let _: [String: String] = try await request(method: "POST", path: "auth/logout", authToken: auth)
    }
}
