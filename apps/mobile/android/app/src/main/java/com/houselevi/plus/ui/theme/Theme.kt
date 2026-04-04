package com.houselevi.plus.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val HLDarkColorScheme = darkColorScheme(
    primary          = HLBlueGlow,
    onPrimary        = DarkTextPrimary,
    primaryContainer = HLBlueGlowDim,
    secondary        = HLGold,
    onSecondary      = HLBlack,
    background       = HLBlack,
    onBackground     = DarkTextPrimary,
    surface          = HLSurface,
    onSurface        = DarkTextPrimary,
    surfaceVariant   = HLSurfaceHigh,
    onSurfaceVariant = DarkTextSecondary,
    error            = HLRed,
    onError          = Color.White,
    outline          = HLInputBorder,
)

@Composable
fun HouseLeviplusTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = HLDarkColorScheme,
        typography  = HLTypography,
        content     = content,
    )
}