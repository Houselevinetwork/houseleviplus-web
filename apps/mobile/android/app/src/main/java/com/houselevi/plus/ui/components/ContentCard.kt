package com.houselevi.plus.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.houselevi.plus.data.models.ContentItem
import com.houselevi.plus.ui.theme.*

@Composable
fun ContentCard(
    item: ContentItem,
    onClick: (ContentItem) -> Unit,
    modifier: Modifier = Modifier,
    width: Dp = 140.dp,
    height: Dp = 200.dp,
    showTitle: Boolean = true,
) {
    // Format duration from seconds to "mm:ss" or "h:mm:ss"
    val durationSecs = item.storage.duration
    val displayDuration: String = if (durationSecs > 0) {
        val h = durationSecs / 3600
        val m = (durationSecs % 3600) / 60
        val s = durationSecs % 60
        if (h > 0) "%d:%02d:%02d".format(h, m, s)
        else "%d:%02d".format(m, s)
    } else ""

    // Derive badges from available metadata fields
    val isOriginal  = item.metadata.genre.any { it.equals("original", ignoreCase = true) }
    val isTrending  = item.metadata.genre.any { it.equals("trending", ignoreCase = true) }

    Column(
        modifier            = modifier.width(width).clickable { onClick(item) },
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(height)
                .clip(RoundedCornerShape(6.dp))
                .background(HLSurface)
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(item.thumbnailUrl)
                    .crossfade(true)
                    .build(),
                contentDescription = item.title,
                contentScale       = ContentScale.Crop,
                modifier           = Modifier.fillMaxSize(),
            )

            // Bottom gradient
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.5f)
                    .align(Alignment.BottomCenter)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color.Transparent, Color.Black.copy(alpha = 0.75f))
                        )
                    )
            )

            // Badges
            Row(
                modifier            = Modifier.align(Alignment.TopStart).padding(6.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                if (isOriginal) HLBadge("ORIGINAL", HLBlueGlow)
                if (isTrending) HLBadge("TRENDING", HLRed)
                if (item.isPremium) HLBadge("PREMIUM", HLGold)
            }

            // Duration
            if (displayDuration.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(6.dp)
                        .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(3.dp))
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                ) {
                    Text(
                        text  = displayDuration,
                        style = HLTypography.labelMedium.copy(fontSize = 10.sp, color = Color.White)
                    )
                }
            }

            // Premium crown
            if (item.isPremium) {
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(6.dp)
                        .size(20.dp)
                        .background(HLGold.copy(alpha = 0.9f), RoundedCornerShape(4.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("👑", fontSize = 10.sp)
                }
            }
        }

        if (showTitle) {
            Text(
                text     = item.title,
                style    = HLTypography.bodyMedium.copy(color = HLTextPrimary, fontSize = 13.sp),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
fun ContentCardWide(
    item: ContentItem,
    onClick: (ContentItem) -> Unit,
    modifier: Modifier = Modifier
) {
    ContentCard(item = item, onClick = onClick, modifier = modifier, width = 220.dp, height = 130.dp)
}

@Composable
private fun HLBadge(text: String, color: Color) {
    Box(
        modifier = Modifier
            .background(color.copy(alpha = 0.9f), RoundedCornerShape(3.dp))
            .padding(horizontal = 5.dp, vertical = 2.dp)
    ) {
        Text(
            text  = text,
            style = HLTypography.labelMedium.copy(
                fontSize      = 8.sp,
                color         = Color.White,
                letterSpacing = 0.8.sp
            )
        )
    }
}