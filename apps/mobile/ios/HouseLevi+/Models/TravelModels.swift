import Foundation

struct TravelPackage: Codable, Identifiable, Equatable {
    var id: String = ""
    var slug: String = ""
    var title: String = ""
    var description: String = ""
    var shortDesc: String = ""
    var destination: String = ""
    var country: String = ""
    var region: String = ""
    var price: Double = 0
    var currency: String = "USD"
    var duration: Int = 0
    var durationUnit: String = "days"
    var groupSize: Int = 0
    var images: [String] = []
    var coverImage: String = ""
    var highlights: [String] = []
    var inclusions: [String] = []
    var exclusions: [String] = []
    var itinerary: [ItineraryDay] = []
    var status: String = "published"
    var order: Int = 0
    var featured: Bool = false
    var tags: [String] = []
    var createdAt: String = ""

    enum CodingKeys: String, CodingKey {
        case id = "_id"; case slug; case title; case description; case shortDesc
        case destination; case country; case region; case price; case currency
        case duration; case durationUnit; case groupSize; case images; case coverImage
        case highlights; case inclusions; case exclusions; case itinerary
        case status; case order; case featured; case tags; case createdAt
    }

    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id           = (try? c.decodeIfPresent(String.self, forKey: .id))           ?? ""
        slug         = (try? c.decodeIfPresent(String.self, forKey: .slug))         ?? ""
        title        = (try? c.decodeIfPresent(String.self, forKey: .title))        ?? ""
        description  = (try? c.decodeIfPresent(String.self, forKey: .description))  ?? ""
        shortDesc    = (try? c.decodeIfPresent(String.self, forKey: .shortDesc))    ?? ""
        destination  = (try? c.decodeIfPresent(String.self, forKey: .destination))  ?? ""
        country      = (try? c.decodeIfPresent(String.self, forKey: .country))      ?? ""
        region       = (try? c.decodeIfPresent(String.self, forKey: .region))       ?? ""
        price        = (try? c.decodeIfPresent(Double.self, forKey: .price))        ?? 0
        currency     = (try? c.decodeIfPresent(String.self, forKey: .currency))     ?? "USD"
        duration     = (try? c.decodeIfPresent(Int.self,    forKey: .duration))     ?? 0
        durationUnit = (try? c.decodeIfPresent(String.self, forKey: .durationUnit)) ?? "days"
        groupSize    = (try? c.decodeIfPresent(Int.self,    forKey: .groupSize))    ?? 0
        images       = (try? c.decodeIfPresent([String].self,forKey: .images))      ?? []
        coverImage   = (try? c.decodeIfPresent(String.self, forKey: .coverImage))   ?? ""
        highlights   = (try? c.decodeIfPresent([String].self,forKey: .highlights))  ?? []
        inclusions   = (try? c.decodeIfPresent([String].self,forKey: .inclusions))  ?? []
        exclusions   = (try? c.decodeIfPresent([String].self,forKey: .exclusions))  ?? []
        itinerary    = (try? c.decodeIfPresent([ItineraryDay].self,forKey: .itinerary)) ?? []
        status       = (try? c.decodeIfPresent(String.self, forKey: .status))       ?? "published"
        order        = (try? c.decodeIfPresent(Int.self,    forKey: .order))        ?? 0
        featured     = (try? c.decodeIfPresent(Bool.self,   forKey: .featured))     ?? false
        tags         = (try? c.decodeIfPresent([String].self,forKey: .tags))        ?? []
        createdAt    = (try? c.decodeIfPresent(String.self, forKey: .createdAt))    ?? ""
    }

    var thumbnail: String { coverImage.isEmpty ? (images.first ?? "") : coverImage }
    var displayPrice: String { "\(currency) \(String(format: "%.0f", price))" }
    var displayDuration: String { "\(duration) \(durationUnit)" }
}

struct ItineraryDay: Codable, Equatable {
    var day: Int = 0; var title: String = ""
    var description: String = ""; var activities: [String] = []
}

struct LeviNote: Codable, Equatable {
    var bodyText: String = ""
    var signatureImageUrl: String = ""
}

struct TravelTestimonial: Codable, Identifiable, Equatable {
    var id: String = ""
    var name: String = ""; var packageSlug: String = ""; var packageTitle: String = ""
    var rating: Int = 5; var text: String = ""; var avatarUrl: String = ""
    var featured: Bool = false; var status: String = "approved"; var createdAt: String = ""
    enum CodingKeys: String, CodingKey {
        case id = "_id"; case name; case packageSlug; case packageTitle
        case rating; case text; case avatarUrl; case featured; case status; case createdAt
    }
    init() {}
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id           = (try? c.decodeIfPresent(String.self, forKey: .id))           ?? ""
        name         = (try? c.decodeIfPresent(String.self, forKey: .name))         ?? ""
        packageSlug  = (try? c.decodeIfPresent(String.self, forKey: .packageSlug))  ?? ""
        packageTitle = (try? c.decodeIfPresent(String.self, forKey: .packageTitle)) ?? ""
        rating       = (try? c.decodeIfPresent(Int.self,    forKey: .rating))       ?? 5
        text         = (try? c.decodeIfPresent(String.self, forKey: .text))         ?? ""
        avatarUrl    = (try? c.decodeIfPresent(String.self, forKey: .avatarUrl))    ?? ""
        featured     = (try? c.decodeIfPresent(Bool.self,   forKey: .featured))     ?? false
        status       = (try? c.decodeIfPresent(String.self, forKey: .status))       ?? "approved"
        createdAt    = (try? c.decodeIfPresent(String.self, forKey: .createdAt))    ?? ""
    }
}

struct LeviNoteResponse: Codable {
    var success: Bool?; var data: LeviNote?; var bodyText: String?; var signatureImageUrl: String?
    var note: LeviNote { data ?? LeviNote(bodyText: bodyText ?? "", signatureImageUrl: signatureImageUrl ?? "") }
}
struct TravelPackagesResponse: Codable { var success: Bool = false; var data: [TravelPackage] = [] }
struct TravelPackageResponse: Codable  { var success: Bool = false; var data: TravelPackage? }
struct TestimonialsResponse: Codable   { var success: Bool = false; var data: [TravelTestimonial] = [] }
struct TravelActionResponse: Codable   { var success: Bool = false; var message: String = "" }

struct InquiryRequest: Encodable {
    var packageId: String = ""; var packageSlug: String = ""; var packageTitle: String = ""
    var firstName: String; var lastName: String; var email: String; var phone: String
    var message: String; var travelDate: String; var groupSize: Int
}
struct CustomTripRequest: Encodable {
    var firstName: String; var lastName: String; var email: String; var phone: String
    var destination: String; var travelDate: String; var budget: String
    var groupSize: Int; var message: String
}
struct SubscribeRequest: Encodable { var firstName: String; var email: String }
