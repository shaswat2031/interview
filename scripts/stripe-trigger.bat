@echo off
echo Triggering Stripe webhook events...
echo.
echo Available event types to trigger:
echo.
echo 1. checkout.session.completed
echo 2. payment_intent.succeeded
echo 3. payment_intent.payment_failed
echo.
set /p event_choice=Enter choice (1-3): 

if "%event_choice%"=="1" (
  echo Triggering checkout.session.completed event...
  stripe trigger checkout.session.completed
) else if "%event_choice%"=="2" (
  echo Triggering payment_intent.succeeded event...
  stripe trigger payment_intent.succeeded
) else if "%event_choice%"=="3" (
  echo Triggering payment_intent.payment_failed event...
  stripe trigger payment_intent.payment_failed
) else (
  echo Invalid choice. Please run the script again.
)

echo.
pause
