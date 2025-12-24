# Script per connettere il progetto a GitHub
# Esegui questo script con: .\connect-github.ps1

Write-Host "🔗 Connessione a GitHub" -ForegroundColor Cyan
Write-Host ""

# Verifica configurazione Git
Write-Host "Verifica configurazione Git..." -ForegroundColor Yellow
$gitUser = git config --global user.name
$gitEmail = git config --global user.email

if ($gitUser -and $gitEmail) {
    Write-Host "✅ Git configurato:" -ForegroundColor Green
    Write-Host "   Username: $gitUser" -ForegroundColor Gray
    Write-Host "   Email: $gitEmail" -ForegroundColor Gray
} else {
    Write-Host "❌ Git non configurato correttamente" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verifica se GitHub CLI è installato
Write-Host "Verifica GitHub CLI..." -ForegroundColor Yellow
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "✅ GitHub CLI trovato!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opzione 1: Usa GitHub CLI (Raccomandato)" -ForegroundColor Cyan
    Write-Host "   Esegui: gh auth login" -ForegroundColor Gray
    Write-Host "   Poi: gh repo create salone-bellezza-prenotazioni --public --source=. --remote=origin --push" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "⚠️  GitHub CLI non trovato" -ForegroundColor Yellow
    Write-Host "   Scarica da: https://cli.github.com/" -ForegroundColor Gray
    Write-Host ""
}

# Verifica remote esistenti
Write-Host "Verifica remote esistenti..." -ForegroundColor Yellow
$remotes = git remote -v

if ($remotes) {
    Write-Host "⚠️  Remote già configurati:" -ForegroundColor Yellow
    Write-Host $remotes -ForegroundColor Gray
    Write-Host ""
    $remove = Read-Host "Vuoi rimuoverli e riconfigurare? (s/n)"
    if ($remove -eq "s" -or $remove -eq "S") {
        git remote remove origin
        Write-Host "✅ Remote rimosso" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Nessun remote configurato" -ForegroundColor Green
}

Write-Host ""

# Verifica branch
Write-Host "Verifica branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branch corrente: $currentBranch" -ForegroundColor Gray

if ($currentBranch -eq "master") {
    Write-Host "⚠️  Branch è 'master', GitHub usa 'main'" -ForegroundColor Yellow
    $rename = Read-Host "Vuoi rinominare in 'main'? (s/n)"
    if ($rename -eq "s" -or $rename -eq "S") {
        git branch -M main
        Write-Host "✅ Branch rinominato in 'main'" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Prossimi passi:" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Crea un repository su GitHub:" -ForegroundColor Yellow
Write-Host "   https://github.com/new" -ForegroundColor Gray
Write-Host "   Nome: salone-bellezza-prenotazioni" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Collega il repository locale:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/Villani85/salone-bellezza-prenotazioni.git" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Fai push del codice:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "   Quando richiesto:" -ForegroundColor Yellow
Write-Host "   - Username: Villani85" -ForegroundColor Gray
Write-Host "   - Password: Usa un Personal Access Token" -ForegroundColor Gray
Write-Host "     (Crea da: https://github.com/settings/tokens)" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Per istruzioni dettagliate, leggi: CONNETTI_GITHUB.md" -ForegroundColor Cyan
Write-Host ""

