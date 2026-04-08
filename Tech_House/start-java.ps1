$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root "java-backend\src\TechHouseServer.java"
$out = Join-Path $root "java-backend\out"

New-Item -ItemType Directory -Force -Path $out | Out-Null

javac -d $out $src
if ($LASTEXITCODE -ne 0) {
  throw "Compilation failed."
}

java -cp $out TechHouseServer
