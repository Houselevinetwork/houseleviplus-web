package com.houselevi.plus.data.api

import com.houselevi.plus.data.local.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Silently attaches the access token to every outgoing request header.
 * This is how Netflix/Spotify keep you "logged in" — every API call
 * carries the token without you doing anything.
 */
class AuthInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = TokenManager.accessToken
        val request = if (token != null) {
            chain.request().newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
