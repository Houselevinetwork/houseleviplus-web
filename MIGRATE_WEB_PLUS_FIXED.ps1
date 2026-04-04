# ============================================================================
# HOUSE LEVI+ WEB+ MIGRATION SCRIPT (FIXED)
# Convert Vite to Next.js + Restructure to Netflix-Grade Architecture
# ============================================================================

$ErrorActionPreference = "Stop"

# CRITICAL: Set the full path properly
$webPlusPath = "C:\Users\wakha\Desktop\houselevi+\apps\web+"

Write-Host "`n🚀 HOUSE LEVI+ WEB+ MIGRATION" -ForegroundColor Yellow
Write-Host "Converting Vite to Next.js & Restructuring...`n" -ForegroundColor Cyan
Write-Host "Target path: $webPlusPath`n" -ForegroundColor Gray

# Verify path exists
if (-not (Test-Path $webPlusPath)) {
    Write-Host "❌ ERROR: web+ folder not found at $webPlusPath" -ForegroundColor Red
    exit 1
}

# ─── STEP 1: Backup ─────────────────────────────────────────────────────────
Write-Host "📦 Step 1: Creating backup..." -ForegroundColor Green

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$webPlusPath-backup-$timestamp"

Copy-Item -Path $webPlusPath -Destination $backupPath -Recurse -Force
Write-Host "   ✅ Backup: $backupPath`n" -ForegroundColor Green

# ─── STEP 2: Create Next.js Structure ───────────────────────────────────────
Write-Host "📂 Step 2: Creating Next.js structure..." -ForegroundColor Green

$folders = @(
    "app",
    "app\(auth)",
    "app\(auth)\login",
    "app\(dashboard)",
    "app\(dashboard)\dashboard",
    "app\(dashboard)\content",
    "app\(dashboard)\content\tv-shows",
    "app\(dashboard)\content\movies",
    "app\(dashboard)\content\shorts",
    "app\(dashboard)\content\stage-plays",
    "app\(dashboard)\content\music",
    "app\(dashboard)\content\podcasts",
    "app\(dashboard)\content\sports",
    "app\(dashboard)\content\kids",
    "app\(dashboard)\mood-tv",
    "app\(dashboard)\shop",
    "app\(dashboard)\travel",
    "app\(dashboard)\collections",
    "app\(dashboard)\users",
    "app\(dashboard)\analytics",
    "app\(dashboard)\security",
    "app\(dashboard)\settings",
    "components",
    "components\dashboard",
    "components\content",
    "components\content\upload",
    "components\mood-tv",
    "components\shop",
    "components\travel",
    "components\users",
    "components\analytics",
    "components\charts",
    "components\tables",
    "components\forms",
    "components\layout",
    "components\ui",
    "lib",
    "lib\api",
    "lib\hooks",
    "lib\utils",
    "lib\validations",
    "public",
    "public\icons",
    "public\images"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $webPlusPath $folder
    New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
}

Write-Host "   ✅ Created $($folders.Count) folders`n" -ForegroundColor Green

# ─── STEP 3: Migrate Components ─────────────────────────────────────────────
Write-Host "📦 Step 3: Migrating components..." -ForegroundColor Green

$oldSrc = Join-Path $backupPath "src"

# Copy UI components
if (Test-Path "$oldSrc\components\ui") {
    Copy-Item -Path "$oldSrc\components\ui\*" -Destination "$webPlusPath\components\ui\" -Recurse -Force
    Write-Host "   ✅ UI components" -ForegroundColor Green
}

# Copy upload components
if (Test-Path "$oldSrc\components\upload") {
    Copy-Item -Path "$oldSrc\components\upload\*" -Destination "$webPlusPath\components\content\upload\" -Recurse -Force
    Write-Host "   ✅ Upload components" -ForegroundColor Green
}

# Copy travel components
if (Test-Path "$oldSrc\components\travel") {
    Copy-Item -Path "$oldSrc\components\travel\*" -Destination "$webPlusPath\components\travel\" -Recurse -Force
    Write-Host "   ✅ Travel components" -ForegroundColor Green
}

# Copy dashboard components
if (Test-Path "$oldSrc\components\dashboard") {
    Copy-Item -Path "$oldSrc\components\dashboard\*" -Destination "$webPlusPath\components\dashboard\" -Recurse -Force
    Write-Host "   ✅ Dashboard components" -ForegroundColor Green
}

# Copy lib files
if (Test-Path "$oldSrc\lib") {
    Copy-Item -Path "$oldSrc\lib\*" -Destination "$webPlusPath\lib\" -Recurse -Force
    Write-Host "   ✅ Lib files" -ForegroundColor Green
}

# Copy contexts
if (Test-Path "$oldSrc\contexts") {
    Copy-Item -Path "$oldSrc\contexts\*" -Destination "$webPlusPath\lib\" -Recurse -Force
    Write-Host "   ✅ Contexts" -ForegroundColor Green
}

# Copy hooks
if (Test-Path "$oldSrc\hooks") {
    Copy-Item -Path "$oldSrc\hooks\*" -Destination "$webPlusPath\lib\hooks\" -Recurse -Force
    Write-Host "   ✅ Hooks`n" -ForegroundColor Green
}

# ─── STEP 4: Create Config Files ────────────────────────────────────────────
Write-Host "⚙️ Step 4: Creating Next.js config..." -ForegroundColor Green

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
