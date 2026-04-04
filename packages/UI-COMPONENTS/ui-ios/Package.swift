// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "HouseLevi-UI-iOS",
    platforms: [.iOS(.v16), .tvOS(.v16)],
    products: [
        .library(name: "HouseLevi-UI", targets: ["HouseLevi-UI"])
    ],
    dependencies: [
        // Add dependencies here
    ],
    targets: [
        .target(name: "HouseLevi-UI", dependencies: [])
    ]
)
