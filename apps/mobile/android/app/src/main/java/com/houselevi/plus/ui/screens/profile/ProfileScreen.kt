package com.houselevi.plus.ui.screens.profile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.ProfileViewModel

private data class HostItem(val initials: String, val bgColor: Color)
private val sampleHosts = listOf(
    HostItem("LH", Color(0xFF3A2A4A)),
    HostItem("JS", Color(0xFF2A3A4A)),
    HostItem("AM", Color(0xFF4A3A2A)),
    HostItem("RK", Color(0xFF2A4A3A)),
    HostItem("TJ", Color(0xFF4A2A2A)),
)

@Composable
fun ProfileScreen(
    accessToken: String = "",
    onLoggedOut: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onAccountSettingsClick: () -> Unit = {},
    vm: ProfileViewModel = viewModel(),
) {
    val state   by vm.state.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(accessToken) {
        if (accessToken.isNotEmpty()) vm.load(accessToken)
    }

    val isSubscribed = state.profile?.subscriptionActive == true

    // Email: API state first, then TokenManager cache, never blank
    val displayEmail = state.profile?.email?.takeIf { it.isNotBlank() }
        ?: TokenManager.userEmail
        ?: ""

    // Name: API state first, then TokenManager cache
    val displayName = state.profile?.fullName?.takeIf { it.isNotBlank() }
        ?: TokenManager.userName
        ?: ""

    // Initials from name or email prefix
    val initials = when {
        state.profile?.initials?.isNotBlank() == true -> state.profile!!.initials
        displayName.isNotBlank() -> displayName
            .split(" ")
            .take(2)
            .joinToString("") { it.first().uppercase() }
        displayEmail.isNotBlank() -> displayEmail.take(2).uppercase()
        else -> "HL"
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A0A)),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 40.dp),
        ) {

            // ── PROFILE HERO ──────────────────────────────────────────────
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .background(Color(0xFF2A2A2A), CircleShape),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = initials,
                            color = Color(0xFF888888),
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(3.dp),
                    ) {
                        if (displayName.isNotBlank()) {
                            Text(
                                text = displayName,
                                color = HLTextPrimary,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                        if (displayEmail.isNotBlank()) {
                            Text(
                                text = displayEmail,
                                color = HLTextMuted,
                                fontSize = 12.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                        Text(
                            text = if (isSubscribed) "HL+ Premium Member" else "Free Member",
                            color = if (isSubscribed) HLGold else HLBlueGlow,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
                Divider(color = HLSurface, thickness = 1.dp)
            }

            // ── GET HL+ PREMIUM promo (free users only) ───────────────────
            if (!isSubscribed) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(
                            text = "Unlock the Full Creative Experience",
                            color = HLTextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                        )
                        Text(
                            text = "Get unlimited access to exclusive art, stories, and creative content from the House Levi+ community. Subscribe and never miss a moment.",
                            color = HLTextMuted,
                            fontSize = 13.sp,
                            lineHeight = 19.sp,
                        )
                        Button(
                            onClick = {
                                try {
                                    context.startActivity(
                                        Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/chooseplans"))
                                    )
                                } catch (e: Exception) {}
                            },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(4.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
                        ) {
                            Text(
                                text = "GET HL+ PREMIUM",
                                color = Color.Black,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp,
                            )
                        }
                    }
                    Divider(color = HLSurface, thickness = 1.dp)
                }
            }

            // ── DOWNLOADS ────────────────────────────────────────────────
            item {
                Spacer(Modifier.height(8.dp))
                ProfileSectionHeader(
                    title = "Downloads",
                    actionLabel = if (!isSubscribed) "Upgrade" else null,
                    onAction = {
                        try {
                            context.startActivity(
                                Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/chooseplans"))
                            )
                        } catch (e: Exception) {}
                    },
                )
                if (!isSubscribed) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 10.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            text = "Upgrade today and enjoy offline viewing wherever you are",
                            color = HLTextPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            lineHeight = 20.sp,
                        )
                        Text(
                            text = "Upgrade your membership to download and watch your favourite content anytime, anywhere.",
                            color = HLTextMuted,
                            fontSize = 12.sp,
                            lineHeight = 17.sp,
                        )
                        Spacer(Modifier.height(4.dp))
                        OutlinedButton(
                            onClick = {
                                try {
                                    context.startActivity(
                                        Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.com/chooseplans"))
                                    )
                                } catch (e: Exception) {}
                            },
                            modifier = Modifier.fillMaxWidth().height(44.dp),
                            shape = RoundedCornerShape(4.dp),
                            border = BorderStroke(1.dp, HLTextPrimary),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                        ) {
                            Text(
                                text = "UPGRADE TO DOWNLOAD CONTENT",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp,
                            )
                        }
                    }
                } else {
                    Text(
                        text = "No downloaded content yet.",
                        color = HLTextMuted,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                    )
                }
                Spacer(Modifier.height(8.dp))
                Divider(color = HLSurface, thickness = 1.dp)
            }

            // ── JUMP BACK IN ──────────────────────────────────────────────
            item {
                Spacer(Modifier.height(8.dp))
                ProfileSectionHeader(title = "Jump Back In")
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = "You haven't started watching anything yet.",
                        color = HLTextMuted,
                        fontSize = 13.sp,
                    )
                    OutlinedButton(
                        onClick = { /* TODO: switch to Watch tab */ },
                        modifier = Modifier.height(40.dp),
                        shape = RoundedCornerShape(4.dp),
                        border = BorderStroke(1.dp, HLTextPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                    ) {
                        Icon(Icons.Default.PlayArrow, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("WATCH NOW", fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 0.5.sp)
                    }
                }
                Spacer(Modifier.height(8.dp))
                Divider(color = HLSurface, thickness = 1.dp)
            }

            // ── FOLLOWED HOSTS ────────────────────────────────────────────
            item {
                Spacer(Modifier.height(8.dp))
                ProfileSectionHeader(title = "Followed Hosts", actionLabel = "Manage", onAction = {})
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Row(
                        modifier = Modifier.wrapContentWidth(),
                        horizontalArrangement = Arrangement.spacedBy((-14).dp),
                    ) {
                        sampleHosts.forEach { host ->
                            Box(
                                modifier = Modifier
                                    .size(52.dp)
                                    .background(
                                        Brush.radialGradient(listOf(host.bgColor, Color(0xFF1A1A1A))),
                                        CircleShape,
                                    ),
                                contentAlignment = Alignment.Center,
                            ) {
                                Text(host.initials, color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                    Text(
                        "Follow your favourite creators",
                        color = HLTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                    )
                    Text(
                        "Stay up to date with their latest creative content and never miss a new release.",
                        color = HLTextMuted, fontSize = 12.sp, textAlign = TextAlign.Center, lineHeight = 17.sp,
                    )
                    OutlinedButton(
                        onClick = {
                            try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/hosts"))) } catch (e: Exception) {}
                        },
                        modifier = Modifier.fillMaxWidth().height(44.dp),
                        shape = RoundedCornerShape(4.dp),
                        border = BorderStroke(1.dp, HLTextPrimary),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
                    ) {
                        Text("LEARN MORE", fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    }
                }
                Divider(color = HLSurface, thickness = 1.dp)
            }

            // ── MY DEVICES ────────────────────────────────────────────────
            item {
                Spacer(Modifier.height(8.dp))
                Text(
                    "My Devices (${state.devices.size} of ${state.maxDevices})",
                    color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                )
            }

            items(state.devices.size) { index ->
                if (index < state.devices.size) {
                    val device = state.devices[index]
                    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(device.displayName, color = HLTextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                Text("${device.os} • ${device.lastSeenAt.take(10)}", color = HLTextMuted, fontSize = 11.sp)
                            }
                            TextButton(onClick = { vm.removeDevice(accessToken, device.id) }, contentPadding = PaddingValues(4.dp)) {
                                Text("Remove", color = HLTextMuted, fontSize = 11.sp)
                            }
                        }
                        if (index < state.devices.size - 1) {
                            Divider(color = HLSurface, thickness = 0.5.dp, modifier = Modifier.padding(top = 8.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileSectionHeader(
    title: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(title, color = HLTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        if (actionLabel != null && onAction != null) {
            TextButton(onClick = onAction, contentPadding = PaddingValues(4.dp)) {
                Text(actionLabel, color = HLTextMuted, fontSize = 13.sp)
            }
        }
    }
}