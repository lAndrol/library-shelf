# Ensures Cargo is on PATH (common after fresh Rust install without terminal restart)
$cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
if (Test-Path $cargoBin) {
  $env:Path = "$cargoBin;$env:Path"
}
Set-Location $PSScriptRoot\..
npm run tauri dev
