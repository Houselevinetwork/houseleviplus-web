package com.houselevi.plus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════════════════════════
//  CORE BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

val HLBlack        = Color(0xFF0A0A0A)
val HLSurface      = Color(0xFF161616)
val HLSurfaceHigh  = Color(0xFF242424)  // slightly lighter surface for cards/thumbnails

val HLWhite        = Color(0xFFFFFFFF)  // Light mode background

// ═══════════════════════════════════════════════════════════════════════════════
//  BRAND COLOURS
// ═══════════════════════════════════════════════════════════════════════════════

val HLBlueGlow     = Color(0xFF3B82F6)
val HLBlueGlowDim  = Color(0xFF1E3A5F)  // dimmed blue for subtle accents

// ═══════════════════════════════════════════════════════════════════════════════
//  ACCENT COLOURS
// ═══════════════════════════════════════════════════════════════════════════════

val HLGold         = Color(0xFFF59E0B)
val HLRed          = Color(0xFFEF4444)
val HLGreen        = Color(0xFF22C55E)

// ═══════════════════════════════════════════════════════════════════════════════
//  TEXT COLOURS - DARK MODE
// ═══════════════════════════════════════════════════════════════════════════════

val DarkTextPrimary   = Color(0xFFF1F1F1)  // Light gray for dark mode
val DarkTextSecondary = Color(0xFFAAAAAA) // Lighter gray for dark mode
val DarkTextMuted     = Color(0xFF666666) // Medium gray for dark mode

// ═══════════════════════════════════════════════════════════════════════════════
//  TEXT COLOURS - LIGHT MODE
// ═══════════════════════════════════════════════════════════════════════════════

val LightTextPrimary   = Color(0xFF1A1A1A)  // Dark gray/nearly black for light mode
val LightTextSecondary = Color(0xFF4A4A4A)  // Medium dark gray for light mode
val LightTextMuted     = Color(0xFF888888)  // Medium gray for light mode

// ═══════════════════════════════════════════════════════════════════════════════
//  DYNAMIC TEXT COLORS - USE THESE IN YOUR SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

val HLTextPrimary: Color
    @Composable
    get() = if (ThemeManager.isDarkMode.value) DarkTextPrimary else LightTextPrimary

val HLTextSecondary: Color
    @Composable
    get() = if (ThemeManager.isDarkMode.value) DarkTextSecondary else LightTextSecondary

val HLTextMuted: Color
    @Composable
    get() = if (ThemeManager.isDarkMode.value) DarkTextMuted else LightTextMuted

// ═══════════════════════════════════════════════════════════════════════════════
//  UI COLOURS
// ═══════════════════════════════════════════════════════════════════════════════

val HLInputBorder  = Color(0xFF2E2E2E)  // subtle border for inputs and dividers

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPER FUNCTIONS FOR COMMON COLOR NEEDS
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
fun getTextPrimaryColor(): Color {
    return if (ThemeManager.isDarkMode.value) DarkTextPrimary else LightTextPrimary
}

@Composable
fun getTextMutedColor(): Color {
    return if (ThemeManager.isDarkMode.value) DarkTextMuted else LightTextMuted
}

@Composable
fun getTextSecondaryColor(): Color {
    return if (ThemeManager.isDarkMode.value) DarkTextSecondary else LightTextSecondary
}