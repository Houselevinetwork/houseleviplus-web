package com.houselevi.plus.ui.screens.entertainment

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.pager.*
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ═══════════════════════════════════════════════════════════════════════════════
//  DATA MODELS
// ═══════════════════════════════════════════════════════════════════════════════

data class WatchItem(
    val id:          String,
    val title:       String,
    val genre:       String,
    val year:        String,
    val rating:      String,
    val duration:    String,
    val category:    String,
    val accentColor: Color = Color(0xFF060C1E),
    val progress:    Float = 0f,
    val episode:     String = "",
)

data class HostItem(
    val id:          String,
    val name:        String,
    val show:        String,
    val accentColor: Color = Color(0xFF0A0A14),
)

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTENT DATA
// ═══════════════════════════════════════════════════════════════════════════════

private val LIVE_ITEM = WatchItem(
    "live1",
    "Ep. 247 – Inside the Nairobi Summit: What Really Happened",
    "The HL+ Daily Show",
    "2024", "PG", "Live", "podcast", Color(0xFF060C1E)
)

private val HOSTS = listOf(
    HostItem("host1", "Dr. Amina Hassan",  "The HL+ Daily Show",  Color(0xFF060C1E)),
    HostItem("host2", "James Kariuki",     "Africa Unfiltered",   Color(0xFF0C060E)),
    HostItem("host3", "Grace Mwende",      "The Culture Shift",   Color(0xFF060E14)),
    HostItem("host4", "Samuel Ochieng",    "Tech Talk Africa",    Color(0xFF160E04)),
    HostItem("host5", "Fatima Al-Rashid",  "Global Perspectives", Color(0xFF0C0618)),
)

private val FEATURED_PODCASTS = listOf(
    WatchItem("fp1","The HL+ Daily Show",  "News & Politics","2024","PG",  "Daily",     "podcast",Color(0xFF060C1E)),
    WatchItem("fp2","Africa Unfiltered",   "Culture",        "2024","PG",  "Weekly",    "podcast",Color(0xFF0C060E)),
    WatchItem("fp3","Tech Talk Africa",    "Technology",     "2024","PG",  "Weekly",    "podcast",Color(0xFF060E14)),
    WatchItem("fp4","The Culture Shift",   "Society",        "2024","13+", "Bi-weekly", "podcast",Color(0xFF160E04)),
)

private val CONTINUE_WATCHING = listOf(
    WatchItem("c1","The Nairobi Chronicles","Drama",     "2024","16+","S1:E3","tvshow",   Color(0xFF060C1E),0.45f,"S1:E3"),
    WatchItem("c2","African Queens",        "Documentary","2024","PG", "S1:E1","tvshow",  Color(0xFF0C060E),0.72f,"S1:E1"),
    WatchItem("c3","Mombasa Noir",          "Movie",     "2023","18+","1:12:34","movie",  Color(0xFF060E14),0.31f,"1h 12m"),
    WatchItem("c4","Stage Night Live",      "Stage Play","2024","PG", "S2:E4","stageplay",Color(0xFF12060C),0.88f,"S2:E4"),
)

private val MY_LIST = listOf(
    WatchItem("ml1","House of Cards",   "Political Drama","2021","16+","S6",    "tvshow",Color(0xFF060C1E)),
    WatchItem("ml2","Echoes of Nairobi","Drama",          "2023","PG", "Movie", "movie", Color(0xFF0C0618)),
    WatchItem("ml3","Stranger Things",  "Sci-Fi",         "2024","16+","S5",    "tvshow",Color(0xFF060E14)),
    WatchItem("ml4","The Last Kingdom", "Historical",     "2023","16+","S5",    "tvshow",Color(0xFF160E04)),
)

