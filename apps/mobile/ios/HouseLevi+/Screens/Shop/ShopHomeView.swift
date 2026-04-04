import SwiftUI

struct ShopHomeView: View {
    let onProductTap: (String) -> Void
    let onCartTap: () -> Void
    @StateObject private var vm = ShopHomeViewModel()
    let columns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.hlBlack.ignoresSafeArea()
                if vm.isLoading { ProgressView().tint(.hlBlueGlow) }
                else if let err = vm.error {
                    VStack(spacing: 16) {
                        Text(err).foregroundColor(.hlTextMuted)
                        Button("Retry") { Task { await vm.load() } }.foregroundColor(.hlBlueGlow)
                    }
                } else if vm.products.isEmpty {
                    Text("No products available").foregroundColor(.hlTextMuted)
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(vm.products) { product in
                                ProductCardView(product: product) { onProductTap(product.id) }
                            }
                        }.padding(16)
                    }
                }
            }
            .navigationTitle("SHOP")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: onCartTap) { Text("").font(.system(size: 22)) }
                }
            }
        }
    }
}

struct ProductCardView: View {
    let product: Product; let onTap: () -> Void
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .topLeading) {
                    AsyncImage(url: URL(string: product.primaryImage)) { phase in
                        switch phase {
                        case .success(let img): img.resizable().scaledToFill()
                        default: Rectangle().fill(Color.hlSurface)
                        }
                    }.frame(height: 160).clipped()

                    if product.hasDiscount {
                        Text("SALE").font(.system(size: 9, weight: .bold)).tracking(1)
                            .foregroundColor(.white).padding(.horizontal, 6).padding(.vertical, 2)
                            .background(Color.hlRed).cornerRadius(3)
                            .padding(8)
                    }
                    if !product.inStock {
                        Color.black.opacity(0.6)
                        Text("OUT OF STOCK").font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.title).font(.hlLabelLarge).foregroundColor(.hlTextPrimary)
                        .lineLimit(2)
                    HStack(spacing: 6) {
                        Text(product.displayPrice).font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                        if let orig = product.originalPrice {
                            Text(orig).font(.system(size: 11)).foregroundColor(.hlTextMuted)
                                .strikethrough()
                        }
                    }
                    if product.isLowStock {
                        Text("Only \(product.totalStock) left!")
                            .font(.system(size: 10)).foregroundColor(.hlGold)
                    }
                }.padding(10)
            }
            .background(Color.hlSurface).cornerRadius(8)
        }.buttonStyle(.plain)
    }
}
