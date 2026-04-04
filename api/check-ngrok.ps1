# check-ngrok.ps1
# Script to check if ngrok is running and get the URL

Write-Host "🔍 Checking ngrok status..." -ForegroundColor Cyan

# Check if ngrok process is running
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue

if ($ngrokProcess) {
    Write-Host "✅ ngrok is running (PID: $($ngrokProcess.Id))" -ForegroundColor Green
    
    # Get ngrok API info
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method GET
        
        if ($ngrokApi.tunnels.Count -gt 0) {
            $publicUrl = $ngrokApi.tunnels[0].public_url
            Write-Host "🌐 Public URL: $publicUrl" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Update your .env file with:" -ForegroundColor Yellow
            Write-Host "NGROK_URL=$publicUrl" -ForegroundColor White
            Write-Host "PESAPAL_CALLBACK_URL_NGROK=$publicUrl/billing/pesapal-webhook" -ForegroundColor White
            Write-Host "NODE_ENV=ngrok" -ForegroundColor White
            Write-Host ""
            Write-Host "🔗 ngrok dashboard: http://localhost:4040" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ ngrok is running but no tunnels found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Could not connect to ngrok API at http://localhost:4040" -ForegroundColor Red
        Write-Host "Make sure ngrok is properly started" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ ngrok is NOT running" -ForegroundColor Red
    Write-Host ""
    Write-Host "To start ngrok, run:" -ForegroundColor Yellow
    Write-Host "ngrok http 4000" -ForegroundColor White
}
