import SwiftUI

struct InquiryFormView: View {
    let packageSlug: String
    let packageTitle: String
    let onBack: () -> Void

    @StateObject private var vm = InquiryViewModel()
    @State private var firstName  = ""
    @State private var lastName   = ""
    @State private var email      = ""
    @State private var phone      = ""
    @State private var message    = ""
    @State private var travelDate = ""
    @State private var groupSize  = "1"
    @State private var destination = ""
    @State private var budget      = ""

    var isCustom: Bool { packageSlug == "custom" }

    var body: some View {
        VStack(spacing: 0) {
            // Top bar
            HStack {
                Button(action: onBack) {
                    Image(systemName: "arrow.left").foregroundColor(.hlTextPrimary)
                        .padding(10).background(Color.hlSurface).clipShape(Circle())
                }
                Spacer().frame(width: 12)
                Text(isCustom ? "Plan a Custom Trip" : "Book: \(packageTitle)")
                    .font(.hlTitleLarge).lineLimit(1)
                Spacer()
            }.padding(16).background(Color.hlBlack)

            if vm.state.success {
                Spacer()
                VStack(spacing: 16) {
                    Text("").font(.system(size: 64)).foregroundColor(.hlGreen)
                    Text("Inquiry submitted!").font(.hlHeadlineMedium).foregroundColor(.hlGreen)
                    Text("We'll get back to you within 24 hours.")
                        .font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    Button("Go back", action: onBack).font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                }
                Spacer()
            } else {
                ScrollView {
                    VStack(spacing: 12) {
                        HLFormField("First name *", $firstName)
                        HLFormField("Last name *", $lastName)
                        HLFormField("Email *", $email, keyboardType: .emailAddress)
                        HLFormField("Phone / WhatsApp", $phone, keyboardType: .phonePad)
                        HLFormField("Preferred travel date", $travelDate)
                        HLFormField("Group size", $groupSize, keyboardType: .numberPad)
                        if isCustom {
                            HLFormField("Destination(s) of interest", $destination)
                            HLFormField("Approximate budget (e.g. USD 3,000)", $budget)
                        }
                        HLFormField("Message / special requests", $message, lines: 4)

                        if let err = vm.state.error {
                            Text(err).font(.hlBodyMedium).foregroundColor(.hlRed)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        Button {
                            guard !firstName.isEmpty, !lastName.isEmpty, !email.isEmpty else { return }
                            Task {
                                if isCustom {
                                    await vm.submitCustomTrip(CustomTripRequest(
                                        firstName: firstName, lastName: lastName, email: email,
                                        phone: phone, destination: destination, travelDate: travelDate,
                                        budget: budget, groupSize: Int(groupSize) ?? 1, message: message))
                                } else {
                                    await vm.submitInquiry(InquiryRequest(
                                        packageSlug: packageSlug, packageTitle: packageTitle,
                                        firstName: firstName, lastName: lastName, email: email,
                                        phone: phone, message: message, travelDate: travelDate,
                                        groupSize: Int(groupSize) ?? 1))
                                }
                            }
                        } label: {
                            ZStack {
                                if vm.state.isSubmitting { ProgressView().tint(.white) }
                                else { Text(isCustom ? "Submit Custom Request" : "Submit Inquiry")
                                    .font(.hlLabelLarge).foregroundColor(.white) }
                            }
                            .frame(maxWidth: .infinity).frame(height: 54)
                            .background(Color.hlBlueGlow).cornerRadius(4)
                        }
                        Spacer().frame(height: 40)
                    }.padding(.horizontal, 20).padding(.top, 8)
                }
            }
        }
        .background(Color.hlBlack.ignoresSafeArea())
        .onAppear { vm.reset() }
    }
}

private struct HLFormField: View {
    let label: String; @Binding var value: String
    var keyboardType: UIKeyboardType = .default; var lines: Int = 1
    init(_ l: String, _ v: Binding<String>, keyboardType: UIKeyboardType = .default, lines: Int = 1) {
        label = l; _value = v; self.keyboardType = keyboardType; self.lines = lines
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.system(size: 12, weight: .medium)).foregroundColor(.hlTextMuted)
            if lines > 1 {
                TextEditor(text: $value)
                    .frame(height: CGFloat(lines) * 28)
                    .padding(8).background(Color.hlSurface).cornerRadius(6)
                    .foregroundColor(.hlTextPrimary)
            } else {
                TextField("", text: $value)
                    .keyboardType(keyboardType)
                    .padding(12).background(Color.hlSurface).cornerRadius(6)
                    .foregroundColor(.hlTextPrimary)
            }
        }
    }
}
