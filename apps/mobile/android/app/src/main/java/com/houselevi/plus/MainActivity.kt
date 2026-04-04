package com.houselevi.plus

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.navigation.HLNavGraph
import com.houselevi.plus.ui.screens.onboarding.OnboardingScreen
import com.houselevi.plus.ui.screens.onboarding.FaqScreen
import com.houselevi.plus.ui.screens.onboarding.HelpScreen
import com.houselevi.plus.ui.screens.splash.SplashScreen
import com.houselevi.plus.ui.screens.auth.SignInScreen
import com.houselevi.plus.ui.theme.HLTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        WindowCompat.setDecorFitsSystemWindows(window, false)

        @Suppress("DEPRECATION")
        window.statusBarColor     = android.graphics.Color.parseColor("#0A0A0A")
        @Suppress("DEPRECATION")
        window.navigationBarColor = android.graphics.Color.parseColor("#0A0A0A")

        WindowInsetsControllerCompat(window, window.decorView).apply {
            show(WindowInsetsCompat.Type.statusBars())
            isAppearanceLightStatusBars     = false
            isAppearanceLightNavigationBars = false
            systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        }

        setContent {
            HLTheme {
                AppRoot()
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            WindowInsetsControllerCompat(window, window.decorView).apply {
                show(WindowInsetsCompat.Type.statusBars())
                isAppearanceLightStatusBars     = false
                isAppearanceLightNavigationBars = false
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  APP FLOW:  SPLASH → ONBOARDING → SIGN_IN → MAIN
// ─────────────────────────────────────────────────────────────────────────────

private enum class AppScreen { SPLASH, ONBOARDING, SIGN_IN, MAIN, FAQ, HELP }

@Composable
private fun AppRoot() {
    var screen      by remember { mutableStateOf(AppScreen.SPLASH) }
    var accessToken by remember { mutableStateOf("") }

    when (screen) {

        // 1 ── Animated splash → decides next destination
        AppScreen.SPLASH -> SplashScreen(
            onNavigateToHome   = {
                // Token was already saved by SplashScreen/auth interceptor
                accessToken = TokenManager.accessToken ?: ""
                screen = AppScreen.MAIN
            },
            onNavigateToSignIn = { screen = AppScreen.ONBOARDING },
        )

        // 2 ── Netflix-style onboarding carousel
        AppScreen.ONBOARDING -> OnboardingScreen(
            onJoin    = { screen = AppScreen.SIGN_IN },
            onSignIn  = { screen = AppScreen.SIGN_IN },
            onPrivacy = { /* TODO: open privacy URL in browser */ },
            onFaq     = { screen = AppScreen.FAQ },
            onHelp    = { screen = AppScreen.HELP },
        )

        // 3 ── Sign in / OTP / Sign up flow
        AppScreen.SIGN_IN -> SignInScreen(
            onAuthenticated = {
                // SignInScreen saved the token via TokenManager.saveSession()
                // so we just read it here
                accessToken = TokenManager.accessToken ?: ""
                screen = AppScreen.MAIN
            },
            onBack = { screen = AppScreen.ONBOARDING },
        )

        // 4 ── Full app
        AppScreen.MAIN -> HLNavGraph(
            accessToken = accessToken,
            onLoggedOut = {
                // Wipe all saved credentials from EncryptedSharedPreferences
                TokenManager.clearSession()
                accessToken = ""
                screen = AppScreen.SIGN_IN
            },
        )

        // 5 ── FAQ
        AppScreen.FAQ -> FaqScreen(
            onBack = { screen = AppScreen.ONBOARDING }
        )

        // 6 ── Help
        AppScreen.HELP -> HelpScreen(
            onBack = { screen = AppScreen.ONBOARDING }
        )
    }
}