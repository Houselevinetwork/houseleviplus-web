import Foundation

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var profile: UserProfile? = nil
    @Published var devices: [Device] = []
    @Published var sessions: [UserSession] = []
    @Published var maxDevices = 3
    @Published var isLoading = true
    @Published var loggedOut = false
    @Published var error: String? = nil

    func load(auth: String) async {
        isLoading = true
        do {
            async let profileTask  = HLAPIClient.shared.getMe(auth: auth)
            async let devicesTask  = HLAPIClient.shared.getDevices(auth: auth)
            async let sessionsTask = HLAPIClient.shared.getSessions(auth: auth)
            let (p, d, s) = try await (profileTask, devicesTask, sessionsTask)
            profile = p.user; devices = d.devices; sessions = s.sessions; maxDevices = d.maxDevices
        } catch { self.error = "Failed to load profile." }
        isLoading = false
    }
    func removeDevice(auth: String, deviceId: String) async {
        do { try await HLAPIClient.shared.removeDevice(auth: auth, deviceId: deviceId)
             devices.removeAll { $0.id == deviceId } } catch {}
    }
    func revokeSession(auth: String, sessionId: String) async {
        do { try await HLAPIClient.shared.revokeSession(auth: auth, sessionId: sessionId)
             sessions.removeAll { $0.sessionId == sessionId } } catch {}
    }
    func logout(auth: String) async {
        _ = try? await HLAPIClient.shared.logout(auth: auth)
        loggedOut = true
    }
}
