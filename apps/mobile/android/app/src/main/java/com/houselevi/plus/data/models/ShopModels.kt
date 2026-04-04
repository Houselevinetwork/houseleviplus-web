package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

//  Product variant  exact schema 
data class ProductVariant(
    @SerializedName("_id")      val id: String      = "",
    @SerializedName("sku")      val sku: String     = "",
    @SerializedName("title")    val title: String   = "",
    @SerializedName("color")    val color: String?  = null,
    @SerializedName("size")     val size: String?   = null,
    @SerializedName("edition")  val edition: String? = null,
    @SerializedName("price")    val price: Double   = 0.0,
    @SerializedName("stock")    val stock: Int      = 0,
    @SerializedName("barcode")  val barcode: String? = null,
) {
    val inStock: Boolean get() = stock > 0
    val lowStock: Boolean get() = stock in 1..5
    // Label shown in variant chip
    val label: String get() = when {
        size != null && color != null -> "$size / $color"
        size != null    -> size
        color != null   -> color
        edition != null -> edition
        else            -> title
    }
}

//  Product image 
data class ProductImage(
    @SerializedName("url")       val url: String       = "",
    @SerializedName("alt")       val alt: String       = "",
    @SerializedName("isPrimary") val isPrimary: Boolean = false,
    @SerializedName("order")     val order: Int         = 0,
)

//  Product 
data class Product(
    @SerializedName("_id")               val id: String              = "",
    @SerializedName("title")             val title: String           = "",
    @SerializedName("slug")              val slug: String            = "",
    @SerializedName("description")       val description: String     = "",
    @SerializedName("basePrice")         val basePrice: Double       = 0.0,
    @SerializedName("currency")          val currency: String        = "KES",
    @SerializedName("discountPrice")     val discountPrice: Double?  = null,
    @SerializedName("totalStock")        val totalStock: Int         = 0,
    @SerializedName("lowStockThreshold") val lowStockThreshold: Int  = 5,
    @SerializedName("images")           val images: List<ProductImage> = emptyList(),
    @SerializedName("variants")         val variants: List<ProductVariant> = emptyList(),
    @SerializedName("tags")             val tags: List<String>      = emptyList(),
    @SerializedName("isFeatured")       val isFeatured: Boolean     = false,
    @SerializedName("status")           val status: String          = "published",
    @SerializedName("collectionId")     val collectionId: String?   = null,
) {
    val primaryImage: String get() =
        images.firstOrNull { it.isPrimary }?.url
            ?: images.sortedBy { it.order }.firstOrNull()?.url
            ?: ""

    val displayPrice: String get() {
        val p = discountPrice ?: basePrice
        return "$currency ${String.format("%,.0f", p)}"
    }
    val originalPrice: String? get() =
        if (discountPrice != null) "$currency ${String.format("%,.0f", basePrice)}" else null

    val hasDiscount: Boolean get() = discountPrice != null && discountPrice < basePrice
    val inStock: Boolean get() = totalStock > 0
    val isLowStock: Boolean get() = totalStock in 1..lowStockThreshold
}

//  Cart models 
data class CartItem(
    @SerializedName("_id")          val itemId: String     = "",
    @SerializedName("productId")    val productId: String  = "",
    @SerializedName("variantId")    val variantId: String  = "",
    @SerializedName("variantTitle") val variantTitle: String = "",
    @SerializedName("title")        val title: String      = "",
    @SerializedName("price")        val price: Double      = 0.0,
    @SerializedName("currency")     val currency: String   = "KES",
    @SerializedName("quantity")     val quantity: Int      = 1,
    @SerializedName("imageUrl")     val imageUrl: String   = "",
) {
    val lineTotal: Double get() = price * quantity
    val displayPrice: String get() = "$currency ${String.format("%,.0f", price)}"
    val displayTotal: String get() = "$currency ${String.format("%,.0f", lineTotal)}"
}

data class Cart(
    @SerializedName("items")    val items: List<CartItem> = emptyList(),
    @SerializedName("subtotal") val subtotal: Double      = 0.0,
    @SerializedName("currency") val currency: String      = "KES",
) {
    val isEmpty: Boolean get() = items.isEmpty()
    val itemCount: Int get() = items.sumOf { it.quantity }
    val displaySubtotal: String get() = "$currency ${String.format("%,.0f", subtotal)}"
}

//  Request bodies 
data class AddToCartBody(
    val productId: String,
    val variantId: String,
    val variantTitle: String,
    val price: Double,
    val quantity: Int = 1,
)

data class UpdateQuantityBody(val quantity: Int)

data class CreateOrderBody(
    val phone: String,
    val shippingAddress: ShippingAddress,
    val shippingLocation: String,
    val currency: String = "KES",
)

data class ShippingAddress(
    val line1: String,
    val city: String,
    val country: String,
    val postalCode: String = "",
)

//  API responses 
data class ProductsResponse(
    @SerializedName("success") val success: Boolean        = false,
    @SerializedName("data")    val data: List<Product>     = emptyList(),
)
data class ProductResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("data")    val data: Product?   = null,
)
data class CartResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("data")    val data: Cart?      = null,
    // Some endpoints return cart directly
    @SerializedName("items")    val items: List<CartItem>? = null,
    @SerializedName("subtotal") val subtotal: Double?      = null,
) {
    val cart: Cart get() = data ?: Cart(
        items    = items    ?: emptyList(),
        subtotal = subtotal ?: 0.0,
    )
}
data class OrderResponse(
    @SerializedName("success")    val success: Boolean = false,
    @SerializedName("orderId")    val orderId: String  = "",
    @SerializedName("pesapalUrl") val pesapalUrl: String = "",
)
