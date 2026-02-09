# start-local.ps1
  param(
    [string]$JwtSecret = ""
  )

  $ErrorActionPreference = "Stop"

  Write-Host "== Codex Gantt: Local launcher =="

  $repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
  Set-Location $repoRoot

  # 1) Ensure env files
  if (-not (Test-Path "server\.env")) {
    Copy-Item "server\.env.example" "server\.env"
    Write-Host "Created server\.env from example."
  }
  if (-not (Test-Path "client\.env")) {
    Copy-Item "client\.env.example" "client\.env"
    Write-Host "Created client\.env from example."
  }

  # 2) Set required env values (simple append if missing)
  function Ensure-EnvValue($path, $key, $value) {
    $content = Get-Content $path -Raw
    if ($content -notmatch "(?m)^$key=") {
      Add-Content $path "$key=$value"
      Write-Host "Added $key to $path"
    }
  }

  if (-not [string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    Ensure-EnvValue "server\.env" "DATABASE_URL" $DatabaseUrl
  }
  if (-not [string]::IsNullOrWhiteSpace($JwtSecret)) {
    Ensure-EnvValue "server\.env" "JWT_SECRET" $JwtSecret
  }

  # Defaults for new security vars if missing
  Ensure-EnvValue "server\.env" "JWT_ISSUER" "codex-gantt"
  Ensure-EnvValue "server\.env" "JWT_AUDIENCE" "codex-gantt-client"
  Ensure-EnvValue "server\.env" "ALLOWED_ORIGINS" "http://localhost:5173"

  # 3) Install deps
  Write-Host "Installing dependencies..."
  npm install

  # 4) Prisma setup
  Write-Host "Initializing Prisma..."
  npm --workspace server run prisma:generate
  npm --workspace server run prisma:migrate -- --name init
  npm --workspace server run prisma:seed

  # 5) Run dev servers
  Write-Host "Starting dev servers..."
  npm run dev