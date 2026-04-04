import SwiftUI

struct PremiumGateSheet: View {
    let contentTitle: String; let onSubscribe: () -> Void; let onDismiss: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            Capsule().fill(Color.hlDivider).frame(width: 36, height: 4).padding(.top, 12).padding(.bottom, 24)
            Text("").font(.system(size: 48))
            Spacer().frame(height: 12)
            Text("Premium Content").font(.hlHeadlineMedium).foregroundColor(.hlTextPrimary)
            Spacer().frame(height: 8)
            Text("\"\(contentTitle)\" requires an HL+ Premium subscription.")
                .font(.hlBodyMedium).foregroundColor(.hlTextSecondary)
                .multilineTextAlignment(.center).padding(.horizontal, 28)
            Spacer().frame(height: 28)
            Button(action: onSubscribe) {
                Text("Subscribe  HL+ Premium").font(.hlLabelLarge).tracking(1).foregroundColor(.black)
                    .frame(maxWidth: .infinity).frame(height: 52).background(Color.hlGold).cornerRadius(4)
            }.padding(.horizontal, 28)
            Button(action: onDismiss) {
                Text("Not now").font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    .frame(maxWidth: .infinity).frame(height: 44)
            }.padding(.horizontal, 28).padding(.bottom, 12)
        }
        .background(Color.hlSurface)
        .presentationDetents([.height(380)])
        .presentationDragIndicator(.hidden)
    }
}
