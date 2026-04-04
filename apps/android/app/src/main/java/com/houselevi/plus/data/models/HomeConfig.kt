package com.houselevi.plus.data.models

import com.google.gson.annotations.SerializedName

/**
 * Maps to /home/config  — returned as a flat JSON object (no wrapper).
 * Matches web HomeHero.tsx: heroCaption, heroTitle, heroMode,
 * slideshowInterval (ms), kenBurnsEffect.
 */
data class HomeConfig(
    @SerializedName("heroCaption")       val heroCaption: String     = "HL+ FACES",
    @SerializedName("heroTitle")         val heroTitle: String       = "THE PEOPLES GALLERY",
    @SerializedName("heroMode")          val heroMode: String        = "all",
    @SerializedName("slideshowInterval") val slideshowInterval: Int  = 5000,
    @SerializedName("kenBurnsEffect")    val kenBurnsEffect: Boolean = true,
)
