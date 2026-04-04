package com.houselevi.plus.ui.screens.shop

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// ─────────────────────────────────────────────────────
//  CHECKOUT STEPS
// ─────────────────────────────────────────────────────

private enum class CheckoutStep { SHIPPING, PAYMENT, REVIEW, CONFIRMED }

// ─────────────────────────────────────────────────────
//  SCREEN
// ─────────────────────────────────────────────────────

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onBack:        () -> Unit = {},
    onOrderPlaced: () -> Unit = {},
) {
    var step by remember { mutableStateOf(CheckoutStep.SHIPPING) }

    // Shipping fields
    var firstName   by remember { mutableStateOf("") }
    var lastName    by remember { mutableStateOf("") }
    var email       by remember { mutableStateOf("") }
    var phone       by remember { mutableStateOf("") }
    var address1    by remember { mutableStateOf("") }
    var address2    by remember { mutableStateOf("") }
    var city        by remember { mutableStateOf("") }
    var country     by remember { mutableStateOf("Kenya") }
    var postalCode  by remember { mutableStateOf("") }

    // Payment fields
    var paymentMethod  by remember { mutableStateOf("card") } // "card" | "mpesa"
    var cardNumber     by remember { mutableStateOf("") }
    var cardName       by remember { mutableStateOf("") }
    var cardExpiry     by remember { mutableStateOf("") }
    var cardCvv        by remember { mutableStateOf("") }
    var mpesaPhone     by remember { mutableStateOf("") }

    // Order summary (from cart — hand-coded same as CartScreen)
    val orderItems = INITIAL_CART_ITEMS
    val subtotal   = orderItems.sumOf { it.price * it.qty }
    val shipping   = if (subtotal >= 150) 0 else 12
    val total      = subtotal + shipping

    if (step == CheckoutStep.CONFIRMED) {
        OrderConfirmedScreen(total = total, onContinue = onOrderPlaced)
        return
    }

    Scaffold(
        containerColor = HLBlack,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background),
            ) {
                TopAppBar(
                    title = {
                        Text(
                            text = when (step) {
                                CheckoutStep.SHIPPING -> "Shipping"
                                CheckoutStep.PAYMENT  -> "Payment"
                                CheckoutStep.REVIEW   -> "Review Order"
                                else -> ""
                            },
                            color      = HLTextPrimary,
                            fontSize   = 17.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = {
                            if (step == CheckoutStep.SHIPPING) onBack()
                            else step = CheckoutStep.values()[step.ordinal - 1]
                        }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = HLTextPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = HLBlack),
                )

                // Step indicator
                StepIndicator(currentStep = step)

                HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
            }
        },
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState()),
        ) {

            when (step) {

                // ── STEP 1: SHIPPING ─────────────────────────────────────
                CheckoutStep.SHIPPING -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        SectionLabel("Contact Information")
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            HLTextField(value = firstName, onValueChange = { firstName = it },   label = "First Name",  modifier = Modifier.weight(1f))
                            HLTextField(value = lastName,  onValueChange = { lastName  = it },   label = "Last Name",   modifier = Modifier.weight(1f))
                        }
                        HLTextField(value = email, onValueChange = { email = it }, label = "Email Address",  keyboardType = KeyboardType.Email)
                        HLTextField(value = phone, onValueChange = { phone = it }, label = "Phone Number",   keyboardType = KeyboardType.Phone)

                        Spacer(Modifier.height(4.dp))
                        SectionLabel("Shipping Address")
                        HLTextField(value = address1,   onValueChange = { address1   = it }, label = "Address Line 1")
                        HLTextField(value = address2,   onValueChange = { address2   = it }, label = "Address Line 2 (optional)")
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            HLTextField(value = city,       onValueChange = { city       = it }, label = "City",        modifier = Modifier.weight(1f))
                            HLTextField(value = postalCode, onValueChange = { postalCode = it }, label = "Postal Code", modifier = Modifier.weight(1f))
                        }

                        // Country selector
                        Text("Country", color = HLTextMuted, fontSize = 11.sp, letterSpacing = 1.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("Kenya", "USA", "UK", "Other").forEach { c ->
                                Box(
                                    modifier = Modifier
                                        .height(38.dp)
                                        .background(if (country == c) HLBlueGlow else Color.Transparent)
                                        .border(1.dp, if (country == c) HLBlueGlow else Color.White.copy(alpha = 0.2f))
                                        .clickable { country = c }
                                        .padding(horizontal = 16.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    Text(
                                        text       = c,
                                        color      = if (country == c) Color.Black else HLTextMuted,
                                        fontSize   = 12.sp,
                                        fontWeight = if (country == c) FontWeight.Bold else FontWeight.Normal,
                                    )
                                }
                            }
                        }

                        Spacer(Modifier.height(8.dp))
                        OrderSummaryMini(items = orderItems, subtotal = subtotal, shipping = shipping, total = total)
                        Spacer(Modifier.height(4.dp))

                        Button(
                            onClick = { step = CheckoutStep.PAYMENT },
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            shape    = RoundedCornerShape(2.dp),
                            enabled  = firstName.isNotBlank() && lastName.isNotBlank() && email.isNotBlank() && address1.isNotBlank() && city.isNotBlank(),
                            colors   = ButtonDefaults.buttonColors(
                                containerColor = HLTextPrimary,
                                disabledContainerColor = Color(0xFF333333),
                            ),
                        ) {
                            Text("Continue to Payment", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 14.sp, letterSpacing = 1.sp)
                        }
                    }
                }

                // ── STEP 2: PAYMENT ──────────────────────────────────────
                CheckoutStep.PAYMENT -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        SectionLabel("Payment Method")

                        // Method toggle
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            PaymentMethodTile(
                                label    = "💳  Credit Card",
                                selected = paymentMethod == "card",
                                onClick  = { paymentMethod = "card" },
                                modifier = Modifier.weight(1f),
                            )
                            PaymentMethodTile(
                                label    = "📱  M-Pesa",
                                selected = paymentMethod == "mpesa",
                                onClick  = { paymentMethod = "mpesa" },
                                modifier = Modifier.weight(1f),
                            )
                        }

                        if (paymentMethod == "card") {
                            Spacer(Modifier.height(4.dp))
                            HLTextField(value = cardNumber, onValueChange = { if (it.length <= 19) cardNumber = it }, label = "Card Number", keyboardType = KeyboardType.Number, placeholder = "1234 5678 9012 3456")
                            HLTextField(value = cardName,   onValueChange = { cardName   = it }, label = "Name on Card", placeholder = "As it appears on card")
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                HLTextField(value = cardExpiry, onValueChange = { if (it.length <= 5) cardExpiry = it }, label = "Expiry",   placeholder = "MM/YY",  modifier = Modifier.weight(1f), keyboardType = KeyboardType.Number)
                                HLTextField(value = cardCvv,    onValueChange = { if (it.length <= 4) cardCvv    = it }, label = "CVV",      placeholder = "•••",    modifier = Modifier.weight(1f), keyboardType = KeyboardType.Number)
                            }
                        } else {
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text      = "Enter your M-Pesa registered number. You will receive an STK push to complete payment.",
                                color     = HLTextMuted,
                                fontSize  = 12.sp,
                                lineHeight = 18.sp,
                            )
                            HLTextField(value = mpesaPhone, onValueChange = { mpesaPhone = it }, label = "M-Pesa Phone Number", placeholder = "e.g. 0712 345 678", keyboardType = KeyboardType.Phone)
                        }

                        Spacer(Modifier.height(4.dp))
                        OrderSummaryMini(items = orderItems, subtotal = subtotal, shipping = shipping, total = total)
                        Spacer(Modifier.height(4.dp))

                        val paymentValid = if (paymentMethod == "card")
                            cardNumber.isNotBlank() && cardName.isNotBlank() && cardExpiry.isNotBlank() && cardCvv.isNotBlank()
                        else
                            mpesaPhone.isNotBlank()

                        Button(
                            onClick  = { step = CheckoutStep.REVIEW },
                            modifier = Modifier.fillMaxWidth().height(52.dp),
                            shape    = RoundedCornerShape(2.dp),
                            enabled  = paymentValid,
                            colors   = ButtonDefaults.buttonColors(
                                containerColor = HLTextPrimary,
                                disabledContainerColor = Color(0xFF333333),
                            ),
                        ) {
                            Text("Review Order", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 14.sp, letterSpacing = 1.sp)
                        }
                    }
                }

                // ── STEP 3: REVIEW ───────────────────────────────────────
                CheckoutStep.REVIEW -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        // Shipping summary
                        ReviewSection(title = "Shipping To") {
                            Text("$firstName $lastName", color = HLTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                            Text(address1, color = HLTextMuted, fontSize = 13.sp)
                            Text("$city, $country $postalCode", color = HLTextMuted, fontSize = 13.sp)
                            Text(email, color = HLTextMuted, fontSize = 13.sp)
                        }

                        // Payment summary
                        ReviewSection(title = "Payment Method") {
                            Text(
                                text       = if (paymentMethod == "card") "Credit Card ending ···· ${cardNumber.takeLast(4)}" else "M-Pesa · $mpesaPhone",
                                color      = HLTextPrimary,
                                fontSize   = 14.sp,
                                fontWeight = FontWeight.Medium,
                            )
                        }

                        // Items
                        ReviewSection(title = "Items (${orderItems.sumOf { it.qty }})") {
                            orderItems.forEach { item ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.name, color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                        Text("${item.size} · Qty ${item.qty}", color = HLTextMuted, fontSize = 12.sp)
                                    }
                                    Text("\$${item.price * item.qty}.00", color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }

                        // Totals
                        ReviewSection(title = "Order Total") {
                            CheckoutLine("Subtotal", "\$$subtotal.00")
                            CheckoutLine("Shipping", if (shipping == 0) "Free" else "\$$shipping.00", valueColor = if (shipping == 0) Color(0xFF00B77F) else HLTextPrimary)
                            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = Color.White.copy(alpha = 0.08f))
                            CheckoutLine("Total", "\$$total.00 USD", labelSize = 16.sp, valueSize = 18.sp, bold = true)
                        }

                        // Terms note
                        Text(
                            text      = "By placing your order you agree to HouseLevi+ Terms & Conditions and Privacy Policy.",
                            color     = HLTextMuted,
                            fontSize  = 11.sp,
                            lineHeight = 16.sp,
                        )

                        Button(
                            onClick  = { step = CheckoutStep.CONFIRMED },
                            modifier = Modifier.fillMaxWidth().height(56.dp),
                            shape    = RoundedCornerShape(2.dp),
                            colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
                        ) {
                            Text("Place Order · \$$total.00", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 15.sp, letterSpacing = 1.sp)
                        }
                    }
                }

                else -> {}
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

