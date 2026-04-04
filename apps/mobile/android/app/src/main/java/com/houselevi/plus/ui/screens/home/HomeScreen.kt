package com.houselevi.plus.ui.screens.home

import androidx.compose.material3.MaterialTheme
import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.houselevi.plus.data.models.*
import com.houselevi.plus.ui.components.PremiumGateDialog
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.HomeViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun HomeScreen(
    currentUser:     User?,
    onContentPlay:   (ContentItem) -> Unit,
    onwatchCategory: (slug: String, name: String) -> Unit,
    onLiveTvPlay:    (LinearTvBlock) -> Unit,
    onShopClick:     () -> Unit = {},
    onTravelClick:   () -> Unit = {},
    vm:              HomeViewModel = viewModel(),
) {
    val state    by vm.state.collectAsState()
    val context   = LocalContext.current
    val isPremium = currentUser?.isActivePremium == true

    var premiumGateItem by remember { mutableStateOf<ContentItem?>(null) }

    fun handleTap(item: ContentItem) {
        if (item.isPremium && !isPremium) premiumGateItem = item
        else onContentPlay(item)
    }

    val newsItems      = remember(state.items) { state.items.filter { it.type.lowercase() == "news"     }.take(10) }
    val trendingItems  = remember(state.items) { state.items.filter { it.type.lowercase() == "trending" }.take(10) }
    val featuredItems  = remember(state.items) { state.items.filter { it.type.lowercase() in listOf("original","featured","film","doc","theatre") }.take(6) }
    val shortItems     = remember(state.items) { state.items.filter { it.type.lowercase() in listOf("short","shorts") }.take(10) }
    val sportsItems    = remember(state.items) { state.items.filter { it.type.lowercase() in listOf("sport","sports") }.take(10) }
    val originalsItems = remember(state.items) { state.items.filter { it.type.lowercase() == "original" }.take(8) }

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        when {
            state.isLoading -> CircularProgressIndicator(color = HLBlueGlow, modifier = Modifier.align(Alignment.Center))
            state.error != null -> Column(modifier = Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(state.error!!, style = HLTypography.bodyMedium.copy(color = HLTextMuted))
                Spacer(Modifier.height(16.dp))
                Button(onClick = { vm.refresh() }) { Text("Retry") }
            }
            else -> LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(0.dp)) {
                item { HeroSlideshowSection(state.heroImages, state.heroConfig, state.galleryEvents, state.activeEvent) { slug, _ -> vm.switchEvent(slug) } }
                if (!isPremium) {
                    item { HeroJoinSection { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/choose-plan"))) } }
                }
                state.liveNow?.let { live ->
                    item {
                        HomeSectionHeader("HL MOOD TV") {}
                        LiveFeaturedCard("HL+ Mood TV — Live Now", "Always On · Free With Plan") { onLiveTvPlay(live) }
                    }
                }
                if (newsItems.isNotEmpty())        { item { HomeSectionHeader("NEWS") { onwatchCategory("news","News") };                ContentCardRow(newsItems, ::handleTap) } }
                if (trendingItems.isNotEmpty())    { item { HomeSectionHeader("TRENDING NOW") { onwatchCategory("trending","Trending") }; ContentCardRow(trendingItems, ::handleTap) } }
                if (featuredItems.isNotEmpty())    { item { HomeSectionHeader("FEATURED") { onwatchCategory("featured","Featured") };     ApiContentPager(featuredItems, ::handleTap) } }
                if (originalsItems.isNotEmpty())   { item { HomeSectionHeader("HL+ ORIGINALS") { onwatchCategory("all","All") };          ContentCardRow(originalsItems, ::handleTap) } }
                if (shortItems.isNotEmpty())       { item { HomeSectionHeader("SHORTS") { onwatchCategory("shorts","Shorts") };           ShortsRow(shortItems, ::handleTap) } }
                if (sportsItems.isNotEmpty())      { item { HomeSectionHeader("SPORTS") { onwatchCategory("sports","Sports") };           ContentCardRow(sportsItems, ::handleTap) } }
                if (state.shopProducts.isNotEmpty())    { item { HomeSectionHeader("SHOP HL+") { onShopClick() };   ShopRow(state.shopProducts, onShopClick) } }
                if (state.travelPackages.isNotEmpty())  { item { HomeSectionHeader("TRAVEL") { onTravelClick() };   TravelRow(state.travelPackages, onTravelClick) } }
                item { GetAllAccessBanner { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/choose-plan"))) } }
                item { HomeQuoteCard("\"${state.heroConfig.heroTitle}\"", "— House Levi+") }
                item { Spacer(Modifier.height(32.dp)) }
            }
        }
        premiumGateItem?.let { item ->
            PremiumGateDialog(
                contentTitle = item.title,
                onSubscribe  = { premiumGateItem = null; context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/choose-plan"))) },
                onDismiss    = { premiumGateItem = null },
            )
        }
    }
}

@Composable
fun GetAllAccessBanner(onClick: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 12.dp)
            .clip(RoundedCornerShape(10.dp))
            .background(Brush.linearGradient(listOf(Color(0xFF0A1628), Color(0xFF0D1F3C))))
            .border(1.dp, HLBlueGlow.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
            .clickable { onClick() }.padding(horizontal = 20.dp, vertical = 20.dp),
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text("GET ALL ACCESS",                           color = HLBlueGlow,      fontSize = 11.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.5.sp)
                Spacer(Modifier.height(4.dp))
                Text("Watch, Shop & Travel — One Subscription", color = DarkTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold,      lineHeight = 22.sp)
                Spacer(Modifier.height(6.dp))
                Text("Join the HL Fold and unlock everything.", color = HLTextMuted, fontSize = 12.sp)
            }
            Spacer(Modifier.width(8.dp))
            Text("›", color = HLBlueGlow, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun HomeQuoteCard(quote: String, attribution: String) {
    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(quote, color = DarkTextPrimary.copy(alpha = 0.85f), fontSize = 16.sp, fontWeight = FontWeight.Light, textAlign = TextAlign.Center, lineHeight = 24.sp, letterSpacing = 0.3.sp)
        Spacer(Modifier.height(8.dp))
        Text(attribution, color = HLTextMuted, fontSize = 12.sp, letterSpacing = 1.sp)
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun HeroSlideshowSection(
    images: List<String>, config: HomeConfig, events: List<GalleryEvent>,
    activeEvent: String, onEventClick: (slug: String, name: String) -> Unit,
) {
    if (images.isEmpty()) return
    val pagerState = rememberPagerState { images.size }
    val scope = rememberCoroutineScope()
    LaunchedEffect(images) {
        while (true) {
            delay(config.slideshowInterval.toLong())
            scope.launch { pagerState.animateScrollToPage((pagerState.currentPage + 1) % images.size) }
        }
    }
    Box(modifier = Modifier.fillMaxWidth().height(280.dp)) {
        HorizontalPager(state = pagerState, modifier = Modifier.fillMaxSize()) { page ->
            AsyncImage(model = images[page], contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        }
        Box(modifier = Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Black.copy(alpha = 0.25f), Color.Transparent, Color.Black.copy(alpha = 0.75f)))))
        if (events.isNotEmpty()) {
            LazyRow(modifier = Modifier.align(Alignment.TopCenter).padding(top = 16.dp), contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                item { EventTab("All", activeEvent == "all") { onEventClick("all", "All Events") } }
                items(events) { ev -> EventTab(ev.name, activeEvent == ev.slug) { onEventClick(ev.slug, ev.name) } }
            }
        }
        Column(modifier = Modifier.align(Alignment.BottomCenter).fillMaxWidth().padding(horizontal = 24.dp, vertical = 20.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(config.heroCaption, color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 4.sp)
            Text(config.heroTitle,   color = Color.White,                    fontSize = 24.sp, fontWeight = FontWeight.Black,    letterSpacing = 1.sp, textAlign = TextAlign.Center, lineHeight = 28.sp)
        }
        Row(modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 6.dp), horizontalArrangement = Arrangement.Center) {
            repeat(minOf(images.size, 8)) { i ->
                val active = i == pagerState.currentPage % minOf(images.size, 8)
                Box(modifier = Modifier.padding(horizontal = 3.dp).height(3.dp).width(if (active) 18.dp else 5.dp).clip(CircleShape).background(if (active) HLBlueGlow else Color.White.copy(alpha = 0.25f)))
            }
        }
        Text("${pagerState.currentPage + 1} / ${images.size}", color = Color.White.copy(alpha = 0.6f), fontSize = 11.sp, modifier = Modifier.align(Alignment.BottomStart).padding(start = 16.dp, bottom = 10.dp))
    }
}

@Composable
private fun EventTab(label: String, selected: Boolean, onClick: () -> Unit) {
    Surface(onClick = onClick, shape = RoundedCornerShape(20.dp), color = if (selected) Color.White else Color.Black.copy(alpha = 0.4f), border = BorderStroke(1.dp, if (selected) Color.White else Color.White.copy(alpha = 0.2f))) {
        Text(label, color = if (selected) Color.Black else Color.White.copy(alpha = 0.7f), fontSize = 11.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.5.sp, modifier = Modifier.padding(horizontal = 14.dp, vertical = 5.dp))
    }
}

@Composable
private fun HomeSectionHeader(label: String, onSeeAll: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(top = 24.dp, bottom = 10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, color = DarkTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, letterSpacing = 0.3.sp)
        TextButton(onClick = onSeeAll, contentPadding = PaddingValues(0.dp)) { Text("›", color = HLTextMuted, fontSize = 22.sp, fontWeight = FontWeight.Bold) }
    }
}

@Composable
private fun HeroJoinSection(onJoinFold: () -> Unit) {
    Box(modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(Color(0xFF0F1620), Color(0xFF0A0D15), HLBlack))).padding(horizontal = 16.dp, vertical = 16.dp)) {
        Button(onClick = onJoinFold, modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = HLBlueGlow)) {
            Text("Join the HL Fold", color = Color.Black, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, letterSpacing = 0.5.sp)
        }
    }
}