private val TV_SHOWS = listOf(
    WatchItem("tv1","The Nairobi Chronicles","Drama",   "2024","16+","S4","tvshow",Color(0xFF060C1E)),
    WatchItem("tv2","Hustle Circuit",        "Comedy",  "2024","13+","S2","tvshow",Color(0xFF160E04)),
    WatchItem("tv3","Night Watch",           "Thriller","2023","18+","S1","tvshow",Color(0xFF0C060E)),
    WatchItem("tv4","Eastlands",             "Drama",   "2024","16+","S3","tvshow",Color(0xFF060E10)),
    WatchItem("tv5","The Fix",               "Legal",   "2023","13+","S2","tvshow",Color(0xFF100C1A)),
)

private val MOVIES = listOf(
    WatchItem("m1","Mombasa Noir",   "Crime · Drama","2023","18+","1h 45m","movie",Color(0xFF060E14)),
    WatchItem("m2","Homecoming",     "Drama",        "2024","13+","1h 52m","movie",Color(0xFF12060C)),
    WatchItem("m3","The Last Safari","Adventure",    "2024","PG", "2h 10m","movie",Color(0xFF060C1E)),
    WatchItem("m4","City of Gold",   "Thriller",     "2023","16+","1h 38m","movie",Color(0xFF160C0C)),
    WatchItem("m5","Broken Crowns",  "Drama",        "2024","16+","1h 55m","movie",Color(0xFF100808)),
)

private val STAGE_PLAYS = listOf(
    WatchItem("s1","Stage Night Live",  "Comedy",    "2024","PG", "2h",     "stageplay",Color(0xFF12060E)),
    WatchItem("s2","Echoes of Nairobi", "Drama",     "2024","PG", "1h 45m", "stageplay",Color(0xFF060C1E)),
    WatchItem("s3","The Kingdom",       "Historical","2023","13+","2h 20m", "stageplay",Color(0xFF160E04)),
    WatchItem("s4","Laugh Parliament",  "Stand-up",  "2024","16+","1h",     "stageplay",Color(0xFF060E10)),
)

private val SPORTS = listOf(
    WatchItem("sp1","KPL Highlights",  "Football",  "2024","PG","Weekly","sport",Color(0xFF060E10)),
    WatchItem("sp2","Safari Rally",    "Motorsport","2024","PG","Live",  "sport",Color(0xFF160E04)),
    WatchItem("sp3","KBF Basketball",  "Basketball","2024","PG","Live",  "sport",Color(0xFF060C1E)),
    WatchItem("sp4","Athletics Kenya", "Athletics", "2024","PG","Weekly","sport",Color(0xFF10060E)),
    WatchItem("sp5","Rugby Africa Cup","Rugby",     "2024","PG","Weekly","sport",Color(0xFF080E10)),
)

private val SHORTS = listOf(
    WatchItem("sh1","60 Seconds: Nairobi","Short", "2024","PG","1min","short",Color(0xFF060E10)),
    WatchItem("sh2","Street Food Africa", "Food",  "2024","PG","3min","short",Color(0xFF12060C)),
    WatchItem("sh3","Dance Challenge",    "Music", "2024","PG","2min","short",Color(0xFF160E04)),
    WatchItem("sh4","Quick Comedy",       "Comedy","2024","PG","4min","short",Color(0xFF060C1E)),
    WatchItem("sh5","City Diaries",       "Vlog",  "2024","PG","5min","short",Color(0xFF0C0618)),
    WatchItem("sh6","Nairobi Eats",       "Food",  "2024","PG","3min","short",Color(0xFF060E14)),
)

private val PODCASTS = listOf(
    WatchItem("po1","Tech Talk Africa","Technology","2024","PG", "Weekly",    "podcast",Color(0xFF0A0618)),
    WatchItem("po2","Nairobi Stories", "Culture",   "2024","PG", "Bi-weekly", "podcast",Color(0xFF060C1E)),
    WatchItem("po3","Startup Hustle",  "Business",  "2024","13+","Weekly",    "podcast",Color(0xFF08060E)),
    WatchItem("po4","African Vibes",   "Music",     "2024","PG", "Weekly",    "podcast",Color(0xFF0C0608)),
    WatchItem("po5","News Brief",      "News",      "2024","PG", "Daily",     "podcast",Color(0xFF060E10)),
)

