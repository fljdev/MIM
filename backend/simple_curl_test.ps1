# Simple curl test for listings routes

# Kill any existing server
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "=== Starting server ==="
# Start server in background
Start-Job -ScriptBlock {
    cd d:/MIM/backend
    node server.js
} | Out-Null

Write-Host "Waiting 5 seconds..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Test 1: GET /api/listings/marketplace ==="
Write-Host "Expected: 200 with empty array"
Write-Host "Running: curl -X GET http://localhost:5000/api/listings/marketplace"
curl -s -X GET http://localhost:5000/api/listings/marketplace
Write-Host ""

Write-Host ""
Write-Host "=== Test 2: POST /api/listings without token ==="
Write-Host "Expected: 401 Unauthorized"
Write-Host "Running: curl -X POST http://localhost:5000/api/listings -H 'Content-Type: application/json' -d '{\"holding_id\":1,\"price_type\":\"fixed\",\"asking_price\":500}'"
curl -s -X POST http://localhost:5000/api/listings -H "Content-Type: application/json" -d '{\"holding_id\":1,\"price_type\":\"fixed\",\"asking_price\":500}'
Write-Host ""

Write-Host ""
Write-Host "=== Killing server ==="
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Done."