// ─────────────────────────────────────────────────────
//  ORDER CONFIRMED SCREEN
// ─────────────────────────────────────────────────────

@Composable
private fun OrderConfirmedScreen(total: Int, onContinue: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(32.dp),
        ) {
            Icon(
                imageVector        = Icons.Default.CheckCircle,
                contentDescription = null,
                tint               = Color(0xFF00B77F),
                modifier           = Modifier.size(72.dp),
            )
            Spacer(Modifier.height(20.dp))
            Text(
                text       = "Order Confirmed!",
                color      = HLTextPrimary,
                fontSize   = 26.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 0.5.sp,
            )
            Spacer(Modifier.height(10.dp))
            Text(
                text      = "Thank you for your order.",
                color     = HLTextMuted,
                fontSize  = 14.sp,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text       = "Total Charged: \$$total.00 USD",
                color      = HLTextPrimary,
                fontSize   = 16.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text      = "A confirmation has been sent to your email.\nExpected delivery: 3–7 business days.",
                color     = HLTextMuted,
                fontSize  = 13.sp,
                lineHeight = 20.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            )
            Spacer(Modifier.height(32.dp))
            Button(
                onClick  = onContinue,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape    = RoundedCornerShape(2.dp),
                colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
            ) {
                Text("Continue Shopping", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 14.sp, letterSpacing = 1.sp)
            }
        }
    }
}

