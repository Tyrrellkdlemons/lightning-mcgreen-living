# Lightning McGreen Living — push-and-deploy (Windows PowerShell)
#
# Usage:
#   PowerShell -ExecutionPolicy Bypass -File scripts/push-and-deploy.ps1
#
# Requirements:
#   - gh CLI authenticated (gh auth login)
#   - netlify CLI authenticated (netlify login)
#
# Environment overrides:
#   $env:REPO_NAME     = "lightning-mcgreen-living"
#   $env:DEPLOY_TARGET = "netlify"   # netlify | vercel | none
#   $env:VISIBILITY    = "public"    # public | private

$ErrorActionPreference = "Stop"

$repoName     = if ($env:REPO_NAME)     { $env:REPO_NAME }     else { "lightning-mcgreen-living" }
$deployTarget = if ($env:DEPLOY_TARGET) { $env:DEPLOY_TARGET } else { "netlify" }
$visibility   = if ($env:VISIBILITY)    { $env:VISIBILITY }    else { "public" }

# 1. git init + first commit
if (-not (Test-Path .git)) {
    Write-Host "→ git init"
    git init -b main
    git add .
    git commit -m "feat: initial scaffold of Lightning McGreen Living"
} else {
    Write-Host "→ git already initialized"
}

# 2. create remote + push
$hasOrigin = $false
try { git remote get-url origin > $null 2>&1; $hasOrigin = $true } catch {}

if (-not $hasOrigin) {
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Host "→ creating GitHub repo $repoName ($visibility)"
        gh repo create $repoName "--$visibility" --source=. --remote=origin --push
    } else {
        Write-Host "✗ gh CLI not found. Install: https://cli.github.com/"
        exit 1
    }
} else {
    Write-Host "→ pushing to existing origin"
    git push -u origin main
}

# 3. develop branch
$hasDevelop = $false
try { git rev-parse --verify develop > $null 2>&1; $hasDevelop = $true } catch {}
if (-not $hasDevelop) {
    git checkout -b develop
    git push -u origin develop
    git checkout main
}

# 4. deploy
switch ($deployTarget) {
  "netlify" {
    if (Get-Command netlify -ErrorAction SilentlyContinue) {
        Write-Host "→ Netlify deploy"
        try { netlify init } catch {}
        netlify deploy --prod
    } else {
        Write-Host "✗ netlify CLI not found. Install: npm i -g netlify-cli"
    }
  }
  "vercel" {
    if (Get-Command vercel -ErrorAction SilentlyContinue) {
        Write-Host "→ Vercel deploy"
        try { vercel link --yes } catch {}
        vercel --prod
    } else {
        Write-Host "✗ vercel CLI not found. Install: npm i -g vercel"
    }
  }
  "none" { Write-Host "→ skipping deploy" }
}

Write-Host "✓ done."
