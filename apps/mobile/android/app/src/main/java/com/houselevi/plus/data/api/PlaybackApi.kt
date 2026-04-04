package com.houselevi.plus.data.api

import retrofit2.Response
import retrofit2.http.*

data class PlaybackStartBody(val contentId: String)
data class HeartbeatBody(val contentId: String, val position: Long)

interface PlaybackApi {
    @POST("playback/start")
    suspend fun startPlayback(@Header("Authorization") auth: String, @Body body: PlaybackStartBody): Response<Map<String, Any>>

    @POST("playback/heartbeat")
    suspend fun heartbeat(@Header("Authorization") auth: String, @Body body: HeartbeatBody): Response<Map<String, Any>>

    @POST("playback/stop")
    suspend fun stopPlayback(@Header("Authorization") auth: String): Response<Map<String, Any>>
}
