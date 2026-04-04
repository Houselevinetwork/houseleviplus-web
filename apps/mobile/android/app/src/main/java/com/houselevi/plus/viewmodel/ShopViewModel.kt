package com.houselevi.plus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

//  Shop Home 
data class ShopHomeState(
    val isLoading: Boolean        = true,
    val products: List<Product>   = emptyList(),
    val error: String?            = null,
)

class ShopHomeViewModel : ViewModel() {
    private val _state = MutableStateFlow(ShopHomeState())
    val state: StateFlow<ShopHomeState> = _state
    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = ShopHomeState(isLoading = true)
            try {
                val res = HLApiClient.shopApi.getProducts()
                _state.value = ShopHomeState(isLoading = false, products = res.body()?.data ?: emptyList())
            } catch (e: Exception) {
                _state.value = ShopHomeState(isLoading = false, error = "Failed to load products.")
            }
        }
    }
}

//  Product Detail 
data class ProductDetailState(
    val isLoading: Boolean          = true,
    val product: Product?           = null,
    val selectedVariant: ProductVariant? = null,
    val quantity: Int               = 1,
    val addedToCart: Boolean        = false,
    val error: String?              = null,
)

class ProductDetailViewModel : ViewModel() {
    private val _state = MutableStateFlow(ProductDetailState())
    val state: StateFlow<ProductDetailState> = _state

    fun load(productId: String) {
        viewModelScope.launch {
            _state.value = ProductDetailState(isLoading = true)
            try {
                val res = HLApiClient.shopApi.getProductById(productId)
                val product = res.body()?.data
                _state.value = ProductDetailState(
                    isLoading = false,
                    product = product,
                    selectedVariant = product?.variants?.firstOrNull { it.inStock }
                        ?: product?.variants?.firstOrNull(),
                )
            } catch (e: Exception) {
                _state.value = ProductDetailState(isLoading = false, error = "Failed to load product.")
            }
        }
    }

    fun selectVariant(v: ProductVariant) {
        _state.value = _state.value.copy(selectedVariant = v, addedToCart = false)
    }

    fun setQuantity(q: Int) {
        _state.value = _state.value.copy(quantity = q.coerceIn(1, 10))
    }

    fun addToCart(auth: String) {
        val state = _state.value
        val product = state.product ?: return
        val variant = state.selectedVariant ?: return
        viewModelScope.launch {
            try {
                HLApiClient.shopApi.addToCart(
                    auth = "Bearer $auth",
                    body = AddToCartBody(
                        productId    = product.id,
                        variantId    = variant.id,
                        variantTitle = variant.title,
                        price        = variant.price.takeIf { it > 0 } ?: product.basePrice,
                        quantity     = state.quantity,
                    )
                )
                _state.value = _state.value.copy(addedToCart = true)
            } catch (_: Exception) {}
        }
    }
}

//  Cart 
data class CartState(
    val isLoading: Boolean  = true,
    val cart: Cart          = Cart(),
    val checkoutUrl: String? = null,
    val error: String?      = null,
)

class CartViewModel : ViewModel() {
    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state

    fun load(auth: String) {
        viewModelScope.launch {
            _state.value = CartState(isLoading = true)
            try {
                val res = HLApiClient.shopApi.getCart("Bearer $auth")
                _state.value = CartState(isLoading = false, cart = res.body()?.cart ?: Cart())
            } catch (e: Exception) {
                _state.value = CartState(isLoading = false, error = "Failed to load cart.")
            }
        }
    }

    fun updateQuantity(auth: String, itemId: String, qty: Int) {
        viewModelScope.launch {
            try {
                val res = HLApiClient.shopApi.updateQuantity("Bearer $auth", itemId, UpdateQuantityBody(qty))
                res.body()?.cart?.let { _state.value = _state.value.copy(cart = it) }
            } catch (_: Exception) {}
        }
    }

    fun removeItem(auth: String, itemId: String) {
        viewModelScope.launch {
            try {
                val res = HLApiClient.shopApi.removeItem("Bearer $auth", itemId)
                res.body()?.cart?.let { _state.value = _state.value.copy(cart = it) }
            } catch (_: Exception) {}
        }
    }

    fun checkout(auth: String, phone: String, address: ShippingAddress, location: String) {
        viewModelScope.launch {
            try {
                val res = HLApiClient.shopApi.createOrder(
                    "Bearer $auth",
                    CreateOrderBody(phone = phone, shippingAddress = address, shippingLocation = location)
                )
                val url = res.body()?.pesapalUrl
                if (!url.isNullOrBlank()) _state.value = _state.value.copy(checkoutUrl = url)
                else _state.value = _state.value.copy(error = "Checkout failed. Please try again.")
            } catch (e: Exception) {
                _state.value = _state.value.copy(error = "Network error. Please try again.")
            }
        }
    }

    fun clearCheckoutUrl() { _state.value = _state.value.copy(checkoutUrl = null) }
}
