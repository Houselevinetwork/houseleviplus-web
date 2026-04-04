package com.houselevi.plus.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.houselevi.plus.data.models.ContentItem
import com.houselevi.plus.ui.theme.*

@Composable
fun HeroBanner(
    item: ContentItem,
    onPlay: (ContentItem) -> Unit,
    modifier: Modifier = Modifier
) {
    // Derive badges from available metadata
    val isOriginal = item.metadata.genre.any { it.equals("original", ignoreCase = true) }
    val isAward    = item.metadata.genre.any { it.equals("award", ignoreCase = true) }

    Box(modifier = modifier.fillMaxWidth().height(480.dp)) {

        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data(item.backdropUrl.ifBlank { item.thumbnailUrl })
                .crossfade(true)
                .build(),
            contentDescription = item.title,
            contentScale       = ContentScale.Crop,
            modifier           = Modifier.fillMaxSize(),
        )

        // Vertical gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colorStops = arrayOf(
                            0f   to Color.Transparent,
                            0.5f to Color.Black.copy(alpha = 0.1f),
                            1f   to HLBlack
                        )
                    )
                )
        )

        // Side gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        listOf(Color.Black.copy(alpha = 0.4f), Color.Transparent)
                    )
                )
        )

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 20.dp, end = 80.dp, bottom = 28.dp)
        ) {
            // Badges
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier              = Modifier.padding(bottom = 8.dp)
            ) {
                if (isOriginal) HeroBadge("HOUSE LEVI ORIGINAL", HLBlueGlow)
                if (isAward)    HeroBadge("AWARD WINNER",        HLGold)
            }

            Text(
                text     = item.title,
                style    = HLTypography.headlineLarge.copy(fontSize = 26.sp),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            if (item.description.isNotBlank()) {
                Spacer(Modifier.height(6.dp))
                Text(
                    text     = item.description,
                    style    = HLTypography.bodyMedium.copy(color = HLTextSecondary),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(Modifier.height(16.dp))

            Button(
                onClick          = { onPlay(item) },
                modifier         = Modifier.height(44.dp),
                shape            = RoundedCornerShape(4.dp),
                colors           = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
                contentPadding   = PaddingValues(horizontal = 24.dp)
            ) {
                Text(
                    "▶  Play",
                    style = HLTypography.labelLarge.copy(color = HLBlack, letterSpacing = 1.sp)
                )
            }
        }
    }
}

@Composable
private fun HeroBadge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.2f), RoundedCornerShape(3.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text  = text,
            style = HLTypography.labelMedium.copy(
                color         = color,
                letterSpacing = 1.2.sp,
                fontSize      = 9.sp
            )
        )
    }
}