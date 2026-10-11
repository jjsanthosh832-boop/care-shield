# Starts the React dev server (Vite) on http://localhost:3000/
# Run from the project root:  .\run_frontend.ps1
# Requires the backend on :8080 for /api calls (see run_app.ps1).
Set-Location -LiteralPath (Join-Path $PSScriptRoot "frontend")

if (!(Test-Path -LiteralPath (Join-Path (Get-Location) "node_modules"))) {
    Write-Host "node_modules missing - running npm install first..." -ForegroundColor Yellow
    npm.cmd install
}

Write-Host "Starting Vite dev server on http://localhost:3000/ ..." -ForegroundColor Green
npm.cmd run dev
