import SwiftUI

class LoginViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var error: String?
    
    // Uses same business logic as useLogin hook
    func login(email: String, password: String) async {
        isLoading = true
        error = nil
        
        do {
            // DPA Section 32: Explicit consent required
            // Calls shared AuthCore.login() from packages
            let result = try await AuthCore.login(
                email: email,
                password: password
            )
            
            // Netflix pattern: Device binding handled server-side
        } catch {
            self.error = error.localizedDescription
        }
        
        isLoading = false
    }
}

struct LoginView: View {
    @StateObject private var viewModel = LoginViewModel()
    @State private var email = ""
    @State private var password = ""
    
    var body: some View {
        Form {
            TextField("Email", text: \)
            SecureField("Password", text: \)
            
            if let error = viewModel.error {
                Text(error).foregroundColor(.red)
            }
            
            Button(viewModel.isLoading ? "Logging in..." : "Login") {
                Task {
                    await viewModel.login(email: email, password: password)
                }
            }
            .disabled(viewModel.isLoading)
        }
    }
}
