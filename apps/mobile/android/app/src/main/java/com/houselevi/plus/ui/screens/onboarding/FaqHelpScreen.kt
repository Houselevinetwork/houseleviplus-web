package com.houselevi.plus.ui.screens.onboarding

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// ═══════════════════════════════════════════════════════════════
//  FAQ DATA
// ═══════════════════════════════════════════════════════════════

private data class FaqItem(val question: String, val answer: String)

private val FAQ_ITEMS = listOf(
    FaqItem(
        "What is House Levi+?",
        "House Levi+ is a premium African lifestyle platform combining unlimited streaming (films, series, theatre, live TV), an exclusive shop, and curated travel experiences — all in one app.",
    ),
    FaqItem(
        "How much does House Levi+ cost?",
        "Plans start at KSh 299/month. We offer flexible plans to suit every budget — mobile-only, standard, and premium. You can change or cancel your plan at any time.",
    ),
    FaqItem(
        "Can I cancel my subscription?",
        "Yes. Cancel anytime online with no cancellation fees. Your access continues until the end of your current billing period.",
    ),
    FaqItem(
        "What is 24/7 HL Mood TV?",
        "HL Mood TV is our always-on live channel — curated moods, music, culture, and news streaming non-stop. Think of it as your personal live radio-visual companion, included with every plan.",
    ),
    FaqItem(
        "What devices can I watch on?",
        "Watch on your smartphone, tablet, laptop, and smart TV. Stream on up to 4 devices depending on your plan.",
    ),
    FaqItem(
        "How do I sign up?",
        "Tap 'JOIN HOUSE LEVI+' on the welcome screen, enter your email, and we'll send you a verification link or OTP to get started in seconds.",
    ),
    FaqItem(
        "Is my payment secure?",
        "Yes. All payments are processed via secure, encrypted channels. We support M-Pesa, Visa, Mastercard, and other local payment methods.",
    ),
    FaqItem(
        "Can I download content to watch offline?",
        "Offline downloads are available on Standard and Premium plans. Download on the app and watch without internet.",
    ),
)

private val HELP_ITEMS = listOf(
    FaqItem(
        "I can't sign in to my account",
        "Try resetting your access via the 'Forgot' option on the sign-in screen. If the issue persists, email support@houselevi.com with your registered email.",
    ),
    FaqItem(
        "My video keeps buffering",
        "Check your internet connection. For best results use Wi-Fi or a strong 4G signal. Lowering video quality in Settings can also help.",
    ),
    FaqItem(
        "I was charged but can't access my account",
        "Contact our support team immediately at support@houselevi.com with your payment reference and we'll resolve it within 24 hours.",
    ),
    FaqItem(
        "How do I change my plan?",
        "Go to My HL+ → Subscription → Change Plan. Changes take effect at the next billing cycle.",
    ),
    FaqItem(
        "How do I cancel my subscription?",
        "Go to My HL+ → Subscription → Cancel Membership. You'll retain access until the end of your billing period.",
    ),
    FaqItem(
        "Contact Support",
        "Email: support@houselevi.com\nWhatsApp: +254 700 000 000\nHours: Mon–Fri, 8AM–8PM EAT",
    ),
)

// ═══════════════════════════════════════════════════════════════
//  FAQ SCREEN
// ═══════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaqScreen(onBack: () -> Unit) {
    FaqHelpBase(
        title    = "Frequently Asked Questions",
        subtitle = "Everything you need to know about House Levi+",
        items    = FAQ_ITEMS,
        onBack   = onBack,
    )
}

// ═══════════════════════════════════════════════════════════════
//  HELP SCREEN
// ═══════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(onBack: () -> Unit) {
    FaqHelpBase(
        title    = "Help & Support",
        subtitle = "We're here to help. Find answers or contact us.",
        items    = HELP_ITEMS,
        onBack   = onBack,
    )
}

// ═══════════════════════════════════════════════════════════════
//  SHARED BASE
// ═══════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FaqHelpBase(
    title:    String,
    subtitle: String,
    items:    List<FaqItem>,
    onBack:   () -> Unit,
) {
    Scaffold(
        containerColor = HLBlack,
        topBar = {
            TopAppBar(
                title = {
                    Text(title, color = HLTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
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
            // Header
            Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
                Text(
                    text      = subtitle,
                    color     = HLTextMuted,
                    fontSize  = 13.sp,
                    lineHeight = 20.sp,
                )
            }

            HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
            Spacer(Modifier.height(8.dp))

            // Accordion items
            items.forEachIndexed { idx, item ->
                AccordionItem(item = item)
                if (idx < items.lastIndex) {
                    HorizontalDivider(
                        modifier = Modifier.padding(horizontal = 20.dp),
                        color    = Color.White.copy(alpha = 0.05f),
                    )
                }
            }

            Spacer(Modifier.height(40.dp))
        }
    }
}

@Composable
private fun AccordionItem(item: FaqItem) {
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded }
            .padding(horizontal = 20.dp, vertical = 16.dp),
    ) {
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            Text(
                text       = item.question,
                color      = HLTextPrimary,
                fontSize   = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier   = Modifier.weight(1f).padding(end = 12.dp),
                lineHeight = 20.sp,
            )
            Icon(
                imageVector        = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint               = HLTextMuted,
                modifier           = Modifier.size(20.dp),
            )
        }
        if (expanded) {
            Spacer(Modifier.height(10.dp))
            Text(
                text      = item.answer,
                color     = HLTextMuted,
                fontSize  = 13.sp,
                lineHeight = 20.sp,
            )
        }
    }
}