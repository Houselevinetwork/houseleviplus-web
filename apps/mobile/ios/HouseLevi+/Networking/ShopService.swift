import Foundation

extension HLAPIClient {
    func getProducts() async throws -> ProductsResponse {
        try await request(method: "GET", path: "commerce/products")
    }
    func getProductById(_ id: String) async throws -> ProductResponse {
        try await request(method: "GET", path: "commerce/products/\(id)")
    }
    func getCart(auth: String) async throws -> CartResponse {
        try await request(method: "GET", path: "commerce/cart", authToken: auth)
    }
    func addToCart(auth: String, body: AddToCartBody) async throws -> CartResponse {
        try await request(method: "POST", path: "commerce/cart/items", body: body, authToken: auth)
    }
    func updateCartQuantity(auth: String, itemId: String, body: UpdateQuantityBody) async throws -> CartResponse {
        try await request(method: "PATCH", path: "commerce/cart/items/\(itemId)", body: body, authToken: auth)
    }
    func removeCartItem(auth: String, itemId: String) async throws -> CartResponse {
        try await request(method: "DELETE", path: "commerce/cart/items/\(itemId)", authToken: auth)
    }
    func createOrder(auth: String, body: CreateOrderBody) async throws -> OrderResponse {
        try await request(method: "POST", path: "commerce/orders", body: body, authToken: auth)
    }
}
