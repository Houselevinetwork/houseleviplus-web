package com.houselevi.plus.ui.screens.player

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.houselevi.plus.data.models.LinearTvBlock
import com.houselevi.plus.ui.theme.*

@Composable
fun LiveTvPlayerScreen(
    block: LinearTvBlock,
    onBack: () -> Unit,
) {
    val context   = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle

    // Pulsing live indicator
    val inf = androidx.compose.animation.core.rememberInfiniteTransition(label = "live")
    val dotAlpha by inf.animateFloat(
        initialValue = 1f, targetValue = 0.2f,
        animationSpec = androidx.compose.animation.core.infiniteRepeatable(
            androidx.compose.animation.core.tween(800),
            androidx.compose.animation.core.RepeatMode.Reverse),
        label = "dot",
    )

    val player = remember {
        ExoPlayer.Builder(context).build().also { exo ->
            if (block.streamUrl.isNotBlank()) {
                exo.setMediaItem(MediaItem.fromUri(block.streamUrl))
                exo.prepare()
                exo.playWhenReady = true
            }
        }
    }

    DisposableEffect(lifecycle) {
        val obs = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE  -> player.pause()
                Lifecycle.Event.ON_RESUME -> player.play()
                else -> {}
            }
        }
        lifecycle.addObserver(obs)
        onDispose { lifecycle.removeObserver(obs); player.release() }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                PlayerView(ctx).apply {
                    this.player = player
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT)
                    setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS)
                }
            }
        )

        // Back button
        IconButton(
            onClick = onBack,
            modifier = Modifier.align(Alignment.TopStart).padding(8.dp)
                .background(Color.Black.copy(0.5f), RoundedCornerShape(50)),
        ) {
            Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
        }

        // Live badge + title
        Row(
            modifier = Modifier.align(Alignment.TopEnd).padding(12.dp)
                .background(Color.Black.copy(0.6f), RoundedCornerShape(6.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Box(modifier = Modifier.size(8.dp).background(HLRed.copy(dotAlpha), CircleShape))
            Text("LIVE", style = HLTypography.labelMedium.copy(color = HLRed, letterSpacing = 1.sp))
            Text("", color = HLTextMuted)
            Text(block.title, style = HLTypography.labelMedium.copy(color = Color.White),
                 maxLines = 1)
        }
    }
}

// helper needed for the dot animation in compose
@Composable
private fun androidx.compose.animation.core.InfiniteTransition.animateFloat(
    initialValue: Float, targetValue: Float,
    animationSpec: androidx.compose.animation.core.InfiniteRepeatableSpec<Float>,
    label: String,
): State<Float> = this.animateFloat(initialValue, targetValue, animationSpec, label)