private val PILLS = listOf("All","Podcasts","TV Shows","Movies","Stage Plays","Sports","Shorts","Music")

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun EntertainmentScreen(
    onContentClick: (WatchItem) -> Unit = {},
    onMusicClick:   () -> Unit = {},
    onMoodTvClick:  () -> Unit = {},
    onSeeAll:       (String) -> Unit = {},
) {
    var selectedCat   by remember { mutableStateOf("All") }
    val followedHosts  = remember { mutableStateMapOf<String, Boolean>() }

    val showAll      = selectedCat == "All"
    val showPodcasts = showAll || selectedCat == "Podcasts"
    val showTvShows  = showAll || selectedCat == "TV Shows"
    val showMovies   = showAll || selectedCat == "Movies"
    val showPlays    = showAll || selectedCat == "Stage Plays"
    val showSports   = showAll || selectedCat == "Sports"
    val showShorts   = showAll || selectedCat == "Shorts"
    val showMusic    = showAll || selectedCat == "Music"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {

        // ── 1. CATEGORY PILLS ────────────────────────────────────────────
        item { CategoryPills(PILLS, selectedCat) { selectedCat = it } }

        // ── 2. LIVE FEATURED CARD ────────────────────────────────────────
        item { LiveFeaturedCard(LIVE_ITEM, onContentClick) }

        // ── 3. BROWSE BY HOST ────────────────────────────────────────────
        item {
            BrowseByHostSection(
                hosts    = HOSTS,
                followed = followedHosts,
                onFollow = { id -> followedHosts[id] = !(followedHosts[id] ?: false) },
                onClick  = {},
            )
        }

        // ── 4. FEATURED PODCASTS carousel ────────────────────────────────
        if (showPodcasts) {
            item {
                SectionHeader("Featured Podcasts") { onSeeAll("featured-podcasts") }
                FeaturedPodcastsCarousel(FEATURED_PODCASTS, onContentClick)
            }
        }

        // ── 5. CONTINUE WATCHING ─────────────────────────────────────────
        if (showAll) {
            item {
                SectionHeader("CONTINUE WATCHING") { onSeeAll("continue") }
                ContinueWatchingRow(CONTINUE_WATCHING, onContentClick)
            }
        }

        // ── 6. MY LIST ───────────────────────────────────────────────────
        if (showAll) {
            item {
                SectionHeader("MY LIST") { onSeeAll("mylist") }
                DWCardRow(MY_LIST, onContentClick)
            }
        }

        // ── 7. TV SHOWS ──────────────────────────────────────────────────
        if (showTvShows) {
            item {
                SectionHeader("TV SHOWS") { onSeeAll("tvshows") }
                DWCardRow(TV_SHOWS, onContentClick)
            }
        }

        // ── 8. MOVIES ────────────────────────────────────────────────────
        if (showMovies) {
            item {
                SectionHeader("MOVIES") { onSeeAll("movies") }
                DWCardRow(MOVIES, onContentClick)
            }
        }

        // ── 9. STAGE PLAYS ───────────────────────────────────────────────
        if (showPlays) {
            item {
                SectionHeader("STAGE PLAYS") { onSeeAll("stageplays") }
                DWCardRow(STAGE_PLAYS, onContentClick)
            }
        }

        // ── 10. SPORTS ───────────────────────────────────────────────────
        if (showSports) {
            item {
                SectionHeader("SPORTS") { onSeeAll("sports") }
                DWCardRow(SPORTS, onContentClick)
            }
        }

        // ── 11. PODCASTS ROW ─────────────────────────────────────────────
        if (showPodcasts) {
            item {
                SectionHeader("PODCASTS") { onSeeAll("podcasts") }
                DWCardRow(PODCASTS, onContentClick)
            }
        }

        // ── 12. SHORTS — YouTube Shorts style ────────────────────────────
        if (showShorts) {
            item {
                SectionHeader("SHORTS") { onSeeAll("shorts") }
                ShortsRow(SHORTS, onContentClick)
            }
        }

        // ── 13. MUSIC PROMO ──────────────────────────────────────────────
        if (showMusic) {
            item { MusicPromoBanner(onMusicClick) }
        }

        // ── 14. MOOD TV ──────────────────────────────────────────────────
        item {
            MoodTvBanner(onMoodTvClick)
            Spacer(Modifier.height(20.dp))
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CATEGORY PILLS
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun CategoryPills(categories: List<String>, selected: String, onSelect: (String) -> Unit) {
    LazyRow(
        contentPadding        = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        items(categories) { cat ->
            val sel = cat == selected
            Surface(
                onClick  = { onSelect(cat) },
                shape    = RoundedCornerShape(50.dp),
                color    = Color.Transparent,
                border   = BorderStroke(1.dp, if (sel) HLTextPrimary else Color.White.copy(0.25f)),
                modifier = Modifier.height(38.dp),
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier         = Modifier
                        .background(
                            if (sel) Color.White.copy(0.08f) else Color.Transparent,
                            RoundedCornerShape(50.dp)
                        )
                        .padding(horizontal = 18.dp),
                ) {
                    Text(
                        text       = cat,
                        color      = if (sel) HLTextPrimary else HLTextMuted,
                        fontSize   = 13.sp,
                        fontWeight = if (sel) FontWeight.Bold else FontWeight.Normal,
                    )
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LIVE FEATURED CARD
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun LiveFeaturedCard(item: WatchItem, onClick: (WatchItem) -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF0E0E14))
            .border(1.dp, Color.White.copy(0.07f), RoundedCornerShape(8.dp))
            .clickable { onClick(item) }
    ) {
        Row(
            modifier              = Modifier
                .fillMaxWidth()
                .padding(10.dp),
            verticalAlignment     = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .size(width = 110.dp, height = 72.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Brush.linearGradient(listOf(item.accentColor, Color(0xFF08080E)))),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary.copy(0.4f), modifier = Modifier.size(30.dp))
                Surface(
                    modifier = Modifier.align(Alignment.BottomStart).padding(5.dp),
                    shape    = RoundedCornerShape(3.dp),
                    color    = Color.Black.copy(0.8f),
                ) {
                    Row(
                        modifier              = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment     = Alignment.CenterVertically,
                    ) {
                        Box(Modifier.size(6.dp).background(Color(0xFFFF0000), CircleShape))
                        Text("Live", color = HLTextPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Column(Modifier.weight(1f)) {
                Text(
                    text       = item.title,
                    color      = HLTextPrimary,
                    fontSize   = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines   = 2,
                    overflow   = TextOverflow.Ellipsis,
                    lineHeight = 18.sp,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text     = item.genre,
                    color    = HLTextMuted,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  BROWSE BY HOST
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun BrowseByHostSection(
    hosts:    List<HostItem>,
    followed: Map<String, Boolean>,
    onFollow: (String) -> Unit,
    onClick:  (HostItem) -> Unit,
) {
    Column(Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 8.dp)) {
        Text(
            text       = "Browse by Host",
            color      = HLTextPrimary,
            fontSize   = 22.sp,
            fontWeight = FontWeight.Black,
            modifier   = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
        LazyRow(
            contentPadding        = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            items(hosts) { host ->
                val isFollowed = followed[host.id] ?: false
                Column(
                    modifier            = Modifier.width(130.dp).clickable { onClick(host) },
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(Brush.radialGradient(listOf(host.accentColor, Color(0xFF08080E)))),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.Person, null, tint = HLTextMuted.copy(0.35f), modifier = Modifier.size(55.dp))
                    }
                    Spacer(Modifier.height(10.dp))
                    Text(
                        text       = host.name,
                        color      = HLTextPrimary,
                        fontSize   = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines   = 2,
                        overflow   = TextOverflow.Ellipsis,
                        textAlign  = TextAlign.Center,
                        lineHeight = 17.sp,
                    )
                    Spacer(Modifier.height(10.dp))
                    Surface(
                        onClick  = { onFollow(host.id) },
                        shape    = RoundedCornerShape(4.dp),
                        color    = if (isFollowed) HLBlueGlow else HLTextPrimary,
                        modifier = Modifier.fillMaxWidth().height(34.dp),
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxSize()) {
                            Text(
                                text          = if (isFollowed) "FOLLOWING" else "FOLLOW",
                                color         = Color.Black,
                                fontSize      = 11.sp,
                                fontWeight    = FontWeight.ExtraBold,
                                letterSpacing = 0.5.sp,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION HEADER
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun SectionHeader(label: String, onSeeAll: () -> Unit) {
    Row(
        modifier              = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp, bottom = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment     = Alignment.CenterVertically,
    ) {
        Text(
            text          = label,
            color         = HLTextPrimary,
            fontSize      = 20.sp,
            fontWeight    = FontWeight.Black,
            letterSpacing = 0.3.sp,
        )
        TextButton(onClick = onSeeAll, contentPadding = PaddingValues(0.dp)) {
            Text("›", color = HLTextMuted, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FEATURED PODCASTS CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════════

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun FeaturedPodcastsCarousel(items: List<WatchItem>, onClick: (WatchItem) -> Unit) {
    val pagerState = rememberPagerState { items.size }
    val scope      = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        while (true) {
            delay(5000)
            scope.launch {
                pagerState.animateScrollToPage((pagerState.currentPage + 1) % items.size)
            }
        }
    }

    Column {
        HorizontalPager(
            state          = pagerState,
            contentPadding = PaddingValues(horizontal = 16.dp),
            pageSpacing    = 10.dp,
            modifier       = Modifier.fillMaxWidth(),
        ) { page ->
            val item = items[page]
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Brush.linearGradient(listOf(item.accentColor, Color(0xFF08080E))))
                    .border(1.dp, Color.White.copy(0.07f), RoundedCornerShape(8.dp))
                    .clickable { onClick(item) }
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color.Black.copy(0.55f), CircleShape)
                        .align(Alignment.Center),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(30.dp))
                }
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .fillMaxWidth()
                        .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(0.85f))))
                        .padding(horizontal = 14.dp, vertical = 12.dp)
                ) {
                    Surface(shape = RoundedCornerShape(3.dp), color = HLBlueGlow.copy(0.2f)) {
                        Text(
                            item.genre,
                            color         = HLBlueGlow,
                            fontSize      = 10.sp,
                            fontWeight    = FontWeight.Bold,
                            modifier      = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            letterSpacing = 0.8.sp,
                        )
                    }
                    Spacer(Modifier.height(5.dp))
                    Text(
                        text       = item.title,
                        color      = HLTextPrimary,
                        fontSize   = 16.sp,
                        fontWeight = FontWeight.Black,
                        maxLines   = 2,
                        overflow   = TextOverflow.Ellipsis,
                        lineHeight = 20.sp,
                    )
                    Spacer(Modifier.height(3.dp))
                    Text(text = item.duration, color = HLTextMuted, fontSize = 12.sp)
                }
            }
        }
        // Dot indicators
        Row(
            modifier              = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp, bottom = 2.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment     = Alignment.CenterVertically,
        ) {
            repeat(items.size) { i ->
                Box(
                    modifier = Modifier
                        .padding(horizontal = 3.dp)
                        .height(3.dp)
                        .width(if (i == pagerState.currentPage) 18.dp else 5.dp)
                        .clip(CircleShape)
                        .background(if (i == pagerState.currentPage) HLBlueGlow else Color.White.copy(0.25f))
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DW CARD ROW — Daily Wire+ landscape rectangles
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun DWCardRow(items: List<WatchItem>, onClick: (WatchItem) -> Unit) {
    LazyRow(
        contentPadding        = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier              = Modifier.padding(bottom = 8.dp),
    ) {
        items(items) { item -> DWCard(item, onClick) }
    }
}

@Composable
private fun DWCard(item: WatchItem, onClick: (WatchItem) -> Unit) {
    Column(
        modifier = Modifier
            .width(240.dp)
            .clickable { onClick(item) }
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(135.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(Brush.linearGradient(listOf(item.accentColor, Color(0xFF08080E))))
                .border(1.dp, Color.White.copy(0.06f), RoundedCornerShape(6.dp))
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Color.Black.copy(0.55f), CircleShape)
                    .align(Alignment.Center),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(26.dp))
            }
            Surface(
                modifier = Modifier.align(Alignment.TopEnd).padding(6.dp),
                shape    = RoundedCornerShape(3.dp),
                color    = Color.Black.copy(0.75f),
            ) {
                Text(
                    item.rating,
                    color      = HLTextMuted,
                    fontSize   = 9.sp,
                    fontWeight = FontWeight.Medium,
                    modifier   = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                )
            }
            Surface(
                modifier = Modifier.align(Alignment.BottomStart).padding(6.dp),
                shape    = RoundedCornerShape(3.dp),
                color    = HLBlueGlow.copy(0.18f),
            ) {
                Text(
                    item.duration,
                    color      = HLBlueGlow,
                    fontSize   = 10.sp,
                    fontWeight = FontWeight.Bold,
                    modifier   = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text       = item.title,
            color      = HLTextPrimary,
            fontSize   = 14.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines   = 1,
            overflow   = TextOverflow.Ellipsis,
        )
        Text(
            text     = item.genre,
            color    = HLTextMuted,
            fontSize = 12.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONTINUE WATCHING ROW
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun ContinueWatchingRow(items: List<WatchItem>, onClick: (WatchItem) -> Unit) {
    LazyRow(
        contentPadding        = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        modifier              = Modifier.padding(bottom = 8.dp),
    ) {
        items(items) { item ->
            Column(
                modifier = Modifier
                    .width(240.dp)
                    .clickable { onClick(item) }
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(135.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(Brush.linearGradient(listOf(item.accentColor, Color(0xFF08080E))))
                        .border(1.dp, Color.White.copy(0.06f), RoundedCornerShape(6.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .background(Color.Black.copy(0.6f), CircleShape)
                            .align(Alignment.Center),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(26.dp))
                    }
                    Surface(
                        modifier = Modifier.align(Alignment.TopStart).padding(6.dp),
                        shape    = RoundedCornerShape(3.dp),
                        color    = Color.Black.copy(0.8f),
                    ) {
                        Text(
                            item.episode,
                            color      = HLTextPrimary,
                            fontSize   = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier   = Modifier.padding(horizontal = 5.dp, vertical = 2.dp),
                        )
                    }
                }
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(3.dp)
                        .clip(RoundedCornerShape(1.5.dp))
                        .background(Color.White.copy(0.1f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(item.progress)
                            .fillMaxHeight()
                            .background(HLBlueGlow)
                            .clip(RoundedCornerShape(1.5.dp))
                    )
                }
                Spacer(Modifier.height(8.dp))
                Text(item.title, color = HLTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(item.genre, color = HLTextMuted,   fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SHORTS ROW — YouTube Shorts style tall cards
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun ShortsRow(items: List<WatchItem>, onClick: (WatchItem) -> Unit) {
    LazyRow(
        contentPadding        = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier              = Modifier.padding(bottom = 8.dp),
    ) {
        items(items) { item ->
            Column(
                modifier = Modifier
                    .width(115.dp)
                    .clickable { onClick(item) }
            ) {
                Box(
                    modifier = Modifier
                        .width(115.dp)
                        .height(200.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Brush.verticalGradient(listOf(item.accentColor, Color(0xFF08080E))))
                        .border(1.dp, Color.White.copy(0.06f), RoundedCornerShape(8.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(Color.Black.copy(0.6f), CircleShape)
                            .align(Alignment.Center),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Default.PlayArrow, null, tint = HLTextPrimary, modifier = Modifier.size(22.dp))
                    }
                    Surface(
                        modifier = Modifier.align(Alignment.BottomEnd).padding(6.dp),
                        shape    = RoundedCornerShape(3.dp),
                        color    = Color.Black.copy(0.75f),
                    ) {
                        Text(
                            item.duration,
                            color    = HLTextMuted,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
                        )
                    }
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .fillMaxWidth()
                            .background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(0.75f))))
                            .padding(horizontal = 8.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text       = item.title,
                            color      = HLTextPrimary,
                            fontSize   = 11.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines   = 2,
                            overflow   = TextOverflow.Ellipsis,
                            lineHeight = 14.sp,
                        )
                    }
                }
                Spacer(Modifier.height(6.dp))
                Text(item.genre, color = HLTextMuted, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MUSIC PROMO BANNER
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun MusicPromoBanner(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Brush.horizontalGradient(listOf(Color(0xFF08061A), Color(0xFF10082A), HLBlueGlow.copy(0.2f))))
            .border(1.dp, HLBlueGlow.copy(0.25f), RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(20.dp)
    ) {
        Column {
            Text("HL+ MUSIC", color = HLBlueGlow, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 2.sp)
            Spacer(Modifier.height(8.dp))
            Text("Your music lives here.", color = HLTextPrimary, fontSize = 22.sp, fontWeight = FontWeight.Black, lineHeight = 26.sp)
            Spacer(Modifier.height(8.dp))
            Text("Afrobeats · Gengetone · Gospel · Jazz · Hip-Hop", color = HLTextMuted, fontSize = 13.sp, lineHeight = 19.sp)
            Spacer(Modifier.height(14.dp))
            Surface(onClick = onClick, shape = RoundedCornerShape(4.dp), color = HLBlueGlow) {
                Text(
                    "OPEN MUSIC",
                    color         = Color.Black,
                    fontSize      = 12.sp,
                    fontWeight    = FontWeight.ExtraBold,
                    letterSpacing = 1.sp,
                    modifier      = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                )
            }
        }
        Text("♪", color = HLBlueGlow.copy(0.12f), fontSize = 90.sp, modifier = Modifier.align(Alignment.CenterEnd))
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MOOD TV BANNER — fully clickable, navigates to MoodTvScreen
// ═══════════════════════════════════════════════════════════════════════════════

@Composable
private fun MoodTvBanner(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 10.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Brush.horizontalGradient(listOf(Color(0xFF07070E), Color(0xFF0A0A14), HLBlueGlow.copy(0.12f))))
            .border(1.dp, Color.White.copy(0.08f), RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(20.dp)
    ) {
        Column {
            Text("24/7 · LIVE · FREE WITH PLAN", color = HLBlueGlow, fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 2.sp)
            Spacer(Modifier.height(8.dp))
            Text("HL Mood TV", color = HLTextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Black, lineHeight = 28.sp)
            Spacer(Modifier.height(8.dp))
            Text(
                "Always-on live channel. Curated moods, music, culture and news.",
                color      = HLTextMuted,
                fontSize   = 13.sp,
                lineHeight = 19.sp,
            )
            Spacer(Modifier.height(14.dp))
            // WATCH NOW button
            Surface(onClick = onClick, shape = RoundedCornerShape(4.dp), color = Color.White.copy(0.1f)) {
                Row(
                    modifier              = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment     = Alignment.CenterVertically,
                ) {
                    Box(Modifier.size(7.dp).background(Color(0xFFFF0000), CircleShape))
                    Text(
                        "WATCH LIVE",
                        color         = HLTextPrimary,
                        fontSize      = 12.sp,
                        fontWeight    = FontWeight.ExtraBold,
                        letterSpacing = 0.8.sp,
                    )
                }
            }
        }
        Text("▶", color = HLBlueGlow.copy(0.08f), fontSize = 90.sp, modifier = Modifier.align(Alignment.CenterEnd))
    }
}
