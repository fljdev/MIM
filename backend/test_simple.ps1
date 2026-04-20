# PowerShell test script for listings routes

Write-Host "=== Killing any existing server ==="
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "=== Starting server ==="
$serverJob = Start-Job -ScriptBlock {
    cd d:/MIM/backend
    node server.js
}

Write-Host "Server started in background job"
Start-Sleep -Seconds 5

Write-Host "=== Test 1: GET /api/listings/marketplace ==="
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/listings/marketplace" -Method GET -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Test 2: POST /api/listings without token ==="
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
    Write-Host "Error (expected 401): $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

Write-Host ""
Write-Host "=== Stopping server ==="
Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
Write-Host "Test complete."