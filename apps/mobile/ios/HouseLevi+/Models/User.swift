import Foundation

struct User: Codable, Equatable {
    let id: String; let _id: String
    let firstName: String; let lastName: String
    let email: String; let phoneNumber: String
    let emailVerified: Bool; let isPremium: Bool
    let subscriptionStatus: String
    let isActive: Bool; let profileComplete: Bool
    let role: String; let permissions: [String]

    init(id: String = "", _id: String = "", firstName: String = "", lastName: String = "",
         email: String = "", phoneNumber: String = "", emailVerified: Bool = false,
         isPremium: Bool = false, subscriptionStatus: String = "free",
         isActive: Bool = true, profileComplete: Bool = false,
         role: String = "user", permissions: [String] = []) {
        self.id = id; self._id = _id; self.firstName = firstName; self.lastName = lastName
        self.email = email; self.phoneNumber = phoneNumber; self.emailVerified = emailVerified
        self.isPremium = isPremium; self.subscriptionStatus = subscriptionStatus
        self.isActive = isActive; self.profileComplete = profileComplete
        self.role = role; self.permissions = permissions
    }

    var displayName: String {
        if !firstName.isEmpty && !lastName.isEmpty { return "\(firstName) \(lastName)" }
        if !firstName.isEmpty { return firstName }
        return String(email.prefix(while: { $0 != "@" }))
    }
    var initials: String {
        var r = ""
        if let f = firstName.first { r.append(f.uppercased()) }
        if let l = lastName.first  { r.append(l.uppercased()) }
        return r.isEmpty ? String(email.prefix(2).uppercased()) : r
    }
    var isActivePremium: Bool { isPremium && subscriptionStatus == "active" }
    var subscriptionLabel: String {
        switch subscriptionStatus {
        case "active":    return "HL+ Premium"
        case "expired":   return "Subscription Expired"
        case "suspended": return "Account Suspended"
        default:          return "Free Plan"
        }
    }
}
