package com.houselevi.plus.ui.screens.shop

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  DATA MODELS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

data class ShopProduct(
    val id: String,
    val name: String,
    val collection: String,
    val price: Int,
    val salePrice: Int? = null,
    val onSale: Boolean = false,
    val isFeatured: Boolean = false,
)

data class ShopCollection(
    val id: String,
    val name: String,
    val slug: String,
    val itemCount: Int,
)

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  HAND-CODED DATA
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

val BEST_SELLERS = listOf(
    ShopProduct("1",  "Levi's Old Money â€” Navy Blazer",    "Old Money Closet", 241, 181, true,  true),
    ShopProduct("2",  "Levi's Old Money â€” Elegant Jacket", "Old Money Closet", 146, 103, true,  true),
    ShopProduct("3",  "HL Aviation Leather Jacket",        "Aviation Gear",    320, 249, true,  true),
    ShopProduct("4",  "Boeing 747 Scale Model â€” 1:200",    "Collectibles",      61,  42, true,  false),
    ShopProduct("5",  "Levi Merino Zip Sweater",           "Old Money Closet",  85,  72, true,  false),
    ShopProduct("6",  "Mercedes 300SL Die-Cast 1:18",      "Car Collectibles", 240, 119, true,  true),
    ShopProduct("7",  "HL Studio Hoodie â€” Classic",        "HL Merch",         109,  72, true,  false),
    ShopProduct("8",  "Levi Reads â€” Book Bundle",          "Book Club",         97,  79, true,  false),
    ShopProduct("9",  "Concorde 1:144 Scale Model",        "Collectibles",     223, 109, true,  false),
    ShopProduct("10", "Levi's Half-Zip Casentino",         "Old Money Closet",  85,  66, true,  false),
    ShopProduct("11", "HouseLevi+ Signature Cap",          "HL Merch",          72,  60, true,  false),
    ShopProduct("12", "Levi's Old Money Polo",             "Old Money Closet",  66, null,false, false),
)

val COLLECTIONS = listOf(
    ShopCollection("1", "Levi's Old Money Closet",     "old-money-closet",   12),
    ShopCollection("2", "Aviation Gear & Accessories", "aviation-gear",       8),
    ShopCollection("3", "Scale Collectibles",          "scale-collectibles",  9),
    ShopCollection("4", "Host Merch",                  "host-merch",          6),
    ShopCollection("5", "Book Club Picks",             "book-club",           5),
    ShopCollection("6", "HL Branded Merch",            "hl-merch",            7),
    ShopCollection("7", "Partner Brands",              "partner-brands",      4),
    ShopCollection("8", "Car Collectibles",            "car-collectibles",    6),
)

