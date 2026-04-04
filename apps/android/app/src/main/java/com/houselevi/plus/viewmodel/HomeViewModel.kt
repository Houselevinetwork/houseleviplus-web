package com.houselevi.plus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.models.*
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean                  = true,
    val heroImages: List<String>            = emptyList(),
    val heroConfig: HomeConfig              = HomeConfig(),
    val galleryEvents: List<GalleryEvent>   = emptyList(),
    val activeEvent: String                 = "all",
    val items: List<ContentItem>            = emptyList(),
    val heroItem: ContentItem?              = null,
    val liveNow: LinearTvBlock?             = null,
    val travelPackages: List<TravelPackage> = emptyList(),
    val shopProducts: List<Product>         = emptyList(),
    val error: String?                      = null,
)

class HomeViewModel : ViewModel() {

    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state

    init { loadHome() }

    fun loadHome() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val configDeferred  = async { HLApiClient.homeApi.getConfig() }
                val eventsDeferred  = async { HLApiClient.homeApi.getGalleryEvents() }
                val heroDeferred    = async { HLApiClient.homeApi.getHeroImages("all", 30) }
                val contentDeferred = async { HLApiClient.contentApi.getContent() }
                val liveDeferred    = async { HLApiClient.linearTvApi.getNowPlaying() }
                val travelDeferred  = async { HLApiClient.travelApi.getPackages() }
                val shopDeferred    = async { HLApiClient.shopApi.getProducts() }

                val config   = configDeferred.await().body()          ?: HomeConfig()
                val events   = eventsDeferred.await().body()?.data    ?: emptyList()
                val heroImgs = heroDeferred.await().body()?.data      ?: emptyList()
                val items    = contentDeferred.await().body()?.data?.data ?: emptyList()
                val shop     = shopDeferred.await().body()?.data      ?: emptyList()

                // FIX: TravelApi returns Response<List<TravelPackage>> — List has no .data
                val travel   = travelDeferred.await().body()          ?: emptyList()

                // Linear TV — LinearTvNowResponse handles both "nowPlaying" and "block" keys
                val live     = liveDeferred.await().body()?.current

                _state.value = HomeUiState(
                    isLoading      = false,
                    heroImages     = heroImgs,
                    heroConfig     = config,
                    galleryEvents  = events,
                    items          = items,
                    heroItem       = items.firstOrNull { it.type == "original" } ?: items.firstOrNull(),
                    liveNow        = live,
                    travelPackages = travel,
                    shopProducts   = shop,
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Failed to load. Check your connection.",
                )
            }
        }
    }

    fun switchEvent(slug: String) {
        viewModelScope.launch {
            try {
                val heroImgs = HLApiClient.homeApi.getHeroImages(slug, 30).body()?.data ?: emptyList()
                _state.value = _state.value.copy(activeEvent = slug, heroImages = heroImgs)
            } catch (_: Exception) {}
        }
    }

    fun refresh() = loadHome()
}
