package com.houselevi.plus.ui.screens.entertainment

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.*
import org.json.JSONObject
import java.net.URL
import java.text.SimpleDateFormat
import java.util.*

// ─── COLOURS ──────────────────────────────────────────────────────────────────

private val BgBlack      = Color(0xFF000000)
private val BgCard       = Color(0xFF1A1A1A)
private val RedLive      = Color(0xFFE53935)
private val TextWhite    = Color(0xFFFFFFFF)
private val TextGray     = Color(0xFF8A8A8A)
private val AboutBg      = Color(0xFFF2F2F2)
private val AboutText    = Color(0xFF111111)
private val AboutSubText = Color(0xFF333333)

// ─── DATA MODELS ──────────────────────────────────────────────────────────────

private data class NowPlayingBlock(
    val name:        String,
    val startTime:   String,
    val endTime:     String,
    val title:       String,
    val description: String,
    val genre:       String,
)

private data class ScheduleBlock(
    val name:      String,
    val startTime: String,
    val endTime:   String,
    val title:     String,
    val genre:     String,
)

private data class ScheduleEntry(
    val block:       ScheduleBlock,
    val description: String,
    val emoji:       String,
    val streamUrl:   String,
)

// ─── MOOD TV SCHEDULE ─────────────────────────────────────────────────────────

private val MOOD_TV_SCHEDULE = listOf(
    ScheduleEntry(
        block       = ScheduleBlock("Coffee Jazz",       "06:00", "10:00", "Morning Coffee Jazz Sessions",    "Jazz / Chill"),
        description = "Start your morning right. Smooth jazz, lo-fi beats and warm coffee vibes to ease you into the day.",
        emoji       = "☕",
        streamUrl   = "https://customer-demo.cloudflarestream.com/coffee-jazz/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("DJ RNB Mix",        "10:00", "12:00", "DJ RNB Mix – Non-Stop Hits",      "R&B / Hip-Hop"),
        description = "Non-stop R&B and Hip-Hop hits curated by HL+ DJs. Feel the rhythm through your morning.",
        emoji       = "🎧",
        streamUrl   = "https://customer-demo.cloudflarestream.com/djrnb/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("Sisibo Podcast",    "12:00", "14:00", "Sisibo Podcast – Midday Edition", "Podcast"),
        description = "Kenya's favourite podcast. Real talk on relationships, culture, money and life in East Africa.",
        emoji       = "🎙️",
        streamUrl   = "https://customer-demo.cloudflarestream.com/sisibo/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("East Africa Music", "14:00", "16:00", "East Africa Music Showcase",       "Afrobeats / Gengetone"),
        description = "The best of East African music — Gengetone, Afrobeats, Bongo Flava and more. No breaks.",
        emoji       = "🌍",
        streamUrl   = "https://customer-demo.cloudflarestream.com/eastafrica/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("Rhumba & Country",  "16:00", "19:00", "Rhumba & Country Classics",        "Rhumba / Country"),
        description = "From Lingala rhumba to classic country ballads — the perfect soundtrack for your evening wind-down.",
        emoji       = "🎸",
        streamUrl   = "https://customer-demo.cloudflarestream.com/rhumba/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("Fireplace 4K",      "19:00", "22:00", "Fireplace 4K – Prime Time Chill",  "Ambient / Relaxation"),
        description = "A stunning 4K crackling fireplace. Wind down your evening with warmth, calm and total relaxation.",
        emoji       = "🔥",
        streamUrl   = "https://customer-demo.cloudflarestream.com/fireplace4k/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("Rainfall",          "22:00", "03:00", "Rainfall – Sleep Sounds",          "Ambient / Sleep"),
        description = "Gentle rainfall sounds for deep, restful sleep. A favourite for HL+ users winding down at night.",
        emoji       = "🌧️",
        streamUrl   = "https://customer-demo.cloudflarestream.com/rainfall/manifest/video.m3u8",
    ),
    ScheduleEntry(
        block       = ScheduleBlock("Morning Glory DJ",  "03:00", "06:00", "Morning Glory DJ – Early Risers",  "Dance / Electronic"),
        description = "For the early risers. Uplifting electronic and dance music to fuel your 3 AM to 6 AM grind.",
        emoji       = "🌅",
        streamUrl   = "https://customer-demo.cloudflarestream.com/morningglory/manifest/video.m3u8",
    ),
)

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────

