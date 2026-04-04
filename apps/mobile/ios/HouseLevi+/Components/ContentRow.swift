import SwiftUI

struct ContentRow: View {
    let title: String
    let items: [ContentItem]
    let onItemTap: (ContentItem) -> Void
    var onSeeAll: (() -> Void)? = nil
    var wide: Bool = false

    var body: some View {
        if items.isEmpty { EmptyView() } else {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(title).font(.hlTitleMedium).foregroundColor(.hlTextPrimary).padding(.leading, 16)
                    Spacer()
                    if let seeAll = onSeeAll {
                        Button("See all", action: seeAll).font(.hlLabelMedium).foregroundColor(.hlBlueGlow).padding(.trailing, 16)
                    }
                }
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(spacing: 10) {
                        ForEach(items) { item in
                            if wide { ContentCardWide(item: item, onTap: onItemTap) }
                            else    { ContentCard(item: item, onTap: onItemTap)     }
                        }
                    }.padding(.horizontal, 16)
                }
            }
        }
    }
}