val ANNOUNCEMENTS = listOf(
    "10% OFF orders over \$100 Â· CODE: HLVIP",
    "Free Shipping on orders over \$150",
    "New Host Drops every Friday",
)

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  SCREEN
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
fun ShopHomeScreen(
    onProductClick: (String) -> Unit = {},
    onCartClick:    ()       -> Unit = {},
    onViewAllClick: ()       -> Unit = {},
) {
    var annIdx by remember { mutableIntStateOf(0) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {

        // â”€â”€ Announcement bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF111111))
                    .padding(vertical = 10.dp, horizontal = 48.dp),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text          = ANNOUNCEMENTS[annIdx],
                    color         = HLTextPrimary,
                    fontSize      = 11.sp,
                    fontWeight    = FontWeight.Medium,
                    letterSpacing = 0.8.sp,
                )
            }
            HorizontalDivider(color = Color.White.copy(alpha = 0.06f))
        }

        // â”€â”€ Hero banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .background(Brush.verticalGradient(listOf(Color(0xFF0D0D1A), Color(0xFF0A0A0A)))),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text          = "LEVI'S CLOSET+",
                        color         = HLTextPrimary,
                        fontSize      = 32.sp,
                        fontWeight    = FontWeight.Black,
                        letterSpacing = 4.sp,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(text = "Official Store", color = HLTextMuted, fontSize = 13.sp, letterSpacing = 2.sp)
                    Spacer(Modifier.height(20.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedButton(
                            onClick        = onViewAllClick,
                            border         = BorderStroke(1.dp, HLTextPrimary),
                            shape          = RoundedCornerShape(2.dp),
                            colors         = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
                        ) {
                            Text("All Products", fontSize = 12.sp, letterSpacing = 1.sp)
                        }
                        OutlinedButton(
                            onClick        = onCartClick,
                            border         = BorderStroke(1.dp, HLBlueGlow),
                            shape          = RoundedCornerShape(2.dp),
                            colors         = ButtonDefaults.outlinedButtonColors(contentColor = HLBlueGlow),
                            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp),
                        ) {
                            Icon(Icons.Default.ShoppingCart, null, Modifier.size(15.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Cart", fontSize = 12.sp, letterSpacing = 1.sp)
                        }
                    }
                }
            }
        }

        // â”€â”€ Best Sellers heading + View All link â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Spacer(Modifier.height(28.dp))
            Row(
                modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                Text("Best Sellers", color = HLTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                TextButton(onClick = onViewAllClick) {
                    Text("View All â†’", color = HLBlueGlow, fontSize = 12.sp)
                }
            }
            Spacer(Modifier.height(14.dp))
        }

        // â”€â”€ Best Sellers horizontal scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            LazyRow(
                contentPadding        = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(BEST_SELLERS) { product ->
                    ProductCard(product = product, onClick = { onProductClick(product.id) }, cardWidth = 160.dp)
                }
            }
        }

        // â”€â”€ Prominent View All Products button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Spacer(Modifier.height(20.dp))
            Button(
                onClick  = onViewAllClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .height(48.dp),
                shape    = RoundedCornerShape(2.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = Color(0xFF151515)),
                border   = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
            ) {
                Text(
                    text          = "View All Products  â†’",
                    color         = HLTextPrimary,
                    fontSize      = 13.sp,
                    fontWeight    = FontWeight.Medium,
                    letterSpacing = 1.sp,
                )
            }
        }

        // â”€â”€ Collections heading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Spacer(Modifier.height(36.dp))
            Text(
                text          = "Shop by Collection",
                color         = HLTextPrimary,
                fontSize      = 18.sp,
                fontWeight    = FontWeight.Bold,
                letterSpacing = 0.5.sp,
                modifier      = Modifier.padding(horizontal = 16.dp),
            )
            Spacer(Modifier.height(16.dp))
        }

        // â”€â”€ Collections 2-column grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        items(COLLECTIONS.chunked(2)) { row ->
            Row(
                modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                row.forEach { col ->
                    CollectionCard(collection = col, modifier = Modifier.weight(1f))
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
        }

        // â”€â”€ Featured heading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Spacer(Modifier.height(36.dp))
            Row(
                modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                Text("Featured This Week", color = HLTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                TextButton(onClick = onViewAllClick) {
                    Text("See All â†’", color = HLBlueGlow, fontSize = 12.sp)
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        // â”€â”€ Featured 2-col grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        items(BEST_SELLERS.filter { it.isFeatured }.chunked(2)) { row ->
            Row(
                modifier              = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                row.forEach { product ->
                    ProductCard(product = product, onClick = { onProductClick(product.id) }, cardWidth = 0.dp, modifier = Modifier.weight(1f))
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
        }
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  PRODUCT CARD (shared with AllProductsScreen)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
fun ProductCard(
    product:   ShopProduct,
    onClick:   () -> Unit,
    cardWidth: Dp = 0.dp,
    modifier:  Modifier = Modifier,
) {
    val baseModifier = if (cardWidth > 0.dp) modifier.width(cardWidth) else modifier

    Column(modifier = baseModifier.clickable(onClick = onClick)) {
        Box(
            modifier = Modifier.fillMaxWidth().aspectRatio(1f).background(Color(0xFF1A1A1A)),
            contentAlignment = Alignment.Center,
        ) {
            Text("HL", color = Color(0xFF333333), fontSize = 28.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
            if (product.onSale) {
                Box(
                    modifier = Modifier.align(Alignment.BottomEnd).padding(8.dp)
                        .background(Color(0xFFDC2626)).padding(horizontal = 8.dp, vertical = 3.dp),
                ) { Text("Sale", color = Color.White, fontSize = 10.sp, letterSpacing = 0.8.sp) }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(product.collection.uppercase(), color = HLTextMuted, fontSize = 9.sp, letterSpacing = 1.2.sp, maxLines = 1)
        Spacer(Modifier.height(3.dp))
        Text(product.name, color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium, lineHeight = 18.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        Spacer(Modifier.height(5.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (product.salePrice != null) {
                Text(
                    text  = "\$${product.price}.00",
                    color = HLTextMuted,
                    fontSize = 11.sp,
                    style = LocalTextStyle.current.copy(textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough),
                )
                Text("\$${product.salePrice}.00", color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            } else {
                Text("\$${product.price}.00", color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }
        Spacer(Modifier.height(4.dp))
    }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//  COLLECTION CARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
fun CollectionCard(collection: ShopCollection, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .aspectRatio(1f)
            .background(Color(0xFF141414))
            .border(1.dp, Color.White.copy(alpha = 0.07f)),
        contentAlignment = Alignment.BottomStart,
    ) {
        Text(
            text      = collection.name.take(2).uppercase(),
            color     = Color(0xFF1E1E1E),
            fontSize  = 52.sp,
            fontWeight = FontWeight.Black,
            modifier  = Modifier.align(Alignment.Center).padding(8.dp),
        )
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xCC0A0A0A))))
                .padding(10.dp),
        ) {
            Column {
                Text(collection.name, color = HLTextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold, lineHeight = 15.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("${collection.itemCount} items", color = HLTextMuted, fontSize = 10.sp)
            }
        }
    }
}
