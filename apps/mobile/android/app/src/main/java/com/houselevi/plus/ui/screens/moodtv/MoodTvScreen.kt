package com.houselevi.plus.ui.screens.moodtv

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.models.LinearTvBlock
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun MoodTvScreen(
    onPlayLive: (LinearTvBlock) -> Unit,
) {
    var block by remember { mutableStateOf<LinearTvBlock?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    // Pulsing live dot
    val inf = rememberInfiniteTransition(label = "live")
    val dotAlpha by inf.animateFloat(
        initialValue = 1f, targetValue = 0.2f,
        animationSpec = infiniteRepeatable(tween(900), RepeatMode.Reverse),
        label = "dot",
    )

    LaunchedEffect(Unit) {
        scope.launch {
            try {
                val res = HLApiClient.linearTvApi.getNowPlaying()
                block = res.body()?.nowPlaying ?: res.body()?.data
            } catch (_: Exception) {}
            isLoading = false
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().background(
            Brush.verticalGradient(listOf(Color(0xFF0A1628), HLBlack))),
        contentAlignment = Alignment.Center,
    ) {
        // Background thumbnail blurred
        block?.thumbnailUrl?.let { thumbUrl ->
            if (thumbUrl.isNotBlank()) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current).data(thumbUrl).crossfade(true).build(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize().blur(40.dp),
                    alpha = 0.15f,
                )
            }
        }

        // Dark overlay
        Box(modifier = Modifier.fillMaxSize().background(Color.Black.copy(0.6f)))

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.padding(40.dp),
        ) {
            // HL Mood TV wordmark
            Text("HL MOOD TV", style = HLTypography.displayLarge.copy(
                letterSpacing = 6.sp, fontSize = 32.sp))

            // Live badge
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.background(Color.Black.copy(0.5f), RoundedCornerShape(20.dp))
                    .padding(horizontal = 14.dp, vertical = 7.dp),
            ) {
                Box(modifier = Modifier.size(8.dp).background(HLRed.copy(dotAlpha), CircleShape))
                Text("LIVE", style = HLTypography.labelLarge.copy(
                    color = HLRed, letterSpacing = 2.sp))
                Text("24/7 African TV", style = HLTypography.labelLarge.copy(color = HLTextSecondary))
            }

            Spacer(Modifier.height(8.dp))

            // Now playing
            if (isLoading) {
                CircularProgressIndicator(color = HLBlueGlow, modifier = Modifier.size(32.dp))
            } else {
                block?.let { b ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("NOW PLAYING", style = HLTypography.labelMedium.copy(
                            color = HLTextMuted, letterSpacing = 2.sp, fontSize = 10.sp))
                        Spacer(Modifier.height(6.dp))
                        Text(b.title, style = HLTypography.titleLarge.copy(textAlign = TextAlign.Center))
                        if (b.category.isNotBlank()) {
                            Text(b.category, style = HLTypography.bodyMedium.copy(color = HLTextMuted))
                        }
                        if (b.endTime.isNotBlank()) {
                            Text("Until ${b.endTime}", style = HLTypography.labelMedium.copy(
                                color = HLTextMuted, fontSize = 11.sp))
                        }
                    }
                } ?: Text("Nothing scheduled right now",
                           style = HLTypography.bodyMedium.copy(color = HLTextMuted))
            }

            Spacer(Modifier.height(8.dp))

            // Play button
            Button(
                onClick = { block?.let { onPlayLive(it) } },
                enabled = block != null,
                modifier = Modifier.fillMaxWidth(0.7f).height(56.dp),
                shape = RoundedCornerShape(4.dp),
                colors = ButtonDefaults.buttonColors(containerColor = HLRed),
            ) {
                Text("  Watch Live", style = HLTypography.labelLarge.copy(fontSize = 17.sp))
            }

            Text(
                "Always-on African music, films, and culture",
                style = HLTypography.bodyMedium.copy(color = HLTextMuted, textAlign = TextAlign.Center, fontSize = 13.sp),
            )
        }
    }
}
