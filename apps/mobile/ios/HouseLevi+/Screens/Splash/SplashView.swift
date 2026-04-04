import SwiftUI

struct SplashView: View {
    var onComplete: () -> Void
    @State private var showLogo    = false
    @State private var showTagline = false
    @State private var showDots    = false

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            RadialGradient(colors: [Color.hlBlueGlow.opacity(0.45), .clear], center: .center, startRadius: 0, endRadius: 160)
                .frame(width: 320, height: 320).blur(radius: 60)
            VStack(spacing: 0) {
                HStack(alignment: .firstTextBaseline, spacing: 0) {
                    Text("HOUSE LEVI").font(.hlDisplayMedium).fontWeight(.bold).foregroundColor(.hlTextPrimary).tracking(3)
                    Text("+").font(.custom("FrankRuhlLibre-Bold", size: 40)).foregroundColor(.hlBlueGlow)
                }
                .opacity(showLogo ? 1 : 0).offset(y: showLogo ? 0 : 12)
                .animation(.easeOut(duration: 0.7), value: showLogo)
                Spacer().frame(height: 16)
                Text("Watch, Shop, Travel").font(.hlBodyMedium).tracking(1.5).foregroundColor(.hlTextSecondary)
                    .opacity(showTagline ? 1 : 0).animation(.easeIn(duration: 0.6).delay(0.1), value: showTagline)
                Spacer().frame(height: 48)
                if showDots { LoadingDotsView().transition(.opacity) }
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { showLogo    = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) { showTagline = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { withAnimation { showDots = true } }
            DispatchQueue.main.asyncAfter(deadline: .now() + 4.5) { onComplete() }
        }
    }
}

struct LoadingDotsView: View {
    @State private var animating = false
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<3) { i in
                Circle().fill(Color.hlBlueGlow).frame(width: 6, height: 6)
                    .scaleEffect(animating ? 1.0 : 0.5).opacity(animating ? 1.0 : 0.4)
                    .animation(.easeInOut(duration: 0.6).repeatForever().delay(Double(i) * 0.15), value: animating)
            }
        }
        .onAppear { animating = true }
    }
}
