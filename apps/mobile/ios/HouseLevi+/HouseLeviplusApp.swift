import SwiftUI

@main
struct HouseLeviplusApp: App {
    @State private var splashDone = false
    @State private var currentUser: User? = nil

    var body: some Scene {
        WindowGroup {
            if !splashDone {
                SplashView(onComplete: { splashDone = true })
            } else if currentUser == nil {
                SignInView(
                    onSignInSuccess: { user in currentUser = user },
                    onSignUpRedirect: {
                        if let url = URL(string: "https://houselevi.com/home") { UIApplication.shared.open(url) }
                    }
                )
            } else {
                MainTabView(currentUser: currentUser)
            }
        }
    }
}
