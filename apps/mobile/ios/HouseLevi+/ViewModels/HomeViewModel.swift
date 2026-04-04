import Foundation

struct HomeState {
    var isLoading: Bool = true
    var categories: [ContentCategory] = []
    var heroItem: ContentItem? = nil
    var liveNow: LinearTvBlock? = nil
    var error: String? = nil
}

@MainActor
final class HomeViewModel: ObservableObject {
    @Published var state = HomeState()
    init() { Task { await loadHome() } }

    func loadHome() async {
        state = HomeState(isLoading: true)
        do {
            async let homeTask = HLAPIClient.shared.getHome(limit: 10)
            async let liveTask = HLAPIClient.shared.getNowPlaying()
            let (homeRes, liveRes) = try await (homeTask, liveTask)

            let categories = homeRes.data?.categories ?? []
            let hero = categories.first(where: { $0.slug == "originals" })?.content.first
                    ?? categories.first(where: { !$0.content.isEmpty })?.content.first

            state = HomeState(isLoading: false, categories: categories, heroItem: hero, liveNow: liveRes.block)
        } catch {
            state = HomeState(isLoading: false, error: "Failed to load. Check your connection.")
        }
    }

    func refresh() { Task { await loadHome() } }
}
