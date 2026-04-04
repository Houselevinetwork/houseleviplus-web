package com.houselevi.plus.ui.screens.shop

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// ─────────────────────────────────────────────────────
//  HAND-CODED PRODUCT DATA
// ─────────────────────────────────────────────────────

data class ProductVariant(
    val id:    String,
    val label: String,
    val stock: Int,
)

data class ProductDetail(
    val id:          String,
    val name:        String,
    val collection:  String,
    val price:       Int,
    val salePrice:   Int?,
    val description: String,
    val material:    String,
    val fit:         String,
    val origin:      String,
    val variants:    List<ProductVariant>,
    val tags:        List<String>,
)

val MOCK_PRODUCTS = mapOf(
    "1" to ProductDetail(
        id          = "1",
        name        = "Levi's Old Money — Navy Blazer",
        collection  = "Old Money Closet",
        price       = 241,
        salePrice   = 181,
        description = "The signature piece from Levi's Old Money Closet. Crafted in a premium wool-blend fabric with a refined slim silhouette. Perfect for formal occasions or elevating a smart-casual look. Finished with hand-stitched lapel detailing and satin lining.",
        material    = "95% Wool, 5% Cashmere",
        fit         = "Slim / Tailored",
        origin      = "Made in Italy",
        variants    = listOf(
            ProductVariant("v1", "S",   8),
            ProductVariant("v2", "M",   6),
            ProductVariant("v3", "L",   5),
            ProductVariant("v4", "XL",  3),
            ProductVariant("v5", "XXL", 2),
        ),
        tags = listOf("old-money", "blazer", "formal"),
    ),
    "2" to ProductDetail(
        id          = "2",
        name        = "Levi's Old Money — Elegant Jacket",
        collection  = "Old Money Closet",
        price       = 146,
        salePrice   = 103,
        description = "A versatile Old Money jacket built for the modern gentleman. Clean lines, premium fabric, and a cut that works from the boardroom to the weekend.",
        material    = "100% Merino Wool",
        fit         = "Regular / Classic",
        origin      = "Made in Portugal",
        variants    = listOf(
            ProductVariant("v1", "S",  4),
            ProductVariant("v2", "M",  9),
            ProductVariant("v3", "L",  7),
            ProductVariant("v4", "XL", 3),
        ),
        tags = listOf("old-money", "jacket"),
    ),
    "3" to ProductDetail(
        id          = "3",
        name        = "HL Aviation Leather Jacket",
        collection  = "Aviation Gear",
        price       = 320,
        salePrice   = 249,
        description = "Inspired by classic aviator jackets worn by pilots of the golden age. Full-grain leather, YKK hardware, and a removable shearling collar. A piece that only gets better with time.",
        material    = "Full-Grain Leather",
        fit         = "Regular",
        origin      = "Made in Spain",
        variants    = listOf(
            ProductVariant("v1", "S",  2),
            ProductVariant("v2", "M",  5),
            ProductVariant("v3", "L",  4),
            ProductVariant("v4", "XL", 1),
        ),
        tags = listOf("aviation", "leather", "jacket"),
    ),
    "6" to ProductDetail(
        id          = "6",
        name        = "Mercedes 300SL Die-Cast 1:18",
        collection  = "Car Collectibles",
        price       = 240,
        salePrice   = 119,
        description = "A meticulously detailed 1:18 scale die-cast replica of the iconic Mercedes-Benz 300SL Gullwing. Opening gull-wing doors, functional suspension, and hand-painted details. A collector's piece for the discerning enthusiast.",
        material    = "Die-Cast Metal + ABS Plastic",
        fit         = "1:18 Scale",
        origin      = "Manufactured in Germany",
        variants    = listOf(
            ProductVariant("v1", "Silver",  6),
            ProductVariant("v2", "Red",     4),
            ProductVariant("v3", "Black",   3),
        ),
        tags = listOf("mercedes", "collectible", "cars"),
    ),
)

// Fallback product
val DEFAULT_PRODUCT = MOCK_PRODUCTS["1"]!!

