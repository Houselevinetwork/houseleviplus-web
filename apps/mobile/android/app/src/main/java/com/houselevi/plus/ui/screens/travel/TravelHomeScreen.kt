package com.houselevi.plus.ui.screens.travel

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.*
import com.houselevi.plus.data.models.TravelTestimonial
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import com.houselevi.plus.ui.theme.*

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DATA MODELS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

data class TravelPackage(
    val id: String, val slug: String, val title: String,
    val destination: String, val region: String, val country: String,
    val flag: String, val duration: String, val priceFrom: Int,
    val spotsTotal: Int, val spotsRemaining: Int, val highlights: List<String>,
    val departure: String, val tag: String,
    val isFeatured: Boolean = false, val isSoldOut: Boolean = false,
)

// TravelTestimonial â†’ use com.houselevi.plus.data.models.TravelTestimonial

data class HostQuote(val text: String, val attribution: String)

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  HAND-CODED DATA (mirrors web placeholders.ts)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

val TRAVEL_PACKAGES = listOf(
    // KENYA
    TravelPackage("ke-1","masai-mara-safari","Masai Mara Safari â€” The Classic","Masai Mara, Kenya","Africa","Kenya","ðŸ‡°ðŸ‡ª","7 days / 6 nights",3200,12,4,listOf("Big Five game drives","Mara River crossing","Bush dinner under the stars","Maasai village visit"),"July 2026","SAFARI",true),
    TravelPackage("ke-2","nairobi-mara-combo","Nairobi + Mara â€” The Full Experience","Nairobi & Masai Mara","Africa","Kenya","ðŸ‡°ðŸ‡ª","5 days / 4 nights",2100,10,7,listOf("Nairobi city deep-dive","Giraffe Centre & Karen Blixen","Private Mara game drive","Sundowner on the savanna"),"May 2026","COMBO"),
    TravelPackage("ke-3","kenyan-coast-diani","Kenyan Coast â€” Diani Beach Escape","Diani Beach, Kenya","Africa","Kenya","ðŸ‡°ðŸ‡ª","6 days / 5 nights",1850,8,6,listOf("Private beachfront villa","Dhow snorkelling cruise","Shimba Hills excursion","Swahili cooking class"),"August 2026","BEACH"),
    // UGANDA
    TravelPackage("ug-1","bwindi-gorilla-trek","Bwindi Gorilla Trek â€” Face to Face","Bwindi Impenetrable Forest","Africa","Uganda","ðŸ‡ºðŸ‡¬","6 days / 5 nights",4500,8,3,listOf("Gorilla trekking permit included","Private forest lodge","Queen Elizabeth NP extension","Cultural village experience"),"June 2026","GORILLA",true),
    // TANZANIA
    TravelPackage("tz-1","serengeti-ngorongoro","Serengeti & Ngorongoro â€” Great Migration","Serengeti & Ngorongoro","Africa","Tanzania","ðŸ‡¹ðŸ‡¿","8 days / 7 nights",4800,10,5,listOf("Great Migration wildebeest crossing","Ngorongoro Crater rim lodge","Hot air balloon safari","Maasai cultural visit"),"September 2026","SAFARI",true),
    TravelPackage("tz-2","zanzibar-spice-beach","Zanzibar â€” Spice Island Retreat","Zanzibar, Tanzania","Africa","Tanzania","ðŸ‡¹ðŸ‡¿","5 days / 4 nights",1600,12,9,listOf("Stone Town historic walk","Spice farm tour","Nungwi sunset cruise","Private reef snorkelling"),"October 2026","BEACH"),
    // RWANDA
    TravelPackage("rw-1","rwanda-gorillas-kigali","Rwanda â€” Gorillas & Kigali Rising","Volcanoes NP & Kigali","Africa","Rwanda","ðŸ‡·ðŸ‡¼","6 days / 5 nights",5200,8,4,listOf("Mountain gorilla permits","Kigali city & genocide memorial","Akagera savanna drive","Canopy walk in Nyungwe Forest"),"April 2026","GORILLA"),
    // MALAWI
    TravelPackage("mw-1","lake-malawi-retreat","Lake Malawi â€” The Warm Heart Retreat","Lake Malawi","Africa","Malawi","ðŸ‡²ðŸ‡¼","7 days / 6 nights",2400,10,8,listOf("Private lake island lodge","Kayaking & snorkelling","Liwonde NP boat safari","Village community project"),"July 2026","LAKE"),
    // NAMIBIA
    TravelPackage("na-1","namibia-sossusvlei","Namibia â€” Dunes, Salt Pans & Safari","Sossusvlei & Etosha","Africa","Namibia","ðŸ‡³ðŸ‡¦","9 days / 8 nights",4100,10,6,listOf("Sossusvlei sunrise dune climb","Deadvlei salt pan photography","Etosha Big Five game drives","Spitzkoppe desert camp"),"June 2026","SAFARI",true),
    // SOUTH AFRICA
    TravelPackage("za-1","cape-town-winelands","Cape Town & Winelands â€” Old Money Africa","Cape Town, South Africa","Africa","South Africa","ðŸ‡¿ðŸ‡¦","7 days / 6 nights",3600,12,7,listOf("Table Mountain helicopter flight","Stellenbosch private wine estate","Cape Point & Cape of Good Hope","V&A Waterfront dinner"),"November 2026","LUXURY"),
    TravelPackage("za-2","cape-to-kruger","Cape to Kruger â€” The Grand South Africa","Cape Town â†’ Kruger","Africa","South Africa","ðŸ‡¿ðŸ‡¦","12 days / 11 nights",7800,8,2,listOf("Cape Town full experience","Garden Route road trip","Private Kruger concession lodge","Big Five in Sabi Sands"),"September 2026","GRAND TOUR"),
    // INDIAN OCEAN
    TravelPackage("sc-1","seychelles-private-island","Seychelles â€” Private Island Escape","MahÃ© & Praslin","Africa","Seychelles","ðŸ‡¸ðŸ‡¨","7 days / 6 nights",6500,6,3,listOf("Overwater bungalow stay","VallÃ©e de Mai UNESCO reserve","Private yacht charter","Giant tortoise encounter"),"December 2026","ISLAND",true),
    TravelPackage("mu-1","mauritius-luxury","Mauritius â€” Luxury Indian Ocean","Mauritius","Africa","Mauritius","ðŸ‡²ðŸ‡º","6 days / 5 nights",3900,10,5,listOf("5-star beachfront resort","Underwater waterfall boat tour","Black River Gorges trek","Rum distillery experience"),"February 2027","ISLAND"),
    // EUROPE (minimal)
    TravelPackage("it-1","amalfi-coast-sicily","Italy â€” Amalfi Coast & Sicily","Amalfi & Palermo","Europe","Italy","ðŸ‡®ðŸ‡¹","10 days / 9 nights",5400,10,6,listOf("Positano cliffside stay","Private boat along Amalfi","Palermo street food tour","Mount Etna crater hike"),"May 2026","CULTURE"),
    TravelPackage("gr-1","greece-islands","Greece â€” Santorini & Mykonos","Santorini & Mykonos","Europe","Greece","ðŸ‡¬ðŸ‡·","8 days / 7 nights",4200,10,4,listOf("Oia caldera sunset view","Private catamaran cruise","Mykonos nightlife experience","Delos archaeological tour"),"June 2026","ISLAND"),
    // ASIA (minimal)
    TravelPackage("jp-1","japan-cultural","Japan â€” Tokyo, Kyoto & Beyond","Tokyo & Kyoto","Asia","Japan","ðŸ‡¯ðŸ‡µ","12 days / 11 nights",6800,10,5,listOf("Ryokan traditional inn stay","Private Mt. Fuji excursion","Kyoto geisha district walk","Tsukiji market private tour"),"March 2026","CULTURE",true),
    TravelPackage("ae-1","dubai-abu-dhabi","UAE â€” Dubai & Abu Dhabi","Dubai & Abu Dhabi","Asia","UAE","ðŸ‡¦ðŸ‡ª","6 days / 5 nights",3500,12,8,listOf("Burj Khalifa private floor access","Desert dune dinner","Louvre Abu Dhabi","Dubai creek heritage dhow cruise"),"January 2026","LUXURY"),
    // AMERICAS (minimal)
    TravelPackage("us-1","new-york-city","New York City â€” The Levi Way","New York City, USA","Americas","USA","ðŸ‡ºðŸ‡¸","5 days / 4 nights",3200,12,7,listOf("Private Manhattan helicopter tour","Broadway show & backstage access","Michelin dinner curation","Harlem jazz & culture immersion"),"April 2026","CITY"),
    TravelPackage("br-1","brazil-rio-amazon","Brazil â€” Rio & the Amazon","Rio de Janeiro & Amazon","Americas","Brazil","ðŸ‡§ðŸ‡·","10 days / 9 nights",4600,10,6,listOf("Christ the Redeemer sunset visit","Amazon River eco-lodge","Carnival cultural experience","Ipanema private beach club"),"August 2026","ADVENTURE"),
)

