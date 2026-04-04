package com.houselevi.plus.ui.screens.player

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.models.ContentItem
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun VideoPlayerScreen(
    item: ContentItem,
    accessToken: String,   // "Bearer {token}"  passed from auth state
    onBack: () -> Unit,
) {
    val context       = LocalContext.current
    val scope         = rememberCoroutineScope()
    val lifecycle     = LocalLifecycleOwner.current.lifecycle
    val hlsUrl        = item.hlsUrl

    // ExoPlayer instance
    val player = remember {
        ExoPlayer.Builder(context).build().also { exo ->
            if (!hlsUrl.isNullOrBlank()) {
                exo.setMediaItem(MediaItem.fromUri(hlsUrl))
                exo.prepare()
                exo.playWhenReady = true
            }
        }
    }

    var streamStarted by remember { mutableStateOf(false) }
    var streamError   by remember { mutableStateOf<String?>(null) }

    //  Start playback session on backend 
    LaunchedEffect(item.id) {
        try {
            val res = HLApiClient.playbackApi.startPlayback(accessToken,
                com.houselevi.plus.data.api.PlaybackStartBody(item.id))
            if (res.isSuccessful) streamStarted = true
            else streamError = "Stream limit reached (max 3 devices)"
        } catch (e: Exception) {
            // Offline / network  allow local playback but don't heartbeat
            streamStarted = true
        }
    }

    //  Heartbeat every 30 seconds 
    LaunchedEffect(streamStarted) {
        if (!streamStarted) return@LaunchedEffect
        while (true) {
            delay(30_000)
            try {
                HLApiClient.playbackApi.heartbeat(
                    accessToken,
                    com.houselevi.plus.data.api.HeartbeatBody(
                        contentId = item.id,
                        position  = player.currentPosition,
                    )
                )
            } catch (_: Exception) {}
        }
    }

    //  Lifecycle: pause/resume + stop on dispose 
    DisposableEffect(lifecycle) {
        val obs = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE  -> player.pause()
                Lifecycle.Event.ON_RESUME -> player.play()
                else                      -> {}
            }
        }
        lifecycle.addObserver(obs)
        onDispose {
            lifecycle.removeObserver(obs)
            scope.launch {
                try { HLApiClient.playbackApi.stopPlayback(accessToken) } catch (_: Exception) {}
            }
            player.release()
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {

        // Stream error (3-device limit hit)
        if (streamError != null) {
            Column(modifier = Modifier.align(Alignment.Center),
                   horizontalAlignment = Alignment.CenterHorizontally) {
                Text("", fontSize = 48.sp)
                Spacer(Modifier.height(12.dp))
                Text(streamError!!, style = HLTypography.bodyMedium.copy(color = HLTextPrimary))
                Spacer(Modifier.height(8.dp))
                Text("You're already streaming on 3 devices.",
                     style = HLTypography.bodyMedium.copy(color = HLTextMuted))
                Spacer(Modifier.height(20.dp))
                Button(onClick = onBack) { Text("Go back") }
            }
        } else {
            // ExoPlayer view  full screen
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        this.player = player
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT,
                        )
                        setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS)
                    }
                }
            )
        }

        // Back button overlay
        IconButton(
            onClick = onBack,
            modifier = Modifier.align(Alignment.TopStart).padding(8.dp)
                .background(Color.Black.copy(0.5f), RoundedCornerShape(50)),
        ) {
            Icon(Icons.Default.ArrowBack, "Back", tint = Color.White)
        }

        // Title overlay (top right)
        Text(
            text = item.title,
            style = HLTypography.labelLarge.copy(color = Color.White.copy(0.8f)),
            modifier = Modifier.align(Alignment.TopEnd).padding(16.dp),
        )
    }
}