@Composable
private fun LiveFeaturedCard(title: String, showName: String, onClick: () -> Unit) {
    Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFF0E0E14)).border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(8.dp)).clickable { onClick() }) {
        Row(modifier = Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(modifier = Modifier.size(width = 110.dp, height = 72.dp).clip(RoundedCornerShape(6.dp)).background(Brush.linearGradient(listOf(Color(0xFF060C1E), Color(0xFF08080E)))), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PlayArrow, null, tint = DarkTextPrimary.copy(alpha = 0.4f), modifier = Modifier.size(30.dp))
                Surface(modifier = Modifier.align(Alignment.BottomStart).padding(5.dp), shape = RoundedCornerShape(3.dp), color = Color.Black.copy(alpha = 0.8f)) {
                    Row(modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(6.dp).background(Color(0xFFFF0000), CircleShape))
                        Text("Live", color = DarkTextPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Column(Modifier.weight(1f)) {
                Text(title,    color = DarkTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 18.sp)
                Spacer(Modifier.height(4.dp))
                Text(showName, color = HLTextMuted,    fontSize = 12.sp, maxLines = 1)
            }
        }
    }
}

// FIX: ContentItem.thumbnailUrl replaces images?.thumbnail (thumbnail field does not exist)
@Composable
private fun ContentCardRow(items: List<ContentItem>, onClick: (ContentItem) -> Unit) {
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        items(items) { item ->
            Column(modifier = Modifier.width(220.dp).clickable { onClick(item) }) {
                Box(modifier = Modifier.fillMaxWidth().height(124.dp).clip(RoundedCornerShape(6.dp)).border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(6.dp))) {
                    val thumb = item.thumbnailUrl.takeIf { it.isNotBlank() }
                    if (thumb != null) {
                        AsyncImage(model = thumb, contentDescription = item.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                    } else {
                        Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF060C1E), Color(0xFF08080E)))))
                    }
                    Box(modifier = Modifier.size(40.dp).background(Color.Black.copy(alpha = 0.55f), CircleShape).align(Alignment.Center), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.PlayArrow, null, tint = DarkTextPrimary, modifier = Modifier.size(22.dp))
                    }
                    if (item.type.isNotBlank()) {
                        Surface(modifier = Modifier.align(Alignment.TopStart).padding(6.dp), shape = RoundedCornerShape(3.dp), color = HLBlueGlow.copy(alpha = 0.2f)) {
                            Text(item.type.uppercase(), color = HLBlueGlow, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 0.8.sp, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                    if (item.isPremium) {
                        Surface(modifier = Modifier.align(Alignment.TopEnd).padding(6.dp), shape = RoundedCornerShape(3.dp), color = HLBlueGlow.copy(alpha = 0.9f)) {
                            Text("PREMIUM", color = Color.Black, fontSize = 8.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp))
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text(item.title, color = DarkTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 17.sp)
                if (item.type.isNotBlank()) Text(item.type, color = HLTextMuted, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

// FIX: images.poster (String) replaces images?.poster; storage.duration (Int) replaces metadata?.duration
@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ApiContentPager(items: List<ContentItem>, onClick: (ContentItem) -> Unit) {
    val pagerState = rememberPagerState { items.size }
    val scope = rememberCoroutineScope()
    LaunchedEffect(items) {
        while (true) { delay(5000); scope.launch { pagerState.animateScrollToPage((pagerState.currentPage + 1) % items.size) } }
    }
    Column {
        HorizontalPager(state = pagerState, contentPadding = PaddingValues(horizontal = 16.dp), pageSpacing = 10.dp, modifier = Modifier.fillMaxWidth()) { page ->
            val item = items[page]
            Box(modifier = Modifier.fillMaxWidth().height(200.dp).clip(RoundedCornerShape(10.dp)).border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(10.dp)).clickable { onClick(item) }) {
                val poster = item.images.poster.ifBlank { item.images.backdrop }.takeIf { it.isNotBlank() }
                if (poster != null) {
                    AsyncImage(model = poster, contentDescription = item.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                } else {
                    Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF060C1E), Color(0xFF08080E)))))
                }
                Box(modifier = Modifier.size(60.dp).background(Color.Black.copy(alpha = 0.55f), CircleShape).align(Alignment.Center), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.PlayArrow, null, tint = DarkTextPrimary, modifier = Modifier.size(32.dp))
                }
                Column(modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.9f)))).padding(horizontal = 16.dp, vertical = 14.dp)) {
                    if (item.type.isNotBlank()) {
                        Surface(shape = RoundedCornerShape(3.dp), color = HLBlueGlow.copy(alpha = 0.2f)) {
                            Text(item.type.uppercase(), color = HLBlueGlow, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                        }
                        Spacer(Modifier.height(6.dp))
                    }
                    Text(item.title, color = DarkTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black, lineHeight = 24.sp)
                    // FIX: storage.duration is Int seconds. toDisplayDuration() returns String? to avoid
                    // Composable-context ambiguity in the Text() overload resolution error.
                    val durText: String? = item.storage.duration.toDisplayDuration()
                    if (durText != null) { Text(text = durText, color = HLTextMuted, fontSize = 12.sp) }
                }
            }
        }
        Row(modifier = Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 2.dp), horizontalArrangement = Arrangement.Center) {
            repeat(items.size) { i ->
                Box(modifier = Modifier.padding(horizontal = 3.dp).height(3.dp).width(if (i == pagerState.currentPage) 18.dp else 5.dp).clip(CircleShape).background(if (i == pagerState.currentPage) HLBlueGlow else Color.White.copy(alpha = 0.25f)))
            }
        }
    }
}

