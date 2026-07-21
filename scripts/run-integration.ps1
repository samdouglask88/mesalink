# Sobe o Supabase local (do projeto MesaLink-API), serve as Edge Functions e
# roda os testes de integração do frontend (Vitest, INTEGRATION=1).
#
# Pré-requisito: Docker Desktop instalado E ABERTO (daemon rodando).
# Uso:  powershell -ExecutionPolicy Bypass -File scripts/run-integration.ps1
$ErrorActionPreference = "Stop"
$frontDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$apiDir   = (Resolve-Path (Join-Path $PSScriptRoot "..\..\MesaLink-API")).Path

# 0. Docker precisa estar de pé.
try { docker info --format '{{.ServerVersion}}' | Out-Null }
catch { throw "Docker não está rodando. Abra o Docker Desktop e espere ficar 'running'." }

Set-Location $apiDir

Write-Host "==> supabase start (pode demorar na 1a vez, baixa imagens)..." -ForegroundColor Cyan
npx --yes supabase start

Write-Host "==> lendo chaves (supabase status)..." -ForegroundColor Cyan
$status = npx --yes supabase status -o env
$map = @{}
foreach ($line in $status) {
  if ($line -match '^\s*([A-Z_]+)="?([^"]*)"?\s*$') { $map[$matches[1]] = $matches[2] }
}
$apiUrl  = $map["API_URL"]
$anonKey = $map["ANON_KEY"]
if (-not $anonKey) { throw "Não consegui ler as chaves do 'supabase status'." }

Write-Host "==> supabase db reset (reaplica migrations + seed)..." -ForegroundColor Cyan
npx --yes supabase db reset

Write-Host "==> servindo Edge Functions em background..." -ForegroundColor Cyan
$serve = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx --yes supabase functions serve" `
         -PassThru -WindowStyle Hidden -RedirectStandardOutput "scripts\functions-serve.log" `
         -RedirectStandardError "scripts\functions-serve.err.log"

try {
  Write-Host "==> aguardando as functions subirem..." -ForegroundColor Cyan
  $ok = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
      Invoke-WebRequest -Method Options -Uri "$apiUrl/functions/v1/criar-pedido" -TimeoutSec 3 | Out-Null
      $ok = $true; break
    } catch { }
  }
  if (-not $ok) { Write-Warning "Functions podem não ter subido; veja $apiDir\scripts\functions-serve.err.log" }

  # Roda os testes de integração do frontend.
  Set-Location $frontDir
  $env:INTEGRATION        = "1"
  $env:SUPABASE_URL       = $apiUrl
  $env:SUPABASE_ANON_KEY  = $anonKey
  Write-Host "==> npm run test:integration..." -ForegroundColor Cyan
  npm run test:integration
}
finally {
  Write-Host "==> encerrando functions serve..." -ForegroundColor Cyan
  if ($serve -and -not $serve.HasExited) { Stop-Process -Id $serve.Id -Force -ErrorAction SilentlyContinue }
}

Write-Host "OK. Para derrubar o stack local: (no MesaLink-API) npx supabase stop" -ForegroundColor Green