// ─────────────────────────────────────────────────────
//  REUSABLE SUB-COMPONENTS
// ─────────────────────────────────────────────────────

@Composable
private fun StepIndicator(currentStep: CheckoutStep) {
    val steps = listOf("Shipping", "Payment", "Review")
    val idx   = currentStep.ordinal

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        steps.forEachIndexed { i, label ->
            val done   = i < idx
            val active = i == idx

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.weight(1f),
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(
                            when {
                                done   -> Color(0xFF00B77F)
                                active -> HLTextPrimary
                                else   -> Color(0xFF222222)
                            }
                        )
                        .border(1.dp, if (active) HLTextPrimary else if (done) Color(0xFF00B77F) else Color.White.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text  = if (done) "✓" else "${i + 1}",
                        color = if (done || active) Color.Black else HLTextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text    = label,
                    color   = if (active) HLTextPrimary else if (done) Color(0xFF00B77F) else HLTextMuted,
                    fontSize = 10.sp,
                    fontWeight = if (active) FontWeight.Bold else FontWeight.Normal,
                )
            }

            // Connector line between steps
            if (i < steps.size - 1) {
                Box(
                    modifier = Modifier
                        .height(1.dp)
                        .weight(0.5f)
                        .background(if (i < idx) Color(0xFF00B77F) else Color.White.copy(alpha = 0.12f)),
                )
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text       = text.uppercase(),
        color      = HLTextMuted,
        fontSize   = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.5.sp,
    )
}

