#!/bin/bash
cd /mnt/d/MIM/backend

# Kill existing
pkill -f "node.*server.js" 2>/dev/null
sleep 2

echo "Starting server..."
node server.js > server_output.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
sleep 7

echo ""
echo "=== Testing endpoints ==="
echo ""

echo "1. GET /api/holdings (no auth header):"
curl -v -X GET http://localhost:5000/api/holdings 2>&1 | grep -E "< HTTP|< Content-Type|{"
echo ""

echo "2. POST /api/holdings (no auth header):"
curl -v -X POST http://localhost:5000/api/holdings \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Sovereign","metal_type":"gold","category":"sovereign","weight_grams":7.98,"purity":0.9167,"quantity":1}' 2>&1 | grep -E "< HTTP|< Content-Type|{"
echo ""

kill $SERVER_PID 2>/dev/null
echo "Server stopped"
echo ""
echo "Check server_output.log for server startup messages."