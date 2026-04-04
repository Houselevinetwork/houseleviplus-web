import Foundation

struct Device: Codable, Identifiable, Equatable {
    var id: String = ""
    var deviceId: String = ""; var deviceType: String = ""; var deviceName: String = ""
    var os: String = ""; var browser: String = ""; var lastSeenAt: String = ""
    var lastSeenIp: String = ""; var loginCount: Int = 0; var firstSeenAt: String = ""
    var active: Bool = true; var trusted: Bool = false
    var displayName: String { deviceName.isEmpty ? "\(deviceType)  \(os)" : deviceName }
}

struct UserSession: Codable, Identifiable, Equatable {
    var id: String { sessionId }
    var sessionId: String = ""; var deviceType: String = ""; var deviceName: String = ""
    var lastSeenAt: String = ""; var ipAddress: String = ""; var country: String = ""
    var isCurrent: Bool = false
}

struct UserProfile: Codable, Equatable {
    var id: String = ""; var firstName: String = ""; var lastName: String = ""
    var email: String = ""; var phoneNumber: String = ""; var emailVerified: Bool = false
    var isPremium: Bool = false; var subscriptionStatus: String = ""
    var isActive: Bool = true; var role: String = "user"

    var fullName: String { "\(firstName) \(lastName)".trimmingCharacters(in: .whitespaces) }
    var initials: String {
        var s = ""
        if let f = firstName.first { s += String(f).uppercased() }
        if let l = lastName.first  { s += String(l).uppercased() }
        return s.isEmpty ? (String(email.first ?? "?").uppercased()) : s
    }
    var subscriptionLabel: String {
        switch subscriptionStatus.lowercased() {
        case "active":   return "HL+ Premium"
        case "trialing": return "Free Trial"
        case "past_due": return "Payment Due"
        case "canceled": return "Cancelled"
        default: return isPremium ? "HL+ Premium" : "Free"
        }
    }
    var subscriptionActive: Bool {
        ["active", "trialing"].contains(subscriptionStatus.lowercased()) || isPremium
    }
}

struct DevicesResponse: Codable { var success: Bool = false; var devices: [Device] = []; var count: Int = 0; var maxDevices: Int = 3 }
struct SessionsResponse: Codable { var success: Bool = false; var sessions: [UserSession] = [] }
struct ProfileResponse: Codable { var success: Bool = false; var user: UserProfile? }
