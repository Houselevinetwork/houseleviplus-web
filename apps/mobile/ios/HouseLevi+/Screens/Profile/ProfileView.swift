import SwiftUI

struct ProfileView: View {
    let accessToken: String
    let onLoggedOut: () -> Void
    @StateObject private var vm = ProfileViewModel()

    var body: some View {
        ZStack {
            Color.hlBlack.ignoresSafeArea()
            if vm.isLoading { ProgressView().tint(.hlBlueGlow) }
            else if let err = vm.error {
                VStack(spacing: 16) {
                    Text(err).foregroundColor(.hlTextMuted)
                    Button("Retry") { Task { await vm.load(auth: accessToken) } }.foregroundColor(.hlBlueGlow)
                }
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 0) {

                        //  Avatar + name 
                        VStack(spacing: 12) {
                            ZStack {
                                Circle().fill(Color.hlBlueGlow).frame(width: 80, height: 80)
                                Text(vm.profile?.initials ?? "?")
                                    .font(.system(size: 28, weight: .bold)).foregroundColor(.white)
                            }
                            Text(vm.profile?.fullName ?? "").font(.hlTitleLarge)
                            Text(vm.profile?.email ?? "").font(.hlBodyMedium).foregroundColor(.hlTextMuted)

                            // Subscription badge
                            let active = vm.profile?.subscriptionActive == true
                            Text(vm.profile?.subscriptionLabel ?? "Free")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(active ? .black : .hlTextMuted)
                                .padding(.horizontal, 16).padding(.vertical, 6)
                                .background(active ? Color.hlGold : Color.hlSurface)
                                .clipShape(Capsule())

                            if !(vm.profile?.subscriptionActive ?? false) {
                                Button {
                                    if let url = URL(string: "https://houselevi.com/choose-plan") {
                                        UIApplication.shared.open(url)
                                    }
                                } label: {
                                    Text("Upgrade to HL+ Premium")
                                        .font(.hlLabelLarge).foregroundColor(.hlBlueGlow)
                                        .padding(.horizontal, 20).frame(height: 42)
                                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.hlBlueGlow, lineWidth: 1))
                                }
                            }
                        }.frame(maxWidth: .infinity).padding(28)

                        Divider().background(Color.hlSurface)

                        //  Devices 
                        HStack {
                            Text("My Devices").font(.hlTitleMedium)
                            Spacer()
                            Text("\(vm.devices.count) of \(vm.maxDevices)")
                                .font(.hlLabelMedium).foregroundColor(.hlTextMuted)
                        }.padding(.horizontal, 20).padding(.vertical, 14)

                        ForEach(vm.devices) { device in
                            HStack(spacing: 12) {
                                Text(device.deviceType == "mobile" ? "" : device.deviceType == "desktop" ? "" : "")
                                    .font(.system(size: 24))
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(device.displayName).font(.hlLabelLarge)
                                    Text("\(device.os)  Last seen \(device.lastSeenAt.prefix(10))")
                                        .font(.system(size: 11)).foregroundColor(.hlTextMuted)
                                }
                                Spacer()
                                Button {
                                    Task { await vm.removeDevice(auth: accessToken, deviceId: device.id) }
                                } label: {
                                    Image(systemName: "trash").foregroundColor(.hlTextMuted)
                                }
                            }.padding(.horizontal, 20).padding(.vertical, 10)
                        }

                        //  Sessions 
                        if !vm.sessions.isEmpty {
                            Divider().background(Color.hlSurface)
                            Text("Active Sessions").font(.hlTitleMedium)
                                .padding(.horizontal, 20).padding(.vertical, 14)

                            ForEach(vm.sessions) { session in
                                HStack(spacing: 12) {
                                    Text("").font(.system(size: 20))
                                    VStack(alignment: .leading, spacing: 2) {
                                        HStack(spacing: 6) {
                                            Text(session.deviceName.isEmpty ? session.deviceType : session.deviceName)
                                                .font(.hlLabelLarge)
                                            if session.isCurrent {
                                                Text("This device").font(.system(size: 10)).foregroundColor(.hlGreen)
                                                    .padding(.horizontal, 6).padding(.vertical, 1)
                                                    .background(Color.hlGreen.opacity(0.15)).cornerRadius(4)
                                            }
                                        }
                                        Text("\(session.ipAddress)  \(session.country)")
                                            .font(.system(size: 11)).foregroundColor(.hlTextMuted)
                                    }
                                    Spacer()
                                    if !session.isCurrent {
                                        Button("Revoke") {
                                            Task { await vm.revokeSession(auth: accessToken, sessionId: session.sessionId) }
                                        }.font(.system(size: 12)).foregroundColor(.hlRed)
                                    }
                                }.padding(.horizontal, 20).padding(.vertical, 10)
                            }
                        }

                        //  Sign out 
                        Divider().background(Color.hlSurface)
                        Spacer().frame(height: 20)
                        Button {
                            Task { await vm.logout(auth: accessToken) }
                        } label: {
                            Text("Sign Out").font(.hlLabelLarge).foregroundColor(.hlRed)
                                .frame(maxWidth: .infinity).frame(height: 48)
                                .overlay(RoundedRectangle(cornerRadius: 4).stroke(Color.hlRed, lineWidth: 1))
                        }.padding(.horizontal, 20)
                        Spacer().frame(height: 40)
                    }
                }
            }
        }
        .task { await vm.load(auth: accessToken) }
        .onChange(of: vm.loggedOut) { if $0 { onLoggedOut() } }
    }
}
