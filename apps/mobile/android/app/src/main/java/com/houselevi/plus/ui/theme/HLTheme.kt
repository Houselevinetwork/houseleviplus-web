package com.houselevi.plus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ═══════════════════════════════════════════════════════════════════════════════
//  THEME STATE MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

object ThemeManager {
    val isDarkMode = androidx.compose.runtime.mutableStateOf(true)  // Default: dark mode

    fun toggleTheme() {
        isDarkMode.value = !isDarkMode.value
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DARK COLOR SCHEME
// ═══════════════════════════════════════════════════════════════════════════════

private val HLDarkColorScheme = darkColorScheme(
    primary         = HLBlueGlow,
    onPrimary       = Color.White,
    background      = HLBlack,
    surface         = HLSurface,
    onBackground    = DarkTextPrimary,
    onSurface       = DarkTextPrimary,
    secondary       = HLGold,
)

// ═══════════════════════════════════════════════════════════════════════════════
//  LIGHT COLOR SCHEME (Only background is white, everything else stays same)
// ═══════════════════════════════════════════════════════════════════════════════

private val HLLightColorScheme = lightColorScheme(
    primary         = HLBlueGlow,
    onPrimary       = Color.White,
    background      = HLWhite,  // ONLY THIS CHANGES
    surface         = HLSurface,
    onBackground    = DarkTextPrimary,
    onSurface       = DarkTextPrimary,
    secondary       = HLGold,
)

// ═══════════════════════════════════════════════════════════════════════════════
//  HL THEME
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
fun HLTheme(content: @Composable () -> Unit) {
    val colorScheme = if (ThemeManager.isDarkMode.value) {
        HLDarkColorScheme
    } else {
        HLLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography  = HLTypography,
        content     = content,
    )
}