@Composable
private fun ShortsRow(items: List<ContentItem>, onClick: (ContentItem) -> Unit) {
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        items(items) { item ->
            Box(modifier = Modifier.width(110.dp).height(196.dp).clip(RoundedCornerShape(8.dp)).border(1.dp, Color.White.copy(alpha = 0.06f), RoundedCornerShape(8.dp)).clickable { onClick(item) }) {
                val thumb = item.thumbnailUrl.takeIf { it.isNotBlank() }
                if (thumb != null) { AsyncImage(thumb, item.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
                else { Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF060E10), Color(0xFF08080E))))) }
                Box(modifier = Modifier.size(36.dp).background(Color.Black.copy(alpha = 0.6f), CircleShape).align(Alignment.Center), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.PlayArrow, null, tint = DarkTextPrimary, modifier = Modifier.size(20.dp))
                }
                Column(modifier = Modifier.align(Alignment.BottomStart).fillMaxWidth().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)))).padding(horizontal = 8.dp, vertical = 8.dp)) {
                    Text(item.title, color = DarkTextPrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 14.sp)
                    val durText: String? = item.storage.duration.toDisplayDuration()
                    if (durText != null) { Text(text = durText, color = HLTextMuted, fontSize = 9.sp) }
                }
            }
        }
    }
}

