$toolsDir = "$PSScriptRoot\.tools"
if (!(Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
}

$jdkZip = "$toolsDir\jdk17.zip"
$mvnZip = "$toolsDir\maven.zip"

# Clean up any partial extraction
if (Test-Path "$toolsDir\jdk17") { Remove-Item -Recurse -Force "$toolsDir\jdk17" }
if (Test-Path "$toolsDir\maven") { Remove-Item -Recurse -Force "$toolsDir\maven" }

Write-Host "Downloading Microsoft OpenJDK 17..."
curl.exe -L -o "$jdkZip" "https://aka.ms/download-jdk/microsoft-jdk-17.0.12-windows-x64.zip"

Write-Host "Extracting OpenJDK 17..."
Expand-Archive -Path "$jdkZip" -DestinationPath "$toolsDir" -Force
$extractedJdkDir = Get-ChildItem -Path "$toolsDir" -Directory -Filter "jdk-17*" | Select-Object -First 1
if ($extractedJdkDir) {
    Rename-Item -Path $extractedJdkDir.FullName -NewName "jdk17" -Force
}
Remove-Item "$jdkZip" -Force -ErrorAction SilentlyContinue

Write-Host "Downloading Apache Maven 3.9.9..."
curl.exe -L -o "$mvnZip" "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

Write-Host "Extracting Apache Maven..."
Expand-Archive -Path "$mvnZip" -DestinationPath "$toolsDir" -Force
$extractedMvnDir = Get-ChildItem -Path "$toolsDir" -Directory -Filter "apache-maven-*" | Select-Object -First 1
if ($extractedMvnDir) {
    Rename-Item -Path $extractedMvnDir.FullName -NewName "maven" -Force
}
Remove-Item "$mvnZip" -Force -ErrorAction SilentlyContinue

Write-Host "=== Tools setup complete! ==="
$env:JAVA_HOME = "$toolsDir\jdk17"
$env:PATH = "$toolsDir\jdk17\bin;$toolsDir\maven\bin;$env:PATH"
java -version
mvn -version
