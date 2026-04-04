package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class TravelPackage(
    @SerializedName("_id")          val id: String               = "",
    @SerializedName("slug")         val slug: String             = "",
    @SerializedName("title")        val title: String            = "",
    @SerializedName("description")  val description: String      = "",
    @SerializedName("shortDesc")    val shortDesc: String        = "",
    @SerializedName("destination")  val destination: String      = "",
    @SerializedName("country")      val country: String          = "",
    @SerializedName("region")       val region: String           = "",
    @SerializedName("price")        val price: Double            = 0.0,
    @SerializedName("currency")     val currency: String         = "USD",
    @SerializedName("duration")     val duration: Int            = 0,
    @SerializedName("durationUnit") val durationUnit: String     = "days",
    @SerializedName("groupSize")    val groupSize: Int           = 0,
    @SerializedName("images")       val images: List<String>     = emptyList(),
    @SerializedName("coverImage")   val coverImage: String       = "",
    @SerializedName("highlights")   val highlights: List<String> = emptyList(),
    @SerializedName("inclusions")   val inclusions: List<String> = emptyList(),
    @SerializedName("exclusions")   val exclusions: List<String> = emptyList(),
    @SerializedName("itinerary")    val itinerary: List<ItineraryDay> = emptyList(),
    @SerializedName("status")       val status: String           = "published",
    @SerializedName("order")        val order: Int               = 0,
    @SerializedName("featured")     val featured: Boolean        = false,
    @SerializedName("tags")         val tags: List<String>       = emptyList(),
    @SerializedName("createdAt")    val createdAt: String        = "",
) {
    val thumbnail: String get() = coverImage.ifBlank { images.firstOrNull() ?: "" }
    val displayPrice: String get() = "$currency ${String.format("%,.0f", price)}"
    val displayDuration: String get() = "$duration $durationUnit"
}

data class ItineraryDay(
    @SerializedName("day")         val day: Int                 = 0,
    @SerializedName("title")       val title: String            = "",
    @SerializedName("description") val description: String      = "",
    @SerializedName("activities")  val activities: List<String> = emptyList(),
)

data class LeviNote(
    @SerializedName("bodyText")          val bodyText: String          = "",
    @SerializedName("signatureImageUrl") val signatureImageUrl: String = "",
)

data class LeviNoteResponse(
    @SerializedName("success")           val success: Boolean           = false,
    @SerializedName("data")              val data: LeviNote?            = null,
    @SerializedName("bodyText")          val bodyText: String?          = null,
    @SerializedName("signatureImageUrl") val signatureImageUrl: String? = null,
) {
    val note: LeviNote get() = data ?: LeviNote(
        bodyText          = bodyText ?: "",
        signatureImageUrl = signatureImageUrl ?: "",
    )
}

data class TravelTestimonial(
    @SerializedName("_id")          val id: String           = "",
    @SerializedName("name")         val name: String         = "",
    @SerializedName("packageSlug")  val packageSlug: String  = "",
    @SerializedName("packageTitle") val packageTitle: String = "",
    @SerializedName("rating")       val rating: Int          = 5,
    @SerializedName("text")         val text: String         = "",
    @SerializedName("avatarUrl")    val avatarUrl: String    = "",
    @SerializedName("featured")     val featured: Boolean    = false,
    @SerializedName("status")       val status: String       = "approved",
    @SerializedName("createdAt")    val createdAt: String    = "",
)

data class InquiryRequest(
    val packageId: String    = "",
    val packageSlug: String  = "",
    val packageTitle: String = "",
    val firstName: String    = "",
    val lastName: String     = "",
    val email: String        = "",
    val phone: String        = "",
    val message: String      = "",
    val travelDate: String   = "",
    val groupSize: Int       = 1,
)

data class CustomTripRequest(
    val firstName: String   = "",
    val lastName: String    = "",
    val email: String       = "",
    val phone: String       = "",
    val destination: String = "",
    val travelDate: String  = "",
    val budget: String      = "",
    val groupSize: Int      = 1,
    val message: String     = "",
)

data class SubscribeRequest(
    val firstName: String = "",
    val email: String     = "",
)

data class TravelActionResponse(
    @SerializedName("success") val success: Boolean = false,
    @SerializedName("message") val message: String  = "",
)

data class TravelPackagesResponse(
    @SerializedName("success")  val success: Boolean               = false,
    @SerializedName("data")     val data: List<TravelPackage>?     = null,
    @SerializedName("packages") val packages: List<TravelPackage>? = null,
)

data class TravelPackageResponse(
    @SerializedName("success") val success: Boolean     = false,
    @SerializedName("data")    val data: TravelPackage? = null,
)

data class TestimonialsResponse(
    @SerializedName("success")      val success: Boolean                       = false,
    @SerializedName("data")         val data: List<TravelTestimonial>?         = null,
    @SerializedName("testimonials") val testimonials: List<TravelTestimonial>? = null,
)