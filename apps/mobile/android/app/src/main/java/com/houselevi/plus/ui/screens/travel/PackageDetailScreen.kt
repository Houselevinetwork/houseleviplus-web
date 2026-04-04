package com.houselevi.plus.ui.screens.travel

import androidx.compose.material3.MaterialTheme
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.houselevi.plus.data.models.ItineraryDay
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.PackageDetailViewModel

@Composable
fun PackageDetailScreen(
    slug: String,
    onBack: () -> Unit,
    onInquire: (slug: String, title: String) -> Unit,
    vm: PackageDetailViewModel = viewModel(),
) {
    LaunchedEffect(slug) { vm.load(slug) }
    val state by vm.state.collectAsState()

    Box(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        when {
            state.isLoading -> CircularProgressIndicator(color = HLBlueGlow, modifier = Modifier.align(Alignment.Center))
            state.pkg == null -> Column(modifier = Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Package not found", style = HLTypography.bodyMedium.copy(color = HLTextMuted))
                Spacer(Modifier.height(12.dp))
                Button(onClick = onBack) { Text("Go back") }
            }
            else -> {
                val pkg = state.pkg!!
                LazyColumn(modifier = Modifier.fillMaxSize()) {

                    //  Image header 
                    item {
                        Box(modifier = Modifier.fillMaxWidth().height(380.dp)) {
                            AsyncImage(
                                model = ImageRequest.Builder(LocalContext.current).data(pkg.thumbnail).crossfade(true).build(),
                                contentDescription = pkg.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize(),
                            )
                            Box(modifier = Modifier.fillMaxSize().background(
                                Brush.verticalGradient(listOf(Color.Black.copy(0.3f), Color.Transparent, HLBlack))))
                            // Back button
                            IconButton(onClick = onBack, modifier = Modifier.padding(16.dp).background(
                                Color.Black.copy(0.5f), RoundedCornerShape(50))) {
                                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                            }
                        }
                    }

                    //  Title + Meta 
                    item {
                        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                            if (pkg.destination.isNotBlank()) {
                                Text(pkg.destination.uppercase(), style = HLTypography.labelMedium.copy(
                                    color = HLGold, letterSpacing = 2.sp, fontSize = 11.sp))
                                Spacer(Modifier.height(4.dp))
                            }
                            Text(pkg.title, style = HLTypography.headlineLarge)
                            Spacer(Modifier.height(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                                MetaChip("${pkg.displayDuration}")
                                MetaChip(pkg.displayPrice)
                                if (pkg.groupSize > 0) MetaChip("Up to ${pkg.groupSize} pax")
                            }
                            Spacer(Modifier.height(16.dp))
                            Text(pkg.description, style = HLTypography.bodyLarge.copy(
                                color = HLTextSecondary, lineHeight = 26.sp))
                        }
                    }

                    //  Highlights 
                    if (pkg.highlights.isNotEmpty()) {
                        item {
                            Spacer(Modifier.height(28.dp))
                            SectionHeader("Highlights")
                            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                                pkg.highlights.forEach { h ->
                                    Row(modifier = Modifier.padding(vertical = 4.dp)) {
                                        Text("  ", style = HLTypography.bodyMedium.copy(color = HLGold))
                                        Text(h, style = HLTypography.bodyMedium.copy(color = HLTextSecondary))
                                    }
                                }
                            }
                        }
                    }

                    //  Inclusions / Exclusions 
                    if (pkg.inclusions.isNotEmpty() || pkg.exclusions.isNotEmpty()) {
                        item {
                            Spacer(Modifier.height(28.dp))
                            SectionHeader("What's Included")
                            Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                                pkg.inclusions.forEach { Text("  $it", style = HLTypography.bodyMedium.copy(color = HLGreen)) }
                                pkg.exclusions.forEach { Text("  $it", style = HLTypography.bodyMedium.copy(color = HLTextMuted)) }
                            }
                        }
                    }

                    //  Itinerary 
                    if (pkg.itinerary.isNotEmpty()) {
                        item {
                            Spacer(Modifier.height(28.dp))
                            SectionHeader("Itinerary")
                        }
                        items(pkg.itinerary) { day -> ItineraryItem(day) }
                    }

                    //  Photo gallery 
                    if (pkg.images.size > 1) {
                        item {
                            Spacer(Modifier.height(28.dp))
                            SectionHeader("Gallery")
                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                items(pkg.images) { img ->
                                    AsyncImage(
                                        model = ImageRequest.Builder(LocalContext.current).data(img).crossfade(true).build(),
                                        contentDescription = null,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.size(180.dp, 120.dp).background(HLSurface, RoundedCornerShape(6.dp)),
                                    )
                                }
                            }
                        }
                    }

                    //  Testimonials 
                    if (state.testimonials.isNotEmpty()) {
                        item {
                            Spacer(Modifier.height(28.dp))
                            SectionHeader("What Travellers Say")
                            LazyRow(
                                contentPadding = PaddingValues(horizontal = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.testimonials) { t -> TestimonialCard(t) }
                            }
                        }
                    }

                    //  CTA 
                    item {
                        Spacer(Modifier.height(32.dp))
                        Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                            Button(
                                onClick = { onInquire(pkg.slug, pkg.title) },
                                modifier = Modifier.fillMaxWidth().height(54.dp),
                                shape = RoundedCornerShape(4.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = HLBlueGlow),
                            ) {
                                Text("Book This Package", style = HLTypography.labelLarge.copy(fontSize = 16.sp))
                            }
                            Spacer(Modifier.height(10.dp))
                            OutlinedButton(
                                onClick = { onInquire("custom", "Custom Trip") },
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                                shape = RoundedCornerShape(4.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, HLTextMuted),
                            ) {
                                Text("Plan a Custom Trip", style = HLTypography.labelLarge.copy(color = HLTextMuted))
                            }
                        }
                        Spacer(Modifier.height(40.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun MetaChip(text: String) {
    Box(modifier = Modifier.background(HLSurface, RoundedCornerShape(4.dp))
            .padding(horizontal = 10.dp, vertical = 5.dp)) {
        Text(text, style = HLTypography.labelMedium.copy(color = HLTextSecondary))
    }
}

@Composable
private fun SectionHeader(title: String) {
    Text(title, style = HLTypography.titleLarge,
         modifier = Modifier.padding(horizontal = 20.dp, vertical = 0.dp))
    Spacer(Modifier.height(12.dp))
}

@Composable
private fun ItineraryItem(day: ItineraryDay) {
    Row(modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(modifier = Modifier.size(32.dp).background(HLBlueGlow, RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center) {
                Text("${day.day}", style = HLTypography.labelMedium.copy(color = Color.White))
            }
            Box(modifier = Modifier.width(2.dp).height(40.dp).background(HLSurface))
        }
        Spacer(Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f).padding(top = 4.dp)) {
            Text(day.title, style = HLTypography.titleMedium)
            if (day.description.isNotBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(day.description, style = HLTypography.bodyMedium.copy(color = HLTextSecondary))
            }
        }
    }
}

