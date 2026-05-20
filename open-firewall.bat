@echo off
echo Opening firewall port 3001...
netsh advfirewall firewall add rule name="Report Platform 3001" dir=in action=allow protocol=TCP localport=3001
echo.
echo Done! Firewall is now open for port 3001.
echo.
echo Access URL: http://[2409:8a55:f6ab:dc00:461d:76af:46b9:1286]:3001
echo.
pause
