# ============================================
#  START API SERVER
# ============================================

Write-Host " Starting API server..." -ForegroundColor Cyan
Write-Host ""

Set-Location api

if (Test-Path "pnpm-lock.yaml") {
    Write-Host "Using: pnpm" -ForegroundColor Gray
    pnpm run start:dev
} else {
    Write-Host "Using: npm" -ForegroundColor Gray
    npm run start:dev
}
