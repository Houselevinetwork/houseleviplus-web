package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class ProductImage(
    @SerializedName("url") val url: String = "",
    @SerializedName("alt") val alt: String = "",
)

data class ProductVariantApi(
    @SerializedName("_id")   val id: String    = "",
    @SerializedName("title") val title: String = "",
    @SerializedName("price") val price: Double = 0.0,
    @SerializedName("stock") val stock: Int    = 0,
    @SerializedName("sku")   val sku: String   = "",
)

/**
 * API-backed product from GET /api/commerce/products
 * Mirrors web shop normProduct() helper — handles _id/id, name/title,
 * price/basePrice, images[].url / imageUrl.
 */
data class Product(
    @SerializedName("_id")         val id: String                        = "",
    @SerializedName("name")        val name: String                      = "",
    @SerializedName("price")       val price: Double                     = 0.0,
    @SerializedName("basePrice")   val basePrice: Double                 = 0.0,
    @SerializedName("salePrice")   val salePrice: Double?                = null,
    @SerializedName("onSale")      val onSale: Boolean                   = false,
    @SerializedName("images")      val images: List<ProductImage>        = emptyList(),
    @SerializedName("imageUrl")    val imageUrl: String?                 = null,
    @SerializedName("category")    val category: String?                 = null,
    @SerializedName("isFeatured")  val isFeatured: Boolean               = false,
    @SerializedName("stock")       val stock: Int                        = 0,
    @SerializedName("variants")    val variants: List<ProductVariantApi> = emptyList(),
    @SerializedName("tags")        val tags: List<String>                = emptyList(),
    @SerializedName("slug")        val slug: String                      = "",
    @SerializedName("description") val description: String               = "",
) {
    /** First image URL, falls back to imageUrl field */
    val thumbnailUrl: String?
        get() = images.firstOrNull()?.url?.takeIf { it.isNotBlank() }
               ?: imageUrl?.takeIf { it.isNotBlank() }

    /** Effective price — sale price if available, otherwise base/regular price */
    val displayPrice: Double
        get() = salePrice ?: price.takeIf { it > 0.0 } ?: basePrice
}

/**
 * /api/commerce/products  →  { "data": [ Product, … ] }
 */
data class ProductsResponse(
    @SerializedName("data") val data: List<Product> = emptyList(),
)
