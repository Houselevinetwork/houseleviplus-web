package com.houselevi.plus.ui.screens.shop

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// ─────────────────────────────────────────────────────
//  FULL PRODUCT CATALOGUE  (32 products — matches web)
// ─────────────────────────────────────────────────────

data class CatalogProduct(
    val id:         String,
    val name:       String,
    val price:      Int,
    val salePrice:  Int?,
    val onSale:     Boolean,
    val collection: String,
)

val ALL_PRODUCTS_DATA = listOf(
    CatalogProduct("1",  "Levi's Old Money Navy Blazer",           241, 181, true,  "old-money"),
    CatalogProduct("2",  "Levi's Elegant Jacket",                  146, 103, true,  "old-money"),
    CatalogProduct("3",  "Levi Merino Zip Sweater",                 85,  72, true,  "old-money"),
    CatalogProduct("4",  "Levi's Elegant Trousers",                 61,  42, true,  "old-money"),
    CatalogProduct("5",  "Levi's Half-Zip Merino",                  65,  43, true,  "old-money"),
    CatalogProduct("6",  "Levi's Linen Shirt",                      73, null,false, "old-money"),
    CatalogProduct("7",  "Levi's Driving Moccasins",                97,  79, true,  "old-money"),
    CatalogProduct("8",  "Levi's Suede Loafers",                   223, 109, true,  "old-money"),
    CatalogProduct("9",  "HL Aviation Leather Jacket",             320, 249, true,  "aviation"),
    CatalogProduct("10", "Levi's Pilot Chronograph Watch",         185, 139, true,  "aviation"),
    CatalogProduct("11", "Aviation Nomex Flight Suit",             340, 265, true,  "aviation"),
    CatalogProduct("12", "Pilot Kneeboard Pro",                     55, null,false, "aviation"),
    CatalogProduct("13", "Boeing 747 Scale Model — 1:200",          61,  42, true,  "collectibles"),
    CatalogProduct("14", "Concorde 1:144 Scale Model",             223, 109, true,  "collectibles"),
    CatalogProduct("15", "Spitfire WWII — 1:48 Replica",            85, null,false, "collectibles"),
    CatalogProduct("16", "F-22 Raptor Desktop Model",              120,  89, true,  "collectibles"),
    CatalogProduct("17", "Mercedes 300SL Die-Cast 1:18",           240, 119, true,  "cars"),
    CatalogProduct("18", "Ferrari 250 GTO — 1:18 Scale",           195, 149, true,  "cars"),
    CatalogProduct("19", "Porsche 911 Targa 1:43",                  89,  66, true,  "cars"),
    CatalogProduct("20", "Bugatti Chiron Limited Edition",          265, null,false, "cars"),
    CatalogProduct("21", "HL Studio Hoodie — Classic",             109,  72, true,  "host-merch"),
    CatalogProduct("22", "HouseLevi+ Signature Cap",                65,  43, true,  "host-merch"),
    CatalogProduct("23", "HL TV Premium Tee — White",               55, null,false, "host-merch"),
    CatalogProduct("24", "HL Classic Polo — Navy",                  85,  60, true,  "host-merch"),
    CatalogProduct("25", "Levi Reads — Curated Book Bundle Vol.1",  97,  79, true,  "books"),
    CatalogProduct("26", "Old Money Mindset — Hardcover",           35, null,false, "books"),
    CatalogProduct("27", "Aviation History: Century of Flight",     42,  30, true,  "books"),
    CatalogProduct("28", "The Host Collection Gift Set",           145, 109, true,  "hl-merch"),
    CatalogProduct("29", "HL Ceramic Mug — Vintage Logo",           28, null,false, "hl-merch"),
    CatalogProduct("30", "HL Leather Notebook A5",                  45,  33, true,  "hl-merch"),
    CatalogProduct("31", "Levi's Casentino Sweater",               103,  66, true,  "old-money"),
    CatalogProduct("32", "HL x Partner Brand Collab Tee",           75,  55, true,  "partner"),
)

data class FilterOption(val id: String, val label: String)

