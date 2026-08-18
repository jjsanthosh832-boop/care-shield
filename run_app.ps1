$toolsDir = "$PSScriptRoot\.tools"
$env:JAVA_HOME = "$toolsDir\jdk17"
$env:PATH = "$toolsDir\jdk17\bin;$toolsDir\maven\bin;$env:PATH"

Write-Host "Java version:"
java -version

Write-Host "Starting Spring Boot application on port 8080..."
mvn spring-boot:run
