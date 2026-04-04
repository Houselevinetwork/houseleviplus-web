import SwiftUI

struct LiveTvRow: View {
    let block: LinearTvBlock; let onTap: () -> Void
    @State private var dotOn = true

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                ZStack(alignment: .topLeading) {
                    AsyncImage(url: URL(string: block.thumbnailUrl)) { phase in
                        switch phase {
                        case .success(let img): img.resizable().scaledToFill()
                        default: Rectangle().fill(Color.hlSurfaceHigh)
                        }
                    }.frame(width: 72, height: 52).clipped().cornerRadius(4)
                    Text("LIVE").font(.system(size: 7, weight: .bold)).tracking(1).foregroundColor(.white)
                        .padding(.horizontal, 4).padding(.vertical, 1).background(Color.hlRed).cornerRadius(2).padding(3)
                }
                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 6) {
                        Circle().fill(Color.hlRed).frame(width: 7, height: 7).opacity(dotOn ? 1 : 0.3)
                            .onAppear { withAnimation(.easeInOut(duration: 0.9).repeatForever()) { dotOn.toggle() } }
                        Text("HL MOOD TV  LIVE").font(.system(size: 9, weight: .semibold)).tracking(1.5).foregroundColor(.hlRed)
                    }
                    Text(block.title).font(.hlTitleMedium).foregroundColor(.hlTextPrimary).lineLimit(1)
                    if !block.category.isEmpty {
                        Text(block.category).font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    }
                }
                Spacer()
                Text("").font(.hlTitleMedium).foregroundColor(.hlTextMuted)
            }
            .padding(12).background(Color.hlSurface).cornerRadius(8).padding(.horizontal, 16)
        }.buttonStyle(.plain)
    }
}
