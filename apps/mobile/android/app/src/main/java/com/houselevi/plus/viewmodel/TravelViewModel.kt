package com.houselevi.plus.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.houselevi.plus.data.api.HLApiClient
import com.houselevi.plus.data.models.LeviNote
import com.houselevi.plus.data.models.TravelPackage
import com.houselevi.plus.data.models.TravelTestimonial
import com.houselevi.plus.data.models.InquiryRequest
import com.houselevi.plus.data.models.CustomTripRequest
import com.houselevi.plus.data.models.SubscribeRequest
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

// ─── Travel Home ─────────────────────────────────────────────────────────────
data class TravelHomeUiState(
    val isLoading: Boolean                    = true,
    val packages: List<TravelPackage>         = emptyList(),
    val testimonials: List<TravelTestimonial> = emptyList(),
    val leviNote: LeviNote?                   = null,
    val error: String?                        = null,
)

class TravelHomeViewModel : ViewModel() {
    private val _state = MutableStateFlow(TravelHomeUiState())
    val state: StateFlow<TravelHomeUiState> = _state

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val packagesDeferred     = async { HLApiClient.travelApi.getPackages() }
                val testimonialsDeferred = async { HLApiClient.travelApi.getTestimonials() }
                val noteDeferred         = async { HLApiClient.travelApi.getLeviNote() }

                val packagesRes     = packagesDeferred.await()
                val testimonialsRes = testimonialsDeferred.await()
                val noteRes         = noteDeferred.await()

                val packages     = packagesRes.body() ?: emptyList()
                val testimonials = testimonialsRes.body() ?: emptyList()

                _state.value = TravelHomeUiState(
                    isLoading    = false,
                    packages     = packages,
                    testimonials = testimonials,
                    leviNote     = noteRes.body()?.note,
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Failed to load travel packages.",
                )
            }
        }
    }

    fun refresh() = load()
}

// ─── Package Detail ───────────────────────────────────────────────────────────
data class PackageDetailUiState(
    val isLoading: Boolean                    = true,
    val pkg: TravelPackage?                   = null,
    val testimonials: List<TravelTestimonial> = emptyList(),
    val error: String?                        = null,
)

class PackageDetailViewModel : ViewModel() {
    private val _state = MutableStateFlow(PackageDetailUiState())
    val state: StateFlow<PackageDetailUiState> = _state

    fun load(slug: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val pkgDeferred  = async { HLApiClient.travelApi.getPackageBySlug(slug) }
                val testDeferred = async { HLApiClient.travelApi.getTestimonialsByPackage(slug) }

                val pkgRes  = pkgDeferred.await()
                val testRes = testDeferred.await()

                _state.value = PackageDetailUiState(
                    isLoading    = false,
                    pkg          = pkgRes.body()?.data,
                    testimonials = testRes.body() ?: emptyList(),
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error     = "Failed to load package.",
                )
            }
        }
    }
}                                              // ← closing brace was missing!

// ─── Inquiry / Subscribe ──────────────────────────────────────────────────────
data class InquiryUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val error: String?     = null,
)

class InquiryViewModel : ViewModel() {
    private val _state = MutableStateFlow(InquiryUiState())
    val state: StateFlow<InquiryUiState> = _state

    fun submitInquiry(request: InquiryRequest) {
        viewModelScope.launch {
            _state.value = InquiryUiState(isLoading = true)
            try {
                val res = HLApiClient.travelApi.submitInquiry(request)
                _state.value = if (res.isSuccessful && res.body()?.success == true)
                    InquiryUiState(isSuccess = true)
                else
                    InquiryUiState(error = res.body()?.message ?: "Submission failed")
            } catch (e: Exception) {
                _state.value = InquiryUiState(error = "Connection failed. Try again.")
            }
        }
    }

    fun submitCustomTrip(request: CustomTripRequest) {
        viewModelScope.launch {
            _state.value = InquiryUiState(isLoading = true)
            try {
                val res = HLApiClient.travelApi.submitCustomInquiry(request)
                _state.value = if (res.isSuccessful && res.body()?.success == true)
                    InquiryUiState(isSuccess = true)
                else
                    InquiryUiState(error = res.body()?.message ?: "Submission failed")
            } catch (e: Exception) {
                _state.value = InquiryUiState(error = "Connection failed. Try again.")
            }
        }
    }

    fun reset() {
        _state.value = InquiryUiState()
    }

    fun subscribe(firstName: String, email: String) {
        viewModelScope.launch {
            try {
                HLApiClient.travelApi.subscribe(SubscribeRequest(firstName, email))
            } catch (_: Exception) { }
        }
    }
}