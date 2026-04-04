package com.houselevi.plus.data.api

import com.houselevi.plus.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface TravelApi {

    @GET("travel/packages")
    suspend fun getPackages(
        @Query("status") status: String = "published",
    ): Response<List<TravelPackage>>          // ← was TravelPackagesResponse

    @GET("travel/packages/{slug}")
    suspend fun getPackageBySlug(
        @Path("slug") slug: String,
    ): Response<TravelPackageResponse>

    @GET("travel/note")
    suspend fun getLeviNote(): Response<LeviNoteResponse>

    @POST("travel/subscribe")
    suspend fun subscribe(@Body body: SubscribeRequest): Response<TravelActionResponse>

    @POST("travel/inquiries")
    suspend fun submitInquiry(@Body body: InquiryRequest): Response<TravelActionResponse>

    @POST("travel/inquiries/custom")
    suspend fun submitCustomInquiry(@Body body: CustomTripRequest): Response<TravelActionResponse>

    @GET("travel/testimonials")
    suspend fun getTestimonials(
        @Query("status")   status:   String = "approved",
        @Query("featured") featured: String = "true",
    ): Response<List<TravelTestimonial>>      // ← was TestimonialsResponse

    @GET("travel/testimonials")
    suspend fun getTestimonialsByPackage(
        @Query("packageSlug") packageSlug: String,
        @Query("status")      status: String = "approved",
    ): Response<List<TravelTestimonial>>      // ← was TestimonialsResponse
}