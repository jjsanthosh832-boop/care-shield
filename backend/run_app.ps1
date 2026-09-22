# NOTE: the real Maven project lives one level up (pom.xml is at the repo root).
# This wrapper lets you start the backend even when your terminal is inside backend\.
$rootDir = Split-Path -Parent $PSScriptRoot
$rootScript = Join-Path $rootDir "run_app.ps1"

if (!(Test-Path -LiteralPath $rootScript)) {
    Write-Host "ERROR: Could not find $rootScript" -ForegroundColor Red
    exit 1
}

Write-Host "backend\ has no pom.xml - delegating to $rootScript ..." -ForegroundColor Yellow
& $rootScript
