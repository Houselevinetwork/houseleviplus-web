package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    @SerializedName("success")      val success: Boolean     = false,
    @SerializedName("message")      val message: String      = "",
    @SerializedName("user")         val user: User?          = null,
    @SerializedName("token")        val token: String        = "",
    @SerializedName("accessToken")  val accessToken: String  = "",
    @SerializedName("refreshToken") val refreshToken: String = "",
    @SerializedName("expiresIn")    val expiresIn: Long      = 0L,
)
data class AuthToken(val accessToken: String, val refreshToken: String, val expiresIn: Long)
data class LoginRequest(@SerializedName("email") val email: String, @SerializedName("password") val password: String)
data class RefreshRequest(@SerializedName("refreshToken") val refreshToken: String)
data class OtpRequest(@SerializedName("email") val email: String, @SerializedName("purpose") val purpose: String = "login")
data class OtpVerifyRequest(@SerializedName("email") val email: String, @SerializedName("otp") val otp: String)
data class GenericResponse(@SerializedName("success") val success: Boolean = false, @SerializedName("message") val message: String = "")
