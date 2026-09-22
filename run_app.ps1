# Always run from the project root (where pom.xml lives), no matter where invoked from.
Set-Location -LiteralPath $PSScriptRoot

$toolsDir = "$PSScriptRoot\.tools"
$env:JAVA_HOME = "$toolsDir\jdk17"
$env:PATH = "$toolsDir\jdk17\bin;$toolsDir\maven\bin;$env:PATH"

if (!(Test-Path -LiteralPath "$PSScriptRoot\pom.xml")) {
    Write-Host "ERROR: pom.xml not found next to run_app.ps1. Run from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "Java version:"
java -version

Write-Host "Starting Spring Boot application on port 8080..."
& "$toolsDir\maven\bin\mvn.cmd" spring-boot:run
