@echo off
REM Minimal mvnw replacement: routes to the bundled Maven in .tools
REM Usage from repo root: mvnw.cmd spring-boot:run  /  mvnw.cmd clean package -DskipTests
if not defined JAVA_HOME set "JAVA_HOME=%~dp0.tools\jdk17"
set "PATH=%~dp0.tools\jdk17\bin;%~dp0.tools\maven\bin;%PATH%"
set TOOLS_MVN=%~dp0.tools\maven\bin\mvn.cmd
if exist "%TOOLS_MVN%" (
  call "%TOOLS_MVN%" %*
) else (
  echo [mvnw] Bundled Maven not found at %TOOLS_MVN%
  echo [mvnw] Run setup_tools.ps1 first, or use system mvn from the repo root.
  exit /b 1
)
