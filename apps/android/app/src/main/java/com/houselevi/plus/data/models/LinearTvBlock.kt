package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class LinearTvBlock(
    @SerializedName("_id")       val id: String        = "",
    @SerializedName("title")     val title: String     = "",
    @SerializedName("streamUrl") val streamUrl: String = "",
    @SerializedName("hlsUrl")    val hlsUrl: String    = "",
    @SerializedName("isActive")  val isActive: Boolean = true,
)

/**
 * /linear-tv/now-playing
 * Backend may use "nowPlaying" or "block" as the key — both covered.
 */
data class LinearTvNowResponse(
    @SerializedName("nowPlaying") val nowPlaying: LinearTvBlock? = null,
    @SerializedName("block")      val block: LinearTvBlock?      = null,
) {
    val current: LinearTvBlock? get() = nowPlaying ?: block
}
