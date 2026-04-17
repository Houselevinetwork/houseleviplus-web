// app/home/layout.tsx
//
// ── NO metadata export here ───────────────────────────────────────────────────
// All SEO is handled by the root app/layout.tsx.
// Having a metadata export in this file was overriding the root og:title,
// og:description and blocking og:image from rendering on social shares.
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}