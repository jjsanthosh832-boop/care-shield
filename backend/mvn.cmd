@echo off
REM Shim: there is no pom.xml in backend\ - the real project is one level up.
REM Because cmd.exe searches the current directory before PATH, typing plain
REM `mvn` here runs this file, which forwards everything to the root pom.
REM Usage: mvn spring-boot:run  /  mvn clean install  (from backend\)
if not defined JAVA_HOME set "JAVA_HOME=%~dp0..\.tools\jdk17"
set "PATH=%~dp0..\.tools\jdk17\bin;%~dp0..\.tools\maven\bin;%PATH%"
call "%~dp0..\.tools\maven\bin\mvn.cmd" -f "%~dp0..\pom.xml" %*
