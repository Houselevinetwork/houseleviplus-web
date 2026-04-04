import SwiftUI

struct HeroBanner: View {
    let item: ContentItem; let onPlay: (ContentItem) -> Void

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            AsyncImage(url: URL(string: item.backdropUrl.isEmpty ? item.thumbnail : item.backdropUrl)) { phase in
                switch phase {
                case .success(let img): img.resizable().scaledToFill()
                default: Rectangle().fill(Color.hlSurface)
                }
            }.frame(maxWidth: .infinity).frame(height: 480).clipped()

            LinearGradient(stops: [.init(color: .clear, location: 0),
                                   .init(color: .black.opacity(0.1), location: 0.5),
                                   .init(color: Color.hlBlack, location: 1)],
                           startPoint: .top, endPoint: .bottom)
            LinearGradient(colors: [.black.opacity(0.4), .clear], startPoint: .leading, endPoint: .trailing)

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    if item.metadata.isOriginal   { HeroBadge("REEL AFRIKA ORIGINAL", .hlBlueGlow) }
                    if item.metadata.hasWonAwards { HeroBadge("AWARD WINNER",         .hlGold)     }
                }
                Text(item.title).font(.hlHeadlineLarge).foregroundColor(.hlTextPrimary).lineLimit(2)
                if !item.description.isEmpty {
                    Text(item.description).font(.hlBodyMedium).foregroundColor(.hlTextSecondary).lineLimit(2)
                }
                Button { onPlay(item) } label: {
                    HStack(spacing: 8) {
                        Text("").font(.system(size: 14, weight: .bold))
                        Text("Play").font(.hlLabelLarge).tracking(2)
                    }
                    .foregroundColor(Color.hlBlack).padding(.horizontal, 24)
                    .frame(height: 44).background(Color.white).cornerRadius(4)
                }.padding(.top, 4)
            }
            .padding(.horizontal, 20).padding(.bottom, 28)
        }
        .frame(height: 480).clipped()
    }
}

private struct HeroBadge: View {
    let text: String; let color: Color
    init(_ t: String, _ c: Color) { text = t; color = c }
    var body: some View {
        Text(text).font(.system(size: 9, weight: .bold)).tracking(1.2).foregroundColor(color)
            .padding(.horizontal, 8).padding(.vertical, 3).background(color.opacity(0.2)).cornerRadius(3)
    }
}
