# Report Platform Launcher
# Run: powershell -ExecutionPolicy Bypass -File start-server.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Report Platform..." -ForegroundColor Cyan

# Kill existing processes on ports
$p3001 = (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess
if ($p3001) { Stop-Process -Id $p3001 -Force -ErrorAction SilentlyContinue }

# Start server in background
$serverJob = Start-Job -Name "ReportServer" -ScriptBlock {
  param($root)
  Set-Location "$root\packages\server"
  npx tsx src/index.ts 2>&1 | Out-Null
} -ArgumentList $root

Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

# Start tunnel in background
$tunnelJob = Start-Job -Name "ReportTunnel" -ScriptBlock {
  npx --yes localtunnel --port 3001 --subdomain gongdifang 2>&1
}

Start-Sleep -Seconds 6

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Public URL: https://gongdifang.loca.lt" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop. Keep this window open." -ForegroundColor Yellow
Write-Host ""

# Monitor and auto-restart tunnel if it dies
while ($true) {
  Start-Sleep -Seconds 30

  if ($tunnelJob.State -ne 'Running') {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Tunnel died, restarting..." -ForegroundColor Red
    $tunnelJob = Start-Job -Name "ReportTunnel" -ScriptBlock {
      npx --yes localtunnel --port 3001 --subdomain gongdifang 2>&1
    }
  }
}
