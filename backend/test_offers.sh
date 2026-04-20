#!/bin/bash

echo "=== Stopping any existing server ==="
pkill -f "node.*server.js" 2>/dev/null
sleep 2

echo "=== Starting server ==="
cd /mnt/d/MIM/backend
nohup node server.js > server_test.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

echo "=== Waiting for server to start ==="
sleep 5

echo "=== Checking if server is running ==="
curl -s http://localhost:5000/health
echo ""
echo ""

echo "=== Test 1: GET /api/offers/received without token (Expected: 401) ==="
curl -X GET http://localhost:5000/api/offers/received -w "\nStatus: %{http_code}\n"
echo ""

echo "=== Test 2: POST /api/offers without token (Expected: 401) ==="
curl -X POST http://localhost:5000/api/offers \
  -H "Content-Type: application/json" \
  -d '{"listing_id":1,"offer_amount":500,"message":"Interested"}' \
  -w "\nStatus: %{http_code}\n"
echo ""

echo "=== Test 3: Check offers test endpoint ==="
curl -s http://localhost:5000/api/offers/test
echo ""

echo "=== Server logs ==="
tail -20 server_test.log

echo "=== Killing server ==="
kill $SERVER_PID 2>/dev/null

echo "=== Test completed ==="