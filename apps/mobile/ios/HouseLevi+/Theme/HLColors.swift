import SwiftUI

extension Color {
    static let hlBlack        = Color(hex: "0A0A0A")
    static let hlSurface      = Color(hex: "141414")
    static let hlSurfaceHigh  = Color(hex: "1E1E1E")
    static let hlDivider      = Color(hex: "2A2A2A")
    static let hlBlueGlow     = Color(hex: "1A6BFF")
    static let hlBlueGlowDim  = Color(hex: "1A6BFF").opacity(0.2)
    static let hlGold         = Color(hex: "FFD700")
    static let hlGoldDim      = Color(hex: "FFD700").opacity(0.2)
    static let hlRed          = Color(hex: "DC2626")
    static let hlGreen        = Color(hex: "00B77F")
    static let hlTextPrimary   = Color.white
    static let hlTextSecondary = Color.white.opacity(0.6)
    static let hlTextMuted     = Color.white.opacity(0.3)
    static let hlInputBg      = Color(hex: "1A1A1A")
    static let hlInputBorder  = Color(hex: "333333")

    init(hex: String) {
        let scanner = Scanner(string: hex)
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255
        let g = Double((rgb >> 8)  & 0xFF) / 255
        let b = Double( rgb        & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