val HOST_QUOTES = listOf(
    HostQuote("I believe travel isn't a luxury â€” it's the education money can actually buy.", "â€” Levi"),
    HostQuote("Africa didn't just change how I see the world. It changed how I see myself.", "â€” Levi"),
    HostQuote("Every trip I curate is one I would personally take. That's the standard.", "â€” Levi, House Levi+"),
)

val TESTIMONIALS = listOf(
    TravelTestimonial(name = "Wanjiku M. â€” Nairobi, Kenya", rating = 5,
        text = "The Masai Mara trip exceeded every expectation. The lodge, the game drives, the bush dinner â€” all of it felt impossibly curated. I'll be booking Rwanda next.",
        packageTitle = "Masai Mara Safari â€” The Classic", packageSlug = "masai-mara-safari"),
    TravelTestimonial(name = "David O. â€” Lagos, Nigeria", rating = 5,
        text = "I've done safaris before but never like this. Levi's team handled everything â€” every detail felt personal. The Bwindi gorilla experience was life-changing.",
        packageTitle = "Bwindi Gorilla Trek", packageSlug = "bwindi-gorilla-trek"),
    TravelTestimonial(name = "Sarah K. â€” London, UK", rating = 5,
        text = "Namibia was unreal. We watched the sunrise from the top of Big Daddy dune and I genuinely cried. Worth every cent and then some.",
        packageTitle = "Namibia â€” Dunes, Salt Pans & Safari", packageSlug = "namibia-sossusvlei"),
    TravelTestimonial(name = "Amara D. â€” Accra, Ghana", rating = 5,
        text = "Cape Town exceeded my wildest expectations. The helicopter over Table Mountain was a moment I'll never forget. The House Levi+ team is the real deal.",
        packageTitle = "Cape Town & Winelands", packageSlug = "cape-town-winelands"),
)

