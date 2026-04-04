import SwiftUI

enum HLTab: String, CaseIterable {
    case home    = "Home"
    case browse  = "Browse"
    case travel  = "Travel"
    case moodtv  = "Mood TV"
    case shop    = "Shop"
    case profile = "Me"

    var icon: String {
        switch self {
        case .home:    return "house.fill"
        case .browse:  return "film"
        case .travel:  return "airplane"
        case .moodtv:  return "tv"
        case .shop:    return "bag"
        case .profile: return "person.circle"
        }
    }
}

struct MainTabView: View {
    let currentUser: User?
    var accessToken: String = ""

    @State private var selectedTab: HLTab = .home
    @State private var contentToPlay: ContentItem? = nil
    @State private var liveTvBlock: LinearTvBlock? = nil
    @State private var travelPath: [TravelRoute] = []
    @State private var shopPath: [ShopRoute] = []

    var body: some View {
        TabView(selection: $selectedTab) {

            //  HOME 
            NavigationStack {
                HomeView(
                    currentUser: currentUser,
                    onContentPlay: { item in contentToPlay = item },
                    onBrowseCategory: { _, _ in selectedTab = .browse },
                    onLiveTvPlay: { block in liveTvBlock = block }
                )
            }
            .tabItem { Label(HLTab.home.rawValue,   systemImage: HLTab.home.icon)   }.tag(HLTab.home)

            //  BROWSE 
            Text("Browse  Session 5").foregroundColor(.hlTextPrimary)
                .frame(maxWidth: .infinity, maxHeight: .infinity).background(Color.hlBlack)
                .tabItem { Label(HLTab.browse.rawValue, systemImage: HLTab.browse.icon) }.tag(HLTab.browse)

            //  TRAVEL 
            NavigationStack(path: $travelPath) {
                TravelHomeView(
                    onPackageClick: { slug in travelPath.append(.packageDetail(slug)) },
                    onCustomTripClick: { travelPath.append(.inquiry("custom", "Custom Trip")) }
                )
                .navigationDestination(for: TravelRoute.self) { route in
                    switch route {
                    case .packageDetail(let slug):
                        PackageDetailView(
                            slug: slug,
                            onBack: { travelPath.removeLast() },
                            onInquire: { s, t in travelPath.append(.inquiry(s, t)) }
                        )
                    case .inquiry(let slug, let title):
                        InquiryFormView(packageSlug: slug, packageTitle: title,
                                        onBack: { travelPath.removeLast() })
                    }
                }
            }
            .tabItem { Label(HLTab.travel.rawValue, systemImage: HLTab.travel.icon) }.tag(HLTab.travel)

            //  MOOD TV 
            MoodTVView(onPlayLive: { block in liveTvBlock = block })
                .tabItem { Label(HLTab.moodtv.rawValue, systemImage: HLTab.moodtv.icon) }.tag(HLTab.moodtv)

            //  SHOP 
            NavigationStack(path: $shopPath) {
                ShopHomeView(
                    onProductTap: { id in shopPath.append(.productDetail(id)) },
                    onCartTap: { shopPath.append(.cart) }
                )
                .navigationDestination(for: ShopRoute.self) { route in
                    switch route {
                    case .productDetail(let id):
                        ProductDetailView(productId: id, accessToken: accessToken,
                                          onBack: { shopPath.removeLast() },
                                          onGoToCart: { shopPath.append(.cart) })
                    case .cart:
                        CartView(accessToken: accessToken, onBack: { shopPath.removeLast() })
                    }
                }
            }
            .tabItem { Label(HLTab.shop.rawValue, systemImage: HLTab.shop.icon) }.tag(HLTab.shop)

            //  PROFILE 
            ProfileView(accessToken: accessToken, onLoggedOut: {
                // Pop to root / sign-in  handled at app level
            })
            .tabItem { Label(HLTab.profile.rawValue, systemImage: HLTab.profile.icon) }.tag(HLTab.profile)
        }
        .tint(.hlBlueGlow)
        .preferredColorScheme(.dark)
        // Video player fullscreen
        .fullScreenCover(item: $contentToPlay) { item in
            VideoPlayerView(item: item, accessToken: accessToken, onBack: { contentToPlay = nil })
        }
        // Live TV fullscreen (from Home card OR Mood TV tab)
        .fullScreenCover(item: $liveTvBlock) { block in
            LiveTvPlayerView(block: block, onBack: { liveTvBlock = nil })
        }
    }
}

// Shop navigation routes
enum ShopRoute: Hashable {
    case productDetail(String)
    case cart
}

// TravelRoute (already defined in Session 3 MainTabView  keep here)
enum TravelRoute: Hashable {
    case packageDetail(String)
    case inquiry(String, String)
}

extension LinearTvBlock: Identifiable {
    public var id: String { title + startTime }
}
