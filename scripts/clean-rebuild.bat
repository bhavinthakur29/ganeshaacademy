@echo off
REM Next.js Clean Rebuild - Batch wrapper for PowerShell
REM Usage: scripts\clean-rebuild.bat [npm|bun]
REM Default: npm

set PM=%1
if "%PM%"=="" set PM=npm

powershell -ExecutionPolicy Bypass -File "%~dp0clean-rebuild.ps1" -PackageManager %PM%