private fun toMins(t: String): Int = try {
    val p = t.split(":"); p[0].toInt() * 60 + p[1].toInt()
} catch (e: Exception) { 0 }

private fun currentLiveIndex(): Int {
    val now     = Calendar.getInstance()
    val nowMins = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
    val idx     = MOOD_TV_SCHEDULE.indexOfFirst { entry ->
        val s = toMins(entry.block.startTime)
        val e = toMins(entry.block.endTime)
        if (e > s) nowMins in s until e else nowMins >= s || nowMins < e
    }
    return if (idx >= 0) idx else 5 // fallback: Fireplace 4K
}

private fun currentLiveEntry(): ScheduleEntry = MOOD_TV_SCHEDULE[currentLiveIndex()]

private val STUB_NOW_PLAYING: NowPlayingBlock
    get() {
        val e = currentLiveEntry()
        return NowPlayingBlock(
            name        = e.block.name,
            startTime   = e.block.startTime,
            endTime     = e.block.endTime,
            title       = e.block.title,
            description = e.description,
            genre       = e.block.genre,
        )
    }

private fun computeProgress(startTime: String, endTime: String): Float {
    return try {
        val fmt = SimpleDateFormat("HH:mm", Locale.getDefault())
        val now = Calendar.getInstance()
        fun cal(t: String) = Calendar.getInstance().apply {
            time = fmt.parse(t)!!
            set(Calendar.YEAR, now.get(Calendar.YEAR))
            set(Calendar.DAY_OF_YEAR, now.get(Calendar.DAY_OF_YEAR))
        }
        val s       = cal(startTime); val e = cal(endTime)
        val total   = (e.timeInMillis - s.timeInMillis).toFloat()
        val elapsed = (now.timeInMillis - s.timeInMillis).toFloat()
        (elapsed / total).coerceIn(0f, 1f)
    } catch (ex: Exception) { 0.15f }
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────

private const val API_BASE = "http://10.0.2.2:4000"

private suspend fun fetchNowPlaying(): NowPlayingBlock? = withContext(Dispatchers.IO) {
    try {
        val json  = JSONObject(URL("$API_BASE/linear-tv/now-playing").readText())
        val block = json.optJSONObject("block") ?: return@withContext null
        val meta  = block.optJSONObject("metadata") ?: JSONObject()
        NowPlayingBlock(
            name        = block.optString("name"),
            startTime   = block.optString("startTime"),
            endTime     = block.optString("endTime"),
            title       = meta.optString("title"),
            description = meta.optString("description"),
            genre       = meta.optString("genre"),
        )
    } catch (e: Exception) { null }
}

private suspend fun fetchSchedule(): List<ScheduleBlock> = withContext(Dispatchers.IO) {
    try {
        val json   = JSONObject(URL("$API_BASE/linear-tv/schedule/today").readText())
        val blocks = json.optJSONArray("blocks") ?: return@withContext emptyList()
        (0 until blocks.length()).map { i ->
            val b    = blocks.getJSONObject(i)
            val meta = b.optJSONObject("metadata") ?: JSONObject()
            ScheduleBlock(
                name      = b.optString("name"),
                startTime = b.optString("startTime"),
                endTime   = b.optString("endTime"),
                title     = meta.optString("title"),
                genre     = meta.optString("genre"),
            )
        }
    } catch (e: Exception) { emptyList() }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
fun MoodTvScreen(onBack: () -> Unit = {}) {

    // ── Show stub data immediately — no waiting ───────────────────────────
    var nowPlaying by remember { mutableStateOf<NowPlayingBlock>(STUB_NOW_PLAYING) }
    var liveIndex  by remember { mutableStateOf(currentLiveIndex()) }

    // ── Try to refresh from API in background every 60s ───────────────────
    LaunchedEffect(Unit) {
        while (true) {
            try {
                val np = withTimeoutOrNull(5_000) { fetchNowPlaying() }
                if (np != null) nowPlaying = np
            } catch (e: Exception) { /* keep showing stub */ }
            liveIndex = currentLiveIndex()
            delay(60_000)
        }
    }

    val progress = computeProgress(nowPlaying.startTime, nowPlaying.endTime)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgBlack)
            .statusBarsPadding()
    ) {
        TopNavBar(onBack = onBack)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            VideoPlayer(liveIndex = liveIndex)
            NowPlayingInfo(nowPlaying = nowPlaying, progress = progress)
            ScheduleSection(liveIndex = liveIndex)
            AboutSection()
            Spacer(Modifier.height(40.dp))
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TOP NAV BAR
//  Down-chevron on the left (collapse / back), Cast + three-dot on the right
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun TopNavBar(onBack: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp)
            .padding(horizontal = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment     = Alignment.CenterVertically,
    ) {
        // Left: down-chevron (collapse / back)
        IconButton(onClick = onBack) {
            Text(
                text     = "⌄",
                color    = TextWhite,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
            )
        }

        // Right: cast icon + three-dot overflow
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = {}) {
                Text(text = "📡", fontSize = 18.sp)
            }
            IconButton(onClick = {}) {
                Icon(
                    imageVector        = Icons.Default.MoreVert,
                    contentDescription = "More options",
                    tint               = TextWhite,
                    modifier           = Modifier.size(22.dp),
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VIDEO PLAYER
//  16:9 black box. Channel badge bottom-left, "HL+" watermark bottom-right.
//  Centre shows the current block's emoji as a placeholder until ExoPlayer lands.
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun VideoPlayer(liveIndex: Int) {
    val entry = MOOD_TV_SCHEDULE[liveIndex]
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 9f)
            .background(BgBlack)
    ) {
        // Subtle dark gradient — replace Box with AndroidView(ExoPlayer) when ready
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(listOf(Color(0xFF0D0D1A), Color(0xFF020204)))
                )
        )

        // Centre emoji placeholder
        Text(
            text     = entry.emoji,
            fontSize = 72.sp,
            modifier = Modifier.align(Alignment.Center),
        )

        // ── Channel badge — bottom-left (mirrors "📺 DWTV" in screenshot) ──
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(10.dp)
                .background(Color.Black.copy(alpha = 0.80f), RoundedCornerShape(5.dp))
                .padding(horizontal = 9.dp, vertical = 5.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            // Red TV icon box
            Box(
                modifier         = Modifier
                    .size(16.dp)
                    .background(RedLive, RoundedCornerShape(3.dp)),
                contentAlignment = Alignment.Center,
            ) {
                Text("▶", color = TextWhite, fontSize = 7.sp)
            }
            Text(
                text          = "HL+ MOOD TV",
                color         = TextWhite,
                fontSize      = 11.sp,
                fontWeight    = FontWeight.Bold,
                letterSpacing = 0.4.sp,
            )
        }

        // ── Watermark — bottom-right (mirrors "Mw" mark in screenshot) ──
        Text(
            text          = "HL+",
            color         = TextWhite.copy(alpha = 0.40f),
            fontSize      = 13.sp,
            fontWeight    = FontWeight.Black,
            letterSpacing = 1.sp,
            modifier      = Modifier
                .align(Alignment.BottomEnd)
                .padding(10.dp),
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NOW PLAYING INFO
//  Large title → show name → thin red progress bar → start / end timestamps
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun NowPlayingInfo(nowPlaying: NowPlayingBlock, progress: Float) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(BgBlack)
            .padding(horizontal = 16.dp)
            .padding(top = 18.dp, bottom = 20.dp),
    ) {
        // Title — large bold white (matches screenshot)
        Text(
            text       = nowPlaying.title,
            color      = TextWhite,
            fontSize   = 22.sp,
            fontWeight = FontWeight.Bold,
            lineHeight = 30.sp,
            maxLines   = 3,
            overflow   = TextOverflow.Ellipsis,
        )

        Spacer(Modifier.height(4.dp))

        // Show / block name — gray, smaller
        Text(
            text       = nowPlaying.name,
            color      = TextGray,
            fontSize   = 14.sp,
            fontWeight = FontWeight.Normal,
        )

        Spacer(Modifier.height(18.dp))

        // Thin red progress bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(3.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(Color.White.copy(alpha = 0.12f))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(progress)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(2.dp))
                    .background(RedLive)
            )
        }

        Spacer(Modifier.height(7.dp))

        // Start / end times
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(nowPlaying.startTime, color = TextGray, fontSize = 12.sp)
            Text(nowPlaying.endTime,   color = TextGray, fontSize = 12.sp)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCHEDULE SECTION
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun ScheduleSection(liveIndex: Int) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(BgBlack)
            .padding(bottom = 12.dp),
    ) {
        // "SCHEDULE" header — bold, matches screenshot exactly
        Text(
            text       = "SCHEDULE",
            color      = TextWhite,
            fontSize   = 19.sp,
            fontWeight = FontWeight.ExtraBold,
            modifier   = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )

        LazyRow(
            contentPadding        = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            itemsIndexed(MOOD_TV_SCHEDULE) { index, entry ->
                ScheduleCard(entry = entry, isNowPlaying = index == liveIndex)
            }
        }
    }
}

