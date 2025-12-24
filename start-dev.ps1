# Script PowerShell per avviare Next.js senza errori EPERM
# Usa: .\start-dev.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Avvio Server di Sviluppo Next.js" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Chiudi tutti i processi Node.js esistenti
Write-Host "[1/3] Chiusura processi Node.js esistenti..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "  - Chiusura processo Node PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "  [OK] Processi Node chiusi" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] Nessun processo Node trovato" -ForegroundColor Gray
}

# 2. Elimina cartella .next (se possibile)
Write-Host "[2/3] Pulizia cartella .next..." -ForegroundColor Yellow
if (Test-Path .next) {
    try {
        Remove-Item -Recurse -Force .next -ErrorAction Stop
        Write-Host "  [OK] Cartella .next eliminata" -ForegroundColor Green
    } catch {
        Write-Host "  [WARN] Alcuni file potrebbero essere ancora bloccati. Proseguo comunque..." -ForegroundColor Yellow
        Write-Host "         Se vedi errori, riprova dopo aver chiuso File Explorer e altri programmi." -ForegroundColor Gray
    }
} else {
    Write-Host "  [SKIP] Cartella .next non esiste" -ForegroundColor Gray
}

# 3. Avvia server di sviluppo
Write-Host "[3/3] Avvio server di sviluppo..." -ForegroundColor Yellow
Write-Host ""
npm run dev

