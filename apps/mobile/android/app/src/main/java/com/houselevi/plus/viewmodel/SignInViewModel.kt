package com.houselevi.plus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.data.models.EmailDiscoveryBody
import com.houselevi.plus.data.models.OtpRequestBody
import com.houselevi.plus.data.models.OtpVerifyBody
import com.houselevi.plus.data.models.SignupRequestBody
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

enum class AuthStep { EMAIL, OTP, SIGNUP, SIGNUP_EMAIL_SENT }

data class SignInUiState(
    val step: AuthStep           = AuthStep.EMAIL,
    val email: String            = "",
    val otp: String              = "",
    val isLoading: Boolean       = false,
    val error: String?           = null,
    val isAuthenticated: Boolean = false,
    val resendCountdown: Int     = 0,
)

class SignInViewModel : ViewModel() {

    private val _state = MutableStateFlow(SignInUiState())
    val state: StateFlow<SignInUiState> = _state

    // ── Step 1: Email submitted ───────────────────────────────────────────────
    // Calls /auth/email-discovery to check DB first
    // Existing user → send OTP → OTP screen
    // New user      → Signup screen (no OTP sent)
    fun submitEmail(email: String) {
        if (email.isBlank()) {
            _state.value = _state.value.copy(error = "Please enter your email")
            return
        }
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, email = email)
            try {
                // Step 1: Check if user exists
                val discoveryRes = HLApiClient.authApi.emailDiscovery(EmailDiscoveryBody(email))
                val discovery    = discoveryRes.body()

                if (!discoveryRes.isSuccessful || discovery == null) {
                    _state.value = _state.value.copy(
                        isLoading = false,
                        error     = "Could not verify email. Try again.",
                    )
                    return@launch
                }

                if (discovery.exists) {
                    // Existing user — send OTP
                    val otpRes = HLApiClient.authApi.requestOtp(
                        OtpRequestBody(email = email, purpose = "login")
                    )
                    if (otpRes.isSuccessful) {
                        _state.value = _state.value.copy(
                            isLoading       = false,
                            step            = AuthStep.OTP,
                            resendCountdown = 60,
                        )
                        startCountdown()
                    } else {
                        _state.value = _state.value.copy(
                            isLoading = false,
                            error     = "Failed to send code. Try again.",
                        )
                    }
                } else {
                    // New user — go directly to signup, no OTP needed
                    _state.value = _state.value.copy(
                        isLoading = false,
                        step      = AuthStep.SIGNUP,
                    )
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Connection failed. Is the server running?",
                )
            }
        }
    }

    // ── Step 2a: OTP submitted (existing user) ────────────────────────────────
    fun submitOtp(otp: String) {
        if (otp.isBlank()) {
            _state.value = _state.value.copy(error = "Please enter the code")
            return
        }
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null, otp = otp)
            try {
                val res  = HLApiClient.authApi.verifyOtp(
                    OtpVerifyBody(email = _state.value.email, otp = otp)
                )
                val body = res.body()

                if (res.isSuccessful && body != null && body.resolvedAccessToken.isNotBlank()) {
                    // Save session — user stays logged in
                    TokenManager.saveSession(
                        accessToken  = body.resolvedAccessToken,
                        refreshToken = body.refreshToken,
                        email        = _state.value.email,
                        name         = body.user?.displayName ?: "",
                        userId       = body.user?.id ?: "",
                        isPremium    = body.user?.isPremium ?: false,
                    )
                    _state.value = _state.value.copy(
                        isLoading       = false,
                        isAuthenticated = true,
                    )
                } else {
                    val errMsg = body?.message?.takeIf { it.isNotBlank() }
                        ?: "Invalid code. Please try again."
                    _state.value = _state.value.copy(isLoading = false, error = errMsg)
                }
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Connection failed. Try again.",
                )
            }
        }
    }

    // ── Step 2b: New user — send verification email ───────────────────────────
    fun requestSignup() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                HLApiClient.authApi.requestSignup(SignupRequestBody(email = _state.value.email))
            } catch (_: Exception) { }
            // Always show email sent — don't reveal internal errors
            _state.value = _state.value.copy(
                isLoading = false,
                step      = AuthStep.SIGNUP_EMAIL_SENT,
            )
        }
    }

    // ── Resend OTP ────────────────────────────────────────────────────────────
    fun resendOtp() {
        if (_state.value.resendCountdown > 0) return
        viewModelScope.launch {
            try {
                val res = HLApiClient.authApi.requestOtp(
                    OtpRequestBody(email = _state.value.email, purpose = "login")
                )
                if (res.isSuccessful) {
                    _state.value = _state.value.copy(resendCountdown = 60, error = null)
                    startCountdown()
                }
            } catch (_: Exception) { }
        }
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    fun backToEmail() {
        _state.value = _state.value.copy(step = AuthStep.EMAIL, otp = "", error = null)
    }

    fun updateEmail(email: String) {
        _state.value = _state.value.copy(email = email, error = null)
    }

    fun updateOtp(otp: String) {
        _state.value = _state.value.copy(otp = otp, error = null)
    }

    // ── Countdown timer for resend button ─────────────────────────────────────
    private fun startCountdown() {
        viewModelScope.launch {
            while (_state.value.resendCountdown > 0) {
                kotlinx.coroutines.delay(1000)
                _state.value = _state.value.copy(
                    resendCountdown = _state.value.resendCountdown - 1
                )
            }
        }
    }
}
