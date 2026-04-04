import SwiftUI

struct PackageDetailView: View {
    let slug: String
    let onBack: () -> Void
    let onInquire: (String, String) -> Void

    @StateObject private var vm = PackageDetailViewModel()

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            if vm.state.isLoading {
                ProgressView().tint(.hlBlueGlow)
            } else if let err = vm.state.error {
                VStack(spacing: 16) {
                    Text(err).foregroundColor(.hlTextMuted)
                    Button("Go back", action: onBack).foregroundColor(.hlBlueGlow)
                }
            } else if let pkg = vm.state.pkg {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {

                        //  Header image 
                        ZStack(alignment: .topLeading) {
                            AsyncImage(url: URL(string: pkg.thumbnail)) { phase in
                                switch phase {
                                case .success(let img): img.resizable().scaledToFill()
                                default: Rectangle().fill(Color.hlSurface)
                                }
                            }.frame(height: 380).clipped()

                            LinearGradient(stops: [
                                .init(color: .black.opacity(0.3), location: 0),
                                .init(color: .clear, location: 0.4),
                                .init(color: Color.hlBlack, location: 1)
                            ], startPoint: .top, endPoint: .bottom)

                            Button(action: onBack) {
                                Image(systemName: "arrow.left")
                                    .foregroundColor(.white).padding(10)
                                    .background(Color.black.opacity(0.5))
                                    .clipShape(Circle())
                            }.padding(16)
                        }.frame(height: 380)

                        //  Title + Meta 
                        VStack(alignment: .leading, spacing: 8) {
                            if !pkg.destination.isEmpty {
                                Text(pkg.destination.uppercased())
                                    .font(.system(size: 11, weight: .bold)).tracking(2)
                                    .foregroundColor(.hlGold)
                            }
                            Text(pkg.title).font(.hlHeadlineLarge).foregroundColor(.hlTextPrimary)
                            HStack(spacing: 12) {
                                MetaTag(pkg.displayDuration)
                                MetaTag(pkg.displayPrice)
                                if pkg.groupSize > 0 { MetaTag("Up to \(pkg.groupSize) pax") }
                            }
                            Text(pkg.description).font(.hlBodyLarge).foregroundColor(.hlTextSecondary)
                                .lineSpacing(5).padding(.top, 4)
                        }.padding(.horizontal, 20).padding(.top, 4)

                        //  Highlights 
                        if !pkg.highlights.isEmpty {
                            SectionTitle("Highlights")
                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(pkg.highlights, id: \.self) { h in
                                    HStack(alignment: .top, spacing: 8) {
                                        Text("").foregroundColor(.hlGold)
                                        Text(h).font(.hlBodyMedium).foregroundColor(.hlTextSecondary)
                                    }
                                }
                            }.padding(.horizontal, 20)
                        }

                        //  Inclusions/Exclusions 
                        if !pkg.inclusions.isEmpty {
                            SectionTitle("What's Included")
                            VStack(alignment: .leading, spacing: 6) {
                                ForEach(pkg.inclusions, id: \.self) { i in
                                    Text("  \(i)").font(.hlBodyMedium).foregroundColor(.hlGreen)
                                }
                                ForEach(pkg.exclusions, id: \.self) { e in
                                    Text("  \(e)").font(.hlBodyMedium).foregroundColor(.hlTextMuted)
                                }
                            }.padding(.horizontal, 20)
                        }

                        //  Itinerary 
                        if !pkg.itinerary.isEmpty {
                            SectionTitle("Itinerary")
                            ForEach(pkg.itinerary, id: \.day) { day in
                                HStack(alignment: .top, spacing: 16) {
                                    VStack(spacing: 0) {
                                        ZStack {
                                            Circle().fill(Color.hlBlueGlow).frame(width: 32, height: 32)
                                            Text("\(day.day)").font(.system(size: 13, weight: .bold))
                                                .foregroundColor(.white)
                                        }
                                        Rectangle().fill(Color.hlSurface).frame(width: 2, height: 40)
                                    }
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(day.title).font(.hlTitleMedium).foregroundColor(.hlTextPrimary)
                                        if !day.description.isEmpty {
                                            Text(day.description).font(.hlBodyMedium)
                                                .foregroundColor(.hlTextSecondary)
                                        }
                                    }.padding(.top, 6)
                                    Spacer()
                                }.padding(.horizontal, 20).padding(.vertical, 4)
                            }
                        }

                        //  Gallery 
                        if pkg.images.count > 1 {
                            SectionTitle("Gallery")
                            ScrollView(.horizontal, showsIndicators: false) {
                                LazyHStack(spacing: 10) {
                                    ForEach(pkg.images, id: \.self) { imgUrl in
                                        AsyncImage(url: URL(string: imgUrl)) { phase in
                                            switch phase {
                                            case .success(let img): img.resizable().scaledToFill()
                                            default: Rectangle().fill(Color.hlSurface)
                                            }
                                        }.frame(width: 180, height: 120).clipped().cornerRadius(6)
                                    }
                                }.padding(.horizontal, 20)
                            }
                        }

                        //  Testimonials 
                        if !vm.state.testimonials.isEmpty {
                            SectionTitle("What Travellers Say")
                            ScrollView(.horizontal, showsIndicators: false) {
                                LazyHStack(spacing: 12) {
                                    ForEach(vm.state.testimonials) { t in TravelTestimonialCard(t: t) }
                                }.padding(.horizontal, 20)
                            }
                        }

                        //  CTA 
                        Spacer().frame(height: 32)
                        VStack(spacing: 10) {
                            Button { onInquire(pkg.slug, pkg.title) } label: {
                                Text("Book This Package").font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white).frame(maxWidth: .infinity).frame(height: 54)
                                    .background(Color.hlBlueGlow).cornerRadius(4)
                            }
                            Button { onInquire("custom", "Custom Trip") } label: {
                                Text("Plan a Custom Trip").font(.hlLabelLarge).foregroundColor(.hlTextMuted)
                                    .frame(maxWidth: .infinity).frame(height: 48)
                                    .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.hlTextMuted, lineWidth: 1))
                            }
                        }.padding(.horizontal, 20)
                        Spacer().frame(height: 40)
                    }
                }.ignoresSafeArea(edges: .top)
            }
        }
        .task { await vm.load(slug: slug) }
    }
}

private struct MetaTag: View {
    let text: String; init(_ t: String) { text = t }
    var body: some View {
        Text(text).font(.hlLabelMedium).foregroundColor(.hlTextSecondary)
            .padding(.horizontal, 10).padding(.vertical, 5).background(Color.hlSurface).cornerRadius(4)
    }
}
private struct SectionTitle: View {
    let text: String; init(_ t: String) { text = t }
    var body: some View {
        Text(text).font(.hlTitleLarge).foregroundColor(.hlTextPrimary)
            .padding(.horizontal, 20).padding(.top, 28).padding(.bottom, 12)
    }
}
