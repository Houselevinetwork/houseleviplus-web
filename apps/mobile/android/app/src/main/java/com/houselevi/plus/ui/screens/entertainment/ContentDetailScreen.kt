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

// â”€â”€â”€ Stub detail data (replaces real API until wired) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

private data class EpisodeItem(val number: String, val title: String, val duration: String, val synopsis: String)
private data class CastMember(val name: String, val role: String, val accentColor: Color)

private val STUB_EPISODES = listOf(
    EpisodeItem("E1","Pilot","54min","When darkness falls over the city, one man stands between order and chaos."),
    EpisodeItem("E2","The Contact","48min","An unexpected ally reveals information that changes everything."),
    EpisodeItem("E3","Crossfire","51min","Loyalties are tested as the truth begins to surface."),
    EpisodeItem("E4","Shadows","47min","A late-night meeting leads to dangerous consequences."),
)

private val STUB_CAST = listOf(
    CastMember("David Otieno","Lead Role", Color(0xFF060C1E)),
    CastMember("Amina Wanjiku","Supporting", Color(0xFF0C0618)),
    CastMember("James Mwangi","Antagonist", Color(0xFF060E14)),
    CastMember("Grace Akinyi","Detective", Color(0xFF100C06)),
)

private val STUB_DIRECTOR = CastMember("Steven Spielberg","Director", Color(0xFF060C1E))

private val STUB_SIMILAR = listOf(
    WatchItem("sim1","Night Watch","Thriller","2023","18+","S1","tvshow",Color(0xFF060C1E)),
    WatchItem("sim2","City Heat","Crime","2024","16+","Movie","movie",Color(0xFF0C0618)),
    WatchItem("sim3","The Verdict","Legal","2024","13+","S2","tvshow",Color(0xFF060E10)),
    WatchItem("sim4","Dark Avenue","Thriller","2023","18+","S1","tvshow",Color(0xFF100C06)),
)

