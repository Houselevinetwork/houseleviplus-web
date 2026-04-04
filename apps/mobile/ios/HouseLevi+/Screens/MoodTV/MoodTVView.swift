import SwiftUI

struct MoodTVView: View {
    let onPlayLive: (LinearTvBlock) -> Void
    @State private var block: LinearTvBlock? = nil
    @State private var isLoading = true
    @State private var dotOn = true

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: "0A1628"), Color.hlBlack],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            // Background blurred thumbnail
            if let thumbUrl = block?.thumbnailUrl, !thumbUrl.isEmpty {
                AsyncImage(url: URL(string: thumbUrl)) { phase in
                    if case .success(let img) = phase {
                        img.resizable().scaledToFill().ignoresSafeArea()
                            .blur(radius: 40).opacity(0.15)
                    }
                }
            }
            Color.black.opacity(0.6).ignoresSafeArea()

            VStack(spacing: 16) {
                Text("HL MOOD TV")
                    .font(.system(size: 32, weight: .black)).tracking(6)
                    .foregroundColor(.hlTextPrimary)

                // Live badge
                HStack(spacing: 8) {
                    Circle().fill(Color.hlRed).frame(width: 8, height: 8).opacity(dotOn ? 1 : 0.2)
                        .onAppear {
                            withAnimation(.easeInOut(duration: 0.9).repeatForever()) { dotOn.toggle() }
                        }
                    Text("LIVE").font(.system(size: 11, weight: .bold)).tracking(2).foregroundColor(.hlRed)
                    Text("24/7 African TV").font(.hlLabelLarge).foregroundColor(.hlTextSecondary)
                }
                .padding(.horizontal, 14).padding(.vertical, 7)
                .background(Color.black.opacity(0.5)).clipShape(Capsule())

                Spacer().frame(height: 8)

                if isLoading {
                    ProgressView().tint(.hlBlueGlow).frame(width: 32, height: 32)
                } else if let b = block {
                    VStack(spacing: 6) {
                        Text("NOW PLAYING").font(.system(size: 10, weight: .semibold)).tracking(2)
                            .foregroundColor(.hlTextMuted)
                        Text(b.title).font(.hlTitleLarge).foregroundColor(.hlTextPrimary)
                            .multilineTextAlignment(.center)
                        if !b.category.isEmpty {
                            Text(b.category).font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                        }
                        if !b.endTime.isEmpty {
                            Text("Until \(b.endTime)").font(.system(size: 11)).foregroundColor(.hlTextMuted)
                        }
                    }
                } else {
                    Text("Nothing scheduled right now").font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                }

                Spacer().frame(height: 8)

                Button { block.map { onPlayLive($0) } } label: {
                    Text("  Watch Live")
                        .font(.system(size: 17, weight: .semibold)).foregroundColor(.white)
                        .frame(width: 220).frame(height: 56)
                        .background(Color.hlRed).cornerRadius(4)
                }.disabled(block == nil)

                Text("Always-on African music, films, and culture")
                    .font(.system(size: 13)).foregroundColor(.hlTextMuted)
                    .multilineTextAlignment(.center).padding(.horizontal, 40)
            }.padding(40)
        }
        .task {
            do {
                let res: LinearTvResponse = try await HLAPIClient.shared.request(method: "GET", path: "linear-tv/now-playing")
                block = res.nowPlaying ?? res.data
            } catch {}
            isLoading = false
        }
    }
}

// Color hex helper
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8)  & 0xFF) / 255
        let b = Double(int         & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
