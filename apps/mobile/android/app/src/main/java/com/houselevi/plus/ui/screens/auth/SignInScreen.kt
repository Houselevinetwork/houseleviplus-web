package com.houselevi.plus.ui.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.houselevi.plus.ui.theme.*
import com.houselevi.plus.viewmodel.AuthStep
import com.houselevi.plus.viewmodel.SignInViewModel

@Composable
fun SignInScreen(
    onAuthenticated: () -> Unit,
    onBack: () -> Unit = {},
    onTermsClick: () -> Unit = {},
    onPrivacyClick: () -> Unit = {},
    vm: SignInViewModel = viewModel(),
) {
    val state by vm.state.collectAsState()

    LaunchedEffect(state.isAuthenticated) {
        if (state.isAuthenticated) onAuthenticated()
    }

    AnimatedContent(
        targetState    = state.step,
        transitionSpec = {
            slideInHorizontally { it } + fadeIn() togetherWith
                    slideOutHorizontally { -it } + fadeOut()
        },
        label = "auth_step",
    ) { step ->
        when (step) {
            AuthStep.EMAIL -> EmailScreen(
                email    = state.email,
                loading  = state.isLoading,
                error    = state.error,
                onChange = { vm.updateEmail(it) },
                onSubmit = { vm.submitEmail(state.email) },
                onBack   = onBack,
                onTermsClick = onTermsClick,
                onPrivacyClick = onPrivacyClick,
            )
            AuthStep.OTP -> OtpScreen(
                email           = state.email,
                otp             = state.otp,
                loading         = state.isLoading,
                error           = state.error,
                resendCountdown = state.resendCountdown,
                onChange        = { vm.updateOtp(it) },
                onSubmit        = { vm.submitOtp(state.otp) },
                onResend        = { vm.resendOtp() },
                onBack          = { vm.backToEmail() },
            )
            AuthStep.SIGNUP -> SignupScreen(
                email    = state.email,
                loading  = state.isLoading,
                error    = state.error,
                onSignup = { vm.requestSignup() },
                onBack   = { vm.backToEmail() },
                onTermsClick = onTermsClick,
                onPrivacyClick = onPrivacyClick,
            )
            AuthStep.SIGNUP_EMAIL_SENT -> EmailSentScreen(
                email  = state.email,
                onBack = { vm.backToEmail() },
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED FULL-SCREEN SCAFFOLD
//  Matches Daily Wire+ layout: gradient bg, logo top-center, content bottom
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun AuthScaffold(
    onBack:  () -> Unit = {},
    showBack: Boolean   = true,
    content: @Composable ColumnScope.() -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFF050510),
                        Color(0xFF080814),
                        Color(0xFF0A0A18),
                        HLBlack,
                    )
                )
            ),
    ) {
        // Subtle radial glow — centre of screen, brand blue
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(400.dp)
                .align(Alignment.TopCenter)
                .background(
                    Brush.radialGradient(
                        listOf(
                            HLBlueGlow.copy(alpha = 0.07f),
                            Color.Transparent,
                        )
                    )
                )
        )

        // Back arrow — top left
        if (showBack) {
            IconButton(
                onClick  = onBack,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .statusBarsPadding()
                    .padding(8.dp),
            ) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint               = HLTextPrimary,
                )
            }
        }

        // Logo — top center
        Column(
            modifier            = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .padding(top = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = buildAnnotatedString {
                    withStyle(SpanStyle(
                        color         = HLTextPrimary,
                        fontWeight    = FontWeight.ExtraBold,
                        fontSize      = 28.sp,
                        letterSpacing = 2.sp,
                    )) { append("HOUSE LEVI") }
                    withStyle(SpanStyle(
                        color      = HLBlueGlow,
                        fontWeight = FontWeight.Light,
                        fontSize   = 34.sp,
                    )) { append("+") }
                },
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text          = "Stream. Shop. Travel.",
                color         = HLTextMuted,
                fontSize      = 12.sp,
                letterSpacing = 1.sp,
                textAlign     = TextAlign.Center,
            )
        }

        // Content — bottom portion of screen with scrolling and keyboard padding
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp),
            content = content,
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMAIL SCREEN — Daily Wire+ style: field + two buttons
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EmailScreen(
    email: String,
    loading: Boolean,
    error: String?,
    onChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit,
    onTermsClick: () -> Unit = {},
    onPrivacyClick: () -> Unit = {},
) {
    val keyboard = LocalSoftwareKeyboardController.current

    AuthScaffold(onBack = onBack, showBack = true) {
        // Email field — outlined, matches Daily Wire+ style
        OutlinedTextField(
            value         = email,
            onValueChange = onChange,
            placeholder   = { Text("Email address or mobile number", color = HLTextMuted, fontSize = 14.sp) },
            modifier      = Modifier
                .fillMaxWidth()
                .height(56.dp),
            singleLine    = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction    = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(onDone = { keyboard?.hide(); onSubmit() }),
            shape  = RoundedCornerShape(2.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor   = HLBlueGlow,
                unfocusedBorderColor = Color.White.copy(alpha = 0.25f),
                focusedTextColor     = HLTextPrimary,
                unfocusedTextColor   = HLTextPrimary,
                cursorColor          = HLBlueGlow,
            ),
        )

        error?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = HLRed, fontSize = 12.sp, modifier = Modifier.fillMaxWidth())
        }

        Spacer(Modifier.height(12.dp))

        // Primary CTA — JOIN HOUSE LEVI+ style (white bg, black text)
        Button(
            onClick  = onSubmit,
            enabled  = !loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape    = RoundedCornerShape(2.dp),
            colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
        ) {
            if (loading) {
                CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
            } else {
                Text(
                    text          = "CONTINUE",
                    color         = Color.Black,
                    fontSize      = 14.sp,
                    fontWeight    = FontWeight.Black,
                    letterSpacing = 2.sp,
                )
            }
        }

        Spacer(Modifier.height(10.dp))

        // Terms with clickable underlined links — in one sentence only
        ClickableTermsText(onTermsClick = onTermsClick, onPrivacyClick = onPrivacyClick)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  OTP SCREEN — same layout as email screen
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun OtpScreen(
    email: String,
    otp: String,
    loading: Boolean,
    error: String?,
    resendCountdown: Int,
    onChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onResend: () -> Unit,
    onBack: () -> Unit,
) {
    val keyboard       = LocalSoftwareKeyboardController.current
    val focusRequester = remember { FocusRequester() }
    LaunchedEffect(Unit) { focusRequester.requestFocus() }

    AuthScaffold(onBack = onBack, showBack = true) {
        // Instruction text above field
        Text(
            text      = "We sent a 6-digit code to",
            color     = HLTextMuted,
            fontSize  = 13.sp,
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth(),
        )
        Text(
            text      = email,
            color     = HLTextPrimary,
            fontSize  = 13.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(16.dp))

        // OTP field
        OutlinedTextField(
            value         = otp,
            onValueChange = { if (it.length <= 6) onChange(it) },
            placeholder   = { Text("Enter 6-digit code", color = HLTextMuted, fontSize = 14.sp) },
            modifier      = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .focusRequester(focusRequester),
            singleLine    = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Number,
                imeAction    = ImeAction.Done,
            ),
            keyboardActions = KeyboardActions(onDone = { keyboard?.hide(); onSubmit() }),
            shape  = RoundedCornerShape(2.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor   = HLBlueGlow,
                unfocusedBorderColor = Color.White.copy(alpha = 0.25f),
                focusedTextColor     = HLTextPrimary,
                unfocusedTextColor   = HLTextPrimary,
                cursorColor          = HLBlueGlow,
            ),
        )

        error?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = HLRed, fontSize = 12.sp, modifier = Modifier.fillMaxWidth())
        }

        Spacer(Modifier.height(12.dp))

        // Confirm button
        Button(
            onClick  = onSubmit,
            enabled  = !loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape    = RoundedCornerShape(2.dp),
            colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
        ) {
            if (loading) {
                CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
            } else {
                Text(
                    text          = "CONFIRM CODE",
                    color         = Color.Black,
                    fontSize      = 14.sp,
                    fontWeight    = FontWeight.Black,
                    letterSpacing = 2.sp,
                )
            }
        }

        Spacer(Modifier.height(10.dp))

        // Resend + different email — outlined secondary button style
        Row(
            modifier              = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            OutlinedButton(
                onClick  = onResend,
                enabled  = resendCountdown == 0,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape    = RoundedCornerShape(2.dp),
                border   = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                colors   = ButtonDefaults.outlinedButtonColors(contentColor = HLTextPrimary),
            ) {
                Text(
                    text     = if (resendCountdown > 0) "Resend (${resendCountdown}s)" else "Resend Code",
                    fontSize = 12.sp,
                    color    = if (resendCountdown > 0) HLTextMuted else HLTextPrimary,
                )
            }
            OutlinedButton(
                onClick  = onBack,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape    = RoundedCornerShape(2.dp),
                border   = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                colors   = ButtonDefaults.outlinedButtonColors(contentColor = HLTextMuted),
            ) {
                Text("Different Email", fontSize = 12.sp, color = HLTextMuted)
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIGNUP SCREEN
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SignupScreen(
    email: String,
    loading: Boolean,
    error: String?,
    onSignup: () -> Unit,
    onBack: () -> Unit,
    onTermsClick: () -> Unit = {},
    onPrivacyClick: () -> Unit = {},
) {
    AuthScaffold(onBack = onBack, showBack = true) {
        Text(
            text      = "New here?",
            color     = HLTextPrimary,
            fontSize  = 22.sp,
            fontWeight = FontWeight.Black,
            modifier  = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text     = "Create your House Levi+ account.",
            color    = HLTextMuted,
            fontSize = 13.sp,
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            text       = email,
            color      = HLBlueGlow,
            fontSize   = 13.sp,
            fontWeight = FontWeight.Bold,
            modifier   = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(20.dp))

        // Feature list
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0F0F18), RoundedCornerShape(2.dp))
                .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(2.dp))
                .padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            listOf(
                "Theatre, Films, Podcasts & Sports",
                "24/7 HL Mood TV — Always Live",
                "Exclusive Shop Access",
                "Curated Travel Experiences",
            ).forEach { feature ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .align(Alignment.CenterVertically)
                            .background(HLBlueGlow, RoundedCornerShape(50))
                    )
                    Text(feature, color = HLTextPrimary, fontSize = 13.sp)
                }
            }
            Spacer(Modifier.height(4.dp))
            HorizontalDivider(color = Color.White.copy(alpha = 0.06f))
            Spacer(Modifier.height(4.dp))
            Text(
                text      = "From KSh 299/month · Cancel anytime",
                color     = HLBlueGlow,
                fontSize  = 12.sp,
                fontWeight = FontWeight.Medium,
                modifier  = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center,
            )
        }

        error?.let {
            Spacer(Modifier.height(8.dp))
            Text(it, color = HLRed, fontSize = 12.sp)
        }

        Spacer(Modifier.height(16.dp))

        Button(
            onClick  = onSignup,
            enabled  = !loading,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape    = RoundedCornerShape(2.dp),
            colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
        ) {
            if (loading) {
                CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(22.dp), strokeWidth = 2.dp)
            } else {
                Text("CREATE ACCOUNT", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 2.sp)
            }
        }

        Spacer(Modifier.height(10.dp))

        OutlinedButton(
            onClick  = onBack,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape    = RoundedCornerShape(2.dp),
            border   = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
            colors   = ButtonDefaults.outlinedButtonColors(contentColor = HLTextMuted),
        ) {
            Text("Back", color = HLTextMuted, fontSize = 13.sp)
        }

        Spacer(Modifier.height(10.dp))

        // Terms with clickable underlined links — in one sentence only
        ClickableTermsText(onTermsClick = onTermsClick, onPrivacyClick = onPrivacyClick)
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMAIL SENT SCREEN
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EmailSentScreen(email: String, onBack: () -> Unit) {
    AuthScaffold(onBack = onBack, showBack = false) {
        Text(
            text       = "Check your inbox",
            color      = HLTextPrimary,
            fontSize   = 22.sp,
            fontWeight = FontWeight.Black,
            modifier   = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text      = "We've sent a verification link to",
            color     = HLTextMuted,
            fontSize  = 13.sp,
            modifier  = Modifier.fillMaxWidth(),
        )
        Text(
            text       = email,
            color      = HLBlueGlow,
            fontSize   = 13.sp,
            fontWeight = FontWeight.Bold,
            modifier   = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text      = "Click the link in the email to activate your account, then come back and sign in.",
            color     = HLTextMuted,
            fontSize  = 13.sp,
            lineHeight = 20.sp,
            modifier  = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(24.dp))
        Button(
            onClick  = onBack,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape    = RoundedCornerShape(2.dp),
            colors   = ButtonDefaults.buttonColors(containerColor = HLTextPrimary),
        ) {
            Text("BACK TO SIGN IN", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 2.sp)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLICKABLE TERMS TEXT — Reusable component with underlined links
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ClickableTermsText(
    onTermsClick: () -> Unit,
    onPrivacyClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // Main sentence without links
        Text(
            text      = "By continuing you agree to our",
            color     = HLTextMuted,
            fontSize  = 11.sp,
            lineHeight = 16.sp,
            textAlign = TextAlign.Center,
            modifier  = Modifier.fillMaxWidth(),
        )

        // Clickable Terms of Use
        Text(
            text           = "Terms of Use",
            color          = HLTextMuted,
            fontSize       = 11.sp,
            fontWeight     = FontWeight.Medium,
            textDecoration = TextDecoration.Underline,
            textAlign      = TextAlign.Center,
            modifier       = Modifier
                .fillMaxWidth()
                .clickable(onClick = onTermsClick)
                .padding(vertical = 2.dp),
        )

        Text(
            text   = "&",
            color  = HLTextMuted,
            fontSize = 11.sp,
            modifier = Modifier.padding(vertical = 2.dp),
        )

        // Clickable Privacy Policy
        Text(
            text           = "Privacy Policy",
            color          = HLTextMuted,
            fontSize       = 11.sp,
            fontWeight     = FontWeight.Medium,
            textDecoration = TextDecoration.Underline,
            textAlign      = TextAlign.Center,
            modifier       = Modifier
                .fillMaxWidth()
                .clickable(onClick = onPrivacyClick)
                .padding(vertical = 2.dp),
        )
    }
}