import Foundation

extension HLAPIClient {
    func getPackages(status: String = "published") async throws -> TravelPackagesResponse {
        try await request(method: "GET", path: "travel/packages?status=\(status)")
    }
    func getPackageBySlug(_ slug: String) async throws -> TravelPackageResponse {
        try await request(method: "GET", path: "travel/packages/\(slug)")
    }
    func getLeviNote() async throws -> LeviNoteResponse {
        try await request(method: "GET", path: "travel/note")
    }
    func subscribe(firstName: String, email: String) async throws -> TravelActionResponse {
        try await request(method: "POST", path: "travel/subscribe",
                         body: SubscribeRequest(firstName: firstName, email: email))
    }
    func submitInquiry(_ body: InquiryRequest) async throws -> TravelActionResponse {
        try await request(method: "POST", path: "travel/inquiries", body: body)
    }
    func submitCustomInquiry(_ body: CustomTripRequest) async throws -> TravelActionResponse {
        try await request(method: "POST", path: "travel/inquiries/custom", body: body)
    }
    func getTestimonials(featured: Bool = true) async throws -> TestimonialsResponse {
        try await request(method: "GET", path: "travel/testimonials?status=approved&featured=\(featured)")
    }
    func getTestimonialsByPackage(_ slug: String) async throws -> TestimonialsResponse {
        try await request(method: "GET", path: "travel/testimonials?packageSlug=\(slug)&status=approved")
    }
}
