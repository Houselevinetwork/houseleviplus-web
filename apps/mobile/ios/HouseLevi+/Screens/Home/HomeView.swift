import SwiftUI

struct HomeView: View {
    let currentUser: User?
    let onContentPlay: (ContentItem) -> Void
    let onBrowseCategory: (String, String) -> Void
    let onLiveTvPlay: (LinearTvBlock) -> Void     // NEW  native player

    @StateObject private var vm = HomeViewModel()
    @State private var premiumGateItem: ContentItem? = nil

    func handleTap(_ item: ContentItem) {
        if item.isPremium && currentUser?.isActivePremium != true { premiumGateItem = item }
        else { onContentPlay(item) }
    }

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            if vm.state.isLoading {
                ProgressView().tint(.hlBlueGlow)
            } else if let err = vm.state.error {
                VStack(spacing: 16) {
                    Text(err).font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    Button("Retry") { vm.refresh() }.font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                }
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 24) {
                        if let hero = vm.state.heroItem {
                            HeroBanner(item: hero, onPlay: handleTap)
                        }
                        if let live = vm.state.liveNow {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("  HL Mood TV")
                                    .font(.hlTitleMedium).foregroundColor(.hlTextPrimary)
                                LiveTvRow(block: live) {
                                    onLiveTvPlay(live)   //  plays inside the app now
                                }
                            }
                        }
                        ForEach(vm.state.categories) { cat in
                            if !cat.content.isEmpty {
                                ContentRow(
                                    title: cat.name, items: cat.content, onItemTap: handleTap,
                                    onSeeAll: { onBrowseCategory(cat.slug, cat.name) },
                                    wide: ["trending","new"].contains(cat.slug)
                                )
                            }
                        }
                        Spacer().frame(height: 32)
                    }
                }.ignoresSafeArea(edges: .top)
            }
        }
        .sheet(item: $premiumGateItem) { item in
            PremiumGateSheet(
                contentTitle: item.title,
                onSubscribe: {
                    premiumGateItem = nil
                    if let url = URL(string: "https://houselevi.com/choose-plan") {
                        UIApplication.shared.open(url)
                    }
                },
                onDismiss: { premiumGateItem = nil }
            )
        }
    }
}
