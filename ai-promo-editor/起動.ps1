$ErrorActionPreference='Stop'
$taskUrl='http://127.0.0.1:4319'
try {
    $taskExisting=Invoke-RestMethod -Uri "$taskUrl/api/health" -TimeoutSec 2
    if($taskExisting.app -eq 'AI_PROMO_STUDIO_EDITOR'){Write-Host "起動済み: $taskUrl";exit 0}
    throw '4319番ポートを別のアプリが使用しています。'
} catch {
    if($_.Exception.Message -like '*別のアプリ*'){throw}
}
if(-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))){throw '先にこのフォルダで npm ci を実行してください。'}
$taskLogs=Join-Path $PSScriptRoot 'workspace/logs'
New-Item -ItemType Directory -Path $taskLogs -Force | Out-Null
$taskProcess=Start-Process -FilePath (Get-Command node).Source -ArgumentList @('--experimental-strip-types','server/index.mjs') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskLogs 'server.log') -RedirectStandardError (Join-Path $taskLogs 'server-error.log') -PassThru
$taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskLogs 'server.pid')
for($taskAttempt=0;$taskAttempt -lt 30;$taskAttempt++){
    Start-Sleep -Milliseconds 300
    try{if((Invoke-RestMethod -Uri "$taskUrl/api/health" -TimeoutSec 1).app -eq 'AI_PROMO_STUDIO_EDITOR'){Write-Host "起動しました: $taskUrl";exit 0}}catch{}
}
throw "起動を確認できません。workspace/logs/server-error.log を確認してください。"
