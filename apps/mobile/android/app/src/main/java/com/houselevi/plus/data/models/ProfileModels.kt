package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

//  Device (GET /auth/devices) 
data class Device(
    @SerializedName("id")          val id: String          = "",
    @SerializedName("deviceId")    val deviceId: String    = "",
    @SerializedName("deviceType")  val deviceType: String  = "",
    @SerializedName("deviceName")  val deviceName: String  = "",
    @SerializedName("os")          val os: String          = "",
    @SerializedName("watchr")     val watchr: String     = "",
    @SerializedName("lastSeenAt")  val lastSeenAt: String  = "",
    @SerializedName("lastSeenIp")  val lastSeenIp: String  = "",
    @SerializedName("loginCount")  val loginCount: Int     = 0,
    @SerializedName("firstSeenAt") val firstSeenAt: String = "",
    @SerializedName("active")      val active: Boolean     = true,
    @SerializedName("trusted")     val trusted: Boolean    = false,
) {
    val displayName: String get() = deviceName.ifBlank { "$deviceType  $os" }
}

data class DevicesResponse(
    @SerializedName("success")    val success: Boolean    = false,
    @SerializedName("devices")    val devices: List<Device> = emptyList(),
    @SerializedName("count")      val count: Int          = 0,
    @SerializedName("maxDevices") val maxDevices: Int     = 3,
)

//  Session (GET /auth/sessions) 
data class UserSession(
    @SerializedName("sessionId")  val sessionId: String   = "",
    @SerializedName("deviceType") val deviceType: String  = "",
    @SerializedName("deviceName") val deviceName: String  = "",
    @SerializedName("lastSeenAt") val lastSeenAt: String  = "",
    @SerializedName("ipAddress")  val ipAddress: String   = "",
    @SerializedName("country")    val country: String     = "",
    @SerializedName("isCurrent")  val isCurrent: Boolean  = false,
)

data class SessionsResponse(
    @SerializedName("success")  val success: Boolean          = false,
    @SerializedName("sessions") val sessions: List<UserSession> = emptyList(),
)

//  Full UserProfile from /auth/me 
data class UserProfile(
    @SerializedName("id")                 val id: String               = "",
    @SerializedName("firstName")          val firstName: String        = "",
    @SerializedName("lastName")           val lastName: String         = "",
    @SerializedName("email")              val email: String            = "",
    @SerializedName("phoneNumber")        val phoneNumber: String      = "",
    @SerializedName("emailVerified")      val emailVerified: Boolean   = false,
    @SerializedName("isPremium")          val isPremium: Boolean       = false,
    @SerializedName("subscriptionStatus") val subscriptionStatus: String = "",
    @SerializedName("isActive")           val isActive: Boolean        = true,
    @SerializedName("role")               val role: String             = "user",
) {
    val fullName: String get() = "$firstName $lastName".trim()
    val initials: String get() = buildString {
        if (firstName.isNotEmpty()) append(firstName.first().uppercaseChar())
        if (lastName.isNotEmpty())  append(lastName.first().uppercaseChar())
    }.ifBlank { email.firstOrNull()?.uppercaseChar()?.toString() ?: "?" }

    val subscriptionLabel: String get() = when (subscriptionStatus.lowercase()) {
        "active"   -> "HL+ Premium"
        "trialing" -> "Free Trial"
        "past_due" -> "Payment Due"
        "canceled" -> "Cancelled"
        else       -> if (isPremium) "HL+ Premium" else "Free"
    }
    val subscriptionActive: Boolean get() =
        subscriptionStatus.lowercase() in listOf("active", "trialing") || isPremium
}

data class ProfileResponse(
    @SerializedName("success") val success: Boolean    = false,
    @SerializedName("user")    val user: UserProfile?  = null,
)