val REGION_FILTERS = listOf("All", "Africa", "Europe", "Asia", "Americas")

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  MAIN SCREEN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
fun TravelHomeScreen(
    onPackageClick:    (String) -> Unit = {},
    onCustomTripClick: ()       -> Unit = {},
) {
    var activeRegion by remember { mutableStateOf("All") }
    var quoteIdx     by remember { mutableIntStateOf(0) }

    val filtered = if (activeRegion == "All") TRAVEL_PACKAGES
                   else TRAVEL_PACKAGES.filter { it.region == activeRegion }

    LazyColumn(
        modifier       = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(bottom = 40.dp),
    ) {

        // 1 â”€â”€ HERO
        item { TravelHeroSection() }

        // 2 â”€â”€ QUOTE STRIP
        item {
            QuoteStrip(quote = HOST_QUOTES[quoteIdx]) {
                quoteIdx = (quoteIdx + 1) % HOST_QUOTES.size
            }
        }

        // 3 â”€â”€ HEADING + REGION FILTERS
        item {
            Spacer(Modifier.height(32.dp))
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text("Upcoming Travel Opportunities", color = HLTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                Spacer(Modifier.height(2.dp))
                Text("${filtered.size} packages available", color = HLTextMuted, fontSize = 12.sp)
            }
            Spacer(Modifier.height(14.dp))
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(REGION_FILTERS) { region ->
                    val active = activeRegion == region
                    Box(
                        modifier = Modifier
                            .height(32.dp)
                            .background(if (active) HLTextPrimary else Color.Transparent)
                            .border(1.dp, if (active) HLTextPrimary else Color.White.copy(alpha = 0.25f))
                            .clickable { activeRegion = region }
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(region, color = if (active) Color.Black else HLTextMuted, fontSize = 11.sp,
                            fontWeight = if (active) FontWeight.Bold else FontWeight.Normal, letterSpacing = 0.5.sp)
                    }
                }
            }
            Spacer(Modifier.height(20.dp))
        }

        // 4 â”€â”€ FEATURED (horizontal scroll)
        val featured = filtered.filter { it.isFeatured }
        if (featured.isNotEmpty()) {
            item {
                Text("FEATURED TRIPS", color = HLTextMuted, fontSize = 10.sp, letterSpacing = 1.5.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 16.dp))
                Spacer(Modifier.height(10.dp))
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(featured) { pkg -> FeaturedCard(pkg) { onPackageClick(pkg.slug) } }
                }
                Spacer(Modifier.height(24.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
                Spacer(Modifier.height(20.dp))
            }
        }

        // 5 â”€â”€ ALL / FILTERED GRID (2 columns)
        item {
            Text(
                if (activeRegion == "All") "ALL DESTINATIONS" else activeRegion.uppercase(),
                color = HLTextMuted, fontSize = 10.sp, letterSpacing = 1.5.sp, fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
            Spacer(Modifier.height(12.dp))
        }

        items(filtered.chunked(2)) { row ->
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { pkg -> GridCard(pkg = pkg, modifier = Modifier.weight(1f)) { onPackageClick(pkg.slug) } }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
            Spacer(Modifier.height(12.dp))
        }

        // 6 â”€â”€ CUSTOM TRAVEL
        item {
            Spacer(Modifier.height(8.dp))
            CustomTravelSection(onInquire = onCustomTripClick)
        }

        // 7 â”€â”€ NOTE FROM LEVI
        item { NoteFromLeviSection() }

        // 8 â”€â”€ TESTIMONIALS
        item { TestimonialsSection() }

        // 9 â”€â”€ FOOTER / NEWSLETTER
        item { TravelFooterSection() }
    }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SUB-COMPOSABLES  â€” one per web component
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

@Composable
private fun TravelHeroSection() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
            .background(Brush.verticalGradient(listOf(Color(0xFF060612), Color(0xFF0A0A1A), Color(0xFF0A0A0A)))),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(24.dp)) {
            Text("TRAVEL WITH", color = HLTextMuted, fontSize = 11.sp, letterSpacing = 3.sp, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(6.dp))
            Text("WAKHATA LEVI", color = HLTextPrimary, fontSize = 36.sp, fontWeight = FontWeight.Black, letterSpacing = 4.sp)
            Spacer(Modifier.height(8.dp))
            Box(modifier = Modifier.width(40.dp).height(2.dp).background(Brush.horizontalGradient(listOf(HLBlueGlow, Color(0xFFD4AA00)))))
            Spacer(Modifier.height(12.dp))
            Text(
                "Curated journeys across Africa and the world.\nEvery detail planned. Every moment owned.",
                color = HLTextMuted, fontSize = 13.sp, lineHeight = 20.sp, textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(22.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(modifier = Modifier.background(HLTextPrimary).padding(horizontal = 22.dp, vertical = 11.dp)) {
                    Text("Explore Packages", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp)
                }
                Box(modifier = Modifier.border(1.dp, HLBlueGlow).padding(horizontal = 22.dp, vertical = 11.dp)) {
                    Text("Custom Trip", color = HLBlueGlow, fontSize = 12.sp, fontWeight = FontWeight.Medium, letterSpacing = 0.8.sp)
                }
            }
        }
    }
}

