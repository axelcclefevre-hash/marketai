# Lance l'API FastAPI + le frontend Next.js
Write-Host "Demarrage MarketAI..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\api'; python -m uvicorn main:app --host 127.0.0.1 --port 8000`""
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\frontend'; npm run dev`""

Write-Host "API : http://localhost:8000" -ForegroundColor Cyan
Write-Host "Site : http://localhost:3000" -ForegroundColor Cyan
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
