package com.houselevi.plus.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure token store using EncryptedSharedPreferences (AES-256 under the hood).
 * This is the Android equivalent of what Netflix/Spotify use for persistent login.
 *
 * Access token  — short lived (15 min), sent with every request
 * Refresh token — long lived (30 days), used silently to get new access tokens
 * As long as the user opens the app within 30 days they never have to log in again.
 */
object TokenManager {

    private const val PREFS_FILE   = "hl_secure_prefs"
    private const val KEY_ACCESS   = "access_token"
    private const val KEY_REFRESH  = "refresh_token"
    private const val KEY_EMAIL    = "user_email"
    private const val KEY_NAME     = "user_name"
    private const val KEY_USER_ID  = "user_id"
    private const val KEY_IS_PREMIUM = "is_premium"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        prefs = EncryptedSharedPreferences.create(
            context,
            PREFS_FILE,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    // ── Tokens ──────────────────────────────────────────────────────────────
    var accessToken: String?
        get()      = prefs.getString(KEY_ACCESS, null)
        set(value) = prefs.edit().putString(KEY_ACCESS, value).apply()

    var refreshToken: String?
        get()      = prefs.getString(KEY_REFRESH, null)
        set(value) = prefs.edit().putString(KEY_REFRESH, value).apply()

    // ── User info ────────────────────────────────────────────────────────────
    var userEmail: String?
        get()      = prefs.getString(KEY_EMAIL, null)
        set(value) = prefs.edit().putString(KEY_EMAIL, value).apply()

    var userName: String?
        get()      = prefs.getString(KEY_NAME, null)
        set(value) = prefs.edit().putString(KEY_NAME, value).apply()

    var userId: String?
        get()      = prefs.getString(KEY_USER_ID, null)
        set(value) = prefs.edit().putString(KEY_USER_ID, value).apply()

    var isPremium: Boolean
        get()      = prefs.getBoolean(KEY_IS_PREMIUM, false)
        set(value) = prefs.edit().putBoolean(KEY_IS_PREMIUM, value).apply()

    // ── Helpers ──────────────────────────────────────────────────────────────
    val isLoggedIn: Boolean
        get() = refreshToken != null && accessToken != null

    fun saveSession(
        accessToken: String,
        refreshToken: String,
        email: String    = "",
        name: String     = "",
        userId: String   = "",
        isPremium: Boolean = false,
    ) {
        this.accessToken  = accessToken
        this.refreshToken = refreshToken
        this.userEmail    = email
        this.userName     = name
        this.userId       = userId
        this.isPremium    = isPremium
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
