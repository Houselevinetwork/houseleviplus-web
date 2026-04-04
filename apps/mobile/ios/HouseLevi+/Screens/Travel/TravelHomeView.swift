import SwiftUI

struct TravelHomeView: View {
    let onPackageClick: (String) -> Void
    let onCustomTripClick: () -> Void

    @StateObject private var vm = TravelHomeViewModel()
    @State private var firstName = ""
    @State private var email     = ""
    @State private var subscribed = false

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            if vm.state.isLoading {
                ProgressView().tint(.hlBlueGlow)
            } else if let err = vm.state.error {
                VStack(spacing: 16) {
                    Text(err).font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                    Button("Retry") { vm.refresh() }.foregroundColor(.hlBlueGlow)
                }
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {

                        //  Hero 
                        ZStack(alignment: .bottomLeading) {
                            LinearGradient(colors: [Color(hex: "0D2340"), Color.hlBlack],
                                           startPoint: .top, endPoint: .bottom)
                                .frame(height: 340)
                            VStack(alignment: .leading, spacing: 8) {
                                Text("").font(.system(size: 36))
                                Text("TRAVEL")
                                    .font(.hlDisplayLarge)
                                    .foregroundColor(.hlTextPrimary)
                                    .tracking(6)
                                Text("Curated African experiences")
                                    .font(.hlBodyLarge).foregroundColor(.hlTextSecondary)
                                Spacer().frame(height: 8)
                                Button { onCustomTripClick() } label: {
                                    Text("Plan Custom Trip")
                                        .font(.hlLabelLarge)
                                        .foregroundColor(.white)
                                        .padding(.horizontal, 20).frame(height: 44)
                                        .background(Color.hlBlueGlow).cornerRadius(4)
                                }
                            }.padding(24)
                        }

                        //  Levi's Note 
                        if let note = vm.state.leviNote, !note.bodyText.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("A note from Levi")
                                    .font(.system(size: 11, weight: .semibold))
                                    .tracking(2).foregroundColor(.hlGold)
                                Text(note.bodyText)
                                    .font(.hlBodyLarge).foregroundColor(.hlTextSecondary)
                                    .lineSpacing(6)
                                if !note.signatureImageUrl.isEmpty {
                                    AsyncImage(url: URL(string: note.signatureImageUrl)) { phase in
                                        if case .success(let img) = phase { img.resizable().scaledToFit() }
                                    }.frame(height: 48)
                                }
                            }
                            .padding(24)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.hlSurface)
                        }

                        //  Packages 
                        Spacer().frame(height: 32)
                        Text("Our Packages")
                            .font(.hlHeadlineMedium)
                            .foregroundColor(.hlTextPrimary)
                            .padding(.horizontal, 20)
                        Spacer().frame(height: 16)

                        ForEach(vm.state.packages) { pkg in
                            TravelPackageCard(pkg: pkg) { onPackageClick(pkg.slug) }
                                .padding(.horizontal, 20)
                                .padding(.bottom, 16)
                        }

                        //  Testimonials 
                        if !vm.state.testimonials.isEmpty {
                            Spacer().frame(height: 16)
                            Text("Traveller Stories")
                                .font(.hlHeadlineMedium).foregroundColor(.hlTextPrimary)
                                .padding(.horizontal, 20)
                            Spacer().frame(height: 16)
                            ScrollView(.horizontal, showsIndicators: false) {
                                LazyHStack(spacing: 12) {
                                    ForEach(vm.state.testimonials) { t in
                                        TravelTestimonialCard(t: t)
                                    }
                                }.padding(.horizontal, 20)
                            }
                        }

                        //  Subscribe 
                        Spacer().frame(height: 32)
                        SubscribeBannerView(
                            firstName: $firstName, email: $email, done: $subscribed,
                            onSubmit: {
                                Task { await InquiryViewModel().subscribe(firstName: firstName, email: email) }
                                subscribed = true
                            }
                        )
                        Spacer().frame(height: 40)
                    }
                }.ignoresSafeArea(edges: .top)
            }
        }
    }
}

struct TravelPackageCard: View {
    let pkg: TravelPackage; let onTap: () -> Void
    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .bottomLeading) {
                AsyncImage(url: URL(string: pkg.thumbnail)) { phase in
                    switch phase {
                    case .success(let img): img.resizable().scaledToFill()
                    default: Rectangle().fill(Color.hlSurface)
                    }
                }.frame(height: 240).clipped().cornerRadius(10)

                LinearGradient(colors: [.clear, .black.opacity(0.85)],
                               startPoint: .top, endPoint: .bottom).cornerRadius(10)

                VStack(alignment: .leading, spacing: 6) {
                    if !pkg.destination.isEmpty {
                        Text(pkg.destination.uppercased())
                            .font(.system(size: 10, weight: .bold)).tracking(2)
                            .foregroundColor(.hlGold)
                    }
                    Text(pkg.title).font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white).lineLimit(2)
                    HStack(spacing: 16) {
                        Text(pkg.displayPrice).font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                        Text(pkg.displayDuration).font(.hlLabelLarge).foregroundColor(.hlTextMuted)
                    }
                }.padding(16)

                if pkg.featured {
                    VStack {
                        HStack {
                            Spacer()
                            Text("FEATURED")
                                .font(.system(size: 9, weight: .bold)).tracking(1)
                                .foregroundColor(.black).padding(.horizontal, 8).padding(.vertical, 3)
                                .background(Color.hlGold).cornerRadius(4)
                                .padding(12)
                        }
                        Spacer()
                    }
                }
            }.frame(height: 240)
        }.buttonStyle(.plain)
    }
}

struct TravelTestimonialCard: View {
    let t: TravelTestimonial
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 2) {
                ForEach(0..<5) { i in
                    Text(i < t.rating ? "" : "")
                        .font(.system(size: 14)).foregroundColor(.hlGold)
                }
            }
            Text(t.text).font(.hlBodyMedium).foregroundColor(.hlTextSecondary)
                .lineSpacing(4).lineLimit(5)
            Spacer()
            Text(" \(t.name)").font(.hlLabelMedium).foregroundColor(.hlTextPrimary)
            if !t.packageTitle.isEmpty {
                Text(t.packageTitle).font(.system(size: 11)).foregroundColor(.hlTextMuted)
            }
        }
        .frame(width: 260)
        .padding(16)
        .background(Color.hlSurface)
        .cornerRadius(8)
    }
}

struct SubscribeBannerView: View {
    @Binding var firstName: String; @Binding var email: String; @Binding var done: Bool
    let onSubmit: () -> Void
    var body: some View {
        VStack(spacing: 12) {
            Text("Stay in the loop").font(.hlTitleLarge).foregroundColor(.hlTextPrimary)
            Text("Get early access to new packages and exclusive deals.")
                .font(.hlBodyMedium).foregroundColor(.hlTextMuted).multilineTextAlignment(.center)
            if done {
                Text("You're subscribed! ").font(.hlLabelLarge).foregroundColor(.hlGreen)
            } else {
                TextField("First name", text: $firstName)
                    .textFieldStyle(.roundedBorder)
                    .frame(maxWidth: .infinity)
                TextField("Email address", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.emailAddress).autocapitalization(.none)
                    .frame(maxWidth: .infinity)
                Button(action: onSubmit) {
                    Text("Subscribe").font(.hlLabelLarge).foregroundColor(.white)
                        .frame(maxWidth: .infinity).frame(height: 48)
                        .background(Color.hlBlueGlow).cornerRadius(4)
                }
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.hlSurface)
    }
}
