@echo off
echo Starting Web Scraper API Server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking dependencies...
python -c "import flask" 2>&1
if errorlevel 1 (
    echo Installing required packages...
    pip install flask flask-cors
) else (
    python -c "import flask_cors" 2>&1
    if errorlevel 1 (
        echo Installing flask-cors...
        pip install flask-cors
    )
)

REM Start the API server
echo Starting server on http://localhost:5000
echo.
cd /d "%~dp0"
python scraper_api.py

pause