// ─────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId:   String = "1",
    accessToken: String = "",
    onBack:      () -> Unit = {},
    onGoToCart:  () -> Unit = {},
) {
    val product         = MOCK_PRODUCTS[productId] ?: DEFAULT_PRODUCT
    var selectedVariant by remember { mutableStateOf(product.variants.first()) }
    var quantity        by remember { mutableIntStateOf(1) }
    var addedToCart     by remember { mutableStateOf(false) }
    var activeTab       by remember { mutableStateOf(0) } // 0=Description, 1=Details, 2=Shipping

    val isOnSale    = product.salePrice != null
    val displayPrice = product.salePrice ?: product.price
    val savePct     = if (isOnSale) ((product.price - displayPrice) * 100) / product.price else 0

    Scaffold(
        containerColor = HLBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text      = product.collection.uppercase(),
                        color     = HLTextMuted,
                        fontSize  = 11.sp,
                        letterSpacing = 1.5.sp,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = HLTextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = onGoToCart) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = HLTextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = HLBlack),
            )
        },
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState()),
        ) {

            // ── Product image placeholder ─────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(340.dp)
                    .background(Color(0xFF141414)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text       = "HL",
                    color      = Color(0xFF2A2A2A),
                    fontSize   = 80.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 6.sp,
                )
                // Sale badge
                if (isOnSale) {
                    Row(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(14.dp),
                    ) {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFDC2626))
                                .padding(horizontal = 10.dp, vertical = 4.dp),
                        ) {
                            Text(
                                text      = "SALE — $savePct% OFF",
                                color     = Color.White,
                                fontSize  = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.8.sp,
                            )
                        }
                    }
                }
            }

            // ── Info section ─────────────────────────────────────────────
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 20.dp),
            ) {

                // Name
                Text(
                    text       = product.name,
                    color      = HLTextPrimary,
                    fontSize   = 22.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 28.sp,
                )

                Spacer(Modifier.height(10.dp))

                // Price
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    if (isOnSale) {
                        Text(
                            text  = "\$${product.price}.00 USD",
                            color = HLTextMuted,
                            fontSize = 14.sp,
                            style = LocalTextStyle.current.copy(textDecoration = TextDecoration.LineThrough),
                        )
                    }
                    Text(
                        text       = "\$${displayPrice}.00 USD",
                        color      = if (isOnSale) Color(0xFFDC2626) else HLTextPrimary,
                        fontSize   = 24.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }

                Spacer(Modifier.height(20.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(20.dp))

                // ── Variant selector ──────────────────────────────────────
                Text(
                    text       = if (product.collection == "Car Collectibles") "Colour" else "Size",
                    color      = HLTextPrimary,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.8.sp,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text  = "Selected: ${selectedVariant.label}",
                    color = HLTextMuted,
                    fontSize = 12.sp,
                )
                Spacer(Modifier.height(12.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                ) {
                    product.variants.forEach { v ->
                        val selected  = selectedVariant.id == v.id
                        val outOfStock = v.stock == 0
                        Box(
                            modifier = Modifier
                                .height(42.dp)
                                .widthIn(min = 52.dp)
                                .background(
                                    if (selected) HLBlueGlow else Color.Transparent
                                )
                                .border(
                                    1.dp,
                                    if (selected) HLBlueGlow
                                    else if (outOfStock) Color.White.copy(alpha = 0.15f)
                                    else Color.White.copy(alpha = 0.3f),
                                )
                                .clickable(enabled = !outOfStock) { selectedVariant = v }
                                .padding(horizontal = 16.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text  = v.label,
                                color = if (selected) Color.Black
                                        else if (outOfStock) HLTextMuted
                                        else HLTextPrimary,
                                fontSize   = 13.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                            )
                        }
                    }
                }

                Spacer(Modifier.height(20.dp))

                // Stock indicator
                val stockColor = when {
                    selectedVariant.stock == 0 -> Color(0xFFDC2626)
                    selectedVariant.stock <= 3  -> Color(0xFFEF8C00)
                    else -> Color(0xFF00B77F)
                }
                Text(
                    text = when {
                        selectedVariant.stock == 0 -> "Out of stock"
                        selectedVariant.stock <= 3  -> "⚠ Only ${selectedVariant.stock} left"
                        else -> "✓ In stock"
                    },
                    color    = stockColor,
                    fontSize = 12.sp,
                    letterSpacing = 0.4.sp,
                )

                Spacer(Modifier.height(20.dp))

                // ── Quantity stepper ──────────────────────────────────────
                Text(
                    text       = "Quantity",
                    color      = HLTextPrimary,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.8.sp,
                )
                Spacer(Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .border(1.dp, Color.White.copy(alpha = 0.2f))
                        .height(44.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    IconButton(
                        onClick  = { if (quantity > 1) quantity-- },
                        enabled  = quantity > 1,
                        modifier = Modifier.size(44.dp),
                    ) {
                        Text("−", color = if (quantity > 1) HLTextPrimary else HLTextMuted, fontSize = 20.sp)
                    }
                    Text(
                        text      = "$quantity",
                        color     = HLTextPrimary,
                        fontSize  = 15.sp,
                        modifier  = Modifier.width(36.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                    IconButton(
                        onClick  = { if (quantity < selectedVariant.stock) quantity++ },
                        enabled  = quantity < selectedVariant.stock,
                        modifier = Modifier.size(44.dp),
                    ) {
                        Text("+", color = if (quantity < selectedVariant.stock) HLTextPrimary else HLTextMuted, fontSize = 20.sp)
                    }
                }

                Spacer(Modifier.height(20.dp))

                // ── Add to cart + Buy Now ─────────────────────────────────
                val outOfStock = selectedVariant.stock == 0

                Button(
                    onClick  = {
                        if (!outOfStock) {
                            addedToCart = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    enabled = !outOfStock,
                    shape   = RoundedCornerShape(2.dp),
                    colors  = ButtonDefaults.buttonColors(
                        containerColor = if (addedToCart) Color(0xFF00B77F) else HLTextPrimary,
                        disabledContainerColor = Color(0xFF444444),
                    ),
                ) {
                    Text(
                        text = when {
                            outOfStock  -> "Out of Stock"
                            addedToCart -> "✓ Added to Cart"
                            else        -> "Add to Cart"
                        },
                        color      = Color.Black,
                        fontSize   = 14.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                    )
                }

                Spacer(Modifier.height(10.dp))

                OutlinedButton(
                    onClick  = {},
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    enabled = !outOfStock,
                    shape   = RoundedCornerShape(2.dp),
                    border  = BorderStroke(1.dp, if (outOfStock) HLTextMuted else HLTextPrimary),
                    colors  = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                ) {
                    Text(
                        text       = "Buy Now",
                        fontSize   = 14.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                    )
                }

                Spacer(Modifier.height(24.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(20.dp))

                // ── Trust badges ──────────────────────────────────────────
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    listOf("Free Shipping\n over \$150", "Secure\nCheckout", "30-Day\nReturns").forEach { label ->
                        Text(
                            text      = label,
                            color     = HLTextMuted,
                            fontSize  = 10.sp,
                            letterSpacing = 0.4.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 14.sp,
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.08f))
                Spacer(Modifier.height(16.dp))

                // ── Tabs ──────────────────────────────────────────────────
                Row(horizontalArrangement = Arrangement.spacedBy(0.dp)) {
                    listOf("Description", "Details", "Shipping").forEachIndexed { i, label ->
                        val selected = activeTab == i
                        Box(
                            modifier = Modifier
                                .clickable { activeTab = i }
                                .padding(bottom = 8.dp)
                                .border(
                                    width  = 0.dp,
                                    color  = Color.Transparent,
                                    shape  = RoundedCornerShape(0.dp),
                                )
                                .padding(end = 24.dp),
                            contentAlignment = Alignment.BottomCenter,
                        ) {
                            Column {
                                Text(
                                    text       = label,
                                    color      = if (selected) HLTextPrimary else HLTextMuted,
                                    fontSize   = 13.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                                    letterSpacing = 0.8.sp,
                                )
                                Spacer(Modifier.height(6.dp))
                                if (selected) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(2.dp)
                                            .background(HLBlueGlow),
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))

                when (activeTab) {
                    0 -> Text(
                        text      = product.description,
                        color     = HLTextMuted,
                        fontSize  = 14.sp,
                        lineHeight = 22.sp,
                        letterSpacing = 0.3.sp,
                    )
                    1 -> Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        listOf(
                            "Material" to product.material,
                            "Fit / Scale" to product.fit,
                            "Origin" to product.origin,
                            "SKU" to "HL-${product.id}-${selectedVariant.label}",
                        ).forEach { (label, value) ->
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(label, color = HLTextMuted, fontSize = 13.sp, modifier = Modifier.width(90.dp))
                                Text(value, color = HLTextPrimary, fontSize = 13.sp)
                            }
                        }
                    }
                    2 -> Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        listOf(
                            "Standard"      to "Kenya: 3–5 business days · Free over KES 15,000",
                            "Express"       to "Kenya: 1–2 business days · KES 800",
                            "International" to "US/EU: 7–14 business days via DHL",
                            "Returns"       to "Free returns within 30 days",
                        ).forEach { (label, value) ->
                            Column {
                                Text(label, color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.height(3.dp))
                                Text(value, color = HLTextMuted, fontSize = 13.sp, lineHeight = 19.sp)
                            }
                        }
                    }
                }

                Spacer(Modifier.height(24.dp))

                // Tags
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                ) {
                    product.tags.forEach { tag ->
                        Box(
                            modifier = Modifier
                                .border(1.dp, Color.White.copy(alpha = 0.15f))
                                .padding(horizontal = 12.dp, vertical = 5.dp),
                        ) {
                            Text(
                                text  = "#$tag",
                                color = HLTextMuted,
                                fontSize = 11.sp,
                                letterSpacing = 0.6.sp,
                            )
                        }
                    }
                }

                Spacer(Modifier.height(32.dp))
            }
        }
    }
}