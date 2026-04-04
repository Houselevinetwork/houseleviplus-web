package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.*
import retrofit2.Call
import retrofit2.Response
import retrofit2.http.*

interface AuthApi {

    // Step 1 — check if email exists in DB before doing anything
    @POST("auth/email-discovery")
    suspend fun emailDiscovery(
        @Body body: EmailDiscoveryBody,
    ): Response<EmailDiscoveryResponse>

    // Step 2a (existing user) — send OTP
    @POST("auth/otp-request")
    suspend fun requestOtp(
        @Body body: OtpRequestBody,
    ): Response<OtpRequestResponse>

    // Step 2b (new user) — send verification email
    @POST("auth/request-signup")
    suspend fun requestSignup(
        @Body body: SignupRequestBody,
    ): Response<SignupResponse>

    // Step 3 — verify OTP and get tokens
    @POST("auth/otp-verify")
    suspend fun verifyOtp(
        @Body body: OtpVerifyBody,
    ): Response<OtpVerifyResponse>

    // Silent token refresh (suspend — used from coroutines)
    @POST("auth/refresh")
    suspend fun refreshToken(
        @Body body: RefreshTokenBody,
    ): Response<RefreshTokenResponse>

    // Silent token refresh (synchronous — used ONLY by TokenAuthenticator)
    @POST("auth/refresh")
    fun refreshTokenSync(
        @Body body: RefreshTokenBody,
    ): Call<RefreshTokenResponse>
}
