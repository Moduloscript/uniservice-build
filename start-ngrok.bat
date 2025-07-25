@echo off
echo Starting ngrok tunnel for localhost:3000...
echo.
echo This will expose your local development server to the internet
echo so Paystack can send webhooks to your application.
echo.
echo Press Ctrl+C to stop the tunnel when done testing.
echo.
ngrok.exe http 3000
