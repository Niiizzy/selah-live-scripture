$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$AppFolder = Join-Path $Root 'downloads-api-bible-release\win-unpacked'
$Archive = Join-Path $Root 'downloads\Selah-Live-Scripture-1.0.0-Windows-x64.zip'
Push-Location $Root
try {
    npx electron-builder --win --dir
    if ($LASTEXITCODE -ne 0) { throw 'Electron packaging failed.' }
    if (-not (Test-Path -LiteralPath (Join-Path $AppFolder 'Selah Live Scripture.exe'))) { throw 'The desktop application executable was not created.' }
    Compress-Archive -Path (Join-Path $AppFolder '*') -DestinationPath $Archive -CompressionLevel Optimal -Force
    Get-Item -LiteralPath $Archive | Select-Object FullName, Length
} finally { Pop-Location }
