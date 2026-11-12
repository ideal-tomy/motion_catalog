$ErrorActionPreference='Stop'
$taskPidPath=Join-Path $PSScriptRoot 'workspace/logs/server.pid'
if(!(Test-Path -LiteralPath $taskPidPath)){Write-Host '非表示起動のPIDがありません。npm run devの場合は起動したターミナルでCtrl+Cを押してください。';exit 0}
$taskPID=[int](Get-Content -LiteralPath $taskPidPath -Raw)
$taskProcess=Get-CimInstance Win32_Process -Filter "ProcessId=$taskPID"
if(!$taskProcess){Write-Host 'すでに停止しています。';exit 0}
$taskOwner=Get-NetTCPConnection -LocalPort 4319 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if($taskProcess.Name -ne 'node.exe' -or $taskProcess.CommandLine -notlike '*--experimental-strip-types server/index.mjs*' -or $taskOwner -ne $taskPID){throw '別のプロセスの可能性があるため停止しません。'}
if((Invoke-RestMethod -Uri 'http://127.0.0.1:4319/api/health' -TimeoutSec 2).app -ne 'AI_PROMO_STUDIO_EDITOR'){throw 'アプリを確認できないため停止しません。'}
Stop-Process -Id $taskPID
Write-Host '編集アプリを停止しました。保存済みプロジェクトは保持しています。'
