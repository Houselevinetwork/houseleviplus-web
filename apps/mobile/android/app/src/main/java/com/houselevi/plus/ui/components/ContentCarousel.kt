package com.houselevi.plus.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.houselevi.plus.data.models.ContentItem
import com.houselevi.plus.ui.theme.*

@Composable
fun ContentCarousel(
    title: String,
    items: List<ContentItem>,
    onItemClick: (ContentItem) -> Unit,
    onSeeAll: (() -> Unit)? = null,
    wide: Boolean = false,
    modifier: Modifier = Modifier,
) {
    if (items.isEmpty()) return
    Column(modifier = modifier) {
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically) {
            Text(title, style = HLTypography.titleMedium.copy(fontSize = 15.sp))
            if (onSeeAll != null) {
                TextButton(onClick = onSeeAll, contentPadding = PaddingValues(0.dp)) {
                    Text("See all", style = HLTypography.labelMedium.copy(color = HLBlueGlow))
                }
            }
        }
        Spacer(Modifier.height(8.dp))
        LazyRow(contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            items(items, key = { it.id }) { item ->
                if (wide) ContentCardWide(item = item, onClick = onItemClick)
                else      ContentCard(item = item, onClick = onItemClick)
            }
        }
    }
}