val FILTER_OPTIONS = listOf(
    FilterOption("all",          "All Products"),
    FilterOption("old-money",    "Old Money Closet"),
    FilterOption("aviation",     "Aviation Gear"),
    FilterOption("collectibles", "Scale Collectibles"),
    FilterOption("cars",         "Car Collectibles"),
    FilterOption("host-merch",   "Host Merch"),
    FilterOption("books",        "Book Club"),
    FilterOption("hl-merch",     "HL Merch"),
    FilterOption("partner",      "Partner Brands"),
)

val SORT_OPTIONS = listOf(
    "Featured", "Best Selling", "Price: Low to High", "Price: High to Low", "Newest",
)

// ─────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AllProductsScreen(
    onProductClick: (String) -> Unit = {},
    onCartClick:    ()       -> Unit = {},
    onBack:         ()       -> Unit = {},
) {
    var activeFilter by remember { mutableStateOf("all") }
    var sortBy       by remember { mutableStateOf("Featured") }
    var sortExpanded by remember { mutableStateOf(false) }
    var page         by remember { mutableIntStateOf(1) }
    val perPage      = 12

    val filtered = if (activeFilter == "all") ALL_PRODUCTS_DATA
                   else ALL_PRODUCTS_DATA.filter { it.collection == activeFilter }

    val sorted = when (sortBy) {
        "Price: Low to High"  -> filtered.sortedBy { it.salePrice ?: it.price }
        "Price: High to Low"  -> filtered.sortedByDescending { it.salePrice ?: it.price }
        else                  -> filtered
    }

    val totalPages  = maxOf(1, (sorted.size + perPage - 1) / perPage)
    val paginated   = sorted.drop((page - 1) * perPage).take(perPage)

    fun changeFilter(id: String) { activeFilter = id; page = 1 }

    Scaffold(
        containerColor = HLBlack,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background),
            ) {
                // ── Top app bar ───────────────────────────────────────────
                TopAppBar(
                    title = {
                        Column {
                            Text(
                                text       = "All Products",
                                color      = HLTextPrimary,
                                fontSize   = 17.sp,
                                fontWeight = FontWeight.Bold,
                            )
                            Text(
                                text    = "${filtered.size} products",
                                color   = HLTextMuted,
                                fontSize = 11.sp,
                            )
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = HLTextPrimary)
                        }
                    },
                    actions = {
                        // Sort dropdown trigger
                        Box {
                            IconButton(onClick = { sortExpanded = true }) {
                                Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Sort", tint = HLTextPrimary)
                            }
                            DropdownMenu(
                                expanded        = sortExpanded,
                                onDismissRequest = { sortExpanded = false },
                                modifier        = Modifier.background(Color(0xFF1A1A1A)),
                            ) {
                                SORT_OPTIONS.forEach { opt ->
                                    DropdownMenuItem(
                                        text = {
                                            Text(
                                                text       = opt,
                                                color      = if (sortBy == opt) HLBlueGlow else HLTextPrimary,
                                                fontSize   = 13.sp,
                                                fontWeight = if (sortBy == opt) FontWeight.Bold else FontWeight.Normal,
                                            )
                                        },
                                        onClick = { sortBy = opt; sortExpanded = false },
                                        modifier = Modifier.background(Color(0xFF1A1A1A)),
                                    )
                                }
                            }
                        }
                        IconButton(onClick = onCartClick) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = HLTextPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = HLBlack),
                )

                // ── Filter pills ─────────────────────────────────────────
                LazyRow(
                    modifier            = Modifier.fillMaxWidth(),
                    contentPadding      = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(FILTER_OPTIONS) { f ->
                        val active = activeFilter == f.id
                        Box(
                            modifier = Modifier
                                .height(32.dp)
                                .background(if (active) HLTextPrimary else Color.Transparent)
                                .border(
                                    1.dp,
                                    if (active) HLTextPrimary else Color.White.copy(alpha = 0.25f),
                                )
                                .clickable { changeFilter(f.id) }
                                .padding(horizontal = 14.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text       = f.label,
                                color      = if (active) Color.Black else HLTextMuted,
                                fontSize   = 11.sp,
                                fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
                                letterSpacing = 0.5.sp,
                            )
                        }
                    }
                }

                HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
            }
        },
    ) { padding ->

        if (paginated.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("No products found", color = HLTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Text("Try a different filter", color = HLTextMuted, fontSize = 13.sp)
                }
            }
        } else {
            LazyVerticalGrid(
                columns             = GridCells.Fixed(2),
                modifier            = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding      = PaddingValues(horizontal = 12.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                items(paginated, key = { it.id }) { product ->
                    GridProductCard(
                        product = product,
                        onClick = { onProductClick(product.id) },
                    )
                }

                // Pagination footer
                if (totalPages > 1) {
                    item(span = { GridItemSpan(2) }) {
                        PaginationRow(
                            currentPage = page,
                            totalPages  = totalPages,
                            onPage      = { page = it },
                        )
                    }
                }

                // Bottom spacer
                item(span = { GridItemSpan(2) }) {
                    Spacer(Modifier.height(16.dp))
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────
//  GRID PRODUCT CARD
// ─────────────────────────────────────────────────────

@Composable
fun GridProductCard(
    product: CatalogProduct,
    onClick: () -> Unit,
) {
    Column(modifier = Modifier.clickable(onClick = onClick)) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(Color(0xFF181818)),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text       = "HL",
                color      = Color(0xFF282828),
                fontSize   = 32.sp,
                fontWeight = FontWeight.Black,
            )
            if (product.onSale) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp)
                        .background(Color(0xFFDC2626))
                        .padding(horizontal = 8.dp, vertical = 3.dp),
                ) {
                    Text("Sale", color = Color.White, fontSize = 10.sp, letterSpacing = 0.8.sp)
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text      = product.name,
            color     = HLTextPrimary,
            fontSize  = 13.sp,
            fontWeight = FontWeight.Medium,
            lineHeight = 18.sp,
            maxLines  = 2,
            overflow  = TextOverflow.Ellipsis,
        )
        Spacer(Modifier.height(5.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (product.salePrice != null) {
                Text(
                    text  = "\$${product.price}",
                    color = HLTextMuted,
                    fontSize = 11.sp,
                    style = LocalTextStyle.current.copy(textDecoration = TextDecoration.LineThrough),
                )
                Text(
                    text       = "\$${product.salePrice}.00",
                    color      = HLTextPrimary,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            } else {
                Text(
                    text       = "\$${product.price}.00",
                    color      = HLTextPrimary,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────
//  PAGINATION ROW
// ─────────────────────────────────────────────────────

@Composable
fun PaginationRow(
    currentPage: Int,
    totalPages:  Int,
    onPage:      (Int) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 16.dp, bottom = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Prev
        IconButton(
            onClick  = { if (currentPage > 1) onPage(currentPage - 1) },
            enabled  = currentPage > 1,
            modifier = Modifier.size(36.dp),
        ) {
            Text(
                "‹",
                color    = if (currentPage > 1) HLTextPrimary else HLTextMuted,
                fontSize = 22.sp,
            )
        }

        // Page numbers
        val pagesToShow = (1..totalPages).toList().let { pages ->
            when {
                totalPages <= 5 -> pages
                currentPage <= 3 -> pages.take(5)
                currentPage >= totalPages - 2 -> pages.takeLast(5)
                else -> (currentPage - 2..currentPage + 2).toList()
            }
        }

        pagesToShow.forEach { p ->
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(if (p == currentPage) HLTextPrimary else Color.Transparent)
                    .border(
                        1.dp,
                        if (p == currentPage) HLTextPrimary else Color.White.copy(alpha = 0.15f),
                    )
                    .clickable { onPage(p) },
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text       = "$p",
                    color      = if (p == currentPage) Color.Black else HLTextMuted,
                    fontSize   = 13.sp,
                    fontWeight = if (p == currentPage) FontWeight.Bold else FontWeight.Normal,
                )
            }
        }

        // Next
        IconButton(
            onClick  = { if (currentPage < totalPages) onPage(currentPage + 1) },
            enabled  = currentPage < totalPages,
            modifier = Modifier.size(36.dp),
        ) {
            Text(
                "›",
                color    = if (currentPage < totalPages) HLTextPrimary else HLTextMuted,
                fontSize = 22.sp,
            )
        }
    }
}
