package com.houselevi.plus.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val HLTypography = Typography(
    displayLarge  = TextStyle(fontWeight = FontWeight.Black,  fontSize = 32.sp, color = DarkTextPrimary),
    headlineLarge = TextStyle(fontWeight = FontWeight.Bold,   fontSize = 28.sp, color = DarkTextPrimary),
    headlineMedium = TextStyle(fontWeight = FontWeight.Bold,  fontSize = 22.sp, color = DarkTextPrimary),
    titleLarge    = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 20.sp, color = DarkTextPrimary),
    titleMedium   = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = DarkTextPrimary),
    bodyLarge     = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, color = DarkTextSecondary),
    bodyMedium    = TextStyle(fontWeight = FontWeight.Normal, fontSize = 14.sp, color = DarkTextSecondary),
    labelLarge    = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 14.sp, color = DarkTextPrimary),
    labelMedium   = TextStyle(fontWeight = FontWeight.Medium,  fontSize = 12.sp, color = DarkTextSecondary),
)