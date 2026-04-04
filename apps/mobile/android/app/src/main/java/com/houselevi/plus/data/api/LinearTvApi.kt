package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.LinearTvNowResponse
import retrofit2.Response
import retrofit2.http.GET

interface LinearTvApi {
    @GET("linear-tv/now-playing")
    suspend fun getNowPlaying(): Response<LinearTvNowResponse>
}
