package com.houselevi.plus.ui.screens.splash

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.delay

// ─── Timing ───────────────────────────────────────────────────────────────────
private const val T_FADE_IN  = 900L
private const val T_HOLD     = 2800L
private const val T_DOTS_IN  = 400L
private const val T_EXIT     = 1200L
private const val T_COMPLETE = 600L

@Composable
fun SplashScreen(
    onNavigateToHome:   () -> Unit,
    onNavigateToSignIn: () -> Unit,
) {
    // ── Animation states ──────────────────────────────────────────────────────
    var logoAlpha    by remember { mutableStateOf(0f) }
    var taglineAlpha by remember { mutableStateOf(0f) }
    var dotsAlpha    by remember { mutableStateOf(0f) }
    var screenAlpha  by remember { mutableStateOf(1f) }

    val logoAlphaAnim    by animateFloatAsState(
        targetValue   = logoAlpha,
        animationSpec = tween(T_FADE_IN.toInt(), easing = LinearEasing),
        label         = "logo"
    )
    val taglineAlphaAnim by animateFloatAsState(
        targetValue   = taglineAlpha,
        animationSpec = tween(700, easing = LinearEasing),
        label         = "tagline"
    )
    val dotsAlphaAnim    by animateFloatAsState(
        targetValue   = dotsAlpha,
        animationSpec = tween(T_DOTS_IN.toInt(), easing = LinearEasing),
        label         = "dots"
    )
    val screenAlphaAnim  by animateFloatAsState(
        targetValue   = screenAlpha,
        animationSpec = tween(T_EXIT.toInt(), easing = FastOutSlowInEasing),
        label         = "screen"
    )

    // Subtle ambient glow pulse — very low alpha so it reads as depth not shape
    val glowInfinite = rememberInfiniteTransition(label = "glow")
    val glowAlpha    by glowInfinite.animateFloat(
        initialValue  = 0.10f,
        targetValue   = 0.18f,
        animationSpec = infiniteRepeatable(
            tween(3000, easing = EaseInOut), RepeatMode.Reverse
        ),
        label = "glowAlpha"
    )

    // ── Sequence ──────────────────────────────────────────────────────────────
    LaunchedEffect(Unit) {
        logoAlpha    = 1f
        delay(T_FADE_IN + 300)
        taglineAlpha = 1f
        delay(400)
        dotsAlpha    = 1f
        delay(T_HOLD)
        screenAlpha  = 0f
        delay(T_EXIT + T_COMPLETE)
        if (TokenManager.isLoggedIn) onNavigateToHome() else onNavigateToSignIn()
    }

    // ── Root — NO .background() here ─────────────────────────────────────────
    // The system window background from themes.xml (@android:color/black) shows
    // through naturally — identical colour to the status bar and nav bar so
    // there are zero seams or visible edges at the top and bottom of the screen
    Box(
        modifier = Modifier
            .fillMaxSize()
            .graphicsLayer { alpha = screenAlphaAnim },
        contentAlignment = Alignment.Center,
    ) {

        // Ambient glow — blur so wide (180dp) it has no shape, only atmosphere
        Box(
            modifier = Modifier
                .size(380.dp)
                .background(
                    Brush.radialGradient(
                        listOf(
                            HLBlueGlow.copy(alpha = glowAlpha),
                            Color.Transparent,
                        )
                    )
                )
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {

            // ── Logo — one clean fade, zero movement ──────────────────────────
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(
                        fontFamily    = FontFamily.Serif,
                        fontSize      = 38.sp,
                        fontWeight    = FontWeight.Bold,
                        color         = Color.White,
                        letterSpacing = 3.sp,
                    )) { append("HOUSE LEVI") }
                    withStyle(SpanStyle(
                        fontFamily = FontFamily.Serif,
                        fontSize   = 44.sp,
                        fontWeight = FontWeight.SemiBold,
                        color      = HLBlueGlow,
                    )) { append("+") }
                },
                modifier = Modifier.graphicsLayer { alpha = logoAlphaAnim }
            )

            Spacer(Modifier.height(16.dp))

            // ── Tagline ───────────────────────────────────────────────────────
            Text(
                text          = "Watch. Shop. Travel.",
                color         = Color.White.copy(alpha = 0.45f),
                fontSize      = 13.sp,
                fontWeight    = FontWeight.Light,
                letterSpacing = 2.5.sp,
                modifier      = Modifier.graphicsLayer { alpha = taglineAlphaAnim }
            )

            Spacer(Modifier.height(56.dp))

            // ── Loading dots ──────────────────────────────────────────────────
            BouncingDots(
                modifier = Modifier.graphicsLayer { alpha = dotsAlphaAnim }
            )
        }
    }
}

// ─── Bouncing Dots ────────────────────────────────────────────────────────────
@Composable
private fun BouncingDots(modifier: Modifier = Modifier) {
    val inf = rememberInfiniteTransition(label = "dots")
    Row(
        modifier              = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment     = Alignment.CenterVertically,
    ) {
        listOf(0, 220, 440).forEach { delayMs ->
            val offsetY by inf.animateFloat(
                initialValue  = 0f,
                targetValue   = -7f,
                animationSpec = infiniteRepeatable(
                    tween(650, delayMillis = delayMs, easing = EaseInOut),
                    RepeatMode.Reverse
                ),
                label = "dotY"
            )
            val dotAlpha by inf.animateFloat(
                initialValue  = 0.3f,
                targetValue   = 0.75f,
                animationSpec = infiniteRepeatable(
                    tween(650, delayMillis = delayMs, easing = EaseInOut),
                    RepeatMode.Reverse
                ),
                label = "dotAlpha"
            )
            Box(
                modifier = Modifier
                    .offset(y = offsetY.dp)
                    .size(5.dp)
                    .background(HLBlueGlow.copy(alpha = dotAlpha), CircleShape)
            )
        }
    }
}