// ─── SCHEDULE CARD ────────────────────────────────────────────────────────────
//
//  PLAYING NOW card:
//    ● PLAYING NOW
//    <title>
//    (empty row)
//    <show name in gray>
//
//  Future card:
//    HH:MM - HH:MM
//    <title>
//    (empty row)
//    <show name in gray>

@Composable
private fun ScheduleCard(entry: ScheduleEntry, isNowPlaying: Boolean) {
    Box(
        modifier = Modifier
            .width(210.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(BgCard)
            .padding(14.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier            = Modifier.fillMaxWidth(),
        ) {
            // Header row
            if (isNowPlaying) {
                Row(
                    verticalAlignment     = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                ) {
                    PlayingNowDot()
                    Text(
                        text          = "PLAYING NOW",
                        color         = TextWhite,
                        fontSize      = 11.sp,
                        fontWeight    = FontWeight.SemiBold,
                        letterSpacing = 0.3.sp,
                    )
                }
            } else {
                Text(
                    text       = "${entry.block.startTime} - ${entry.block.endTime}",
                    color      = TextGray,
                    fontSize   = 12.sp,
                    fontWeight = FontWeight.Normal,
                )
            }

            // Title
            Text(
                text       = entry.block.title,
                color      = TextWhite,
                fontSize   = 15.sp,
                fontWeight = FontWeight.SemiBold,
                lineHeight = 22.sp,
                maxLines   = 3,
                overflow   = TextOverflow.Ellipsis,
            )

            // Empty gap row (matches the visual spacing in screenshot)
            Spacer(Modifier.height(2.dp))

            // Show name — gray, bottom
            Text(
                text       = entry.block.name,
                color      = TextGray,
                fontSize   = 13.sp,
                fontWeight = FontWeight.Normal,
                maxLines   = 1,
                overflow   = TextOverflow.Ellipsis,
            )
        }
    }
}

// ─── PULSING RED DOT ──────────────────────────────────────────────────────────

@Composable
private fun PlayingNowDot() {
    val transition = rememberInfiniteTransition(label = "dot")
    val alpha by transition.animateFloat(
        initialValue  = 1f,
        targetValue   = 0.25f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Reverse),
        label         = "dotAlpha",
    )
    Box(
        modifier = Modifier
            .size(9.dp)
            .background(RedLive.copy(alpha = alpha), CircleShape)
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ABOUT THE CHANNEL
//  White / off-white card with dark text — matches the bottom card in screenshot
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun AboutSection() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(AboutBg)
            .padding(horizontal = 18.dp, vertical = 22.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
                text          = "ABOUT THE CHANNEL",
                color         = AboutText,
                fontSize      = 13.sp,
                fontWeight    = FontWeight.ExtraBold,
                letterSpacing = 0.8.sp,
            )
            Text(
                text       = "Watch our 24/7 live channel featuring a nonstop stream of continuous shows, music, culture and entertainment curated for the HL+ community. Free with your plan — no extra subscription required.",
                color      = AboutSubText,
                fontSize   = 14.sp,
                fontWeight = FontWeight.Normal,
                lineHeight = 22.sp,
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun LoadingScreen() {
    Box(
        modifier         = Modifier
            .fillMaxSize()
            .background(BgBlack),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            CircularProgressIndicator(
                color       = RedLive,
                strokeWidth = 2.dp,
                modifier    = Modifier.size(32.dp),
            )
            Text("Loading Mood TV...", color = TextGray, fontSize = 14.sp)
        }
    }
}