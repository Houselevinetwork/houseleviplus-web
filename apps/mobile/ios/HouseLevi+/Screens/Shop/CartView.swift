import SwiftUI

struct CartView: View {
    let accessToken: String
    let onBack: () -> Void

    @StateObject private var vm = CartViewModel()
    @State private var showCheckout = false
    @State private var phone = ""; @State private var address = ""
    @State private var city = "";  @State private var country = "Kenya"

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button(action: onBack) {
                    Image(systemName: "arrow.left").foregroundColor(.hlTextPrimary)
                        .padding(10).background(Color.hlSurface).clipShape(Circle())
                }
                Spacer().frame(width: 12)
                Text("Cart").font(.hlTitleLarge)
                Spacer()
                Text("\(vm.cart.itemCount) items").font(.hlBodyMedium).foregroundColor(.hlTextMuted)
            }.padding(16).background(Color.hlBlack)

            if vm.isLoading {
                Spacer(); ProgressView().tint(.hlBlueGlow); Spacer()
            } else if vm.cart.isEmpty {
                Spacer()
                VStack(spacing: 16) {
                    Text("").font(.system(size: 48))
                    Text("Your cart is empty").font(.hlTitleMedium).foregroundColor(.hlTextMuted)
                    Button("Continue shopping", action: onBack).font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                }
                Spacer()
            } else {
                ScrollView {
                    ForEach(vm.cart.items) { item in
                        CartItemRowView(
                            item: item,
                            onIncrease: { Task { await vm.updateQuantity(auth: accessToken, itemId: item.id, qty: item.quantity + 1) } },
                            onDecrease: {
                                if item.quantity > 1 { Task { await vm.updateQuantity(auth: accessToken, itemId: item.id, qty: item.quantity - 1) } }
                            },
                            onRemove: { Task { await vm.removeItem(auth: accessToken, itemId: item.id) } }
                        )
                        Divider().background(Color.hlSurface)
                    }
                }

                // Summary + checkout
                VStack(spacing: 12) {
                    if let err = vm.error {
                        Text(err).font(.hlBodyMedium).foregroundColor(.hlRed)
                    }
                    HStack {
                        Text("Subtotal").font(.hlTitleMedium)
                        Spacer()
                        Text(vm.cart.displaySubtotal).font(.hlTitleMedium).foregroundColor(.hlBlueGlow)
                    }
                    Text("Shipping calculated at checkout").font(.system(size: 12)).foregroundColor(.hlTextMuted)
                    Button { showCheckout = true } label: {
                        Text("Checkout  Pay with PesaPal")
                            .font(.system(size: 15, weight: .semibold)).foregroundColor(.white)
                            .frame(maxWidth: .infinity).frame(height: 54)
                            .background(Color.hlBlueGlow).cornerRadius(4)
                    }
                }.padding(20).background(Color.hlSurface)
            }
        }
        .background(Color.hlBlack.ignoresSafeArea())
        .task { await vm.load(auth: accessToken) }
        .onChange(of: vm.checkoutUrl) { url in
            if let url, let u = URL(string: url) {
                UIApplication.shared.open(u)
                vm.checkoutUrl = nil
            }
        }
        .sheet(isPresented: $showCheckout) {
            CheckoutSheet(
                phone: $phone, address: $address, city: $city, country: $country,
                onConfirm: {
                    showCheckout = false
                    Task { await vm.checkout(auth: accessToken, phone: phone,
                        address: ShippingAddress(line1: address, city: city, country: country),
                        location: city) }
                },
                onDismiss: { showCheckout = false }
            )
        }
    }
}

private struct CartItemRowView: View {
    let item: CartItem; let onIncrease: () -> Void; let onDecrease: () -> Void; let onRemove: () -> Void
    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: item.imageUrl)) { phase in
                switch phase {
                case .success(let img): img.resizable().scaledToFill()
                default: Rectangle().fill(Color.hlSurface)
                }
            }.frame(width: 72, height: 72).clipped().cornerRadius(6)
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title).font(.hlLabelLarge).lineLimit(2)
                Text(item.variantTitle).font(.system(size: 12)).foregroundColor(.hlTextMuted)
                Text(item.displayTotal).font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
            }
            Spacer()
            VStack(spacing: 4) {
                HStack(spacing: 0) {
                    Button(action: onDecrease) { Text("").font(.hlTitleMedium).frame(width: 30, height: 30) }
                    Text("\(item.quantity)").font(.hlTitleMedium).frame(width: 24)
                    Button(action: onIncrease) { Text("+").font(.hlTitleMedium).frame(width: 30, height: 30) }
                }
                Button(action: onRemove) {
                    Image(systemName: "trash").font(.system(size: 14)).foregroundColor(.hlTextMuted)
                }
            }
        }.padding(16)
    }
}

private struct CheckoutSheet: View {
    @Binding var phone: String; @Binding var address: String
    @Binding var city: String;  @Binding var country: String
    let onConfirm: () -> Void;  let onDismiss: () -> Void
    var body: some View {
        NavigationStack {
            Form {
                Section("Contact") {
                    TextField("Phone / WhatsApp *", text: $phone).keyboardType(.phonePad)
                }
                Section("Shipping address") {
                    TextField("Street address *", text: $address)
                    TextField("City *", text: $city)
                    TextField("Country", text: $country)
                }
            }
            .navigationTitle("Shipping details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", action: onDismiss)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Pay") {
                        guard !phone.isEmpty, !address.isEmpty, !city.isEmpty else { return }
                        onConfirm()
                    }.font(.system(size: 16, weight: .bold)).foregroundColor(.hlBlueGlow)
                }
            }
        }.presentationDetents([.medium])
    }
}
