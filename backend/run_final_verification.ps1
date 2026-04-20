Write-Host "=== MiM Listings Routes Verification Test ==="
Write-Host "=============================================="

# Kill any existing server
Write-Host "Stopping any existing server..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Starting server..."
# Start server and capture output
$serverOutputFile = "d:/MIM/backend/server_startup_output.txt"
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -RedirectStandardOutput $serverOutputFile -RedirectStandardError $serverOutputFile -WindowStyle Hidden -PassThru
Write-Host "Server started with PID: $($serverProcess.Id)"

Write-Host "Waiting 7 seconds for server to fully start..."
Start-Sleep -Seconds 7

Write-Host ""
Write-Host "=== Test 1: GET /api/listings/marketplace ==="
Write-Host "Command: curl -X GET http://localhost:5000/api/listings/marketplace"
Write-Host "---"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/listings/marketplace" -Method GET -ErrorAction Stop
    Write-Host "Response (JSON):"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}
Write-Host "---"

Write-Host ""
Write-Host "=== Test 2: POST /api/listings without token ==="
Write-Host "Command: curl -X POST http://localhost:5000/api/listings -H 'Content-Type: application/json' -d '{\"holding_id\":1,\"price_type\":\"fixed\",\"asking_price\":500}'"
Write-Host "---"
$postData = @{
    holding_id = 1
    price_type = "fixed"
    asking_price = 500
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/listings" -Method POST -Body $postData -ContentType "application/json" -ErrorAction Stop
    Write-Host "Response (JSON):"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred (expected 401 Unauthorized):"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}
Write-Host "---"

Write-Host ""
Write-Host "=== Checking server startup output ==="
if (Test-Path $serverOutputFile) {
    Write-Host "Last 10 lines of server output:"
    Get-Content $serverOutputFile -Tail 10
}

Write-Host ""
Write-Host "Stopping server..."
Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
Remove-Item $serverOutputFile -ErrorAction SilentlyContinue
Write-Host "Verification test complete."