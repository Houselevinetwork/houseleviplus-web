package com.houselevi.plus.ui.screens.entertainment

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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

data class MusicTrack(val id: String, val title: String, val artist: String, val duration: String, val accentColor: Color = Color(0xFF08060E))
data class MusicPlaylist(val id: String, val name: String, val trackCount: String, val accentColor: Color = Color(0xFF060C1E))
data class MusicArtist(val id: String, val name: String, val genre: String, val accentColor: Color = Color(0xFF060814))

private val NOW_PLAYING = MusicTrack("np1", "Nairobi Nights", "Sauti Sol", "3:42", Color(0xFF060C1E))

private val RECENTLY_PLAYED = listOf(
    MusicPlaylist("r1", "Afrobeats Mix", "24 tracks", Color(0xFF0A0618)),
    MusicPlaylist("r2", "Gengetone Hits", "18 tracks", Color(0xFF060C10)),
    MusicPlaylist("r3", "Gospel Sunday", "30 tracks", Color(0xFF080614)),
    MusicPlaylist("r4", "Chill Vibes", "15 tracks", Color(0xFF06100C)),
    MusicPlaylist("r5", "Hip-Hop Kenya", "22 tracks", Color(0xFF100608)),
)

private val MADE_FOR_YOU = listOf(
    MusicPlaylist("m1", "Your Daily Mix", "20 tracks", Color(0xFF060C1E)),
    MusicPlaylist("m2", "Discover Weekly", "30 tracks", Color(0xFF0C0618)),
    MusicPlaylist("m3", "Release Radar", "25 tracks", Color(0xFF06101A)),
    MusicPlaylist("m4", "Time Capsule", "20 tracks", Color(0xFF100C06)),
)

private val TOP_ARTISTS = listOf(
    MusicArtist("a1", "Sauti Sol", "Afrobeats", Color(0xFF060C1E)),
    MusicArtist("a2", "Nyashinski", "Hip-Hop", Color(0xFF0A0618)),
    MusicArtist("a3", "Bien", "R&B", Color(0xFF060E10)),
    MusicArtist("a4", "Willy Paul", "Gospel", Color(0xFF0C0608)),
    MusicArtist("a5", "Khaligraph", "Hip-Hop", Color(0xFF08060E)),
)

private val TRENDING_TRACKS = listOf(
    MusicTrack("tr1", "Extravaganza", "Sauti Sol ft. Bensoul", "3:58", Color(0xFF060C1E)),
    MusicTrack("tr2", "Olamide", "Nyashinski", "4:12", Color(0xFF0A0618)),
    MusicTrack("tr3", "Ligi Ndogo", "Khaligraph Jones", "3:47", Color(0xFF08060E)),
    MusicTrack("tr4", "Sweet Love", "Willy Paul", "3:22", Color(0xFF0C0608)),
    MusicTrack("tr5", "Timeless", "Bien", "3:55", Color(0xFF060E10)),
    MusicTrack("tr6", "Nairobi", "Bensoul", "4:05", Color(0xFF060C14)),
)

data class Podcast(val id: String, val title: String, val host: String, val accentColor: Color = Color(0xFF060C1E))
data class PodcastEpisode(val id: String, val title: String, val podcast: String, val duration: String, val date: String)

private val POPULAR_PODCASTS = listOf(
    Podcast("p1", "Nairobi Stories", "Alex Mwangi", Color(0xFF060C1E)),
    Podcast("p2", "Tech Talk Africa", "Sarah Kipchoge", Color(0xFF0A0618)),
    Podcast("p3", "Startup Hustle", "James Kariuki", Color(0xFF08060E)),
    Podcast("p4", "African Vibes", "Grace Nyambura", Color(0xFF0C0608)),
    Podcast("p5", "News Brief", "David Otieno", Color(0xFF060E10)),
)

private val MY_PODCASTS = listOf(
    Podcast("mp1", "Tech Talk Africa", "Sarah Kipchoge", Color(0xFF0A0618)),
    Podcast("mp2", "Nairobi Stories", "Alex Mwangi", Color(0xFF060C1E)),
    Podcast("mp3", "African Vibes", "Grace Nyambura", Color(0xFF0C0608)),
)

private val PODCAST_EPISODES = listOf(
    PodcastEpisode("ep1", "The Future of Tech in Africa", "Tech Talk Africa", "45min", "Mar 1, 2026"),
    PodcastEpisode("ep2", "Scaling Your Startup", "Startup Hustle", "38min", "Feb 28, 2026"),
    PodcastEpisode("ep3", "Stories from Nairobi", "Nairobi Stories", "52min", "Feb 27, 2026"),
    PodcastEpisode("ep4", "African Music Revolution", "African Vibes", "41min", "Feb 26, 2026"),
)

