package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

/** Single event tab shown on the HomeHero slideshow */
data class GalleryEvent(
    @SerializedName("_id")        val id: String        = "",
    @SerializedName("name")       val name: String      = "",
    @SerializedName("slug")       val slug: String      = "",
    @SerializedName("imageCount") val imageCount: Int   = 0,
    @SerializedName("isActive")   val isActive: Boolean = true,
)

/**
 * /home/gallery/events  →  { "data": [ GalleryEvent, … ] }
 */
data class GalleryEventsResponse(
    @SerializedName("data") val data: List<GalleryEvent> = emptyList(),
)

/**
 * /home/gallery/hero?event=all&count=30  →  { "data": ["url1","url2", …] }
 */
data class HeroImagesResponse(
    @SerializedName("data") val data: List<String> = emptyList(),
)
