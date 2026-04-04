import Foundation

struct ProductVariant: Codable, Identifiable, Equatable {
    var id: String = ""
    var sku: String = ""; var title: String = ""
    var color: String?; var size: String?; var edition: String?
    var price: Double = 0; var stock: Int = 0; var barcode: String?

    enum CodingKeys: String, CodingKey {
        case id = "_id"; case sku; case title; case color; case size
        case edition; case price; case stock; case barcode
    }
    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id      = (try? c.decodeIfPresent(String.self, forKey: .id))      ?? ""
        sku     = (try? c.decodeIfPresent(String.self, forKey: .sku))     ?? ""
        title   = (try? c.decodeIfPresent(String.self, forKey: .title))   ?? ""
        color   = try? c.decodeIfPresent(String.self,  forKey: .color)
        size    = try? c.decodeIfPresent(String.self,  forKey: .size)
        edition = try? c.decodeIfPresent(String.self,  forKey: .edition)
        price   = (try? c.decodeIfPresent(Double.self, forKey: .price))   ?? 0
        stock   = (try? c.decodeIfPresent(Int.self,    forKey: .stock))   ?? 0
        barcode = try? c.decodeIfPresent(String.self,  forKey: .barcode)
    }
    var inStock: Bool { stock > 0 }
    var lowStock: Bool { stock > 0 && stock <= 5 }
    var label: String {
        if let s = size, let c = color { return "\(s) / \(c)" }
        if let s = size    { return s }
        if let c = color   { return c }
        if let e = edition { return e }
        return title
    }
}

struct ProductImage: Codable, Equatable {
    var url: String = ""; var alt: String = ""
    var isPrimary: Bool = false; var order: Int = 0
}

struct Product: Codable, Identifiable, Equatable {
    var id: String = ""; var title: String = ""; var slug: String = ""
    var description: String = ""
    var basePrice: Double = 0; var currency: String = "KES"
    var discountPrice: Double?; var totalStock: Int = 0
    var lowStockThreshold: Int = 5
    var images: [ProductImage] = []; var variants: [ProductVariant] = []
    var tags: [String] = []; var isFeatured: Bool = false; var status: String = "published"

    enum CodingKeys: String, CodingKey {
        case id = "_id"; case title; case slug; case description
        case basePrice; case currency; case discountPrice; case totalStock
        case lowStockThreshold; case images; case variants; case tags; case isFeatured; case status
    }
    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id               = (try? c.decodeIfPresent(String.self,           forKey: .id))               ?? ""
        title            = (try? c.decodeIfPresent(String.self,           forKey: .title))            ?? ""
        slug             = (try? c.decodeIfPresent(String.self,           forKey: .slug))             ?? ""
        description      = (try? c.decodeIfPresent(String.self,           forKey: .description))      ?? ""
        basePrice        = (try? c.decodeIfPresent(Double.self,           forKey: .basePrice))        ?? 0
        currency         = (try? c.decodeIfPresent(String.self,           forKey: .currency))         ?? "KES"
        discountPrice    = try? c.decodeIfPresent(Double.self,            forKey: .discountPrice)
        totalStock       = (try? c.decodeIfPresent(Int.self,              forKey: .totalStock))       ?? 0
        lowStockThreshold = (try? c.decodeIfPresent(Int.self,             forKey: .lowStockThreshold)) ?? 5
        images           = (try? c.decodeIfPresent([ProductImage].self,   forKey: .images))           ?? []
        variants         = (try? c.decodeIfPresent([ProductVariant].self, forKey: .variants))         ?? []
        tags             = (try? c.decodeIfPresent([String].self,         forKey: .tags))             ?? []
        isFeatured       = (try? c.decodeIfPresent(Bool.self,             forKey: .isFeatured))       ?? false
        status           = (try? c.decodeIfPresent(String.self,           forKey: .status))           ?? "published"
    }

    var primaryImage: String {
        images.first(where: { $0.isPrimary })?.url
            ?? images.sorted(by: { $0.order < $1.order }).first?.url ?? ""
    }
    var displayPrice: String {
        let p = discountPrice ?? basePrice
        return "\(currency) \(String(format: "%.0f", p))"
    }
    var originalPrice: String? {
        guard let d = discountPrice, d < basePrice else { return nil }
        return "\(currency) \(String(format: "%.0f", basePrice))"
    }
    var hasDiscount: Bool { discountPrice != nil && (discountPrice ?? 0) < basePrice }
    var inStock: Bool { totalStock > 0 }
    var isLowStock: Bool { totalStock > 0 && totalStock <= lowStockThreshold }
}

struct CartItem: Codable, Identifiable, Equatable {
    var id: String = ""
    var productId: String = ""; var variantId: String = ""; var variantTitle: String = ""
    var title: String = ""; var price: Double = 0; var currency: String = "KES"
    var quantity: Int = 1; var imageUrl: String = ""
    enum CodingKeys: String, CodingKey {
        case id = "_id"; case productId; case variantId; case variantTitle
        case title; case price; case currency; case quantity; case imageUrl
    }
    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id           = (try? c.decodeIfPresent(String.self, forKey: .id))           ?? ""
        productId    = (try? c.decodeIfPresent(String.self, forKey: .productId))    ?? ""
        variantId    = (try? c.decodeIfPresent(String.self, forKey: .variantId))    ?? ""
        variantTitle = (try? c.decodeIfPresent(String.self, forKey: .variantTitle)) ?? ""
        title        = (try? c.decodeIfPresent(String.self, forKey: .title))        ?? ""
        price        = (try? c.decodeIfPresent(Double.self, forKey: .price))        ?? 0
        currency     = (try? c.decodeIfPresent(String.self, forKey: .currency))     ?? "KES"
        quantity     = (try? c.decodeIfPresent(Int.self,    forKey: .quantity))     ?? 1
        imageUrl     = (try? c.decodeIfPresent(String.self, forKey: .imageUrl))     ?? ""
    }
    var lineTotal: Double { price * Double(quantity) }
    var displayPrice: String { "\(currency) \(String(format: "%.0f", price))" }
    var displayTotal: String { "\(currency) \(String(format: "%.0f", lineTotal))" }
}

struct Cart: Codable, Equatable {
    var items: [CartItem] = []; var subtotal: Double = 0; var currency: String = "KES"
    var isEmpty: Bool { items.isEmpty }
    var itemCount: Int { items.reduce(0) { $0 + $1.quantity } }
    var displaySubtotal: String { "\(currency) \(String(format: "%.0f", subtotal))" }
}

struct ProductsResponse: Codable { var success: Bool = false; var data: [Product] = [] }
struct ProductResponse: Codable  { var success: Bool = false; var data: Product? }
struct CartResponse: Codable {
    var success: Bool = false; var data: Cart?
    var items: [CartItem]?; var subtotal: Double?
    var cart: Cart { data ?? Cart(items: items ?? [], subtotal: subtotal ?? 0) }
}
struct OrderResponse: Codable {
    var success: Bool = false; var orderId: String = ""; var pesapalUrl: String = ""
}
struct AddToCartBody: Encodable {
    var productId: String; var variantId: String; var variantTitle: String
    var price: Double; var quantity: Int
}
struct UpdateQuantityBody: Encodable { var quantity: Int }
struct CreateOrderBody: Encodable {
    var phone: String
    var shippingAddress: ShippingAddress
    var shippingLocation: String
    var currency: String = "KES"
}
struct ShippingAddress: Encodable { var line1: String; var city: String; var country: String; var postalCode: String = "" }
