package com.houselevi.plus.ui.screens.onboarding

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.launch

// ═══════════════════════════════════════════════════════════════
//  SLIDE DATA
// ═══════════════════════════════════════════════════════════════

private data class OnboardingSlide(
    val label:    String,
    val title:    String,
    val subtitle: String,
)

private val SLIDES = listOf(
    OnboardingSlide(
        label    = "ONE APP. EVERYTHING.",
        title    = "Watch. Shop.\nTravel.",
        subtitle = "Stream your favourite content, shop exclusive HL+ merch, and book curated travel — all in one app.",
    ),
    OnboardingSlide(
        label    = "STREAM · BINGE · DISCOVER",
        title    = "Theatre. Films.\nPodcasts. Sports.",
        subtitle = "Everything you love — in one place. Watch anywhere, on any device, at any time.",
    ),
    OnboardingSlide(
        label    = "LIVE · 24/7 · FREE WITH PLAN",
        title    = "24/7 HL Mood TV.\nLive. Always On.",
        subtitle = "Your personal live channel — curated moods, music, culture and news. Streaming non-stop, every day.",
    ),
    OnboardingSlide(
        label    = "BUILT FOR AFRICA",
        title    = "Plans Built\nfor Africa.",
        subtitle = "Shared to the rest of the world. Plans start at KSh 299/month. Watch on any device. Cancel anytime.",
    ),
    OnboardingSlide(
        label    = "NO COMMITMENT",
        title    = "Cancel Online.\nAnytime.",
        subtitle = "Join today. No contracts. No hidden fees. Change or cancel your plan at any time, online.",
    ),
)

