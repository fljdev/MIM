Write-Host "=== FINAL LISTINGS ROUTES TEST ==="
Write-Host "Stopping any existing server..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting server..."
$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru
Write-Host "Server started with PID: $($serverProcess.Id)"

Write-Host "Waiting 5 seconds for server to start..."
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "=== Test 1: GET /api/listings/marketplace (public) ==="
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/listings/marketplace" -Method GET -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

Write-Host ""
Write-Host "=== Test 2: POST /api/listings without token (should return 401) ==="
$postData = @{
    holding_id = 1
    price_type = "fixed"
    asking_price = 500
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/listings" -Method POST -Body $postData -ContentType "application/json" -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Expected 401 Unauthorized - Request was blocked as expected"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

Write-Host ""
Write-Host "Stopping server..."
Stop-Process -Id $serverProcess.Id -ErrorAction SilentlyContinue
Write-Host "Test complete."