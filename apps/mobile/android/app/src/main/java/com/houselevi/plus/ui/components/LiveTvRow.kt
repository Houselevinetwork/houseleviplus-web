package com.houselevi.plus.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.houselevi.plus.data.models.LinearTvBlock
import com.houselevi.plus.ui.theme.*

@Composable
fun LiveTvRow(
    block: LinearTvBlock,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val inf = rememberInfiniteTransition(label = "live")
    val dotAlpha by inf.animateFloat(
        initialValue   = 1f,
        targetValue    = 0.3f,
        animationSpec  = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label          = "dot"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(HLSurface)
            .clickable { onClick() }
    ) {
        Row(
            modifier              = Modifier.padding(12.dp),
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Thumbnail box — uses HLSurfaceHigh now defined in HLColors.kt
            Box(
                modifier = Modifier
                    .size(72.dp, 52.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(HLSurfaceHigh)
            ) {
                if (block.thumbnailUrl.isNotBlank()) {
                    AsyncImage(
                        model = ImageRequest.Builder(LocalContext.current)
                            .data(block.thumbnailUrl)
                            .crossfade(true)
                            .build(),
                        contentDescription = null,
                        contentScale       = ContentScale.Crop,
                        modifier           = Modifier.fillMaxSize()
                    )
                }
                Box(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(3.dp)
                        .background(HLRed, RoundedCornerShape(2.dp))
                        .padding(horizontal = 4.dp, vertical = 1.dp)
                ) {
                    Text(
                        text  = "LIVE",
                        style = HLTypography.labelMedium.copy(
                            color         = Color.White,
                            fontSize      = 7.sp,
                            letterSpacing = 1.sp
                        )
                    )
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment     = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .background(HLRed.copy(alpha = dotAlpha), CircleShape)
                    )
                    Text(
                        text  = "HL MOOD TV  •  LIVE",
                        style = HLTypography.labelMedium.copy(
                            color         = HLRed,
                            fontSize      = 9.sp,
                            letterSpacing = 1.5.sp
                        )
                    )
                }
                Spacer(Modifier.height(3.dp))
                Text(
                    text     = block.title,
                    style    = HLTypography.titleMedium.copy(fontSize = 13.sp),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (block.category.isNotBlank()) {
                    Text(
                        text  = block.category,
                        style = HLTypography.bodyMedium.copy(color = HLTextMuted, fontSize = 11.sp)
                    )
                }
            }

            Text("▶", style = HLTypography.titleLarge.copy(color = HLTextMuted))
        }
    }
}