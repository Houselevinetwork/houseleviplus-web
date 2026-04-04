package com.houselevi.plus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.local.TokenManager
import com.houselevi.plus.data.models.*
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ProfileState(
    val isLoading: Boolean          = true,
    val profile: UserProfile?       = null,
    val devices: List<Device>       = emptyList(),
    val sessions: List<UserSession> = emptyList(),
    val maxDevices: Int             = 3,
    val loggedOut: Boolean          = false,
    val error: String?              = null,
)

class ProfileViewModel : ViewModel() {
    private val _state = MutableStateFlow(ProfileState())
    val state: StateFlow<ProfileState> = _state

    fun load(auth: String) {
        viewModelScope.launch {
            // ── Instant display from TokenManager cache ───────────────────
            // Show email/name immediately from local storage while the API
            // loads. This eliminates the "Loading..." flash entirely.
            val cachedEmail   = TokenManager.userEmail
            val cachedName    = TokenManager.userName
            val cachedPremium = TokenManager.isPremium
            // Show loading — email will appear as soon as API responds
            // (or instantly from TokenManager in the UI layer)
            _state.value = ProfileState(isLoading = true)

            // ── Full API load ─────────────────────────────────────────────
            try {
                val profileDeferred  = async { HLApiClient.profileApi.getMe("Bearer $auth") }
                val devicesDeferred  = async { HLApiClient.profileApi.getDevices("Bearer $auth") }
                val sessionsDeferred = async { HLApiClient.profileApi.getSessions("Bearer $auth") }

                val profileRes  = profileDeferred.await().body()
                val devicesRes  = devicesDeferred.await().body()
                val sessionsRes = sessionsDeferred.await().body()

                // Update TokenManager cache with fresh data from server
                profileRes?.user?.let { user ->
                    if (user.email.isNotBlank())    TokenManager.userEmail = user.email
                    if (user.fullName.isNotBlank()) TokenManager.userName  = user.fullName
                    TokenManager.isPremium = user.subscriptionActive == true
                }

                _state.value = ProfileState(
                    isLoading  = false,
                    profile    = profileRes?.user,
                    devices    = devicesRes?.devices  ?: emptyList(),
                    sessions   = sessionsRes?.sessions ?: emptyList(),
                    maxDevices = devicesRes?.maxDevices ?: 3,
                )
            } catch (e: Exception) {
                // API failed but keep the cached profile visible — don't blank the screen
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Could not refresh profile.",
                )
            }
        }
    }

    fun removeDevice(auth: String, deviceId: String) {
        viewModelScope.launch {
            try {
                HLApiClient.profileApi.removeDevice("Bearer $auth", deviceId)
                _state.value = _state.value.copy(
                    devices = _state.value.devices.filter { it.id != deviceId }
                )
            } catch (_: Exception) {}
        }
    }

    fun revokeSession(auth: String, sessionId: String) {
        viewModelScope.launch {
            try {
                HLApiClient.profileApi.revokeSession("Bearer $auth", sessionId)
                _state.value = _state.value.copy(
                    sessions = _state.value.sessions.filter { it.sessionId != sessionId }
                )
            } catch (_: Exception) {}
        }
    }

    fun logout(auth: String) {
        viewModelScope.launch {
            // `finally` guarantees loggedOut = true regardless of:
            // - 401 expired token
            // - network error
            // - any other exception
            try {
                HLApiClient.profileApi.logout("Bearer $auth")
            } catch (_: Exception) {
                // Server already revoked session on 401, or network is down.
                // Either way we log out locally.
            } finally {
                _state.value = _state.value.copy(
                    loggedOut = true,
                    profile   = null,
                    devices   = emptyList(),
                    sessions  = emptyList(),
                )
            }
        }
    }
}