# Script per estrarre variabili d'ambiente da .env.local e prepararle per Render
# Esegui: .\setup-render-env.ps1

Write-Host "🔧 Estrazione Variabili d'Ambiente per Render" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ File .env.local non trovato!" -ForegroundColor Red
    Write-Host "   Crea il file .env.local con le tue variabili d'ambiente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ File .env.local trovato" -ForegroundColor Green
Write-Host ""

# Leggi il file .env.local
$envContent = Get-Content $envFile

# Variabili necessarie per Render
$requiredVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "NEXT_PUBLIC_APP_URL"
)

Write-Host "📋 Variabili trovate:" -ForegroundColor Yellow
Write-Host ""

$foundVars = @{}
$missingVars = @()

foreach ($line in $envContent) {
    # Salta commenti e righe vuote
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    # Estrai key e value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Rimuovi virgolette se presenti
        if ($value -match '^["''](.*)["'']$') {
            $value = $matches[1]
        }
        
        $foundVars[$key] = $value
    }
}

# Verifica variabili
foreach ($var in $requiredVars) {
    if ($foundVars.ContainsKey($var)) {
        $displayValue = if ($var -eq "FIREBASE_ADMIN_PRIVATE_KEY") {
            "[CHIAVE PRIVATA - NASCOSTA]"
        } else {
            $foundVars[$var]
        }
        Write-Host "✅ $var" -ForegroundColor Green
        Write-Host "   $displayValue" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  $var - MANCANTE" -ForegroundColor Yellow
        $missingVars += $var
    }
    Write-Host ""
}

# Genera file di output
$outputFile = "RENDER_ENV_VARS_OUTPUT.txt"
$output = @"
═══════════════════════════════════════════════════════════════
  VARIABILI D'AMBIENTE PER RENDER
═══════════════════════════════════════════════════════════════

Copia queste variabili nella sezione "Environment Variables" di Render.

═══════════════════════════════════════════════════════════════
"@

foreach ($var in $requiredVars) {
    if ($foundVars.ContainsKey($var)) {
        $value = $foundVars[$var]
        
        # Per FIREBASE_ADMIN_PRIVATE_KEY, assicurati che sia tra virgolette
        if ($var -eq "FIREBASE_ADMIN_PRIVATE_KEY") {
            if (-not $value.StartsWith('"')) {
                $value = '"' + $value + '"'
            }
        }
        
        $output += "`n$var`n$value`n"
    } else {
        $output += "`n$var`n[VALORE MANCANTE - AGGIUNGI MANUALMENTE]`n"
    }
}

$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  ATTENZIONE: Alcune variabili mancano:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "✅ File generato: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Prossimi passi:" -ForegroundColor Cyan
Write-Host "   1. Apri il file $outputFile" -ForegroundColor Gray
Write-Host "   2. Copia ogni variabile (Key e Value)" -ForegroundColor Gray
Write-Host "   3. Vai su Render -> Environment Variables" -ForegroundColor Gray
Write-Host "   4. Aggiungi ogni variabile una alla volta" -ForegroundColor Gray
Write-Host ""

