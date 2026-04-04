package com.houselevi.plus.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object HLApiClient {

    const val BASE_URL = "http://10.237.233.187:4000/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor())
        .authenticator(TokenAuthenticator())
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val authOkHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    private val authRetrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(authOkHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        
    val homeApi: HomeApi by lazy { retrofit.create(HomeApi::class.java) }
    val authApi:      AuthApi      by lazy { authRetrofit.create(AuthApi::class.java) }
    val contentApi:   ContentApi   by lazy { retrofit.create(ContentApi::class.java) }
    val travelApi:    TravelApi    by lazy { retrofit.create(TravelApi::class.java) }
    val linearTvApi:  LinearTvApi  by lazy { retrofit.create(LinearTvApi::class.java) }
    val playbackApi:  PlaybackApi  by lazy { retrofit.create(PlaybackApi::class.java) }
    val profileApi:   ProfileApi   by lazy { retrofit.create(ProfileApi::class.java) }
    val shopApi:      ShopApi      by lazy { retrofit.create(ShopApi::class.java) }
}