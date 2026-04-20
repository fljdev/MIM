#!/bin/bash
cd /mnt/d/MIM/backend

# Kill any existing node servers
pkill -f "node.*server.js" 2>/dev/null
sleep 2

echo "Starting server..."
node server.js > /tmp/mim_server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
sleep 5

# Check if server is running
if ! ps -p $SERVER_PID > /dev/null; then
    echo "ERROR: Server failed to start. Log:"
    cat /tmp/mim_server.log
    exit 1
fi

echo "Server is running"

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:5000/health | jq -r '.status' 2>/dev/null || curl -s http://localhost:5000/health
echo ""

# Run required curl tests
echo "=== Running required curl tests ==="

echo "1. GET /api/holdings (no auth):"
HTTP_STATUS=$(curl -X GET http://localhost:5000/api/holdings -s -o /dev/null -w "%{http_code}")
echo "   HTTP Status: $HTTP_STATUS (expected: 401)"

echo ""
echo "2. POST /api/holdings (no auth):"
HTTP_STATUS=$(curl -X POST http://localhost:5000/api/holdings \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Sovereign","metal_type":"gold","category":"sovereign","weight_grams":7.98,"purity":0.9167,"quantity":1}' \
  -s -o /dev/null -w "%{http_code}")
echo "   HTTP Status: $HTTP_STATUS (expected: 401)"

echo ""
echo "=== Additional verification tests ==="

echo "3. GET /api/holdings/test (test endpoint):"
curl -X GET http://localhost:5000/api/holdings/test -s | head -c 100
echo ""

echo "4. Check if holdings route is registered:"
curl -X GET http://localhost:5000/api/holdings/test -s -o /dev/null -w "Status: %{http_code}\n"

# Kill server
kill $SERVER_PID 2>/dev/null
echo "Server stopped"

echo ""
echo "=== Test Summary ==="
echo "Both endpoints should return 401 Unauthorized (no token provided)."
echo "If you see 401, the auth middleware is working correctly."