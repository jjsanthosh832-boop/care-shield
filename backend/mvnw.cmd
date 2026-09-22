@echo off
REM Same shim under the wrapper name, for muscle memory.
if not defined JAVA_HOME set "JAVA_HOME=%~dp0..\.tools\jdk17"
set "PATH=%~dp0..\.tools\jdk17\bin;%~dp0..\.tools\maven\bin;%PATH%"
call "%~dp0..\.tools\maven\bin\mvn.cmd" -f "%~dp0..\pom.xml" %*
