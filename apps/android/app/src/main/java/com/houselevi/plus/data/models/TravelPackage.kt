package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class ItineraryDay(
    @SerializedName("day")         val day: Int            = 0,
    @SerializedName("title")       val title: String       = "",
    @SerializedName("description") val description: String = "",
)

/**
 * Travel package — aligns with both:
 *   - Web travel/types.ts  (priceUSD, imageUrl, continent, status)
 *   - PackageDetailScreen.kt  (thumbnail, displayDuration, displayPrice,
 *                              highlights, inclusions, exclusions, itinerary)
 */
data class TravelPackage(
    @SerializedName("_id")          val id: String                     = "",
    @SerializedName("slug")         val slug: String                   = "",
    @SerializedName("title")        val title: String                  = "",
    @SerializedName("destination")  val destination: String            = "",
    @SerializedName("continent")    val continent: String              = "",
    @SerializedName("description")  val description: String            = "",
    // image — backend may send "thumbnail" or "imageUrl"
    @SerializedName("thumbnail")    val thumbnail: String              = "",
    @SerializedName("imageUrl")     val imageUrl: String               = "",
    @SerializedName("images")       val images: List<String>           = emptyList(),
    @SerializedName("priceUSD")     val priceUSD: Double               = 0.0,
    @SerializedName("durationDays") val durationDays: Int              = 0,
    @SerializedName("groupSize")    val groupSize: Int                 = 0,
    @SerializedName("highlights")   val highlights: List<String>       = emptyList(),
    @SerializedName("inclusions")   val inclusions: List<String>       = emptyList(),
    @SerializedName("exclusions")   val exclusions: List<String>       = emptyList(),
    @SerializedName("itinerary")    val itinerary: List<ItineraryDay>  = emptyList(),
    @SerializedName("status")       val status: String                 = "published",
    // web types
    @SerializedName("departureDate")   val departureDate: String  = "",
    @SerializedName("returnDate")      val returnDate: String     = "",
    @SerializedName("totalSpots")      val totalSpots: Int        = 0,
    @SerializedName("spotsRemaining")  val spotsRemaining: Int    = 0,
) {
    /** Primary image — thumbnail → imageUrl → first gallery item */
    val heroImage: String
        get() = thumbnail.ifBlank { imageUrl.ifBlank { images.firstOrNull() ?: "" } }

    /** e.g. "7 Days" — used in PackageDetailScreen MetaChip */
    val displayDuration: String
        get() = if (durationDays > 0) "$durationDays Days" else ""

    /** e.g. "From $1,200" — used in PackageDetailScreen MetaChip */
    val displayPrice: String
        get() = if (priceUSD > 0) "From \$${priceUSD.toInt()}" else "Contact Us"
}

/** Single-package detail response: { "data": TravelPackage } */
data class TravelPackageResponse(
    @SerializedName("data") val data: TravelPackage? = null,
)
