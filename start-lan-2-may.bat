@echo off
chcp 65001 >nul
title IT Helpdesk - Khoi Dong He Thong 2 May (LAN Server + Client)
echo =======================================================================
echo      IT HELPDESK - KHOI DONG CHE DO CHAY TREN 2 MAY TRONG MANG LAN
echo =======================================================================
echo.
echo [1] Danh sach dia chi IP LAN cua may chu hien tai:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo     - IP LAN: %%a
    echo       + Web giao dien cho May 2 : http://%%a:5173
    echo       + Server API cho USB Agent: http://%%a:5000
    echo       + Link tai USB Agent .exe : http://%%a:5000/api/usb/download-agent
    echo.
)
echo [2] Dang mo cong Firewall 5000 (API) va 5173 (Web) neu chay voi quyen Admin...
netsh advfirewall firewall add rule name="ITHelpdesk-API-5000" dir=in action=allow protocol=TCP localport=5000 >nul 2>&1
netsh advfirewall firewall add rule name="ITHelpdesk-Web-5173" dir=in action=allow protocol=TCP localport=5173 >nul 2>&1

echo [3] Dang khoi dong Backend Server (0.0.0.0:5000) va Frontend Vite (0.0.0.0:5173)...
start "IT Helpdesk Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm run dev"
start "IT Helpdesk Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo [OK] Da khoi dong xong!
echo  - Tren May 2: Hay mo trinh duyet truy cap http://^<IP_LAN_MAY_1^>:5173
echo  - Chay file usb-agent\ITHelpdeskUSBAgent.exe tren May 2 (hoac May 1) de giam sat USB!
pause
