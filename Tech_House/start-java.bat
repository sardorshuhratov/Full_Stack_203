@echo off
setlocal

set ROOT=%~dp0
set SRC=%ROOT%java-backend\src\TechHouseServer.java
set OUT=%ROOT%java-backend\out

if not exist "%OUT%" mkdir "%OUT%"

javac -d "%OUT%" "%SRC%"
if errorlevel 1 exit /b 1

java -cp "%OUT%" TechHouseServer
