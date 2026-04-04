import Foundation

@MainActor
final class ShopHomeViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = true
    @Published var error: String? = nil
    init() { Task { await load() } }
    func load() async {
        isLoading = true; error = nil
        do { products = try await HLAPIClient.shared.getProducts().data }
        catch { self.error = "Failed to load products." }
        isLoading = false
    }
}

@MainActor
final class ProductDetailViewModel: ObservableObject {
    @Published var product: Product? = nil
    @Published var selectedVariant: ProductVariant? = nil
    @Published var quantity = 1
    @Published var isLoading = true
    @Published var addedToCart = false
    @Published var error: String? = nil

    func load(productId: String) async {
        isLoading = true
        do {
            product = try await HLAPIClient.shared.getProductById(productId).data
            selectedVariant = product?.variants.first(where: { $0.inStock }) ?? product?.variants.first
        } catch { self.error = "Failed to load product." }
        isLoading = false
    }
    func selectVariant(_ v: ProductVariant) { selectedVariant = v; addedToCart = false }
    func setQuantity(_ q: Int) { quantity = max(1, min(q, 10)) }

    func addToCart(auth: String) async {
        guard let p = product, let v = selectedVariant else { return }
        do {
            _ = try await HLAPIClient.shared.addToCart(auth: auth, body: AddToCartBody(
                productId: p.id, variantId: v.id, variantTitle: v.title,
                price: v.price > 0 ? v.price : p.basePrice, quantity: quantity))
            addedToCart = true
        } catch {}
    }
}

@MainActor
final class CartViewModel: ObservableObject {
    @Published var cart = Cart()
    @Published var isLoading = true
    @Published var checkoutUrl: String? = nil
    @Published var error: String? = nil

    func load(auth: String) async {
        isLoading = true
        do { cart = try await HLAPIClient.shared.getCart(auth: auth).cart }
        catch { self.error = "Failed to load cart." }
        isLoading = false
    }
    func updateQuantity(auth: String, itemId: String, qty: Int) async {
        do { cart = try await HLAPIClient.shared.updateCartQuantity(auth: auth, itemId: itemId, body: UpdateQuantityBody(quantity: qty)).cart }
        catch {}
    }
    func removeItem(auth: String, itemId: String) async {
        do { cart = try await HLAPIClient.shared.removeCartItem(auth: auth, itemId: itemId).cart }
        catch {}
    }
    func checkout(auth: String, phone: String, address: ShippingAddress, location: String) async {
        do {
            let res = try await HLAPIClient.shared.createOrder(auth: auth, body: CreateOrderBody(
                phone: phone, shippingAddress: address, shippingLocation: location))
            if !res.pesapalUrl.isEmpty { checkoutUrl = res.pesapalUrl }
            else { error = "Checkout failed. Please try again." }
        } catch { self.error = "Network error. Please try again." }
    }
}
