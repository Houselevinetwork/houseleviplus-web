package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class ContentItemImages(
    @SerializedName("poster")   val poster: String   = "",
    @SerializedName("backdrop") val backdrop: String = "",
    @SerializedName("logo")     val logo: String     = "",
)

data class ContentItemStorage(
    @SerializedName("duration")           val duration: Int    = 0,
    @SerializedName("cloudflareStreamId") val cloudflareStreamId: String = "",
) {
    private val CF_CUSTOMER = "customer-7a488e9b77e6c8630472a07003c7d8e4"
    val hlsUrl: String? get() = if (cloudflareStreamId.isNotBlank())
        "https://$CF_CUSTOMER.cloudflarestream.com/$cloudflareStreamId/manifest/video.m3u8"
    else null
}

data class ContentItemMetadata(
    @SerializedName("genre")  val genre: List<String>  = emptyList(),
    @SerializedName("region") val region: List<String> = emptyList(),
)

data class ContentItem(
    @SerializedName("_id")         val id: String                  = "",
    @SerializedName("title")       val title: String               = "",
    @SerializedName("slug")        val slug: String                = "",
    @SerializedName("type")        val type: String                = "",
    @SerializedName("description") val description: String         = "",
    @SerializedName("images")      val images: ContentItemImages   = ContentItemImages(),
    @SerializedName("storage")     val storage: ContentItemStorage = ContentItemStorage(),
    @SerializedName("metadata")    val metadata: ContentItemMetadata = ContentItemMetadata(),
    @SerializedName("isPremium")   val isPremium: Boolean          = false,
    @SerializedName("status")      val status: String              = "published",
) {
    val thumbnailUrl: String get() = images.poster.ifBlank { images.backdrop }
    val backdropUrl:  String get() = images.backdrop.ifBlank { images.poster }
    val hlsUrl:       String? get() = storage.hlsUrl
}
