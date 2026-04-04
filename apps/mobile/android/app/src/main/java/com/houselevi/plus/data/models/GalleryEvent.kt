package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class GalleryEvent(
    @SerializedName("_id")        val id: String        = "",
    @SerializedName("name")       val name: String      = "",
    @SerializedName("slug")       val slug: String      = "",
    @SerializedName("imageCount") val imageCount: Int   = 0,
    @SerializedName("isActive")   val isActive: Boolean = true,
)

data class GalleryEventsResponse(
    @SerializedName("data") val data: List<GalleryEvent> = emptyList(),
)

data class HeroImagesResponse(
    @SerializedName("data") val data: List<String> = emptyList(),
)
