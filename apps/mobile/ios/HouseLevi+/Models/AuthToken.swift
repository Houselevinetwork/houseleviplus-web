import Foundation

struct AuthResponse: Codable {
    let success: Bool; let message: String?; let user: User?
    let token: String?; let accessToken: String?
    let refreshToken: String?; let expiresIn: Int?
    var resolvedAccessToken: String { accessToken ?? token ?? "" }
}
struct AuthToken { let accessToken: String; let refreshToken: String; let expiresIn: Int }
struct LoginRequest: Codable { let email: String; let password: String }
struct RefreshRequest: Codable { let refreshToken: String }
struct OtpRequest: Codable {
    let email: String; let purpose: String
    init(email: String, purpose: String = "login") { self.email = email; self.purpose = purpose }
}
struct OtpVerifyRequest: Codable { let email: String; let otp: String }
struct GenericResponse: Codable { let success: Bool; let message: String?; let error: String? }
struct AuthMeResponse: Codable { let success: Bool; let user: User?; let error: String? }
