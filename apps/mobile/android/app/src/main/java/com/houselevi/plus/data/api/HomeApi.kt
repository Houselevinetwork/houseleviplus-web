package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.GalleryEventsResponse
import com.houselevi.plus.data.models.HeroImagesResponse
import com.houselevi.plus.data.models.HomeConfig
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface HomeApi {

    @GET("home/config")
    suspend fun getConfig(): Response<HomeConfig>

    @GET("home/gallery/events")
    suspend fun getGalleryEvents(): Response<GalleryEventsResponse>

    @GET("home/gallery/hero")
    suspend fun getHeroImages(
        @Query("event") event: String = "all",
        @Query("count") count: Int    = 30,
    ): Response<HeroImagesResponse>
}