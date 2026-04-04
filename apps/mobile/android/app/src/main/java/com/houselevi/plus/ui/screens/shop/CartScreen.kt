package com.houselevi.plus.ui.screens.shop

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// ─────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────

data class CartItem(
    val id:            String,
    val name:          String,
    val collection:    String,
    val price:         Int,
    val originalPrice: Int?,
    val size:          String,
    var qty:           Int,
)

val INITIAL_CART_ITEMS = listOf(
    CartItem("1", "Levi's Old Money — Navy Blazer",   "Old Money Closet",  181, 241, "M",         1),
    CartItem("3", "HL Aviation Leather Jacket",        "Aviation Gear",     249, 320, "L",         1),
    CartItem("6", "Mercedes 300SL Die-Cast 1:18",      "Car Collectibles",  119, 240, "1:18 Scale",1),
)

// ─────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    accessToken: String = "",
    onBack:      () -> Unit = {},
    onCheckout:  () -> Unit = {},
) {
    var items       by remember { mutableStateOf(INITIAL_CART_ITEMS) }
    var promoCode   by remember { mutableStateOf("") }
    var promoApplied by remember { mutableStateOf(false) }
    var promoError  by remember { mutableStateOf("") }

    val subtotal  = items.sumOf { it.price * it.qty }
    val discount  = if (promoApplied) (subtotal * 0.10).toInt() else 0
    val shipping  = if (subtotal >= 150) 0 else 12
    val total     = subtotal - discount + shipping
    val isEmpty   = items.isEmpty()

    fun updateQty(id: String, delta: Int) {
        items = items.map { if (it.id == id) it.copy(qty = (it.qty + delta).coerceIn(1, 10)) else it }
    }

    fun removeItem(id: String) {
        items = items.filter { it.id != id }
    }

    fun applyPromo() {
        if (promoCode.trim().uppercase() == "HLVIP") {
            promoApplied = true
            promoError   = ""
        } else {
            promoError   = "Invalid promo code"
            promoApplied = false
        }
    }

    Scaffold(
        containerColor = HLBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text      = "Cart (${items.sumOf { it.qty }})",
                        color     = HLTextPrimary,
                        fontSize  = 17.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp,
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = HLTextPrimary)
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

            if (isEmpty) {
                // ── Empty state ───────────────────────────────────────────
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(320.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🛒", fontSize = 48.sp)
                        Spacer(Modifier.height(16.dp))
                        Text(
                            text       = "Your cart is empty",
                            color      = HLTextPrimary,
                            fontSize   = 20.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text  = "Discover Levi's curated collections",
                            color = HLTextMuted,
                            fontSize = 13.sp,
                        )
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = onBack,
                            shape   = RoundedCornerShape(2.dp),
                            colors  = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
                        ) {
                            Text("Browse Shop", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }

            } else {
                // ── Cart items ────────────────────────────────────────────
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Spacer(Modifier.height(8.dp))

                    items.forEach { item ->
                        CartItemRow(
                            item      = item,
                            onIncrease = { updateQty(item.id,  1) },
                            onDecrease = { updateQty(item.id, -1) },
                            onRemove   = { removeItem(item.id) },
                        )
                        HorizontalDivider(
                            color     = Color.White.copy(alpha = 0.07f),
                            thickness = 1.dp,
                        )
                    }
                }

                Spacer(Modifier.height(28.dp))

                // ── Order Summary card ────────────────────────────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .border(1.dp, Color.White.copy(alpha = 0.1f))
                        .padding(20.dp),
                ) {
                    Text(
                        text       = "Order Summary",
                        color      = HLTextPrimary,
                        fontSize   = 16.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp,
                    )
                    Spacer(Modifier.height(18.dp))

                    // Line items
                    OrderLine("Subtotal (${items.sumOf { it.qty }} items)", "\$$subtotal.00")
                    if (discount > 0) {
                        OrderLine("Promo — HLVIP (−10%)", "−\$$discount.00", valueColor = Color(0xFF00B77F))
                    }
                    OrderLine(
                        label      = "Shipping",
                        value      = if (shipping == 0) "Free" else "\$$shipping.00",
                        valueColor = if (shipping == 0) Color(0xFF00B77F) else HLTextPrimary,
                    )

                    if (shipping > 0) {
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text    = "Add \$${150 - subtotal} more for free shipping",
                            color   = HLTextMuted,
                            fontSize = 11.sp,
                        )
                    }

                    HorizontalDivider(
                        modifier  = Modifier.padding(vertical = 14.dp),
                        color     = Color.White.copy(alpha = 0.08f),
                    )

                    // Total
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text       = "Total",
                            color      = HLTextPrimary,
                            fontSize   = 17.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text       = "\$$total.00 USD",
                            color      = HLTextPrimary,
                            fontSize   = 20.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }

                    Spacer(Modifier.height(20.dp))

                    // Promo code
                    Text(
                        text       = "PROMO CODE",
                        color      = HLTextMuted,
                        fontSize   = 10.sp,
                        letterSpacing = 1.2.sp,
                    )
                    Spacer(Modifier.height(8.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(0.dp)) {
                        OutlinedTextField(
                            value         = promoCode,
                            onValueChange = { promoCode = it; promoError = "" },
                            placeholder   = { Text("Enter code", color = HLTextMuted, fontSize = 13.sp) },
                            modifier      = Modifier
                                .weight(1f)
                                .height(48.dp),
                            singleLine    = true,
                            textStyle     = LocalTextStyle.current.copy(
                                color    = HLTextPrimary,
                                fontSize = 13.sp,
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor   = HLBlueGlow,
                                unfocusedBorderColor = Color.White.copy(alpha = 0.2f),
                                cursorColor          = HLBlueGlow,
                            ),
                            shape = RoundedCornerShape(topStart = 2.dp, bottomStart = 2.dp),
                        )
                        Button(
                            onClick  = { applyPromo() },
                            modifier = Modifier.height(48.dp),
                            shape    = RoundedCornerShape(topEnd = 2.dp, bottomEnd = 2.dp),
                            colors   = ButtonDefaults.buttonColors(containerColor = Color(0xFF1A1A2E)),
                        ) {
                            Text(
                                text      = "Apply",
                                color     = HLBlueGlow,
                                fontSize  = 12.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.8.sp,
                            )
                        }
                    }

                    if (promoError.isNotEmpty()) {
                        Spacer(Modifier.height(6.dp))
                        Text(promoError, color = Color(0xFFDC2626), fontSize = 12.sp)
                    }
                    if (promoApplied) {
                        Spacer(Modifier.height(6.dp))
                        Text("✓ HLVIP applied — 10% off", color = Color(0xFF00B77F), fontSize = 12.sp)
                    }

                    Spacer(Modifier.height(20.dp))

                    // Checkout
                    Button(
                        onClick  = onCheckout,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape    = RoundedCornerShape(2.dp),
                        colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
                    ) {
                        Text(
                            text      = "Proceed to Checkout",
                            color     = Color.Black,
                            fontSize  = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                        )
                    }

                    Spacer(Modifier.height(10.dp))

                    OutlinedButton(
                        onClick  = onBack,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp),
                        shape    = RoundedCornerShape(2.dp),
                        border   = BorderStroke(1.dp, HLTextPrimary),
                        colors   = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                    ) {
                        Text(
                            text      = "Continue Shopping",
                            fontSize  = 13.sp,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 0.8.sp,
                        )
                    }

                    Spacer(Modifier.height(16.dp))

                    // Trust row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                    ) {
                        listOf("Secure Checkout", "Free Returns", "HL+ Verified").forEach { t ->
                            Text(
                                text      = t,
                                color     = HLTextMuted,
                                fontSize  = 10.sp,
                                letterSpacing = 0.5.sp,
                            )
                        }
                    }
                }

                Spacer(Modifier.height(32.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────
//  CART ITEM ROW
// ─────────────────────────────────────────────────────

@Composable
fun CartItemRow(
    item:       CartItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove:   () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // Image placeholder
        Box(
            modifier = Modifier
                .size(width = 80.dp, height = 96.dp)
                .background(Color(0xFF1A1A1A)),
            contentAlignment = Alignment.Center,
        ) {
            Text("HL", color = Color(0xFF2C2C2C), fontSize = 16.sp, fontWeight = FontWeight.Black)
        }

        // Info
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text      = item.collection.uppercase(),
                color     = HLTextMuted,
                fontSize  = 9.sp,
                letterSpacing = 1.2.sp,
            )
            Text(
                text       = item.name,
                color      = HLTextPrimary,
                fontSize   = 14.sp,
                fontWeight = FontWeight.Medium,
                lineHeight = 19.sp,
            )
            Text(
                text  = "Size: ${item.size}",
                color = HLTextMuted,
                fontSize = 12.sp,
            )
            // Price
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (item.originalPrice != null) {
                    Text(
                        text  = "\$${item.originalPrice}",
                        color = HLTextMuted,
                        fontSize = 11.sp,
                        style = LocalTextStyle.current.copy(textDecoration = TextDecoration.LineThrough),
                    )
                }
                Text(
                    text       = "\$${item.price * item.qty}.00",
                    color      = HLTextPrimary,
                    fontSize   = 15.sp,
                    fontWeight = FontWeight.Bold,
                )
            }

            Spacer(Modifier.height(6.dp))

            // Qty stepper + Remove
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Row(
                    modifier = Modifier.border(1.dp, Color.White.copy(alpha = 0.2f)),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    IconButton(
                        onClick  = onDecrease,
                        enabled  = item.qty > 1,
                        modifier = Modifier.size(34.dp),
                    ) {
                        Text("−", color = if (item.qty > 1) HLTextPrimary else HLTextMuted, fontSize = 16.sp)
                    }
                    Text(
                        text     = "${item.qty}",
                        color    = HLTextPrimary,
                        fontSize = 13.sp,
                        modifier = Modifier.width(26.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                    IconButton(
                        onClick  = onIncrease,
                        enabled  = item.qty < 10,
                        modifier = Modifier.size(34.dp),
                    ) {
                        Text("+", color = if (item.qty < 10) HLTextPrimary else HLTextMuted, fontSize = 16.sp)
                    }
                }

                TextButton(onClick = onRemove) {
                    Text(
                        text  = "Remove",
                        color = Color(0xFFDC2626),
                        fontSize = 12.sp,
                        letterSpacing = 0.5.sp,
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────

@Composable
private fun OrderLine(
    label:      String,
    value:      String,
    valueColor: Color = HLTextPrimary,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 5.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, color = HLTextMuted, fontSize = 13.sp)
        Text(value, color = valueColor,  fontSize = 13.sp, fontWeight = FontWeight.Medium)
    }
}