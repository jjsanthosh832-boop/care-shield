CareShield backend - READ THIS FIRST
==================================

Do NOT run plain `mvn spring-boot:run` inside this backend\ folder.
There is no pom.xml here, so Maven fails with:
  "No plugin found for prefix 'spring-boot'" / "no POM in this directory".

The real Maven project is ONE LEVEL UP:
  care-shield-main\pom.xml
  care-shield-main\src\...

This backend\ folder only holds a stale copy of the built frontend
(backend\src\main\resources\static\). It is kept for reference only.

How to run the backend:
  From inside backend\ (plain mvn now works via the mvn.cmd shim):
     mvn spring-boot:run
     mvnw.cmd spring-boot:run
     .\run_app.ps1        (PowerShell wrapper, delegates to the root script)
  From the repo root:
     .\run_app.ps1
     .\mvnw.cmd spring-boot:run

How it works: backend\ has no pom.xml of its own. backend\mvn.cmd /
backend\mvnw.cmd forward every command to ..\pom.xml
(`mvn -f ..\pom.xml ...`) using the bundled JDK 17 + Maven 3.9.9.
Note: the shim only intercepts in cmd.exe (which checks the current
directory first). In PowerShell, `mvn` still resolves via PATH, so use
.\run_app.ps1 or ..\mvnw.cmd there.
