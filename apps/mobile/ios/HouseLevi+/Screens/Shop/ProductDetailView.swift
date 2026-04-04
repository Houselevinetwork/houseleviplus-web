import SwiftUI

struct ProductDetailView: View {
    let productId: String
    let accessToken: String
    let onBack: () -> Void
    let onGoToCart: () -> Void

    @StateObject private var vm = ProductDetailViewModel()

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            if vm.isLoading { ProgressView().tint(.hlBlueGlow) }
            else if let p = vm.product {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {

                        //  Image 
                        ZStack(alignment: .topLeading) {
                            AsyncImage(url: URL(string: p.primaryImage)) { phase in
                                switch phase {
                                case .success(let img): img.resizable().scaledToFill()
                                default: Rectangle().fill(Color.hlSurface)
                                }
                            }.frame(height: 360).clipped()

                            Button(action: onBack) {
                                Image(systemName: "arrow.left").foregroundColor(.white)
                                    .padding(10).background(Color.black.opacity(0.5)).clipShape(Circle())
                            }.padding(16)
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            // Title + Price
                            Text(p.title).font(.hlHeadlineMedium)
                            HStack(spacing: 10) {
                                Text(p.displayPrice).font(.system(size: 22, weight: .bold))
                                    .foregroundColor(.hlBlueGlow)
                                if let orig = p.originalPrice {
                                    Text(orig).font(.hlBodyLarge).foregroundColor(.hlTextMuted)
                                        .strikethrough()
                                }
                            }
                            if p.isLowStock {
                                Text(" Only \(p.totalStock) left").font(.hlLabelMedium)
                                    .foregroundColor(.hlGold)
                            }

                            // Variant selector
                            if p.variants.count > 1 {
                                Text("Select option").font(.hlLabelLarge).foregroundColor(.hlTextSecondary)
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(p.variants) { v in
                                            VariantChipView(
                                                variant: v,
                                                selected: vm.selectedVariant?.id == v.id
                                            ) { vm.selectVariant(v) }
                                        }
                                    }
                                }
                            }

                            // Quantity
                            HStack(spacing: 16) {
                                Text("Quantity").font(.hlLabelLarge).foregroundColor(.hlTextSecondary)
                                HStack {
                                    Button { vm.setQuantity(vm.quantity - 1) } label: {
                                        Text("").font(.hlTitleLarge).frame(width: 36, height: 36)
                                    }
                                    Text("\(vm.quantity)").font(.hlTitleMedium).frame(width: 28)
                                    Button { vm.setQuantity(vm.quantity + 1) } label: {
                                        Text("+").font(.hlTitleLarge).frame(width: 36, height: 36)
                                    }
                                }
                            }

                            // Description
                            Text("About this item").font(.hlTitleMedium)
                            Text(p.description).font(.hlBodyMedium).foregroundColor(.hlTextSecondary)
                                .lineSpacing(4)

                            // Tags
                            if !p.tags.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(p.tags, id: \.self) { tag in
                                            Text("#\(tag)").font(.system(size: 11))
                                                .foregroundColor(.hlTextMuted)
                                                .padding(.horizontal, 10).padding(.vertical, 4)
                                                .background(Color.hlSurface).cornerRadius(4)
                                        }
                                    }
                                }
                            }

                            // CTA
                            if vm.addedToCart {
                                Button(action: onGoToCart) {
                                    Text(" View Cart").font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity).frame(height: 54)
                                        .background(Color.hlGreen).cornerRadius(4)
                                }
                            } else {
                                Button {
                                    Task { await vm.addToCart(auth: accessToken) }
                                } label: {
                                    Text(vm.selectedVariant?.inStock == true ? "Add to Cart" : "Out of Stock")
                                        .font(.system(size: 16, weight: .semibold)).foregroundColor(.white)
                                        .frame(maxWidth: .infinity).frame(height: 54)
                                        .background(vm.selectedVariant?.inStock == true ? Color.hlBlueGlow : Color.hlSurface)
                                        .cornerRadius(4)
                                }.disabled(vm.selectedVariant?.inStock != true)
                            }
                            Spacer().frame(height: 40)
                        }.padding(.horizontal, 20).padding(.top, 12)
                    }
                }.ignoresSafeArea(edges: .top)
            }
        }
        .task { await vm.load(productId: productId) }
    }
}

private struct VariantChipView: View {
    let variant: ProductVariant; let selected: Bool; let onTap: () -> Void
    var body: some View {
        Button(action: onTap) {
            Text(variant.label + (!variant.inStock ? " (sold out)" : ""))
                .font(.hlLabelMedium)
                .foregroundColor(selected ? .hlBlueGlow : (!variant.inStock ? .hlTextMuted : .hlTextPrimary))
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(selected ? Color.hlBlueGlow.opacity(0.15) : Color.hlSurface)
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(selected ? Color.hlBlueGlow : Color.hlSurface, lineWidth: 1))
                .cornerRadius(6)
        }.disabled(!variant.inStock)
    }
}
