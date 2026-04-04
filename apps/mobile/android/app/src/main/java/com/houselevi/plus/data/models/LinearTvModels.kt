package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class LinearTvBlock(
    @SerializedName("title")        val title: String        = "",
    @SerializedName("category")     val category: String     = "",
    @SerializedName("startTime")    val startTime: String    = "",
    @SerializedName("endTime")      val endTime: String      = "",
    @SerializedName("streamUrl")    val streamUrl: String    = "",
    @SerializedName("thumbnailUrl") val thumbnailUrl: String = "",
)

data class LinearTvNowResponse(
    @SerializedName("success")    val success: Boolean      = false,
    @SerializedName("nowPlaying") val nowPlaying: LinearTvBlock? = null,
    @SerializedName("data")       val data: LinearTvBlock?  = null,
)
