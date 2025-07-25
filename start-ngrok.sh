#!/bin/bash

echo "🚀 Starting ngrok tunnel for localhost:3000..."
echo ""
echo "⚠️  IMPORTANT: Keep this terminal open while testing payments!"
echo "   Press Ctrl+C to stop the tunnel when done."
echo ""
echo "📋 After ngrok starts, use these URLs in your Paystack dashboard:"
echo ""

# Start ngrok and capture the output
./ngrok.exe http 3000
