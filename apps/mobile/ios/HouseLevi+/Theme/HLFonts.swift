import SwiftUI

enum HLFont {
    static func lato(_ weight: Font.Weight = .regular, size: CGFloat) -> Font {
        switch weight {
        case .bold:  return .custom("Lato-Bold",    size: size)
        case .light: return .custom("Lato-Light",   size: size)
        default:     return .custom("Lato-Regular", size: size)
        }
    }
    static func frankRuhl(_ weight: Font.Weight = .regular, size: CGFloat) -> Font {
        switch weight {
        case .bold:   return .custom("FrankRuhlLibre-Bold",   size: size)
        case .medium: return .custom("FrankRuhlLibre-Medium", size: size)
        default:      return .custom("FrankRuhlLibre-Regular",size: size)
        }
    }
}

extension Font {
    static let hlDisplayLarge   = HLFont.frankRuhl(.bold,    size: 40)
    static let hlDisplayMedium  = HLFont.frankRuhl(.bold,    size: 32)
    static let hlHeadlineLarge  = HLFont.frankRuhl(.medium,  size: 28)
    static let hlHeadlineMedium = HLFont.frankRuhl(.medium,  size: 22)
    static let hlTitleLarge     = HLFont.lato(.bold,         size: 18)
    static let hlTitleMedium    = HLFont.lato(.bold,         size: 15)
    static let hlBodyLarge      = HLFont.lato(.regular,      size: 16)
    static let hlBodyMedium     = HLFont.lato(.regular,      size: 14)
    static let hlLabelLarge     = HLFont.lato(.bold,         size: 14)
    static let hlLabelMedium    = HLFont.lato(.regular,      size: 12)
}