// FIX: Product.name / .displayPrice / .category — all from the API Product model in Product.kt
@Composable
private fun ShopRow(items: List<Product>, onShopClick: () -> Unit) {
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        items(items.take(8)) { product ->
            Column(modifier = Modifier.width(140.dp).clickable { onShopClick() }) {
                Box(modifier = Modifier.fillMaxWidth().height(140.dp).clip(RoundedCornerShape(8.dp)).border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(8.dp)), contentAlignment = Alignment.Center) {
                    val img = product.thumbnailUrl
                    if (img != null) { AsyncImage(img, product.name, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(8.dp))) }
                    else { Box(Modifier.fillMaxSize().background(Color(0xFF0A0A0A))); Icon(Icons.Default.ShoppingCart, null, tint = HLTextMuted.copy(alpha = 0.3f), modifier = Modifier.size(44.dp)) }
                    if (product.onSale) {
                        Surface(modifier = Modifier.align(Alignment.TopEnd).padding(5.dp), shape = RoundedCornerShape(3.dp), color = Color(0xFFDC2626)) {
                            Text("SALE", color = Color.White, fontSize = 7.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp))
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                Text(product.name, color = DarkTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                val priceInt = (product.variants.firstOrNull()?.price ?: product.displayPrice).toInt()
                Text("Ksh $priceInt", color = HLBlueGlow, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                if (!product.category.isNullOrBlank()) { Text(product.category, color = HLTextMuted, fontSize = 11.sp, maxLines = 1) }
            }
        }
    }
    Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp).clip(RoundedCornerShape(6.dp)).border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(6.dp)).clickable { onShopClick() }.padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
        Text("View All Products →", color = HLTextMuted, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.3.sp)
    }
}

