package com.houselevi.plus.data.api

import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.data.models.RefreshTokenBody
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * The secret sauce of "stay logged in forever".
 *
 * OkHttp calls this automatically when any request returns 401 (access token expired).
 * We silently:
 *   1. Call POST /auth/refresh with the stored refresh token (synchronously  OkHttp requirement)
 *   2. Save the new access token to encrypted storage
 *   3. Return the original request with the new token  OkHttp retries it transparently
 *
 * The user sees nothing. They stay logged in for up to 30 days.
 */
class TokenAuthenticator : Authenticator {

    // Separate Retrofit instance  no interceptors to avoid infinite 401 loops
    private val authApi: AuthApi by lazy {
        Retrofit.Builder()
            .baseUrl(HLApiClient.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApi::class.java)
    }

    override fun authenticate(route: Route?, response: Response): Request? {
        // Don't retry if the request had no auth header (not our token call)
        if (response.request.header("Authorization") == null) return null

        // Prevent infinite refresh loops (max 2 attempts)
        if (responseCount(response) >= 2) {
            TokenManager.clearSession()
            return null
        }

        val refreshToken = TokenManager.refreshToken ?: run {
            TokenManager.clearSession()
            return null
        }

        return try {
            // Use .execute()  this is the synchronous Call<T>, NOT the suspend version
            val refreshResponse = authApi
                .refreshTokenSync(RefreshTokenBody(refreshToken))
                .execute()

            val body = refreshResponse.body()
            val newAccessToken  = body?.accessToken?.takeIf { it.isNotBlank() }
                ?: body?.token?.takeIf { it.isNotBlank() }

            if (refreshResponse.isSuccessful && newAccessToken != null) {
                // Persist new tokens
                TokenManager.accessToken = newAccessToken
                val newRefresh = body?.refreshToken?.takeIf { it.isNotBlank() }
                if (newRefresh != null) TokenManager.refreshToken = newRefresh

                // Retry original request with fresh token
                response.request.newBuilder()
                    .header("Authorization", "Bearer $newAccessToken")
                    .build()
            } else {
                // Refresh failed  session expired, user must log in again
                TokenManager.clearSession()
                null
            }
        } catch (e: Exception) {
            // Network error during refresh  don't clear session, might be temporary
            null
        }
    }

    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) { count++; prior = prior.priorResponse }
        return count
    }
}
