package com.houselevi.plus.ui.screens.travel

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.houselevi.plus.data.models.TravelTestimonial
import com.houselevi.plus.ui.theme.*

/**
 * Shared composable — used by TravelHomeScreen and PackageDetailScreen.
 *
 * Uses the canonical com.houselevi.plus.data.models.TravelTestimonial from TravelModels.kt.
 * Real fields: id, name, packageSlug, packageTitle, rating, text, avatarUrl, featured, status
 * NOTE: No 'location' field in the model — location is baked into name for placeholder data.
 *
 * File: ui/screens/travel/TravelSharedComponents.kt
 */
@Composable
fun TestimonialCard(t: TravelTestimonial) {
    Column(
        modifier = Modifier
            .width(260.dp)
            .border(1.dp, Color.White.copy(alpha = 0.1f))
            .padding(16.dp),
    ) {
        // Stars
        Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
            repeat(t.rating.coerceIn(1, 5)) {
                Icon(
                    imageVector        = Icons.Default.Star,
                    contentDescription = null,
                    tint               = Color(0xFFD4AA00),
                    modifier           = Modifier.size(12.dp),
                )
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text      = "\"${t.text}\"",
            color     = HLTextPrimary,
            fontSize  = 12.sp,
            lineHeight = 18.sp,
            fontStyle = FontStyle.Italic,
        )
        Spacer(Modifier.height(10.dp))
        // name has location baked in for placeholder data e.g. "Wanjiku M. — Nairobi, Kenya"
        Text(t.name,         color = HLTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(
            text     = t.packageTitle,
            color    = HLBlueGlow,
            fontSize = 10.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}