@Composable
private fun QuoteStrip(quote: HostQuote, onNext: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxWidth().background(Color(0xFF0D0D1A)).clickable { onNext() }
            .padding(vertical = 22.dp, horizontal = 24.dp),
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Text("\"${quote.text}\"", color = HLTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Light,
                lineHeight = 24.sp, textAlign = TextAlign.Center, fontStyle = FontStyle.Italic)
            Spacer(Modifier.height(8.dp))
            Text(quote.attribution, color = HLBlueGlow, fontSize = 11.sp, letterSpacing = 1.sp)
            Spacer(Modifier.height(4.dp))
            Text("tap for next  â€º", color = HLTextMuted.copy(alpha = 0.4f), fontSize = 9.sp)
        }
    }
}

@Composable
private fun FeaturedCard(pkg: TravelPackage, onClick: () -> Unit) {
    Column(modifier = Modifier.width(280.dp).clickable(onClick = onClick)) {
        Box(
            modifier = Modifier.fillMaxWidth().height(150.dp)
                .background(Brush.linearGradient(listOf(Color(0xFF0D1A2E), Color(0xFF1A0D2E)))),
            contentAlignment = Alignment.Center,
        ) {
            Text(pkg.flag, fontSize = 48.sp)
            Box(modifier = Modifier.align(Alignment.TopStart).padding(8.dp).background(HLBlueGlow).padding(horizontal = 8.dp, vertical = 3.dp)) {
                Text(pkg.tag, color = Color.Black, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            }
            if (pkg.spotsRemaining <= 4) {
                Box(modifier = Modifier.align(Alignment.TopEnd).padding(8.dp).background(Color(0xFFDC2626)).padding(horizontal = 8.dp, vertical = 3.dp)) {
                    Text("${pkg.spotsRemaining} spots left", color = Color.White, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(pkg.title, color = HLTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold, lineHeight = 20.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        Text("${pkg.flag}  ${pkg.destination}", color = HLTextMuted, fontSize = 11.sp)
        Text(pkg.duration, color = HLTextMuted, fontSize = 11.sp)
        Spacer(Modifier.height(4.dp))
        Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
            Text("From \$${"%,d".format(pkg.priceFrom)}", color = HLTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            Text(pkg.departure, color = HLTextMuted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun GridCard(pkg: TravelPackage, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Column(modifier = modifier.clickable(onClick = onClick)) {
        Box(
            modifier = Modifier.fillMaxWidth().aspectRatio(1f).background(Color(0xFF131320)),
            contentAlignment = Alignment.Center,
        ) {
            Text(pkg.flag, fontSize = 34.sp)
            Box(modifier = Modifier.align(Alignment.TopStart).padding(6.dp).background(Color(0xFF1A1A2E)).padding(horizontal = 6.dp, vertical = 2.dp)) {
                Text(pkg.tag, color = HLBlueGlow, fontSize = 8.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.8.sp)
            }
            if (pkg.spotsRemaining <= 4 && !pkg.isSoldOut) {
                Box(modifier = Modifier.align(Alignment.BottomEnd).padding(5.dp).background(Color(0xFFDC2626)).padding(horizontal = 5.dp, vertical = 2.dp)) {
                    Text("${pkg.spotsRemaining} left", color = Color.White, fontSize = 8.sp)
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(pkg.title, color = HLTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.Medium, lineHeight = 17.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
        Text("${pkg.flag}  ${pkg.country}", color = HLTextMuted, fontSize = 10.sp)
        Text("From \$${"%,d".format(pkg.priceFrom)}", color = HLTextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
    }
}

@Composable
private fun CustomTravelSection(onInquire: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().background(Color(0xFF0D0D1A)).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("CUSTOM TRAVEL OPPORTUNITIES", color = HLTextMuted, fontSize = 10.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(10.dp))
        Text("Your Itinerary.\nYour Pace. Your Rules.", color = HLTextPrimary, fontSize = 24.sp, fontWeight = FontWeight.Black,
            lineHeight = 32.sp, textAlign = TextAlign.Center, letterSpacing = 0.3.sp)
        Spacer(Modifier.height(10.dp))
        Text(
            "Not seeing your dream destination? We build fully bespoke journeys â€” private family safaris, honeymoons, corporate retreats, solo adventures.",
            color = HLTextMuted, fontSize = 13.sp, lineHeight = 20.sp, textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(16.dp))
        listOf("ðŸŒ  Africa specialist â€” 50+ destinations","âœˆï¸  Flights, transfers & logistics handled","ðŸ¨  Handpicked lodges & hotels only","ðŸ“ž  Dedicated trip concierge 24/7").forEach { item ->
            Text(item, color = HLTextMuted, fontSize = 12.sp, lineHeight = 18.sp, modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp))
        }
        Spacer(Modifier.height(18.dp))
        Button(onClick = onInquire, modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(2.dp),
            colors = ButtonDefaults.buttonColors(containerColor = HLTextPrimary)) {
            Text("Plan My Custom Trip", color = Color.Black, fontSize = 13.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
        }
    }
}

@Composable
private fun NoteFromLeviSection() {
    Column(modifier = Modifier.fillMaxWidth().padding(24.dp)) {
        Text("A NOTE FROM LEVI", color = HLTextMuted, fontSize = 10.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(12.dp))
        Box(modifier = Modifier.width(3.dp).height(48.dp).background(Brush.verticalGradient(listOf(HLBlueGlow, Color(0xFFD4AA00)))))
        Spacer(Modifier.height(14.dp))
        Text(
            "Every trip I've curated started as something I wanted to do myself. Africa changed me â€” not just once, but every single time I return.\n\nThe Mara at golden hour. Gorillas in the mist at Bwindi. The silence of Sossusvlei just before sunrise. These aren't tourist experiences. They're moments that rearrange something inside you.\n\nThat's what House Levi+ Travel is built on. Not packages â€” experiences. Not logistics â€” memories.",
            color = HLTextPrimary, fontSize = 14.sp, lineHeight = 24.sp, letterSpacing = 0.2.sp,
        )
        Spacer(Modifier.height(14.dp))
        Text("â€” Levi, Host of House Levi+", color = HLBlueGlow, fontSize = 13.sp, fontWeight = FontWeight.Medium, fontStyle = FontStyle.Italic)
    }
    HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
}

@Composable
private fun TestimonialsSection() {
    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 28.dp)) {
        Text("TRAVELLER REVIEWS", color = HLTextMuted, fontSize = 10.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 24.dp))
        Spacer(Modifier.height(6.dp))
        Text("Stories from the Journey", color = HLTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 24.dp))
        Spacer(Modifier.height(16.dp))
        LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            items(TESTIMONIALS) { t -> TestimonialCard(t) }
        }
    }
}

@Composable
private fun TravelFooterSection() {
    var email      by remember { mutableStateOf("") }
    var subscribed by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxWidth().background(Color(0xFF0A0A14)).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("NEVER MISS A DEPARTURE", color = HLTextMuted, fontSize = 10.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(8.dp))
        Text("Get first access to new packages,\nearly bird spots & exclusive deals.", color = HLTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, lineHeight = 22.sp)
        Spacer(Modifier.height(18.dp))
        if (subscribed) {
            Text("âœ“  You're on the list!", color = Color(0xFF00B77F), fontSize = 15.sp, fontWeight = FontWeight.Bold)
        } else {
            Row(modifier = Modifier.fillMaxWidth()) {
                OutlinedTextField(
                    value = email, onValueChange = { email = it },
                    placeholder = { Text("Your email address", color = HLTextMuted, fontSize = 13.sp) },
                    singleLine = true, modifier = Modifier.weight(1f).height(50.dp),
                    textStyle = LocalTextStyle.current.copy(color = HLTextPrimary, fontSize = 13.sp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = HLBlueGlow, unfocusedBorderColor = Color.White.copy(alpha = 0.2f), cursorColor = HLBlueGlow),
                    shape = RoundedCornerShape(topStart = 2.dp, bottomStart = 2.dp),
                )
                Button(onClick = { if (email.contains("@")) subscribed = true }, modifier = Modifier.height(50.dp),
                    shape = RoundedCornerShape(topEnd = 2.dp, bottomEnd = 2.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = HLTextPrimary)) {
                    Text("Join", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
        Spacer(Modifier.height(24.dp))
        HorizontalDivider(color = Color.White.copy(alpha = 0.07f))
        Spacer(Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            listOf("18" to "Countries", "200+" to "Guests", "5â˜…" to "Rating").forEach { (num, label) ->
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(num, color = HLTextPrimary, fontSize = 20.sp, fontWeight = FontWeight.Black)
                    Text(label, color = HLTextMuted, fontSize = 11.sp)
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        Text("Â© 2026 House Levi+  Â·  All rights reserved", color = HLTextMuted.copy(alpha = 0.4f), fontSize = 10.sp, letterSpacing = 0.5.sp)
    }
}
