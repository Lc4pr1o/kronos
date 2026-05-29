@echo off
title KRONOS — Servidor Local

:: Solicita elevação se não for admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Libera porta 3000 no firewall (só adiciona se não existir)
netsh advfirewall firewall show rule name="KRONOS HTTP 3000" >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name="KRONOS HTTP 3000" dir=in action=allow protocol=TCP localport=3000 >nul
    echo  [OK] Firewall liberado na porta 3000
)

:: Pega o IP local automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "IP=%%a"
    goto :found
)
:found
set "IP=%IP: =%"

echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║           KRONOS — Servidor Local            ║
echo  ╚══════════════════════════════════════════════╝
echo.
echo  Painel  (PC):      http://localhost:3000/fleet-hardware.html
echo  Campo   (celular): http://%IP%:3000/tecnico-campo.html
echo.
echo  Pressione Ctrl+C para parar.
echo.

cd /d "%~dp0"
python -m http.server 3000
pause
