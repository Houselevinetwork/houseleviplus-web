import SwiftUI
import AVKit

struct VideoPlayerView: View {
    let item: ContentItem
    let accessToken: String
    let onBack: () -> Void

    @State private var player: AVPlayer? = nil
    @State private var streamStarted = false
    @State private var streamError: String? = nil
    @State private var heartbeatTask: Task<Void, Never>? = nil

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            if let err = streamError {
                VStack(spacing: 16) {
                    Text("").font(.system(size: 48))
                    Text(err).font(.hlBodyMedium).foregroundColor(.hlTextPrimary)
                        .multilineTextAlignment(.center)
                    Text("You're already streaming on 3 devices.")
                        .font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    Button("Go back", action: onBack).foregroundColor(.hlBlueGlow)
                }
            } else if let player = player {
                VideoPlayer(player: player)
                    .ignoresSafeArea()
                    .onDisappear {
                        player.pause()
                        heartbeatTask?.cancel()
                        Task { _ = try? await HLAPIClient.shared.stopPlayback() }
                    }
            } else {
                ProgressView().tint(.white)
            }

            // Back button
            VStack {
                HStack {
                    Button(action: onBack) {
                        Image(systemName: "arrow.left")
                            .foregroundColor(.white).padding(10)
                            .background(Color.black.opacity(0.5))
                            .clipShape(Circle())
                    }.padding(16)
                    Spacer()
                    Text(item.title).font(.hlLabelLarge)
                        .foregroundColor(.white.opacity(0.8)).lineLimit(1).padding(16)
                }
                Spacer()
            }
        }
        .task {
            guard let hlsUrl = item.hlsUrl, let url = URL(string: hlsUrl) else { return }

            // Start playback session
            do {
                _ = try await HLAPIClient.shared.startPlayback(contentId: item.id)
                streamStarted = true
            } catch {
                streamStarted = true // allow offline playback
            }

            // Create AVPlayer
            player = AVPlayer(url: url)
            player?.play()

            // Heartbeat every 30s
            heartbeatTask = Task {
                while !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 30_000_000_000)
                    guard let p = player else { break }
                    let pos = p.currentTime().seconds
                    _ = try? await HLAPIClient.shared.heartbeat(contentId: item.id, position: pos)
                }
            }
        }
    }
}

struct LiveTvPlayerView: View {
    let block: LinearTvBlock
    let onBack: () -> Void

    @State private var player: AVPlayer? = nil
    @State private var dotOn = true

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            if let player = player {
                VideoPlayer(player: player).ignoresSafeArea()
                    .onDisappear { player.pause() }
            } else {
                ProgressView().tint(.white)
            }

            VStack {
                HStack {
                    Button(action: onBack) {
                        Image(systemName: "arrow.left").foregroundColor(.white).padding(10)
                            .background(Color.black.opacity(0.5)).clipShape(Circle())
                    }.padding(16)
                    Spacer()
                    HStack(spacing: 6) {
                        Circle().fill(Color.hlRed).frame(width: 8, height: 8).opacity(dotOn ? 1 : 0.2)
                            .onAppear { withAnimation(.easeInOut(duration: 0.8).repeatForever()) { dotOn.toggle() } }
                        Text("LIVE").font(.system(size: 10, weight: .bold)).tracking(1)
                            .foregroundColor(.hlRed)
                        Text("").foregroundColor(.hlTextMuted)
                        Text(block.title).font(.hlLabelMedium).foregroundColor(.white).lineLimit(1)
                    }
                    .padding(.horizontal, 10).padding(.vertical, 6)
                    .background(Color.black.opacity(0.6)).cornerRadius(6).padding(16)
                }
                Spacer()
            }
        }
        .task {
            guard !block.streamUrl.isEmpty, let url = URL(string: block.streamUrl) else { return }
            player = AVPlayer(url: url)
            player?.play()
        }
    }
}
