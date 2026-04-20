#!/bin/bash
cd /mnt/d/MIM/backend

echo "=== Killing any existing server ==="
pkill -f "node server.js" 2>/dev/null
sleep 2

echo "=== Starting server ==="
node server.js > /dev/null 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 5

echo "=== Test 1: GET /api/listings/marketplace ==="
curl -X GET http://localhost:5000/api/listings/marketplace
echo ""
echo ""

echo "=== Test 2: POST /api/listings without token ==="
curl -X POST http://localhost:5000/api/listings \
  -H "Content-Type: application/json" \
  -d '{"holding_id":1,"price_type":"fixed","asking_price":500}'
echo ""
echo ""

echo "=== Killing server ==="
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null
echo "Done."