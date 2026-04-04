package com.houselevi.plus.ui.screens.profile

import androidx.compose.material3.MaterialTheme
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.ProfileViewModel

@Composable
fun SettingsScreen(
    accessToken: String = "",
    onBack: () -> Unit = {},
    onAccountSettingsClick: () -> Unit = {},
    // Shared VM from HLNavGraph â€” logout state observed there
    vm: ProfileViewModel = viewModel(),
) {
    val context = LocalContext.current

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
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = HLTextPrimary)
                    }
                    Text(
                        text = "Settings",
                        color = HLTextPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }
                Divider(color = HLSurface, thickness = 1.dp)
            }

            item { SettingsRow(Icons.Default.Star,          "Manage Subscription", hasArrow = true,   onClick = { try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/subscription"))) } catch (e: Exception) {} }) }
            item { SettingsRow(Icons.Default.Person,        "Account Settings",    hasArrow = true,   onClick = onAccountSettingsClick) }
            item { SettingsRow(Icons.Default.ShoppingCart,  "Device Storage",      isExternal = true, onClick = { try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/storage"))) } catch (e: Exception) {} }) }
            item { SettingsRow(Icons.Default.Settings,      "App Preferences",     hasArrow = true,   onClick = { try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/preferences"))) } catch (e: Exception) {} }) }
            item { SettingsRow(Icons.Default.Info,          "Legal",               hasArrow = true,   onClick = { try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/legal"))) } catch (e: Exception) {} }) }
            item { SettingsRow(Icons.Default.AccountCircle, "Help",                isExternal = true, onClick = { try { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://houselevi.plus/help"))) } catch (e: Exception) {} }) }

            // LOGOUT â€” calls vm.logout() on the SHARED VM instance.
            // HLNavGraph observes profileState.loggedOut and navigates away.
            item {
                Spacer(Modifier.height(40.dp))
                Divider(color = HLSurface, thickness = 1.dp)
                TextButton(
                    onClick = {
                        try {
                            vm.logout(accessToken)
                        } catch (e: Exception) {
                            // If API call throws synchronously, still mark logout
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(56.dp),
                ) {
                    Text(
                        text = "LOGOUT",
                        color = HLTextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp,
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsRow(
    icon: ImageVector,
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
            horizontalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Icon(imageVector = icon, contentDescription = title, tint = HLTextPrimary, modifier = Modifier.size(22.dp))
            Text(text = title, color = HLTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Normal)
        }
        when {
            hasArrow   -> Text("â€º", color = HLTextMuted, fontSize = 22.sp)
            isExternal -> Text("â†—", color = HLTextMuted, fontSize = 16.sp)
        }
    }
    Divider(color = HLSurface, thickness = 0.5.dp, modifier = Modifier.padding(horizontal = 20.dp))
}
