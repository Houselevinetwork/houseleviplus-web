package com.houselevi.plus.navigation

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.houselevi.plus.data.models.LinearTvBlock
import com.houselevi.plus.data.models.User
import com.houselevi.plus.ui.components.HLBottomNav
import com.houselevi.plus.ui.screens.home.HomeScreen
import com.houselevi.plus.ui.screens.onboarding.FaqScreen
import com.houselevi.plus.ui.screens.onboarding.HelpScreen
import com.houselevi.plus.ui.screens.player.LiveTvPlayerScreen
import com.houselevi.plus.ui.screens.player.VideoPlayerScreen
import com.houselevi.plus.ui.screens.profile.AccountSettingsScreen
import com.houselevi.plus.ui.screens.profile.ProfileScreen
import com.houselevi.plus.ui.screens.profile.SettingsScreen
import com.houselevi.plus.ui.screens.shop.AllProductsScreen
import com.houselevi.plus.ui.screens.shop.CartScreen
import com.houselevi.plus.ui.screens.shop.CheckoutScreen
import com.houselevi.plus.ui.screens.shop.ProductDetailScreen
import com.houselevi.plus.ui.screens.shop.ShopHomeScreen
import com.houselevi.plus.ui.screens.travel.InquiryFormScreen
import com.houselevi.plus.ui.screens.travel.PackageDetailScreen
import com.houselevi.plus.ui.screens.travel.TravelHomeScreen
import com.houselevi.plus.ui.screens.entertainment.ContentDetailScreen
import com.houselevi.plus.ui.screens.entertainment.EntertainmentScreen
import com.houselevi.plus.ui.screens.entertainment.MoodTvScreen
import com.houselevi.plus.ui.screens.entertainment.MusicScreen
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.ProfileViewModel

// ─────────────────────────────────────────────────────
//  TABS
// ─────────────────────────────────────────────────────

enum class HLTab(val label: String, val icon: ImageVector) {
    HOME   ("Home",   Icons.Default.Home),
    WATCH  ("Watch",  Icons.Default.PlayArrow),
    SHOP   ("Shop",   Icons.Default.ShoppingCart),
    TRAVEL ("Travel", Icons.AutoMirrored.Filled.Send),
    MYHL   ("My HL+", Icons.Default.AccountCircle),
}

// ─────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────

object HLRoute {
    const val MAIN           = "main"
    const val VIDEO_PLAYER   = "player/video/{contentId}"
    const val LIVE_TV        = "player/live"
    const val CONTENT_DETAIL = "watch/detail/{itemId}"
    const val MUSIC          = "watch/music"
    const val MOOD_TV        = "watch/mood-tv"
    const val PKG_DETAIL     = "travel/package/{slug}"
    const val INQUIRY        = "travel/inquiry/{slug}/{title}"
    const val ALL_PRODUCTS   = "shop/all-products"
    const val PRODUCT        = "shop/product/{productId}"
    const val CART           = "shop/cart"
    const val CHECKOUT       = "shop/checkout"
    const val FAQ            = "info/faq"
    const val HELP           = "info/help"

    fun video(id: String)                    = "player/video/$id"
    fun contentDetail(id: String)            = "watch/detail/$id"
    fun packageDetail(slug: String)          = "travel/package/$slug"
    fun inquiry(slug: String, title: String) = "travel/inquiry/$slug/${Uri.encode(title)}"
    fun product(id: String)                  = "shop/product/$id"
}

// ─────────────────────────────────────────────────────
//  NAV GRAPH
// ─────────────────────────────────────────────────────