// NEW composable — TravelPackage.heroImage / .displayPrice / .displayDuration (computed properties)
@Composable
private fun TravelRow(items: List<TravelPackage>, onTravelClick: () -> Unit) {
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.padding(bottom = 8.dp)) {
        items(items.take(6)) { pkg ->
            Box(modifier = Modifier.width(240.dp).height(160.dp).clip(RoundedCornerShape(8.dp)).border(1.dp, Color.White.copy(alpha = 0.07f), RoundedCornerShape(8.dp)).clickable { onTravelClick() }) {
                val hero = pkg.heroImage.takeIf { it.isNotBlank() }
                if (hero != null) { AsyncImage(hero, pkg.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize()) }
                else { Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF060C1E), Color(0xFF08080E))))) }
                Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color.Black.copy(alpha = 0.85f)))))
                Column(modifier = Modifier.align(Alignment.BottomStart).padding(12.dp)) {
                    if (pkg.destination.isNotBlank()) { Text(pkg.destination.uppercase(), color = HLBlueGlow, fontSize = 9.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 1.sp); Spacer(Modifier.height(2.dp)) }
                    Text(pkg.title, color = DarkTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis, lineHeight = 17.sp)
                    if (pkg.displayPrice.isNotBlank()) {
                        Spacer(Modifier.height(3.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(5.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(pkg.displayPrice, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                            if (pkg.displayDuration.isNotBlank()) { Text("·", color = HLTextMuted, fontSize = 10.sp); Text(pkg.displayDuration, color = HLTextMuted, fontSize = 10.sp) }
                        }
                    }
                }
            }
        }
    }
    Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp).clip(RoundedCornerShape(6.dp)).border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(6.dp)).clickable { onTravelClick() }.padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
        Text("Explore All Packages →", color = HLTextMuted, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 0.3.sp)
    }
}

// Returns String? so callers use `if (durText != null)` — avoids Text() overload ambiguity error
private fun Int.toDisplayDuration(): String? {
    if (this <= 0) return null
    val h = this / 3600; val m = (this % 3600) / 60; val s = this % 60
    return when { h > 0 && m > 0 -> "${h}h ${m}m"; h > 0 -> "${h}h"; m > 0 -> "${m}m"; else -> "${s}s" }
}
