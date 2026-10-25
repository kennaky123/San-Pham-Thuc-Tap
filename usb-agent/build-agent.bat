@echo off
chcp 65001 >nul
echo [*] Dang dong goi ITHelpdeskUSBAgent.exe tu ma nguon C#...
"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" /nologo /target:exe /out:"%~dp0ITHelpdeskUSBAgent.exe" /r:System.Management.dll /r:System.Web.Extensions.dll "%~dp0ITHelpdeskUSBAgent.cs"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Da dong goi thanh cong: %~dp0ITHelpdeskUSBAgent.exe
) else (
    echo [ERROR] Dong goi that bai!
)
pause

