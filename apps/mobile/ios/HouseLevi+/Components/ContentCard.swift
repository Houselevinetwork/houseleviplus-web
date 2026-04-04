import SwiftUI

struct ContentCard: View {
    let item: ContentItem
    let onTap: (ContentItem) -> Void
    var width: CGFloat = 140; var height: CGFloat = 200; var showTitle: Bool = true

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack(alignment: .topLeading) {
                AsyncImage(url: URL(string: item.thumbnail)) { phase in
                    switch phase {
                    case .success(let img): img.resizable().scaledToFill()
                    case .failure:         Rectangle().fill(Color.hlSurface)
                    default:               Rectangle().fill(Color.hlSurfaceHigh)
                    }
                }
                .frame(width: width, height: height).clipped().cornerRadius(6)

                LinearGradient(colors: [.clear, .black.opacity(0.75)], startPoint: .center, endPoint: .bottom)
                    .cornerRadius(6)

                HStack(spacing: 4) {
                    if item.metadata.isOriginal  { HLBadge("ORIGINAL", .hlBlueGlow) }
                    if item.metadata.isTrending  { HLBadge("TRENDING", .hlRed) }
                    if item.metadata.hasWonAwards{ HLBadge("AWARD",    .hlGold) }
                }.padding(6)

                VStack {
                    Spacer()
                    HStack {
                        if item.duration > 0 {
                            Text(item.displayDuration).font(.system(size: 10)).foregroundColor(.white)
                                .padding(.horizontal, 4).padding(.vertical, 2)
                                .background(Color.black.opacity(0.7)).cornerRadius(3).padding(6)
                        }
                        Spacer()
                        if item.isPremium {
                            Text("").font(.system(size: 11)).padding(4)
                                .background(Color.hlGold.opacity(0.9)).cornerRadius(4).padding(6)
                        }
                    }
                }
            }
            .frame(width: width, height: height)
            .onTapGesture { onTap(item) }

            if showTitle {
                Text(item.title).font(.system(size: 13)).foregroundColor(.hlTextPrimary)
                    .lineLimit(2).frame(width: width, alignment: .leading)
            }
        }
    }
}

struct ContentCardWide: View {
    let item: ContentItem; let onTap: (ContentItem) -> Void
    var body: some View { ContentCard(item: item, onTap: onTap, width: 220, height: 130) }
}

private struct HLBadge: View {
    let text: String; let color: Color
    init(_ t: String, _ c: Color) { text = t; color = c }
    var body: some View {
        Text(text).font(.system(size: 8, weight: .bold)).tracking(0.8).foregroundColor(.white)
            .padding(.horizontal, 5).padding(.vertical, 2).background(color.opacity(0.9)).cornerRadius(3)
    }
}
