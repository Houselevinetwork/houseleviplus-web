import Foundation

struct TravelHomeState {
    var isLoading: Bool = true
    var packages: [TravelPackage] = []
    var testimonials: [TravelTestimonial] = []
    var leviNote: LeviNote? = nil
    var error: String? = nil
}

struct PackageDetailState {
    var isLoading: Bool = true
    var pkg: TravelPackage? = nil
    var testimonials: [TravelTestimonial] = []
    var error: String? = nil
}

struct InquiryState {
    var isSubmitting: Bool = false
    var success: Bool = false
    var error: String? = nil
}

@MainActor
final class TravelHomeViewModel: ObservableObject {
    @Published var state = TravelHomeState()
    init() { Task { await load() } }

    func load() async {
        state = TravelHomeState(isLoading: true)
        do {
            async let pkgsTask  = HLAPIClient.shared.getPackages()
            async let noteTask  = HLAPIClient.shared.getLeviNote()
            async let testiTask = HLAPIClient.shared.getTestimonials()
            let (pkgs, noteRes, testi) = try await (pkgsTask, noteTask, testiTask)
            state = TravelHomeState(
                isLoading: false, packages: pkgs.data,
                testimonials: testi.data, leviNote: noteRes.note,
            )
        } catch {
            state = TravelHomeState(isLoading: false, error: "Failed to load. Check connection.")
        }
    }
    func refresh() { Task { await load() } }
}

@MainActor
final class PackageDetailViewModel: ObservableObject {
    @Published var state = PackageDetailState()

    func load(slug: String) async {
        state = PackageDetailState(isLoading: true)
        do {
            async let pkgTask   = HLAPIClient.shared.getPackageBySlug(slug)
            async let testiTask = HLAPIClient.shared.getTestimonialsByPackage(slug)
            let (pkgRes, testi) = try await (pkgTask, testiTask)
            state = PackageDetailState(isLoading: false, pkg: pkgRes.data, testimonials: testi.data)
        } catch {
            state = PackageDetailState(isLoading: false, error: "Failed to load package.")
        }
    }
}

@MainActor
final class InquiryViewModel: ObservableObject {
    @Published var state = InquiryState()

    func submitInquiry(_ body: InquiryRequest) async {
        state = InquiryState(isSubmitting: true)
        do {
            let _ = try await HLAPIClient.shared.submitInquiry(body)
            state = InquiryState(success: true)
        } catch {
            state = InquiryState(error: "Submission failed. Please try again.")
        }
    }

    func submitCustomTrip(_ body: CustomTripRequest) async {
        state = InquiryState(isSubmitting: true)
        do {
            let _ = try await HLAPIClient.shared.submitCustomInquiry(body)
            state = InquiryState(success: true)
        } catch {
            state = InquiryState(error: "Submission failed. Please try again.")
        }
    }

    func subscribe(firstName: String, email: String) async {
        _ = try? await HLAPIClient.shared.subscribe(firstName: firstName, email: email)
    }

    func reset() { state = InquiryState() }
}
