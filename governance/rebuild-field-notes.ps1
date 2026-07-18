Write-Warning 'This compatibility command now uses the repository-level content pipeline.'
& (Join-Path (Split-Path -Parent $PSScriptRoot) 'site-content.ps1') -Action Build
exit $LASTEXITCODE