@Composable
fun HLNavGraph(
    initialUser: User? = null,
    accessToken: String = "",
    onLoggedOut: () -> Unit = {},
) {
    val navController = rememberNavController()
    var currentTab    by remember { mutableStateOf(HLTab.HOME) }
    var liveTvBlock   by remember { mutableStateOf(LinearTvBlock()) }

    val profileVm: ProfileViewModel = viewModel()

    var showSettings        by remember { mutableStateOf(false) }
    var showAccountSettings by remember { mutableStateOf(false) }

    val profileState by profileVm.state.collectAsState()
    LaunchedEffect(profileState.loggedOut) {
        if (profileState.loggedOut) {
            showSettings        = false
            showAccountSettings = false
            currentTab          = HLTab.HOME
            onLoggedOut()
        }
    }

    NavHost(navController = navController, startDestination = HLRoute.MAIN) {

        composable(HLRoute.MAIN) {

            if (showAccountSettings) {
                AccountSettingsScreen(
                    onBack = { showAccountSettings = false },
                    vm     = profileVm,
                )
                return@composable
            }
            if (showSettings) {
                SettingsScreen(
                    accessToken            = accessToken,
                    onBack                 = { showSettings = false },
                    onAccountSettingsClick = { showAccountSettings = true },
                    vm                     = profileVm,
                )
                return@composable
            }

            Scaffold(
                containerColor = MaterialTheme.colorScheme.background,
                topBar = {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(HLBlack),  // ✓ FIXED: Always HLBlack, not theme-aware
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .statusBarsPadding()
                                .padding(horizontal = 20.dp, vertical = 16.dp),
                        ) {
                            Text(
                                text = buildAnnotatedString {
                                    withStyle(SpanStyle(
                                        color         = DarkTextPrimary,  // ✓ FIXED: Always light gray
                                        fontWeight    = FontWeight.ExtraBold,
                                        fontSize      = 30.sp,
                                        letterSpacing = 2.sp,
                                    )) { append("HOUSE LEVI") }
                                    withStyle(SpanStyle(
                                        color      = HLBlueGlow,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize   = 36.sp,
                                    )) { append("+") }
                                },
                                modifier = Modifier.align(Alignment.CenterStart),
                            )
                            Row(
                                modifier = Modifier.align(Alignment.CenterEnd),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                if (currentTab == HLTab.MYHL) {
                                    IconButton(
                                        onClick  = { showSettings = true },
                                        modifier = Modifier.size(44.dp),
                                    ) {
                                        Icon(
                                            Icons.Default.Settings,
                                            contentDescription = "Settings",
                                            tint               = DarkTextPrimary,
                                            modifier           = Modifier.size(24.dp),
                                        )
                                    }
                                }
                            }
                        }
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(Color.White.copy(alpha = 0.06f))
                        )
                    }
                },
                bottomBar = {
                    HLBottomNav(
                        currentTab    = currentTab,
                        onTabSelected = { tab ->
                            if (tab != HLTab.MYHL) {
                                showSettings        = false
                                showAccountSettings = false
                            }
                            currentTab = tab
                        },
                    )
                },
            ) { padding ->
                Box(modifier = Modifier.padding(padding)) {
                    when (currentTab) {

                        // ── HOME — wired with shop + travel tab switches ──
                        HLTab.HOME -> HomeScreen(
                            currentUser     = initialUser,
                            onContentPlay   = { item -> navController.navigate(HLRoute.video(item.id)) },
                            onwatchCategory = { _, _ -> },
                            onLiveTvPlay    = { block ->
                                liveTvBlock = block
                                navController.navigate(HLRoute.LIVE_TV)
                            },
                            onShopClick     = { currentTab = HLTab.SHOP },
                            onTravelClick   = { currentTab = HLTab.TRAVEL },
                        )

                        HLTab.WATCH -> EntertainmentScreen(
                            onContentClick = { item -> navController.navigate(HLRoute.contentDetail(item.id)) },
                            onMusicClick   = { navController.navigate(HLRoute.MUSIC) },
                            onMoodTvClick  = { navController.navigate(HLRoute.MOOD_TV) },
                            onSeeAll       = { },
                        )

                        HLTab.SHOP -> ShopHomeScreen(
                            onProductClick = { id -> navController.navigate(HLRoute.product(id)) },
                            onCartClick    = { navController.navigate(HLRoute.CART) },
                            onViewAllClick = { navController.navigate(HLRoute.ALL_PRODUCTS) },
                        )

                        HLTab.TRAVEL -> TravelHomeScreen(
                            onPackageClick    = { slug -> navController.navigate(HLRoute.packageDetail(slug)) },
                            onCustomTripClick = { navController.navigate(HLRoute.inquiry("custom", "Custom Trip")) },
                        )

                        HLTab.MYHL -> ProfileScreen(
                            accessToken            = accessToken,
                            onLoggedOut            = onLoggedOut,
                            onSettingsClick        = { showSettings = true },
                            onAccountSettingsClick = { showAccountSettings = true },
                            vm                     = profileVm,
                        )
                    }
                }
            }
        }

        // ── Full-screen video / live TV ───────────────────────────────────

        composable(HLRoute.VIDEO_PLAYER) { back ->
            VideoPlayerScreen(
                item        = com.houselevi.plus.data.models.ContentItem(
                    id = back.arguments?.getString("contentId") ?: ""
                ),
                accessToken = "Bearer $accessToken",
                onBack      = { navController.popBackStack() },
            )
        }

        composable(HLRoute.LIVE_TV) {
            LiveTvPlayerScreen(block = liveTvBlock, onBack = { navController.popBackStack() })
        }

        // ── Entertainment ─────────────────────────────────────────────────

        composable(HLRoute.CONTENT_DETAIL) { back ->
            ContentDetailScreen(
                itemId = back.arguments?.getString("itemId") ?: "",
                onBack = { navController.popBackStack() },
                onPlay = { navController.navigate(HLRoute.video(it)) },
            )
        }

        composable(HLRoute.MUSIC) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
            ) {
                MusicScreen(onBack = { navController.popBackStack() })
            }
        }

        composable(HLRoute.MOOD_TV) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background)
            ) {
                MoodTvScreen(onBack = { navController.popBackStack() })
            }
        }

        // ── Travel ────────────────────────────────────────────────────────

        composable(HLRoute.PKG_DETAIL) { back ->
            PackageDetailScreen(
                slug      = back.arguments?.getString("slug") ?: "",
                onBack    = { navController.popBackStack() },
                onInquire = { s, t -> navController.navigate(HLRoute.inquiry(s, t)) },
            )
        }

        composable(HLRoute.INQUIRY) { back ->
            InquiryFormScreen(
                packageSlug  = back.arguments?.getString("slug") ?: "",
                packageTitle = Uri.decode(back.arguments?.getString("title") ?: ""),
                onBack       = { navController.popBackStack() },
            )
        }

        // ── Shop ──────────────────────────────────────────────────────────

        composable(HLRoute.ALL_PRODUCTS) {
            AllProductsScreen(
                onProductClick = { id -> navController.navigate(HLRoute.product(id)) },
                onCartClick    = { navController.navigate(HLRoute.CART) },
                onBack         = { navController.popBackStack() },
            )
        }

        composable(HLRoute.PRODUCT) { back ->
            ProductDetailScreen(
                productId   = back.arguments?.getString("productId") ?: "",
                accessToken = accessToken,
                onBack      = { navController.popBackStack() },
                onGoToCart  = { navController.navigate(HLRoute.CART) },
            )
        }

        composable(HLRoute.CART) {
            CartScreen(
                accessToken = accessToken,
                onBack      = { navController.popBackStack() },
                onCheckout  = { navController.navigate(HLRoute.CHECKOUT) },
            )
        }

        composable(HLRoute.CHECKOUT) {
            CheckoutScreen(
                onBack        = { navController.popBackStack() },
                onOrderPlaced = {
                    navController.navigate(HLRoute.MAIN) {
                        popUpTo(HLRoute.MAIN) { inclusive = true }
                    }
                },
            )
        }

        // ── Info ──────────────────────────────────────────────────────────

        composable(HLRoute.FAQ) {
            FaqScreen(onBack = { navController.popBackStack() })
        }

        composable(HLRoute.HELP) {
            HelpScreen(onBack = { navController.popBackStack() })
        }
    }
}