@Composable
private fun HLTextField(
    value:        String,
    onValueChange: (String) -> Unit,
    label:        String,
    placeholder:  String = "",
    modifier:     Modifier = Modifier.fillMaxWidth(),
    keyboardType: KeyboardType = KeyboardType.Text,
) {
    Column(modifier = modifier) {
        Text(label, color = HLTextMuted, fontSize = 11.sp, letterSpacing = 0.8.sp)
        Spacer(Modifier.height(5.dp))
        OutlinedTextField(
            value         = value,
            onValueChange = onValueChange,
            placeholder   = { if (placeholder.isNotEmpty()) Text(placeholder, color = HLTextMuted.copy(alpha = 0.5f), fontSize = 13.sp) },
            singleLine    = true,
            modifier      = Modifier.fillMaxWidth().height(50.dp),
            textStyle     = LocalTextStyle.current.copy(color = HLTextPrimary, fontSize = 14.sp),
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor   = HLBlueGlow,
                unfocusedBorderColor = Color.White.copy(alpha = 0.18f),
                cursorColor          = HLBlueGlow,
            ),
            shape = RoundedCornerShape(2.dp),
        )
    }
}

@Composable
private fun PaymentMethodTile(
    label:    String,
    selected: Boolean,
    onClick:  () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .height(52.dp)
            .background(if (selected) Color(0xFF0D1A2E) else Color.Transparent)
            .border(
                1.5.dp,
                if (selected) HLBlueGlow else Color.White.copy(alpha = 0.18f),
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text       = label,
            color      = if (selected) HLBlueGlow else HLTextMuted,
            fontSize   = 13.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
        )
    }
}

@Composable
private fun ReviewSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color.White.copy(alpha = 0.1f))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            text       = title.uppercase(),
            color      = HLTextMuted,
            fontSize   = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.2.sp,
        )
        Spacer(Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun OrderSummaryMini(
    items:    List<CartItem>,
    subtotal: Int,
    shipping: Int,
    total:    Int,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF111111))
            .border(1.dp, Color.White.copy(alpha = 0.08f))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Text("Order Summary".uppercase(), color = HLTextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.2.sp)
        Spacer(Modifier.height(4.dp))
        items.forEach { item ->
            Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                Text("${item.name.take(22)}…  ×${item.qty}", color = HLTextMuted, fontSize = 12.sp, modifier = Modifier.weight(1f))
                Text("\$${item.price * item.qty}", color = HLTextPrimary, fontSize = 12.sp)
            }
        }
        HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp), color = Color.White.copy(alpha = 0.07f))
        CheckoutLine("Subtotal", "\$$subtotal.00")
        CheckoutLine("Shipping", if (shipping == 0) "Free" else "\$$shipping.00", valueColor = if (shipping == 0) Color(0xFF00B77F) else HLTextPrimary)
        HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp), color = Color.White.copy(alpha = 0.07f))
        CheckoutLine("Total", "\$$total.00 USD", bold = true)
    }
}

@Composable
private fun CheckoutLine(
    label:      String,
    value:      String,
    valueColor: Color = HLTextPrimary,
    labelSize:  TextUnit = 13.sp,
    valueSize:  TextUnit = 13.sp,
    bold:       Boolean = false,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, color = HLTextMuted, fontSize = labelSize, fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
        Text(value, color = valueColor,  fontSize = valueSize,  fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal)
    }
}
