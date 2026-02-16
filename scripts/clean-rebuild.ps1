# Next.js 13+ Clean Rebuild Script (Windows)
# Run from project root: .\scripts\clean-rebuild.ps1
# Supports both npm and Bun

param(
    [ValidateSet("npm", "bun")]
    [string]$PackageManager = "npm"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Next.js Clean Rebuild ===" -ForegroundColor Cyan
Write-Host "Using package manager: $PackageManager`n" -ForegroundColor Gray

# Step 1: Stop any running dev/build processes
Write-Host "[1/6] Stopping existing Next.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" -or $_.Path -like "*next*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Remove build artifacts and caches
Write-Host "[2/6] Removing build artifacts and caches..." -ForegroundColor Yellow
$dirsToRemove = @(
    ".next",
    "node_modules\.cache",
    ".turbo",
    "out",
    "build",
    ".swc"
)
foreach ($dir in $dirsToRemove) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "  Removed: $dir" -ForegroundColor Gray
    }
}

# Step 3: Remove lock files (optional - only if you want a fresh lock)
Write-Host "[3/6] Removing lock files for clean reinstall..." -ForegroundColor Yellow
$locks = @("package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb")
foreach ($lock in $locks) {
    if (Test-Path $lock) {
        Remove-Item -Force $lock
        Write-Host "  Removed: $lock" -ForegroundColor Gray
    }
}

# Step 4: Remove node_modules
Write-Host "[4/6] Removing node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "  Done." -ForegroundColor Gray
}

# Step 5: Reinstall dependencies
Write-Host "[5/6] Reinstalling dependencies with $PackageManager..." -ForegroundColor Yellow
if ($PackageManager -eq "bun") {
    bun install
} else {
    npm install
}
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 6: Build
Write-Host "[6/6] Running production build..." -ForegroundColor Yellow
if ($PackageManager -eq "bun") {
    bun run build
} else {
    npm run build
}
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== Clean rebuild complete ===" -ForegroundColor Green
Write-Host "Run dev server with:" -ForegroundColor Gray
if ($PackageManager -eq "bun") {
    Write-Host "  bun run dev" -ForegroundColor White
} else {
    Write-Host "  npm run dev" -ForegroundColor White
}
Write-Host "`nTip: Do a hard refresh (Ctrl+Shift+R) in browser after starting dev." -ForegroundColor DarkGray
