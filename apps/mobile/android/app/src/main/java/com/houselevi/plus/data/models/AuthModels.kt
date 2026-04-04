package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

// ─── Email Discovery (POST /auth/email-discovery) ────────────────────────────
data class EmailDiscoveryBody(
    @SerializedName("email") val email: String,
)

data class EmailDiscoveryResponse(
    @SerializedName("exists")              val exists: Boolean             = false,
    @SerializedName("hasPassword")         val hasPassword: Boolean        = false,
    @SerializedName("isVerified")          val isVerified: Boolean         = false,
    @SerializedName("status")              val status: String              = "",
    @SerializedName("requiresOTP")         val requiresOTP: Boolean        = true,
    @SerializedName("canLoginWithPassword") val canLoginWithPassword: Boolean = false,
)

// ─── OTP Request (POST /auth/otp-request) ────────────────────────────────────
data class OtpRequestBody(
    @SerializedName("email")   val email: String,
    @SerializedName("purpose") val purpose: String = "login",
)

data class OtpRequestResponse(
    @SerializedName("success")     val success: Boolean = false,
    @SerializedName("message")     val message: String  = "",
    @SerializedName("expiresIn")   val expiresIn: Int   = 600,
    @SerializedName("canResendIn") val canResendIn: Int = 60,
)

// ─── OTP Verify (POST /auth/otp-verify) ──────────────────────────────────────
data class OtpVerifyBody(
    @SerializedName("email") val email: String,
    @SerializedName("otp")   val otp: String,
)

data class OtpVerifyResponse(
    @SerializedName("success")      val success: Boolean     = false,
    @SerializedName("message")      val message: String      = "",
    @SerializedName("accessToken")  val accessToken: String  = "",
    @SerializedName("refreshToken") val refreshToken: String = "",
    @SerializedName("token")        val token: String        = "",
    @SerializedName("user")         val user: AuthUser?      = null,
) {
    val resolvedAccessToken: String get() = accessToken.ifBlank { token }
}

// ─── Signup Request (POST /auth/request-signup) ───────────────────────────────
data class SignupRequestBody(
    @SerializedName("email") val email: String,
)

data class SignupResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String  = "",
)

// ─── Token Refresh (POST /auth/refresh) ──────────────────────────────────────
data class RefreshTokenBody(
    @SerializedName("refreshToken") val refreshToken: String,
)

data class RefreshTokenResponse(
    @SerializedName("success")      val success: Boolean    = false,
    @SerializedName("accessToken")  val accessToken: String = "",
    @SerializedName("token")        val token: String       = "",
    @SerializedName("refreshToken") val refreshToken: String = "",
) {
    val resolvedAccessToken: String get() = accessToken.ifBlank { token }
}

// ─── Shared user object ───────────────────────────────────────────────────────
data class AuthUser(
    @SerializedName("_id")                val id: String          = "",
    @SerializedName("email")              val email: String       = "",
    @SerializedName("firstName")          val firstName: String   = "",
    @SerializedName("lastName")           val lastName: String    = "",
    @SerializedName("isPremium")          val isPremium: Boolean  = false,
    @SerializedName("subscriptionStatus") val subscriptionStatus: String = "",
) {
    val displayName: String get() = firstName.ifBlank { email.substringBefore("@") }
}
