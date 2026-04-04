# ============================================================================
# HOUSE LEVI+ WEB+ MIGRATION SCRIPT
# Convert Vite → Next.js + Restructure to Netflix-Grade Architecture
# ============================================================================

$ErrorActionPreference = "Stop"
$webPlusPath = "C:\Users\wakha\Desktop\houselevi+\apps\web+"

Write-Host "`n🚀 HOUSE LEVI+ WEB+ MIGRATION" -ForegroundColor Yellow
Write-Host "Converting Vite → Next.js & Restructuring...`n" -ForegroundColor Cyan

# ─── STEP 1: Backup Current Structure ───────────────────────────────────────
Write-Host "📦 Step 1: Creating backup..." -ForegroundColor Green

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$webPlusPath-backup-$timestamp"

if (Test-Path $webPlusPath) {
    Copy-Item -Path $webPlusPath -Destination $backupPath -Recurse -Force
    Write-Host "   ✅ Backup created at: $backupPath`n" -ForegroundColor Green
} else {
    Write-Host "   ❌ web+ folder not found!" -ForegroundColor Red
    exit 1
}

# ─── STEP 2: Create Next.js Structure ────────────────────────────────────────
Write-Host "📂 Step 2: Creating Next.js structure..." -ForegroundColor Green

$folders = @(
    # Next.js App Router structure
    "app",
    "app/(auth)",
    "app/(auth)/login",
    "app/(dashboard)",
    "app/(dashboard)/dashboard",
    "app/(dashboard)/content",
    "app/(dashboard)/content/tv-shows",
    "app/(dashboard)/content/movies",
    "app/(dashboard)/content/shorts",
    "app/(dashboard)/content/stage-plays",
    "app/(dashboard)/content/music",
    "app/(dashboard)/content/podcasts",
    "app/(dashboard)/content/sports",
    "app/(dashboard)/content/kids",
    "app/(dashboard)/mood-tv",
    "app/(dashboard)/mood-tv/schedule",
    "app/(dashboard)/mood-tv/health",
    "app/(dashboard)/shop",
    "app/(dashboard)/shop/products",
    "app/(dashboard)/shop/inventory",
    "app/(dashboard)/shop/orders",
    "app/(dashboard)/shop/cart-analytics",
    "app/(dashboard)/travel",
    "app/(dashboard)/travel/packages",
    "app/(dashboard)/travel/bookings",
    "app/(dashboard)/travel/inquiries",
    "app/(dashboard)/collections",
    "app/(dashboard)/users",
    "app/(dashboard)/users/overview",
    "app/(dashboard)/users/free",
    "app/(dashboard)/users/premium",
    "app/(dashboard)/users/activity",
    "app/(dashboard)/analytics",
    "app/(dashboard)/analytics/revenue",
    "app/(dashboard)/analytics/content",
    "app/(dashboard)/analytics/subscriptions",
    "app/(dashboard)/analytics/apps",
    "app/(dashboard)/analytics/reports",
    "app/(dashboard)/security",
    "app/(dashboard)/security/dpa",
    "app/(dashboard)/security/devices",
    "app/(dashboard)/settings",
    
    # Components structure
    "components",
    "components/dashboard",
    "components/content",
    "components/content/upload",
    "components/mood-tv",
    "components/shop",
    "components/travel",
    "components/users",
    "components/analytics",
    "components/charts",
    "components/tables",
    "components/forms",
    "components/layout",
    "components/ui",
    
    # Lib structure
    "lib",
    "lib/api",
    "lib/hooks",
    "lib/utils",
    "lib/validations",
    
    # Public
    "public",
    "public/icons",
    "public/images"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $webPlusPath $folder
    New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
}

Write-Host "   ✅ Created $($folders.Count) folders`n" -ForegroundColor Green

# ─── STEP 3: Create Next.js Configuration Files ─────────────────────────────
Write-Host "⚙️ Step 3: Creating Next.js config files..." -ForegroundColor Green

# package.json
$packageJson = @'
{
  "name": "@houselevi/web-plus",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.4",
    "@radix-ui/react-avatar": "^1.1.2",
    "@radix-ui/react-checkbox": "^1.1.3",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-scroll-area": "^1.2.2",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-separator": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "@radix-ui/react-toast": "^1.2.4",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@tanstack/react-table": "^8.20.5",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.4",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.468.0",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.0",
    "sonner": "^1.7.3",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2"
  }
}
