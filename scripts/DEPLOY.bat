@echo off
REM =============================================================================
REM Lightning McGreen Living — one-click Windows deploy
REM
REM Double-click this file (or run it from PowerShell) to:
REM   1. Stage + commit any pending changes
REM   2. Push to origin/main
REM   3. Trigger a Netlify production deploy via netlify-cli
REM
REM Mirrors the workflow in CLAUDE\Crypto Site\DEPLOY.bat: silent on success,
REM verbose on failure, never destructive.
REM
REM Requires (one-time):
REM   winget install GitHub.cli && gh auth login
REM   npm i -g netlify-cli && netlify login
REM =============================================================================

setlocal ENABLEDELAYEDEXPANSION

cd /d "%~dp0"

echo.
echo === Lightning McGreen Living deploy ===
echo Repo: %CD%
echo.

REM 1. Make sure git is here
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo  ! No git repo here. Run scripts\push-and-deploy.ps1 once first.
  goto :err
)

REM 2. Stage + commit (skip if nothing to commit)
echo  - git add .
git add .
git diff --cached --quiet
if errorlevel 1 (
  set /p MSG="   Commit message [feat: deploy %DATE% %TIME%]: "
  if "!MSG!"=="" set MSG=feat: deploy %DATE% %TIME%
  echo  - git commit -m "!MSG!"
  git commit -m "!MSG!" || goto :err
) else (
  echo  - nothing to commit, working tree clean
)

REM 3. Push to main
echo  - git push origin main
git push origin main || goto :err

REM 4. Netlify production deploy
where netlify >nul 2>&1
if errorlevel 1 (
  echo.
  echo  ! netlify CLI not found. Install it once:
  echo     npm i -g netlify-cli
  echo     netlify login
  echo  Skipping deploy step. Push already complete; Netlify will auto-build
  echo  if the GitHub-Netlify webhook is connected.
  goto :ok
)

echo  - netlify deploy --prod
netlify deploy --prod || goto :err

:ok
echo.
echo === Deploy complete ===
echo Live: https://lightning-mcgreen-living.netlify.app
echo Repo: https://github.com/Tyrrellkdlemons/lightning-mcgreen-living
echo.
pause
exit /b 0

:err
echo.
echo === Deploy failed ===
echo See output above for the cause. Nothing destructive was attempted.
echo.
pause
exit /b 1