// ═══════════════════════════════════════════════════════════════
//  SCREEN
// ═══════════════════════════════════════════════════════════════

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onJoin:    () -> Unit = {},
    onSignIn:  () -> Unit = {},
    onPrivacy: () -> Unit = {},
    onFaq:     () -> Unit = {},
    onHelp:    () -> Unit = {},
) {
    val pagerState   = rememberPagerState { SLIDES.size }
    val scope        = rememberCoroutineScope()
    var menuExpanded by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFF050510),
                        Color(0xFF080814),
                        Color(0xFF0A0A18),
                        HLBlack,
                    )
                )
            ),
    ) {
        // Subtle radial glow — centre of screen, brand blue
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(400.dp)
                .align(Alignment.TopCenter)
                .background(
                    Brush.radialGradient(
                        listOf(
                            HLBlueGlow.copy(alpha = 0.07f),
                            Color.Transparent,
                        )
                    )
                )
        )

        // ── Full-screen pager ────────────────────────────────────────────
        HorizontalPager(
            state    = pagerState,
            modifier = Modifier.fillMaxSize(),
        ) { page ->
            SlideContent(slide = SLIDES[page])
        }

        // ── Top bar overlay ──────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
        ) {
            // Left — HOUSE LEVI+ logo
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(
                        color         = HLTextPrimary,
                        fontWeight    = FontWeight.ExtraBold,
                        fontSize      = 22.sp,
                        letterSpacing = 1.5.sp,
                    )) { append("HOUSE LEVI") }
                    withStyle(SpanStyle(
                        color      = HLBlueGlow,
                        fontWeight = FontWeight.Light,
                        fontSize   = 27.sp,
                    )) { append("+") }
                },
                modifier = Modifier.align(Alignment.CenterStart),
            )

            // Right — PRIVACY · ⋮
            Row(
                modifier          = Modifier.align(Alignment.CenterEnd),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                TextButton(
                    onClick        = onPrivacy,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    Text(
                        text          = "PRIVACY",
                        color         = HLTextMuted,
                        fontSize      = 10.sp,
                        letterSpacing = 0.8.sp,
                        fontWeight    = FontWeight.Medium,
                    )
                }

                // Three-dot menu
                Box {
                    IconButton(
                        onClick  = { menuExpanded = true },
                        modifier = Modifier.size(36.dp),
                    ) {
                        Icon(
                            imageVector        = Icons.Default.MoreVert,
                            contentDescription = "More",
                            tint               = HLTextPrimary,
                            modifier           = Modifier.size(20.dp),
                        )
                    }
                    DropdownMenu(
                        expanded         = menuExpanded,
                        onDismissRequest = { menuExpanded = false },
                        modifier         = Modifier.background(Color(0xFF1A1A1A)),
                    ) {
                        DropdownMenuItem(
                            text    = { Text("Sign In", color = HLTextPrimary, fontSize = 13.sp) },
                            onClick = { menuExpanded = false; onSignIn() },
                            modifier = Modifier.background(Color(0xFF1A1A1A)),
                        )
                        HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
                        DropdownMenuItem(
                            text    = { Text("FAQs", color = HLTextPrimary, fontSize = 13.sp) },
                            onClick = { menuExpanded = false; onFaq() },
                            modifier = Modifier.background(Color(0xFF1A1A1A)),
                        )
                        HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
                        DropdownMenuItem(
                            text    = { Text("Help & Support", color = HLTextPrimary, fontSize = 13.sp) },
                            onClick = { menuExpanded = false; onHelp() },
                            modifier = Modifier.background(Color(0xFF1A1A1A)),
                        )
                    }
                }
            }
        }

        // ── Bottom controls — responsive layout ───────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, Color(0xEE0A0A0A), Color(0xFF0A0A0A))
                    )
                )
                .navigationBarsPadding()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp, top = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Dot indicators — CENTERED
            Row(
                modifier              = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment     = Alignment.CenterVertically,
            ) {
                repeat(SLIDES.size) { i ->
                    val active   = i == pagerState.currentPage
                    val dotWidth by animateDpAsState(if (active) 22.dp else 6.dp, label = "dot_w")
                    val dotAlpha by animateFloatAsState(if (active) 1f else 0.5f, label = "dot_a")
                    Box(
                        modifier = Modifier
                            .height(5.dp)
                            .width(dotWidth)
                            .clip(CircleShape)
                            .background(
                                if (active) HLBlueGlow
                                else Color.White.copy(alpha = dotAlpha)
                            )
                            .clickable { scope.launch { pagerState.animateScrollToPage(i) } }
                    )
                    if (i < SLIDES.size - 1) Spacer(Modifier.width(6.dp))
                }
            }

            Spacer(Modifier.height(20.dp))

            // JOIN HOUSE LEVI+ — Last element
            Button(
                onClick  = onJoin,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape  = RoundedCornerShape(2.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
            ) {
                Text(
                    text          = "JOIN HOUSE LEVI+",
                    color         = Color.Black,
                    fontSize      = 15.sp,
                    fontWeight    = FontWeight.Black,
                    letterSpacing = 2.sp,
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  SLIDE CONTENT — Responsive text sizing
// ═══════════════════════════════════════════════════════════════

@Composable
private fun SlideContent(slide: OnboardingSlide) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent),
    ) {
        // ── Text block — responsive spacing and sizing ──
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .padding(horizontal = 20.dp)
                .padding(bottom = 160.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Small caps label
            Text(
                text          = slide.label,
                color         = HLBlueGlow,
                fontSize      = 9.sp,
                fontWeight    = FontWeight.Bold,
                letterSpacing = 1.5.sp,
                textAlign     = TextAlign.Center,
                modifier      = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(12.dp))

            // Main title — responsive font size
            Text(
                text          = slide.title,
                color         = HLTextPrimary,
                fontSize      = 32.sp,
                fontWeight    = FontWeight.Black,
                lineHeight    = 38.sp,
                letterSpacing = 0.2.sp,
                textAlign     = TextAlign.Center,
                modifier      = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(14.dp))

            // Subtitle — responsive font size and line height
            Text(
                text      = slide.subtitle,
                color     = HLTextMuted,
                fontSize  = 13.sp,
                lineHeight = 20.sp,
                textAlign = TextAlign.Center,
                modifier  = Modifier.fillMaxWidth(),
            )
        }
    }
}