package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ProfileApi {
    @GET("auth/me")
    suspend fun getMe(@Header("Authorization") auth: String): Response<ProfileResponse>

    @GET("auth/devices")
    suspend fun getDevices(@Header("Authorization") auth: String): Response<DevicesResponse>

    @DELETE("auth/devices/{deviceId}")
    suspend fun removeDevice(
        @Header("Authorization") auth: String,
        @Path("deviceId") deviceId: String,
    ): Response<Map<String, Any>>

    @GET("auth/sessions")
    suspend fun getSessions(@Header("Authorization") auth: String): Response<SessionsResponse>

    @POST("auth/sessions/{sessionId}/revoke")
    suspend fun revokeSession(
        @Header("Authorization") auth: String,
        @Path("sessionId") sessionId: String,
    ): Response<Map<String, Any>>

    @POST("auth/logout")
    suspend fun logout(@Header("Authorization") auth: String): Response<Map<String, Any>>
}
