package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ShopApi {

    // ── Public product endpoints ──────────────────────────────
    // FIX: was "commerce/products" — must be "api/commerce/products"
    // (backend route: GET /api/commerce/products  see server logs)
    @GET("api/commerce/products")
    suspend fun getProducts(
        @Query("limit") limit: Int   = 20,
        @Query("sort")  sort: String = "featured",
    ): Response<ProductsResponse>

    @GET("api/commerce/products/{id}")
    suspend fun getProductById(
        @Path("id") id: String,
    ): Response<Any>

    @GET("api/commerce/products/collection/{collectionId}")
    suspend fun getByCollection(
        @Path("collectionId") id: String,
    ): Response<ProductsResponse>

    @GET("api/commerce/collections")
    suspend fun getCollections(): Response<Any>

    // ── Cart (JWT required) ───────────────────────────────────
    @GET("commerce/cart")
    suspend fun getCart(
        @Header("Authorization") auth: String,
    ): Response<Any>

    @POST("commerce/cart/items")
    suspend fun addToCart(
        @Header("Authorization") auth: String,
        @Body body: AddToCartBody,
    ): Response<Any>

    @PATCH("commerce/cart/items/{itemId}")
    suspend fun updateQuantity(
        @Header("Authorization") auth: String,
        @Path("itemId") itemId: String,
        @Body body: UpdateQuantityBody,
    ): Response<Any>

    @DELETE("commerce/cart/items/{itemId}")
    suspend fun removeItem(
        @Header("Authorization") auth: String,
        @Path("itemId") itemId: String,
    ): Response<Any>

    @DELETE("commerce/cart")
    suspend fun clearCart(
        @Header("Authorization") auth: String,
    ): Response<Any>

    // ── Orders (JWT required) ─────────────────────────────────
    @POST("commerce/orders")
    suspend fun createOrder(
        @Header("Authorization") auth: String,
        @Body body: CreateOrderBody,
    ): Response<Any>
}
