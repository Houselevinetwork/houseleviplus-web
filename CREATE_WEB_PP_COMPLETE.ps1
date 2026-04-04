# ============================================================================
# HOUSE LEVI+ WEB++ COMPLETE CREATION SCRIPT
# Fresh Next.js Admin Studio with Token Security + Electron + PWA
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 CREATING HOUSE LEVI+ WEB++ (STUDIO)" -ForegroundColor Yellow
Write-Host "Fresh start with token security + multi-platform support`n" -ForegroundColor Cyan

# Define paths
$rootPath = "C:\Users\wakha\Desktop\houselevi+"
$webPPPath = Join-Path $rootPath "apps\web++"

Write-Host "Target: $webPPPath`n" -ForegroundColor Gray

# ─── STEP 1: Create Base Structure ─────────────────────────────────────────
Write-Host "📂 Step 1: Creating folder structure..." -ForegroundColor Green

$folders = @(
    "app",
    "app\(auth)",
    "app\(auth)\verify",
    "app\(studio)",
    "app\(studio)\dashboard",
    "app\(studio)\content",
    "app\(studio)\content\tv-shows",
    "app\(studio)\content\movies",
    "app\(studio)\content\shorts",
    "app\(studio)\content\stage-plays",
    "app\(studio)\content\music",
    "app\(studio)\content\podcasts",
    "app\(studio)\content\sports",
    "app\(studio)\content\kids",
    "app\(studio)\mood-tv",
    "app\(studio)\mood-tv\schedule",
    "app\(studio)\mood-tv\health",
    "app\(studio)\shop",
    "app\(studio)\shop\products",
    "app\(studio)\shop\inventory",
    "app\(studio)\shop\orders",
    "app\(studio)\travel",
    "app\(studio)\travel\packages",
    "app\(studio)\travel\bookings",
    "app\(studio)\collections",
    "app\(studio)\users",
    "app\(studio)\analytics",
    "app\(studio)\security",
    "app\(studio)\settings",
    "app\blocked",
    "app\api",
    "app\api\auth",
    "app\api\auth\verify-token",
    "components",
    "components\auth",
    "components\layout",
    "components\dashboard",
    "components\content",
    "components\mood-tv",
    "components\shop",
    "components\travel",
    "components\users",
    "components\analytics",
    "components\charts",
    "components\tables",
    "components\forms",
    "components\ui",
    "lib",
    "lib\auth",
    "lib\api",
    "lib\hooks",
    "lib\utils",
    "lib\validations",
    "electron",
    "electron\icons",
    "public",
    "public\icons",
    "public\images"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $webPPPath $folder
    New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
}

Write-Host "   ✅ Created $($folders.Count) folders`n" -ForegroundColor Green

# ─── STEP 2: Create package.json ────────────────────────────────────────────
Write-Host "📦 Step 2: Creating package.json..." -ForegroundColor Green

$packageJson = @'
{
  "name": "@houselevi/studio",
  "version": "1.0.0",
  "description": "House Levi+ Studio - Admin Panel",
  "private": true,
  "main": "electron/main.js",
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "next lint",
    "electron:dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3002 && electron .\"",
    "electron:build": "pnpm build && electron-builder",
    "electron:build:win": "electron-builder --win",
    "electron:build:mac": "electron-builder --mac"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.2",
    "@tanstack/react-table": "^8.20.5",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "jose": "^5.9.6",
    "js-cookie": "^3.0.5",
    "lucide-react": "^0.468.0",
    "next-pwa": "^5.6.0",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.0",
    "sonner": "^1.7.3",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@types/js-cookie": "^3.0.6",
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "concurrently": "^9.1.2",
    "electron": "^33.2.1",
    "electron-builder": "^25.1.8",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "wait-on": "^8.0.1"
  },
  "build": {
    "appId": "com.houselevi.studio",
    "productName": "House Levi Studio",
    "directories": {
      "output": "dist"
    },
    "files": [
      "out/**/*",
      "electron/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "electron/icons/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "electron/icons/icon.icns"
    }
  }
}