// â”€â”€â”€ SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
fun ContentDetailScreen(
    itemId: String = "",
    onBack: () -> Unit = {},
    onPlay: (String) -> Unit = {},
) {
    // Stub item â€” in production this would come from ViewModel/API
    val item = WatchItem("fallback","The Nairobi Chronicles","Drama Â· Thriller","2024","16+","4 Seasons","tvshow",Color(0xFF060C1E))

    val isTvShow    = item.category == "tvshow"
    var selectedTab by remember { mutableStateOf(0) }
    var inMyList    by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)
    ) {

        // â”€â”€ HERO SECTION WITH BACKDROP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(340.dp)
                    .background(Brush.verticalGradient(listOf(item.accentColor, Color(0xFF050510), HLBlack)))
            ) {
                // Radial glow overlay
                Box(Modifier.fillMaxSize().background(Brush.radialGradient(listOf(HLBlueGlow.copy(0.07f), Color.Transparent))))

                // Back button - top left
                IconButton(
                    onClick  = onBack,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .statusBarsPadding()
                        .padding(8.dp)
                        .size(40.dp)
                ) {
                    Icon(
                        imageVector        = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint               = HLTextPrimary,
                        modifier           = Modifier.size(24.dp)
                    )
                }

                // Like button - top right
                IconButton(
                    onClick  = { inMyList = !inMyList },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .statusBarsPadding()
                        .padding(8.dp)
                        .size(40.dp)
                ) {
                    Icon(
                        imageVector        = if (inMyList) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Add to List",
                        tint               = if (inMyList) HLBlueGlow else HLTextPrimary,
                        modifier           = Modifier.size(24.dp)
                    )
                }

                // Content info - bottom left
                Column(Modifier.align(Alignment.BottomStart).padding(20.dp).fillMaxWidth(0.65f)) {
                    // Genre tags
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                        item.genre.split(" Â· ").forEach { g ->
                            Surface(shape = RoundedCornerShape(2.dp), color = Color(0xFF505050)) {
                                Text(
                                    g,
                                    color      = Color.White,
                                    fontSize   = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier   = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                        }
                    }
                    Spacer(Modifier.height(10.dp))

                    // Title
                    Text(item.title, color = HLTextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Black, lineHeight = 36.sp)
                }
            }
        }

        // â”€â”€ ACTION BUTTONS ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Row(
                modifier              = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment     = Alignment.CenterVertically
            ) {
                // Share
                ActionIconButton(
                    icon     = Icons.Default.Share,
                    label    = "Share",
                    tint     = HLTextMuted,
                    modifier = Modifier.weight(1f)
                )

                // Rating (Thumbs up as proxy)
                ActionIconButton(
                    icon     = Icons.Default.ThumbUp,
                    label    = "Rate",
                    tint     = HLTextMuted,
                    modifier = Modifier.weight(1f)
                )

                // Play
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(HLBlueGlow)
                        .clickable { onPlay(item.id) },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment     = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier              = Modifier.padding(horizontal = 12.dp)
                    ) {
                        Icon(
                            imageVector        = Icons.Default.PlayArrow,
                            contentDescription = "Play",
                            tint               = Color.Black,
                            modifier           = Modifier.size(20.dp)
                        )
                        Text("Play", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp)
                    }
                }

                // Download â€” Unicode arrow avoids all icon library version issues
                Column(
                    modifier            = Modifier
                        .weight(1f)
                        .clickable { },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text       = "â†“",
                        color      = HLTextMuted,
                        fontSize   = 20.sp,
                        fontWeight = FontWeight.Light
                    )
                    Text(
                        text       = "Download",
                        color      = HLTextMuted,
                        fontSize   = 10.sp,
                        maxLines   = 1,
                        overflow   = TextOverflow.Ellipsis,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // â”€â”€ MATCH PERCENTAGE & METADATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Column(Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
                // Match % and metadata
                Row(
                    modifier              = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment     = Alignment.CenterVertically
                ) {
                    Text("86% match", color = Color(0xFF00D084), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text(item.year, color = HLTextMuted, fontSize = 13.sp)
                    Surface(shape = RoundedCornerShape(2.dp), color = Color.White.copy(0.1f)) {
                        Text(
                            item.rating,
                            color      = HLTextMuted,
                            fontSize   = 11.sp,
                            fontWeight = FontWeight.Medium,
                            modifier   = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Text(item.duration, color = HLTextMuted, fontSize = 13.sp)
                }

                Spacer(Modifier.height(12.dp))

                // Description
                Text(
                    "A criminal mastermind who goes by \"The Professor\" has a plan to pull off the biggest heist in recorded history â€” to print billions of euros in the Royal Mint of Spain... [Read More]",
                    color      = HLTextMuted,
                    fontSize   = 13.sp,
                    lineHeight = 19.sp
                )
            }
        }

        // â”€â”€ CAST & CREW HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Text(
                "Cast & Crew",
                color      = HLTextPrimary,
                fontSize   = 18.sp,
                fontWeight = FontWeight.Black,
                modifier   = Modifier.padding(horizontal = 20.dp, vertical = 14.dp)
            )
        }

        // â”€â”€ CAST CAROUSEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            LazyRow(
                contentPadding        = PaddingValues(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(STUB_CAST) { member ->
                    Column(
                        modifier            = Modifier.width(90.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            Modifier
                                .size(90.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(
                                    Brush.linearGradient(
                                        listOf(member.accentColor, Color(0xFF08080E))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Person, null, tint = HLTextMuted.copy(0.4f), modifier = Modifier.size(48.dp))
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(
                            member.name,
                            color     = HLTextPrimary,
                            fontSize  = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            maxLines  = 2,
                            overflow  = TextOverflow.Ellipsis,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            lineHeight = 15.sp
                        )
                        Text(
                            member.role,
                            color     = HLTextMuted,
                            fontSize  = 10.sp,
                            maxLines  = 1,
                            overflow  = TextOverflow.Ellipsis,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
            Spacer(Modifier.height(12.dp))
        }

        // â”€â”€ DIRECTOR SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Row(
                modifier              = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment     = Alignment.Top
            ) {
                Box(
                    Modifier
                        .size(80.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(STUB_DIRECTOR.accentColor, Color(0xFF08080E))
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, null, tint = HLTextMuted.copy(0.4f), modifier = Modifier.size(40.dp))
                }

                Column(Modifier.weight(1f)) {
                    Text(
                        STUB_DIRECTOR.role,
                        color      = HLTextMuted,
                        fontSize   = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        STUB_DIRECTOR.name,
                        color      = HLTextPrimary,
                        fontSize   = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "A Spanish television producer, writer, series creator and director, known for the crime thriller series.",
                        color      = HLTextMuted,
                        fontSize   = 12.sp,
                        lineHeight = 17.sp
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "MORE INFO",
                        color         = HLBlueGlow,
                        fontSize      = 11.sp,
                        fontWeight    = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }

        // â”€â”€ DIVIDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Spacer(Modifier.height(8.dp))
            HorizontalDivider(color = Color.White.copy(0.07f), thickness = 1.dp)
        }

        // â”€â”€ TAB BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        item {
            Row(modifier = Modifier.fillMaxWidth()) {
                val tabs = if (isTvShow) listOf("Overview", "Seasons", "Similar") else listOf("Overview", "Similar")
                tabs.forEachIndexed { i, tab ->
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedTab = i }
                            .padding(vertical = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            tab,
                            color      = if (selectedTab == i) HLTextPrimary else HLTextMuted,
                            fontSize   = 14.sp,
                            fontWeight = if (selectedTab == i) FontWeight.Black else FontWeight.Medium
                        )
                        if (selectedTab == i) {
                            Spacer(Modifier.height(8.dp))
                            Box(
                                Modifier
                                    .width(40.dp)
                                    .height(3.dp)
                                    .background(HLBlueGlow, RoundedCornerShape(1.5.dp))
                            )
                        }
                    }
                }
            }
            HorizontalDivider(color = Color.White.copy(0.07f), thickness = 1.dp)
        }

        // â”€â”€ OVERVIEW TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (selectedTab == 0) {
            item {
                Spacer(Modifier.height(16.dp))
            }
        }

        // â”€â”€ EPISODES TAB (TV shows only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        if (selectedTab == 1 && isTvShow) {
            item {
                Row(
                    modifier              = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("Season 1", "Season 2", "Season 3").forEach { s ->
                        Surface(
                            shape    = RoundedCornerShape(2.dp),
                            color    = if (s == "Season 1") Color(0xFF505050) else Color(0xFF1A1A2E),
                            border   = if (s != "Season 1") BorderStroke(1.dp, Color.White.copy(0.1f)) else null,
                            modifier = Modifier.height(32.dp)
                        ) {
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier         = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 12.dp)
                            ) {
                                Text(
                                    s,
                                    color      = if (s == "Season 1") Color.White else HLTextMuted,
                                    fontSize   = 12.sp,
                                    fontWeight = if (s == "Season 1") FontWeight.Bold else FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
            }

            items(STUB_EPISODES) { ep ->
                EpisodeRow(ep) { onPlay(item.id) }
            }
        }

        // â”€â”€ SIMILAR TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        val similarTabIndex = if (isTvShow) 2 else 1
        if (selectedTab == similarTabIndex) {
            item {
                LazyRow(
                    contentPadding        = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(STUB_SIMILAR) { sim ->
                        PosterCardDetail(sim) { }
                    }
                }
                Spacer(Modifier.height(20.dp))
            }
        }

        item { Spacer(Modifier.height(20.dp)) }
    }
}

// â”€â”€â”€ EPISODE ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
private fun EpisodeRow(ep: EpisodeItem, onPlay: () -> Unit) {
    Column {
        Row(
            modifier              = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(width = 120.dp, height = 67.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Brush.linearGradient(listOf(Color(0xFF060C1E), Color(0xFF08080E)))),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    Modifier
                        .size(36.dp)
                        .background(Color.Black.copy(0.6f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(20.dp))
                }
                Surface(
                    Modifier.align(Alignment.BottomEnd).padding(4.dp),
                    RoundedCornerShape(2.dp),
                    Color.Black.copy(0.7f)
                ) {
                    Text(ep.duration, color = HLTextMuted, fontSize = 9.sp, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                }
            }

            Column(Modifier.weight(1f)) {
                Text(ep.number,   color = HLBlueGlow,    fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.5.sp)
                Text(ep.title,    color = HLTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(4.dp))
                Text(ep.synopsis, color = HLTextMuted,   fontSize = 12.sp, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 17.sp)
            }

            Icon(Icons.Default.MoreVert, null, tint = HLTextMuted, modifier = Modifier.size(18.dp))
        }
        HorizontalDivider(Modifier.padding(horizontal = 20.dp), color = Color.White.copy(0.05f))
    }
}

// â”€â”€â”€ ACTION ICON BUTTON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
private fun ActionIconButton(
    icon:     androidx.compose.ui.graphics.vector.ImageVector,
    label:    String,
    tint:     Color    = HLTextMuted,
    modifier: Modifier = Modifier
) {
    Column(
        modifier            = modifier.clickable { },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(imageVector = icon, contentDescription = label, tint = tint, modifier = Modifier.size(20.dp))
        Text(label, color = tint, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, fontWeight = FontWeight.Medium)
    }
}

// â”€â”€â”€ POSTER CARD (Similar section) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

@Composable
private fun PosterCardDetail(item: WatchItem, onClick: (WatchItem) -> Unit) {
    Column(Modifier.width(110.dp).clickable { onClick(item) }) {
        Box(
            Modifier
                .fillMaxWidth()
                .height(160.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Brush.verticalGradient(listOf(item.accentColor, Color(0xFF08080E))))
        ) {
            Box(
                Modifier
                    .size(44.dp)
                    .background(Color.Black.copy(0.6f), CircleShape)
                    .align(Alignment.Center),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(22.dp))
            }
            Surface(
                Modifier.align(Alignment.TopEnd).padding(4.dp),
                RoundedCornerShape(2.dp),
                Color.Black.copy(0.7f)
            ) {
                Text(item.rating, color = HLTextMuted, fontSize = 9.sp, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(item.title, color = HLTextPrimary, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, fontWeight = FontWeight.SemiBold)
        Text(item.genre, color = HLTextMuted,   fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}
