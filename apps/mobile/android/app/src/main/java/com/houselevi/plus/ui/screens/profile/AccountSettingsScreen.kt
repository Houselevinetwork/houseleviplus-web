package com.houselevi.plus.ui.screens.profile

import androidx.compose.material3.MaterialTheme
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.ProfileViewModel

@Composable
fun AccountSettingsScreen(
    onBack: () -> Unit = {},
    // Shared VM from HLNavGraph â€” reads real profile data
    vm: ProfileViewModel = viewModel(),
) {
    val state   by vm.state.collectAsState()
    val context = LocalContext.current

    // Use API state first, fall back to TokenManager cache instantly
    val displayName = state.profile?.fullName?.takeIf { it.isNotBlank() }
        ?: TokenManager.userName
        ?: ""
    val email = state.profile?.email?.takeIf { it.isNotBlank() }
        ?: TokenManager.userEmail
        ?: ""
    val initials = when {
        state.profile?.initials?.isNotBlank() == true -> state.profile!!.initials
        displayName.isNotBlank() -> displayName.split(" ").take(2).joinToString("") { it.first().uppercase() }
        email.isNotBlank()       -> email.take(2).uppercase()
        else                     -> "HL"
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 20.dp),
        ) {

            // TOP BAR
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                ) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.align(Alignment.CenterStart).size(36.dp),
                    ) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = HLTextPrimary)
                    }
                    Text(
                        "Account Settings",
                        color = HLTextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }
                Divider(color = HLSurface, thickness = 1.dp)
            }

            // PROFILE SECTION
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 24.dp),
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(88.dp)
                            .background(Color(0xFF2A2A2A), CircleShape)
                            .align(Alignment.CenterHorizontally),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = initials,
                            color = Color(0xFF888888),
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                    Spacer(Modifier.height(20.dp))
                    // "Profile Name" muted label (matches screenshot)
                    Text(text = "Profile Name", color = HLTextMuted, fontSize = 12.sp)
                    Text(
                        text = displayName,
                        color = HLTextPrimary,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                    )
                    // Show email below name
                    if (email.isNotBlank()) {
                        Spacer(Modifier.height(4.dp))
                        Text(text = email, color = HLTextMuted, fontSize = 13.sp)
                    }
                }
            }

            // CHANGE PASSWORD
            item {
                AccountRow(leadingText = "***", title = "Change Password", hasArrow = true, onClick = {
                    try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/settings/password"))) } catch (e: Exception) {}
                })
            }

            // CHANGE EMAIL
            item {
                AccountRow(icon = "âœ‰", title = "Change Email", isExternal = true, onClick = {
                    try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/settings/email"))) } catch (e: Exception) {}
                })
            }

            // EDIT PROFILE
            item {
                AccountRow(icon = "â—‹", title = "Edit Profile", isExternal = true, onClick = {
                    try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/settings/profile"))) } catch (e: Exception) {}
                })
            }

            // DELETE ACCOUNT â€” plain text at bottom (matches screenshot)
            item {
                Spacer(Modifier.height(40.dp))
                Divider(color = HLSurface, thickness = 1.dp)
                TextButton(
                    onClick = {
                        try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/settings/delete"))) } catch (e: Exception) {}
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                ) {
                    Text(
                        text = "DELETE ACCOUNT",
                        color = HLTextPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun AccountRow(
    leadingText: String? = null,
    icon: String? = null,
    title: String,
    hasArrow: Boolean = false,
    isExternal: Boolean = false,
    onClick: () -> Unit = {},
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 18.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                text = leadingText ?: icon ?: "",
                color = HLTextPrimary,
                fontSize = if (leadingText == "***") 12.sp else 18.sp,
                fontWeight = FontWeight.Bold,
            )
            Text(text = title, color = HLTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Normal)
        }
        when {
            hasArrow   -> Text("â€º", color = HLTextMuted, fontSize = 22.sp)
            isExternal -> Text("â†—", color = HLTextMuted, fontSize = 16.sp)
        }
    }
    Divider(color = HLSurface, thickness = 0.5.dp, modifier = Modifier.padding(horizontal = 20.dp))
}
