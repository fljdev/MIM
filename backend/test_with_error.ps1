# Test that shows actual error

Write-Host "Killing any existing server..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Starting server with output to error.txt..."
cd d:/MIM/backend
$null = node server.js 2> error.txt &
$serverPID = $!

Write-Host "Server PID: $serverPID"
Start-Sleep -Seconds 5

Write-Host "=== Testing GET /api/listings/marketplace ==="
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/listings/marketplace" -Method GET -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Status Description: $($_.Exception.Response.StatusDescription)"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $errorBody = $reader.ReadToEnd()
    Write-Host "Error Body: $errorBody"
}

Write-Host ""
Write-Host "=== Server error output ==="
if (Test-Path "error.txt") {
    Get-Content "error.txt"
}

Write-Host ""
Write-Host "Killing server..."
Stop-Process -Id $serverPID -ErrorAction SilentlyContinue
Remove-Item "error.txt" -ErrorAction SilentlyContinue
Write-Host "Done."