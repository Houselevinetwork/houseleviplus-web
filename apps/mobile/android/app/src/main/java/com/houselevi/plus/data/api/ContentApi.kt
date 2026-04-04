package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.ContentItem
import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

// Matches actual backend shape:
// {"success":true,"data":{"data":[],"total":0,"page":1,"limit":50}}
data class ContentPage(
    @SerializedName("data")  val data: List<ContentItem> = emptyList(),
    @SerializedName("total") val total: Int = 0,
    @SerializedName("page")  val page: Int = 1,
    @SerializedName("limit") val limit: Int = 50,
)

data class ContentListResponse(
    @SerializedName("success") val success: Boolean  = false,
    @SerializedName("data")    val data: ContentPage = ContentPage(),
)

interface ContentApi {
    @GET("api/content")
    suspend fun getContent(
        @Query("category") category: String? = null
    ): Response<ContentListResponse>
}