@Composable
fun MusicScreen(onBack: () -> Unit = {}) {
    var selectedTab by remember { mutableStateOf(0) }
    var isPlaying by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // ── MAIN CONTENT ──────────────────────────────────────────────────
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 100.dp)
        ) {
            // ── HEADER with HL+ Music title and back button ─────────────────
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 16.dp)
                ) {
                    // Back button
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = HLTextPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    // Title
                    Text(
                        "HL+ MUSIC",
                        modifier = Modifier.align(Alignment.CenterStart).padding(start = 56.dp),
                        color = HLTextPrimary,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 2.sp
                    )

                    // Search and favorite icons
                    Row(
                        modifier = Modifier
                            .align(Alignment.CenterEnd),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = HLTextPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.FavoriteBorder,
                            contentDescription = "Favorites",
                            tint = HLTextPrimary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                Spacer(Modifier.height(16.dp))
            }

            // ── CATEGORY PILLS ────────────────────────────────────────────
            item {
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp)
                ) {
                    items(listOf("All", "New Release", "Trending", "Top")) { category ->
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (category == "All") HLBlueGlow else Color(0xFF2A2A3E),
                            modifier = Modifier.clickable { }
                        ) {
                            Text(
                                category,
                                color = if (category == "All") Color.Black else HLTextMuted,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }

            // ── CURATED & TRENDING SECTION ────────────────────────────────
            item {
                Text(
                    "Curated & trending",
                    color = HLTextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            item {
                // Large featured card - extends full width
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .padding(horizontal = 12.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    HLBlueGlow.copy(0.7f),
                                    HLBlueGlow.copy(0.3f)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .fillMaxWidth(0.65f)
                    ) {
                        Text(
                            "Discover weekly",
                            color = Color.White,
                            fontSize = 26.sp,
                            fontWeight = FontWeight.ExtraBold,
                            lineHeight = 30.sp
                        )
                        Spacer(Modifier.height(10.dp))
                        Text(
                            "The original slow instrumental best playlists.",
                            color = Color.White.copy(0.85f),
                            fontSize = 15.sp,
                            lineHeight = 20.sp
                        )
                    }

                    // Action buttons
                    Row(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .clickable { },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayArrow,
                                contentDescription = "Play",
                                tint = HLBlueGlow,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.FavoriteBorder,
                            contentDescription = "Favorite",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.MoreVert,
                            contentDescription = "More",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                Spacer(Modifier.height(24.dp))
            }

            // ── TOP DAILY PLAYLISTS ───────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Top daily playlists",
                        color = HLTextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "See all",
                        color = HLTextMuted,
                        fontSize = 14.sp
                    )
                }
                Spacer(Modifier.height(12.dp))
            }

            items(MADE_FOR_YOU.take(3)) { playlist ->
                PlaylistRowLarge(playlist)
            }

            item { Spacer(Modifier.height(24.dp)) }
        }

        // ── FLOATING PLAYER BAR (at bottom) ───────────────────────────────
        FloatingPlayer(
            track = NOW_PLAYING,
            isPlaying = isPlaying,
            onPlayClick = { isPlaying = !isPlaying },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
        )
    }
}

@Composable
private fun PlaylistRowLarge(playlist: MusicPlaylist) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Playlist thumbnail
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(
                    Brush.linearGradient(
                        listOf(
                            playlist.accentColor,
                            Color(0xFF08080E)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Text("♪", color = HLBlueGlow.copy(0.6f), fontSize = 24.sp)
        }

        // Playlist info
        Column(modifier = Modifier.weight(1f)) {
            Text(
                playlist.name,
                color = HLTextPrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                playlist.trackCount,
                color = HLTextMuted,
                fontSize = 13.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        // Play button
        Icon(
            imageVector = Icons.Default.PlayArrow,
            contentDescription = "Play",
            tint = HLBlueGlow,
            modifier = Modifier.size(24.dp)
        )
    }
}

@Composable
private fun FloatingPlayer(
    track: MusicTrack,
    isPlaying: Boolean,
    onPlayClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .navigationBarsPadding()
            .padding(12.dp)
    ) {
        // Progress bar
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(2.dp)
                .background(Color.White.copy(0.1f))
                .clip(RoundedCornerShape(1.dp))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.35f)
                    .fillMaxHeight()
                    .background(HLBlueGlow)
            )
        }

        Spacer(Modifier.height(8.dp))

        // Player card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xFF1A1A2E),
                            Color(0xFF0F0F1E)
                        )
                    )
                )
                .border(1.dp, Color.White.copy(0.1f), RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Track thumbnail
                Box(
                    modifier = Modifier
                        .size(50.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(
                                    track.accentColor,
                                    Color(0xFF08080E)
                                )
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text("♪", color = HLBlueGlow.copy(0.6f), fontSize = 22.sp)
                }

                // Track info
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        track.title,
                        color = HLTextPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        track.artist,
                        color = HLTextMuted,
                        fontSize = 12.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                // Play button
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(HLBlueGlow)
                        .clickable { onPlayClick() },
                    contentAlignment = Alignment.Center
                ) {
                    if (isPlaying) {
                        Text("⏸", fontSize = 20.sp, color = Color.Black)
                    } else {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Play",
                            tint = Color.Black,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }
        }
    }
}
