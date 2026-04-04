package com.houselevi.plus.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.houselevi.plus.navigation.HLTab
import com.houselevi.plus.ui.theme.*

@Composable
fun HLBottomNav(
    currentTab:    HLTab,
    onTabSelected: (HLTab) -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(HLBlack)
            .navigationBarsPadding()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
        HLTab.entries.forEach { tab ->
            val selected = currentTab == tab
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onTabSelected(tab) }
                    .padding(vertical = 6.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(3.dp),
            ) {
                Icon(
                    imageVector        = tab.icon,
                    contentDescription = tab.label,
                    tint               = if (selected) HLBlueGlow else HLTextMuted,
                    modifier           = Modifier.size(26.dp),  // back to 26dp — 5 tabs have room
                )
                Text(
                    text       = tab.label,
                    color      = if (selected) HLBlueGlow else HLTextMuted,
                    fontSize   = 10.sp,
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                )
                if (selected) {
                    Box(Modifier.size(4.dp).background(HLBlueGlow, CircleShape))
                } else {
                    Spacer(Modifier.height(4.dp))
                }
            }
        }
    }
}