package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("id")                 val id: String               = "",
    @SerializedName("_id")                val _id: String              = "",
    @SerializedName("firstName")          val firstName: String        = "",
    @SerializedName("lastName")           val lastName: String         = "",
    @SerializedName("email")              val email: String            = "",
    @SerializedName("phoneNumber")        val phoneNumber: String      = "",
    @SerializedName("emailVerified")      val emailVerified: Boolean   = false,
    @SerializedName("isPremium")          val isPremium: Boolean       = false,
    @SerializedName("subscriptionStatus") val subscriptionStatus: String = "free",
    @SerializedName("isActive")           val isActive: Boolean        = true,
    @SerializedName("profileComplete")    val profileComplete: Boolean = false,
    @SerializedName("role")               val role: String             = "user",
    @SerializedName("permissions")        val permissions: List<String> = emptyList(),
) {
    val displayName: String get() = when {
        firstName.isNotBlank() && lastName.isNotBlank() -> "$firstName $lastName"
        firstName.isNotBlank() -> firstName
        else -> email.substringBefore("@")
    }
    val initials: String get() = buildString {
        if (firstName.isNotBlank()) append(firstName.first().uppercaseChar())
        if (lastName.isNotBlank())  append(lastName.first().uppercaseChar())
    }.ifEmpty { email.take(2).uppercase() }
    val isActivePremium: Boolean get() = isPremium && subscriptionStatus == "active"
    val subscriptionLabel: String get() = when (subscriptionStatus) {
        "active"    -> "HL+ Premium"
        "expired"   -> "Subscription Expired"
        "suspended" -> "Account Suspended"
        else        -> "Free Plan"
    }
}
